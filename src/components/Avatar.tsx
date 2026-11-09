import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string; // size / shape classes, e.g. "w-10 h-10 rounded-full"
}

// Shows the photo, or the person's initials when there is no photo (or it cannot be loaded).
export const Avatar: React.FC<AvatarProps> = ({ src, name = '', className = 'w-10 h-10 rounded-full' }) => {
  const [failed, setFailed] = useState<string | null>(null);
  if (src && failed !== src) {
    return <img src={src} alt={name} onError={() => setFailed(src)} className={`${className} object-cover shrink-0`} referrerPolicy="no-referrer" />;
  }
  const initials = name.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  return (
    <div
      aria-label={name}
      className={`${className} shrink-0 bg-slate-200 text-slate-600 flex items-center justify-center font-semibold text-sm select-none overflow-hidden`}
    >
      {initials}
    </div>
  );
};
