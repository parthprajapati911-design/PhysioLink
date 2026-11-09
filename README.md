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
| `SUPABASE_URL` | your Supabase **Project URL** (Project Settings → API), e.g. `https://abcd1234.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** (or **secret**) key from the same page. Keep it private. Photos are saved in a bucket called `physiolink-images`, created automatically on the first upload |
| `FAST2SMS_API_KEY` | optional – sends the SMS codes for mobile verification and password reset (step 6) |
| `SMS_PROVIDER` | leave empty. Set to `console` only for testing: no SMS is sent and the code appears in the Render **Logs** |
| `GOOGLE_CLIENT_ID` | optional – turns on **Continue with Google** (see step 5) |
| `SEED_DEMO_DATA` | keep `false` – the app starts completely empty |
| `PURGE_DEMO_DATA` | keep `false`. Set `true` for ONE deploy to delete old sample users/posts/jobs already in your database, then set it back |
| `JWT_SECRET` | generated automatically |

3. Click **Deploy**. When it finishes open your `https://physiolink.onrender.com` URL.

> Render's free web service sleeps after ~15 minutes of no traffic and takes ~30–60 s to wake up. The paid "Starter" plan stays awake.

## 5. Turn on Google sign-in (optional)
1. https://console.cloud.google.com → create a project → **APIs & Services → OAuth consent screen** (External, fill the app name and your email).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. Under **Authorized JavaScript origins** add your site (e.g. `https://physiolink.onrender.com`, and `http://localhost:3000` for local testing). No redirect URI is needed.
4. Copy the **Client ID** into Render as `GOOGLE_CLIENT_ID` (and into `.env` locally) and redeploy. The Google button then appears on the welcome page.

## 6. Mobile verification and password reset by SMS (optional)
1. Create an account at https://www.fast2sms.com and open **Dev API** to copy your **API key**. Add some credit to the wallet (check their current pricing).
2. In Render add `FAST2SMS_API_KEY` = your key and redeploy.
3. Members add their number in **Profile → Account → Add & verify**. Later, on the login page, **Forgot password?** texts them a 6-digit code to set a new password.

Codes expire after 10 minutes, allow 5 wrong tries, and can be re-sent after 60 seconds (max 5 per hour per number). Only Indian 10-digit mobile numbers are supported. Until a key is added, these screens show "not available yet".
To try everything before paying for SMS, temporarily set `SMS_PROVIDER` = `console` and read the code in Render → **Logs** (remove it afterwards).

## How it works
- **Sign up:** name + email + password, or Google. Accounts start completely blank, and a welcome card guides new members through setting up their profile.
- **Profile:** photo, cover photo, tag (**Academician / Clinician / Student**), headline, workplace, location, about, experience, education, licenses & certifications, skills. Tap any name or photo to open that person's profile, where you can **Connect** or **Message** them.
- **Search:** the search box in the top bar finds people by name, headline, workplace or city.
- **Posts:** a photo and/or a caption plus one tag (Case, Achievement, Research, Event, Update). Filter the feed by tag, or by **Saved** posts. You can delete your own posts.
- **Opportunities:** any member can post a job, internship, fellowship or faculty role and see who applied (name, email, phone, message). Applicants can apply with an optional note.
- **Network & messages:** connection requests, accept/ignore, and one-to-one chat. New activity appears automatically (the app refreshes in the background).
- **Photos:** shrunk in the browser and saved in Supabase Storage; the database keeps only the link.
- **Accounts:** passwords are bcrypt hashed; login uses a secure httpOnly cookie; login/sign-up is rate-limited. Google tokens are verified on the server.
- **Forgot password:** a member who has verified a mobile number can reset their password with an SMS code. Resetting also signs out older logins. Members without a verified number cannot reset by themselves.
- **Admin:** set by `ADMIN_EMAIL`/`ADMIN_PASSWORD`. The verification queue stays empty because sign-up does not collect registration numbers.
- Tables are locked from Supabase's public API (Row Level Security on, no policies) – only this backend can read or write.

## Not built yet (good next steps)
- Password reset and email verification (needs an email service such as Resend/SMTP)
- Viewing other members' full profiles, search, pagination, real-time chat
- A screen for admins to post jobs
