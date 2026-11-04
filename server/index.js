import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { migrate, pool } from './db.js';
import { requireAuth } from './auth.js';
import { buildBootstrap } from './data.js';
import { ah } from './util.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import socialRoutes from './routes/social.js';
import adminRoutes from './routes/admin.js';
import { ensureAdmin, seedDemoData } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
}));
app.use(compression());
app.use(express.json({ limit: '300kb' }));
app.use(cookieParser());

app.get('/healthz', (_req, res) => res.type('text').send('ok'));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 1500, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth', authRoutes);

// Everything below needs a signed-in user.
app.get('/api/bootstrap', requireAuth, ah(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await buildBootstrap(req.user));
}));
const api = express.Router();
api.use(requireAuth);
api.use('/posts', postRoutes);
api.use(socialRoutes);
api.use(adminRoutes);
app.use('/api', api);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// Serve the built React app (run `npm run build` first).
if (fs.existsSync(DIST)) {
  app.use('/assets', express.static(path.join(DIST, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(DIST, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
} else {
  app.get('/', (_req, res) =>
    res.type('text').send('API is running. In development open the web app at http://localhost:3000'));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

async function start() {
  await migrate();
  await ensureAdmin();
  await seedDemoData();
  const server = app.listen(PORT, () => console.log(`PhysioLink listening on port ${PORT}`));
  const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
