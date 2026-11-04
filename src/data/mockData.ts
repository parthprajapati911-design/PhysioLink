import { UserProfile, Post, Opportunity, Connection, VerificationRequest, Conversation, ChatMessage } from '../types';

export const LOGO_URL = '/images/physiolink_logo_emblem_1793727246789.jpg';
export const SPORTS_AVATAR = '/images/avatar_sports_physio_1793727249301.jpg';
export const NEURO_AVATAR = '/images/avatar_neuro_researcher_1793727248294.jpg';
export const STUDENT_AVATAR = '/images/avatar_student_intern_1793727248880.jpg';
export const CLINICAL_CASE_IMAGE = '/images/clinical_rehab_case_1793727249022.jpg';

export const DEFAULT_USERS: Record<string, UserProfile> = {
  sports_pt: {
    id: 'sports_pt',
    name: 'Dr. Priya Sharma, PT',
    email: 'priya.sharma@prorehab.in',
    headline: 'Senior Consultant Sports Physiotherapist & Clinical Director | Ex-BCCI Rehab Specialist',
    avatar: SPORTS_AVATAR,
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    verifiedStatus: 'verified',
    accountType: 'clinician',
    openToWork: true,
    openToWorkText: 'Open to Clinical Consultations & Athlete Referrals',
    location: 'Mumbai, Maharashtra, India',
    currentPosition: 'Clinical Director & Lead Sports PT',
    currentCompany: 'ProRehab Performance & Sports Medicine Center',
    workplaceType: 'Sports & Orthopedic Clinic',
    registrationNumber: 'IAP/MSOTPT/2017/0843',
    councilName: 'Maharashtra State Council for OT & PT / Indian Association of Physiotherapists',
    specialization: 'Sports & Musculoskeletal Rehabilitation',
    qualification: 'BPT, MPT (Sports), CSCS, Dip. FIFA Football Medicine',
    yearsOfExperience: 9,
    about: 'Dedicated musculoskeletal & sports physical therapist specializing in ACL rehabilitation, return-to-play protocols, and athletic load management. Trained over 450+ state and national level athletes. Passionate about evidence-based clinical practices and integrating objective digital dynamometry with functional movement assessments.',
    experiences: [
      {
        id: 'exp_1',
        title: 'Clinical Director & Lead Sports PT',
        company: 'ProRehab Performance & Sports Medicine Center',
        employmentType: 'Full-time',
        location: 'Mumbai, India',
        startDate: 'Jun 2021',
        endDate: 'Present',
        isCurrent: true,
        description: 'Lead a team of 8 physiotherapists and strength specialists. Oversee advanced post-operative rehabilitation for elite athletes, biomechanical running analysis, and return-to-sport testing batteries.',
      },
      {
        id: 'exp_2',
        title: 'Consultant Physiotherapist',
        company: 'Apollo Spectra Hospitals',
        employmentType: 'Consultant',
        location: 'Mumbai, India',
        startDate: 'Aug 2018',
        endDate: 'May 2021',
        isCurrent: false,
        description: 'Managed complex arthroscopy and joint replacement rehabilitation. Conducted weekly joint clinical audit rounds with orthopedic surgeons.',
      },
      {
        id: 'exp_3',
        title: 'Sports Physiotherapist',
        company: 'Mumbai Cricket Association Academy',
        employmentType: 'Full-time',
        location: 'Mumbai, India',
        startDate: 'Jul 2016',
        endDate: 'Jul 2018',
        isCurrent: false,
        description: 'Managed acute pitch-side trauma, bowling biomechanics screenings, and shoulder impingement pre-habilitation programs.',
      },
    ],
    education: [
      {
        id: 'edu_1',
        school: 'Manipal College of Health Professions (MAHE)',
        degree: 'Master of Physiotherapy (MPT)',
        fieldOfStudy: 'Sports Sciences & Musculoskeletal Physiotherapy',
        startYear: '2014',
        endYear: '2016',
        grade: 'First Class with Distinction',
      },
      {
        id: 'edu_2',
        school: 'Seth G.S. Medical College & KEM Hospital',
        degree: 'Bachelor of Physiotherapy (BPT)',
        fieldOfStudy: 'Physiotherapy',
        startYear: '2009',
        endYear: '2014',
        grade: 'Gold Medalist',
      },
    ],
    publications: [
      {
        id: 'pub_1',
        title: 'Objective Quadriceps Symmetry Index at 6-Months Post-BPTB ACL Reconstruction and Risk of Secondary Graft Rupture',
        journal: 'Journal of Orthopaedic & Sports Physical Therapy (JOSPT)',
        year: '2023',
        doi: '10.2519/jospt.2023.1189',
        coAuthors: 'Dr. R. Kulkarni, Dr. A. Vora',
      },
      {
        id: 'pub_2',
        title: 'Eccentric Hamstring Peak Torque Deficits in Elite Indian Track Sprinters: A Cross-Sectional Analysis',
        journal: 'Asian Journal of Sports Medicine',
        year: '2021',
        doi: '10.5812/asjsm.10423',
        coAuthors: 'Dr. S. Nair',
      },
    ],
    certifications: [
      {
        id: 'cert_1',
        title: 'Certified Strength and Conditioning Specialist (CSCS)',
        issuer: 'National Strength and Conditioning Association (NSCA)',
        issueDate: '2019',
        credentialId: 'CSCS-724391',
      },
      {
        id: 'cert_2',
        title: 'Diploma in Football Medicine',
        issuer: 'FIFA Medical Assessment and Research Centre (F-MARC)',
        issueDate: '2020',
      },
      {
        id: 'cert_3',
        title: 'Dry Needling & Advanced Myofascial Trigger Point Practitioner',
        issuer: 'David G. Simons Academy (DGSA)',
        issueDate: '2018',
      },
    ],
    skills: [
      { 
        name: 'Manual Therapy (Maitland / Mulligan)', 
        endorsements: 52,
        category: 'Clinical Modalities',
        endorsers: [
          { id: 'neuro_researcher', name: 'Prof. Dr. Rajesh Patel', headline: 'Head of Neuro-Rehabilitation Research', avatar: NEURO_AVATAR, verified: true },
          { id: 'peer_1', name: 'Dr. Anand Verma, PT', headline: 'Consultant Orthopedic PT @ Manipal', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80', verified: true },
          { id: 'peer_2', name: 'Dr. Meera Iyer, PT', headline: 'Senior Manual Therapist @ Fortis', avatar: 'https://images.unsplash.com/photo-1594824813589-3c878065fca1?w=120&auto=format&fit=crop&q=80', verified: true }
        ]
      },
      { 
        name: 'ACL Return-to-Sport Protocols', 
        endorsements: 68,
        category: 'Sports & Musculoskeletal',
        endorsers: [
          { id: 'peer_3', name: 'Dr. Vikram Malhotra', headline: 'Head Orthopedic Surgeon @ Apollo Sports', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80', verified: true },
          { id: 'peer_1', name: 'Dr. Anand Verma, PT', headline: 'Consultant Orthopedic PT @ Manipal', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80', verified: true }
        ]
      },
      { 
        name: 'Pediatric Rehabilitation', 
        endorsements: 34,
        category: 'Rehabilitation Speciality',
        endorsers: [
          { id: 'student_pt', name: 'Neha Sharma', headline: 'BPT Intern @ Manipal', avatar: STUDENT_AVATAR, verified: true },
          { id: 'peer_4', name: 'Dr. Sunita Rao, PT', headline: 'Pediatric Developmental Specialist', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80', verified: true }
        ]
      },
      { 
        name: 'Dry Needling', 
        endorsements: 46,
        category: 'Clinical Modalities',
        endorsers: [
          { id: 'peer_2', name: 'Dr. Meera Iyer, PT', headline: 'Senior Manual Therapist @ Fortis', avatar: 'https://images.unsplash.com/photo-1594824813589-3c878065fca1?w=120&auto=format&fit=crop&q=80', verified: true }
        ]
      },
      { 
        name: 'Goniometry & Biomechanics', 
        endorsements: 41,
        category: 'Assessment & Diagnostics',
        endorsers: [
          { id: 'neuro_researcher', name: 'Prof. Dr. Rajesh Patel', headline: 'Head of Neuro-Rehabilitation Research', avatar: NEURO_AVATAR, verified: true }
        ]
      },
      { 
        name: 'Isokinetic Dynamometry', 
        endorsements: 33,
        category: 'Assessment & Diagnostics',
        endorsers: [
          { id: 'peer_3', name: 'Dr. Vikram Malhotra', headline: 'Head Orthopedic Surgeon @ Apollo Sports', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80', verified: true }
        ]
      },
      { 
        name: 'Pitch-side Sports First Aid', 
        endorsements: 29,
        category: 'Sports & Musculoskeletal'
      },
    ],
    connectionsCount: 842,
    followersCount: 1620,
  },

  student_pt: {
    id: 'student_pt',
    name: 'Neha Sharma',
    email: 'neha.sharma.bpt@manipal.edu',
    headline: 'Final Year BPT Rotatory Intern @ Manipal College of Health Professions | Aspiring Neuro PT | Student Council Rep',
    avatar: STUDENT_AVATAR,
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop&q=80',
    verifiedStatus: 'verified',
    accountType: 'student',
    openToWork: true,
    openToWorkText: 'Open to Clinical Fellowships & Junior PT Roles',
    location: 'Manipal / Bengaluru, Karnataka, India',
    specialization: 'Neurological & Pediatric Physiotherapy (Interested)',
    qualification: 'Bachelor of Physiotherapy (BPT Final Year Intern)',
    college: 'Manipal College of Health Professions, MAHE',
    degreeProgram: 'Bachelor of Physiotherapy (BPT 4.5 Years)',
    academicYear: 'Final Year Compulsory Rotatory Intern',
    expectedGraduation: 'October 2026',
    academicMentor: 'Prof. Dr. Rajesh Patel, MPT Neuro, PhD',
    about: 'Final-year Bachelor of Physiotherapy intern completing 6-month rotatory clinical postings across Kasturba Medical Hospital departments. Particularly drawn to neuro-rehabilitation, stroke recovery, and pediatric neuro-developmental therapy (NDT). Active student academic researcher presenting clinical case presentations at national student symposiums.',
    clinicalRotations: [
      {
        id: 'rot_1',
        hospitalName: 'Kasturba Hospital, Manipal',
        department: 'Neurology ICU & Inpatient Stroke Unit',
        duration: '8 Weeks (Current)',
        skillsLearned: 'Bedside neurological assessment, GCS monitoring, sensory stimulation, early mobilization, tilt-table tolerance, and task-specific reach-to-grasp training.',
      },
      {
        id: 'rot_2',
        hospitalName: 'Kasturba Hospital, Manipal',
        department: 'Orthopedics & Arthroplasty Ward',
        duration: '8 Weeks',
        skillsLearned: 'Post-op Total Knee & Hip Arthroplasty protocols, CPM machine operation, gait re-education with walker/crutches, and chest PT in post-anesthetic care.',
      },
      {
        id: 'rot_3',
        hospitalName: 'Child Development Center, Udupi',
        department: 'Pediatric Rehabilitation & NDT Clinic',
        duration: '4 Weeks',
        skillsLearned: 'Gross Motor Function Classification (GMFCS) scoring, pediatric positioning, cerebral palsy gait training, and sensory play integration.',
      },
      {
        id: 'rot_4',
        hospitalName: 'Sports Medicine Outpatient Dept',
        department: 'Sports & Musculoskeletal OP',
        duration: '4 Weeks',
        skillsLearned: 'Therapeutic ultrasound, TENS, cryotherapy, taping, and kinetic chain strengthening for rotator cuff and ankle sprains.',
      },
    ],
    experiences: [
      {
        id: 'exp_s1',
        title: 'Compulsory Rotatory Physiotherapy Intern',
        company: 'Kasturba Medical Hospital, Manipal',
        employmentType: 'Intern',
        location: 'Manipal, India',
        startDate: 'Nov 2025',
        endDate: 'Present',
        isCurrent: true,
        description: 'Complete 36-hour clinical shift rotations covering inpatient ICU, neuro-rehab wards, orthopedics, and outpatient electrotherapy clinics under faculty supervision.',
      },
      {
        id: 'exp_s2',
        title: 'Student Academic Council Representative',
        company: 'MAHE Physiotherapy Student Association',
        employmentType: 'Part-time',
        location: 'Manipal, India',
        startDate: 'Aug 2024',
        endDate: 'Jul 2025',
        isCurrent: false,
        description: 'Coordinated student journal club sessions, peer-led case study revisions, and organized the Annual National Physiotherapy Student Conclave.',
      },
    ],
    education: [
      {
        id: 'edu_s1',
        school: 'Manipal College of Health Professions, MAHE',
        degree: 'Bachelor of Physiotherapy (BPT)',
        fieldOfStudy: 'Physiotherapy & Rehabilitation Sciences',
        startYear: '2021',
        endYear: '2026',
        grade: 'Current Aggregate: 82.4%',
      },
    ],
    publications: [
      {
        id: 'pub_s1',
        title: 'Effectiveness of Virtual Reality Exergaming on Upper Limb Motor Recovery in Subacute Stroke: A Student Systematic Review',
        journal: 'Indian Journal of Physiotherapy Student Research (Presented at PhysioCon)',
        year: '2025',
        coAuthors: 'Guided by Dr. Rajesh Patel',
      },
    ],
    certifications: [
      {
        id: 'cert_s1',
        title: 'Basic Life Support (BLS) Healthcare Provider',
        issuer: 'American Heart Association (AHA)',
        issueDate: '2024',
        credentialId: 'AHA-BLS-99382',
      },
      {
        id: 'cert_s2',
        title: 'Fundamentals of Neuro-Developmental Treatment (NDT)',
        issuer: 'NDTA Certified Student Workshop',
        issueDate: '2025',
      },
    ],
    skills: [
      { 
        name: 'Pediatric Rehabilitation', 
        endorsements: 21,
        category: 'Rehabilitation Speciality',
        endorsers: [
          { id: 'neuro_researcher', name: 'Prof. Dr. Rajesh Patel', headline: 'Head of Neuro-Rehabilitation Research', avatar: NEURO_AVATAR, verified: true },
          { id: 'sports_pt', name: 'Dr. Priya Sharma, PT', headline: 'Senior Consultant Sports Physiotherapist', avatar: SPORTS_AVATAR, verified: true }
        ]
      },
      { 
        name: 'Manual Therapy', 
        endorsements: 16,
        category: 'Clinical Modalities',
        endorsers: [
          { id: 'sports_pt', name: 'Dr. Priya Sharma, PT', headline: 'Senior Consultant Sports Physiotherapist', avatar: SPORTS_AVATAR, verified: true }
        ]
      },
      { 
        name: 'Neurological Assessment (FMA / BBS)', 
        endorsements: 28,
        category: 'Assessment & Diagnostics',
        endorsers: [
          { id: 'neuro_researcher', name: 'Prof. Dr. Rajesh Patel', headline: 'Head of Neuro-Rehabilitation Research', avatar: NEURO_AVATAR, verified: true }
        ]
      },
      { 
        name: 'Gait Training & Assistive Devices', 
        endorsements: 24,
        category: 'Functional Rehabilitation' 
      },
      { 
        name: 'Bedside Mobilization in ICU', 
        endorsements: 19,
        category: 'Acute Care & Inpatient' 
      },
      { 
        name: 'Electrotherapy Modalities', 
        endorsements: 22,
        category: 'Clinical Modalities' 
      },
    ],
    connectionsCount: 312,
    followersCount: 480,
  },

  neuro_researcher: {
    id: 'neuro_researcher',
    name: 'Prof. Dr. Rajesh Patel, PhD, MPT',
    email: 'rajesh.patel@nni.ac.in',
    headline: 'Professor & Head of Neuro-Rehabilitation Research | Co-Editor, Journal of Clinical Physical Therapy',
    avatar: NEURO_AVATAR,
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
    verifiedStatus: 'verified',
    accountType: 'researcher',
    openToWork: false,
    openToWorkText: 'Seeking Multi-Center Clinical Trial Collaborators',
    location: 'Bengaluru, Karnataka, India',
    currentPosition: 'Professor & Chair of Neurological Rehabilitation',
    currentCompany: 'National Neuroscience & Rehabilitation Institute',
    workplaceType: 'Academic Medical Research University',
    registrationNumber: 'IAP/KA/2005/0192',
    councilName: 'Karnataka State Physiotherapy Council / IAP',
    specialization: 'Neurological Physical Therapy & Neuroplasticity',
    qualification: 'BPT, MPT (Neuro), PhD (Neurosciences), FIMST',
    yearsOfExperience: 21,
    about: 'Clinical scientist and academician with 20+ years investigating neuroplasticity paradigms in hemiparetic stroke, Parkinson’s disease, and spinal cord injury. Principle Investigator on 4 ICMR-funded clinical trials examining robotic-assisted gait and brain-computer interface (BCI) motor priming.',
    experiences: [
      {
        id: 'exp_r1',
        title: 'Professor & Chair of Neurological Rehabilitation',
        company: 'National Neuroscience & Rehabilitation Institute',
        employmentType: 'Full-time',
        location: 'Bengaluru, India',
        startDate: 'Jan 2017',
        endDate: 'Present',
        isCurrent: true,
        description: 'Lead postgraduate MPT & PhD clinical research programs. Direct the gait biomechanics and electro-neurophysiology research laboratory.',
      },
      {
        id: 'exp_r2',
        title: 'Associate Professor',
        company: 'NIMHANS Allied Health Sciences',
        employmentType: 'Full-time',
        location: 'Bengaluru, India',
        startDate: 'Jul 2010',
        endDate: 'Dec 2016',
        isCurrent: false,
        description: 'Supervised clinical neuro-physical therapy units and published peer-reviewed intervention outcomes in cerebellar ataxia.',
      },
    ],
    education: [
      {
        id: 'edu_r1',
        school: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
        degree: 'Doctor of Philosophy (PhD)',
        fieldOfStudy: 'Neurophysiology & Motor Control Rehabilitation',
        startYear: '2006',
        endYear: '2010',
      },
      {
        id: 'edu_r2',
        school: 'Manipal College of Health Professions',
        degree: 'Master of Physiotherapy (MPT)',
        fieldOfStudy: 'Neurological Sciences',
        startYear: '2001',
        endYear: '2003',
      },
    ],
    publications: [
      {
        id: 'pub_r1',
        title: 'Robotic Exoskeleton Gait Training Combined with Functional Electrical Stimulation in Chronic Spinal Cord Injury: A 12-Week Multicenter Randomized Controlled Trial',
        journal: 'Neurorehabilitation and Neural Repair (NNR)',
        year: '2024',
        doi: '10.1177/1545968324128901',
        coAuthors: 'Patel R, Sundaram K, Miller T, Rao V',
      },
      {
        id: 'pub_r2',
        title: 'Trunk Impairment Scale Reliability and Validity in Acute Ischemic Stroke Survivors: Indian Cohort Normative Data',
        journal: 'Physical Therapy (PTJ - Oxford Academic)',
        year: '2022',
        doi: '10.1093/ptj/pzac044',
      },
    ],
    certifications: [
      {
        id: 'cert_r1',
        title: 'Fellow of International Medical Sciences Academy (FIMSA)',
        issuer: 'IMSA',
        issueDate: '2018',
      },
    ],
    skills: [
      { 
        name: 'Neuroplasticity Interventions', 
        endorsements: 92,
        category: 'Neurological Rehabilitation',
        endorsers: [
          { id: 'sports_pt', name: 'Dr. Priya Sharma, PT', headline: 'Senior Consultant Sports Physiotherapist', avatar: SPORTS_AVATAR, verified: true },
          { id: 'peer_1', name: 'Dr. Anand Verma, PT', headline: 'Consultant Orthopedic PT @ Manipal', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80', verified: true }
        ]
      },
      { 
        name: 'Manual Therapy & Neurodynamic Mobilization', 
        endorsements: 64,
        category: 'Clinical Modalities',
        endorsers: [
          { id: 'sports_pt', name: 'Dr. Priya Sharma, PT', headline: 'Senior Consultant Sports Physiotherapist', avatar: SPORTS_AVATAR, verified: true }
        ]
      },
      { 
        name: 'Pediatric Rehabilitation & Neurodevelopment', 
        endorsements: 58,
        category: 'Rehabilitation Speciality',
        endorsers: [
          { id: 'student_pt', name: 'Neha Sharma', headline: 'BPT Intern @ Manipal', avatar: STUDENT_AVATAR, verified: true }
        ]
      },
      { 
        name: 'Clinical Trial Methodology', 
        endorsements: 76,
        category: 'Research & Academics' 
      },
      { 
        name: 'Electromyography (EMG) Analysis', 
        endorsements: 68,
        category: 'Assessment & Diagnostics' 
      },
      { 
        name: 'Transcranial Magnetic Stimulation (TMS)', 
        endorsements: 54,
        category: 'Neurological Rehabilitation' 
      },
    ],
    connectionsCount: 1420,
    followersCount: 3890,
  },

  admin: {
    id: 'admin',
    name: 'PhysioLink Standards & Verification Committee',
    email: 'standards@physiolink.org',
    headline: 'Central Credential Verification Officer & Clinical Ethics Committee',
    avatar: LOGO_URL,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    verifiedStatus: 'verified',
    accountType: 'admin',
    openToWork: false,
    location: 'New Delhi, India',
    currentPosition: 'Lead Verification Registrar',
    currentCompany: 'PhysioLink National Verification Board',
    workplaceType: 'Regulatory & Credentialing Council',
    specialization: 'Credential Authentication & Council Records Audit',
    qualification: 'Senior Regulatory Clinical Reviewer',
    about: 'Dedicated administrative portal ensuring only genuine registered physiotherapists (State Council / IAP verified) and legitimate students receive verified status on PhysioLink to uphold patient safety and professional credibility.',
    experiences: [],
    education: [],
    publications: [],
    certifications: [],
    skills: [
      { name: 'Council Registry Audit', endorsements: 120 },
      { name: 'Clinical Content Moderation', endorsements: 95 },
    ],
    connectionsCount: 5000,
    followersCount: 12400,
  },
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'sports_pt',
    authorName: 'Dr. Priya Sharma, PT',
    authorHeadline: 'Senior Consultant Sports Physiotherapist | ProRehab Center',
    authorAvatar: SPORTS_AVATAR,
    authorVerified: true,
    accountType: 'clinician',
    timestamp: '2 hours ago',
    type: 'case_study',
    title: 'Clinical Case: 18-Week Return-to-Sport Knee Flexion Milestones following Bone-Patellar Tendon-Bone (BPTB) ACL Reconstruction',
    content: `Sharing an encouraging milestone with a 22-year-old state badminton player at 18-weeks post-op BPTB ACL reconstruction.

Patient presented with residual patellofemoral extensor lag and quad inhibition at week 8. We shifted towards open-kinetic-chain (OKC) knee extension within 90°-45° range coupled with blood flow restriction (BFR) therapy at 70% arterial occlusion pressure.

Key Progression Criteria:
1. Quadriceps Limb Symmetry Index (LSI) progressed from 62% at week 12 to 89% today via digital dynamometry.
2. Active knee flexion reached 143° with zero joint effusion post load (Trace on Stroke Test).
3. Single leg hop for distance: 91% LSI.

Colleagues, what are your preferred reactive agility metrics before clearing court-cutting drills in rotational athletes? Would love your perspectives in the comments.`,
    tags: ['SportsPhysio', 'ACLRehab', 'KneeArthroplasty', 'Biomechanics', 'Orthopedics'],
    clinicalMetrics: [
      { label: 'Active Knee Flexion', value: '143°' },
      { label: 'Quad Symmetry Index', value: '89%' },
      { label: 'Joint Effusion Grade', value: 'Zero / Trace' },
      { label: 'Single Leg Hop LSI', value: '91%' },
    ],
    imageUrl: CLINICAL_CASE_IMAGE,
    documentName: 'ACL_Return_To_Play_Testing_Protocol_v3.pdf',
    likesCount: 142,
    isLiked: false,
    commentsCount: 18,
    comments: [
      {
        id: 'c_1',
        authorName: 'Dr. Vikram Joshi, PT',
        authorHeadline: 'Consultant Orthopedic PT @ Apollo Hospitals',
        authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
        authorVerified: true,
        content: 'Superb work Dr. Priya! For badminton athletes, we also look closely at deceleration control in lateral lunges and change of direction deficit (CODD) using 5-0-5 test before full court clearance.',
        timestamp: '1 hour ago',
        likes: 12,
      },
      {
        id: 'c_2',
        authorName: 'Neha Sharma',
        authorHeadline: 'Final Year BPT Intern @ Manipal',
        authorAvatar: STUDENT_AVATAR,
        authorVerified: true,
        content: 'Thank you for sharing this case Dr. Priya! How long did you keep the BFR cuffs inflated per set during the OKC extensions? We are studying this in our clinical rotations right now.',
        timestamp: '45 mins ago',
        likes: 5,
      },
    ],
    bookmarksCount: 38,
    isBookmarked: false,
  },
  {
    id: 'post_2',
    authorId: 'neuro_researcher',
    authorName: 'Prof. Dr. Rajesh Patel, PhD, MPT',
    authorHeadline: 'Professor & Head of Neuro-Rehabilitation Research',
    authorAvatar: NEURO_AVATAR,
    authorVerified: true,
    accountType: 'researcher',
    timestamp: '5 hours ago',
    type: 'research',
    title: 'Research Release: High-Intensity Task-Specific Training vs Standard Care for Upper Extremity Motor Recovery in Chronic Stroke',
    content: `Our laboratory at the National Neuroscience Institute has just published our multicenter clinical trial in Neurorehabilitation and Neural Repair (NNR).

Key Findings across N=124 chronic stroke survivors (mean 14.2 months post-ictus):
• High-dose repetitive task practice (300 reps/session, 5 days/wk) led to a mean change of +7.8 points on the Fugl-Meyer Upper Extremity (FMA-UE) scale compared to +2.1 points in conventional therapy (p < 0.001).
• Corticomotor excitability via TMS showed significant expansion of the motor map representation for Abductor Pollicis Brevis in the ipsilesional hemisphere.

Open Access PDF and full clinical exercises handbook are available for download. We are now recruiting 4 hospital clinical trial partner sites across India for Phase 2.`,
    tags: ['NeuroRehab', 'StrokeRecovery', 'ClinicalTrial', 'PhysiotherapyResearch', 'Neuroplasticity'],
    clinicalMetrics: [
      { label: 'Sample Cohort', value: 'N=124 Patients' },
      { label: 'FMA-UE Improvement', value: '+7.8 pts' },
      { label: 'Significance', value: 'p < 0.001' },
      { label: 'Retention at 6 Mo', value: '88.4%' },
    ],
    documentName: 'NNR_Task_Specific_Training_Stroke_Trial_2026.pdf',
    likesCount: 236,
    isLiked: true,
    commentsCount: 29,
    comments: [
      {
        id: 'c_3',
        authorName: 'Dr. Sunita Deshmukh, PT',
        authorHeadline: 'Head of Department @ KEM Hospital Physiotherapy',
        authorAvatar: 'https://images.unsplash.com/photo-1594824813627-df2a16d3f234?w=120&auto=format&fit=crop&q=80',
        authorVerified: true,
        content: 'Fascinating data Dr. Rajesh. Our department would be eager to participate as a partner site for the Western region. Sending you a formal collaboration request!',
        timestamp: '3 hours ago',
        likes: 19,
      },
    ],
    bookmarksCount: 94,
    isBookmarked: true,
  },
  {
    id: 'post_3',
    authorId: 'student_pt',
    authorName: 'Neha Sharma',
    authorHeadline: 'Final Year BPT Rotatory Intern @ Manipal College of Health Professions',
    authorAvatar: STUDENT_AVATAR,
    authorVerified: true,
    accountType: 'student',
    timestamp: '1 day ago',
    type: 'student_case',
    title: 'Student Clinical Case Log: Bedside Chest PT & Early Tracheostomy Weaning in Neuro-ICU',
    content: `Wrapping up week 6 of my compulsory ICU rotatory posting at Kasturba Hospital.

Learned so much managing secretions and ventilatory mechanics in a 48-year-old traumatic brain injury (TBI) patient on mechanical ventilation. Under our senior clinical supervisor’s guidance, we combined:
• Manual hyperinflation with localized thoracic expansions.
• Right lateral decubitus positioning with gravity-assisted drainage of lower basal segments.
• Monitored dynamic compliance and tidal volumes before and after suctioning.

Witnessing the patient successfully step down to a high-flow nasal cannula today was the most rewarding clinical moment of my internship! 

Big shoutout to all student interns burning the midnight oil across wards! Keep practicing your auscultation sounds!`,
    tags: ['StudentPhysio', 'CardiopulmonaryPT', 'ICURotation', 'BPTInternship', 'PhysioLife'],
    clinicalMetrics: [
      { label: 'PaO2/FiO2 Ratio', value: 'Improved 210 -> 340' },
      { label: 'Dynamic Compliance', value: '+35% Gain' },
    ],
    likesCount: 189,
    isLiked: false,
    commentsCount: 24,
    comments: [
      {
        id: 'c_4',
        authorName: 'Dr. Priya Sharma, PT',
        authorHeadline: 'Senior Consultant Sports Physiotherapist',
        authorAvatar: SPORTS_AVATAR,
        authorVerified: true,
        content: 'Outstanding dedication Neha! Cardiopulmonary ICU competence is the bedrock of clinical problem solving. Keep up this meticulous charting!',
        timestamp: '18 hours ago',
        likes: 14,
      },
    ],
    bookmarksCount: 21,
    isBookmarked: false,
  },
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'job_1',
    title: 'Lead Sports Physiotherapist (Cricket & Track Athletics)',
    organization: 'National High Performance Sports Center',
    logo: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=120&auto=format&fit=crop&q=80',
    location: 'Bengaluru, Karnataka, India',
    locationType: 'Outpatient Sports Clinic',
    type: 'Full-Time Clinical',
    specialization: 'Sports & Musculoskeletal Physiotherapy',
    stipendOrSalary: '₹75,000 – ₹1,00,000 / month',
    experienceRequired: '3–6 Years Clinical Experience',
    description: 'Seeking a dynamic sports physiotherapist (MPT Sports preferred) to direct injury prevention, acute sideline trauma care, and return-to-sport rehabilitation for junior and senior state athletes.',
    requirements: [
      'BPT + MPT in Sports / Musculoskeletal Physiotherapy',
      'Valid State Council & IAP Registration Certificate',
      'Experience with force plates, isokinetic dynamometry and GPS load monitoring',
      'BLS / Sports First Aid Certified',
    ],
    applicantsCount: 34,
    postedDate: '3 days ago',
    hasApplied: false,
  },
  {
    id: 'job_2',
    title: 'Clinical Neuro-Rehabilitation Fellow (Stroke & TBI)',
    organization: 'Apollo Neurosciences Institute',
    logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=120&auto=format&fit=crop&q=80',
    location: 'Chennai, Tamil Nadu, India',
    locationType: 'On-site Hospital',
    type: 'Hospital Fellowship',
    specialization: 'Neurological Rehabilitation',
    stipendOrSalary: '₹48,000 / month Stipend + Accommodation',
    experienceRequired: 'MPT Neuro Freshers or 1 Year Experience',
    description: '1-Year Clinical Fellowship offering hands-on immersion in robotic gait exoskeletons, virtual reality motor rehabilitation, and neuro-ICU early mobilization under senior clinician-scientists.',
    requirements: [
      'MPT in Neurological Physiotherapy from a recognized university',
      'Demonstrated interest in clinical research and peer publication',
      'Rotational hospital bedside night on-call duties',
    ],
    applicantsCount: 19,
    postedDate: '1 week ago',
    hasApplied: false,
  },
  {
    id: 'job_3',
    title: 'Compulsory Rotatory Physiotherapy Internship (Batch 2026)',
    organization: 'Fortis Memorial Research Institute',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80',
    location: 'Gurugram / Delhi NCR, India',
    locationType: 'On-site Hospital',
    type: 'Student Internship',
    specialization: 'Multi-Department Rotatory (Ortho, Neuro, Cardio, Pediatrics)',
    stipendOrSalary: '₹16,500 / month Stipend',
    experienceRequired: 'Final Year BPT Candidates eligible for internship',
    description: '6-Month accredited rotatory internship covering inpatient wards, ICU ventilation, outpatient joint replacement clinics, and pediatric developmental clinics.',
    requirements: [
      'Enrolled in 4.5-year BPT program with successful clearance of all 4 university exams',
      'NOC / Recommendation letter from Dean or College Principal',
      'Committed to rotational ward duties',
    ],
    applicantsCount: 52,
    postedDate: '5 days ago',
    hasApplied: true,
  },
  {
    id: 'job_4',
    title: 'Assistant Professor in Musculoskeletal Physiotherapy',
    organization: 'Manipal College of Health Professions (MAHE)',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80',
    location: 'Manipal, Karnataka, India',
    locationType: 'University & Research',
    type: 'Academic / Faculty',
    specialization: 'Musculoskeletal & Orthopedic Physiotherapy',
    stipendOrSalary: '₹9.5 – ₹12.0 LPA (Commensurate with experience)',
    experienceRequired: 'MPT with minimum 2 years academic/clinical experience (PhD pursued/awarded preferred)',
    description: 'Teaching undergraduate BPT and postgraduate MPT students, guiding master’s dissertations, and conducting sponsored biomechanical research.',
    requirements: [
      'MPT Orthopedics / Musculoskeletal from UGC recognized institute',
      'Minimum 2 indexed Scopus/Web of Science publications',
      'Demonstrated teaching aptitude and passion for mentoring students',
    ],
    applicantsCount: 14,
    postedDate: '2 weeks ago',
    hasApplied: false,
  },
];

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn_1',
    name: 'Dr. Vikram Joshi, PT',
    headline: 'Chief Orthopedic Physiotherapist @ Apollo Hospitals | Joint Replacement Specialist',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
    specialization: 'Orthopedics & Joint Replacement',
    location: 'Mumbai, India',
    institution: 'Apollo Hospitals',
    verified: true,
    accountType: 'clinician',
    status: 'pending',
    mutualCount: 18,
  },
  {
    id: 'conn_2',
    name: 'Dr. Sunita Deshmukh, PT',
    headline: 'Professor & Head of Physiotherapy Dept @ KEM Hospital | Cardiopulmonary Specialist',
    avatar: 'https://images.unsplash.com/photo-1594824813627-df2a16d3f234?w=120&auto=format&fit=crop&q=80',
    specialization: 'Cardiopulmonary Rehabilitation',
    location: 'Mumbai, India',
    institution: 'Seth G.S. Medical College & KEM Hospital',
    verified: true,
    accountType: 'researcher',
    status: 'connected',
    mutualCount: 34,
  },
  {
    id: 'conn_3',
    name: 'Aditya Kulkarni',
    headline: 'MPT 1st Year Sports Physiotherapy Scholar @ Jamia Hamdard | Ex-Ranji Trophy Physio Intern',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    specialization: 'Sports Physiotherapy',
    location: 'New Delhi, India',
    institution: 'Jamia Hamdard University',
    verified: true,
    accountType: 'student',
    status: 'suggestion',
    mutualCount: 9,
  },
  {
    id: 'conn_4',
    name: 'Dr. Ananya Sen, PT',
    headline: 'Pediatric Physiotherapist & NDT Certified Practitioner @ Child Neuro Care Clinic',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    specialization: 'Pediatric Physiotherapy & Sensory Integration',
    location: 'Kolkata, India',
    institution: 'Child Neuro Care Foundation',
    verified: true,
    accountType: 'clinician',
    status: 'suggestion',
    mutualCount: 14,
  },
  {
    id: 'conn_5',
    name: 'Dr. Arvind Swaminathan, PhD, PT',
    headline: 'Senior Principal Investigator in Biomechanics & Wearable Sensors @ IIT Madras Healthcare Hub',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    specialization: 'Biomechanics & Rehabilitation Engineering',
    location: 'Chennai, India',
    institution: 'IIT Madras Healthcare Innovation Center',
    verified: true,
    accountType: 'researcher',
    status: 'suggestion',
    mutualCount: 27,
  },
];

export const INITIAL_VERIFICATIONS: VerificationRequest[] = [
  {
    id: 'verif_1',
    userId: 'user_982',
    userName: 'Dr. Sandeep Verma, PT',
    userAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
    qualification: 'BPT, MPT (Cardio-Respiratory)',
    councilName: 'Delhi Council for Physiotherapy and Occupational Therapy (DCPTOT)',
    registrationNumber: 'DCPTOT/PT/2019/3491',
    documentType: 'State Council Certificate',
    documentUrl: 'https://example.com/certs/dcptot_verma.pdf',
    submittedDate: 'Yesterday at 4:30 PM',
    status: 'pending',
  },
  {
    id: 'verif_2',
    userId: 'student_419',
    userName: 'Kavita Menon',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    qualification: 'BPT Final Year Student (Enrolled 2022-2027)',
    councilName: 'Kerala University of Health Sciences (KUHS)',
    registrationNumber: 'KUHS/AHS/BPT/2022/8821',
    documentType: 'College ID',
    documentUrl: 'https://example.com/certs/kavita_college_id.pdf',
    submittedDate: '2 days ago',
    status: 'pending',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantIds: ['sports_pt', 'neuro_researcher'],
    participant: {
      id: 'neuro_researcher',
      name: 'Prof. Dr. Rajesh Patel, PhD, PT',
      headline: 'Director of Neuro-Robotics & Motor Learning Laboratory | Professor of Neurological PT',
      avatar: NEURO_AVATAR,
      verified: true,
      isOnline: true,
      accountType: 'researcher',
    },
    lastMessage: {
      text: "I've attached our 2024 neuro-muscular recovery tracking guidelines for peripheral nerve stretch injuries. Let me know how the follow-up EMG looks next week.",
      timestamp: '10:14 AM',
      senderId: 'neuro_researcher',
      isRead: false,
    },
    unreadCount: 1,
    messages: [
      {
        id: 'msg_101',
        senderId: 'sports_pt',
        receiverId: 'neuro_researcher',
        text: 'Good evening Dr. Rajesh! We have a state sprinter with an acute lateral fibular head contusion showing secondary deep peroneal nerve paresthesia. Have you observed similar neuropraxia cases in your motion lab?',
        timestamp: 'Yesterday at 3:15 PM',
        isRead: true,
      },
      {
        id: 'msg_102',
        senderId: 'neuro_researcher',
        receiverId: 'sports_pt',
        text: 'Hello Priya. Yes, in acute blunt impact to the fibular head, local edema frequently causes transient conduction slowdown. We usually recommend surface EMG testing at 14 days post-injury to check for denervation potentials.',
        timestamp: 'Yesterday at 4:02 PM',
        isRead: true,
      },
      {
        id: 'msg_103',
        senderId: 'sports_pt',
        receiverId: 'neuro_researcher',
        text: 'Thank you Dr. Rajesh. We started pulsed high-induction magnetic stimulation and sensory re-education yesterday, along with ankle dorsiflexion isometric facilitation.',
        timestamp: 'Yesterday at 4:20 PM',
        isRead: true,
      },
      {
        id: 'msg_104',
        senderId: 'neuro_researcher',
        receiverId: 'sports_pt',
        text: "I've attached our 2024 neuro-muscular recovery tracking guidelines for peripheral nerve stretch injuries. Let me know how the follow-up EMG looks next week.",
        timestamp: '10:14 AM',
        isRead: false,
        attachmentName: 'Peroneal_Nerve_Rehab_Guidelines_2024.pdf',
        attachmentType: 'document',
      },
    ],
  },
  {
    id: 'conv_2',
    participantIds: ['sports_pt', 'student_pt'],
    participant: {
      id: 'student_pt',
      name: 'Neha Sharma',
      headline: 'BPT Final Year Student & Rotatory Intern @ KEM Hospital | Aspiring Sports PT',
      avatar: STUDENT_AVATAR,
      verified: true,
      isOnline: true,
      accountType: 'student',
    },
    lastMessage: {
      text: 'Thank you so much Maam! That clarifies the exact clinical doubts our seminar group was debating today.',
      timestamp: 'Yesterday at 11:45 AM',
      senderId: 'student_pt',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_201',
        senderId: 'student_pt',
        receiverId: 'sports_pt',
        text: 'Respected Dr. Priya Maam, thank you for accepting my connection request! I follow your return-to-sport ACL cases closely on PhysioLink.',
        timestamp: '2 days ago at 11:20 AM',
        isRead: true,
      },
      {
        id: 'msg_202',
        senderId: 'sports_pt',
        receiverId: 'student_pt',
        text: 'Welcome Neha! Delighted to connect. How is your rotatory clinical internship going at KEM Hospital?',
        timestamp: '2 days ago at 1:45 PM',
        isRead: true,
      },
      {
        id: 'msg_203',
        senderId: 'student_pt',
        receiverId: 'sports_pt',
        text: 'It is intense and very rewarding! We are rotating through the Ortho OPD this month. Could I ask your opinion on when to start open kinetic chain quadriceps extensions between 90° and 45° post-ACL reconstruction with a hamstring autograft?',
        timestamp: 'Yesterday at 9:30 AM',
        isRead: true,
      },
      {
        id: 'msg_204',
        senderId: 'sports_pt',
        receiverId: 'student_pt',
        text: 'Great question, Neha. Modern evidence shows seated knee extension from 90° to 45° can be introduced safely around week 4 without excessive anterior shear on the hamstring graft, provided there is no joint effusion. Check out the latest JOSPT 2023 consensus!',
        timestamp: 'Yesterday at 11:05 AM',
        isRead: true,
      },
      {
        id: 'msg_205',
        senderId: 'student_pt',
        receiverId: 'sports_pt',
        text: 'Thank you so much Maam! That clarifies the exact clinical doubts our seminar group was debating today.',
        timestamp: 'Yesterday at 11:45 AM',
        isRead: true,
      },
    ],
  },
  {
    id: 'conv_3',
    participantIds: ['sports_pt', 'conn_2'],
    participant: {
      id: 'conn_2',
      name: 'Dr. Sunita Deshmukh, PT',
      headline: 'Professor & Head of Physiotherapy Dept @ KEM Hospital | Cardiopulmonary Specialist',
      avatar: 'https://images.unsplash.com/photo-1594824813627-df2a16d3f234?w=120&auto=format&fit=crop&q=80',
      verified: true,
      isOnline: false,
      accountType: 'researcher',
    },
    lastMessage: {
      text: 'His VO2 max peak reached 52 mL/kg/min with stable ECG rhythms and normal SpO2 response. We can clear him for full match simulation drills.',
      timestamp: '9:02 AM',
      senderId: 'conn_2',
      isRead: false,
    },
    unreadCount: 1,
    messages: [
      {
        id: 'msg_301',
        senderId: 'conn_2',
        receiverId: 'sports_pt',
        text: 'Dear Dr. Priya, hope you are well. We are finalizing the cardiopulmonary stress testing clearance for the badminton athlete referred from your clinic.',
        timestamp: '8:45 AM',
        isRead: true,
      },
      {
        id: 'msg_302',
        senderId: 'conn_2',
        receiverId: 'sports_pt',
        text: 'His VO2 max peak reached 52 mL/kg/min with stable ECG rhythms and normal SpO2 response. We can clear him for full match simulation drills.',
        timestamp: '9:02 AM',
        isRead: false,
        attachmentName: 'Cardiopulmonary_Stress_Report_Athlete_M.pdf',
        attachmentType: 'document',
      },
    ],
  },
  {
    id: 'conv_4',
    participantIds: ['sports_pt', 'conn_1'],
    participant: {
      id: 'conn_1',
      name: 'Dr. Vikram Joshi, PT',
      headline: 'Chief Orthopedic Physiotherapist @ Apollo Hospitals | Joint Replacement Specialist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      verified: true,
      isOnline: true,
      accountType: 'clinician',
    },
    lastMessage: {
      text: 'Wonderful progress. Appreciate the close multidisciplinary coordination!',
      timestamp: '3 days ago',
      senderId: 'conn_1',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_401',
        senderId: 'conn_1',
        receiverId: 'sports_pt',
        text: 'Hi Priya, sending over the post-op surgical notes for Mrs. Kulkarni (Bilateral TKA, Day 14 post-discharge).',
        timestamp: '3 days ago at 5:10 PM',
        isRead: true,
      },
      {
        id: 'msg_402',
        senderId: 'sports_pt',
        receiverId: 'conn_1',
        text: 'Received, Vikram! Her active extension lag is down to 5 degrees today and gait pattern without walker looks solid.',
        timestamp: '3 days ago at 6:00 PM',
        isRead: true,
      },
      {
        id: 'msg_403',
        senderId: 'conn_1',
        receiverId: 'sports_pt',
        text: 'Wonderful progress. Appreciate the close multidisciplinary coordination!',
        timestamp: '3 days ago at 6:30 PM',
        isRead: true,
      },
    ],
  },
];
