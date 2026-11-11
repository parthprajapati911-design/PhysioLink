import { Router } from 'express';
import { query } from '../db.js';
import { maskPhone } from '../mappers.js';
import { normalizePhone } from '../otp.js';
import { HttpError, ah } from '../util.js';

const router = Router();
const BAD_NUMBER = 'Enter a valid 10-digit Indian mobile number.';

// Save the member's mobile number directly (no SMS code / verification step).
router.post('/me/phone', ah(async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone) throw new HttpError(400, BAD_NUMBER);
  try {
    await query('update users set phone = $2, phone_verified_at = null where id = $1', [req.user.id, phone]);
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
