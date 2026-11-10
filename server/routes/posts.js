import { Router } from 'express';
import { query } from '../db.js';
import { loadPost } from '../data.js';
import { toComment } from '../mappers.js';
import { HttpError, ah, newId, str } from '../util.js';
import { isOwnImageUrl } from './images.js';
import { notify } from '../notify.js';

const router = Router();
// One tag per post. (Older posts may still carry legacy types; those just display as before.)
const POST_TAGS = ['case', 'achievement', 'research', 'event', 'update'];

router.post('/', ah(async (req, res) => {
  const b = req.body || {};
  const content = str(b.content, 5000);
  const imageUrl = (await isOwnImageUrl(b.imageUrl, req.user.id)) ? b.imageUrl : null;
  if (!content && !imageUrl) throw new HttpError(400, 'Add a photo or a caption to post.');
  const type = POST_TAGS.includes(b.type) ? b.type : 'update';
  const id = newId('post');
  await query(
    `insert into posts (id, author_id, type, title, content, tags, image_url)
     values ($1, $2, $3, '', $4, '[]'::jsonb, $5)`,
    [id, req.user.id, type, content, imageUrl],
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
  if (value && table === 'post_likes') {
    const a = await query('select author_id from posts where id = $1', [postId]);
    await notify(a.rows[0]?.author_id, req.user.id, 'like', postId);
  }
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
  const a = await query('select author_id from posts where id = $1', [req.params.id]);
  await notify(a.rows[0]?.author_id, req.user.id, 'comment', req.params.id);
  res.status(201).json({ comment: toComment(rows[0]) });
}));

export default router;
