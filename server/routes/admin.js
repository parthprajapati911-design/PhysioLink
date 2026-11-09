import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAdmin } from '../auth.js';
import { HttpError, ah, newId, str, timeAgo } from '../util.js';

const router = Router();

/* ---------- opportunities ---------- */
const JOB_TYPES = ['Full-Time Clinical', 'Hospital Fellowship', 'Student Internship', 'Academic / Faculty'];
const WORK_MODES = ['On-site Hospital', 'Outpatient Sports Clinic', 'University & Research', 'Hybrid Community'];

router.post('/opportunities/:id/apply', ah(async (req, res) => {
  const { rows } = await query('select created_by from opportunities where id = $1', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Opportunity not found.');
  if (rows[0].created_by === req.user.id) throw new HttpError(400, 'You cannot apply to your own opportunity.');
  await query(
    `insert into applications (opportunity_id, user_id, note, phone) values ($1, $2, $3, $4)
     on conflict do nothing`,
    [req.params.id, req.user.id, str(req.body?.note, 1500), str(req.body?.phone, 30)],
  );
  res.json({ ok: true });
}));

// Any signed-in member can publish an opportunity (e.g. a clinic hiring).
router.post('/opportunities', ah(async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 200);
  const organization = str(b.organization, 200);
  if (!title || !organization) throw new HttpError(400, 'Title and organization are required.');
  const mine = await query('select count(*)::int as n from opportunities where created_by = $1', [req.user.id]);
  if (mine.rows[0].n >= 25) throw new HttpError(400, 'You have reached the limit of 25 opportunities. Please delete an old one first.');
  const id = newId('job');
  await query(
    `insert into opportunities
       (id, created_by, title, organization, logo, location, location_type, type, specialization,
        stipend_or_salary, experience_required, description, requirements)
     values ($1,$2,$3,$4,'',$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      id, req.user.id, title, organization, str(b.location, 200),
      WORK_MODES.includes(b.locationType) ? b.locationType : WORK_MODES[0],
      JOB_TYPES.includes(b.type) ? b.type : JOB_TYPES[0],
      str(b.specialization, 200), str(b.stipendOrSalary, 200) || 'Not disclosed', str(b.experienceRequired, 200) || 'Any',
      str(b.description, 5000),
      JSON.stringify((Array.isArray(b.requirements) ? b.requirements : []).slice(0, 20).map((r) => str(r, 300)).filter(Boolean)),
    ],
  );
  res.status(201).json({ id });
}));

// Only the poster (or an admin) can remove it.
router.delete('/opportunities/:id', ah(async (req, res) => {
  const { rows } = await query('select created_by from opportunities where id = $1', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Opportunity not found.');
  if (rows[0].created_by !== req.user.id && req.user.role !== 'admin') throw new HttpError(403, 'Not allowed.');
  await query('delete from opportunities where id = $1', [req.params.id]);
  res.json({ ok: true });
}));

// Poster (or admin) sees who applied.
router.get('/opportunities/:id/applicants', ah(async (req, res) => {
  const { rows: o } = await query('select created_by from opportunities where id = $1', [req.params.id]);
  if (!o[0]) throw new HttpError(404, 'Opportunity not found.');
  if (o[0].created_by !== req.user.id && req.user.role !== 'admin') throw new HttpError(403, 'Not allowed.');
  const { rows } = await query(
    `select a.user_id, a.note, a.phone, a.created_at, u.email, u.profile
       from applications a join users u on u.id = a.user_id
      where a.opportunity_id = $1 order by a.created_at desc limit 200`,
    [req.params.id],
  );
  res.json({
    applicants: rows.map((r) => ({
      userId: r.user_id,
      name: r.profile?.name || 'PhysioLink Member',
      headline: r.profile?.headline || '',
      avatar: r.profile?.avatar || '',
      email: r.email,
      phone: r.phone,
      note: r.note,
      appliedAt: timeAgo(r.created_at),
    })),
  });
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
