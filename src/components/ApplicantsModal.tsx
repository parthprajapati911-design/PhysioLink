import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Loader2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Applicant, Opportunity } from '../types';
import { Avatar } from './Avatar';

interface Props {
  opportunity: Opportunity | null;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
}

export const ApplicantsModal: React.FC<Props> = ({ opportunity, onClose, onViewProfile }) => {
  const [list, setList] = useState<Applicant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opportunity) return;
    setList(null);
    setError(null);
    api.applicants(opportunity.id).then((r) => setList(r.applicants)).catch((e) => setError(errorMessage(e)));
  }, [opportunity]);

  if (!opportunity) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 font-display">Applicants</h2>
            <p className="text-xs text-slate-500 truncate">{opportunity.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          {error && <p className="text-sm text-rose-700">{error}</p>}
          {!error && list === null && <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>}
          {list?.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No applications yet.</p>}
          {list?.map((a) => (
            <div key={a.userId} className="border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <Avatar src={a.avatar} name={a.name} className="w-10 h-10 rounded-full" />
                <div className="min-w-0 flex-1">
                  <button onClick={() => { onViewProfile(a.userId); onClose(); }} className="text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-left">{a.name}</button>
                  {a.headline && <p className="text-xs text-slate-500 truncate">{a.headline}</p>}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{a.appliedAt}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-600">
                <a href={`mailto:${a.email}`} className="flex items-center gap-1 hover:text-blue-700"><Mail className="w-3.5 h-3.5" />{a.email}</a>
                {a.phone && <a href={`tel:${a.phone}`} className="flex items-center gap-1 hover:text-blue-700"><Phone className="w-3.5 h-3.5" />{a.phone}</a>}
              </div>
              {a.note && <p className="text-xs text-slate-700 mt-2 bg-slate-50 rounded-lg p-2.5 whitespace-pre-wrap break-words">{a.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
