import { Router } from 'express';
import { query } from '../db.js';
import { maskPhone } from '../mappers.js';
import { issueOtp, checkOtp, normalizePhone } from '../otp.js';
import { HttpError, ah } from '../util.js';

const router = Router();
const BAD_NUMBER = 'Enter a valid 10-digit Indian mobile number.';

// Step 1: send a code to the number the member wants to verify.
router.post('/me/phone/send', ah(async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) throw new HttpError(400, BAD_NUMBER);
  const taken = await query('select id from users where phone = $1', [phone]);
  if (taken.rows[0] && taken.rows[0].id !== req.user.id) throw new HttpError(409, 'This number is already linked to another account.');
  const r = await issueOtp({ phone, purpose: 'verify', userId: req.user.id });
  res.json({ ok: true, resendIn: r.resendIn });
}));

// Step 2: confirm the code. Only now is the number saved on the account.
router.post('/me/phone/verify', ah(async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) throw new HttpError(400, BAD_NUMBER);
  const row = await checkOtp({ phone, purpose: 'verify', code: req.body?.code });
  if (row.user_id !== req.user.id) throw new HttpError(400, 'That code is incorrect or has expired.');
  try {
    await query('update users set phone = $2, phone_verified_at = now() where id = $1', [req.user.id, phone]);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'This number is already linked to another account.');
    throw err;
  }
  res.json({ ok: true, phoneMasked: maskPhone(phone) });
}));

router.delete('/me/phone', ah(async (req, res) => {
  await query('update users set phone = null, phone_verified_at = null where id = $1', [req.user.id]);
  res.json({ ok: true });
}));

export default router;
