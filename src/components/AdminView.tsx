import React from 'react';
import { VerificationRequest } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  FileCheck, 
  Activity, 
  ExternalLink,
  Check,
  X
} from 'lucide-react';

interface AdminViewProps {
  verifications: VerificationRequest[];
  onApproveVerification: (id: string) => void;
  onRejectVerification: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  verifications,
  onApproveVerification,
  onRejectVerification,
}) => {
  const pendingRequests = verifications.filter((v) => v.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Governance & Credentialing Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">
            PhysioLink Standards & Verification Board
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Verify state council registration certificates and student college IDs to grant official verified checkmarks and safeguard clinical integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl">
            Audit Mode: Active
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 block">Verified Clinicians</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">2,840</span>
          <span className="text-[10px] text-teal-700 font-medium">State Council Audited</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 block">Active Student Interns</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">1,920</span>
          <span className="text-[10px] text-blue-700 font-medium">BPT / MPT Candidates</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 block">Pending Audits</span>
          <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1 block">
            {pendingRequests.length}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">Awaiting Review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-500 block">Case Discussions</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">8,420</span>
          <span className="text-[10px] text-slate-400 font-medium">Zero Moderation Flags</span>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Council Certificate & Student ID Verification Queue
            </h2>
            <p className="text-xs text-slate-500">
              Cross-check license details with state medical council registers before approving
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">All credential verification requests reviewed!</p>
            <p className="text-xs text-slate-400 mt-1">New submissions from registered clinicians will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={req.userAvatar}
                    alt={req.userName}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{req.userName}</h3>
                      <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {req.documentType}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700">{req.qualification}</p>

                    <div className="text-xs text-slate-500 flex items-center flex-wrap gap-x-2 gap-y-0.5">
                      <span>Council: <strong className="text-slate-800">{req.councilName}</strong></span>
                      <span>·</span>
                      <span>Reg No: <code className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-900">{req.registrationNumber}</code></span>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-0.5">
                      Submitted {req.submittedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <button
                    onClick={() => onRejectVerification(req.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => onApproveVerification(req.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Grant Badge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
