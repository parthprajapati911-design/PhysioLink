import { query } from './db.js';
import { newId, timeAgo } from './util.js';

// Types: connection_request | connection_accepted | like | comment
const TEXT = {
  connection_request: 'sent you a connection request',
  connection_accepted: 'accepted your connection request',
  like: 'liked your post',
  comment: 'commented on your post',
  post: 'shared a new post',
};

// Fire-and-forget: a failed notification must never break the action that caused it.
export async function notify(userId, actorId, type, ref = null) {
  try {
    if (!userId || userId === actorId) return;
    // Avoid spam: one unread notification per (person, type, post).
    await query(
      `delete from notifications where user_id = $1 and actor_id = $2 and type = $3
         and coalesce(ref, '') = coalesce($4, '') and is_read = false`,
      [userId, actorId, type, ref],
    );
    await query(
      `insert into notifications (id, user_id, actor_id, type, ref) values ($1, $2, $3, $4, $5)`,
      [newId('n'), userId, actorId, type, ref],
    );
  } catch (err) {
    console.error('notify failed:', err.message);
  }
}

export async function loadNotifications(userId) {
  const { rows } = await query(
    `select n.*, u.profile as actor_profile
       from notifications n left join users u on u.id = n.actor_id
      where n.user_id = $1
       and (n.type <> 'connection_request' or exists (
             select 1 from connections c
              where c.status = 'pending' and c.requester_id = n.actor_id and c.addressee_id = n.user_id))
     order by n.created_at desc limit 40`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    text: TEXT[r.type] || 'did something',
    actorId: r.actor_id || '',
    actorName: r.actor_profile?.name || 'A member',
    actorAvatar: r.actor_profile?.avatar || '',
    ref: r.ref || '',
    isRead: r.is_read,
    timestamp: timeAgo(r.created_at),
  }));
}

// Tell everyone connected to this member about a new post (their "activity").
export async function notifyConnectionsOfPost(authorId, postId) {
  try {
    const { rows } = await query(
      `select case when requester_id = $1 then addressee_id else requester_id end as other
         from connections where status = 'accepted' and (requester_id = $1 or addressee_id = $1)`,
      [authorId],
    );
    for (const r of rows.slice(0, 200)) await notify(r.other, authorId, 'post', postId);
  } catch (err) {
    console.error('notifyConnectionsOfPost failed:', err.message);
  }
}

// Remove connection-request notifications between two members (read or unread),
// once the request is accepted, ignored or withdrawn.
export async function clearRequestNotifications(a, b) {
  try {
    await query(
      `delete from notifications where type = 'connection_request'
         and ((user_id = $1 and actor_id = $2) or (user_id = $2 and actor_id = $1))`,
      [a, b],
    );
  } catch (err) {
    console.error('clearRequestNotifications failed:', err.message);
  }
}
