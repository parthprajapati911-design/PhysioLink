import React, { useState } from 'react';
import { Connection, UserProfile } from '../types';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Search, 
  MapPin, 
  Building, 
  ShieldCheck, 
  Check, 
  X,
  Filter,
  MessageSquare
} from 'lucide-react';

interface NetworkViewProps {
  connections: Connection[];
  currentUser: UserProfile;
  onAcceptConnection: (id: string) => void;
  onIgnoreConnection: (id: string) => void;
  onConnectRequest: (id: string) => void;
  onOpenChatWithUser?: (userId: string, name: string, headline: string, avatar: string, verified: boolean) => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  connections,
  currentUser,
  onAcceptConnection,
  onIgnoreConnection,
  onConnectRequest,
  onOpenChatWithUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const pendingRequests = connections.filter((c) => c.status === 'pending');
  const suggestions = connections.filter((c) => c.status !== 'pending');

  const filteredSuggestions = suggestions.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedSpecialty === 'all') return matchesSearch;
    if (selectedSpecialty === 'student') return matchesSearch && c.accountType === 'student';
    return matchesSearch && c.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Network Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Physiotherapy Professional Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with clinical specialists, academic mentors, and peer students across India.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-center">
            <span className="block font-bold text-base font-mono tabular-nums">{currentUser.connectionsCount}</span>
            <span className="text-[11px] text-blue-700">Connections</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 text-center">
            <span className="block font-bold text-base font-mono tabular-nums">{pendingRequests.length}</span>
            <span className="text-[11px] text-teal-700">Invitations</span>
          </div>
        </div>
      </div>

      {/* 1. Pending Connection Invitations */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span>Pending Connection Invitations ({pendingRequests.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{req.name}</span>
                      {req.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                      <span className="text-[11px] text-slate-400">· {req.location}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{req.headline}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {req.mutualCount} mutual clinical connections
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onIgnoreConnection(req.id)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => onAcceptConnection(req.id)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Search & Specialty Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, hospital, college, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSpecialty === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSpecialty('orthopedics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSpecialty === 'orthopedics' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orthopedics
            </button>
            <button
              onClick={() => setSelectedSpecialty('neuro')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSpecialty === 'neuro' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Neuro
            </button>
            <button
              onClick={() => setSelectedSpecialty('sports')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSpecialty === 'sports' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sports
            </button>
            <button
              onClick={() => setSelectedSpecialty('pediatric')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSpecialty === 'pediatric' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pediatrics
            </button>
            <button
              onClick={() => setSelectedSpecialty('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSpecialty === 'student' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Students & Interns
            </button>
          </div>
        </div>
      </div>

      {/* 3. Suggested Professionals Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 font-display mb-3">
          People You May Know in Physiotherapy ({filteredSuggestions.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuggestions.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all text-center"
            >
              <div>
                <div className="relative inline-block mx-auto mb-3">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  {person.verified && (
                    <ShieldCheck className="w-4 h-4 text-teal-600 bg-white rounded-full absolute bottom-0 right-0 shadow" />
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer">
                  {person.name}
                </h3>
                
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {person.headline}
                </p>

                <div className="mt-3 py-1.5 px-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 flex items-center justify-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{person.institution}</span>
                </div>

                <p className="text-[10px] text-slate-400 mt-2">
                  {person.mutualCount} mutual connections
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {person.status === 'connected' ? (
                  <button
                    onClick={() => onOpenChatWithUser?.(person.id, person.name, person.headline, person.avatar, person.verified)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-blue-700 text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                    <span>Message</span>
                  </button>
                ) : person.status === 'requested' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold cursor-default"
                  >
                    <span>Request sent</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onConnectRequest(person.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
