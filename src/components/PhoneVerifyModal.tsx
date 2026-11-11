import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void; // reload the account after the number changes
}

const field = 'w-full text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent';

const Form: React.FC<Omit<Props, 'isOpen'>> = ({ user, onClose, onChanged }) => {
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.savePhone(phone);
      onChanged(); onClose();
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm('Remove your mobile number?')) return;
    setBusy(true);
    try { await api.removePhone(); onChanged(); onClose(); } catch (e) { setError(errorMessage(e)); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">Mobile number</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          {error && <div role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
          {user.phoneVerified && (
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              Current number: <b>{user.phoneMasked}</b>
            </p>
          )}
          <p className="text-sm text-slate-600">
            {user.phoneVerified ? 'Enter a new number to change it.' : 'Add your mobile number. It is never shown to other members.'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2.5">+91</span>
            <input
              className={field} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number"
              value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} aria-label="Mobile number" autoFocus
            />
          </div>
          <button type="submit" disabled={busy || phone.length !== 10} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full cursor-pointer">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
          {user.phoneVerified && (
            <button type="button" onClick={remove} disabled={busy} className="w-full text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer">Remove my number</button>
          )}
        </form>
      </div>
    </div>
  );
};

export const PhoneVerifyModal: React.FC<Props> = ({ isOpen, ...rest }) => (isOpen ? <Form {...rest} /> : null);
