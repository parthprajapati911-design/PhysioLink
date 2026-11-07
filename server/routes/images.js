import { Router } from 'express';
import crypto from 'node:crypto';
import { HttpError, ah } from '../util.js';

// Photos are stored in Supabase Storage (public bucket); the database only keeps the photo's link.
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const BUCKET = (process.env.SUPABASE_BUCKET || 'physiolink-images').trim();
const MAX_BYTES = 2 * 1024 * 1024;

const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const authHeaders = () => ({
  apikey: SERVICE_KEY,
  // Legacy JWT-style keys also go in Authorization; new "sb_secret_..." keys only use apikey.
  ...(SERVICE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
});

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
  // 200 = created; "already exists" comes back as 4xx and is fine.
  return r.ok;
}

async function putObject(objectPath, mime, buf) {
  return fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': mime, 'Cache-Control': 'max-age=31536000' },
    body: buf,
  });
}

// Upload: { dataUrl: "data:image/jpeg;base64,..." }  ->  { url: "https://<project>.supabase.co/storage/v1/object/public/..." }
export const uploadRouter = Router();
uploadRouter.post('/', ah(async (req, res) => {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new HttpError(503, 'Photo upload is not set up yet.');
  const m = /^data:image\/[a-z+.-]+;base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.dataUrl || ''));
  if (!m) throw new HttpError(400, 'Please choose a valid image.');
  const buf = Buffer.from(m[1], 'base64');
  if (!buf.length || buf.length > MAX_BYTES) throw new HttpError(413, 'Image is too large (max 2 MB).');
  const type = sniff(buf);
  if (!type) throw new HttpError(400, 'Only JPG, PNG or WebP images are allowed.');

  const objectPath = `${req.user.id}/${crypto.randomBytes(12).toString('hex')}.${type[1]}`;
  let r = await putObject(objectPath, type[0], buf);
  if (!r.ok && (r.status === 404 || r.status === 400)) {
    // First upload ever: the bucket does not exist yet.
    if (await createBucket()) r = await putObject(objectPath, type[0], buf);
  }
  if (!r.ok) {
    console.error('Supabase Storage upload failed:', r.status, (await r.text()).slice(0, 300));
    throw new HttpError(502, 'Could not save the photo. Please try again.');
  }
  res.status(201).json({ url: publicBase + objectPath });
}));

// A photo link is only accepted if it points into this member's own folder in our bucket.
export const isOwnImageUrl = (url, userId) =>
  !!SUPABASE_URL && typeof url === 'string' && url.startsWith(`${publicBase}${userId}/`) && /^[\w:/.-]+$/.test(url) && url.length < 500;
