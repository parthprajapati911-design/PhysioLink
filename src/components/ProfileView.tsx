import React from 'react';
import { Pencil, LogOut, MapPin, Building2, GraduationCap, ShieldCheck, Plus, Briefcase } from 'lucide-react';
import type { Post, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { profileTagLabel } from '../imageUtil';

interface ProfileViewProps {
  user: UserProfile;
  posts: Post[];
  onEditProfile: () => void;
  onSignOut: () => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenCreateModal: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-slate-900 font-display">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export const ProfileView: React.FC<ProfileViewProps> = ({
  user, posts, onEditProfile, onSignOut, onLikePost, onBookmarkPost, onAddComment, onDeletePost, onOpenCreateModal,
}) => {
  const tag = profileTagLabel(user.accountType);
  const education = user.education || [];
  const skills = user.skills || [];
  const workLine = [user.currentPosition, user.currentCompany].filter(Boolean).join(' · ');

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600" />
        <div className="px-5 pb-5">
          <div className="-mt-12 sm:-mt-14 flex items-end justify-between">
            <Avatar src={user.avatar} name={user.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow text-3xl" />
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 font-display">{user.name}</h1>
              {user.verifiedStatus === 'verified' && <ShieldCheck className="w-4.5 h-4.5 text-teal-600" aria-label="Verified" />}
              {tag ? (
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{tag}</span>
              ) : (
                <button onClick={onEditProfile} className="text-[11px] font-semibold text-blue-700 border border-dashed border-blue-300 hover:bg-blue-50 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add tag
                </button>
              )}
            </div>
            {user.headline && <p className="text-sm text-slate-700 mt-1">{user.headline}</p>}
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-500 mt-2">
              {workLine && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{workLine}</span>}
              {user.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.location}</span>}
              {user.openToWork && <span className="flex items-center gap-1 text-emerald-700 font-semibold"><Briefcase className="w-3.5 h-3.5" />Open to opportunities</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <button onClick={onEditProfile} className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-full cursor-pointer transition-colors">
              <Pencil className="w-4 h-4" /> Edit profile
            </button>
            <button onClick={onSignOut} className="flex items-center gap-1.5 border border-slate-300 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-sm font-semibold px-5 py-2 rounded-full cursor-pointer transition-colors">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <Section title="About" action={<button onClick={onEditProfile} aria-label="Edit about" className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"><Pencil className="w-4 h-4" /></button>}>
        {user.about ? (
          <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{user.about}</p>
        ) : (
          <button onClick={onEditProfile} className="text-sm text-blue-700 font-medium hover:underline cursor-pointer">Add something about yourself</button>
        )}
      </Section>

      {/* Education */}
      <Section title="Education" action={<button onClick={onEditProfile} aria-label="Edit education" className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"><Pencil className="w-4 h-4" /></button>}>
        {education.length ? (
          <ul className="space-y-3">
            {education.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{e.school}</p>
                  {e.degree && <p className="text-xs text-slate-600">{e.degree}</p>}
                  {(e.startYear || e.endYear) && <p className="text-xs text-slate-400">{[e.startYear, e.endYear].filter(Boolean).join(' – ')}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <button onClick={onEditProfile} className="text-sm text-blue-700 font-medium hover:underline cursor-pointer">Add education</button>
        )}
      </Section>

      {/* Skills */}
      <Section title="Skills" action={<button onClick={onEditProfile} aria-label="Edit skills" className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"><Pencil className="w-4 h-4" /></button>}>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.name} className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">{s.name}</span>
            ))}
          </div>
        ) : (
          <button onClick={onEditProfile} className="text-sm text-blue-700 font-medium hover:underline cursor-pointer">Add skills</button>
        )}
      </Section>

      {/* Posts */}
      <Section title="Posts">
        {posts.length === 0 ? (
          <button onClick={onOpenCreateModal} className="text-sm text-blue-700 font-medium hover:underline cursor-pointer">Share your first post</button>
        ) : (
          <div className="space-y-4 -mx-1">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} currentUser={user} onLike={onLikePost} onBookmark={onBookmarkPost} onAddComment={onAddComment} onDelete={onDeletePost} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};
