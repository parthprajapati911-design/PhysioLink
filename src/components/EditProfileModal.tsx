import React, { useRef, useState } from 'react';
import { X, Camera, Plus, Trash2, Loader2 } from 'lucide-react';
import type { UserProfile, Education, Experience, Certification } from '../types';
import { api, errorMessage } from '../api';
import { Avatar } from './Avatar';
import { PROFILE_TAGS, shrinkImage } from '../imageUtil';

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}

const field =
  'w-full text-sm text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent';
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1">{children}</label>
);

const EditForm: React.FC<Omit<EditProfileModalProps, 'isOpen'>> = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState<UserProfile>(user);
  const [skillInput, setSkillInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setForm((f) => ({ ...f, [key]: value }));

  const coverRef = useRef<HTMLInputElement>(null);
  const pickImage = (field: 'avatar' | 'coverImage') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await shrinkImage(file, field === 'avatar' ? 600 : 1600, 0.85);
      const { url } = await api.uploadImage(dataUrl);
      set(field, url);
      setUploaded(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const education = form.education || [];
  const skills = form.skills || [];
  const updateEdu = (id: string, patch: Partial<Education>) =>
    set('education', education.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const addEdu = () =>
    set('education', [...education, { id: `edu_${Date.now()}`, school: '', degree: '', startYear: '', endYear: '' }]);
  const experiences = form.experiences || [];
  const certs = form.certifications || [];
  const updateExp = (id: string, patch: Partial<Experience>) => set('experiences', experiences.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addExp = () => set('experiences', [...experiences, { id: `exp_${Date.now()}`, title: '', company: '', employmentType: 'Full-time', location: '', startDate: '', endDate: '', isCurrent: false, description: '' }]);
  const updateCert = (id: string, patch: Partial<Certification>) => set('certifications', certs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addCert = () => set('certifications', [...certs, { id: `cert_${Date.now()}`, title: '', issuer: '', issueDate: '' }]);
  const addSkill = () => {
    const name = skillInput.trim();
    if (name && !skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      set('skills', [...skills, { name, endorsements: 0 }]);
    }
    setSkillInput('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name cannot be empty.');
    onSave({
      ...form,
      name: form.name.trim(),
      education: education.filter((x) => x.school.trim()),
      experiences: experiences.filter((x) => x.title.trim() || x.company.trim()).map((x) => (x.isCurrent ? { ...x, endDate: '' } : x)),
      certifications: certs.filter((x) => x.title.trim()),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-900 font-display">Edit profile</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {error && <div role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}

          {/* Photo */}
          <div className="flex items-center gap-4">
            <Avatar src={form.avatar} name={form.name} className="w-20 h-20 rounded-full text-2xl border border-slate-200" />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-full cursor-pointer disabled:opacity-60">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {form.avatar ? 'Change photo' : 'Add photo'}
              </button>
              {form.avatar && (
                <button type="button" onClick={() => set('avatar', '')} className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-2 cursor-pointer">Remove</button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage('avatar')} className="hidden" />
            </div>
          </div>

          {uploaded && <p className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 -mt-2">Photo uploaded. Press <b>Save</b> at the bottom to apply it to your profile.</p>}

          {/* Cover photo */}
          <div>
            <Label>Cover photo</Label>
            <div className="relative h-24 rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500">
              {form.coverImage && <img src={form.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button type="button" onClick={() => coverRef.current?.click()} disabled={uploading} className="text-xs font-semibold bg-white/95 hover:bg-white px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-60">{form.coverImage ? 'Change' : 'Add cover'}</button>
                {form.coverImage && <button type="button" onClick={() => set('coverImage', '')} className="text-xs font-semibold bg-white/95 hover:bg-white text-rose-600 px-3 py-1.5 rounded-full cursor-pointer">Remove</button>}
              </div>
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage('coverImage')} className="hidden" />
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <input className={field} value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={120} />
          </div>

          {/* Tag */}
          <div>
            <Label>I am a…</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Profile tag">
              {PROFILE_TAGS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={form.accountType === t.value}
                  onClick={() => set('accountType', t.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    form.accountType === t.value ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Headline</Label>
            <input className={field} value={form.headline} onChange={(e) => set('headline', e.target.value)} maxLength={200} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Current position</Label>
              <input className={field} value={form.currentPosition || ''} onChange={(e) => set('currentPosition', e.target.value)} maxLength={150} />
            </div>
            <div>
              <Label>Workplace / institution</Label>
              <input className={field} value={form.currentCompany || ''} onChange={(e) => set('currentCompany', e.target.value)} maxLength={150} />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <input className={field} value={form.location} onChange={(e) => set('location', e.target.value)} maxLength={120} />
          </div>
          <div>
            <Label>About</Label>
            <textarea className={`${field} resize-none`} rows={4} value={form.about || ''} onChange={(e) => set('about', e.target.value)} maxLength={4000} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.openToWork} onChange={(e) => set('openToWork', e.target.checked)} className="w-4 h-4 accent-blue-700" />
            Open to opportunities
          </label>

          {/* Experience */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Experience</Label>
              <button type="button" onClick={addExp} className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"><Plus className="w-3.5 h-3.5" />Add</button>
            </div>
            <div className="space-y-3">
              {experiences.map((x) => (
                <div key={x.id} className="border border-slate-200 rounded-xl p-3 space-y-2 relative">
                  <button type="button" onClick={() => set('experiences', experiences.filter((y) => y.id !== x.id))} aria-label="Remove experience" className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  <input className={`${field} pr-9`} placeholder="Title (e.g. Physiotherapist)" value={x.title} onChange={(ev) => updateExp(x.id, { title: ev.target.value })} maxLength={150} />
                  <input className={field} placeholder="Clinic / hospital / college" value={x.company} onChange={(ev) => updateExp(x.id, { company: ev.target.value })} maxLength={150} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={field} placeholder="Start (e.g. Jun 2022)" value={x.startDate} onChange={(ev) => updateExp(x.id, { startDate: ev.target.value })} maxLength={30} />
                    <input className={field} placeholder="End" value={x.isCurrent ? 'Present' : x.endDate} disabled={x.isCurrent} onChange={(ev) => updateExp(x.id, { endDate: ev.target.value })} maxLength={30} />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={x.isCurrent} onChange={(ev) => updateExp(x.id, { isCurrent: ev.target.checked })} className="w-4 h-4 accent-blue-700" /> I currently work here
                  </label>
                  <textarea className={`${field} resize-none`} rows={2} placeholder="Description (optional)" value={x.description} onChange={(ev) => updateExp(x.id, { description: ev.target.value })} maxLength={1000} />
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Education</Label>
              <button type="button" onClick={addEdu} className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"><Plus className="w-3.5 h-3.5" />Add</button>
            </div>
            <div className="space-y-3">
              {education.map((e) => (
                <div key={e.id} className="border border-slate-200 rounded-xl p-3 space-y-2 relative">
                  <button type="button" onClick={() => set('education', education.filter((x) => x.id !== e.id))} aria-label="Remove education" className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  <input className={`${field} pr-9`} placeholder="School / college" value={e.school} onChange={(ev) => updateEdu(e.id, { school: ev.target.value })} maxLength={150} />
                  <input className={field} placeholder="Degree" value={e.degree} onChange={(ev) => updateEdu(e.id, { degree: ev.target.value })} maxLength={150} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={field} placeholder="Start year" inputMode="numeric" value={e.startYear} onChange={(ev) => updateEdu(e.id, { startYear: ev.target.value })} maxLength={4} />
                    <input className={field} placeholder="End year" inputMode="numeric" value={e.endYear} onChange={(ev) => updateEdu(e.id, { endYear: ev.target.value })} maxLength={4} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Licenses & certifications</Label>
              <button type="button" onClick={addCert} className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"><Plus className="w-3.5 h-3.5" />Add</button>
            </div>
            <div className="space-y-3">
              {certs.map((c) => (
                <div key={c.id} className="border border-slate-200 rounded-xl p-3 space-y-2 relative">
                  <button type="button" onClick={() => set('certifications', certs.filter((y) => y.id !== c.id))} aria-label="Remove certificate" className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  <input className={`${field} pr-9`} placeholder="Name (e.g. Dry Needling Certification)" value={c.title} onChange={(ev) => updateCert(c.id, { title: ev.target.value })} maxLength={150} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={field} placeholder="Issued by" value={c.issuer} onChange={(ev) => updateCert(c.id, { issuer: ev.target.value })} maxLength={150} />
                    <input className={field} placeholder="Year" value={c.issueDate} onChange={(ev) => updateCert(c.id, { issueDate: ev.target.value })} maxLength={30} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <div className="flex gap-2">
              <input
                className={field}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter"
                maxLength={80}
              />
              <button type="button" onClick={addSkill} className="px-4 text-xs font-semibold border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer">Add</button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {skills.map((s) => (
                  <span key={s.name} className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 pl-3 pr-1.5 py-1.5 rounded-full">
                    {s.name}
                    <button type="button" onClick={() => set('skills', skills.filter((x) => x.name !== s.name))} aria-label={`Remove ${s.name}`} className="text-slate-400 hover:text-rose-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer">Cancel</button>
          <button type="submit" disabled={uploading} className="px-6 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white rounded-full cursor-pointer">Save</button>
        </div>
      </form>
    </div>
  );
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, ...rest }) =>
  isOpen ? <EditForm {...rest} /> : null;
