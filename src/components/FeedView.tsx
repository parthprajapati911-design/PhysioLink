import React, { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { Post, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { profileTagLabel, tagLabel } from '../imageUtil';

interface FeedViewProps {
  posts: Post[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenCreateModal: () => void;
  onViewProfile: () => void;
}

const FILTERS = ['all', 'case', 'achievement', 'research', 'event', 'update'] as const;

export const FeedView: React.FC<FeedViewProps> = ({
  posts, currentUser, onLikePost, onBookmarkPost, onAddComment, onDeletePost, onOpenCreateModal, onViewProfile,
}) => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const visible = filter === 'all' ? posts : posts.filter((p) => tagLabel(p.type).toLowerCase() === filter);
  const myTag = profileTagLabel(currentUser.accountType);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
      {/* Small profile card (desktop) */}
      <aside className="hidden lg:block">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
          <div className="h-16 bg-gradient-to-r from-blue-700 to-teal-600" />
          <div className="px-4 pb-4 -mt-8 text-center">
            <button onClick={onViewProfile} className="cursor-pointer">
              <Avatar src={currentUser.avatar} name={currentUser.name} className="w-16 h-16 rounded-full border-4 border-white shadow text-xl mx-auto" />
            </button>
            <button onClick={onViewProfile} className="mt-2 text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer block w-full truncate">
              {currentUser.name}
            </button>
            {myTag && <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{myTag}</span>}
            {currentUser.headline && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{currentUser.headline}</p>}
          </div>
        </div>
      </aside>

      <div className="space-y-4 min-w-0">
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
                {f === 'all' ? 'All' : tagLabel(f)}
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            {posts.length === 0 ? 'No posts yet. Be the first to post.' : 'No posts with this tag.'}
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
            />
          ))
        )}
      </div>
    </div>
  );
};
