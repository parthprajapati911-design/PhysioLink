import React, { useState } from 'react';
import { Connection, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { InviteCard } from './InviteCard';
import { Users, UserPlus, Search, Building, ShieldCheck, Check, MessageSquare, Clock, UserMinus } from 'lucide-react';

interface NetworkViewProps {
  connections: Connection[];
  currentUser: UserProfile;
  onAcceptConnection: (id: string) => void;
  onIgnoreConnection: (id: string) => void;
  onConnectRequest: (id: string) => void;
  onRemoveConnection: (id: string) => void;
  onViewProfile?: (userId: string) => void;
  onOpenChatWithUser?: (userId: string, name: string, headline: string, avatar: string, verified: boolean) => void;
}

type Tab = 'discover' | 'connections' | 'sent';

export const NetworkView: React.FC<NetworkViewProps> = ({
  connections, currentUser, onAcceptConnection, onIgnoreConnection, onConnectRequest, onRemoveConnection, onOpenChatWithUser, onViewProfile,
}) => {
  const [tab, setTab] = useState<Tab>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [group, setGroup] = useState<string>('all');

  const invites = connections.filter((c) => c.status === 'pending');
  const mine = connections.filter((c) => c.status === 'connected');
  const sent = connections.filter((c) => c.status === 'requested');
  const discover = connections.filter((c) => c.status === 'suggestion');

  const q = searchQuery.trim().toLowerCase();
  const matches = (c: Connection) =>
    (!q || [c.name, c.headline, c.institution, c.location, c.specialization].some((v) => (v || '').toLowerCase().includes(q))) &&
    (group === 'all' || c.accountType === group);

  const shown = (tab === 'discover' ? discover : tab === 'connections' ? mine : sent).filter(matches);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'connections', label: 'My connections', count: mine.length },
    { id: 'discover', label: 'Discover', count: discover.length },
    { id: 'sent', label: 'Sent', count: sent.length },
  ];
  const groups = [['all', 'All'], ['clinician', 'Clinicians'], ['academician', 'Academicians'], ['student', 'Students']];

  const name = (c: Connection) => (
    <button onClick={() => onViewProfile?.(c.id)} className="text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-left">{c.name}</button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Connections</h1>
          <p className="text-xs text-slate-500 mt-1">Connect with physiotherapists. Once they accept, you can message each other.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-center">
            <span className="block font-bold text-base tabular-nums">{mine.length}</span>
            <span className="text-[11px] text-blue-700">Connections</span>
          </div>
          <div className={`px-4 py-2.5 rounded-xl border text-center ${invites.length ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-teal-50 border-teal-100 text-teal-900'}`}>
            <span className="block font-bold text-base tabular-nums">{invites.length}</span>
            <span className={`text-[11px] ${invites.length ? 'text-rose-700' : 'text-teal-700'}`}>Requests</span>
          </div>
        </div>
      </div>

      {/* Invitations received */}
      {invites.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" /> Connection requests ({invites.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {invites.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <button onClick={() => onViewProfile?.(req.id)} aria-label={`View ${req.name}`} className="cursor-pointer shrink-0">
                    <Avatar src={req.avatar} name={req.name} className="w-12 h-12 rounded-full border border-slate-200" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {name(req)}
                      {req.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium">wants to connect with you</p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{req.headline}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{[req.location, req.mutualCount ? `${req.mutualCount} mutual` : ''].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button onClick={() => onIgnoreConnection(req.id)} className="px-4 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Ignore</button>
                  <button onClick={() => onAcceptConnection(req.id)} className="flex items-center gap-1 px-5 py-1.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer">
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteCard name={currentUser.name} />

      {/* Tabs + search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-colors ${tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t.label} <span className="text-slate-400 font-medium">({t.count})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, workplace, city or specialization"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {groups.map(([v, l]) => (
              <button
                key={v}
                onClick={() => setGroup(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap cursor-pointer ${group === v ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'discover' && shown.length > 0 && <h2 className="text-sm font-bold text-slate-900 font-display">People you may know</h2>}

      {shown.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          {tab === 'discover' && (discover.length === 0 ? 'No one new to suggest yet. Invite your colleagues so your network can grow.' : 'No one matches your search.')}
          {tab === 'connections' && (mine.length === 0 ? 'You have no connections yet. Send a few requests from Discover.' : 'No one matches your search.')}
          {tab === 'sent' && (sent.length === 0 ? 'No pending requests.' : 'No one matches your search.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors text-center">
              <div>
                <div className="relative inline-block mx-auto mb-3">
                  <button onClick={() => onViewProfile?.(p.id)} aria-label={`View ${p.name}`} className="cursor-pointer">
                    <Avatar src={p.avatar} name={p.name} className="w-16 h-16 rounded-full border-2 border-slate-100 shadow-sm text-lg" />
                  </button>
                  {p.verified && <ShieldCheck className="w-4 h-4 text-teal-600 bg-white rounded-full absolute bottom-0 right-0 shadow" />}
                </div>
                <h3>{name(p)}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug min-h-[28px]">{p.headline}</p>
                <div className="mt-3 py-1.5 px-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 flex items-center justify-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{p.institution || p.location || '—'}</span>
                </div>
                {tab === 'discover' && (
                  <p className="text-[10px] text-teal-700 font-medium mt-2 min-h-[14px]">{p.reasons && p.reasons.length ? p.reasons.join(' · ') : ''}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                {p.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => onOpenChatWithUser?.(p.id, p.name, p.headline, p.avatar, p.verified)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full border border-blue-700 text-blue-700 hover:bg-blue-50 text-xs font-semibold cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Remove ${p.name} from your connections?`)) onRemoveConnection(p.id); }}
                      aria-label={`Remove ${p.name}`}
                      title="Remove connection"
                      className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </>
                ) : p.status === 'requested' ? (
                  <button
                    onClick={() => onRemoveConnection(p.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Pending · Withdraw
                  </button>
                ) : (
                  <button
                    onClick={() => onConnectRequest(p.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full border border-blue-700 text-blue-700 hover:bg-blue-50 text-xs font-semibold cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
