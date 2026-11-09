import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { query } from './db.js';
import { HttpError, ah } from './util.js';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE = 'pl_token';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  if (isProd) {
    console.error('FATAL: JWT_SECRET must be set in production.');
    process.exit(1);
  }
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('JWT_SECRET not set - using a temporary one (logins reset on restart).');
}

export function startSession(res, userId) {
  const token = jwt.sign({ sub: userId }, SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

export function endSession(res) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' });
}

// Loads req.user = { id, role, accountType } or responds 401.
export const requireAuth = ah(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE];
  if (!token) throw new HttpError(401, 'Please sign in.');
  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    throw new HttpError(401, 'Session expired. Please sign in again.');
  }
  const { rows } = await query('select id, role, account_type, password_changed_at from users where id = $1', [payload.sub]);
  if (!rows[0]) throw new HttpError(401, 'Account not found.');
  // A password reset signs out every older session.
  const changed = rows[0].password_changed_at ? Math.floor(new Date(rows[0].password_changed_at).getTime() / 1000) : 0;
  if (changed && (payload.iat || 0) < changed) throw new HttpError(401, 'Your password was changed. Please sign in again.');
  req.user = { id: rows[0].id, role: rows[0].role, accountType: rows[0].account_type };
  next();
});

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admins only.'));
  next();
}
