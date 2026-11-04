import React, { useState } from 'react';
import { Post, UserProfile, PostComment } from '../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Image as ImageIcon, 
  Stethoscope, 
  GraduationCap, 
  BookOpen, 
  Filter,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface FeedViewProps {
  posts: Post[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenCreateModal: () => void;
  onViewProfile: (userId?: string) => void;
  onViewOpportunities: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  currentUser,
  onLikePost,
  onBookmarkPost,
  onAddComment,
  onOpenCreateModal,
  onViewProfile,
  onViewOpportunities,
}) => {
  const [filter, setFilter] = useState<'all' | 'case_study' | 'research' | 'student_case'>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    post_1: true, // open first post's discussion by default for instant engagement
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const filteredPosts = posts.filter((p) => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      
      {/* LEFT COLUMN (Desktop): Quick User Snapshot & Clinical Shortcuts */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-16 bg-gradient-to-r from-slate-900 to-blue-900 relative"></div>
          <div className="px-4 pb-4 pt-0 text-center relative -mt-8">
            <button
              onClick={() => onViewProfile()}
              className="inline-block relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mx-auto"
                referrerPolicy="no-referrer"
              />
              {currentUser.verifiedStatus === 'verified' && (
                <ShieldCheck className="w-4 h-4 text-teal-600 bg-white rounded-full absolute bottom-0 right-0" />
              )}
            </button>

            <h3 
              onClick={() => onViewProfile()} 
              className="text-sm font-bold text-slate-900 font-display mt-2 hover:text-blue-700 transition-colors cursor-pointer"
            >
              {currentUser.name}
            </h3>
            
            <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
              {currentUser.headline}
            </p>

            {/* Currently Working / Enrolled Snippet */}
            <div className="mt-3 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-100 text-left text-[11px]">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {currentUser.accountType === 'student' ? 'Current Enrolment:' : 'Current Position:'}
              </span>
              <span className="font-semibold text-slate-800 line-clamp-1 mt-0.5">
                {currentUser.accountType === 'student' ? (currentUser.college || 'Manipal College') : (currentUser.currentPosition || 'Consultant PT')}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Connections</span>
              <span className="font-semibold text-blue-700">{currentUser.connectionsCount}</span>
            </div>
          </div>
        </div>

        {/* Clinical Channels */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-2.5">
          <span className="font-bold text-slate-900 font-display block uppercase tracking-wider text-[10px] text-slate-400">
            Specialization Channels
          </span>
          <div className="space-y-1 text-slate-600">
            <button 
              onClick={() => setFilter('case_study')}
              className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Orthopedics & Joint Rehab</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">1.2k</span>
            </button>
            <button 
              onClick={() => setFilter('research')}
              className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Neurological & Stroke Recovery</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">840</span>
            </button>
            <button 
              onClick={() => setFilter('case_study')}
              className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Sports & Athletic Performance</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">650</span>
            </button>
            <button 
              onClick={() => setFilter('student_case')}
              className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-50 hover:text-teal-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Pediatrics & Sensory NDT</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">490</span>
            </button>
            <button 
              onClick={() => setFilter('student_case')}
              className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-slate-50 hover:text-teal-700 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Student Case Presentations</span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">New</span>
            </button>
          </div>
        </div>

      </div>

      {/* CENTRAL COLUMN: Post Composer, Feed Filter Tabs & Post Stream */}
      <div className="lg:col-span-6 space-y-4">
        
        {/* 1. LinkedIn-Style Post Trigger Box */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onOpenCreateModal}
              className="flex-1 text-left bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Share a clinical case, research finding, or student milestone...
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Clinical Case</span>
              <span className="sm:hidden">Case</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Research Paper</span>
              <span className="sm:hidden">Paper</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Student Log</span>
              <span className="sm:hidden">Student</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Feed Filter Tabs (Buttons with click handlers) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Updates
          </button>

          <button
            onClick={() => setFilter('case_study')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'case_study'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinical Cases
          </button>

          <button
            onClick={() => setFilter('research')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'research'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Research Publications
          </button>

          <button
            onClick={() => setFilter('student_case')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'student_case'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Corner
          </button>
        </div>

        {/* 3. Post Feed Stream */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
            >
              
              {/* Author Header Row */}
              <div className="p-4 sm:p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer">
                          {post.authorName}
                        </span>
                        <span title="Council Verified">
                          <ShieldCheck className="w-4 h-4 text-teal-600 inline shrink-0" />
                        </span>
                        <span className="text-[11px] text-slate-400">· {post.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{post.authorHeadline}</p>
                    </div>
                  </div>

                  {/* Clean unboxed tag badge */}
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {post.type === 'case_study' ? 'Clinical Case' : post.type === 'research' ? 'Research Paper' : 'Student Log'}
                  </span>
                </div>

                {/* Post Title */}
                <h2 className="text-base font-bold text-slate-900 font-display mt-3 leading-snug">
                  {post.title}
                </h2>

                {/* Post Body Content */}
                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Clinical Metrics Strip (Zero-Pill Discipline: Clean tabular figures) */}
                {post.clinicalMetrics && post.clinicalMetrics.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {post.clinicalMetrics.map((metric, idx) => (
                      <div key={idx} className="text-left">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-tight">
                          {metric.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hashtags as clean text */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-blue-700 font-medium mt-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Image Attachment (if present) */}
              {post.imageUrl && (
                <div className="w-full max-h-96 overflow-hidden bg-slate-100 border-t border-b border-slate-100">
                  <img
                    src={post.imageUrl}
                    alt="Clinical case documentation"
                    className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Document Download Strip (if present) */}
              {post.documentName && (
                <div className="mx-4 my-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold truncate max-w-[240px]">{post.documentName}</span>
                  </div>
                  <button 
                    onClick={() => alert(`Simulating download of ${post.documentName}`)}
                    className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] underline cursor-pointer"
                  >
                    Download Protocol PDF
                  </button>
                </div>
              )}

              {/* Interaction Bar: Likes, Comments, Share, Bookmark */}
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-4 sm:gap-6">
                  
                  {/* Like Button */}
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                      post.isLiked ? 'text-rose-600 font-bold bg-rose-50' : 'hover:text-rose-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                    <span className="font-mono tabular-nums">{post.likesCount}</span>
                    <span className="hidden sm:inline">Likes</span>
                  </button>

                  {/* Comment Toggle */}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:text-blue-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-mono tabular-nums">{post.commentsCount}</span>
                    <span className="hidden sm:inline">Comments</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Case discussion link copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Share with peer network"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                </div>

                {/* Bookmark Button */}
                <button
                  onClick={() => onBookmarkPost(post.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    post.isBookmarked ? 'text-teal-700 bg-teal-50' : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                  title="Save to Clinical Library"
                >
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-teal-700' : ''}`} />
                </button>
              </div>

              {/* Expandable Comments & Peer Discussion Section */}
              {expandedComments[post.id] && (
                <div className="bg-slate-50/70 p-4 border-t border-slate-100 space-y-3">
                  
                  {/* New Comment Input */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2">
                    <img
                      src={currentUser.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Add your clinical insight or question..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="w-full bg-white text-xs border border-slate-200 rounded-xl pl-3 pr-10 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1.5 p-1 text-blue-700 hover:text-blue-900 disabled:opacity-30 cursor-pointer"
                        disabled={!commentInputs[post.id]?.trim()}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  {/* Existing Comments List */}
                  <div className="space-y-2.5 pt-1">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                        <img
                          src={comment.authorAvatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900">{comment.authorName}</span>
                            <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{comment.authorHeadline}</p>
                          <p className="text-slate-700 mt-1.5 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </article>
          ))}
        </div>

      </div>

      {/* RIGHT COLUMN (Desktop): Trending Clinical Topics & Job Opportunities */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        
        {/* Trending Clinical Insights */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 font-display">Trending in Physiotherapy</h3>
          </div>

          <div className="space-y-2.5 text-slate-700">
            <div className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Clinical Guideline</span>
              <p className="font-semibold text-slate-900 hover:text-blue-700 mt-0.5">
                ICMR 2026 Stroke Rehabilitation Early Ambulation Standards
              </p>
              <span className="text-[10px] text-slate-500">328 clinicians discussing</span>
            </div>

            <div className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="text-[10px] text-teal-700 font-semibold block uppercase">Conference Alert</span>
              <p className="font-semibold text-slate-900 hover:text-blue-700 mt-0.5">
                Indian Association of Physiotherapists (IAP) Annual Conclave
              </p>
              <span className="text-[10px] text-slate-500">Call for paper abstracts</span>
            </div>

            <div className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="text-[10px] text-indigo-700 font-semibold block uppercase">Technology</span>
              <p className="font-semibold text-slate-900 hover:text-blue-700 mt-0.5">
                Digital Goniometry vs Visual Estimation in Knee ACL Rehab
              </p>
              <span className="text-[10px] text-slate-500">89 case reviews</span>
            </div>
          </div>
        </div>

        {/* Featured Opportunities Preview */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-display">Featured Opportunities</h3>
            <button 
              onClick={onViewOpportunities}
              className="text-blue-700 hover:underline font-semibold text-[11px]"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Lead Sports Physiotherapist</p>
              <p className="text-slate-500 text-[11px]">National High Performance Center · Bengaluru</p>
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                ₹75,000 – ₹1,00,000 / mo
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900">Rotatory PT Internship (BPT)</p>
              <p className="text-slate-500 text-[11px]">Fortis Hospital · Gurugram / Delhi</p>
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                ₹16,500 / mo Stipend
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
