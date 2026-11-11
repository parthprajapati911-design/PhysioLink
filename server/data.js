// Read helpers that assemble the data shapes the React app expects.
import { query } from './db.js';
import { toUser, toPost, toComment, toOpportunity, toVerification } from './mappers.js';
import { chatTime, convId } from './util.js';
import { loadNotifications } from './notify.js';

export async function loadUsers(meId, meRole) {
  const { rows } = await query(
    `select u.*,
       (select count(*) from connections c
         where c.status = 'accepted' and (c.requester_id = u.id or c.addressee_id = u.id))::int as conn_count
     from users u
     where u.role <> 'admin' or u.id = $1
        or u.id in (select case when requester_id = $1 then addressee_id else requester_id end
                      from connections where requester_id = $1 or addressee_id = $1)
     order by (u.id = $1 or u.id in (select case when requester_id = $1 then addressee_id else requester_id end
                      from connections where requester_id = $1 or addressee_id = $1)) desc, u.created_at asc
     limit 1000`,
    [meId],
  );
  const map = {};
  for (const r of rows) {
    map[r.id] = toUser(r, { connectionsCount: r.conn_count, includeEmail: r.id === meId });
  }
  return map;
}

const POST_SELECT = `
  select p.*,
    u.profile as author_profile, u.verified_status as author_verified, u.account_type as author_account_type,
    (select count(*) from post_likes l where l.post_id = p.id)::int as likes_count,
    (select count(*) from post_bookmarks b where b.post_id = p.id)::int as bookmarks_count,
    exists(select 1 from post_likes l where l.post_id = p.id and l.user_id = $1) as is_liked,
    exists(select 1 from post_bookmarks b where b.post_id = p.id and b.user_id = $1) as is_bookmarked
  from posts p join users u on u.id = p.author_id`;

export async function loadPosts(meId, limit = 100) {
  const { rows } = await query(`${POST_SELECT} order by p.created_at desc limit $2`, [meId, limit]);
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const { rows: crows } = await query(
    `select c.*, u.profile as author_profile, u.verified_status as author_verified
     from post_comments c join users u on u.id = c.author_id
     where c.post_id = any($1) order by c.created_at desc`,
    [ids],
  );
  const byPost = {};
  for (const c of crows) (byPost[c.post_id] ||= []).push(toComment(c));
  return rows.map((r) => toPost(r, byPost[r.id] || []));
}

export async function loadPost(meId, postId) {
  const { rows } = await query(`${POST_SELECT} where p.id = $2`, [meId, postId]);
  if (!rows[0]) return null;
  const { rows: crows } = await query(
    `select c.*, u.profile as author_profile, u.verified_status as author_verified
     from post_comments c join users u on u.id = c.author_id
     where c.post_id = $1 order by c.created_at desc`,
    [postId],
  );
  return toPost(rows[0], crows.map(toComment));
}

export async function loadOpportunities(meId) {
  const { rows } = await query(
    `select o.*,
       (select count(*) from applications a where a.opportunity_id = o.id)::int as applicants,
       exists(select 1 from applications a where a.opportunity_id = o.id and a.user_id = $1) as has_applied
     from opportunities o order by o.created_at desc limit 200`,
    [meId],
  );
  return rows.map(toOpportunity);
}

