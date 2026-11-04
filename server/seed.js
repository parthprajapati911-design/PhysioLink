import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, query } from './db.js';
import { convId } from './util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO = '/images/physiolink_logo_emblem_1793727246789.jpg';

/** Make sure the admin account from ADMIN_EMAIL / ADMIN_PASSWORD exists (runs on every start). */
export async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set - no admin account will be created.');
    return;
  }
  if (password.length < 10) {
    console.warn('ADMIN_PASSWORD should be at least 10 characters. Admin not created.');
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const updated = await query(
    `update users set role = 'admin', account_type = 'admin', verified_status = 'verified', password_hash = $2
     where lower(email) = $1`,
    [email, hash],
  );
  if (updated.rowCount) return;
  await query(
    `insert into users (id, email, password_hash, role, account_type, verified_status, profile)
     values ('admin_root', $1, $2, 'admin', 'admin', 'verified', $3)`,
    [email, hash, {
      name: 'PhysioLink Admin', headline: 'Standards & Verification Administrator',
      avatar: LOGO, coverImage: '', location: 'India', specialization: 'Platform Administration',
      qualification: '', about: 'Reviews council registrations and moderates the community.',
    }],
  );
  console.log(`Admin account created for ${email}`);
}

// "2 hours ago" / "1 day ago" / "2 weeks ago" -> Date
function ago(text, fallbackHours = 1) {
  const m = /(\d+)\s*(hour|day|week|min)/i.exec(text || '');
  const n = m ? Number(m[1]) : fallbackHours;
  const unit = m ? m[2].toLowerCase() : 'hour';
  const ms = { min: 60e3, hour: 3600e3, day: 86400e3, week: 7 * 86400e3 }[unit];
  return new Date(Date.now() - n * ms);
}

