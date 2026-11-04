import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAdmin } from '../auth.js';
import { HttpError, ah, newId, str } from '../util.js';

const router = Router();

/* ---------- opportunities ---------- */
router.post('/opportunities/:id/apply', ah(async (req, res) => {
  const exists = await query('select 1 from opportunities where id = $1', [req.params.id]);
  if (!exists.rowCount) throw new HttpError(404, 'Opportunity not found.');
  await query(
    `insert into applications (opportunity_id, user_id) values ($1, $2) on conflict do nothing`,
    [req.params.id, req.user.id],
  );
  res.json({ ok: true });
}));

// Admin-only: publish a new opportunity (API only for now).
router.post('/opportunities', requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 200);
  const organization = str(b.organization, 200);
  if (!title || !organization) throw new HttpError(400, 'Title and organization are required.');
  const id = newId('job');
  await query(
    `insert into opportunities
       (id, created_by, title, organization, logo, location, location_type, type, specialization,
        stipend_or_salary, experience_required, description, requirements)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      id, req.user.id, title, organization, str(b.logo, 500), str(b.location, 200),
      str(b.locationType, 100) || 'On-site Hospital', str(b.type, 100) || 'Full-Time Clinical',
      str(b.specialization, 200), str(b.stipendOrSalary, 200), str(b.experienceRequired, 200),
      str(b.description, 5000),
      JSON.stringify((Array.isArray(b.requirements) ? b.requirements : []).slice(0, 20).map((r) => str(r, 300))),
    ],
  );
  res.status(201).json({ id });
}));

/* ---------- verification review ---------- */
async function review(req, res, status) {
  const verified = status === 'approved' ? 'verified' : 'unverified';
  const client = await pool.connect();
  try {
    await client.query('begin');
    const { rows } = await client.query(
      `update verifications set status = $2, reviewed_by = $3 where id = $1 returning user_id`,
      [req.params.id, status, req.user.id],
    );
    if (!rows[0]) {
      await client.query('rollback');
      throw new HttpError(404, 'Verification request not found.');
    }
    await client.query('update users set verified_status = $2 where id = $1', [rows[0].user_id, verified]);
    await client.query('commit');
    res.json({ status, userId: rows[0].user_id, verifiedStatus: verified });
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

router.post('/admin/verifications/:id/approve', requireAdmin, ah((req, res) => review(req, res, 'approved')));
router.post('/admin/verifications/:id/reject', requireAdmin, ah((req, res) => review(req, res, 'rejected')));

export default router;
