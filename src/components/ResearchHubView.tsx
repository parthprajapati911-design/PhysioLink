import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  BookOpen, 
  Microscope, 
  Users, 
  ExternalLink, 
  FileText, 
  Download, 
  MessageSquare, 
  Share2, 
  Plus, 
  Search,
  CheckCircle2
} from 'lucide-react';

interface ResearchHubViewProps {
  currentUser: UserProfile;
  onOpenCreateStudy: () => void;
}

export const ResearchHubView: React.FC<ResearchHubViewProps> = ({
  currentUser,
  onOpenCreateStudy,
}) => {
  const [activeTab, setActiveTab] = useState<'journal_club' | 'collaborations' | 'preprints'>('journal_club');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Physiotherapy Research & Academic Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Collaborative multicenter trials, peer journal club critiques, and open clinical preprints.
          </p>
        </div>

        <button
          onClick={onOpenCreateStudy}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Clinical Trial / Paper</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('journal_club')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'journal_club' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Monthly Journal Club (Critical Appraisal)
        </button>
        <button
          onClick={() => setActiveTab('collaborations')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'collaborations' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Multi-Center Trial Collaborators Needed (3)
        </button>
        <button
          onClick={() => setActiveTab('preprints')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'preprints' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Clinical Trial Preprints & Guidelines
        </button>
      </div>

      {/* Tab 1: Journal Club */}
      {activeTab === 'journal_club' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                March 2026 Featured Paper
              </span>
              <span className="text-xs text-slate-400">Discussion Lead: Prof. Dr. Rajesh Patel</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 font-display">
              "Effect of High-Intensity Functional Electrical Stimulation vs Passive Mobilization in Acute Stroke ICU Patients"
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Published in PTJ Oxford (Physical Therapy). The authors evaluated early bed-cycle ergometry coupled with neuromuscular electrical stimulation (NMES) in 84 stroke patients within 72 hours of onset. Primary endpoint: ICU-acquired weakness (ICUAW) incidence at discharge.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">PTJ_Full_Open_Access_Paper.pdf (1.4 MB)</span>
              </div>
              <button 
                onClick={() => alert('Simulating PDF download of Journal Club paper.')}
                className="text-blue-700 hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={() => alert('Opening live Journal Club video/discussion forum.')}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Join Clinical Discussion Thread (42 Comments)
              </button>
              <button 
                onClick={() => alert('Discussion link copied.')}
                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share with Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Collaborator Finder */}
      {activeTab === 'collaborations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Seeking 2 Additional Hospital Sites (West & North India)
              </span>
              <span className="text-xs text-slate-400">ICMR Funded Trial #2026-PT-091</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 font-display">
              Multi-Center Trial: Brain-Computer Interface (BCI) Neurofeedback in Chronic Hemiplegic Hand Spasticity
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Principal Investigator: Prof. Dr. Rajesh Patel (National Neuroscience Institute). Looking for tertiary hospital physiotherapy departments equipped with EMG biofeedback and trained MPT Neurological clinicians to enroll 20 patients per site.
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Site Grant: ₹4,50,000 per participating hospital</span>
              <button 
                onClick={() => alert('Collaboration interest sent to Prof. Dr. Rajesh Patel!')}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Express Department Interest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preprints */}
      {activeTab === 'preprints' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Clinical Guidelines Preprint · Open Access
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Indian Clinical Practice Guidelines for Post-Arthroplasty Deep Vein Thrombosis (DVT) Prophylaxis & Mobilization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consensus statement drafted by the Indian Association of Physiotherapists (IAP) Orthopedic Special Interest Group. Outlines day-0 ambulation protocols, compression garment standards, and ankle-pump dosage.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-blue-700">
              <span className="font-mono">DOI: 10.1101/physiorxiv.2026.03.18.9812</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