/** Insert sample content once, when SEED_DEMO_DATA=true. */
export async function seedDemoData() {
  if (process.env.SEED_DEMO_DATA !== 'true') return;
  const done = await query('select 1 from users where is_demo limit 1');
  if (done.rowCount) return;

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'));
  const demoPass = process.env.DEMO_PASSWORD || '';
  const demoHash = demoPass.length >= 8 ? await bcrypt.hash(demoPass, 10) : null;
  if (!demoHash) console.log('DEMO_PASSWORD not set (min 8 chars): sample users exist but cannot sign in.');

  const client = await pool.connect();
  try {
    await client.query('begin');
    const userIds = new Set();

    const addUser = async (id, email, accountType, verifiedStatus, profile) => {
      await client.query(
        `insert into users (id, email, password_hash, role, account_type, verified_status, profile, is_demo)
         values ($1, $2, $3, 'member', $4, $5, $6, true) on conflict do nothing`,
        [id, email, demoHash, accountType, verifiedStatus, profile],
      );
      userIds.add(id);
    };

    // Main sample personas (the sample admin persona is replaced by ADMIN_EMAIL)
    for (const u of data.users) {
      if (u.id === 'admin') continue;
      const { id, email, verifiedStatus, accountType, connectionsCount, ...profile } = u;
      await addUser(id, email, accountType, verifiedStatus, profile);
    }

    // People from the connection list become sample users too
    for (const c of data.connections) {
      await addUser(c.id, `${c.id}@demo.physiolink.local`, c.accountType, c.verified ? 'verified' : 'pending', {
        name: c.name, headline: c.headline, avatar: c.avatar, coverImage: '', location: c.location,
        specialization: c.specialization, qualification: '', currentCompany: c.institution,
        about: '', experiences: [], education: [], publications: [], certifications: [], skills: [],
        openToWork: false, followersCount: 0,
      });
    }

    // Relationships relative to the main sample clinician
    for (const c of data.connections) {
      if (c.status === 'pending') {
        await client.query(
          `insert into connections (requester_id, addressee_id, status) values ($1, 'sports_pt', 'pending') on conflict do nothing`, [c.id]);
      } else if (c.status === 'connected') {
        await client.query(
          `insert into connections (requester_id, addressee_id, status) values ($1, 'sports_pt', 'accepted') on conflict do nothing`, [c.id]);
      }
    }
    // A couple of extra links so the sample network is not empty
    for (const [a, b] of [['sports_pt', 'neuro_researcher'], ['sports_pt', 'student_pt']]) {
      await client.query(
        `insert into connections (requester_id, addressee_id, status) values ($1, $2, 'accepted') on conflict do nothing`, [a, b]);
    }

    // Pending verification requests (with placeholder accounts)
    for (const v of data.verifications) {
      const isStudent = /student/i.test(v.qualification);
      await addUser(v.userId, `${v.userId}@demo.physiolink.local`, isStudent ? 'student' : 'clinician', 'pending', {
        name: v.userName, headline: v.qualification, avatar: v.userAvatar, coverImage: '',
        location: '', specialization: '', qualification: v.qualification, registrationNumber: v.registrationNumber,
        about: '', experiences: [], education: [], publications: [], certifications: [], skills: [],
        openToWork: false, followersCount: 0,
      });
      await client.query(
        `insert into verifications (id, user_id, qualification, council_name, registration_number, document_type, document_url, status, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,'pending',$8) on conflict do nothing`,
        [v.id, v.userId, v.qualification, v.councilName, v.registrationNumber, v.documentType, '', ago(v.submittedDate, 24)],
      );
    }

    // Posts + comments
    const byName = Object.fromEntries(data.users.map((u) => [u.name, u.id]));
    for (const p of data.posts) {
      if (!userIds.has(p.authorId)) continue;
      const created = ago(p.timestamp);
      await client.query(
        `insert into posts (id, author_id, type, title, content, tags, clinical_metrics, image_url, document_name, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict do nothing`,
        [p.id, p.authorId, p.type, p.title, p.content, JSON.stringify(p.tags || []),
          p.clinicalMetrics ? JSON.stringify(p.clinicalMetrics) : null, p.imageUrl || null, p.documentName || null, created],
      );
      for (const c of p.comments || []) {
        const authorId = byName[c.authorName];
        if (!authorId || !userIds.has(authorId)) continue;
        await client.query(
          `insert into post_comments (id, post_id, author_id, content, likes, created_at)
           values ($1,$2,$3,$4,$5,$6) on conflict do nothing`,
          [c.id, p.id, authorId, c.content, c.likes || 0, ago(c.timestamp, 1)],
        );
      }
    }

    // Opportunities
    for (const o of data.opportunities) {
      await client.query(
        `insert into opportunities
           (id, title, organization, logo, location, location_type, type, specialization,
            stipend_or_salary, experience_required, description, requirements, base_applicants, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict do nothing`,
        [o.id, o.title, o.organization, o.logo, o.location, o.locationType, o.type, o.specialization,
          o.stipendOrSalary, o.experienceRequired, o.description, JSON.stringify(o.requirements || []),
          o.applicantsCount || 0, ago(o.postedDate, 24)],
      );
    }

    // Conversations
    for (const conv of data.conversations) {
      const total = conv.messages.length;
      for (let i = 0; i < total; i++) {
        const m = conv.messages[i];
        if (!userIds.has(m.senderId) || !userIds.has(m.receiverId)) continue;
        const when = new Date(Date.now() - (total - i) * 25 * 60 * 1000 - 3600e3);
        await client.query(
          `insert into messages (id, sender_id, receiver_id, text, attachment_name, is_read, created_at)
           values ($1,$2,$3,$4,$5,$6,$7) on conflict do nothing`,
          [m.id, m.senderId, m.receiverId, m.text, m.attachmentName || null, !!m.isRead, when],
        );
      }
    }

    await client.query('commit');
    console.log('Sample data inserted.');
  } catch (err) {
    await client.query('rollback');
    console.error('Seeding failed (continuing without sample data):', err.message);
  } finally {
    client.release();
  }
}
