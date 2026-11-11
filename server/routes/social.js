import { Router } from 'express';
import { query } from '../db.js';
import { loadConversations } from '../data.js';
import { notify, loadNotifications, clearRequestNotifications } from '../notify.js';
import { toUser } from '../mappers.js';
import { HttpError, ah, newId, str, cleanProfile, chatTime } from '../util.js';

const router = Router();

/* ---------- profile ---------- */
router.put('/me', ah(async (req, res) => {
  const { rows } = await query('select * from users where id = $1', [req.user.id]);
  const row = rows[0];
  const profile = cleanProfile(req.body?.profile || {}, row.profile || {});
  await query('update users set profile = $2 where id = $1', [req.user.id, profile]);
  // The profile tag (academician / clinician / student). Admins keep their own type.
  const TAGS = ['academician', 'clinician', 'student'];
  if (row.role !== 'admin' && TAGS.includes(req.body?.accountType)) {
    await query('update users set account_type = $2 where id = $1', [req.user.id, req.body.accountType]);
    row.account_type = req.body.accountType;
  }
  const { rows: c } = await query(
    `select count(*)::int as n from connections
     where status = 'accepted' and (requester_id = $1 or addressee_id = $1)`,
    [req.user.id],
  );
  res.json({ user: toUser({ ...row, profile }, { connectionsCount: c[0].n, includeEmail: true }) });
}));

router.post('/users/:id/endorse', ah(async (req, res) => {
  const targetId = req.params.id;
  const skillName = str(req.body?.skill, 80);
  const value = !!req.body?.value;
  if (targetId === req.user.id) throw new HttpError(400, 'You cannot endorse your own skills.');
  const { rows } = await query('select profile from users where id = $1', [targetId]);
  if (!rows[0]) throw new HttpError(404, 'User not found.');
  const { rows: meRows } = await query('select * from users where id = $1', [req.user.id]);
  const me = toUser(meRows[0]);
  const profile = rows[0].profile || {};
  const skills = (profile.skills || []).map((s) => {
    if (s.name !== skillName) return s;
    const endorsers = (s.endorsers || []).filter((e) => e.id !== me.id);
    if (value) {
      endorsers.unshift({
        id: me.id, name: me.name, headline: me.headline, avatar: me.avatar,
        verified: me.verifiedStatus === 'verified',
      });
    }
    return { ...s, endorsers, endorsements: Math.max(0, (s.endorsements || 0) + (value ? 1 : -1)) };
  });
  await query('update users set profile = $2 where id = $1', [targetId, { ...profile, skills }]);
  res.json({ ok: true });
}));

/* ---------- connections ---------- */
async function requireUser(id) {
  const { rows } = await query(`select id from users where id = $1 and role <> 'admin'`, [id]);
  if (!rows[0]) throw new HttpError(404, 'User not found.');
}

router.post('/connections/:userId/request', ah(async (req, res) => {
  const other = req.params.userId;
  if (other === req.user.id) throw new HttpError(400, 'You cannot connect with yourself.');
  await requireUser(other);
  // Already connected? Nothing to do (and no notification).
  const existing = await query(
    `select requester_id, status from connections
     where (requester_id = $1 and addressee_id = $2) or (requester_id = $2 and addressee_id = $1)`,
    [req.user.id, other],
  );
  const row = existing.rows[0];
  if (row && row.status === 'accepted') return res.json({ status: 'connected' });
  if (row && row.requester_id === req.user.id) return res.json({ status: 'requested' });
  // If they already invited me, accepting is the natural result.
  if (row && row.requester_id === other) {
    await query(
      `update connections set status = 'accepted' where requester_id = $1 and addressee_id = $2`,
      [other, req.user.id],
    );
    await clearRequestNotifications(req.user.id, other);
    await notify(other, req.user.id, 'connection_accepted');
    return res.json({ status: 'connected' });
  }
  // Create the pending request FIRST; only notify once it really exists.
  await query(
    `insert into connections (requester_id, addressee_id, status) values ($1, $2, 'pending')
     on conflict do nothing`,
    [req.user.id, other],
  );
  await notify(other, req.user.id, 'connection_request');
  res.json({ status: 'requested' });
}));

router.post('/connections/:userId/accept', ah(async (req, res) => {
  const r = await query(
    `update connections set status = 'accepted'
     where requester_id = $1 and addressee_id = $2 and status = 'pending' returning 1`,
    [req.params.userId, req.user.id],
  );
  if (!r.rowCount) throw new HttpError(404, 'No pending request from this user.');
  await clearRequestNotifications(req.user.id, req.params.userId);
  await notify(req.params.userId, req.user.id, 'connection_accepted');
  res.json({ status: 'connected' });
}));

// Ignore an invite, withdraw a request, or remove a connection.
router.delete('/connections/:userId', ah(async (req, res) => {
  await query(
    `delete from connections
     where (requester_id = $1 and addressee_id = $2) or (requester_id = $2 and addressee_id = $1)`,
    [req.user.id, req.params.userId],
  );
  await clearRequestNotifications(req.user.id, req.params.userId);
  res.json({ ok: true });
}));

/* ---------- messages ---------- */
router.get('/conversations', ah(async (req, res) => {
  res.json({ conversations: await loadConversations(req.user.id) });
}));

router.post('/messages', ah(async (req, res) => {
  const receiverId = str(req.body?.receiverId, 100);
  const text = str(req.body?.text, 4000);
  const attachmentName = str(req.body?.attachmentName, 200) || null;
  if (!text) throw new HttpError(400, 'Message cannot be empty.');
  if (receiverId === req.user.id) throw new HttpError(400, 'You cannot message yourself.');
  await requireUser(receiverId);
  // Chat is only open between members who have accepted each other's connection.
  const link = await query(
    `select 1 from connections where status = 'accepted'
       and ((requester_id = $1 and addressee_id = $2) or (requester_id = $2 and addressee_id = $1))`,
    [req.user.id, receiverId],
  );
  if (!link.rowCount) throw new HttpError(403, 'You can message this person once they accept your connection request.');
  const id = newId('msg');
  const { rows } = await query(
    `insert into messages (id, sender_id, receiver_id, text, attachment_name, is_read)
     values ($1, $2, $3, $4, $5, false) returning *`,
    [id, req.user.id, receiverId, text, attachmentName],
  );
  const m = rows[0];
  res.status(201).json({
    message: {
      id: m.id, senderId: m.sender_id, receiverId: m.receiver_id, text: m.text,
      timestamp: chatTime(m.created_at), isRead: false,
      attachmentName: m.attachment_name || undefined,
      attachmentType: m.attachment_name ? 'document' : undefined,
    },
  });
}));

router.post('/conversations/:userId/read', ah(async (req, res) => {
  await query(
    `update messages set is_read = true
     where receiver_id = $1 and sender_id = $2 and is_read = false`,
    [req.user.id, req.params.userId],
  );
  res.json({ ok: true });
}));

/* ---------- notifications ---------- */
router.get('/notifications', ah(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ notifications: await loadNotifications(req.user.id) });
}));

router.post('/notifications/read', ah(async (req, res) => {
  await query('update notifications set is_read = true where user_id = $1 and is_read = false', [req.user.id]);
  res.json({ ok: true });
}));

export default router;
