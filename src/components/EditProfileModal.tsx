import React, { useState } from 'react';
import { UserProfile, AccountType, Education, SkillItem } from '../types';
import { 
  X, 
  Check, 
  Building, 
  GraduationCap, 
  Stethoscope, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar,
  Award,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => void;
  initialTab?: 'general' | 'education' | 'skills';
}

const SUGGESTED_PHYSIO_SKILLS = [
  'Manual Therapy',
  'Pediatric Rehabilitation',
  'ACL Return-to-Sport Protocols',
  'Dry Needling',
  'Manual Therapy (Maitland / Mulligan)',
  'Neurological Rehabilitation (NDT/Bobath)',
  'Isokinetic Dynamometry',
  'Biomechanical Gait Analysis',
  'Bedside ICU Chest Physiotherapy',
  'Goniometry & Joint Mobility',
  'Pediatric Sensory Integration',
  'Vestibular & Balance Training',
  'Kinesiology Taping',
  'Electrotherapy & Ultrasound',
  'Spine Mobilization & Core Stability',
  'Post-Arthroplasty Protocols',
  'Sports Injury Sideline Care',
  'Stroke Neuroplasticity Training'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  initialTab = 'general',
}) => {
  if (!isOpen) return null;

  const [activeModalTab, setActiveModalTab] = useState<'general' | 'education' | 'skills'>(initialTab);

  // General fields
  const [accountType, setAccountType] = useState<AccountType>(user.accountType);
  const [headline, setHeadline] = useState(user.headline);
  const [location, setLocation] = useState(user.location);
  const [specialization, setSpecialization] = useState(user.specialization);
  const [qualification, setQualification] = useState(user.qualification);
  const [about, setAbout] = useState(user.about);
  const [openToWork, setOpenToWork] = useState(user.openToWork);
  const [openToWorkText, setOpenToWorkText] = useState(user.openToWorkText || '');

  // Clinician fields
  const [currentPosition, setCurrentPosition] = useState(user.currentPosition || '');
  const [currentCompany, setCurrentCompany] = useState(user.currentCompany || '');
  const [workplaceType, setWorkplaceType] = useState(user.workplaceType || 'Hospital / Healthcare Clinic');
  const [registrationNumber, setRegistrationNumber] = useState(user.registrationNumber || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(user.yearsOfExperience || 0);

  // Student fields
  const [college, setCollege] = useState(user.college || '');
  const [degreeProgram, setDegreeProgram] = useState(user.degreeProgram || 'Bachelor of Physiotherapy (BPT)');
  const [academicYear, setAcademicYear] = useState(user.academicYear || 'Final Year Rotatory Intern');
  const [expectedGraduation, setExpectedGraduation] = useState(user.expectedGraduation || '2027');
  const [academicMentor, setAcademicMentor] = useState(user.academicMentor || '');

  // Education list state
  const [educationList, setEducationList] = useState<Education[]>(user.education || []);

  // Education item form state (for Add / Edit)
  const [isEditingEdu, setIsEditingEdu] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStartYear, setEduStartYear] = useState('');
  const [eduEndYear, setEduEndYear] = useState('');
  const [eduGrade, setEduGrade] = useState('');
  const [eduDescription, setEduDescription] = useState('');

  // Skills list state
  const [skillsList, setSkillsList] = useState<SkillItem[]>(user.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Education handlers
  const handleStartAddEdu = () => {
    setEditingEduId(null);
    setEduDegree('');
    setEduSchool('');
    setEduField('');
    setEduStartYear('2020');
    setEduEndYear('2024');
    setEduGrade('');
    setEduDescription('');
    setIsEditingEdu(true);
  };

  const handleStartEditEdu = (edu: Education) => {
    setEditingEduId(edu.id);
    setEduDegree(edu.degree);
    setEduSchool(edu.school);
    setEduField(edu.fieldOfStudy || '');
    setEduStartYear(edu.startYear);
    setEduEndYear(edu.endYear);
    setEduGrade(edu.grade || '');
    setEduDescription(edu.description || '');
    setIsEditingEdu(true);
  };

  const handleSaveEduItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDegree.trim() || !eduSchool.trim()) return;

    if (editingEduId) {
      setEducationList((prev) =>
        prev.map((item) =>
          item.id === editingEduId
            ? {
                ...item,
                degree: eduDegree.trim(),
                school: eduSchool.trim(),
                fieldOfStudy: eduField.trim() || undefined,
                startYear: eduStartYear.trim(),
                endYear: eduEndYear.trim(),
                grade: eduGrade.trim() || undefined,
                description: eduDescription.trim() || undefined,
              }
            : item
        )
      );
    } else {
      const newEdu: Education = {
        id: `edu_${Date.now()}`,
        degree: eduDegree.trim(),
        school: eduSchool.trim(),
        fieldOfStudy: eduField.trim() || undefined,
        startYear: eduStartYear.trim(),
        endYear: eduEndYear.trim(),
        grade: eduGrade.trim() || undefined,
        description: eduDescription.trim() || undefined,
      };
      setEducationList((prev) => [...prev, newEdu]);
    }

    setIsEditingEdu(false);
    setEditingEduId(null);
  };

  const handleDeleteEduItem = (id: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  // Skills handlers
  const handleAddSkill = (skillNameToAdd?: string) => {
    const name = (skillNameToAdd || newSkillInput).trim();
    if (!name) return;
    if (skillsList.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    setSkillsList([...skillsList, { name, endorsements: 1 }]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s.name !== skillNameToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      accountType,
      headline,
      location,
      specialization,
      qualification,
      about,
      openToWork,
      openToWorkText,
      education: educationList,
      skills: skillsList,
      currentPosition: accountType === 'student' ? undefined : currentPosition,
      currentCompany: accountType === 'student' ? undefined : currentCompany,
      workplaceType: accountType === 'student' ? undefined : workplaceType,
      registrationNumber: accountType === 'student' ? undefined : registrationNumber,
      yearsOfExperience: accountType === 'student' ? 0 : Number(yearsOfExperience),
      college: accountType === 'student' ? college : (educationList[0]?.school || user.college),
      degreeProgram: accountType === 'student' ? degreeProgram : undefined,
      academicYear: accountType === 'student' ? academicYear : undefined,
      expectedGraduation: accountType === 'student' ? expectedGraduation : undefined,
      academicMentor: accountType === 'student' ? academicMentor : undefined,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Edit Profile & Credentials</h2>
            <p className="text-xs text-slate-500">Configure your position, education history, and clinical skills</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs: General vs Education vs Skills */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveModalTab('general');
              setIsEditingEdu(false);
            }}
            className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeModalTab === 'general'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Position & Bio
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveModalTab('education');
              setIsEditingEdu(false);
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeModalTab === 'education'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>Education ({educationList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveModalTab('skills');
              setIsEditingEdu(false);
            }}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeModalTab === 'skills'
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Clinical Skills ({skillsList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[72vh] overflow-y-auto space-y-5 text-sm">
          
          {/* TAB 1: General & Position */}
          {activeModalTab === 'general' && (
            <>
              {/* Account Track Toggle: Clinician vs Student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Profile Type (LinkedIn-style mode)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('clinician')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      accountType === 'clinician'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Practicing Clinician / Professional</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('student')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      accountType === 'student'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>Student / Clinical Intern</span>
                  </button>
                </div>
              </div>

              {/* Conditional Section 1: Clinician Currently Working Position */}
              {accountType !== 'student' ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Current Clinical Position & Workplace</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Current Position / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={currentPosition}
                        onChange={(e) => setCurrentPosition(e.target.value)}
                        placeholder="e.g. Senior Consultant Sports PT"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Current Hospital / Clinic / Workplace *
                      </label>
                      <input
                        type="text"
                        required
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        placeholder="e.g. Apollo Hospital or ProRehab Clinic"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Facility Type
                      </label>
                      <select
                        value={workplaceType}
                        onChange={(e) => setWorkplaceType(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Hospital / Healthcare Clinic">Tertiary Hospital</option>
                        <option value="Sports & Orthopedic Clinic">Sports & Ortho Center</option>
                        <option value="Academic Medical University">University Department</option>
                        <option value="Private Outpatient Practice">Private Practice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        State Council / IAP Reg #
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. IAP/MSOTPT/2018/0942"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Years of Clinical Exp
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Conditional Section 2: Student Academic Information */
                <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                    <GraduationCap className="w-4 h-4 text-teal-700" />
                    <span>Student Academic Details & Current Rotations</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Enrolled College / University *
                      </label>
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. Manipal College of Health Professions"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Degree Program *
                      </label>
                      <select
                        value={degreeProgram}
                        onChange={(e) => setDegreeProgram(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="Bachelor of Physiotherapy (BPT)">Bachelor of Physiotherapy (BPT)</option>
                        <option value="Master of Physiotherapy (MPT Ortho)">Master of Physiotherapy (MPT Ortho)</option>
                        <option value="Master of Physiotherapy (MPT Neuro)">Master of Physiotherapy (MPT Neuro)</option>
                        <option value="Master of Physiotherapy (MPT Sports)">Master of Physiotherapy (MPT Sports)</option>
                        <option value="Master of Physiotherapy (MPT Pediatrics)">Master of Physiotherapy (MPT Pediatrics)</option>
                        <option value="Doctor of Physical Therapy (DPT)">Doctor of Physical Therapy (DPT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Current Academic Year *
                      </label>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="1st Year BPT">1st Year Student</option>
                        <option value="2nd Year BPT">2nd Year Student</option>
                        <option value="3rd Year BPT">3rd Year Student</option>
                        <option value="4th Year BPT">4th Year Finalist</option>
                        <option value="Final Year Rotatory Intern">Final Year Rotatory Intern (6-mo)</option>
                        <option value="1st Year MPT Scholar">1st Year MPT Postgraduate</option>
                        <option value="Final Year MPT Scholar">Final Year MPT Postgraduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Expected Graduation
                      </label>
                      <input
                        type="text"
                        value={expectedGraduation}
                        onChange={(e) => setExpectedGraduation(e.target.value)}
                        placeholder="e.g. October 2026"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Faculty Guide / Mentor
                      </label>
                      <input
                        type="text"
                        value={academicMentor}
                        onChange={(e) => setAcademicMentor(e.target.value)}
                        placeholder="e.g. Prof. Dr. Rajesh Patel"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Professional Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Consultant Sports Physiotherapist | Ex-BCCI Specialist"
                    className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Primary Specialization / Interest
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Musculoskeletal, Neuro, Sports, Pediatrics"
                      className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Location (City, State, Country)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai, Maharashtra, India"
                      className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    About / Clinical Overview
                  </label>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Share your clinical background, areas of practice, or student aspirations..."
                    className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* LinkedIn-Style Open to Opportunities Checkbox */}
                <div className="pt-2 border-t border-slate-100 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="openToWorkCheckbox"
                    checked={openToWork}
                    onChange={(e) => setOpenToWork(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div className="flex-1">
                    <label htmlFor="openToWorkCheckbox" className="text-xs font-semibold text-slate-900 cursor-pointer">
                      Show "Open to Opportunities / Internships" badge on profile
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Adds a prominent indicator signaling to clinics, hospitals, and professors that you are available for roles or clinical rotations.
                    </p>
                    {openToWork && (
                      <input
                        type="text"
                        value={openToWorkText}
                        onChange={(e) => setOpenToWorkText(e.target.value)}
                        placeholder={accountType === 'student' ? 'e.g. Open to Clinical Internships & Fellowships' : 'e.g. Open to Clinical Consultations & Athlete Referrals'}
                        className="mt-2 w-full bg-slate-50 text-xs border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Education History Sub-Section directly accessible in main form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <GraduationCap className="w-4 h-4 text-teal-600" />
                      <span>Education History ({educationList.length} Degree Entries)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalTab('education');
                        handleStartAddEdu();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Education</span>
                    </button>
                  </div>

                  {educationList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No degrees added yet. Click "+ Add Education" to add degree, institution, start date, and end date.</p>
                  ) : (
                    <div className="space-y-2">
                      {educationList.map((edu) => (
                        <div key={edu.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{edu.degree}</span>
                            <span className="text-slate-500"> · {edu.school}</span>
                            <span className="text-[11px] text-teal-700 block font-mono">{edu.startYear} – {edu.endYear}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModalTab('education');
                              handleStartEditEdu(edu);
                            }}
                            className="text-xs text-blue-700 hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clinical Skills Sub-Section directly in main form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Clinical & Professional Skills ({skillsList.length} Registered)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('skills')}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Manage Skills</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs"
                      >
                        <span>{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer font-bold"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: Robust Education History Section */}
          {activeModalTab === 'education' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Education & Academic Qualifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add degrees, university programs, start and graduation years (BPT, MPT, PhD, Diplomas)
                  </p>
                </div>
                {!isEditingEdu && (
                  <button
                    type="button"
                    onClick={handleStartAddEdu}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                )}
              </div>

              {isEditingEdu && (
                <div className="p-4 bg-slate-50 rounded-xl border border-blue-200 space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      {editingEduId ? 'Edit Education Entry' : 'Add New Degree / University'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingEdu(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Degree / Qualification *
                      </label>
                      <input
                        type="text"
                        required
                        value={eduDegree}
                        onChange={(e) => setEduDegree(e.target.value)}
                        placeholder="e.g. Bachelor of Physiotherapy (BPT) or MPT Sports"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Institution / College / University *
                      </label>
                      <input
                        type="text"
                        required
                        value={eduSchool}
                        onChange={(e) => setEduSchool(e.target.value)}
                        placeholder="e.g. Manipal College of Health Professions"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={eduField}
                        onChange={(e) => setEduField(e.target.value)}
                        placeholder="e.g. Musculoskeletal, Neuro, Sports"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Start Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={eduStartYear}
                        onChange={(e) => setEduStartYear(e.target.value)}
                        placeholder="e.g. 2016"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        End Year (or Expected) *
                      </label>
                      <input
                        type="text"
                        required
                        value={eduEndYear}
                        onChange={(e) => setEduEndYear(e.target.value)}
                        placeholder="e.g. 2021 or Present"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Grade / Honors / CGPA (Optional)
                      </label>
                      <input
                        type="text"
                        value={eduGrade}
                        onChange={(e) => setEduGrade(e.target.value)}
                        placeholder="e.g. First Class with Distinction / Gold Medalist"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Activities / Thesis Topic (Optional)
                      </label>
                      <input
                        type="text"
                        value={eduDescription}
                        onChange={(e) => setEduDescription(e.target.value)}
                        placeholder="e.g. Thesis on ACL Knee Biomechanics, Student Council"
                        className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingEdu(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEduItem}
                      className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      {editingEduId ? 'Update Entry' : 'Add to Education List'}
                    </button>
                  </div>
                </div>
              )}

              {educationList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                  <GraduationCap className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No education entries added yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add Degree" to add your BPT, MPT, or Fellowship credentials.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {educationList.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{edu.school}</h4>
                          <p className="text-xs font-semibold text-blue-800 mt-0.5">
                            {edu.degree} {edu.fieldOfStudy && `· ${edu.fieldOfStudy}`}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {edu.startYear} – {edu.endYear}
                            </span>
                            {edu.grade && (
                              <>
                                <span>·</span>
                                <span className="font-sans font-medium text-teal-700">{edu.grade}</span>
                              </>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditEdu(edu)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit this entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEduItem(edu.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete this entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Clinical & Professional Skills Management */}
          {activeModalTab === 'skills' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Clinical Competencies & Modalities
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add clinical specializations, assessment techniques, and rehabilitation modalities
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {skillsList.length} Skills Added
                </span>
              </div>

              {/* Add Custom Skill Input Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Add Clinical Skill or Modality
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g. Dry Needling, ACL Return-to-Play, NDT/Bobath, Bedside ICU PT..."
                    className="flex-1 bg-white text-xs border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Current Skills Tags with Removers */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  Active Profile Skills:
                </span>
                {skillsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills added yet. Select from the suggestions below or type your own.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill) => (
                      <div
                        key={skill.name}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 shadow-2xs"
                      >
                        <span>{skill.name}</span>
                        {skill.endorsements > 0 && (
                          <span className="font-mono text-[10px] bg-white text-blue-700 px-1.5 py-0.2 rounded-full border border-blue-200">
                            {skill.endorsements}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-blue-400 hover:text-rose-600 transition-colors cursor-pointer font-bold ml-0.5"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Click-to-Add Suggested Physiotherapy Skills */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Quick-Add Suggested Physiotherapy Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PHYSIO_SKILLS.map((suggested) => {
                    const alreadyAdded = skillsList.some(
                      (s) => s.name.toLowerCase() === suggested.toLowerCase()
                    );
                    return (
                      <button
                        key={suggested}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => handleAddSkill(suggested)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          alreadyAdded
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {alreadyAdded ? '✓ ' : '+ '}
                        {suggested}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              {activeModalTab === 'skills'
                ? `${skillsList.length} skill(s) registered`
                : activeModalTab === 'education'
                ? `${educationList.length} qualification(s) recorded`
                : 'All fields saved to your live profile'}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
