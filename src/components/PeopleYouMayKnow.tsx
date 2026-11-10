import React from 'react';
import { UserPlus, Clock, ShieldCheck } from 'lucide-react';
import type { Connection } from '../types';
import { Avatar } from './Avatar';

interface Props {
  connections: Connection[];
  onConnect: (id: string) => void;
  onViewProfile: (id: string) => void;
  onSeeAll: () => void;
  limit?: number;
}

// Small "People you may know" card for the feed. Shows nothing when there is nobody to suggest.
export const PeopleYouMayKnow: React.FC<Props> = ({ connections, onConnect, onViewProfile, onSeeAll, limit = 4 }) => {
  const list = connections.filter((c) => c.status === 'suggestion' || c.status === 'requested').slice(0, limit);
  if (list.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-900 font-display mb-3">People you may know</h3>
      <ul className="space-y-3">
        {list.map((p) => (
          <li key={p.id} className="flex items-start gap-3">
            <button onClick={() => onViewProfile(p.id)} aria-label={`View ${p.name}`} className="cursor-pointer">
              <Avatar src={p.avatar} name={p.name} className="w-10 h-10 rounded-full" />
            </button>
            <div className="min-w-0 flex-1">
              <button onClick={() => onViewProfile(p.id)} className="flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-blue-700 cursor-pointer max-w-full">
                <span className="truncate">{p.name}</span>
                {p.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
              </button>
              <p className="text-[11px] text-slate-500 line-clamp-1">{p.headline || p.institution || 'PhysioLink member'}</p>
              {p.reasons && p.reasons.length > 0 && <p className="text-[10px] text-teal-700 font-medium mt-0.5">{p.reasons[0]}</p>}
              {p.status === 'requested' ? (
                <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-slate-500"><Clock className="w-3 h-3" /> Request sent</span>
              ) : (
                <button
                  onClick={() => onConnect(p.id)}
                  className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-blue-700 border border-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={onSeeAll} className="mt-3 text-xs font-semibold text-slate-600 hover:text-blue-700 cursor-pointer">See all suggestions →</button>
    </div>
  );
};
