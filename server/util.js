import crypto from 'node:crypto';

export const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wrap async route handlers so errors reach the Express error handler.
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export const convId = (a, b) => `conv_${[a, b].sort().join('__')}`;

export function str(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: TIMEZONE,
  });
}

const dayKey = (d) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date(d));

// Chat timestamps: clock time for today, short date otherwise.
export function chatTime(date) {
  const d = new Date(date);
  if (dayKey(d) === dayKey(new Date())) {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TIMEZONE,
    }).format(d).toUpperCase();
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', timeZone: TIMEZONE,
  }).format(d);
}

const isSafeUrl = (v) =>
  typeof v === 'string' && v.length < 1000 &&
  (v === '' || /^https:\/\//i.test(v) || /^\/api\/images\/file\/img_[a-f0-9]{24}$/.test(v));

const PROFILE_STRING_FIELDS = [
  'name', 'headline', 'avatar', 'coverImage', 'openToWorkText', 'location',
  'currentPosition', 'currentCompany', 'workplaceType', 'registrationNumber',
  'councilName', 'specialization', 'qualification', 'college', 'degreeProgram',
  'academicYear', 'expectedGraduation', 'academicMentor', 'about',
];
const PROFILE_ARRAY_FIELDS = ['experiences', 'education', 'publications', 'certifications', 'clinicalRotations'];

// Recursively limit sizes of user supplied nested data (arrays of plain objects).
function clamp(value, depth = 0) {
  if (typeof value === 'string') return value.slice(0, 3000);
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'boolean' || value == null) return value ?? null;
  if (depth > 4) return null;
  if (Array.isArray(value)) return value.slice(0, 60).map((v) => clamp(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 40)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = clamp(v, depth + 1);
    }
    return out;
  }
  return null;
}

// Build a safe profile document from client input.
// `existing` is the stored profile (used to protect server-controlled fields like endorsements).
export function cleanProfile(input = {}, existing = {}) {
  const out = { ...existing };
  for (const f of PROFILE_STRING_FIELDS) {
    if (input[f] !== undefined) out[f] = str(input[f], f === 'about' ? 4000 : 400);
  }
  for (const f of ['avatar', 'coverImage']) {
    if (input[f] !== undefined && !isSafeUrl(input[f])) out[f] = existing[f] ?? '';
  }
  if (input.openToWork !== undefined) out.openToWork = !!input.openToWork;
  if (input.yearsOfExperience !== undefined) {
    const n = Number(input.yearsOfExperience);
    out.yearsOfExperience = Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), 70) : 0;
  }
  for (const f of PROFILE_ARRAY_FIELDS) {
    if (Array.isArray(input[f])) out[f] = clamp(input[f]);
  }
  if (Array.isArray(input.skills)) {
    const prev = new Map((existing.skills || []).map((s) => [s.name, s]));
    out.skills = input.skills.slice(0, 60).map((s) => {
      const name = str(s?.name, 80);
      const old = prev.get(name);
      return {
        name,
        category: str(s?.category, 80) || old?.category,
        // endorsements are controlled by the server only
        endorsements: old?.endorsements ?? 0,
        endorsers: old?.endorsers ?? [],
      };
    }).filter((s) => s.name);
  }
  if (JSON.stringify(out).length > 150_000) throw new HttpError(413, 'Profile is too large.');
  return out;
}
