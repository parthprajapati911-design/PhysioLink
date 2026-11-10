import React, { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { Post, UserProfile, Connection } from '../types';
import { PeopleYouMayKnow } from './PeopleYouMayKnow';
import { InviteCard } from './InviteCard';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { WelcomeCard } from './WelcomeCard';
import { profileTagLabel, tagLabel } from '../imageUtil';

interface FeedViewProps {
  posts: Post[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenCreateModal: () => void;
  onViewProfile: (userId: string) => void;
  onEditProfile: () => void;
  onVerifyPhone: () => void;
  connections: Connection[];
  onConnect: (id: string) => void;
  onOpenNetwork: () => void;
}

const FILTERS = ['all', 'case', 'achievement', 'research', 'event', 'update', 'saved'] as const;

export const FeedView: React.FC<FeedViewProps> = ({
  posts, currentUser, onLikePost, onBookmarkPost, onAddComment, onDeletePost, onOpenCreateModal, onViewProfile, onEditProfile, onVerifyPhone, connections, onConnect, onOpenNetwork,
}) => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const visible =
    filter === 'all' ? posts
    : filter === 'saved' ? posts.filter((p) => p.isBookmarked)
    : posts.filter((p) => tagLabel(p.type).toLowerCase() === filter);
  const myPostsCount = posts.filter((p) => p.authorId === currentUser.id).length;
  const myTag = profileTagLabel(currentUser.accountType);
  const invites = connections.filter((c) => c.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
      {/* Small profile card (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-blue-700 to-teal-600" />
          <div className="px-4 pb-4 -mt-8 text-center">
            <button onClick={() => onViewProfile(currentUser.id)} className="cursor-pointer">
              <Avatar src={currentUser.avatar} name={currentUser.name} className="w-16 h-16 rounded-full border-4 border-white shadow text-xl mx-auto" />
            </button>
            <button onClick={() => onViewProfile(currentUser.id)} className="mt-2 text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer block w-full truncate">
              {currentUser.name}
            </button>
            {myTag && <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{myTag}</span>}
            {currentUser.headline && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{currentUser.headline}</p>}
          </div>
          <button onClick={onOpenNetwork} className="w-full flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs hover:bg-slate-50 cursor-pointer">
            <span className="text-slate-600">Connections</span>
            <span className="font-bold text-blue-700">{currentUser.connectionsCount}</span>
          </button>
          {invites > 0 && (
            <button onClick={onOpenNetwork} className="w-full flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs bg-rose-50/60 hover:bg-rose-50 cursor-pointer">
              <span className="text-rose-800 font-semibold">Pending invitations</span>
              <span className="font-bold text-rose-700">{invites}</span>
            </button>
          )}
        </div>
        <PeopleYouMayKnow connections={connections} onConnect={onConnect} onViewProfile={onViewProfile} onSeeAll={onOpenNetwork} />
        <InviteCard name={currentUser.name} compact />
        </div>
      </aside>

      <div className="space-y-4 min-w-0">
        <WelcomeCard user={currentUser} postsCount={myPostsCount} onEditProfile={onEditProfile} onCreatePost={onOpenCreateModal} onVerifyPhone={onVerifyPhone} />

        {invites > 0 && (
          <button onClick={onOpenNetwork} className="lg:hidden w-full text-left bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl px-4 py-3 cursor-pointer">
            You have {invites} connection {invites === 1 ? 'request' : 'requests'}. Tap to review.
          </button>
        )}
        <div className="lg:hidden">
          <PeopleYouMayKnow connections={connections} onConnect={onConnect} onViewProfile={onViewProfile} onSeeAll={onOpenNetwork} limit={3} />
        </div>

        {/* Start a post */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <Avatar src={currentUser.avatar} name={currentUser.name} className="w-11 h-11 rounded-full" />
          <button
            onClick={onOpenCreateModal}
            className="flex-1 text-left text-sm text-slate-500 border border-slate-300 hover:bg-slate-50 rounded-full px-4 py-2.5 cursor-pointer transition-colors"
          >
            Start a post
          </button>
          <button onClick={onOpenCreateModal} aria-label="Add photo" className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer">
            <ImagePlus className="w-5 h-5" />
          </button>
        </div>

        {/* Tag filter */}
        {posts.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer transition-colors ${
                  filter === f ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                {f === 'all' ? 'All' : f === 'saved' ? 'Saved' : tagLabel(f)}
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            {posts.length === 0 ? 'No posts yet. Be the first to post.' : filter === 'saved' ? 'You have not saved any posts yet.' : 'No posts with this tag.'}
          </div>
        ) : (
          visible.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={onLikePost}
              onBookmark={onBookmarkPost}
              onAddComment={onAddComment}
              onDelete={onDeletePost}
              onViewProfile={onViewProfile}
            />
          ))
        )}
      </div>
    </div>
  );
};
