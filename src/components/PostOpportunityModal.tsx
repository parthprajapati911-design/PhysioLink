import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { NewOpportunity } from '../types';
import { errorMessage } from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opp: NewOpportunity) => Promise<unknown>;
}

const TYPES: NewOpportunity['type'][] = ['Full-Time Clinical', 'Hospital Fellowship', 'Student Internship', 'Academic / Faculty'];
const MODES: NewOpportunity['locationType'][] = ['On-site Hospital', 'Outpatient Sports Clinic', 'University & Research', 'Hybrid Community'];
const field = 'w-full text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent';
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="block text-xs font-semibold text-slate-600 mb-1">{children}</label>;

const Form: React.FC<Omit<Props, 'isOpen'>> = ({ onClose, onSubmit }) => {
  const [f, setF] = useState({
    title: '', organization: '', location: '', specialization: '', stipendOrSalary: '', experienceRequired: '', description: '', requirements: '',
    type: TYPES[0], locationType: MODES[0],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !f.organization.trim()) return setError('Please add a title and the organization name.');
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        ...f,
        type: f.type as NewOpportunity['type'],
        locationType: f.locationType as NewOpportunity['locationType'],
        requirements: f.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-900 font-display">Post an opportunity</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && <div role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
          <div><Label>Title *</Label><input className={field} value={f.title} onChange={(e) => set('title', e.target.value)} maxLength={200} placeholder="e.g. Physiotherapist" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Organization / clinic *</Label><input className={field} value={f.organization} onChange={(e) => set('organization', e.target.value)} maxLength={200} /></div>
            <div><Label>Location</Label><input className={field} value={f.location} onChange={(e) => set('location', e.target.value)} maxLength={200} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <select className={field} value={f.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><Label>Work setting</Label>
              <select className={field} value={f.locationType} onChange={(e) => set('locationType', e.target.value)}>{MODES.map((t) => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>Specialization</Label><input className={field} value={f.specialization} onChange={(e) => set('specialization', e.target.value)} maxLength={200} /></div>
            <div><Label>Salary / stipend</Label><input className={field} value={f.stipendOrSalary} onChange={(e) => set('stipendOrSalary', e.target.value)} maxLength={200} /></div>
            <div><Label>Experience</Label><input className={field} value={f.experienceRequired} onChange={(e) => set('experienceRequired', e.target.value)} maxLength={200} /></div>
          </div>
          <div><Label>Description</Label><textarea className={`${field} resize-none`} rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} maxLength={5000} /></div>
          <div><Label>Requirements (one per line)</Label><textarea className={`${field} resize-none`} rows={3} value={f.requirements} onChange={(e) => set('requirements', e.target.value)} /></div>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer">Cancel</button>
          <button type="submit" disabled={busy} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white rounded-full cursor-pointer">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Post
          </button>
        </div>
      </form>
    </div>
  );
};

export const PostOpportunityModal: React.FC<Props> = ({ isOpen, ...rest }) => (isOpen ? <Form {...rest} /> : null);
