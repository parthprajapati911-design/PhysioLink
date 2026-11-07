import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../types';
import { X, Send, CheckCircle2, Building2, MapPin } from 'lucide-react';

interface ApplyModalProps {
  opportunity: Opportunity | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opportunityId: string) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  opportunity,
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !opportunity) return null;

  const [coverNote, setCoverNote] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(opportunity.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">Easy Clinical Application</h2>
            <p className="text-xs text-slate-500">Submit your verified profile and credentials</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Opportunity Highlight */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <img
              src={opportunity.logo}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-slate-900">{opportunity.title}</h3>
              <p className="text-slate-600">{opportunity.organization} · {opportunity.location}</p>
              <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mt-1 inline-block">
                {opportunity.stipendOrSalary}
              </span>
            </div>
          </div>

          {/* Candidate Profile Details (Auto-filled) */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Applying as</label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.qualification})`}
                className="w-full bg-slate-100 text-slate-700 border border-slate-200 rounded-xl p-2.5 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-slate-100 text-slate-700 border border-slate-200 rounded-xl p-2.5 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Credential Status Pill */}
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-teal-900">
              <span className="font-semibold">
                {currentUser.accountType === 'student' ? 'Student Enrolment ID Attached' : 'Council License Reg: Verified'}
              </span>
              <span className="font-mono">{currentUser.registrationNumber || 'KUHS/2026/01'}</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Clinical Statement / Note</label>
              <textarea
                rows={4}
                required
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Clinical Application</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
