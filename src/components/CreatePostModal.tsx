import React, { useState } from 'react';
import { UserProfile, Post } from '../types';
import { X, Stethoscope, BookOpen, GraduationCap, Check, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface CreatePostModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<Post, 'id' | 'likesCount' | 'isLiked' | 'commentsCount' | 'comments' | 'bookmarksCount' | 'isBookmarked'>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<'case_study' | 'research' | 'student_case' | 'achievement'>('case_study');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['SportsPhysio', 'RehabProtocol']);
  const [metricLabel, setMetricLabel] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [metrics, setMetrics] = useState<{ label: string; value: string }[]>([
    { label: 'Patient Age', value: '24 yrs' },
    { label: 'Target ROM', value: '135° Flexion' },
  ]);

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddMetric = () => {
    if (metricLabel.trim() && metricValue.trim()) {
      setMetrics([...metrics, { label: metricLabel.trim(), value: metricValue.trim() }]);
      setMetricLabel('');
      setMetricValue('');
    }
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHeadline: currentUser.headline,
      authorAvatar: currentUser.avatar,
      authorVerified: currentUser.verifiedStatus === 'verified',
      accountType: currentUser.accountType,
      timestamp: 'Just now',
      type: type === 'achievement' ? 'general' : type,
      title: title.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['Physiotherapy'],
      clinicalMetrics: metrics.length > 0 ? metrics : undefined,
      documentName: type === 'research' ? 'Clinical_Study_Handout.pdf' : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Create Clinical Publication or Post</h2>
            <p className="text-xs text-slate-500">Share evidence-based findings, case outcomes, or student logs</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-sm">
          
          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Post Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('case_study')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  type === 'case_study'
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Clinical Case</span>
              </button>

              <button
                type="button"
                onClick={() => setType('research')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  type === 'research'
                    ? 'border-teal-600 bg-teal-50 text-teal-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Research Paper</span>
              </button>

              <button
                type="button"
                onClick={() => setType('student_case')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  type === 'student_case'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Log</span>
              </button>
            </div>
          </div>

          {/* Post Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Case / Publication Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 12-Week Rehabilitation Outcomes following Rotator Cuff Repair"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white text-xs border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Clinical Assessment & Intervention Details *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Detail the patient presentation, initial objective baseline, interventions (manual therapy, exercises, modalities), and outcome progression..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white text-xs border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Clinical Metrics Builder */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 block">
              Objective Clinical Metrics (Optional)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Metric (e.g. Knee ROM)"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                className="w-1/2 bg-white text-xs border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Value (e.g. 130° Flexion)"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                className="w-1/2 bg-white text-xs border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMetric}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>

            {metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {metrics.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{m.label}</span>
                      <span className="font-bold text-slate-900">{m.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Clinical Tags
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type tag (e.g. KneeArthroplasty) & press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-white text-xs border border-slate-200 rounded-xl p-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish Post</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
