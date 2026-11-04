import { Router } from 'express';
import { query } from '../db.js';
import { loadPost } from '../data.js';
import { toComment } from '../mappers.js';
import { HttpError, ah, newId, str } from '../util.js';

const router = Router();
const POST_TYPES = ['case_study', 'research', 'achievement', 'general', 'student_case'];

router.post('/', ah(async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 200);
  const content = str(b.content, 10000);
  if (!title || !content) throw new HttpError(400, 'Title and content are required.');
  const type = POST_TYPES.includes(b.type) ? b.type : 'general';
  const tags = (Array.isArray(b.tags) ? b.tags : []).slice(0, 10).map((t) => str(t, 40)).filter(Boolean);
  const metrics = Array.isArray(b.clinicalMetrics)
    ? b.clinicalMetrics.slice(0, 10)
        .map((m) => ({ label: str(m?.label, 80), value: str(m?.value, 120) }))
        .filter((m) => m.label || m.value)
    : [];
  const id = newId('post');
  await query(
    `insert into posts (id, author_id, type, title, content, tags, clinical_metrics, document_name)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, req.user.id, type, title, content, JSON.stringify(tags),
      metrics.length ? JSON.stringify(metrics) : null, str(b.documentName, 200) || null],
  );
  res.status(201).json({ post: await loadPost(req.user.id, id) });
}));

router.delete('/:id', ah(async (req, res) => {
  const { rows } = await query('select author_id from posts where id = $1', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Post not found.');
  if (rows[0].author_id !== req.user.id && req.user.role !== 'admin') throw new HttpError(403, 'Not allowed.');
  await query('delete from posts where id = $1', [req.params.id]);
  res.json({ ok: true });
}));

async function toggle(table, req, res) {
  const value = !!req.body?.value;
  const postId = req.params.id;
  const exists = await query('select 1 from posts where id = $1', [postId]);
  if (!exists.rowCount) throw new HttpError(404, 'Post not found.');
  if (value) {
    await query(`insert into ${table} (post_id, user_id) values ($1, $2) on conflict do nothing`, [postId, req.user.id]);
  } else {
    await query(`delete from ${table} where post_id = $1 and user_id = $2`, [postId, req.user.id]);
  }
  const { rows } = await query(`select count(*)::int as n from ${table} where post_id = $1`, [postId]);
  res.json({ count: rows[0].n, value });
}

router.put('/:id/like', ah((req, res) => toggle('post_likes', req, res)));
router.put('/:id/bookmark', ah((req, res) => toggle('post_bookmarks', req, res)));

router.post('/:id/comments', ah(async (req, res) => {
  const content = str(req.body?.content, 2000);
  if (!content) throw new HttpError(400, 'Comment cannot be empty.');
  const exists = await query('select 1 from posts where id = $1', [req.params.id]);
  if (!exists.rowCount) throw new HttpError(404, 'Post not found.');
  const id = newId('c');
  const { rows } = await query(
    `with ins as (
       insert into post_comments (id, post_id, author_id, content) values ($1, $2, $3, $4) returning *
     )
     select ins.*, u.profile as author_profile, u.verified_status as author_verified
     from ins join users u on u.id = ins.author_id`,
    [id, req.params.id, req.user.id, content],
  );
  res.status(201).json({ comment: toComment(rows[0]) });
}));

export default router;
