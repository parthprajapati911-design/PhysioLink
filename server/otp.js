import crypto from 'node:crypto';
import { query } from './db.js';
import { sendOtpSms, smsAvailable } from './sms.js';
import { HttpError, newId } from './util.js';

const SECRET = process.env.JWT_SECRET || 'dev-only-secret';
const CODE_TTL_MIN = 10;
const RESEND_AFTER_SEC = 60;
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

export const RESEND_SECONDS = RESEND_AFTER_SEC;

// Indian mobile numbers only: 10 digits starting 6-9 (a leading +91 / 91 / 0 is accepted).
export function normalizePhone(input) {
  let d = String(input || '').replace(/[\s\-().]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('91') && d.length === 12) d = d.slice(2);
  else if (d.startsWith('0') && d.length === 11) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? `+91${d}` : null;
}

const hash = (phone, purpose, code) =>
  crypto.createHmac('sha256', SECRET).update(`${phone}|${purpose}|${code}`).digest('hex');

/**
 * Create + send a code. When `userId` is null (e.g. someone asks to reset a number that has no
 * account) we still record the request and apply the same limits, but send nothing, so the
 * outside world cannot tell whether a number is registered.
 */
export async function issueOtp({ phone, purpose, userId }) {
  if (!smsAvailable()) throw new HttpError(503, 'Mobile verification is not available yet.');

  const { rows: recent } = await query(
    `select created_at from otp_codes where phone = $1 and created_at > now() - interval '1 hour' order by created_at desc`,
    [phone],
  );
  if (recent.length >= MAX_PER_HOUR) throw new HttpError(429, 'Too many codes requested. Please try again in an hour.');
  if (recent[0] && Date.now() - new Date(recent[0].created_at).getTime() < RESEND_AFTER_SEC * 1000) {
    return { sent: false, resendIn: RESEND_AFTER_SEC }; // too soon: ignore silently
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await query('delete from otp_codes where phone = $1 and purpose = $2', [phone, purpose]);
  await query(
    `insert into otp_codes (id, phone, purpose, user_id, code_hash, expires_at)
     values ($1, $2, $3, $4, $5, now() + ($6 || ' minutes')::interval)`,
    [newId('otp'), phone, purpose, userId, hash(phone, purpose, userId ? code : crypto.randomBytes(8).toString('hex')), String(CODE_TTL_MIN)],
  );
  if (userId) await sendOtpSms(phone, code);
  return { sent: true, resendIn: RESEND_AFTER_SEC };
}

/** Check a code. Returns the code row on success (and consumes it), otherwise throws. */
export async function checkOtp({ phone, purpose, code }) {
  const bad = new HttpError(400, 'That code is incorrect or has expired.');
  const clean = String(code || '').replace(/\D/g, '');
  if (clean.length !== 6) throw bad;

  const { rows } = await query(
    `select * from otp_codes where phone = $1 and purpose = $2 and expires_at > now() order by created_at desc limit 1`,
    [phone, purpose],
  );
  const row = rows[0];
  if (!row || row.attempts >= MAX_ATTEMPTS) throw bad;

  const a = Buffer.from(hash(phone, purpose, clean), 'hex');
  const b = Buffer.from(row.code_hash, 'hex');
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b) && !!row.user_id;
  if (!ok) {
    await query('update otp_codes set attempts = attempts + 1 where id = $1', [row.id]);
    throw bad;
  }
  await query('delete from otp_codes where phone = $1 and purpose = $2', [phone, purpose]);
  return row;
}
