import React, { useEffect, useRef, useState } from 'react';
import { LOGO_FULL_URL, BRAND_NAME, TAGLINE } from '../data/brand';
import { api, errorMessage } from '../api';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

interface WelcomeAuthScreenProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSignUp: (name: string, email: string, password: string) => Promise<string | null>;
  onGoogle: (credential: string) => Promise<string | null>;
  onResetPassword: (phone: string, code: string, password: string) => Promise<string | null>;
}

type Mode = 'login' | 'signup' | 'forgot';

// Google's sign-in script (loaded once, only when Google sign-in is configured).
declare global {
  interface Window {
    google?: any;
  }
}
let gsiPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google sign-in.')); };
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
}

const inputCls =
  'w-full text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all';

// Forgot password: 1) mobile number  2) SMS code + new password.
const ForgotPassword: React.FC<{
  onBack: () => void;
  onReset: (phone: string, code: string, password: string) => Promise<string | null>;
}> = ({ onBack, onReset }) => {
  const [step, setStep] = useState<'phone' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async () => {
    setBusy(true); setError(null);
    try {
      const r = await api.forgotPassword(phone);
      setWait(r.resendIn); setStep('reset');
    } catch (e) { setError(errorMessage(e)); }
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true); setError(null);
    const err = await onReset(phone, code, password);
    if (err) { setError(err); setBusy(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 font-display">Reset your password</h2>
        <p className="text-sm text-slate-500 mt-1">
          {step === 'phone'
            ? 'Enter the mobile number you verified on your PhysioLink profile. We will text you a code.'
            : <>We sent a 6-digit code to <b>+91 {phone}</b>. If you do not receive it, that number is not verified on any account.</>}
        </p>
      </div>
      {error && <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 text-xs font-medium">{error}</div>}

      {step === 'phone' ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5">+91</span>
            <input
              className={inputCls} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" aria-label="Mobile number"
              value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
          <button onClick={sendCode} disabled={busy || phone.length !== 10}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer">
            Send code
          </button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <input
            className={`${inputCls} text-center tracking-[0.5em] text-lg font-semibold`} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            placeholder="------" aria-label="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus
          />
          <input
            className={inputCls} type="password" autoComplete="new-password" placeholder="New password (8+ characters)" aria-label="New password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={busy || code.length !== 6 || !password}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer">
            Reset password and log in
          </button>
          <div className="flex items-center justify-between text-xs">
            <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(null); }} className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">Change number</button>
            <button type="button" onClick={sendCode} disabled={wait > 0 || busy} className="font-semibold text-blue-700 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed">
              {wait > 0 ? `Resend in ${wait}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
      <button onClick={onBack} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">Back to log in</button>
    </div>
  );
};

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ onLogin, onSignUp, onGoogle, onResetPassword }) => {
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const onGoogleRef = useRef(onGoogle);
  onGoogleRef.current = onGoogle;

  // Ask the server whether Google sign-in is set up.
  useEffect(() => {
    api.authConfig().then((c) => setGoogleClientId(c.googleClientId)).catch(() => undefined);
  }, []);

  // Draw Google's official button.
  useEffect(() => {
    if (!googleClientId || mode === 'forgot') return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !googleBtnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) return;
            setError(null);
            setSubmitting(true);
            const err = await onGoogleRef.current(resp.credential);
            setSubmitting(false);
            if (err) setError(err);
          },
        });
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 320,
        });
        setGoogleReady(true);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)));
    return () => { cancelled = true; };
  }, [googleClientId, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (mode === 'signup' && !name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (!password) return setError('Please enter your password.');
    if (mode === 'signup' && password.length < 8) return setError('Password must be at least 8 characters.');
    setError(null);
    setSubmitting(true);
    const err = mode === 'signup'
      ? await onSignUp(name.trim(), email.trim(), password)
      : await onLogin(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
  };

  const switchMode = (m: Mode) => { setMode(m); setError(null); };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/60 to-teal-50/60">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo + welcome message */}
        <img src={LOGO_FULL_URL} alt={`${BRAND_NAME} – ${TAGLINE}`} className="w-full max-w-md sm:max-w-lg h-auto" />
        <div className="text-center mt-5 mb-7 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Welcome to {BRAND_NAME}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Connect with physiotherapists, share your cases and achievements, and grow together.
          </p>
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-200 overflow-hidden">
          {mode === 'forgot' ? (
            <ForgotPassword onBack={() => switchMode('login')} onReset={onResetPassword} />
          ) : (<>
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-sm font-semibold text-center">
            {(['signup', 'login'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                  mode === m ? 'border-blue-700 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {m === 'signup' ? 'Sign up' : 'Log in'}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="bg-rose-50 border-b border-rose-200 text-rose-700 px-5 py-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-6 space-y-4">
            <form onSubmit={submit} className="space-y-3.5">
              {mode === 'signup' && (
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  aria-label="Full name"
                  className={inputCls}
                />
              )}
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                className={inputCls}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
                  aria-label="Password"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === 'login' && (
                <div className="text-right -mt-1">
                  <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>{mode === 'signup' ? 'Create account' : 'Log in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
              <span className="flex-1 h-px bg-slate-200" />
              <span>or</span>
              <span className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google */}
            <div className="flex justify-center min-h-[44px]">
              {googleClientId ? (
                <div ref={googleBtnRef} className={googleReady ? '' : 'opacity-0'} />
              ) : (
                <button
                  type="button"
                  onClick={() => setError('Google sign-in is not available right now. Please use email and password.')}
                  className="w-full flex items-center justify-center gap-2.5 border border-slate-300 hover:bg-slate-50 rounded-full py-2.5 text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <GoogleG />
                  <span>Continue with Google</span>
                </button>
              )}
            </div>
          </div>
          </>)}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 py-4 px-6 text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-800">{BRAND_NAME}</span> — {TAGLINE}
      </footer>
    </div>
  );
};

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);
