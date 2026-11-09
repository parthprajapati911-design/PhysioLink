import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { Opportunity, UserProfile } from '../types';
import { Avatar } from './Avatar';

interface ApplyModalProps {
  opportunity: Opportunity | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opportunityId: string, note: string, phone: string) => void;
}

const Form: React.FC<{ opportunity: Opportunity; currentUser: UserProfile; onClose: () => void; onSubmit: ApplyModalProps['onSubmit'] }> = ({
  opportunity, currentUser, onClose, onSubmit,
}) => {
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const field = 'w-full text-sm text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent';

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSubmit(opportunity.id, note.trim(), phone.trim()); onClose(); }}
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">Apply</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Avatar src={opportunity.logo} name={opportunity.organization} className="w-10 h-10 rounded-lg" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{opportunity.title}</p>
              <p className="text-xs text-slate-600">{opportunity.organization}{opportunity.location ? ` · ${opportunity.location}` : ''}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            The person who posted this will see your profile, <b>{currentUser.email}</b> and anything you add below.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone (optional)</label>
            <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message (optional)</label>
            <textarea className={`${field} resize-none`} rows={4} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1500} placeholder="Tell them a little about yourself" />
          </div>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer">Cancel</button>
          <button type="submit" className="flex items-center gap-1.5 px-6 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-full cursor-pointer">
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export const ApplyModal: React.FC<ApplyModalProps> = ({ opportunity, isOpen, ...rest }) =>
  isOpen && opportunity ? <Form opportunity={opportunity} {...rest} /> : null;
