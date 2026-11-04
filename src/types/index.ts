export type AccountType = 'clinician' | 'student' | 'researcher' | 'institution' | 'admin';

export interface ClinicalMetric {
  label: string;
  value: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  authorVerified: boolean;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  authorVerified: boolean;
  accountType: AccountType;
  timestamp: string;
  type: 'case_study' | 'research' | 'achievement' | 'general' | 'student_case';
  title: string;
  content: string;
  tags: string[];
  clinicalMetrics?: ClinicalMetric[];
  imageUrl?: string;
  documentName?: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  comments: PostComment[];
  bookmarksCount: number;
  isBookmarked: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  employmentType: 'Full-time' | 'Part-time' | 'Consultant' | 'Fellow' | 'Intern' | 'Visiting Faculty';
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface ClinicalRotation {
  id: string;
  hospitalName: string;
  department: string;
  duration: string;
  skillsLearned: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: string;
  endYear: string;
  grade?: string;
  description?: string;
  activities?: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  year: string;
  doi?: string;
  coAuthors?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
}

export interface SkillEndorser {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  verified?: boolean;
}

export interface SkillItem {
  name: string;
  endorsements: number;
  category?: string;
  endorsers?: SkillEndorser[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline: string;
  avatar: string;
  coverImage: string;
  verifiedStatus: 'verified' | 'pending' | 'unverified';
  accountType: AccountType;
  openToWork: boolean;
  openToWorkText?: string;
  location: string;
  
  // Clinician / Faculty Specifics
  currentPosition?: string;
  currentCompany?: string;
  workplaceType?: string;
  registrationNumber?: string;
  councilName?: string;
  specialization: string;
  qualification: string;
  yearsOfExperience?: number;

  // Student Specifics
  college?: string;
  degreeProgram?: string;
  academicYear?: string;
  expectedGraduation?: string;
  clinicalRotations?: ClinicalRotation[];
  academicMentor?: string;

  about: string;
  experiences: Experience[];
  education: Education[];
  publications: Publication[];
  certifications: Certification[];
  skills: SkillItem[];
  connectionsCount: number;
  followersCount: number;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  logo: string;
  location: string;
  locationType: 'On-site Hospital' | 'Outpatient Sports Clinic' | 'University & Research' | 'Hybrid Community';
  type: 'Full-Time Clinical' | 'Hospital Fellowship' | 'Student Internship' | 'Academic / Faculty';
  specialization: string;
  stipendOrSalary: string;
  experienceRequired: string;
  description: string;
  requirements: string[];
  applicantsCount: number;
  postedDate: string;
  hasApplied: boolean;
}

export interface Connection {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  specialization: string;
  location: string;
  institution: string;
  verified: boolean;
  accountType: AccountType;
  status: 'connected' | 'pending' | 'requested' | 'suggestion';
  mutualCount: number;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  qualification: string;
  councilName: string;
  registrationNumber: string;
  documentType: 'State Council Certificate' | 'Degree Certificate' | 'College ID';
  documentUrl: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentName?: string;
  attachmentType?: 'document' | 'case_ref' | 'image';
}

export interface ConversationParticipant {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  verified?: boolean;
  isOnline?: boolean;
  accountType?: AccountType;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participant: ConversationParticipant;
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  messages: ChatMessage[];
}

export type ViewTab = 'home' | 'network' | 'messaging' | 'create' | 'opportunities' | 'research' | 'profile' | 'admin';
export type ViewportMode = 'desktop' | 'mobile';
