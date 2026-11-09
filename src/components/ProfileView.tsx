import React from 'react';
import { Pencil, LogOut, Smartphone, MapPin, Building2, GraduationCap, ShieldCheck, Plus, Briefcase, Award, UserPlus, Check, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import type { Connection, Post, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { profileTagLabel } from '../imageUtil';

interface ProfileViewProps {
  user: UserProfile;
  currentUser: UserProfile;
  isOwn: boolean;
  posts: Post[];
  connectionStatus?: Connection['status'];
  onEditProfile: () => void;
  onOpenPhone: () => void;
  onSignOut: () => void;
  onBack: () => void;
  onConnect: (userId: string) => void;
  onAcceptConnection: (userId: string) => void;
  onMessage: (user: UserProfile) => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenCreateModal: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; onEdit?: () => void }> = ({ title, children, onEdit }) => (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-slate-900 font-display">{title}</h2>
      {onEdit && (
        <button onClick={onEdit} aria-label={`Edit ${title}`} className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer">
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
    {children}
  </section>
);

const AddLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-sm text-blue-700 font-medium hover:underline cursor-pointer">{children}</button>
);

const dates = (a?: string, b?: string, current?: boolean) => [a, current ? 'Present' : b].filter(Boolean).join(' – ');

export const ProfileView: React.FC<ProfileViewProps> = ({
  user, currentUser, isOwn, posts, connectionStatus, onEditProfile, onOpenPhone, onSignOut, onBack, onConnect, onAcceptConnection, onMessage,
  onLikePost, onBookmarkPost, onAddComment, onDeletePost, onOpenCreateModal,
}) => {
  const tag = profileTagLabel(user.accountType);
  const experiences = user.experiences || [];
  const education = user.education || [];
  const certs = user.certifications || [];
  const skills = user.skills || [];
  const workLine = [user.currentPosition, user.currentCompany].filter(Boolean).join(' · ');
  const edit = isOwn ? onEditProfile : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {!isOwn && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {/* Top card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 sm:h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-12 sm:-mt-14">
            <Avatar src={user.avatar} name={user.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow text-3xl bg-white" />
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 font-display">{user.name}</h1>
              {user.verifiedStatus === 'verified' && <ShieldCheck className="w-5 h-5 text-teal-600" aria-label="Verified" />}
              {tag ? (
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{tag}</span>
              ) : isOwn ? (
                <button onClick={onEditProfile} className="text-[11px] font-semibold text-blue-700 border border-dashed border-blue-300 hover:bg-blue-50 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add tag
                </button>
              ) : null}
            </div>
            {user.headline && <p className="text-sm text-slate-700 mt-1">{user.headline}</p>}
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-500 mt-2">
              {workLine && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{workLine}</span>}
              {user.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.location}</span>}
              {user.openToWork && <span className="flex items-center gap-1 text-emerald-700 font-semibold"><Briefcase className="w-3.5 h-3.5" />Open to opportunities</span>}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <b className="text-slate-800">{user.connectionsCount}</b> {user.connectionsCount === 1 ? 'connection' : 'connections'} · <b className="text-slate-800">{posts.length}</b> {posts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            {isOwn ? (
              <>
                <button onClick={onEditProfile} className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-full cursor-pointer transition-colors">
                  <Pencil className="w-4 h-4" /> Edit profile
                </button>
                <button onClick={onSignOut} className="flex items-center gap-1.5 border border-slate-300 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-sm font-semibold px-5 py-2 rounded-full cursor-pointer transition-colors">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            ) : (
              <>
                {connectionStatus === 'connected' && (
                  <span className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold px-5 py-2 rounded-full"><Check className="w-4 h-4" /> Connected</span>
                )}
                {connectionStatus === 'requested' && (
                  <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-sm font-semibold px-5 py-2 rounded-full"><Clock className="w-4 h-4" /> Request sent</span>
                )}
                {connectionStatus === 'pending' && (
                  <button onClick={() => onAcceptConnection(user.id)} className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-full cursor-pointer"><Check className="w-4 h-4" /> Accept request</button>
                )}
                {(connectionStatus === 'suggestion' || !connectionStatus) && (
                  <button onClick={() => onConnect(user.id)} className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-full cursor-pointer"><UserPlus className="w-4 h-4" /> Connect</button>
                )}
                <button onClick={() => onMessage(user)} className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2 rounded-full cursor-pointer">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {(isOwn || user.about) && (
        <Section title="About" onEdit={edit}>
          {user.about ? <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{user.about}</p> : <AddLink onClick={onEditProfile}>Add something about yourself</AddLink>}
        </Section>
      )}

      {/* Experience */}
      {(isOwn || experiences.length > 0) && (
        <Section title="Experience" onEdit={edit}>
          {experiences.length ? (
            <ul className="space-y-4">
              {experiences.map((x) => (
                <li key={x.id} className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{x.title}</p>
                    {x.company && <p className="text-xs text-slate-600">{x.company}</p>}
                    {dates(x.startDate, x.endDate, x.isCurrent) && <p className="text-xs text-slate-400">{dates(x.startDate, x.endDate, x.isCurrent)}</p>}
                    {x.description && <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap break-words">{x.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <AddLink onClick={onEditProfile}>Add experience</AddLink>}
        </Section>
      )}

      {/* Education */}
      {(isOwn || education.length > 0) && (
        <Section title="Education" onEdit={edit}>
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
          ) : <AddLink onClick={onEditProfile}>Add education</AddLink>}
        </Section>
      )}

      {/* Certifications */}
      {(isOwn || certs.length > 0) && (
        <Section title="Licenses & certifications" onEdit={edit}>
          {certs.length ? (
            <ul className="space-y-3">
              {certs.map((c) => (
                <li key={c.id} className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    {c.issuer && <p className="text-xs text-slate-600">{c.issuer}</p>}
                    {c.issueDate && <p className="text-xs text-slate-400">{c.issueDate}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <AddLink onClick={onEditProfile}>Add a license or certificate</AddLink>}
        </Section>
      )}

      {/* Skills */}
      {(isOwn || skills.length > 0) && (
        <Section title="Skills" onEdit={edit}>
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => <span key={s.name} className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">{s.name}</span>)}
            </div>
          ) : <AddLink onClick={onEditProfile}>Add skills</AddLink>}
        </Section>
      )}

      {/* Account security (only you see this) */}
      {isOwn && (
        <Section title="Account">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <Smartphone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Mobile number</p>
                {user.phoneVerified ? (
                  <p className="text-xs text-slate-500">{user.phoneMasked} · <span className="text-teal-700 font-semibold">Verified</span> · used to reset your password</p>
                ) : (
                  <p className="text-xs text-slate-500">Add and verify your number so you can reset your password if you forget it. Only you can see it.</p>
                )}
              </div>
            </div>
            <button onClick={onOpenPhone} className="text-xs font-semibold border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-full cursor-pointer">
              {user.phoneVerified ? 'Change' : 'Add & verify'}
            </button>
          </div>
        </Section>
      )}

      {/* Posts */}
      <Section title="Posts">
        {posts.length === 0 ? (
          isOwn ? <AddLink onClick={onOpenCreateModal}>Share your first post</AddLink> : <p className="text-sm text-slate-500">No posts yet.</p>
        ) : (
          <div className="space-y-4 -mx-1">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} currentUser={currentUser} onLike={onLikePost} onBookmark={onBookmarkPost} onAddComment={onAddComment} onDelete={onDeletePost} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};
