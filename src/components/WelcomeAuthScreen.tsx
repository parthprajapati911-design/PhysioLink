import React, { useEffect, useRef, useState } from 'react';
import { LOGO_URL, BRAND_NAME, TAGLINE } from '../data/brand';
import { api, errorMessage } from '../api';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

interface WelcomeAuthScreenProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSignUp: (name: string, email: string, password: string) => Promise<string | null>;
  onGoogle: (credential: string) => Promise<string | null>;
}

type Mode = 'login' | 'signup';

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

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ onLogin, onSignUp, onGoogle }) => {
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
    if (!googleClientId) return;
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
  }, [googleClientId]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Name only */}
        <div className="flex items-center gap-3 mb-8">
          <img src={LOGO_URL} alt="" className="w-12 h-12 rounded-xl object-cover shadow border border-teal-500/30" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">{BRAND_NAME}</h1>
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
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
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-200">{BRAND_NAME}</span> — {TAGLINE}
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
