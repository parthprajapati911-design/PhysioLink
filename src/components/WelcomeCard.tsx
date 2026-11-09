import React, { useState } from 'react';
import { CheckCircle2, Circle, X } from 'lucide-react';
import type { UserProfile } from '../types';

interface WelcomeCardProps {
  user: UserProfile;
  postsCount: number;
  onEditProfile: () => void;
  onCreatePost: () => void;
  onVerifyPhone: () => void;
}

const key = (id: string) => `physiolink_welcome_hidden_${id}`;
const wasHidden = (id: string) => { try { return localStorage.getItem(key(id)) === '1'; } catch { return false; } };

// Greets a new member and shows what is left to set up. Disappears when everything is done.
export const WelcomeCard: React.FC<WelcomeCardProps> = ({ user, postsCount, onEditProfile, onCreatePost, onVerifyPhone }) => {
  const [hidden, setHidden] = useState(() => wasHidden(user.id));

  const items = [
    { label: 'Verify your mobile number (to reset your password)', done: !!user.phoneVerified, action: onVerifyPhone },
    { label: 'Add a profile photo', done: !!user.avatar, action: onEditProfile },
    { label: 'Choose your tag: Academician, Clinician or Student', done: ['academician', 'clinician', 'student'].includes(user.accountType), action: onEditProfile },
    { label: 'Write a headline', done: !!user.headline, action: onEditProfile },
    { label: 'Tell people about yourself', done: !!user.about, action: onEditProfile },
    { label: 'Add your education or experience', done: (user.education?.length || 0) + (user.experiences?.length || 0) > 0, action: onEditProfile },
    { label: 'Share your first post', done: postsCount > 0, action: onCreatePost },
  ];
  const doneCount = items.filter((i) => i.done).length;
  if (hidden || doneCount === items.length) return null;

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(key(user.id), '1'); } catch { /* ignore */ }
  };
  const pct = Math.round((doneCount / items.length) * 100);
  const firstName = (user.name || '').split(' ')[0];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 rounded-2xl border border-blue-100 shadow-sm p-5 relative">
      <button onClick={dismiss} aria-label="Hide welcome" className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-white/80 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
      <h2 className="text-lg font-bold text-slate-900 font-display pr-8">Welcome to PhysioLink{firstName ? `, ${firstName}` : ''}!</h2>
      <p className="text-sm text-slate-600 mt-1">Finish setting up so other physiotherapists can find and connect with you.</p>

      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-600">{pct}%</span>
      </div>

      <ul className="mt-3 space-y-1">
        {items.map((i) => (
          <li key={i.label}>
            <button
              onClick={i.done ? undefined : i.action}
              disabled={i.done}
              className={`w-full flex items-center gap-2.5 text-left text-sm py-1.5 px-2 rounded-lg ${i.done ? 'text-slate-400 cursor-default' : 'text-slate-800 hover:bg-white cursor-pointer'}`}
            >
              {i.done ? <CheckCircle2 className="w-4.5 h-4.5 text-teal-500 shrink-0" /> : <Circle className="w-4.5 h-4.5 text-slate-300 shrink-0" />}
              <span className={i.done ? 'line-through' : 'font-medium'}>{i.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
