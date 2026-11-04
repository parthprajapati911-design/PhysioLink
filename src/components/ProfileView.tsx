import React, { useState } from 'react';
import { UserProfile, AccountType, SkillItem, SkillEndorser } from '../types';
import { 
  CheckCircle2, 
  MapPin, 
  Building, 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Award, 
  Edit3, 
  Share2, 
  Mail, 
  UserPlus, 
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  Calendar,
  Sparkles,
  Eye,
  BarChart3,
  TrendingUp,
  ThumbsUp,
  Check,
  Users,
  X,
  Plus,
  Filter,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface ProfileViewProps {
  user: UserProfile;
  onEditProfile: (initialTab?: 'general' | 'education' | 'skills') => void;
  onConnect?: () => void;
  isCurrentUserProfile?: boolean;
  onEndorseSkill?: (skillName: string, isEndorsing: boolean) => void;
  currentLoggedInUser?: UserProfile;
  onOpenChat?: () => void;
}

export interface NetworkingStatPoint {
  date: string;
  dayIndex: number;
  profileVisits: number;
  connectionGrowth: number;
  postReach: number;
}

const NETWORKING_STATS_30D: NetworkingStatPoint[] = [
  { date: 'Oct 6', dayIndex: 1, profileVisits: 38, connectionGrowth: 4, postReach: 620 },
  { date: 'Oct 7', dayIndex: 2, profileVisits: 44, connectionGrowth: 5, postReach: 740 },
  { date: 'Oct 8', dayIndex: 3, profileVisits: 52, connectionGrowth: 6, postReach: 920 },
  { date: 'Oct 9', dayIndex: 4, profileVisits: 60, connectionGrowth: 7, postReach: 1150 },
  { date: 'Oct 10', dayIndex: 5, profileVisits: 75, connectionGrowth: 10, postReach: 1680 },
  { date: 'Oct 11', dayIndex: 6, profileVisits: 68, connectionGrowth: 8, postReach: 1420 },
  { date: 'Oct 12', dayIndex: 7, profileVisits: 49, connectionGrowth: 5, postReach: 890 },
  { date: 'Oct 13', dayIndex: 8, profileVisits: 42, connectionGrowth: 4, postReach: 810 },
  { date: 'Oct 14', dayIndex: 9, profileVisits: 56, connectionGrowth: 6, postReach: 1100 },
  { date: 'Oct 15', dayIndex: 10, profileVisits: 64, connectionGrowth: 8, postReach: 1350 },
  { date: 'Oct 16', dayIndex: 11, profileVisits: 72, connectionGrowth: 9, postReach: 1590 },
  { date: 'Oct 17', dayIndex: 12, profileVisits: 81, connectionGrowth: 11, postReach: 1820 },
  { date: 'Oct 18', dayIndex: 13, profileVisits: 66, connectionGrowth: 7, postReach: 1380 },
  { date: 'Oct 19', dayIndex: 14, profileVisits: 50, connectionGrowth: 5, postReach: 940 },
  { date: 'Oct 20', dayIndex: 15, profileVisits: 58, connectionGrowth: 6, postReach: 1200 },
  { date: 'Oct 21', dayIndex: 16, profileVisits: 74, connectionGrowth: 9, postReach: 1660 },
  { date: 'Oct 22', dayIndex: 17, profileVisits: 86, connectionGrowth: 12, postReach: 2150 },
  { date: 'Oct 23', dayIndex: 18, profileVisits: 94, connectionGrowth: 13, postReach: 2420 },
  { date: 'Oct 24', dayIndex: 19, profileVisits: 88, connectionGrowth: 10, postReach: 2180 },
  { date: 'Oct 25', dayIndex: 20, profileVisits: 65, connectionGrowth: 6, postReach: 1450 },
  { date: 'Oct 26', dayIndex: 21, profileVisits: 54, connectionGrowth: 5, postReach: 1080 },
  { date: 'Oct 27', dayIndex: 22, profileVisits: 68, connectionGrowth: 8, postReach: 1540 },
  { date: 'Oct 28', dayIndex: 23, profileVisits: 82, connectionGrowth: 10, postReach: 1920 },
  { date: 'Oct 29', dayIndex: 24, profileVisits: 98, connectionGrowth: 14, postReach: 2580 },
  { date: 'Oct 30', dayIndex: 25, profileVisits: 106, connectionGrowth: 16, postReach: 2850 },
  { date: 'Oct 31', dayIndex: 26, profileVisits: 90, connectionGrowth: 11, postReach: 2250 },
  { date: 'Nov 1', dayIndex: 27, profileVisits: 70, connectionGrowth: 7, postReach: 1600 },
  { date: 'Nov 2', dayIndex: 28, profileVisits: 62, connectionGrowth: 6, postReach: 1380 },
  { date: 'Nov 3', dayIndex: 29, profileVisits: 78, connectionGrowth: 9, postReach: 1840 },
  { date: 'Nov 4', dayIndex: 30, profileVisits: 92, connectionGrowth: 12, postReach: 2320 },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onEditProfile,
  onConnect,
  isCurrentUserProfile = true,
  onEndorseSkill,
  currentLoggedInUser,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'education' | 'publications' | 'skills'>('about');
  const [endorsedSkills, setEndorsedSkills] = useState<Record<string, boolean>>({});
  const [analyticsMetric, setAnalyticsMetric] = useState<'profileVisits' | 'connectionGrowth' | 'postReach'>('profileVisits');
  const [timeRange, setTimeRange] = useState<'30d' | '7d'>('30d');
  
  // Endorsement Modal & Interaction States
  const [selectedSkillForEndorsers, setSelectedSkillForEndorsers] = useState<SkillItem | null>(null);
  const [isPeerEndorseModalOpen, setIsPeerEndorseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('all');

  const handleToggleEndorse = (skillName: string) => {
    if (isCurrentUserProfile) {
      setToastMessage("You can't endorse your own skills. Colleagues can endorse you.");
      setTimeout(() => setToastMessage(null), 3200);
      return;
    }
    const isCurrentlyEndorsed = !!endorsedSkills[skillName];
    const willEndorse = !isCurrentlyEndorsed;

    setEndorsedSkills((prev) => ({
      ...prev,
      [skillName]: willEndorse,
    }));

    if (onEndorseSkill) {
      onEndorseSkill(skillName, willEndorse);
    }

    const shortName = user.name.split(',')[0];
    if (willEndorse) {
      setToastMessage(`✓ You endorsed ${shortName} for "${skillName}"`);
    } else {
      setToastMessage(`Endorsement removed for "${skillName}"`);
    }

    setTimeout(() => {
      setToastMessage((cur) => (cur?.includes(skillName) ? null : cur));
    }, 3200);
  };

  const getSkillEndorsementCount = (skill: SkillItem) => {
    return skill.endorsements + (endorsedSkills[skill.name] ? 1 : 0);
  };

  const isStudent = user.accountType === 'student';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* 1. Main LinkedIn-Style Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 relative bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 overflow-hidden">
          <img
            src={user.coverImage}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-white flex items-center gap-1.5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>{isStudent ? 'Physiotherapy Student' : 'Registered Clinician'}</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar with optional Open-to-Work ring */}
            <div className="relative inline-block">
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-md bg-white ${
                user.openToWork ? 'ring-4 ring-teal-500 ring-offset-2' : ''
              }`}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Verified Badge */}
              {user.verifiedStatus === 'verified' && (
                <div 
                  className="absolute bottom-1 right-1 bg-teal-600 text-white p-1 rounded-full shadow border-2 border-white"
                  title="Council Verified Physiotherapist / Accredited Student"
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Action Buttons: Edit, Connect, Share */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              {isCurrentUserProfile ? (
                <>
                  <button
                    onClick={() => onEditProfile('general')}
                    className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile & Position</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Profile link copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    title="Share Profile"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onConnect}
                    className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                  <button 
                    onClick={onOpenChat}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details & Headlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Primary Bio & Title */}
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  {user.name}
                </h1>
                {user.verifiedStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Verified Clinician
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {user.headline}
              </p>

              {/* Clean Unboxed Metadata */}
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.location}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-blue-700 hover:underline cursor-pointer">
                  {user.connectionsCount} connections
                </span>
                <span aria-hidden="true">·</span>
                <span>{user.followersCount} followers</span>
              </div>

              {/* Open to Work Banner */}
              {user.openToWork && (
                <div className="mt-3 p-3 rounded-xl bg-teal-50/80 border border-teal-200 flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-teal-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-900 block">
                      {isStudent ? 'Open to Clinical Internships & Fellowships' : 'Open to Clinical Opportunities & Consultations'}
                    </span>
                    <p className="text-[11px] text-teal-800 mt-0.5">
                      {user.openToWorkText || 'Actively considering specialized physiotherapy opportunities and peer consultations.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Currently Working At / College Highlight Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-2">
                  {isStudent ? 'Current Academic Enrolment' : 'Current Primary Position'}
                </span>

                {isStudent ? (
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {user.college || 'Manipal College of Health Professions'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {user.academicYear || 'Final Year Compulsory Intern'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Degree: {user.degreeProgram || 'BPT (4.5 Years)'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {user.currentCompany || 'ProRehab Sports Center'}
                      </p>
                      <p className="text-[11px] text-blue-800 font-medium mt-0.5">
                        {user.currentPosition || 'Senior Consultant Physiotherapist'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {user.workplaceType || 'Sports & Orthopedic Clinic'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Council / Verification ID strip */}
              {user.registrationNumber && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Council Reg ID:</span>
                  <span className="font-mono font-medium text-slate-800">{user.registrationNumber}</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1 px-6 border-t border-slate-200 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'about'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            About & Overview
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'experience'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {isStudent ? 'Clinical Rotations & Postings' : 'Clinical Experience'}
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'education'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Education & Degrees
          </button>

          <button
            onClick={() => setActiveTab('publications')}
            className={`py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'publications'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Research & Case Studies ({user.publications.length})
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'skills'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Skills & Endorsements ({user.skills.length})
          </button>
        </div>

      </div>

      {/* 2. Dynamic Tab Content Panels */}
      
      {/* Tab: About */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Networking Statistics & Reach Widget (30-Day Trends) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              
              {/* Header with Title and Range Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-600" />
                    <h2 className="text-base font-bold text-slate-900 font-display">Networking Statistics & Reach</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>Verified physiotherapy reach, connection velocity & impressions</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Timeframe Switcher */}
                  <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setTimeRange('30d')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        timeRange === '30d' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeRange('7d')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        timeRange === '7d' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      Last 7 Days
                    </button>
                  </div>

                  {/* Metric Switcher */}
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg overflow-x-auto text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAnalyticsMetric('profileVisits')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        analyticsMetric === 'profileVisits'
                          ? 'bg-white text-teal-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Profile Visits
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsMetric('connectionGrowth')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        analyticsMetric === 'connectionGrowth'
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Connection Growth
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsMetric('postReach')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        analyticsMetric === 'postReach'
                          ? 'bg-white text-blue-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Post Reach
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards for 30-Day Trends */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setAnalyticsMetric('profileVisits')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    analyticsMetric === 'profileVisits' ? 'bg-teal-50/70 border-teal-300 shadow-xs' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">Profile Visits</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded">+26.4%</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">1,936</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">84 hospital & college depts</p>
                </div>

                <div 
                  onClick={() => setAnalyticsMetric('connectionGrowth')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    analyticsMetric === 'connectionGrowth' ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">Connection Growth</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">+34.1%</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">+237</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">96% clinician acceptance</p>
                </div>

                <div 
                  onClick={() => setAnalyticsMetric('postReach')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    analyticsMetric === 'postReach' ? 'bg-blue-50/70 border-blue-300 shadow-xs' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">Post Reach</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">+44.8%</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">47,420</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Clinical case discussions</p>
                </div>
              </div>

              {/* Data Visualization Widget via Recharts */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">
                    {analyticsMetric === 'profileVisits'
                      ? `Daily Profile Visits (${timeRange === '30d' ? 'Last 30 Days' : 'Last 7 Days'})`
                      : analyticsMetric === 'connectionGrowth'
                      ? `New Network Connections (${timeRange === '30d' ? 'Last 30 Days' : 'Last 7 Days'})`
                      : `Clinical Post Impressions & Reach (${timeRange === '30d' ? 'Last 30 Days' : 'Last 7 Days'})`}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Updated live · 30-day audit</span>
                </div>

                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeRange === '30d' ? NETWORKING_STATS_30D : NETWORKING_STATS_30D.slice(-7)}
                      margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="networkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={
                              analyticsMetric === 'profileVisits'
                                ? '#0d9488'
                                : analyticsMetric === 'connectionGrowth'
                                ? '#4f46e5'
                                : '#2563eb'
                            }
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              analyticsMetric === 'profileVisits'
                                ? '#0d9488'
                                : analyticsMetric === 'connectionGrowth'
                                ? '#4f46e5'
                                : '#2563eb'
                            }
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        interval={timeRange === '30d' ? 4 : 0}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '0.75rem',
                          border: '1px solid #1e293b',
                          color: '#ffffff',
                          fontSize: '12px',
                          padding: '6px 12px',
                        }}
                        formatter={(val: any) => [
                          Number(val).toLocaleString(),
                          analyticsMetric === 'profileVisits'
                            ? 'Profile Visits'
                            : analyticsMetric === 'connectionGrowth'
                            ? 'New Connections'
                            : 'Post Reach Impressions',
                        ]}
                        labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '2px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey={analyticsMetric}
                        stroke={
                          analyticsMetric === 'profileVisits'
                            ? '#0d9488'
                            : analyticsMetric === 'connectionGrowth'
                            ? '#4f46e5'
                            : '#2563eb'
                        }
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#networkGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Networking Demographics & Reach Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wide">
                    Top Visitor Professional Roles
                  </span>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span>Sports & Orthopedic PTs</span>
                      <strong className="text-slate-900 font-mono">42%</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Physiotherapy Students & Interns</span>
                      <strong className="text-slate-900 font-mono">27%</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hospital HODs & Clinic Leads</span>
                      <strong className="text-slate-900 font-mono">18%</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Academic Researchers & Faculty</span>
                      <strong className="text-slate-900 font-mono">13%</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wide">
                    Top Institutional Traffic
                  </span>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span>Manipal Academy of Higher Ed (MAHE)</span>
                      <span className="text-teal-700 font-semibold font-mono">284 views</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Seth GSMC & KEM Hospital Mumbai</span>
                      <span className="text-teal-700 font-semibold font-mono">230 views</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Apollo Hospitals & Rehab Centers</span>
                      <span className="text-teal-700 font-semibold font-mono">198 views</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AIIMS New Delhi Physical Medicine</span>
                      <span className="text-teal-700 font-semibold font-mono">165 views</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 font-display">About</h2>
                {isCurrentUserProfile && (
                  <button onClick={() => onEditProfile('general')} className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {user.about}
              </p>
            </div>

            {/* Specialization Highlights */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 font-display mb-3">
                Clinical Focus & Specialization
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Primary Domain</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{user.specialization}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Degrees & Credentials</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{user.qualification}</span>
                </div>
              </div>
            </div>

            {/* Education History - Clean Timeline Layout on Main View */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Education Timeline</h2>
                    <p className="text-xs text-slate-500">Degree qualifications and academic institutions</p>
                  </div>
                </div>
                {isCurrentUserProfile && (
                  <button
                    onClick={() => onEditProfile('education')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Add / Edit Education</span>
                  </button>
                )}
              </div>

              {/* Clean Vertical Timeline */}
              {user.education.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                  <GraduationCap className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">No education entries added yet.</p>
                  {isCurrentUserProfile && (
                    <button
                      onClick={() => onEditProfile('education')}
                      className="mt-2 text-xs text-blue-700 font-semibold hover:underline"
                    >
                      + Add Education Details
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-7 space-y-6 pt-1 before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {user.education.map((edu) => (
                    <div key={edu.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <div className="absolute -left-6 sm:-left-7 top-1 w-4 h-4 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{edu.school}</h3>
                          <span className="text-xs font-mono font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 w-fit">
                            {edu.startYear} – {edu.endYear}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-blue-800">
                          {edu.degree} {edu.fieldOfStudy && <span className="font-normal text-slate-600">· {edu.fieldOfStudy}</span>}
                        </p>

                        {edu.grade && (
                          <p className="text-xs text-teal-800 font-medium">
                            Academic Honors: <span className="font-semibold">{edu.grade}</span>
                          </p>
                        )}

                        {edu.description && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clinical & Professional Skills Tags in Main ProfileView with Endorsements */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Clinical & Professional Skills</h2>
                    <p className="text-xs text-slate-500">Core competencies, assessment tools, and peer endorsements</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="text-xs text-blue-700 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer mr-1"
                  >
                    <span>Detailed Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {isCurrentUserProfile ? (
                    <button
                      onClick={() => onEditProfile('skills')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Manage Skills</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPeerEndorseModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Endorse Skills</span>
                    </button>
                  )}
                </div>
              </div>

              {user.skills.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                  <Sparkles className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">No skills added yet.</p>
                  {isCurrentUserProfile && (
                    <button
                      onClick={() => onEditProfile('skills')}
                      className="mt-2 text-xs text-blue-700 font-semibold hover:underline"
                    >
                      + Add Clinical Skills
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {user.skills.map((skill) => {
                      const isEndorsedByMe = !!endorsedSkills[skill.name];
                      const totalCount = getSkillEndorsementCount(skill);
                      const hasEndorsers = skill.endorsers && skill.endorsers.length > 0;

                      return (
                        <div
                          key={skill.name}
                          className={`group inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border text-xs transition-all ${
                            isEndorsedByMe
                              ? 'bg-teal-50/80 border-teal-300 text-teal-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {/* Skill name */}
                          <span className="font-medium pl-1.5 flex items-center gap-1.5">
                            <Stethoscope className={`w-3.5 h-3.5 ${isEndorsedByMe ? 'text-teal-600' : 'text-slate-400'}`} />
                            {skill.name}
                          </span>

                          {/* Endorsement count badge */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSkillForEndorsers(skill);
                            }}
                            title="Click to view colleagues who endorsed this skill"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                              isEndorsedByMe
                                ? 'bg-teal-200/70 text-teal-950 border border-teal-300 hover:bg-teal-300'
                                : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                            }`}
                          >
                            <ThumbsUp className={`w-2.5 h-2.5 ${isEndorsedByMe ? 'text-teal-700 fill-teal-600' : 'text-slate-400'}`} />
                            <span>{totalCount}</span>
                          </button>

                          {/* Endorsers mini avatar stack preview */}
                          {hasEndorsers && (
                            <div 
                              onClick={() => setSelectedSkillForEndorsers(skill)}
                              className="flex -space-x-1.5 items-center cursor-pointer hover:opacity-80"
                              title="Click to view endorser profiles"
                            >
                              {skill.endorsers!.slice(0, 2).map((endorser, idx) => (
                                <img
                                  key={idx}
                                  src={endorser.avatar}
                                  alt={endorser.name}
                                  className="w-4 h-4 rounded-full border border-white object-cover"
                                />
                              ))}
                            </div>
                          )}

                          {/* Interactive 1-click Endorse button */}
                          <button
                            type="button"
                            onClick={() => handleToggleEndorse(skill.name)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                              isEndorsedByMe
                                ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-2xs'
                                : 'bg-slate-100 hover:bg-blue-100/70 text-slate-700 hover:text-blue-800 border border-slate-200'
                            }`}
                            title={isEndorsedByMe ? 'Click to remove endorsement' : `Endorse ${user.name.split(',')[0]} for ${skill.name}`}
                          >
                            {isEndorsedByMe ? (
                              <>
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Endorsed</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Endorse</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skills quick action footer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Colleagues and clinical mentors can endorse competencies to validate hands-on clinical proficiency.
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('skills')}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap self-end sm:self-auto"
                    >
                      <span>Explore all endorsements & rankings</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Rail: Credentials & Council Verification */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Council Verification</h3>
              </div>

              {user.verifiedStatus === 'verified' ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                    <p className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Official Credentials Verified
                    </p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Registry verified against State Council / IAP database.
                    </p>
                  </div>
                  {user.registrationNumber && (
                    <div className="text-slate-600">
                      <span className="text-[11px] block text-slate-400">Registration Number</span>
                      <span className="font-mono font-medium text-slate-900">{user.registrationNumber}</span>
                    </div>
                  )}
                  {user.councilName && (
                    <div className="text-slate-600">
                      <span className="text-[11px] block text-slate-400">Issuing Council / Board</span>
                      <span className="text-slate-800">{user.councilName}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  <p>Submit your State Council or College Registration certificate to receive the verified checkmark.</p>
                  <button className="mt-3 w-full bg-teal-700 hover:bg-teal-800 text-white py-2 rounded-lg text-xs font-semibold">
                    Submit Verification
                  </button>
                </div>
              )}
            </div>

            {/* Student Mentor Card (if student) */}
            {isStudent && user.academicMentor && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-teal-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Academic Mentor</h3>
                </div>
                <p className="text-xs font-semibold text-slate-900">{user.academicMentor}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Clinical Guide & Dissertation Supervisor</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Experience / Clinical Rotations */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {isStudent ? 'Compulsory Hospital Rotatory Postings' : 'Clinical Experience & Appointments'}
              </h2>
              <p className="text-xs text-slate-500">
                {isStudent ? 'Departmental clinical training completed during 6-month internship' : 'Chronological clinical practice and hospital appointments'}
              </p>
            </div>
            {isCurrentUserProfile && (
              <button
                onClick={() => onEditProfile('general')}
                className="flex items-center gap-1 text-xs text-blue-700 hover:underline font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Update Experience
              </button>
            )}
          </div>

          {/* Student Hospital Rotations */}
          {isStudent && user.clinicalRotations && user.clinicalRotations.length > 0 && (
            <div className="space-y-4">
              {user.clinicalRotations.map((rotation) => (
                <div key={rotation.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900">{rotation.department}</h3>
                      <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 w-fit">
                        {rotation.duration}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{rotation.hospitalName}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60">
                      <strong className="text-slate-800">Clinical Competencies: </strong>
                      {rotation.skillsLearned}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Professional Clinician Experience Timeline */}
          {user.experiences && user.experiences.length > 0 && (
            <div className="divide-y divide-slate-100 space-y-4 pt-2">
              {user.experiences.map((exp) => (
                <div key={exp.id} className="pt-4 first:pt-0 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-1 border border-blue-100">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                      <div className="flex items-center gap-2">
                        {exp.isCurrent && (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            Current Position
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {exp.startDate} – {exp.endDate}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {exp.company} <span className="font-normal text-slate-400">· {exp.employmentType}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{exp.location}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Education */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Education & Academic Qualifications</h2>
              <p className="text-xs text-slate-500">Degree programs, universities, and academic research history</p>
            </div>
            {isCurrentUserProfile && (
              <button 
                onClick={() => onEditProfile('education')} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Manage Education ({user.education.length})</span>
              </button>
            )}
          </div>

          {user.education.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
              <GraduationCap className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No education entries added yet.</p>
              {isCurrentUserProfile && (
                <button
                  onClick={() => onEditProfile('education')}
                  className="mt-3 px-4 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
                >
                  + Add Your Degrees
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-4">
              {user.education.map((edu) => (
                <div key={edu.id} className="pt-4 first:pt-0 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-1 border border-teal-100">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900">{edu.school}</h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{edu.startYear} – {edu.endYear}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs font-semibold text-blue-800 mt-0.5">
                      {edu.degree} {edu.fieldOfStudy && <span className="font-normal text-slate-600">· {edu.fieldOfStudy}</span>}
                    </p>

                    {edu.grade && (
                      <p className="text-xs text-teal-800 font-medium mt-1">
                        Academic Honors: <span className="font-semibold">{edu.grade}</span>
                      </p>
                    )}

                    {edu.description && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Publications */}
      {activeTab === 'publications' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Research Publications & Clinical Presentations
            </h2>
            <p className="text-xs text-slate-500">Peer-reviewed papers, symposium presentations, and clinical audits</p>
          </div>

          <div className="divide-y divide-slate-100 space-y-4">
            {user.publications.map((pub) => (
              <div key={pub.id} className="pt-4 first:pt-0 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{pub.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-800">{pub.journal}</span> · {pub.year}
                  </p>
                  {pub.coAuthors && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Authors: {pub.coAuthors}</p>
                  )}
                  {pub.doi && (
                    <div className="mt-2">
                      <span className="text-[11px] font-mono text-blue-700 hover:underline flex items-center gap-1 cursor-pointer">
                        DOI: {pub.doi}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Skills & Endorsements */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          
          {/* Main Endorsements Banner & Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Clinical Competencies & Endorsements
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Peer-evaluated clinical skills, specialized modalities, and hospital competencies
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {isCurrentUserProfile ? (
                  <>
                    <button
                      onClick={() => onEditProfile('skills')}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Clinical Skill</span>
                    </button>
                    <button
                      onClick={() => onEditProfile('skills')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Manage ({user.skills.length})</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsPeerEndorseModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Endorse Skills for {user.name.split(',')[0]}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Total Endorsements</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {user.skills.reduce((sum, s) => sum + getSkillEndorsementCount(s), 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Registered Skills</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {user.skills.length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2">
                <span className="text-[11px] text-slate-500 block">Top Validated Competency</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {user.skills[0]?.name || 'Manual Therapy'}
                  </span>
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 font-bold shrink-0">
                    {user.skills[0] ? getSkillEndorsementCount(user.skills[0]) : 0} endorsements
                  </span>
                </div>
              </div>
            </div>

            {/* Top 3 Featured Skills Spotlight */}
            {user.skills.length >= 2 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Top Endorsed Skills Spotlight
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[...user.skills]
                    .sort((a, b) => getSkillEndorsementCount(b) - getSkillEndorsementCount(a))
                    .slice(0, 3)
                    .map((topSkill, idx) => {
                      const count = getSkillEndorsementCount(topSkill);
                      const isEndorsedByMe = !!endorsedSkills[topSkill.name];
                      const medalStyles = [
                        { border: 'border-amber-300', bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-900 border-amber-300', rank: '#1 Most Endorsed' },
                        { border: 'border-slate-300', bg: 'bg-slate-50/60', badge: 'bg-slate-100 text-slate-800 border-slate-300', rank: '#2 Highly Rated' },
                        { border: 'border-amber-200', bg: 'bg-amber-50/30', badge: 'bg-amber-50 text-amber-800 border-amber-200', rank: '#3 Top Competency' },
                      ][idx];

                      return (
                        <div
                          key={topSkill.name}
                          className={`p-4 rounded-xl border ${medalStyles.border} ${medalStyles.bg} flex flex-col justify-between gap-3 relative overflow-hidden`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${medalStyles.badge}`}>
                                {medalStyles.rank}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {count} endorsements
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {topSkill.name}
                            </h4>

                            {topSkill.category && (
                              <span className="text-[10px] text-slate-500 block mt-1">
                                {topSkill.category}
                              </span>
                            )}
                          </div>

                          {/* Endorsers avatars preview & action */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                            {topSkill.endorsers && topSkill.endorsers.length > 0 ? (
                              <button
                                onClick={() => setSelectedSkillForEndorsers(topSkill)}
                                className="flex items-center gap-1.5 text-[11px] text-blue-700 hover:underline cursor-pointer"
                              >
                                <div className="flex -space-x-1.5 items-center">
                                  {topSkill.endorsers.slice(0, 3).map((endorser, i) => (
                                    <img
                                      key={i}
                                      src={endorser.avatar}
                                      alt={endorser.name}
                                      className="w-4 h-4 rounded-full border border-white object-cover"
                                    />
                                  ))}
                                </div>
                                <span>{topSkill.endorsers[0]?.name.split(' ')[0]} +{count - 1}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">Peer verified</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleEndorse(topSkill.name)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                isEndorsedByMe
                                  ? 'bg-teal-700 text-white shadow-2xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {isEndorsedByMe ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Endorsed</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Endorse</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium shrink-0">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'all', label: `All Skills (${user.skills.length})` },
                { id: 'Clinical Modalities', label: 'Clinical Modalities' },
                { id: 'Rehabilitation Speciality', label: 'Rehabilitation Speciality' },
                { id: 'Sports & Musculoskeletal', label: 'Sports & Musculoskeletal' },
                { id: 'Assessment & Diagnostics', label: 'Assessment & Diagnostics' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSkillCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    skillCategoryFilter === cat.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Comprehensive Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {user.skills
                .filter((s) => skillCategoryFilter === 'all' || s.category === skillCategoryFilter)
                .map((skill) => {
                  const isEndorsedByMe = !!endorsedSkills[skill.name];
                  const count = getSkillEndorsementCount(skill);
                  const maxEndorsements = Math.max(...user.skills.map((s) => getSkillEndorsementCount(s)), 1);
                  const percentage = Math.min(Math.round((count / maxEndorsements) * 100), 100);

                  return (
                    <div
                      key={skill.name}
                      className={`p-4 rounded-xl border transition-all ${
                        isEndorsedByMe
                          ? 'bg-teal-50/40 border-teal-300 shadow-2xs'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-bold text-slate-900 truncate">
                              {skill.name}
                            </h3>
                            {skill.category && (
                              <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded font-medium">
                                {skill.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => setSelectedSkillForEndorsers(skill)}
                              className="text-xs font-mono font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                              title="View peer endorsers"
                            >
                              <ThumbsUp className={`w-3 h-3 ${isEndorsedByMe ? 'text-teal-700 fill-teal-600' : 'text-slate-400'}`} />
                              <span>{count} endorsements</span>
                            </button>
                          </div>
                        </div>

                        {/* Endorse Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleEndorse(skill.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isEndorsedByMe
                              ? 'bg-teal-700 text-white shadow-2xs hover:bg-teal-800'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isEndorsedByMe ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Endorsed</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Endorse</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Endorsement Strength Progress Bar */}
                      <div className="mt-2.5">
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isEndorsedByMe ? 'bg-teal-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Peer Endorser Avatars & Names */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        {skill.endorsers && skill.endorsers.length > 0 ? (
                          <button
                            onClick={() => setSelectedSkillForEndorsers(skill)}
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-700 text-[11px] truncate cursor-pointer text-left"
                          >
                            <div className="flex -space-x-1.5 shrink-0">
                              {skill.endorsers.slice(0, 3).map((endorser, idx) => (
                                <img
                                  key={idx}
                                  src={endorser.avatar}
                                  alt={endorser.name}
                                  className="w-4 h-4 rounded-full border border-white object-cover"
                                />
                              ))}
                            </div>
                            <span className="truncate">
                              Endorsed by <strong>{skill.endorsers[0]?.name}</strong>
                              {count > 1 ? ` and ${count - 1} other peers` : ''}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Be the first colleague to endorse this skill
                          </span>
                        )}

                        <button
                          onClick={() => setSelectedSkillForEndorsers(skill)}
                          className="text-[11px] font-medium text-blue-700 hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Endorsers List Modal (When clicking on a skill's endorsers) */}
      {selectedSkillForEndorsers && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Colleagues Who Endorsed
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedSkillForEndorsers.name} · {getSkillEndorsementCount(selectedSkillForEndorsers)} endorsements
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkillForEndorsers(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Endorsers List */}
            <div className="p-4 max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-3">
              {/* Show active user endorsement if toggled on */}
              {endorsedSkills[selectedSkillForEndorsers.name] && currentLoggedInUser && (
                <div className="pt-2 first:pt-0 flex items-center justify-between gap-3 bg-teal-50/60 p-2.5 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={currentLoggedInUser.avatar}
                      alt={currentLoggedInUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-teal-300"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {currentLoggedInUser.name} (You)
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-teal-800 truncate">
                        {currentLoggedInUser.headline}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300 shrink-0">
                    Endorsed ✓
                  </span>
                </div>
              )}

              {/* Mock endorsers from skill data */}
              {selectedSkillForEndorsers.endorsers && selectedSkillForEndorsers.endorsers.length > 0 ? (
                selectedSkillForEndorsers.endorsers.map((endorser) => (
                  <div key={endorser.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={endorser.avatar}
                        alt={endorser.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {endorser.name}
                          </span>
                          {endorser.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {endorser.headline}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Connect
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  <p>No additional peer profiles documented yet.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Endorsements are peer-authenticated
              </span>
              <button
                onClick={() => setSelectedSkillForEndorsers(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Peer Batch Endorsement Modal */}
      {isPeerEndorseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Endorse Skills for {user.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select competencies you can validate from clinical observations or collaboration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPeerEndorseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Skills Checklist */}
            <div className="p-5 max-h-96 overflow-y-auto space-y-2.5">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Click to toggle endorsement for each competency:
              </p>

              {user.skills.map((skill) => {
                const isEndorsed = !!endorsedSkills[skill.name];
                return (
                  <div
                    key={skill.name}
                    onClick={() => handleToggleEndorse(skill.name)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isEndorsed
                        ? 'bg-teal-50 border-teal-300 text-teal-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{skill.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {getSkillEndorsementCount(skill)} endorsements currently
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        isEndorsed
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Endorsements display publicly on their profile
              </span>
              <button
                onClick={() => {
                  setIsPeerEndorseModalOpen(false);
                  setToastMessage(`Endorsements updated for ${user.name.split(',')[0]}!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
              >
                Done & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};

