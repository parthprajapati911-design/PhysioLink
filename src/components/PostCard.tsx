import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Trash2, ShieldCheck } from 'lucide-react';
import type { Post, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { tagLabel } from '../imageUtil';

interface PostCardProps {
  post: Post;
  currentUser: UserProfile;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onBookmark, onAddComment, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const mine = post.authorId === currentUser.id;

  const sendComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = comment.trim();
    if (!text) return;
    onAddComment(post.id, text);
    setComment('');
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <Avatar src={post.authorAvatar} name={post.authorName} className="w-11 h-11 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{post.authorName}</span>
            {post.authorVerified && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" aria-label="Verified" />}
            <span className="text-[10px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {tagLabel(post.type)}
            </span>
          </div>
          {post.authorHeadline && <p className="text-xs text-slate-500 line-clamp-1">{post.authorHeadline}</p>}
          <p className="text-[11px] text-slate-400 mt-0.5">{post.timestamp}</p>
        </div>
        {mine && (
          <button
            onClick={() => { if (window.confirm('Delete this post?')) onDelete(post.id); }}
            aria-label="Delete post"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {post.content && <p className="px-4 pb-3 text-sm text-slate-800 whitespace-pre-wrap break-words">{post.content}</p>}
      {post.imageUrl && <img src={post.imageUrl} alt="" loading="lazy" className="w-full max-h-[32rem] object-cover bg-slate-100" />}

      <div className="px-2 py-1.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => onLike(post.id)} aria-pressed={post.isLiked} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-50 ${post.isLiked ? 'text-rose-600' : 'text-slate-500'}`}>
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
            <span>{post.likesCount}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </button>
        </div>
        <button onClick={() => onBookmark(post.id)} aria-label="Save post" aria-pressed={post.isBookmarked} className={`px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer ${post.isBookmarked ? 'text-blue-700' : 'text-slate-500'}`}>
          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-blue-700' : ''}`} />
        </button>
      </div>

      {showComments && (
        <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/60">
          <form onSubmit={sendComment} className="flex items-center gap-2">
            <Avatar src={currentUser.avatar} name={currentUser.name} className="w-8 h-8 rounded-full text-xs" />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              maxLength={2000}
              className="flex-1 text-xs bg-white border border-slate-200 rounded-full px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button type="submit" disabled={!comment.trim()} className="text-xs font-semibold text-blue-700 disabled:text-slate-300 px-2 cursor-pointer disabled:cursor-not-allowed">Post</button>
          </form>
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar src={c.authorAvatar} name={c.authorName} className="w-8 h-8 rounded-full text-xs" />
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">{c.authorName} <span className="font-normal text-slate-400">· {c.timestamp}</span></p>
                <p className="text-xs text-slate-700 mt-0.5 whitespace-pre-wrap break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
