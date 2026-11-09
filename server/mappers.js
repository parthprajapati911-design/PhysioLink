import { timeAgo } from './util.js';

export const maskPhone = (e164) => `+91 ${'•'.repeat(6)}${String(e164).slice(-4)}`;
const arr = (v) => (Array.isArray(v) ? v : []);

// DB row -> UserProfile shape used by the React app.
export function toUser(row, { connectionsCount = 0, includeEmail = false } = {}) {
  const p = row.profile || {};
  return {
    ...p,
    id: row.id,
    email: includeEmail ? row.email : '',
    name: p.name || 'PhysioLink Member',
    headline: p.headline || '',
    avatar: p.avatar || '',
    coverImage: p.coverImage || '',
    verifiedStatus: row.verified_status,
    accountType: row.account_type,
    openToWork: !!p.openToWork,
    location: p.location || '',
    specialization: p.specialization || '',
    qualification: p.qualification || '',
    about: p.about || '',
    experiences: arr(p.experiences),
    education: arr(p.education),
    publications: arr(p.publications),
    certifications: arr(p.certifications),
    skills: arr(p.skills),
    clinicalRotations: arr(p.clinicalRotations),
    connectionsCount: Number(connectionsCount) || 0,
    followersCount: Number(p.followersCount) || 0,
    // Mobile number details are only ever sent to the account owner.
    phoneVerified: includeEmail ? !!row.phone : undefined,
    phoneMasked: includeEmail && row.phone ? maskPhone(row.phone) : undefined,
  };
}

const authorFields = (row) => {
  const p = row.author_profile || {};
  return {
    authorId: row.author_id,
    authorName: p.name || 'PhysioLink Member',
    authorHeadline: p.headline || '',
    authorAvatar: p.avatar || '',
    authorVerified: row.author_verified === 'verified',
  };
};

export function toComment(row) {
  const a = authorFields(row);
  return {
    id: row.id,
    authorName: a.authorName,
    authorHeadline: a.authorHeadline,
    authorAvatar: a.authorAvatar,
    authorVerified: a.authorVerified,
    content: row.content,
    timestamp: timeAgo(row.created_at),
    likes: row.likes,
  };
}

export function toPost(row, comments = []) {
  return {
    id: row.id,
    ...authorFields(row),
    accountType: row.author_account_type,
    timestamp: timeAgo(row.created_at),
    type: row.type,
    title: row.title,
    content: row.content,
    tags: arr(row.tags),
    clinicalMetrics: row.clinical_metrics || undefined,
    imageUrl: row.image_url || undefined,
    documentName: row.document_name || undefined,
    likesCount: row.likes_count ?? 0,
    isLiked: !!row.is_liked,
    commentsCount: comments.length,
    comments,
    bookmarksCount: row.bookmarks_count ?? 0,
    isBookmarked: !!row.is_bookmarked,
  };
}

export function toOpportunity(row) {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    logo: row.logo,
    location: row.location,
    locationType: row.location_type,
    type: row.type,
    specialization: row.specialization,
    stipendOrSalary: row.stipend_or_salary,
    experienceRequired: row.experience_required,
    description: row.description,
    requirements: arr(row.requirements),
    applicantsCount: Number(row.base_applicants) + Number(row.applicants || 0),
    postedDate: timeAgo(row.created_at),
    hasApplied: !!row.has_applied,
    createdBy: row.created_by || null,
  };
}

export function toVerification(row) {
  const p = row.profile || {};
  return {
    id: row.id,
    userId: row.user_id,
    userName: p.name || 'Unknown',
    userAvatar: p.avatar || '',
    qualification: row.qualification,
    councilName: row.council_name,
    registrationNumber: row.registration_number,
    documentType: row.document_type,
    documentUrl: row.document_url,
    submittedDate: timeAgo(row.created_at),
    status: row.status,
  };
}
