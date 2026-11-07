// Shrinks a photo in the browser before upload (keeps uploads fast and small).
export function shrinkImage(file: File, maxSide = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      reject(new Error('Please choose a JPG, PNG or WebP photo.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not process this photo.')); return; }
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this photo.')); };
    img.src = url;
  });
}

export const TAG_LABELS: Record<string, string> = {
  case: 'Case', achievement: 'Achievement', research: 'Research', event: 'Event', update: 'Update',
  // legacy values from older posts
  case_study: 'Case', student_case: 'Case', general: 'Update',
};
export const tagLabel = (t: string) => TAG_LABELS[t] || 'Update';

export const PROFILE_TAGS: { value: 'academician' | 'clinician' | 'student'; label: string }[] = [
  { value: 'academician', label: 'Academician' },
  { value: 'clinician', label: 'Clinician' },
  { value: 'student', label: 'Student' },
];
export const profileTagLabel = (t: string) => PROFILE_TAGS.find((p) => p.value === t)?.label || '';
