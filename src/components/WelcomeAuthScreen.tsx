import React, { useState } from 'react';
import { LOGO_URL, SPORTS_AVATAR, STUDENT_AVATAR, NEURO_AVATAR } from '../data/mockData';
import { UserProfile, AccountType } from '../types';
import { 
  ShieldCheck, 
  Stethoscope, 
  GraduationCap, 
  Microscope, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Award, 
  MapPin, 
  FileText, 
  Check, 
  Sparkles,
  ChevronRight,
  Hospital
} from 'lucide-react';

interface WelcomeAuthScreenProps {
  onLogin: (identifier: string, password: string) => Promise<string | null>;
  onSignUp: (newProfile: UserProfile, password: string) => Promise<string | null>;
}

type AuthMode = 'login' | 'signup_pro' | 'signup_student';

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  onLogin,
  onSignUp,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Professional Sign-Up State
  const [proName, setProName] = useState('');
  const [proDegree, setProDegree] = useState('MPT (Sports Physiotherapy)');
  const [proSpecialization, setProSpecialization] = useState('Sports & Musculoskeletal Rehab');
  const [proRegNo, setProRegNo] = useState('');
  const [proHospital, setProHospital] = useState('');
  const [proDesignation, setProDesignation] = useState('Consultant Physiotherapist');
  const [proExperience, setProExperience] = useState('5');
  const [proEmail, setProEmail] = useState('');
  const [proPassword, setProPassword] = useState('');
  const [proCity, setProCity] = useState('Mumbai, Maharashtra');
  const [proConsent, setProConsent] = useState(true);

  // Student Sign-Up State
  const [stuName, setStuName] = useState('');
  const [stuCollege, setStuCollege] = useState('');
  const [stuProgram, setStuProgram] = useState('BPT (Bachelor of Physiotherapy)');
  const [stuYear, setStuYear] = useState('BPT Final Year (4th Year)');
  const [stuRollNo, setStuRollNo] = useState('');
  const [stuPosting, setStuPosting] = useState('Orthopedics & Post-Operative Ward');
  const [stuGradYear, setStuGradYear] = useState('2026');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPassword, setStuPassword] = useState('');
  const [stuCity, setStuCity] = useState('Bengaluru, Karnataka');
  const [stuConsent, setStuConsent] = useState(true);

  // Submit Login
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('Please enter your email (or council registration number) and password.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    const error = await onLogin(loginIdentifier.trim(), loginPassword);
    setSubmitting(false);
    if (error) setErrorMsg(error);
  };

  // Submit Professional Sign-Up
  const handleProSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!proName.trim()) {
      setErrorMsg('Please enter your full professional name.');
      return;
    }
    if (!proEmail.trim()) {
      setErrorMsg('Please enter your work or personal email.');
      return;
    }
    if (!proRegNo.trim()) {
      setErrorMsg('Please enter your State Council or IAP Registration ID.');
      return;
    }

    if (proPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    const newId = `pro_${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      name: proName.startsWith('Dr.') ? proName : `Dr. ${proName}, PT`,
      email: proEmail,
      headline: `${proDesignation} | ${proSpecialization} | ${proHospital || 'Private Clinical Practice'}`,
      avatar: SPORTS_AVATAR,
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      verifiedStatus: 'pending',
      accountType: 'clinician',
      openToWork: true,
      openToWorkText: 'Open to Clinical Consultations & Patient Referrals',
      location: proCity,
      currentPosition: proDesignation,
      currentCompany: proHospital || 'Independent Clinical Center',
      workplaceType: 'Clinic & Hospital Dept',
      registrationNumber: proRegNo,
      councilName: 'State Council for OT & PT / Indian Association of Physiotherapists',
      specialization: proSpecialization,
      qualification: proDegree,
      yearsOfExperience: parseInt(proExperience, 10) || 5,
      about: `Clinical physiotherapist with expertise in ${proSpecialization}. Committed to evidence-based assessment, objective rehabilitation milestones, and interdisciplinary patient outcomes at ${proHospital || 'our clinical practice'}.`,
      experiences: [],
      education: [],
      publications: [],
      certifications: [],
      skills: [],
      connectionsCount: 0,
      followersCount: 0,
    };

    setErrorMsg(null);
    setSubmitting(true);
    const error = await onSignUp(newProfile, proPassword);
    setSubmitting(false);
    if (error) setErrorMsg(error);
  };

  // Submit Student Sign-Up
  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!stuName.trim()) {
      setErrorMsg('Please enter your full student name.');
      return;
    }
    if (!stuCollege.trim()) {
      setErrorMsg('Please enter your university or college name.');
      return;
    }
    if (!stuEmail.trim()) {
      setErrorMsg('Please enter your student email address.');
      return;
    }

    if (stuPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    const newId = `student_${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      name: stuName,
      email: stuEmail,
      headline: `${stuProgram} Scholar (${stuYear}) | ${stuCollege} | Rotations: ${stuPosting}`,
      avatar: STUDENT_AVATAR,
      coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80',
      verifiedStatus: 'pending',
      accountType: 'student',
      openToWork: true,
      openToWorkText: 'Seeking Hospital Rotatory Postings & Clinical Internships',
      location: stuCity,
      college: stuCollege,
      degreeProgram: stuProgram,
      academicYear: stuYear,
      expectedGraduation: stuGradYear,
      specialization: 'General Physiotherapy & Clinical Foundations',
      qualification: stuProgram,
      about: `Enthusiastic physiotherapy student currently completing ${stuYear} at ${stuCollege}. Passionate about evidence-based clinical rotations, physical rehabilitation modalities, and assisting seniors during hospital rounds.`,
      clinicalRotations: [],
      experiences: [],
      education: [
        {
          id: `edu_stu_${Date.now()}`,
          school: stuCollege,
          degree: stuProgram,
          fieldOfStudy: 'Physiotherapy',
          startYear: '',
          endYear: stuGradYear,
        },
      ],
      publications: [],
      certifications: [],
      skills: [],
      connectionsCount: 0,
      followersCount: 0,
    };

    setErrorMsg(null);
    setSubmitting(true);
    const error = await onSignUp(newProfile, stuPassword);
    setSubmitting(false);
    if (error) setErrorMsg(error);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex flex-col justify-between">
      
      {/* Top Navbar */}
      <nav className="w-full bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="PhysioLink"
            className="w-9 h-9 rounded-xl object-cover shadow border border-teal-500/30"
          />
          <div>
            <span className="text-lg font-bold text-white font-display tracking-tight leading-none block">
              PhysioLink
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-wide uppercase">
              The Network for Every Physiotherapist.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
        </div>
      </nav>

      {/* Main Content Hero + Auth Card */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10">
        
        {/* Left Column: Platform Mission & Value Props */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 bg-teal-950/70 border border-teal-800/80 px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Dedicated Exclusively to the Physiotherapy Community</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
            Connect. Publish. Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-300">Physiotherapy Career</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            India’s dedicated professional network for registered physiotherapists, university students, clinical researchers, and healthcare institutions. Upholding clinical excellence with council verification.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white">For Qualified Clinicians</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Showcase council registration, discuss complex case studies, and receive patient referrals.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white">For Students & Interns</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Log rotatory hospital postings, connect with senior mentors, and discover accredited internships.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
                <Microscope className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white">Research & Academics</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Exchange clinical trial protocols, cite peer-reviewed papers, and find academic co-authors.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-white">Institutional Standards</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Hospital and clinic hiring boards with verified clinical licenses and zero spam recruitment.
              </p>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 font-mono">
            <div>
              <strong className="text-white font-bold">18,400+</strong> Clinicians
            </div>
            <span>·</span>
            <div>
              <strong className="text-white font-bold">240+</strong> PT Colleges
            </div>
            <span>·</span>
            <div>
              <strong className="text-teal-400 font-bold">100%</strong> Council Audited
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Authentication Box */}
        <div className="lg:w-1/2 max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Top Auth Mode Tabs */}
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-center">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                className={`py-3.5 px-2 transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'border-blue-700 text-blue-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('signup_pro'); setErrorMsg(null); }}
                className={`py-3.5 px-2 transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                  authMode === 'signup_pro'
                    ? 'border-blue-700 text-blue-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Join as Pro</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('signup_student'); setErrorMsg(null); }}
                className={`py-3.5 px-2 transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                  authMode === 'signup_student'
                    ? 'border-teal-700 text-teal-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Join as Student</span>
              </button>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="bg-rose-50 border-b border-rose-200 text-rose-700 px-4 py-2.5 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* FORM 1: LOGIN */}
            {authMode === 'login' && (
              <div className="p-6 sm:p-7 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Welcome Back</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in with your registered email or Council Registration ID
                  </p>
                </div>

                <form onSubmit={handleSubmitLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email or Council Reg ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. dr.priya@prorehab.in or IAP/2017/0843"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to registered email address.')}
                        className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>Sign In to PhysioLink</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

            {/* FORM 2: SIGN UP AS QUALIFIED CLINICIAN */}
            {authMode === 'signup_pro' && (
              <div className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 mb-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Qualified Clinician Profile</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Create Professional Account</h2>
                  <p className="text-xs text-slate-500">
                    Connect with clinical peers across India with council credentialing
                  </p>
                </div>

                <form onSubmit={handleProSignUp} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name (with Prefix)
                    </label>
                    <input
                      type="text"
                      required
                      value={proName}
                      onChange={(e) => setProName(e.target.value)}
                      placeholder="e.g. Dr. Rohan Mehta, PT"
                      className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Primary Qualification
                      </label>
                      <select
                        value={proDegree}
                        onChange={(e) => setProDegree(e.target.value)}
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="BPT (Bachelor of Physiotherapy)">BPT (Bachelor of Physiotherapy)</option>
                        <option value="MPT (Sports Physiotherapy)">MPT (Sports Physiotherapy)</option>
                        <option value="MPT (Musculoskeletal / Orthopedics)">MPT (Musculoskeletal / Ortho)</option>
                        <option value="MPT (Neurological Sciences)">MPT (Neurological Sciences)</option>
                        <option value="MPT (Cardiorespiratory & Pulmonary)">MPT (Cardiorespiratory)</option>
                        <option value="MPT (Pediatric Physiotherapy)">MPT (Pediatric Physiotherapy)</option>
                        <option value="PhD in Physiotherapy">PhD in Physiotherapy</option>
                        <option value="Doctor of Physical Therapy (DPT)">Doctor of Physical Therapy (DPT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Council / IAP Reg No.
                      </label>
                      <input
                        type="text"
                        required
                        value={proRegNo}
                        onChange={(e) => setProRegNo(e.target.value)}
                        placeholder="e.g. MH-PT-2020-0491"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Clinical Specialization
                      </label>
                      <input
                        type="text"
                        value={proSpecialization}
                        onChange={(e) => setProSpecialization(e.target.value)}
                        placeholder="e.g. ACL Rehab, Sports Medicine"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Years of Practice
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={proExperience}
                        onChange={(e) => setProExperience(e.target.value)}
                        placeholder="e.g. 6"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Current Hospital / Clinic / Workplace
                    </label>
                    <input
                      type="text"
                      value={proHospital}
                      onChange={(e) => setProHospital(e.target.value)}
                      placeholder="e.g. Lilavati Hospital & Research Centre, Mumbai"
                      className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Professional Email
                      </label>
                      <input
                        type="email"
                        required
                        value={proEmail}
                        onChange={(e) => setProEmail(e.target.value)}
                        placeholder="dr.rohan@rehab.in"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Create Password
                      </label>
                      <input
                        type="password"
                        required
                        value={proPassword}
                        onChange={(e) => setProPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={proConsent}
                        onChange={(e) => setProConsent(e.target.checked)}
                        className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-3.5 h-3.5 mt-0.5"
                      />
                      <span>
                        I confirm that I hold a recognized qualification in Physiotherapy and agree to council verification.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <span>Create Clinician Account & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* FORM 3: SIGN UP AS STUDENT / INTERN */}
            {authMode === 'signup_student' && (
              <div className="p-6 sm:p-7 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 mb-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Physiotherapy Student / Intern Profile</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Create Student Account</h2>
                  <p className="text-xs text-slate-500">
                    Track clinical hospital rotations and connect with academic mentors
                  </p>
                </div>

                <form onSubmit={handleStudentSignUp} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Student Name
                    </label>
                    <input
                      type="text"
                      required
                      value={stuName}
                      onChange={(e) => setStuName(e.target.value)}
                      placeholder="e.g. Ananya Deshmukh"
                      className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Physiotherapy University / College
                    </label>
                    <input
                      type="text"
                      required
                      value={stuCollege}
                      onChange={(e) => setStuCollege(e.target.value)}
                      placeholder="e.g. Manipal College of Health Professions (MAHE)"
                      className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Degree Program
                      </label>
                      <select
                        value={stuProgram}
                        onChange={(e) => setStuProgram(e.target.value)}
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="BPT (Bachelor of Physiotherapy)">BPT (Bachelor of Physiotherapy)</option>
                        <option value="MPT (Master of Physiotherapy)">MPT (Master of Physiotherapy)</option>
                        <option value="Compulsory 6-Month Rotatory Intern">Compulsory 6-Month Intern</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Current Academic Stage
                      </label>
                      <select
                        value={stuYear}
                        onChange={(e) => setStuYear(e.target.value)}
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="BPT 1st Year">BPT 1st Year</option>
                        <option value="BPT 2nd Year">BPT 2nd Year</option>
                        <option value="BPT 3rd Year">BPT 3rd Year</option>
                        <option value="BPT Final Year (4th Year)">BPT Final Year (4th Year)</option>
                        <option value="Internship Batch 2026">Internship Batch 2026</option>
                        <option value="MPT 1st Year">MPT 1st Year</option>
                        <option value="MPT 2nd Year">MPT 2nd Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Current Hospital Posting
                      </label>
                      <input
                        type="text"
                        value={stuPosting}
                        onChange={(e) => setStuPosting(e.target.value)}
                        placeholder="e.g. ICU & Cardio-pulmonary Ward"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Completion Year
                      </label>
                      <input
                        type="text"
                        value={stuGradYear}
                        onChange={(e) => setStuGradYear(e.target.value)}
                        placeholder="2026"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Student Email
                      </label>
                      <input
                        type="email"
                        required
                        value={stuEmail}
                        onChange={(e) => setStuEmail(e.target.value)}
                        placeholder="ananya.pt@college.edu.in"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Create Password
                      </label>
                      <input
                        type="password"
                        required
                        value={stuPassword}
                        onChange={(e) => setStuPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stuConsent}
                        onChange={(e) => setStuConsent(e.target.checked)}
                        className="rounded border-slate-300 text-teal-700 focus:ring-teal-500 w-3.5 h-3.5 mt-0.5"
                      />
                      <span>
                        I agree to uphold patient confidentiality during clinical case presentations and rotatory logs.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <span>Create Student Account & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Footer Strip */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Protected by Council Verification</span>
              </span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} PhysioLink India & International. The Network for Every Physiotherapist.</p>
          <p className="flex items-center gap-3">
            <span>Clinical Code of Ethics</span>
            <span>·</span>
            <span>State Council Verification Guidelines</span>
            <span>·</span>
            <span>Patient privacy first (HIPAA/DISHA-aligned design)</span>
          </p>
        </div>
      </footer>

    </div>
  );
};
