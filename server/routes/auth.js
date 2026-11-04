import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, pool } from '../db.js';
import { startSession, endSession } from '../auth.js';
import { HttpError, ah, newId, str, cleanProfile } from '../util.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SIGNUP_TYPES = ['clinician', 'student', 'researcher'];
// Pre-computed hash used to keep login timing similar when the account does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

router.post('/signup', ah(async (req, res) => {
  const body = req.body || {};
  const input = body.profile || {};
  const password = typeof body.password === 'string' ? body.password : '';
  const email = str(input.email, 200).toLowerCase();
  const accountType = SIGNUP_TYPES.includes(input.accountType) ? input.accountType : null;

  if (!accountType) throw new HttpError(400, 'Please choose a valid account type.');
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 100) {
    throw new HttpError(400, 'Password must be 8 to 100 characters.');
  }
  if (!str(input.name, 200)) throw new HttpError(400, 'Please enter your full name.');
  if (accountType === 'clinician' && !str(input.registrationNumber, 100)) {
    throw new HttpError(400, 'Council registration number is required for clinicians.');
  }

  const exists = await query('select 1 from users where lower(email) = $1', [email]);
  if (exists.rowCount) throw new HttpError(409, 'An account with this email already exists.');

  const profile = cleanProfile(input, { followersCount: 0 });
  const id = newId('u');
  const hash = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into users (id, email, password_hash, role, account_type, verified_status, profile)
       values ($1, $2, $3, 'member', $4, 'pending', $5)`,
      [id, email, hash, accountType, profile],
    );
    await client.query(
      `insert into verifications
         (id, user_id, qualification, council_name, registration_number, document_type, document_url, status)
       values ($1, $2, $3, $4, $5, $6, '', 'pending')`,
      [
        newId('verif'), id,
        profile.qualification || profile.degreeProgram || '',
        profile.councilName || profile.college || '',
        profile.registrationNumber || str(input.rollNo, 100) || '',
        accountType === 'student' ? 'College ID' : 'State Council Certificate',
      ],
    );
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    if (err.code === '23505') throw new HttpError(409, 'An account with this email already exists.');
    throw err;
  } finally {
    client.release();
  }

  startSession(res, id);
  res.status(201).json({ ok: true });
}));

router.post('/login', ah(async (req, res) => {
  const identifier = str(req.body?.identifier, 200);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!identifier || !password) throw new HttpError(400, 'Enter your email (or registration number) and password.');

  const { rows } = await query(
    `select id, password_hash from users
     where lower(email) = lower($1) or profile->>'registrationNumber' = $1
     limit 1`,
    [identifier],
  );
  const user = rows[0];
  const ok = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);
  if (!user || !user.password_hash || !ok) throw new HttpError(401, 'Incorrect email/registration number or password.');

  startSession(res, user.id);
  res.json({ ok: true });
}));

router.post('/logout', (_req, res) => {
  endSession(res);
  res.json({ ok: true });
});

export default router;
