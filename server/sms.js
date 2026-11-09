// Sends the one-time code by SMS.
//   FAST2SMS_API_KEY=...   -> Fast2SMS "OTP" route (India; works without your own DLT registration)
//   SMS_PROVIDER=console   -> no SMS is sent; the code is printed in the server log (testing only)
import { HttpError } from './util.js';

const isProd = process.env.NODE_ENV === 'production';
const FAST2SMS_KEY = (process.env.FAST2SMS_API_KEY || '').trim();
const FORCE_CONSOLE = (process.env.SMS_PROVIDER || '').trim() === 'console';

export const smsProvider = FORCE_CONSOLE ? 'console' : FAST2SMS_KEY ? 'fast2sms' : isProd ? null : 'console';
export const smsAvailable = () => !!smsProvider;

// `phone` is E.164 like +919876543210; `code` is the 6 digit OTP.
export async function sendOtpSms(phone, code) {
  if (smsProvider === 'console') {
    console.log(`[SMS testing mode] OTP for ${phone}: ${code}`);
    return;
  }
  if (smsProvider !== 'fast2sms') throw new HttpError(503, 'Mobile verification is not available yet.');

  const body = new URLSearchParams({ route: 'otp', variables_values: code, numbers: phone.replace(/^\+91/, '') });
  let r;
  try {
    r = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: FAST2SMS_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error('Fast2SMS request failed:', err.message);
    throw new HttpError(502, 'Could not send the SMS. Please try again.');
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.return !== true) {
    console.error('Fast2SMS rejected the message:', r.status, JSON.stringify(data).slice(0, 300));
    throw new HttpError(502, 'Could not send the SMS. Please try again in a moment.');
  }
}
