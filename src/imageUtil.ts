// Shrinks a photo in the browser before upload (keeps uploads fast and small).
// Accepts any picture the browser can open and always produces a JPEG.
export function shrinkImage(file: File, maxSide = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Some phones/browsers leave the file type empty, so only reject things that are clearly not pictures.
    if (file.type && !file.type.startsWith('image/')) {
      reject(new Error('Please choose a photo (JPG, PNG or WebP).'));
      return;
    }
    if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
      reject(new Error('HEIC photos are not supported. Please choose a JPG or PNG (on iPhone: Settings > Camera > Formats > Most Compatible).'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (!img.width || !img.height) { reject(new Error('Could not read this photo.')); return; }
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not process this photo.')); return; }
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Keep under the 2 MB server limit: lower the quality until it fits.
      let q = quality;
      let out = canvas.toDataURL('image/jpeg', q);
      while (out.length > 2_500_000 && q > 0.4) {
        q -= 0.15;
        out = canvas.toDataURL('image/jpeg', q);
      }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this photo. Try a JPG or PNG.')); };
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