export async function loadConnections(meId, usersMap) {
  const { rows: mine } = await query(
    `select requester_id, addressee_id, status from connections
     where requester_id = $1 or addressee_id = $1`,
    [meId],
  );
  const { rows: edges } = await query(
    `select requester_id, addressee_id from connections where status = 'accepted'`,
  );
  const friends = {};
  for (const e of edges) {
    (friends[e.requester_id] ||= new Set()).add(e.addressee_id);
    (friends[e.addressee_id] ||= new Set()).add(e.requester_id);
  }
  const myFriends = friends[meId] || new Set();
  const statusByUser = {};
  for (const c of mine) {
    const other = c.requester_id === meId ? c.addressee_id : c.requester_id;
    if (c.status === 'accepted') statusByUser[other] = 'connected';
    else statusByUser[other] = c.requester_id === meId ? 'requested' : 'pending';
  }
  const me = usersMap[meId] || {};
  const norm = (v) => String(v || '').trim().toLowerCase();
  const firstPart = (v) => norm(v).split(',')[0].trim();
  const myPlace = norm(me.currentCompany || me.college);
  const list = [];
  for (const u of Object.values(usersMap)) {
    if (u.id === meId || u.accountType === 'admin') continue;
    let mutual = 0;
    for (const f of friends[u.id] || []) if (myFriends.has(f)) mutual++;

    // "People you may know": why this person is suggested.
    const reasons = [];
    let score = mutual * 5;
    if (mutual) reasons.push(`${mutual} mutual connection${mutual === 1 ? '' : 's'}`);
    const place = norm(u.currentCompany || u.college);
    if (myPlace && place && myPlace === place) { score += 4; reasons.push('Same workplace / college'); }
    if (firstPart(me.location) && firstPart(me.location) === firstPart(u.location)) { score += 3; reasons.push('Same city'); }
    if (norm(me.specialization) && norm(me.specialization) === norm(u.specialization)) { score += 3; reasons.push('Same specialization'); }
    if (['academician', 'clinician', 'student'].includes(u.accountType) && u.accountType === me.accountType) score += 1;
    if (u.avatar) score += 0.5; // complete profiles first

    list.push({
      id: u.id,
      name: u.name,
      headline: u.headline,
      avatar: u.avatar,
      specialization: u.specialization,
      location: u.location,
      institution: u.currentCompany || u.college || '',
      verified: u.verifiedStatus === 'verified',
      accountType: u.accountType,
      status: statusByUser[u.id] || 'suggestion',
      mutualCount: mutual,
      reasons: reasons.slice(0, 2),
      score,
    });
  }
  const rank = { pending: 0, connected: 1, requested: 2, suggestion: 3 };
  list.sort((a, b) => rank[a.status] - rank[b.status] || b.score - a.score);
  // keep the suggestion list a sensible size
  let suggestions = 0;
  return list.filter((c) => (c.status === 'suggestion' ? ++suggestions <= 60 : true)).map(({ score, ...c }) => c);
}

export async function loadVerifications() {
  const { rows } = await query(
    `select v.*, u.profile from verifications v join users u on u.id = v.user_id
     order by (v.status = 'pending') desc, v.created_at desc limit 200`,
  );
  return rows.map(toVerification);
}

export async function loadConversations(meId) {
  const { rows } = await query(
    `select * from messages where sender_id = $1 or receiver_id = $1
     order by created_at asc limit 3000`,
    [meId],
  );
  if (!rows.length) return [];
  const otherIds = [...new Set(rows.map((m) => (m.sender_id === meId ? m.receiver_id : m.sender_id)))];
  const { rows: urows } = await query(
    `select u.*, 0 as conn_count from users u where u.id = any($1)`,
    [otherIds],
  );
  const others = Object.fromEntries(urows.map((u) => [u.id, toUser(u)]));
  const grouped = {};
  for (const m of rows) {
    const other = m.sender_id === meId ? m.receiver_id : m.sender_id;
    (grouped[other] ||= []).push(m);
  }
  const convs = [];
  for (const [otherId, msgs] of Object.entries(grouped)) {
    const o = others[otherId];
    if (!o) continue;
    const messages = msgs.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      text: m.text,
      timestamp: chatTime(m.created_at),
      isRead: m.is_read,
      attachmentName: m.attachment_name || undefined,
      attachmentType: m.attachment_name ? 'document' : undefined,
    }));
    const last = msgs[msgs.length - 1];
    convs.push({
      _t: new Date(last.created_at).getTime(),
      id: convId(meId, otherId),
      participantIds: [meId, otherId],
      participant: {
        id: o.id, name: o.name, headline: o.headline, avatar: o.avatar,
        verified: o.verifiedStatus === 'verified', isOnline: false, accountType: o.accountType,
      },
      lastMessage: {
        text: last.text,
        timestamp: chatTime(last.created_at),
        senderId: last.sender_id,
        isRead: last.sender_id === meId ? true : last.is_read,
      },
      unreadCount: msgs.filter((m) => m.receiver_id === meId && !m.is_read).length,
      messages,
    });
  }
  convs.sort((a, b) => b._t - a._t);
  return convs.map(({ _t, ...c }) => c);
}

export async function buildBootstrap(user) {
  const users = await loadUsers(user.id, user.role);
  const me = users[user.id];
  const [posts, opportunities, connections, conversations, verifications, notifications] = await Promise.all([
    loadPosts(user.id),
    loadOpportunities(user.id),
    loadConnections(user.id, users),
    loadConversations(user.id),
    user.role === 'admin' ? loadVerifications() : Promise.resolve([]),
    loadNotifications(user.id),
  ]);
  return { me, users, posts, opportunities, connections, conversations, verifications, notifications };
}
