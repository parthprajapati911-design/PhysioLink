import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { OAuth2Client } from 'google-auth-library';

// Sends email through your Gmail account. Two ways (set one of them on Render):
//
//  A) App password over SMTP (simplest):   GMAIL_USER + GMAIL_APP_PASSWORD
//     NOTE: some hosts, including Render's free plan, block SMTP ports. If sending
//     times out there, use option B (it uses normal HTTPS, which is never blocked).
//
//  B) Gmail API over HTTPS:   GMAIL_USER + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN
//
//  Testing only: MAIL_PROVIDER=console prints the email (and its link) in the server log.
const env = (k) => (process.env[k] || '').trim();
const USER = env('GMAIL_USER');
const FROM_NAME = env('MAIL_FROM_NAME') || 'PhysioLink';

const mode = () => {
  if (env('MAIL_PROVIDER') === 'console') return 'console';
  if (USER && env('GMAIL_CLIENT_ID') && env('GMAIL_CLIENT_SECRET') && env('GMAIL_REFRESH_TOKEN')) return 'api';
  if (USER && env('GMAIL_APP_PASSWORD')) return 'smtp';
  return null;
};
export const mailEnabled = () => mode() !== null;

let smtp = null;
const smtpTransport = () =>
  (smtp ??= nodemailer.createTransport({
    host: env('MAIL_SMTP_HOST') || 'smtp.gmail.com',
    port: Number(env('MAIL_SMTP_PORT')) || 465,
    secure: env('MAIL_SMTP_SECURE') ? env('MAIL_SMTP_SECURE') === 'true' : true,
    auth: { user: USER, pass: env('GMAIL_APP_PASSWORD').replace(/\s+/g, '') },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: !env('MAIL_SMTP_HOST') },
  }));

let oauth = null;
async function sendViaGmailApi(message) {
  oauth ??= (() => {
    const c = new OAuth2Client(env('GMAIL_CLIENT_ID'), env('GMAIL_CLIENT_SECRET'));
    c.setCredentials({ refresh_token: env('GMAIL_REFRESH_TOKEN') });
    return c;
  })();
  const { token } = await oauth.getAccessToken();
  const raw = await new Promise((resolve, reject) =>
    new MailComposer(message).compile().build((err, buf) => (err ? reject(err) : resolve(buf))),
  );
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: raw.toString('base64url') }),
  });
  if (!r.ok) throw new Error(`Gmail API ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

export async function sendMail({ to, subject, text, html }) {
  const m = mode();
  if (!m) throw new Error('Email is not configured.');
  const message = { from: `"${FROM_NAME}" <${USER || 'no-reply@localhost'}>`, to, subject, text, html };
  if (m === 'console') {
    console.log(`[Email testing mode] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  if (m === 'api') return sendViaGmailApi(message);
  await smtpTransport().sendMail(message);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function resetEmail(link, minutes) {
  const text =
    `Reset your PhysioLink password\n\nWe got a request to reset the password for your account.\n` +
    `Open this link to choose a new password (valid for ${minutes} minutes):\n${link}\n\n` +
    `If you did not ask for this, you can ignore this email. Your password will not change.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#0f172a">
  <h2 style="margin:0 0 12px">Reset your PhysioLink password</h2>
  <p style="font-size:14px;line-height:1.5;color:#334155">We got a request to reset the password for your account. This link works for ${minutes} minutes and can be used once.</p>
  <p style="margin:24px 0"><a href="${esc(link)}" style="background:#1d4ed8;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;display:inline-block">Choose a new password</a></p>
  <p style="font-size:12px;color:#64748b;line-height:1.5">Button not working? Copy this address into your browser:<br>${esc(link)}</p>
  <p style="font-size:12px;color:#64748b">If you did not ask for this, ignore this email. Your password will not change.</p></div>`;
  return { subject: 'Reset your PhysioLink password', text, html };
}
