import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../db.js';
import { issueOtp, checkOtp, normalizePhone, RESEND_SECONDS } from '../otp.js';
import { startSession, endSession } from '../auth.js';
import { HttpError, ah, newId, str } from '../util.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Pre-computed hash used to keep login timing similar when the account does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Tells the sign-in screen whether to show a working Google button.
router.get('/config', (_req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID || null });
});

// Create account: name + email + password. Everything else is added later in the profile.
router.post('/signup', ah(async (req, res) => {
  const body = req.body || {};
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) throw new HttpError(400, 'Please enter your name.');
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 100) {
    throw new HttpError(400, 'Password must be 8 to 100 characters.');
  }

  const exists = await query('select 1 from users where lower(email) = $1', [email]);
  if (exists.rowCount) throw new HttpError(409, 'An account with this email already exists.');

  const id = newId('u');
  const hash = await bcrypt.hash(password, 10);
  try {
    await query(
      `insert into users (id, email, password_hash, role, account_type, verified_status, profile)
       values ($1, $2, $3, 'member', 'none', 'unverified', $4)`,
      [id, email, hash, { name, followersCount: 0 }],
    );
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'An account with this email already exists.');
    throw err;
  }
  startSession(res, id);
  res.status(201).json({ ok: true });
}));

router.post('/login', ah(async (req, res) => {
  const email = str(req.body?.email, 200);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new HttpError(400, 'Enter your email and password.');

  const { rows } = await query(
    'select id, password_hash from users where lower(email) = lower($1) limit 1',
    [email],
  );
  const user = rows[0];
  const ok = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);
  if (!user || !user.password_hash || !ok) throw new HttpError(401, 'Incorrect email or password.');

  startSession(res, user.id);
  res.json({ ok: true });
}));

// Sign in / sign up with Google. The browser sends the Google ID token ("credential");
// we verify it with Google and then log in (or create) the matching account.
router.post('/google', ah(async (req, res) => {
  if (!googleClient) throw new HttpError(503, 'Google sign-in is not available right now.');
  const credential = typeof req.body?.credential === 'string' ? req.body.credential : '';
  if (!credential) throw new HttpError(400, 'Missing Google credential.');

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Google sign-in failed. Please try again.');
  }
  const email = str(payload?.email, 200).toLowerCase();
  if (!email || !payload.email_verified) throw new HttpError(401, 'Your Google email is not verified.');

  const { rows } = await query('select id from users where lower(email) = $1', [email]);
  let userId = rows[0]?.id;
  if (!userId) {
    userId = newId('u');
    const picture = typeof payload.picture === 'string' && /^https:\/\//i.test(payload.picture) ? payload.picture : '';
    await query(
      `insert into users (id, email, password_hash, role, account_type, verified_status, profile)
       values ($1, $2, null, 'member', 'none', 'unverified', $3)`,
      [userId, email, { name: str(payload.name, 120) || email.split('@')[0], avatar: picture, followersCount: 0 }],
    );
  }
  startSession(res, userId);
  res.json({ ok: true });
}));

// Forgot password, step 1: text a code to the verified mobile number on the account.
// The reply is always the same, so nobody can use this to find out who is registered.
router.post('/forgot', ah(async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number.');
  const { rows } = await query('select id from users where phone = $1', [phone]);
  const r = await issueOtp({ phone, purpose: 'reset', userId: rows[0]?.id || null });
  res.json({ ok: true, resendIn: r?.resendIn ?? RESEND_SECONDS });
}));

// Forgot password, step 2: code + new password. Signs the person in and logs out older sessions.
router.post('/reset', ah(async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!phone) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number.');
  if (password.length < 8 || password.length > 100) throw new HttpError(400, 'Password must be 8 to 100 characters.');
  const row = await checkOtp({ phone, purpose: 'reset', code: req.body?.code });
  const hash = await bcrypt.hash(password, 10);
  await query('update users set password_hash = $2, password_changed_at = now() where id = $1', [row.user_id, hash]);
  startSession(res, row.user_id);
  res.json({ ok: true });
}));

router.post('/logout', (_req, res) => {
  endSession(res);
  res.json({ ok: true });
});

export default router;
