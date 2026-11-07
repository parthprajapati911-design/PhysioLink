import React, { useRef, useState } from 'react';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import { shrinkImage, TAG_LABELS } from '../imageUtil';
import type { PostTag } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; content: string; imageUrl?: string }) => Promise<unknown>;
}

const TAGS: PostTag[] = ['case', 'achievement', 'research', 'event', 'update'];

// Simple post: a photo (optional), a caption (optional), and one tag.
const PostForm: React.FC<Omit<CreatePostModalProps, 'isOpen'>> = ({ onClose, onSubmit }) => {
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState<PostTag>('update');
  const [photo, setPhoto] = useState<string | null>(null); // data URL preview
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    try {
      setPhoto(await shrinkImage(file));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const canPost = !busy && (caption.trim().length > 0 || !!photo);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;
    setBusy(true);
    setError(null);
    try {
      let imageUrl: string | undefined;
      if (photo) imageUrl = (await api.uploadImage(photo)).url;
      await onSubmit({ type: tag, content: caption.trim(), imageUrl });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">New post</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            maxLength={5000}
            rows={4}
            autoFocus
            className="w-full text-sm text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          />

          {photo ? (
            <div className="relative">
              <img src={photo} alt="Selected" className="w-full max-h-72 object-cover rounded-xl border border-slate-200" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                aria-label="Remove photo"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl py-6 text-sm font-medium text-slate-600 cursor-pointer transition-colors"
            >
              <ImagePlus className="w-5 h-5 text-slate-400" />
              <span>Add photo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="hidden" />

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Tag</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Post tag">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tag === t}
                  onClick={() => setTag(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    tag === t ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {TAG_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={!canPost}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors cursor-pointer"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Post</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, ...rest }) =>
  isOpen ? <PostForm {...rest} /> : null;
