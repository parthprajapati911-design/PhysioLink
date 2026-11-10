import React, { useEffect, useRef, useState } from 'react';
import { Bell, UserPlus, UserCheck, Heart, MessageCircle } from 'lucide-react';
import type { AppNotification } from '../types';
import { Avatar } from './Avatar';

interface Props {
  notifications: AppNotification[];
  onOpen: () => void; // called when the panel opens (marks everything as read)
  onPick: (n: AppNotification) => void;
}

const ICON: Record<string, React.ReactNode> = {
  connection_request: <UserPlus className="w-3 h-3" />,
  connection_accepted: <UserCheck className="w-3 h-3" />,
  like: <Heart className="w-3 h-3" />,
  comment: <MessageCircle className="w-3 h-3" />,
};

export const NotificationBell: React.FC<Props> = ({ notifications, onOpen, onPick }) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) onOpen();
  };

  return (
    <div ref={box} className="relative">
      <button
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-slate-900 font-display">Notifications</div>
          <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 px-4 py-8 text-center">Nothing yet. Connection requests, likes and comments will show up here.</p>
            ) : notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { setOpen(false); onPick(n); }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 cursor-pointer ${n.isRead ? '' : 'bg-blue-50/50'}`}
              >
                <span className="relative shrink-0">
                  <Avatar src={n.actorAvatar} name={n.actorName} className="w-10 h-10 rounded-full" />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center ring-2 ring-white">{ICON[n.type] || <Bell className="w-3 h-3" />}</span>
                </span>
                <span className="min-w-0 text-sm text-slate-700">
                  <b className="text-slate-900">{n.actorName}</b> {n.text}
                  <span className="block text-[11px] text-slate-400 mt-0.5">{n.timestamp}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
