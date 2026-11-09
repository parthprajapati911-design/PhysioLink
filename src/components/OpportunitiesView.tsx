import React, { useState } from 'react';
import { Opportunity, UserProfile, NewOpportunity } from '../types';
import { CheckCircle2, Search, Send, Plus, Trash2, Users } from 'lucide-react';
import { Avatar } from './Avatar';
import { PostOpportunityModal } from './PostOpportunityModal';
import { ApplicantsModal } from './ApplicantsModal';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  currentUser: UserProfile;
  onApply: (opportunity: Opportunity) => void;
  onCreate: (opp: NewOpportunity) => Promise<unknown>;
  onDelete: (id: string) => void;
  onViewProfile: (userId: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  currentUser,
  onApply,
  onCreate,
  onDelete,
  onViewProfile,
}) => {
  const [showPost, setShowPost] = useState(false);
  const [viewingApplicants, setViewingApplicants] = useState<Opportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedType === 'all') return matchesSearch;
    return matchesSearch && opp.type.toLowerCase().includes(selectedType.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      <PostOpportunityModal isOpen={showPost} onClose={() => setShowPost(false)} onSubmit={onCreate} />
      <ApplicantsModal opportunity={viewingApplicants} onClose={() => setViewingApplicants(null)} onViewProfile={onViewProfile} />

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Opportunities</h1>
          <p className="text-xs text-slate-500 mt-1">Jobs, internships, fellowships and faculty positions for physiotherapists.</p>
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> Post an opportunity
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, organization, city or specialization"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Roles ({opportunities.length})
            </button>
            <button
              onClick={() => setSelectedType('full-time')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === 'full-time' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full-Time Clinical
            </button>
            <button
              onClick={() => setSelectedType('fellowship')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === 'fellowship' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fellowships
            </button>
            <button
              onClick={() => setSelectedType('internship')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === 'internship' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Internships
            </button>
            <button
              onClick={() => setSelectedType('academic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === 'academic' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty / Academic
            </button>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpps.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            {opportunities.length === 0 ? 'No opportunities yet. Post the first one.' : 'No opportunities match your search.'}
          </div>
        )}
        {filteredOpps.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-5"
          >
            <div className="flex items-start gap-4 flex-1">
              <Avatar src={opp.logo} name={opp.organization} className="w-12 h-12 rounded-xl border border-slate-200" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    {opp.title}
                  </h2>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {opp.type}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700">
                  {opp.organization} · <span className="font-normal text-slate-500">{opp.location}</span>
                </p>

                {/* Compensation & Experience row */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 pt-1">
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {opp.stipendOrSalary}
                  </span>
                  <span className="text-slate-500">Exp: {opp.experienceRequired}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{opp.locationType}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {opp.description}
                </p>

                {/* Requirements */}
                {opp.requirements.length > 0 && <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Requirements
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 list-disc list-inside">
                    {opp.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>}

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2">
                  <span>Posted {opp.postedDate}</span>
                  <span>·</span>
                  <span>{opp.applicantsCount} {opp.applicantsCount === 1 ? 'applicant' : 'applicants'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="self-end sm:self-start shrink-0 flex flex-col items-end gap-2">
              {opp.createdBy === currentUser.id ? (
                <>
                  <button
                    onClick={() => setViewingApplicants(opp)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <Users className="w-3.5 h-3.5" /> Applicants ({opp.applicantsCount})
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this opportunity?')) onDelete(opp.id); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              ) : opp.hasApplied ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" /> Applied
                </span>
              ) : (
                <button
                  onClick={() => onApply(opp)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" /> Apply
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
