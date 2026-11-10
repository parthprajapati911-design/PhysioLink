import { Router } from 'express';
import crypto from 'node:crypto';
import { query } from '../db.js';
import { HttpError, ah } from '../util.js';

// Photos are saved in the app's own Postgres database, so uploads work with zero extra setup.
// If Supabase Storage keys are configured, they are used first (and the database is the fallback).
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const BUCKET = (process.env.SUPABASE_BUCKET || 'physiolink-images').trim();
const MAX_BYTES = 2 * 1024 * 1024;

const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const authHeaders = () => ({
  apikey: SERVICE_KEY,
  ...(SERVICE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
});
const LOCAL_PREFIX = '/api/images/file/';
const LOCAL_RE = /^\/api\/images\/file\/(img_[a-f0-9]{24})$/;

// Identify the image by its first bytes (never trust the browser's claim).
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ['image/jpeg', 'jpg'];
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ['image/png', 'png'];
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return ['image/webp', 'webp'];
  return null;
}

async function createBucket() {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: MAX_BYTES, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'] }),
  });
  return r.ok;
}

const putObject = (objectPath, mime, buf) =>
  fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': mime, 'Cache-Control': 'max-age=31536000' },
    body: buf,
  });

async function saveToSupabase(userId, type, buf) {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const objectPath = `${userId}/${crypto.randomBytes(12).toString('hex')}.${type[1]}`;
    let r = await putObject(objectPath, type[0], buf);
    if (!r.ok && (r.status === 404 || r.status === 400)) {
      if (await createBucket()) r = await putObject(objectPath, type[0], buf);
    }
    if (r.ok) return publicBase + objectPath;
    console.error('Supabase Storage upload failed (using database instead):', r.status, (await r.text()).slice(0, 200));
  } catch (err) {
    console.error('Supabase Storage unreachable (using database instead):', err.message);
  }
  return null;
}

async function saveToDatabase(userId, type, buf) {
  const id = `img_${crypto.randomBytes(12).toString('hex')}`;
  await query('insert into images (id, owner_id, mime, data) values ($1, $2, $3, $4)', [id, userId, type[0], buf]);
  return LOCAL_PREFIX + id;
}

// Upload: { dataUrl: "data:image/jpeg;base64,..." }  ->  { url }
export const uploadRouter = Router();
uploadRouter.post('/', ah(async (req, res) => {
  const dataUrl = String(req.body?.dataUrl || '');
  const comma = dataUrl.indexOf(',');
  if (!dataUrl.startsWith('data:image/') || comma < 0 || !dataUrl.slice(0, comma).endsWith(';base64')) {
    throw new HttpError(400, 'Please choose a valid image.');
  }
  const buf = Buffer.from(dataUrl.slice(comma + 1), 'base64');
  if (!buf.length) throw new HttpError(400, 'Please choose a valid image.');
  if (buf.length > MAX_BYTES) throw new HttpError(413, 'Image is too large (max 2 MB).');
  const type = sniff(buf);
  if (!type) throw new HttpError(400, 'Only JPG, PNG or WebP images are allowed.');

  const url = (await saveToSupabase(req.user.id, type, buf)) || (await saveToDatabase(req.user.id, type, buf));
  res.status(201).json({ url });
}));

// Public (no sign-in): <img> tags load photos from here. Ids are unguessable.
export const imageFileRouter = Router();
imageFileRouter.get('/:id', ah(async (req, res) => {
  const id = String(req.params.id);
  if (!/^img_[a-f0-9]{24}$/.test(id)) throw new HttpError(404, 'Not found.');
  const { rows } = await query('select mime, data from images where id = $1', [id]);
  if (!rows[0]) throw new HttpError(404, 'Not found.');
  res.set('Content-Type', rows[0].mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.set('X-Content-Type-Options', 'nosniff');
  res.send(rows[0].data);
}));

// A photo link is only accepted if it is one of this member's own uploads.
export async function isOwnImageUrl(url, userId) {
  if (typeof url !== 'string' || url.length > 500) return false;
  const local = LOCAL_RE.exec(url);
  if (local) {
    const { rows } = await query('select 1 from images where id = $1 and owner_id = $2', [local[1], userId]);
    return !!rows[0];
  }
  return !!SUPABASE_URL && url.startsWith(`${publicBase}${userId}/`) && /^[\w:/.-]+$/.test(url);
}
