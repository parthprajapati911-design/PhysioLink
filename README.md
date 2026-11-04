# PhysioLink

A professional network for physiotherapists, students and researchers.

- **Frontend:** React + Vite + Tailwind (`src/`)
- **Backend:** Node.js + Express (`server/`) – one service serves the website *and* the API
- **Database:** Postgres on Supabase (tables are created automatically on first start)
- **Hosting:** Render (one Web Service, deployed from GitHub)

```
Browser ──► Render (Express: website + /api) ──► Supabase Postgres
```

## 1. Create the Supabase database (free)
1. Sign up at https://supabase.com → **New project** (pick a region near your users, e.g. Mumbai). Save the database password.
2. When the project is ready, click **Connect** (top bar) → choose **Session pooler** → copy the connection string.
   It looks like `postgresql://postgres.abcd:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`.
   Replace `[YOUR-PASSWORD]` with your password. This is your `DATABASE_URL`.
3. Nothing else to do: the server creates all tables the first time it starts.

> Free Supabase projects pause after 7 days without activity. Upgrade to Pro ($25/mo) when you have real users.

## 2. Run it on your computer (optional but recommended)
Needs Node 20+.
```
cp .env.example .env      # then fill in DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev               # website: http://localhost:3000   (API runs on :4000)
```
Sign up from the website, or sign in with the admin email/password from `.env`.

## 3. Put the code on GitHub
```
git init
git add .
git commit -m "PhysioLink"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/physiolink.git
git push -u origin main
```
(`.env` is git-ignored, so your secrets are not uploaded. Commit `package-lock.json` too – it is created by `npm install`.)

## 4. Deploy on Render
1. https://render.com → sign in with GitHub → **New → Blueprint** → pick your repo (it reads `render.yaml`).
   *(Or **New → Web Service** manually: Build `npm install --include=dev && npm run build`, Start `npm start`, Health check `/healthz`.)*
2. Fill in the environment variables Render asks for:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Supabase Session pooler string from step 1 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your admin login (password 10+ characters) |
| `DEMO_PASSWORD` | optional – lets you sign in as the sample users |
| `SEED_DEMO_DATA` | `true` for sample content, `false` for an empty real launch |
| `JWT_SECRET` | generated automatically |

3. Click **Deploy**. When it finishes open your `https://physiolink.onrender.com` URL.

> Render's free web service sleeps after ~15 minutes of no traffic and takes ~30–60 s to wake up. The paid "Starter" plan stays awake.

## How it works
- **Accounts:** email + password (bcrypt hashed). Login uses a secure httpOnly cookie. Login/sign-up is rate-limited.
- **Verification:** every new account starts as *pending*. The admin opens the **Admin** tab and approves/rejects; only then does the account get the verified badge.
- **Data saved in the database:** profiles, posts, likes, bookmarks, comments, connections, messages (refresh every 15 s), job applications, verification requests.
- **Admin:** set by `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Admin can also publish jobs through `POST /api/opportunities` (no screen for it yet).
- Tables are locked from Supabase's public API (Row Level Security on, no policies) – only this backend can read or write.

## Not built yet (good next steps)
- Password reset and email verification (needs an email service such as Resend/SMTP)
- Uploading certificates / profile photos (Supabase Storage)
- Viewing other members' full profiles, search, pagination, real-time chat
- A screen for admins to post jobs
