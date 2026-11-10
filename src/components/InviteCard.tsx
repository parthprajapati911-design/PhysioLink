import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';

// Lets a member invite colleagues and classmates (WhatsApp, share sheet or copy link).
export const InviteCard: React.FC<{ name: string; compact?: boolean }> = ({ name, compact }) => {
  const [copied, setCopied] = useState(false);
  const link = window.location.origin;
  const text = `${name.split(' ')[0] || 'A colleague'} invited you to PhysioLink, the professional network for physiotherapists. Join here: ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', link);
    }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'PhysioLink', text, url: link }); return; } catch { /* cancelled */ }
    }
    copy();
  };

  return (
    <div className={`bg-gradient-to-br from-blue-700 to-teal-600 text-white rounded-2xl shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <h3 className="text-sm font-bold font-display">Invite your colleagues</h3>
      <p className="text-xs text-blue-50/90 mt-1 leading-snug">
        PhysioLink grows with your friends, classmates and teachers. Invite them to join and connect.
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-white text-blue-800 hover:bg-blue-50 text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
        <button onClick={share} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button onClick={copy} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
};
