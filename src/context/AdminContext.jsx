import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { dispatchAdminEvent, ADMIN_NOTIFICATION_EVENTS } from '../services/notificationEventService';
import adminService from '../services/adminService';

// ─── 1. ADMIN SEED USERS ──────────────────────────────────────────────────
const SEED_ADMINS = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin1@ntrvikasa.com',
    password: 'password123',
    role: 'admin',
    title: 'Platform Administrator',
    designation: 'State Operations Lead',
    avatar: 'A',
    permissions: ['ALL'],
  },
  {
    id: 'admin-2',
    name: 'Super Admin',
    email: 'admin2@ntrvikasa.com',
    password: 'password123',
    role: 'admin',
    title: 'Super Administrator',
    designation: 'Director of Employment & Governance',
    avatar: 'S',
    permissions: ['ALL', 'SYSTEM_CONFIG', 'AUDIT_OVERRIDE'],
  }
];

// ─── 1.5 PLATFORM REFERENCE ADMINS & GEOGRAPHIC MANDALS ─────────────────────
export const REFERENCE_ADMINS = [
  'Admin User (State Operations)',
  'Super Admin (Directorate of Employment)',
  'District Nodal Officer (Vijayawada)',
  'Mandal Placement Officer (Ibrahimpatnam)',
  'Mylavaram Field Counselor',
  'Nandigama Skill Coordinator',
  'Tiruvuru Employment Desk',
  'Direct Student Self-Registration',
];

export const NTR_MANDALS = [
  'Vijayawada Urban',
  'Vijayawada Rural',
  'Ibrahimpatnam',
  'Mylavaram',
  'Nandigama',
  'Jaggaiahpet',
  'Tiruvuru',
  'Jaggayyapeta',
  'Kanchikacherla',
  'Chandarlapadu',
  'Veerullapadu',
  'G.Konduru',
  'A.Konduru',
  'Reddigudem',
  'Vissannapeta',
  'Penuganchiprolu',
  'Vatsavai'
];

// ─── 2. PLATFORM DATASETS (EMPTY INITIAL LIVE STATE) ───────────────────────
export const SEED_CANDIDATES = [];
const SEED_RECRUITERS = [];
const SEED_COMPANIES = [];
const SEED_JOBS = [];
const SEED_INTERNSHIPS = [];
const SEED_APPLICATIONS = [];
const SEED_JOB_MELAS = [];
const SEED_REGISTRATIONS = [];
const SEED_REPORTS = [];
const SEED_AUDIT_LOGS = [];
const SEED_NOTIFICATIONS = [];

// ─── 12. SEED SYSTEM SETTINGS ─────────────────────────────────────────────
const SEED_SETTINGS = {
  platformName: 'NTR VIKASA State Job Portal Administration',
  autoApproveVerifiedRecruiters: false,
  requireCompanyGSTIN: true,
  enableInstantEmailAlerts: true,
  dailyAuditLogSummary: true,
  candidateProfileVerification: true,
  maintenanceMode: false,
};

// ─── 13. SEED HOME PAGE CONTENT ───────────────────────────────────────────
export const DEFAULT_HOME_CONTENT = {
  hero: {
    badge: 'Most Trusted Career & Job Fair Network',
    heading1: 'Find Your Dream Job.',
    heading2: 'Accelerate Your Career.',
    subtext: 'Connect with top verified recruiters, apply for high-impact internships, and register for nationwide Mega Job Melas — all with transparent tracking.',
    searchPlaceholder: 'Search job titles, required skills, keywords, companies...',
    popularSearches: ['React', 'Python', 'Java', 'Data Science', 'Figma', 'Fintech', 'Freshers', 'Remote'],
    heroImage: null,
  },
  stats: [
    { id: 'stat-1', label: 'Active Jobs', value: '0', icon: 'Briefcase' },
    { id: 'stat-2', label: 'Verified Companies', value: '0', icon: 'Building2' },
    { id: 'stat-3', label: 'Registered Candidates', value: '0', icon: 'Users' },
    { id: 'stat-4', label: 'Successful Placements', value: '0', icon: 'TrendingUp' },
  ],
  whyChoose: {
    heading1: 'Why Choose',
    heading2: 'Our Job Portal?',
    subtitle: 'Everything you need to launch, accelerate, and safeguard your professional career journey in one integrated ecosystem.',
    cards: [
      { id: 'wc-1', title: 'Trusted Opportunities', desc: '100% verified opportunities with strict regulatory compliance and wage transparency.', icon: 'ShieldCheck' },
      { id: 'wc-2', title: 'Skill Development', desc: 'Government-recognized skill certifications, workshops, and industry bootcamps.', icon: 'GraduationCap' },
      { id: 'wc-3', title: 'Job Melas', desc: 'Direct entry to state-wide employment summits and mega walk-in recruitment drives.', icon: 'CalendarDays' },
      { id: 'wc-4', title: 'Easy Applications', desc: 'One-click application process with streamlined digital resume distribution.', icon: 'ArrowUpRight' },
      { id: 'wc-5', title: 'Application Tracking', desc: 'Transparent real-time status updates from submission to interview scheduling.', icon: 'TrendingUp' },
      { id: 'wc-6', title: 'Candidate Support', desc: 'Dedicated helpline, career counselling, and automated grievance redressal.', icon: 'Users' },
    ],
  },
  welcomePopup: {
    enabled: false,
    imageUrl: '',
    redirectUrl: '',
    startDate: '',
    endDate: '',
  },
  gallery: {
    badge: 'Moments & Media Highlights',
    heading1: 'NTR VIKASA Event &',
    heading2: 'Media Gallery',
    subtitle: 'Explore glimpses from our mega job fairs, candidate felicitations, skill training batches, and industry partner summits across Andhra Pradesh.',
    images: [],
    videos: []
  },
  newsArticles: {
    badge: 'In The Media & Press',
    heading1: 'Official Newspaper &',
    heading2: 'Press Highlights',
    subtitle: 'Read authentic press coverage, newspaper clippings, and administrative reports of NTR VIKASA Mega Job Melas across Andhra Pradesh.',
    articles: []
  },
};

// ─── 14. SEED JOBS PAGE CONTENT ───────────────────────────────────────────
export const DEFAULT_JOBS_PAGE_CONTENT = {
  hero: {
    badge: 'Corporate Recruitment Portal',
    heading: 'Find Your Dream Job in Andhra Pradesh & India',
    subtitle: 'Explore 2,450+ verified corporate job openings with zero placement fees',
  },
  search: {
    searchPlaceholder: 'Job title, skills (Python, React...), or company...',
    locationPlaceholder: 'All Locations (All India)',
    popularSearches: ['Python Developer', 'React JS', 'Data Analyst', 'Fresher Jobs', 'Hybrid Work', 'FastAPI'],
  },
};

// ─── 15. SEED JOB MELA PAGE CONTENT ───────────────────────────────────────
export const DEFAULT_JOB_MELA_CONTENT = {
  hero: {
    badge: 'Nationwide Recruitment Drives',
    heading: 'Mega Job Melas & Career Fairs',
    description: 'Attend on-ground walk-in interview sessions with 100+ hiring companies, receive free career guidance, and get spot job offer letters. Free registration for all job seekers.',
  },
};

// ─── 16. SEED SKILL DEVELOPMENT PAGE CONTENT ──────────────────────────────
export const DEFAULT_SKILL_PAGE_CONTENT = {
  hero: {
    badge: 'NTR VIKASA • Skill Development & Employment Generation',
    heading: 'Skill Development & Training Programs',
    description: 'Empowering job seekers with government-recognized, industry-aligned training, practical learning, and placement support.',
    exploreBtnText: 'Explore Programs',
    viewCoursesBtnText: 'View Courses',
  },
  highlights: [
    { id: 'hl-1', icon: 'Award', title: 'Government Recognized', subtitle: 'NSDC / NSQF Certified' },
    { id: 'hl-2', icon: 'TrendingUp', title: 'Placement Support', subtitle: 'Job Mela / Employment Support' },
    { id: 'hl-3', icon: 'BookOpen', title: 'Practical Curriculum', subtitle: 'Hands-on Industry Labs' },
    { id: 'hl-4', icon: 'Users', title: 'Expert Mentors', subtitle: 'Experienced Professionals' },
  ],
  empoweringSkills: {
    badge: 'Institutional Mission',
    heading: 'Empowering Skills. Enabling Careers.',
    description: 'The NTR VIKASA Skill Development initiative bridges the critical divide between academic qualifications and industry hiring standards. By partnering with state government bodies, national sector skill councils, and corporate employers, we deliver employment-focused, hands-on training to youth across Andhra Pradesh.',
    cards: [
      {
        id: 'es-1',
        icon: 'Code2',
        title: 'Industry-Relevant Learning',
        desc: 'Curricula designed directly in consultation with tech leaders, BFSI corporations, and manufacturing employers to teach in-demand workplace tools.'
      },
      {
        id: 'es-2',
        icon: 'Laptop',
        title: 'Practical Training Labs',
        desc: 'Over 70% of course time is dedicated to hands-on lab practicals, simulated industrial environments, and live capstone projects.'
      },
      {
        id: 'es-3',
        icon: 'TrendingUp',
        title: 'Placement Assistance',
        desc: 'Trained candidates receive dedicated interview preparation, resume enhancement, and direct fast-track access to regional Mega Job Melas.'
      }
    ]
  },
  trainingJourney: {
    badge: 'Candidate Pathway',
    heading: 'From Training to Employment',
    description: 'A structured 6-step journey designed to take you from foundational training to confirmed corporate placement.',
    steps: [
      { step: '01', title: 'Choose a Program', desc: 'Browse through high-demand domains like Tech, AI, Cloud, and BFSI to select the right skill track aligned with your career goals.' },
      { step: '02', title: 'Register & Counseling', desc: 'Submit a free online enrollment request. Our skill counselors guide you through batch schedules, prerequisite review, and center allocation.' },
      { step: '03', title: 'Hands-on Training', desc: 'Undergo practical, lab-based learning with experienced industry mentors, real-world capstone assignments, and modern equipment.' },
      { step: '04', title: 'Get Certified', desc: 'Earn government-recognized NSDC, NSQF, and Sector Skill Council certifications validating your industry-ready competencies.' },
      { step: '05', title: 'Placement Preparation', desc: 'Participate in resume enhancement sessions, technical interview simulations, soft skills coaching, and mock tests.' },
      { step: '06', title: 'Employment & Job Melas', desc: 'Receive direct interview access to 14,000+ verified corporate recruiters and fast-track entry to statewide Mega Job Melas.' },
    ]
  },
  programsWeOffer: {
    badge: 'Sector Domains',
    heading: 'Programs We Offer',
    description: 'Specialized training pathways spanning modern tech, finance, core engineering, and administrative sectors.',
    categories: [
      { id: 'it', name: 'Information Technology', icon: 'Code2', desc: 'Web development, cloud computing, and computer fundamentals', count: '3 Courses' },
      { id: 'data-ai', name: 'Data & AI', icon: 'Database', desc: 'Data analytics, Power BI dashboards, and business intelligence', count: '2 Courses' },
      { id: 'ai-tools', name: 'AI & Productivity Tools', icon: 'Sparkles', desc: 'ChatGPT prompt engineering, Gemini AI & office automation', count: '2 Courses' },
      { id: 'banking', name: 'Banking & Finance', icon: 'Landmark', desc: 'BFSI operations, retail banking, credit appraisal & compliance', count: '2 Courses' },
      { id: 'accounting', name: 'Office & Accounting', icon: 'Calculator', desc: 'Tally Prime, GST return filing, MS Office & Advanced Excel', count: '2 Courses' },
      { id: 'core-eng', name: 'Core Engineering', icon: 'Cpu', desc: 'PLC automation, SCADA systems, and industrial electrical wiring', count: '2 Courses' },
      { id: 'healthcare', name: 'Healthcare', icon: 'Activity', desc: 'Hospital administration, patient care, EMR systems & billing', count: '2 Courses' },
      { id: 'marketing', name: 'Marketing & Sales', icon: 'Megaphone', desc: 'Digital marketing, SEO, social media ads & customer support', count: '2 Courses' },
    ]
  },
  whyChoose: {
    badge: 'Institutional Excellence',
    heading: 'Why Choose NTR VIKASA',
    description: 'Outcome-focused advantages designed to give candidates a real competitive edge in modern job markets.',
    cards: [
      { icon: 'Award', title: 'Govt. & NSDC Recognized', desc: 'All programs follow National Skill Qualification Framework (NSQF) standards ensuring nationwide employer recognition.' },
      { icon: 'Laptop', title: '70% Practical Lab Training', desc: 'Emphasis on experiential lab exercises, software simulations, and hardware setups rather than rote memorization.' },
      { icon: 'Users', title: 'Certified Expert Mentors', desc: 'Learn directly from seasoned industry practitioners and certified instructors with extensive domain track records.' },
      { icon: 'TrendingUp', title: '100% Placement Support', desc: 'Direct pipeline to NTR VIKASA verified recruiters, corporate interview drives, and district-wide Mega Job Melas.' },
      { icon: 'ShieldCheck', title: '100% Free / Subsidized', desc: 'State-sponsored skill development initiatives designed to empower aspiring job seekers across all districts of Andhra Pradesh.' },
      { icon: 'Sparkles', title: 'Future-Ready Curriculum', desc: 'Regularly updated course modules integrating modern AI tools, cloud platforms, and modern industrial requirements.' },
    ]
  }
};

// ─── 17. SEED ABOUT US PAGE CONTENT ───────────────────────────────────────
export const DEFAULT_ABOUT_CONTENT = {
  hero: {
    badge: 'Our Mission & Impact',
    heading: 'Bridging Talent with Opportunity Across India',
    description: 'NTR VIKASA Job Portal was founded on a simple principle: every candidate deserves fair, direct access to employment opportunities without scam fees, opaque processes, or dead ends.',
  },
  stats: [
    { id: 'ab-stat-1', label: 'Registered Job Seekers', value: '0', color: 'var(--color-primary-600)' },
    { id: 'ab-stat-2', label: 'Confirmed Placements', value: '0', color: 'var(--color-success-600)' },
    { id: 'ab-stat-3', label: 'Verified Hiring Employers', value: '0', color: 'var(--color-warning-600)' },
    { id: 'ab-stat-4', label: 'State-Wide Job Melas Held', value: '0', color: 'var(--color-info-600)' },
  ],
  whatWeStandFor: {
    heading: 'What We Stand For',
    description: 'Guiding principles that power our candidate-first architecture and employer verification policies.',
    cards: [
      {
        id: 'wwsf-1',
        icon: 'ShieldCheck',
        title: '100% Verified Quality',
        desc: 'Every single recruiter profile and job listing is reviewed to eliminate illegitimate recruiters and recruitment charges.',
        color: 'primary'
      },
      {
        id: 'wwsf-2',
        icon: 'Target',
        title: 'Transparent Application Lifecycle',
        desc: 'Candidates receive live feedback across all 20 standard recruitment milestones from applied to interview to offer letters.',
        color: 'success'
      },
      {
        id: 'wwsf-3',
        icon: 'Users',
        title: 'Inclusive Mega Job Melas',
        desc: 'Bringing top corporate opportunities directly to Tier-2, Tier-3 and rural graduate communities through walk-in physical fairs.',
        color: 'warning'
      }
    ]
  },
  team: {
    badge: 'Our Leadership & Team',
    heading: 'Our Team',
    description: 'Experienced leaders with backgrounds across technology, public policy, and corporate recruitment.',
    members: [
      {
        id: 'team-1',
        name: 'Dr. Ramesh Sundaram',
        role: 'Founder & Managing Director',
        organization: 'NTR Vikasa',
        bio: 'Former National Employment Council advisor with 20+ years driving talent mobility initiatives.',
        image: null
      },
      {
        id: 'team-2',
        name: 'Ananya Deshmukh',
        role: 'Chief Technology Officer',
        organization: 'NTR Vikasa',
        bio: 'Ex-Google & Flipkart engineering leader passionate about AI-driven career matching.',
        image: null
      },
      {
        id: 'team-3',
        name: 'Siddharth Nair',
        role: 'Head of Employer Partnerships',
        organization: 'NTR Vikasa',
        bio: 'Built recruitment pipelines across 500+ Indian corporate enterprises and SME networks.',
        image: null
      },
      {
        id: 'team-4',
        name: 'Meera Sengupta',
        role: 'Director of Diversity & Job Melas',
        organization: 'NTR Vikasa',
        bio: 'Pioneered inclusive job fairs for women, PwD, and tier-2/3 college graduates across India.',
        image: null
      },
    ]
  },
  leadershipMessages: {
    badge: 'LEADERSHIP',
    heading: 'Leadership Messages',
    description: 'Words from our esteemed leaders who guide our mission',
    messages: [
      {
        id: 'msg-1',
        name: 'K Lacha Rao',
        designation: 'Chairperson',
        organization: 'NTR Vikasa Jobs',
        image: null,
        initials: 'VIKASA',
        headerBg: '#0f2a59',
        message: 'Our mission is to bridge the gap between academia and industry by providing industry-aligned curriculum to ICT faculty and students, offering the finest skill, career connect, and mentorship guidance.',
        fullMessage: 'Our mission is to bridge the gap between academia and industry by providing industry-aligned curriculum to ICT faculty and students, offering the finest skill, career connect, and mentorship guidance. Through deep collaboration with industry leaders and government stakeholders, we are dedicated to providing transformational employment avenues for all aspiring youth across the state.',
        hasViewAction: false
      },
      {
        id: 'msg-2',
        name: 'K. Lacha Rao',
        designation: 'Project Director',
        organization: 'Vikasa Jobs',
        image: null,
        initials: 'KLR',
        headerBg: '#047857',
        message: 'At NTR Vikasa, our mission is to empower youth by creating meaningful employment opportunities and building a skilled workforce for the future. We believe that every individual deserves the right guidance, training, and platform to achieve their career aspirations. Through our initiatives such as Job Melas, skill development programs, and industry partnerships,...',
        fullMessage: 'At NTR Vikasa, our mission is to empower youth by creating meaningful employment opportunities and building a skilled workforce for the future. We believe that every individual deserves the right guidance, training, and platform to achieve their career aspirations. Through our initiatives such as Job Melas, skill development programs, and industry partnerships, we strive to build sustainable bridges between talent and industry requirements across the state.',
        hasViewAction: true
      }
    ]
  },
  partners: {
    heading: 'OUR INDUSTRY & ACADEMIC TRAINING PARTNERS',
    description: 'Empowering future-ready talent in collaboration with leading corporate and educational organizations.',
    list: [
      { id: 'p-1', name: 'Hyundai MOBIS', logoText: 'HYUNDAI MOBIS', active: true, order: 1 },
      { id: 'p-2', name: 'ISUZU', logoText: 'ISUZU', active: true, order: 2 },
      { id: 'p-3', name: 'MedPlus+', logoText: 'MedPlus+', active: true, order: 3 },
      { id: 'p-4', name: 'Apollo Pharmacy', logoText: 'Apollo Pharmacy', active: true, order: 4 },
      { id: 'p-5', name: 'IndiGo', logoText: 'IndiGo', active: true, order: 5 },
      { id: 'p-6', name: 'INZI Controls', logoText: 'INZI CONTROLS', active: true, order: 6 },
      { id: 'p-7', name: 'Dixon', logoText: 'Dixon', active: true, order: 7 },
      { id: 'p-8', name: 'COGENT', logoText: 'COGENT', active: true, order: 8 },
      { id: 'p-9', name: 'Indus', logoText: 'Indus', active: true, order: 9 },
      { id: 'p-10', name: 'NIIT', logoText: 'NIIT', active: true, order: 10 },
      { id: 'p-11', name: 'iSON', logoText: 'iSON', active: true, order: 11 },
      { id: 'p-12', name: 'Deccan', logoText: 'deccan', active: true, order: 12 },
      { id: 'p-13', name: 'ICICI Bank', logoText: 'ICICI Bank', active: true, order: 13 },
    ]
  }
};

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // Evict legacy cached mock/seed records from localStorage
  useEffect(() => {
    const isLegacyDummy = (item) => {
      if (!item) return false;
      const id = String(item.id || item.mela_id || '');
      if (/^(cand-\d+|rec-\d+|comp-\d+|job-\d+|int-\d+|app-\d+|mela-\d+|reg-\d+|rep-\d+|aud-\d+|notif-\d+)$/i.test(id)) return true;
      if (item.email && /@(example\.com|techsolutionsglobal\.com|amaravaticyber\.com|fastcashenterprises\.com)/i.test(item.email)) return true;
      if (item.company && /(Tech Solutions Global|NextGen Autonomous|Amaravati Cyber|Fast Cash Enterprises|ABC Technologies)/i.test(item.company)) return true;
      if (item.company_name && /(Tech Solutions Global|NextGen Autonomous|Amaravati Cyber|Fast Cash Enterprises|ABC Technologies)/i.test(item.company_name)) return true;
      if (item.title && /(Bengaluru Mega IT|AP Mega IT|Vijayawada Capital Region|Tirupati Rayalaseema|Guntur & Amaravati|Hyderabad Cyberabad)/i.test(item.title)) return true;
      return false;
    };

    [
      'ntr_admin_candidates_v1',
      'ntr_admin_recruiters_v1',
      'ntr_admin_companies_v1',
      'ntr_admin_jobs_v1',
      'ntr_admin_internships_v1',
      'ntr_admin_applications_v1',
      'ntr_admin_job_melas_v1',
      'ntr_admin_registrations_v1',
      'ntr_admin_reports_v1',
      'ntr_admin_audit_logs_v1',
      'ntr_admin_notifications_v1',
    ].forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.some(isLegacyDummy)) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        // ignore
      }
    });
  }, []);

  const { addNotification } = useNotifications();

  // 1. Admin Users & Auth Session
  const [adminUsers] = useState(SEED_ADMINS);
  const [activeAdminId, setActiveAdminId] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_active_id');
      if (stored && (stored === 'admin-1' || stored === 'admin-2')) return stored;
    } catch (e) {
      // ignore
    }
    return 'admin-1';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_logged_in');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });

  // 2. Platform Core Datasets
  const [candidates, setCandidates] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_candidates_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [recruiters, setRecruiters] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_recruiters_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [companies, setCompanies] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_companies_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [jobs, setJobs] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_jobs_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [internships, setInternships] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_internships_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_applications_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [jobMelas, setJobMelas] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_job_melas_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [registrations, setRegistrations] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_registrations_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [reports, setReports] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_reports_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_audit_logs_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_notifications_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_settings_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_SETTINGS;
  });

  const [homeContent, setHomeContent] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_home_content_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hero: { ...DEFAULT_HOME_CONTENT.hero, ...(parsed.hero || {}) },
          stats: parsed.stats?.length ? parsed.stats : DEFAULT_HOME_CONTENT.stats,
          whyChoose: {
            ...DEFAULT_HOME_CONTENT.whyChoose,
            ...(parsed.whyChoose || {}),
            cards: parsed.whyChoose?.cards?.length ? parsed.whyChoose.cards : DEFAULT_HOME_CONTENT.whyChoose.cards,
          },
          welcomePopup: {
            ...DEFAULT_HOME_CONTENT.welcomePopup,
            ...(parsed.welcomePopup || {}),
          },
          gallery: {
            ...DEFAULT_HOME_CONTENT.gallery,
            ...(parsed.gallery || {}),
            images: parsed.gallery?.images?.length ? parsed.gallery.images : DEFAULT_HOME_CONTENT.gallery.images,
            videos: parsed.gallery?.videos?.length ? parsed.gallery.videos : DEFAULT_HOME_CONTENT.gallery.videos,
          },
          newsArticles: {
            ...DEFAULT_HOME_CONTENT.newsArticles,
            ...(parsed.newsArticles || {}),
            articles: parsed.newsArticles?.articles?.length ? parsed.newsArticles.articles : DEFAULT_HOME_CONTENT.newsArticles.articles,
          },
        };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_HOME_CONTENT;
  });

  const [jobsPageContent, setJobsPageContent] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_jobs_page_content_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hero: { ...DEFAULT_JOBS_PAGE_CONTENT.hero, ...(parsed.hero || {}) },
          search: {
            ...DEFAULT_JOBS_PAGE_CONTENT.search,
            ...(parsed.search || {}),
            popularSearches: parsed.search?.popularSearches?.length ? parsed.search.popularSearches : DEFAULT_JOBS_PAGE_CONTENT.search.popularSearches,
          },
        };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_JOBS_PAGE_CONTENT;
  });

  const [jobMelaContent, setJobMelaContent] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_job_mela_content_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hero: { ...DEFAULT_JOB_MELA_CONTENT.hero, ...(parsed.hero || {}) },
        };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_JOB_MELA_CONTENT;
  });

  const [skillPageContent, setSkillPageContent] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_skill_page_content_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hero: { ...DEFAULT_SKILL_PAGE_CONTENT.hero, ...(parsed.hero || {}) },
          highlights: parsed.highlights?.length ? parsed.highlights : DEFAULT_SKILL_PAGE_CONTENT.highlights,
          empoweringSkills: {
            ...DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills,
            ...(parsed.empoweringSkills || {}),
            cards: parsed.empoweringSkills?.cards?.length ? parsed.empoweringSkills.cards : DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills.cards,
          },
          trainingJourney: {
            ...DEFAULT_SKILL_PAGE_CONTENT.trainingJourney,
            ...(parsed.trainingJourney || {}),
            steps: parsed.trainingJourney?.steps?.length ? parsed.trainingJourney.steps : DEFAULT_SKILL_PAGE_CONTENT.trainingJourney.steps,
          },
          programsWeOffer: {
            ...DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer,
            ...(parsed.programsWeOffer || {}),
            categories: parsed.programsWeOffer?.categories?.length ? parsed.programsWeOffer.categories : DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer.categories,
          },
          whyChoose: {
            ...DEFAULT_SKILL_PAGE_CONTENT.whyChoose,
            ...(parsed.whyChoose || {}),
            cards: parsed.whyChoose?.cards?.length ? parsed.whyChoose.cards : DEFAULT_SKILL_PAGE_CONTENT.whyChoose.cards,
          },
        };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SKILL_PAGE_CONTENT;
  });

  const [aboutContent, setAboutContent] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_about_content_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hero: {
            ...DEFAULT_ABOUT_CONTENT.hero,
            ...(parsed.hero || {}),
          },
          stats: parsed.stats?.length ? parsed.stats : DEFAULT_ABOUT_CONTENT.stats,
          whatWeStandFor: {
            ...DEFAULT_ABOUT_CONTENT.whatWeStandFor,
            ...(parsed.whatWeStandFor || {}),
            cards: parsed.whatWeStandFor?.cards?.length ? parsed.whatWeStandFor.cards : DEFAULT_ABOUT_CONTENT.whatWeStandFor.cards,
          },
          team: {
            ...DEFAULT_ABOUT_CONTENT.team,
            ...(parsed.team || {}),
            members: parsed.team?.members?.length ? parsed.team.members : DEFAULT_ABOUT_CONTENT.team.members,
          },
          leadershipMessages: {
            ...DEFAULT_ABOUT_CONTENT.leadershipMessages,
            ...(parsed.leadershipMessages || {}),
            messages: parsed.leadershipMessages?.messages?.length ? parsed.leadershipMessages.messages : DEFAULT_ABOUT_CONTENT.leadershipMessages.messages,
          },
          partners: {
            ...DEFAULT_ABOUT_CONTENT.partners,
            ...(parsed.partners || {}),
            list: parsed.partners?.list?.length ? parsed.partners.list : DEFAULT_ABOUT_CONTENT.partners.list,
          },
        };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_ABOUT_CONTENT;
  });

  // Persist State to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ntr_admin_active_id', activeAdminId);
      localStorage.setItem('ntr_admin_logged_in', String(isAdminLoggedIn));
      localStorage.setItem('ntr_admin_candidates_v1', JSON.stringify(candidates));
      localStorage.setItem('ntr_admin_recruiters_v1', JSON.stringify(recruiters));
      localStorage.setItem('ntr_admin_companies_v1', JSON.stringify(companies));
      localStorage.setItem('ntr_admin_jobs_v1', JSON.stringify(jobs));
      localStorage.setItem('ntr_admin_internships_v1', JSON.stringify(internships));
      localStorage.setItem('ntr_admin_applications_v1', JSON.stringify(applications));
      localStorage.setItem('ntr_admin_job_melas_v1', JSON.stringify(jobMelas));
      localStorage.setItem('ntr_admin_registrations_v1', JSON.stringify(registrations));
      localStorage.setItem('ntr_admin_reports_v1', JSON.stringify(reports));
      localStorage.setItem('ntr_admin_audit_logs_v1', JSON.stringify(auditLogs));
      localStorage.setItem('ntr_admin_notifications_v1', JSON.stringify(notifications));
      localStorage.setItem('ntr_admin_settings_v1', JSON.stringify(settings));
      localStorage.setItem('ntr_admin_home_content_v1', JSON.stringify(homeContent));
      localStorage.setItem('ntr_admin_jobs_page_content_v1', JSON.stringify(jobsPageContent));
      localStorage.setItem('ntr_admin_job_mela_content_v1', JSON.stringify(jobMelaContent));
      localStorage.setItem('ntr_admin_skill_page_content_v1', JSON.stringify(skillPageContent));
      localStorage.setItem('ntr_admin_about_content_v1', JSON.stringify(aboutContent));
    } catch (e) {
      // ignore
    }
  }, [
    activeAdminId, isAdminLoggedIn, candidates, recruiters, companies,
    jobs, internships, applications, jobMelas, registrations,
    reports, auditLogs, notifications, settings, homeContent,
    jobsPageContent, jobMelaContent, skillPageContent, aboutContent
  ]);

  // Fetch live backend records for Admin moderation
  useEffect(() => {
    let isMounted = true;
    const fetchLiveModerationData = async () => {
      try {
        const [jobsRes, internshipsRes, companiesRes, melasRes, requestsRes, recruitersRes, candidatesRes, photosRes, videosRes, pressRes, jobsPageRes, aboutRes, jobMelaHeroRes, skillRes] = await Promise.allSettled([
          adminService.getJobs({ page_size: 100 }),
          adminService.getInternships({ page_size: 100 }),
          adminService.getCompanies(),
          adminService.getAdminJobMelas(),
          adminService.getJobMelaRequests(),
          adminService.getRecruiters({ page_size: 100 }),
          adminService.getCandidates({ page_size: 100 }),
          adminService.getGalleryPhotos({ page_size: 100 }),
          adminService.getGalleryVideos({ page_size: 100 }),
          adminService.getPressArticles({ page_size: 100 }),
          adminService.getJobsPageContent(),
          adminService.getAboutUsContent(),
          adminService.getJobMelaHeroContent(),
          adminService.getSkillDevelopmentContent(),
        ]);

        if (!isMounted) return;

        if (recruitersRes.status === 'fulfilled' && recruitersRes.value) {
          const rawRecs = Array.isArray(recruitersRes.value)
            ? recruitersRes.value
            : (recruitersRes.value.items || []);
          const mappedRecs = rawRecs.map(r => ({
            id: r.id,
            user_id: r.user_id,
            name: r.name || r.recruiter_name,
            recruiter_name: r.name || r.recruiter_name,
            email: r.email || r.work_email,
            work_email: r.email || r.work_email,
            phone: r.phone || r.mobile_phone,
            mobile_phone: r.phone || r.mobile_phone,
            designation: r.designation || 'Talent Acquisition Manager',
            company: r.company || r.company_name,
            company_name: r.company || r.company_name,
            companyId: r.company_id,
            company_id: r.company_id,
            industry: r.industry || 'Information Technology & Services',
            location: r.location || 'Vijayawada, NTR District',
            district: r.district || 'NTR District',
            mandal: r.mandal || 'Vijayawada Urban',
            village: r.village || '',
            registrationDate: r.registrationDate || r.registration_date || r.created_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
            verificationStatus: r.verificationStatus || r.verification_status || 'VERIFIED',
            accountStatus: r.accountStatus || r.account_status || 'ACTIVE',
            postedJobsCount: r.postedJobsCount !== undefined ? r.postedJobsCount : (r.posted_jobs_count || 0),
            open_jobs: r.open_jobs || 0,
            onboarded_by: r.onboarded_by || 'ADMIN',
          }));
          setRecruiters(mappedRecs);
        }

        if (candidatesRes.status === 'fulfilled' && candidatesRes.value) {
          const rawCands = Array.isArray(candidatesRes.value)
            ? candidatesRes.value
            : (candidatesRes.value.items || []);
          const mappedCands = rawCands.map(c => ({
            id: c.id,
            user_id: c.user_id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            gender: c.gender || 'Male',
            aadhaarNumber: c.aadhaar_masked || c.aadhaar_number || 'XXXX XXXX 1234',
            district: c.district || 'NTR District',
            mandal: c.mandal || '',
            village: c.village || '',
            location: c.location || (c.village ? `${c.village}, ${c.mandal}` : (c.mandal || 'NTR District')),
            qualificationLevel: c.qualification_level,
            education: c.education || (c.qualification_level ? `${c.qualification_level} Class` : 'Pending Profile Completion'),
            headline: c.headline || 'Registered Candidate',
            experience: c.experience || 'Fresher (0-1 Year)',
            skills: Array.isArray(c.skills) ? c.skills : [],
            placementStatus: c.placement_status || 'NOT_PLACED',
            placedCompany: c.placed_company || '',
            placedRole: c.placed_role || '',
            placedSalary: c.placed_salary || '',
            placedDate: c.placed_date || null,
            referenceAdmin: c.reference_admin || 'Admin User (State Operations)',
            customReferrer: c.custom_referrer || '',
            registrationDate: c.registration_date || c.created_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
            profileStatus: c.profile_status || (c.profile_completion >= 80 ? 'COMPLETE' : 'BASIC_REGISTERED'),
            profileCompletion: c.profile_completion || 35,
            accountStatus: c.account_status || 'ACTIVE',
            applicationsCount: c.applications_count || 0
          }));
          setCandidates(mappedCands);
        }

        if (jobsRes.status === 'fulfilled' && jobsRes.value) {
          const rawJobs = Array.isArray(jobsRes.value) ? jobsRes.value : (jobsRes.value.items || []);
          const mappedJobs = rawJobs.map(j => ({
            id: j.job_id || j.id,
            job_id: j.job_id,
            job_number: j.job_number,
            title: j.title,
            company: j.company_name || 'Organization',
            company_name: j.company_name,
            department: j.department || 'Core Engineering',
            location: j.location || 'Bengaluru, Karnataka',
            type: j.job_type || 'Full-time',
            workMode: j.work_mode || 'Hybrid',
            experience: j.experience || '3-5 years',
            salary: j.salary || 'Competitive',
            openings: j.openings || 1,
            status: j.status,
            description: j.description || '',
            recruiter: j.recruiter_name || j.company_name || 'Recruiter',
            recruiterEmail: j.recruiter_email || '',
            postedDate: j.posted_at?.split(' ')[0] || j.createdAt || new Date().toISOString().split('T')[0],
            rejectionReason: j.rejection_reason || null,
            skills: j.skills || [],
          }));
          setJobs(mappedJobs);
        }

        if (internshipsRes.status === 'fulfilled' && internshipsRes.value) {
          const rawInterns = Array.isArray(internshipsRes.value) ? internshipsRes.value : (internshipsRes.value.items || []);
          const mappedInterns = rawInterns.map(i => ({
            id: i.internship_number || i.id,
            internship_number: i.internship_number,
            rawId: i.id,
            title: i.title,
            company: i.company_name || 'Organization',
            company_name: i.company_name,
            duration: i.duration || '6 Months',
            stipend: i.stipend || '₹15,000 / month',
            workMode: i.work_mode || 'Hybrid',
            location: i.location || 'Bengaluru, Karnataka',
            openings: i.number_of_interns || 1,
            status: i.status,
            description: i.description || '',
            rejectionReason: i.rejection_reason || null,
            createdAt: i.created_at?.split(' ')[0] || i.postedOn || new Date().toISOString().split('T')[0],
          }));
          setInternships(mappedInterns);
        }

        const rawComps = Array.isArray(companiesRes.value)
          ? companiesRes.value
          : (companiesRes.value?.items || []);
        if (companiesRes.status === 'fulfilled') {
          const mappedComps = rawComps.map(c => ({
            id: c.id,
            name: c.company_name || c.name,
            company_name: c.company_name || c.name,
            recruiter: c.recruiter_name || c.recruiter || 'Corporate HR Lead',
            recruiter_name: c.recruiter_name || c.recruiter || 'Corporate HR Lead',
            recruiter_email: c.recruiter_email || c.email || '',
            recruiter_phone: c.recruiter_phone || c.phone || '',
            email: c.email || c.corporate_email || c.recruiter_email || '',
            phone: c.phone || c.company_phone || c.recruiter_phone || '',
            designation: c.designation || 'Director of Talent Acquisition',
            industry: c.industry || c.primary_industry || 'Information Technology & Services',
            location: c.location || c.headquarters_city_state || 'Vijayawada, NTR District',
            district: c.district || 'NTR District',
            mandal: c.mandal || 'Vijayawada Urban',
            village: c.village || '',
            size: c.company_size || c.size || '100-500 employees',
            company_size: c.company_size || c.size || '100-500 employees',
            type: c.company_type || c.type || 'Private Limited (Pvt Ltd)',
            company_type: c.company_type || c.type || 'Private Limited (Pvt Ltd)',
            verificationStatus: c.verification_status || c.verificationStatus || (c.status === 'APPROVED' ? 'VERIFIED' : c.status === 'REJECTED' ? 'REJECTED' : c.status === 'SUSPENDED' ? 'SUSPENDED' : 'PENDING'),
            status: c.status || 'APPROVED',
            accountStatus: c.accountStatus || (c.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'),
            registrationDate: c.registrationDate || c.submitted_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
            activeJobsCount: c.open_jobs || c.openJobs || 0,
            open_jobs: c.open_jobs || c.openJobs || 0,
            open_internships: c.open_internships || 0,
            applications_count: c.applications_count || 0,
            recruiters_count: c.recruiters_count || 1,
            website: c.website || c.company_website || '',
            description: c.description || c.company_description || '',
            about: c.about || c.company_description || '',
            cin: c.cin || c.cin_number || '',
            cin_number: c.cin || c.cin_number || '',
            gstin: c.gstin || c.gst_number || '',
            gst_number: c.gstin || c.gst_number || '',
            rejectionReason: c.rejection_reason || c.rejectionReason || null,
            rejection_reason: c.rejection_reason || c.rejectionReason || null,
            logo: c.logo || c.logo_url || null,
            logo_url: c.logo || c.logo_url || null,
          }));
          setCompanies(mappedComps);
        }

        let combinedMelas = [];
        if (melasRes.status === 'fulfilled' && Array.isArray(melasRes.value)) {
          combinedMelas = melasRes.value.map(m => ({
            id: m.id,
            mela_number: m.mela_number,
            event: m.event || m.title,
            title: m.title || m.event,
            description: m.description || '',
            date: m.date,
            startTime: m.startTime || '09:00 AM',
            endTime: m.endTime || '05:30 PM',
            time: m.time || `${m.startTime || '09:00 AM'} - ${m.endTime || '05:30 PM'}`,
            venue: m.venue,
            city: m.city,
            district: m.district || 'NTR District',
            state: m.state || 'Andhra Pradesh',
            location: m.location || `${m.city}, ${m.state || 'Andhra Pradesh'}`,
            address: m.address || m.venue,
            organizer: m.organizer || 'NTR Vikasa State Employment Authority',
            client: m.client || null,
            createdForClient: Boolean(m.createdForClient || m.client),
            createdByAdmin: true,
            status: m.status,
            capacity: m.capacity || m.maxCapacity || 5000,
            maxCapacity: m.maxCapacity || m.capacity || 5000,
            companiesCount: m.companiesCount || (m.participatingCompanies?.length || 0),
            vacanciesCount: m.vacanciesCount || 1000,
            registeredCandidatesCount: m.registeredCandidatesCount || 0,
            banner: m.banner || m.posterImage || m.flyer_url || '/hero2.jpg',
            posterImage: m.posterImage || m.banner || m.flyer_url || '/hero2.jpg',
            image: m.image || m.banner || m.flyer_url || '/hero2.jpg',
            flyer_url: m.flyer_url || m.banner || '/hero2.jpg',
            participatingCompanies: m.participatingCompanies || [],
            eligibleMandals: m.eligibleMandals || ['All Mandals'],
            eligibleVillages: m.eligibleVillages || 'All villages in selected mandals',
            eligibleQualifications: m.eligibleQualifications || ['10TH', 'INTER', 'UG', 'PG'],
          }));
        }

        if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value)) {
          const mappedRequests = requestsRes.value.map(r => ({
            id: r.id,
            request_number: r.request_number,
            event: r.event || r.title,
            title: r.title || r.event,
            description: r.description || '',
            organizer: r.organizer,
            company: r.organizer,
            requestingOrganization: r.organizer,
            date: r.date,
            time: r.time || '09:00 AM - 05:00 PM',
            venue: r.venue,
            location: r.location || `${r.city}, ${r.state || 'Andhra Pradesh'}`,
            city: r.city,
            state: r.state || 'Andhra Pradesh',
            address: r.address || `${r.venue}, ${r.city}`,
            requestDate: r.requestDate,
            createdAt: r.createdAt || r.requestDate,
            status: r.status,
            capacity: r.capacity || r.maxCapacity || 2000,
            maxCapacity: r.maxCapacity || r.capacity || 2000,
            vacancies: r.vacancies || 500,
            contactPerson: r.contactPerson,
            email: r.email,
            phone: r.phone,
            rejectionReason: r.rejectionReason,
            linkedJobMelaId: r.linkedJobMelaId,
            participatingCompanies: r.participatingCompanies || [],
            createdByAdmin: false,
          }));
          combinedMelas = [...combinedMelas, ...mappedRequests];
        }

        if (melasRes.status === 'fulfilled' || requestsRes.status === 'fulfilled') {
          setJobMelas(combinedMelas);
        }

        if (photosRes.status === 'fulfilled' && Array.isArray(photosRes.value)) {
          const liveImages = photosRes.value.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            imageUrl: p.imageUrl || p.image_url,
            date: p.date,
            description: p.description || '',
          }));
          setHomeContent(prev => ({
            ...prev,
            gallery: {
              ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
              images: liveImages,
            },
          }));
        }

        if (videosRes.status === 'fulfilled' && Array.isArray(videosRes.value)) {
          const liveVideos = videosRes.value.map(v => ({
            id: v.id,
            title: v.title,
            youtubeUrl: v.youtubeUrl || v.youtube_url,
            category: v.category,
            date: v.date || '',
            description: v.description || '',
          }));
          setHomeContent(prev => ({
            ...prev,
            gallery: {
              ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
              videos: liveVideos,
            },
          }));
        }

        if (pressRes.status === 'fulfilled' && Array.isArray(pressRes.value)) {
          const liveArticles = pressRes.value.map(a => ({
            id: a.id,
            newspaper: a.newspaper || a.publication_name,
            title: a.title,
            date: a.date || a.publication_date,
            edition: a.edition || '',
            imageUrl: a.imageUrl || a.image_url,
            sourceUrl: a.sourceUrl || a.source_url || a.article_url || '',
            summary: a.summary || a.description || '',
          }));
          setHomeContent(prev => ({
            ...prev,
            newsArticles: {
              ...(prev.newsArticles || DEFAULT_HOME_CONTENT.newsArticles),
              articles: liveArticles,
            },
          }));
        }

        if (jobsPageRes.status === 'fulfilled' && jobsPageRes.value) {
          const jp = jobsPageRes.value;
          setJobsPageContent({
            hero: {
              badge: jp.hero?.badge || DEFAULT_JOBS_PAGE_CONTENT.hero.badge,
              heading: jp.hero?.heading || DEFAULT_JOBS_PAGE_CONTENT.hero.heading,
              subtitle: jp.hero?.subtitle || DEFAULT_JOBS_PAGE_CONTENT.hero.subtitle,
            },
            search: {
              searchPlaceholder: jp.search?.searchPlaceholder || DEFAULT_JOBS_PAGE_CONTENT.search.searchPlaceholder,
              locationPlaceholder: jp.search?.locationPlaceholder || DEFAULT_JOBS_PAGE_CONTENT.search.locationPlaceholder,
              popularSearches: jp.search?.popularSearches?.length ? jp.search.popularSearches : DEFAULT_JOBS_PAGE_CONTENT.search.popularSearches,
            },
            locations: jp.locations || [],
          });
        }

        if (aboutRes.status === 'fulfilled' && aboutRes.value) {
          const ab = aboutRes.value;
          setAboutContent({
            hero: {
              badge: ab.hero?.badge || DEFAULT_ABOUT_CONTENT.hero.badge,
              heading: ab.hero?.heading || DEFAULT_ABOUT_CONTENT.hero.heading,
              description: ab.hero?.description || DEFAULT_ABOUT_CONTENT.hero.description,
            },
            stats: ab.stats?.length ? ab.stats : DEFAULT_ABOUT_CONTENT.stats,
            whatWeStandFor: {
              heading: ab.whatWeStandFor?.heading || DEFAULT_ABOUT_CONTENT.whatWeStandFor.heading,
              description: ab.whatWeStandFor?.description || DEFAULT_ABOUT_CONTENT.whatWeStandFor.description,
              cards: ab.whatWeStandFor?.cards?.length ? ab.whatWeStandFor.cards : DEFAULT_ABOUT_CONTENT.whatWeStandFor.cards,
            },
            team: {
              badge: ab.team?.badge || DEFAULT_ABOUT_CONTENT.team.badge,
              heading: ab.team?.heading || DEFAULT_ABOUT_CONTENT.team.heading,
              description: ab.team?.description || DEFAULT_ABOUT_CONTENT.team.description,
              members: ab.team?.members?.length ? ab.team.members : DEFAULT_ABOUT_CONTENT.team.members,
            },
            leadershipMessages: {
              badge: ab.leadershipMessages?.badge || DEFAULT_ABOUT_CONTENT.leadershipMessages.badge,
              heading: ab.leadershipMessages?.heading || DEFAULT_ABOUT_CONTENT.leadershipMessages.heading,
              description: ab.leadershipMessages?.description || DEFAULT_ABOUT_CONTENT.leadershipMessages.description,
              messages: ab.leadershipMessages?.messages?.length ? ab.leadershipMessages.messages : DEFAULT_ABOUT_CONTENT.leadershipMessages.messages,
            },
            partners: {
              heading: ab.partners?.heading || DEFAULT_ABOUT_CONTENT.partners.heading,
              description: ab.partners?.description || DEFAULT_ABOUT_CONTENT.partners.description,
              list: ab.partners?.list?.length ? ab.partners.list : DEFAULT_ABOUT_CONTENT.partners.list,
            },
          });
        }

        if (jobMelaHeroRes.status === 'fulfilled' && jobMelaHeroRes.value) {
          const mh = jobMelaHeroRes.value;
          setJobMelaContent({
            hero: {
              badge: mh.hero?.badge || mh.badge || mh.hero_badge || DEFAULT_JOB_MELA_CONTENT.hero.badge,
              heading: mh.hero?.heading || mh.heading || mh.hero_heading || DEFAULT_JOB_MELA_CONTENT.hero.heading,
              description: mh.hero?.description || mh.description || mh.hero_description || DEFAULT_JOB_MELA_CONTENT.hero.description,
            },
          });
        }

        if (skillRes.status === 'fulfilled' && skillRes.value) {
          const sk = skillRes.value;
          const heroData = sk.hero || sk.skills_hero || {};
          const hlData = (sk.highlights && Array.isArray(sk.highlights) && sk.highlights.length) ? sk.highlights : (sk.skills_highlights?.highlights || []);
          const esData = sk.empoweringSkills || sk.skills_mission || {};
          const tjData = sk.trainingJourney || sk.skills_pathway || {};
          const prgData = sk.programsWeOffer || sk.skills_programs || {};
          const wcData = sk.whyChoose || sk.skills_advantages || {};

          const mappedSkill = {
            hero: {
              badge: heroData.badge || DEFAULT_SKILL_PAGE_CONTENT.hero.badge,
              heading: heroData.heading || DEFAULT_SKILL_PAGE_CONTENT.hero.heading,
              description: heroData.description || DEFAULT_SKILL_PAGE_CONTENT.hero.description,
              exploreBtnText: heroData.exploreBtnText || heroData.primary_button_label || DEFAULT_SKILL_PAGE_CONTENT.hero.exploreBtnText,
              viewCoursesBtnText: heroData.viewCoursesBtnText || heroData.secondary_button_label || DEFAULT_SKILL_PAGE_CONTENT.hero.viewCoursesBtnText,
            },
            highlights: hlData.length ? hlData : DEFAULT_SKILL_PAGE_CONTENT.highlights,
            empoweringSkills: {
              badge: esData.badge || DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills.badge,
              heading: esData.heading || DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills.heading,
              description: esData.description || DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills.description,
              cards: (esData.cards && esData.cards.length) ? esData.cards : DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills.cards,
            },
            trainingJourney: {
              badge: tjData.badge || DEFAULT_SKILL_PAGE_CONTENT.trainingJourney.badge,
              heading: tjData.heading || DEFAULT_SKILL_PAGE_CONTENT.trainingJourney.heading,
              description: tjData.description || DEFAULT_SKILL_PAGE_CONTENT.trainingJourney.description,
              steps: (tjData.steps && tjData.steps.length) ? tjData.steps : DEFAULT_SKILL_PAGE_CONTENT.trainingJourney.steps,
            },
            programsWeOffer: {
              badge: prgData.badge || DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer.badge,
              heading: prgData.heading || DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer.heading,
              description: prgData.description || DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer.description,
              categories: (prgData.categories && prgData.categories.length) ? prgData.categories : DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer.categories,
            },
            whyChoose: {
              badge: wcData.badge || DEFAULT_SKILL_PAGE_CONTENT.whyChoose.badge,
              heading: wcData.heading || DEFAULT_SKILL_PAGE_CONTENT.whyChoose.heading,
              description: wcData.description || DEFAULT_SKILL_PAGE_CONTENT.whyChoose.description,
              cards: (wcData.cards && wcData.cards.length) ? wcData.cards : DEFAULT_SKILL_PAGE_CONTENT.whyChoose.cards,
            },
          };

          setSkillPageContent(mappedSkill);
          try {
            localStorage.setItem('ntr_admin_skill_page_content_v1', JSON.stringify(mappedSkill));
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.warn('Error fetching live admin moderation data:', e);
      }
    };

    fetchLiveModerationData();
    return () => { isMounted = false; };
  }, []);

  const currentAdmin = adminUsers.find(a => a.id === activeAdminId) || adminUsers[0];


  // Helper to add audit log entry
  const addAuditLog = (action, target, entityType, result = 'SUCCESS') => {
    const newLog = {
      id: `log-${Date.now()}`,
      action,
      adminUser: currentAdmin.name,
      target,
      entityType,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      result,
      ip: '10.200.45.12',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ── AUTH HANDLERS ────────────────────────────────────────────────────────
  const loginAdmin = (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (cleanEmail?.includes('admin2') || cleanEmail?.includes('super')) {
      setActiveAdminId('admin-2');
    } else {
      setActiveAdminId('admin-1');
    }
    setIsAdminLoggedIn(true);
    addAuditLog('Admin System Login', 'Admin Control Panel', 'AUTH');
    return { success: true, admin: currentAdmin };
  };

  const logoutAdmin = () => {
    addAuditLog('Admin Logout', 'Admin Session Terminated', 'AUTH');
    setIsAdminLoggedIn(false);
  };

  const switchAdmin = (adminId) => {
    if (adminId === 'admin-1' || adminId === 'admin-2') {
      setActiveAdminId(adminId);
      setIsAdminLoggedIn(true);
    }
  };

  // ── ACTION DISPATCHERS ───────────────────────────────────────────────────

  // Recruiter actions
  const verifyRecruiter = async (recruiterId, status = 'VERIFIED', notes = '') => {
    try {
      await adminService.verifyRecruiter(recruiterId);
    } catch (err) {
      console.warn('Backend verifyRecruiter call error:', err);
    }

    setRecruiters(prev =>
      prev.map(r => (r.id === recruiterId ? { ...r, verificationStatus: status } : r))
    );
    const rec = recruiters.find(r => r.id === recruiterId);
    addAuditLog(`Recruiter ${status === 'VERIFIED' ? 'Verified' : 'Rejected'}`, rec?.name || recruiterId, 'RECRUITER');

    dispatchAdminEvent({
      eventType: status === 'VERIFIED' ? ADMIN_NOTIFICATION_EVENTS.ADMIN_RECRUITER_VERIFIED : ADMIN_NOTIFICATION_EVENTS.ADMIN_RECRUITER_REJECTED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'VERIFICATION',
        title: `Recruiter ${status === 'VERIFIED' ? 'Verified' : 'Rejected'}: ${rec?.name || 'Recruiter'}`,
        message: `${rec?.name || 'Recruiter'} (${rec?.company || 'Company'}) verification status updated to ${status}.`,
        link: '/admin/recruiters',
        meta: { recruiterId, recruiterName: rec?.name, company: rec?.company, status }
      },
      meta: { recruiterId, status }
    });
  };

  const suspendRecruiter = async (recruiterId, reason = 'Suspended by admin') => {
    try {
      await adminService.suspendRecruiter(recruiterId, reason);
    } catch (err) {
      console.warn('Backend suspendRecruiter call error:', err);
    }

    setRecruiters(prev =>
      prev.map(r => (r.id === recruiterId ? { ...r, accountStatus: 'SUSPENDED' } : r))
    );
    const rec = recruiters.find(r => r.id === recruiterId);
    addAuditLog('Recruiter Suspended', rec?.name || recruiterId, 'RECRUITER');
  };

  const activateRecruiter = async (recruiterId) => {
    try {
      await adminService.activateRecruiter(recruiterId);
    } catch (err) {
      console.warn('Backend activateRecruiter call error:', err);
    }

    setRecruiters(prev =>
      prev.map(r => (r.id === recruiterId ? { ...r, accountStatus: 'ACTIVE' } : r))
    );
    const rec = recruiters.find(r => r.id === recruiterId);
    addAuditLog('Recruiter Activated', rec?.name || recruiterId, 'RECRUITER');
  };

  // Candidate actions
  const suspendCandidate = async (candidateId, reason = 'Suspended by admin') => {
    try {
      await adminService.suspendCandidate(candidateId, reason);
    } catch (err) {
      console.warn('Backend suspendCandidate call error:', err);
    }
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, accountStatus: 'SUSPENDED' } : c))
    );
    const cand = candidates.find(c => c.id === candidateId);
    addAuditLog('Candidate Suspended', cand?.name || candidateId, 'CANDIDATE');
  };

  const activateCandidate = async (candidateId) => {
    try {
      await adminService.activateCandidate(candidateId);
    } catch (err) {
      console.warn('Backend activateCandidate call error:', err);
    }
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, accountStatus: 'ACTIVE' } : c))
    );
    const cand = candidates.find(c => c.id === candidateId);
    addAuditLog('Candidate Activated', cand?.name || candidateId, 'CANDIDATE');
  };

  const addCandidate = async (candidateData) => {
    let serverCand = null;
    try {
      const rawAadhaar = (candidateData.aadhaarNumber || '').replace(/[\s\-]/g, '');
      serverCand = await adminService.createCandidate({
        full_name: candidateData.name,
        email: candidateData.email,
        mobile_number: candidateData.phone,
        gender: candidateData.gender || 'Male',
        aadhaar_number: rawAadhaar,
        referred_by: candidateData.referenceAdmin || 'Admin User (State Operations)',
        custom_referrer: candidateData.customReferrer || null,
        placement_status: candidateData.placementStatus || 'NOT_PLACED',
        placed_company: candidateData.placedCompany || null,
        placed_role: candidateData.placedRole || null,
        placed_salary: candidateData.placedSalary || null,
        placed_date: candidateData.placedDate || null,
      });
    } catch (err) {
      console.warn('Backend createCandidate call error:', err);
      throw err;
    }

    const qual = serverCand?.qualification_level || candidateData.qualificationLevel || null;
    const qualLabel = qual === '10TH' ? '10th Class (SSC)' : qual === 'INTER' ? 'Intermediate / Diploma' : qual === 'PG' ? 'Postgraduate (PG)' : qual ? 'Undergraduate (UG)' : 'Pending Candidate 100% Profile Completion';
    
    const isBasicKYC = !candidateData.education && !candidateData.skills;
    const profileCompletion = serverCand?.profile_completion || (isBasicKYC ? 35 : (candidateData.profileCompletion || 100));
    const profileStatus = serverCand?.profile_status || (isBasicKYC ? 'BASIC_REGISTERED' : (candidateData.profileStatus || 'COMPLETE'));
    const isPlaced = (serverCand?.placement_status || candidateData.placementStatus) === 'PLACED';

    const newCand = {
      id: serverCand?.id || `cand-${Date.now()}`,
      user_id: serverCand?.user_id,
      name: serverCand?.name || candidateData.name || 'New Student',
      email: serverCand?.email || candidateData.email || '',
      phone: serverCand?.phone || candidateData.phone || '',
      gender: serverCand?.gender || candidateData.gender || 'Male',
      aadhaarNumber: serverCand?.aadhaar_masked || candidateData.aadhaarNumber || '',
      district: serverCand?.district || candidateData.district || 'NTR District',
      mandal: serverCand?.mandal || candidateData.mandal || '',
      village: serverCand?.village || candidateData.village || '',
      location: serverCand?.location || candidateData.location || 'NTR District',
      qualificationLevel: qual,
      education: serverCand?.education || qualLabel,
      headline: serverCand?.headline || (isPlaced ? `Placed at ${candidateData.placedCompany}` : (isBasicKYC ? 'Registered Candidate (KYC Verified)' : `${qualLabel} Candidate`)),
      experience: candidateData.experience || 'Fresher (0-1 Year)',
      skills: Array.isArray(candidateData.skills) ? candidateData.skills : (candidateData.skills ? candidateData.skills.split(',').map(s => s.trim()) : ['Basic Profile Registered']),
      placementStatus: isPlaced ? 'PLACED' : 'NOT_PLACED',
      placedCompany: isPlaced ? (serverCand?.placed_company || candidateData.placedCompany || '') : '',
      placedRole: isPlaced ? (serverCand?.placed_role || candidateData.placedRole || '') : '',
      placedSalary: isPlaced ? (serverCand?.placed_salary || candidateData.placedSalary || '') : '',
      placedDate: serverCand?.placed_date || candidateData.placedDate || null,
      isCompanyInDatabase: Boolean(candidateData.isCompanyInDatabase),
      referenceAdmin: serverCand?.reference_admin || candidateData.referenceAdmin || 'Admin User (State Operations)',
      customReferrer: serverCand?.custom_referrer || candidateData.customReferrer || '',
      registrationDate: serverCand?.registration_date || new Date().toISOString().split('T')[0],
      profileStatus,
      profileCompletion,
      accountStatus: 'ACTIVE',
      applicationsCount: 0,
    };
    setCandidates(prev => [newCand, ...prev.filter(c => c.id !== newCand.id)]);
    addAuditLog('Student / Candidate Added Manually', `${newCand.name} (Ref: ${newCand.referenceAdmin})`, 'CANDIDATE');
    return newCand;
  };

  const addRecruiter = async (recruiterData) => {
    let serverRecruiter = null;
    try {
      const payload = {
        name: recruiterData.name,
        email: recruiterData.email,
        phone: recruiterData.phone || '',
        designation: recruiterData.designation || 'Talent Acquisition Manager',
        company_type: recruiterData.companyType || (recruiterData.newCompanyName ? 'NEW' : 'EXISTING'),
        selected_company: recruiterData.selectedCompany || recruiterData.company || '',
        new_company_name: recruiterData.newCompanyName || '',
        company: recruiterData.company || recruiterData.selectedCompany || recruiterData.newCompanyName || '',
        industry: recruiterData.industry || 'Information Technology & Services',
        location: recruiterData.location || 'Vijayawada, NTR District',
      };
      serverRecruiter = await adminService.createRecruiter(payload);
    } catch (err) {
      console.warn('Backend createRecruiter call error:', err);
      throw err;
    }

    const assignedCompany = serverRecruiter?.company || recruiterData.company || recruiterData.selectedCompany || 'Registered Enterprise';

    const newRecruiter = {
      id: serverRecruiter?.id || `rec-u-${Date.now()}`,
      name: serverRecruiter?.name || recruiterData.name || 'New Recruiter',
      email: serverRecruiter?.email || recruiterData.email || '',
      phone: serverRecruiter?.phone || recruiterData.phone || '',
      company: assignedCompany,
      designation: serverRecruiter?.designation || recruiterData.designation || 'Talent Acquisition Manager',
      industry: serverRecruiter?.industry || recruiterData.industry || 'Information Technology & Services',
      location: serverRecruiter?.location || recruiterData.location || 'Vijayawada, NTR District',
      registrationDate: serverRecruiter?.registration_date || new Date().toISOString().split('T')[0],
      verificationStatus: serverRecruiter?.verification_status || 'VERIFIED',
      accountStatus: serverRecruiter?.account_status || 'ACTIVE',
      postedJobsCount: 0,
      documentsSubmitted: ['Admin Authorized Direct Onboarding', 'Official Work Email'],
      ...(serverRecruiter || {}),
      ...recruiterData,
      company: assignedCompany,
    };

    setRecruiters(prev => [newRecruiter, ...prev.filter(r => r.id !== newRecruiter.id)]);

    // If new company was registered, also update companies state
    if (recruiterData.companyType === 'NEW' && recruiterData.newCompanyName) {
      setCompanies(prev => {
        const exists = prev.some(c => (c.name || '').toLowerCase() === recruiterData.newCompanyName.toLowerCase());
        if (!exists) {
          return [{
            id: `comp-${Date.now()}`,
            name: recruiterData.newCompanyName,
            company_name: recruiterData.newCompanyName,
            recruiter: newRecruiter.name,
            recruiter_name: newRecruiter.name,
            email: newRecruiter.email,
            phone: newRecruiter.phone,
            industry: newRecruiter.industry,
            location: newRecruiter.location,
            verificationStatus: 'VERIFIED',
            accountStatus: 'ACTIVE',
            activeJobsCount: 0,
            open_jobs: 0,
            registrationDate: newRecruiter.registrationDate,
          }, ...prev];
        }
        return prev;
      });
    }

    addAuditLog('Recruiter Onboarded Manually by Admin', `${newRecruiter.name} (${newRecruiter.company})`, 'RECRUITER');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_RECRUITER_VERIFIED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'VERIFICATION',
        title: `Recruiter Directly Added: ${newRecruiter.name}`,
        message: `${newRecruiter.name} (${newRecruiter.company}) was onboarded directly by Admin and marked as ${newRecruiter.verificationStatus}.`,
        link: '/admin/recruiters',
        meta: { recruiterId: newRecruiter.id, recruiterName: newRecruiter.name, company: newRecruiter.company }
      },
      meta: { recruiterId: newRecruiter.id, status: newRecruiter.verificationStatus }
    });

    return newRecruiter;
  };

  const addCompany = async (companyData) => {
    let serverCompany = null;
    try {
      serverCompany = await adminService.createCompany({
        name: companyData.name,
        industry: companyData.industry,
        recruiter: companyData.recruiter,
        email: companyData.email,
        phone: companyData.phone,
        website: companyData.website,
        district: companyData.district || 'NTR District',
        mandal: companyData.mandal || 'Vijayawada Urban',
        village: companyData.village || '',
        size: companyData.size || '100-500 employees',
        type: companyData.type || 'Private Limited (Pvt Ltd)',
        cin: companyData.cin,
        gstin: companyData.gstin,
        about: companyData.about || companyData.description,
      });
    } catch (err) {
      console.warn('Backend createCompany call error:', err);
      throw err;
    }

    const newCompany = {
      id: serverCompany?.id || `comp-${Date.now()}`,
      name: serverCompany?.name || companyData.name || 'New Enterprise Partner',
      recruiter: serverCompany?.recruiter || companyData.recruiter || 'Corporate HR Lead',
      recruiter_name: serverCompany?.recruiter_name || companyData.recruiter || 'Corporate HR Lead',
      industry: serverCompany?.industry || companyData.industry || 'Information Technology & Services',
      location: serverCompany?.location || companyData.location || `${companyData.village ? companyData.village + ', ' : ''}${companyData.mandal || 'Vijayawada Urban'}, ${companyData.district || 'NTR District'}`,
      district: serverCompany?.district || companyData.district || 'NTR District',
      mandal: serverCompany?.mandal || companyData.mandal || 'Vijayawada Urban',
      village: serverCompany?.village || companyData.village || 'Commercial Hub',
      eligibleMandals: ['All Mandals of NTR District'],
      eligibleVillages: ['All Villages & Wards'],
      size: serverCompany?.size || companyData.size || '100-500 employees',
      company_size: serverCompany?.company_size || companyData.size || '100-500 employees',
      cin: serverCompany?.cin || companyData.cin || '',
      gstin: serverCompany?.gstin || companyData.gstin || '',
      verificationStatus: 'VERIFIED',
      status: 'APPROVED',
      accountStatus: 'ACTIVE',
      registrationDate: serverCompany?.registrationDate || new Date().toISOString().split('T')[0],
      activeJobsCount: 0,
      open_jobs: 0,
      website: serverCompany?.website || companyData.website || '',
      email: serverCompany?.email || companyData.email || '',
      phone: serverCompany?.phone || companyData.phone || '',
      description: serverCompany?.description || companyData.description || 'Verified enterprise hiring partner onboarded by NTR District Vikasa Administration.',
      about: serverCompany?.about || companyData.about || companyData.description || '',
      ...(serverCompany || {}),
    };
    setCompanies(prev => [newCompany, ...prev.filter(c => c.id !== newCompany.id)]);
    addAuditLog('Company Added Directly by Admin', `${newCompany.name} (${newCompany.industry})`, 'COMPANY');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_COMPANY_APPROVED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'COMPANY',
        title: `Company Directly Added: ${newCompany.name}`,
        message: `${newCompany.name} was registered directly by Admin and granted active recruitment privileges.`,
        link: '/admin/companies',
        meta: { companyId: newCompany.id, companyName: newCompany.name, status: 'VERIFIED' }
      },
      meta: { companyId: newCompany.id, status: 'VERIFIED' }
    });

    return newCompany;
  };

  const updateCandidate = (candidateId, updatedData) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, ...updatedData } : c))
    );
    addAuditLog('Candidate Details Updated', `Candidate #${candidateId}`, 'CANDIDATE');
  };

  const deleteCandidate = (candidateId) => {
    const target = candidates.find(c => c.id === candidateId);
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    addAuditLog('Candidate Removed from Platform', target?.name || candidateId, 'CANDIDATE');
  };

  const updateCandidatePlacement = async (candidateId, statusOrObj, placedCompany = '', placedRole = '', placedSalary = '', placedDate = null) => {
    let placementStatus = statusOrObj;
    let finalCompany = placedCompany;
    let finalRole = placedRole;
    let finalSalary = placedSalary;
    let finalDate = placedDate;

    if (typeof statusOrObj === 'object' && statusOrObj !== null) {
      placementStatus = statusOrObj.placementStatus;
      finalCompany = statusOrObj.placedCompany || '';
      finalRole = statusOrObj.placedRole || '';
      finalSalary = statusOrObj.placedSalary || '';
      finalDate = statusOrObj.placedDate || null;
    }

    try {
      await adminService.updateCandidatePlacement(candidateId, {
        placement_status: placementStatus,
        placed_company: finalCompany,
        placed_role: finalRole,
        placed_salary: finalSalary,
        placed_date: finalDate,
      });
    } catch (err) {
      console.warn('Backend updateCandidatePlacement call error:', err);
    }

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            placementStatus,
            placedCompany: placementStatus === 'PLACED' ? finalCompany : '',
            placedRole: placementStatus === 'PLACED' ? finalRole : '',
            placedSalary: placementStatus === 'PLACED' ? finalSalary : '',
            placedDate: placementStatus === 'PLACED' ? finalDate : null,
          };
        }
        return c;
      })
    );
    const target = candidates.find(c => c.id === candidateId);
    addAuditLog('Candidate Placement Status Updated', `${target?.name || candidateId}: ${placementStatus}`, 'CANDIDATE');
  };

  // Company actions
  const approveCompany = async (companyId) => {
    try {
      await adminService.approveCompany(companyId);
    } catch (err) {
      console.warn('Backend approveCompany call error:', err);
    }

    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, verificationStatus: 'VERIFIED', status: 'APPROVED' } : c))
    );
    const comp = companies.find(c => c.id === companyId);
    addAuditLog('Company Verified & Approved', comp?.name || companyId, 'COMPANY');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_COMPANY_APPROVED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'COMPANY',
        title: `Company Approved: ${comp?.name || 'Company'}`,
        message: `${comp?.name || 'Company'} corporate account verified and granted recruitment privileges.`,
        link: '/admin/companies',
        meta: { companyId, companyName: comp?.name, status: 'VERIFIED' }
      },
      meta: { companyId, status: 'VERIFIED' }
    });
  };

  const rejectCompany = async (companyId, reason = '') => {
    try {
      await adminService.rejectCompany(companyId, reason || 'Verification criteria not met.');
    } catch (err) {
      console.warn('Backend rejectCompany call error:', err);
    }

    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, verificationStatus: 'REJECTED', status: 'REJECTED', rejectionReason: reason } : c))
    );
    const comp = companies.find(c => c.id === companyId);
    addAuditLog('Company Verification Rejected', comp?.name || companyId, 'COMPANY');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_COMPANY_REJECTED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'COMPANY',
        title: `Company Rejected: ${comp?.name || 'Company'}`,
        message: `${comp?.name || 'Company'} verification request rejected. Reason: ${reason || 'Non-compliant documents'}.`,
        link: '/admin/companies/requests',
        meta: { companyId, companyName: comp?.name, status: 'REJECTED' }
      },
      meta: { companyId, status: 'REJECTED' }
    });
  };

  const suspendCompany = async (companyId, reason = '') => {
    try {
      await adminService.suspendCompany(companyId, reason || 'Suspended by admin');
    } catch (err) {
      console.warn('Backend suspendCompany call error:', err);
    }
    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, verificationStatus: 'SUSPENDED', accountStatus: 'SUSPENDED', status: 'SUSPENDED' } : c))
    );
    const comp = companies.find(c => c.id === companyId);
    addAuditLog('Company Suspended', comp?.name || companyId, 'COMPANY');
  };

  const activateCompany = (companyId) => {
    setCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, verificationStatus: 'VERIFIED', accountStatus: 'ACTIVE' } : c))
    );
    const comp = companies.find(c => c.id === companyId);
    addAuditLog('Company Activated', comp?.name || companyId, 'COMPANY');
  };

  // Job actions
  const approveJob = async (jobId) => {
    try {
      await adminService.approveJob(jobId);
    } catch (err) {
      console.warn('Backend approveJob call error:', err);
    }

    setJobs(prev =>
      prev.map(j => (j.id === jobId || j.job_id === jobId || j.job_number === jobId ? { ...j, status: 'PUBLISHED' } : j))
    );
    const job = jobs.find(j => j.id === jobId || j.job_id === jobId || j.job_number === jobId);
    addAuditLog('Job Approved & Published', job?.title || jobId, 'JOB');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_JOB_APPROVED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Job Approved & Published: ${job?.title || 'Job'}`,
        message: `"${job?.title || 'Job'}" by ${job?.company || 'Company'} is now active on the public job board.`,
        link: '/admin/jobs',
        meta: { jobId, jobTitle: job?.title, company: job?.company, status: 'PUBLISHED' }
      },
      meta: { jobId, status: 'PUBLISHED' }
    });
  };

  const rejectJob = async (jobId, reason = '') => {
    try {
      await adminService.rejectJob(jobId, reason || 'Policy requirements not met.');
    } catch (err) {
      console.warn('Backend rejectJob call error:', err);
    }

    setJobs(prev =>
      prev.map(j => (j.id === jobId || j.job_id === jobId || j.job_number === jobId ? { ...j, status: 'REJECTED', rejectionReason: reason } : j))
    );
    const job = jobs.find(j => j.id === jobId || j.job_id === jobId || j.job_number === jobId);
    addAuditLog('Job Posting Rejected', job?.title || jobId, 'JOB');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_JOB_REJECTED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Job Rejected: ${job?.title || 'Job'}`,
        message: `"${job?.title || 'Job'}" by ${job?.company || 'Company'} was rejected. Reason: ${reason || 'Policy requirements not met'}.`,
        link: '/admin/jobs/requests',
        meta: { jobId, jobTitle: job?.title, status: 'REJECTED' }
      },
      meta: { jobId, status: 'REJECTED' }
    });
  };

  const requestJobChanges = (jobId, feedback = '') => {
    setJobs(prev =>
      prev.map(j => (j.id === jobId || j.job_id === jobId ? { ...j, status: 'PENDING', changeRequest: feedback } : j))
    );
    const job = jobs.find(j => j.id === jobId || j.job_id === jobId);
    addAuditLog('Job Changes Requested', job?.title || jobId, 'JOB');
  };

  // Internship actions
  const approveInternship = async (internshipId) => {
    try {
      await adminService.approveInternship(internshipId);
    } catch (err) {
      console.warn('Backend approveInternship call error:', err);
    }

    setInternships(prev =>
      prev.map(i => (i.id === internshipId || i.internship_number === internshipId ? { ...i, status: 'PUBLISHED' } : i))
    );
    const intern = internships.find(i => i.id === internshipId || i.internship_number === internshipId);
    addAuditLog('Internship Approved', intern?.title || internshipId, 'INTERNSHIP');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_INTERNSHIP_APPROVED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Internship Approved: ${intern?.title || 'Internship'}`,
        message: `"${intern?.title || 'Internship'}" by ${intern?.company || 'Company'} approved for candidate applications.`,
        link: '/admin/internships',
        meta: { internshipId, title: intern?.title, status: 'PUBLISHED' }
      },
      meta: { internshipId, status: 'PUBLISHED' }
    });
  };

  const rejectInternship = async (internshipId, reason = '') => {
    try {
      await adminService.rejectInternship(internshipId, reason || 'Policy requirements not met.');
    } catch (err) {
      console.warn('Backend rejectInternship call error:', err);
    }

    setInternships(prev =>
      prev.map(i => (i.id === internshipId || i.internship_number === internshipId ? { ...i, status: 'REJECTED', rejectionReason: reason } : i))
    );
    const intern = internships.find(i => i.id === internshipId || i.internship_number === internshipId);
    addAuditLog('Internship Rejected', intern?.title || internshipId, 'INTERNSHIP');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_INTERNSHIP_REJECTED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Internship Rejected: ${intern?.title || 'Internship'}`,
        message: `"${intern?.title || 'Internship'}" was rejected. Reason: ${reason || 'Terms not met'}.`,
        link: '/admin/internships/requests',
        meta: { internshipId, status: 'REJECTED' }
      },
      meta: { internshipId, status: 'REJECTED' }
    });
  };


  // Job Mela actions
  const createJobMela = async (melaData) => {
    const isClientSpecific = !!melaData.client;
    const organizerName = isClientSpecific 
      ? `${melaData.client} (Client Hiring Summit)` 
      : (melaData.organizer || 'NTR Vikasa State Employment Authority (Admin)');

    let serverMela = null;
    try {
      serverMela = await adminService.createJobMela({
        title: melaData.title || melaData.event || 'Mega Career Expo',
        description: melaData.description || '',
        date: melaData.date || '2026-11-15',
        startTime: melaData.startTime || '09:00',
        endTime: melaData.endTime || '18:00',
        venue: melaData.venue || 'State Convention Center',
        address: melaData.address || '',
        city: melaData.city || 'Vijayawada',
        state: melaData.state || 'Andhra Pradesh',
        regStartDate: melaData.regStartDate || '2026-10-01',
        regEndDate: melaData.regEndDate || '2026-11-10',
        maxCapacity: Number(melaData.maxCapacity) || 3500,
        createdForClient: isClientSpecific,
        client: melaData.client || '',
        clientId: melaData.clientId || '',
        clientContactPerson: melaData.clientContactPerson || '',
        clientContactPhone: melaData.clientContactPhone || '',
        eligibleMandals: melaData.eligibleMandals || ['All Mandals'],
        eligibleVillages: melaData.eligibleVillages || 'All villages in selected mandals',
        eligibleQualifications: melaData.eligibleQualifications || ['10TH', 'INTER', 'UG', 'PG'],
        banner: melaData.banner || melaData.posterImage || '/hero2.jpg',
        posterImage: melaData.posterImage || melaData.banner || '/hero2.jpg',
        status: melaData.status || 'APPROVED',
        participatingCompanies: melaData.participatingCompanies || [],
      });
    } catch (err) {
      console.warn('Backend createJobMela call error:', err);
    }

    const newMela = serverMela ? {
      ...serverMela,
      createdByAdmin: true,
      createdForClient: isClientSpecific,
      organizer: serverMela.organizer || organizerName,
    } : {
      id: `mela-${Date.now()}`,
      event: melaData.title || melaData.event || (isClientSpecific ? `${melaData.client} Mega Recruitment Drive` : 'Mega Job Mela Event'),
      title: melaData.title || melaData.event || (isClientSpecific ? `${melaData.client} Mega Recruitment Drive` : 'Mega Job Mela Event'),
      description: melaData.description || '',
      client: melaData.client || '',
      clientId: melaData.clientId || '',
      date: melaData.date || '2026-11-15',
      startTime: melaData.startTime || '09:00',
      endTime: melaData.endTime || '18:00',
      time: `${melaData.startTime || '09:00 AM'} - ${melaData.endTime || '06:00 PM'}`,
      regStartDate: melaData.regStartDate || '2026-10-01',
      regEndDate: melaData.regEndDate || '2026-11-10',
      maxCapacity: Number(melaData.maxCapacity) || 5000,
      location: melaData.city && melaData.state ? `${melaData.city}, ${melaData.state}` : (melaData.location || 'Vijayawada, Andhra Pradesh'),
      venue: melaData.venue || melaData.address || 'State Convention Center, Vijayawada',
      city: melaData.city || 'Vijayawada',
      state: melaData.state || 'Andhra Pradesh',
      address: melaData.address || '',
      organizer: organizerName,
      createdByAdmin: true,
      createdForClient: isClientSpecific,
      companiesCount: (melaData.participatingCompanies || []).length || (isClientSpecific ? 1 : 0),
      vacanciesCount: Number(melaData.vacanciesCount || melaData.maxCapacity) || 1000,
      registeredCandidatesCount: Number(melaData.registeredCandidatesCount) || 0,
      status: melaData.status || 'APPROVED',
      eligibleMandals: melaData.eligibleMandals || ['All Mandals'],
      eligibleVillages: melaData.eligibleVillages || ['All Villages'],
      participatingCompanies: melaData.participatingCompanies || [],
      ...melaData
    };

    setJobMelas(prev => [newMela, ...prev.filter(m => m.id !== newMela.id)]);
    addAuditLog('Job Mela Event Created', `${newMela.event || newMela.title}${isClientSpecific ? ` for ${newMela.client}` : ''}`, 'JOB_MELA');
    return newMela;
  };

  const addCompanyToJobMela = async (melaId, companyData) => {
    let serverComp = null;
    try {
      serverComp = await adminService.addCompanyToMela(melaId, companyData);
    } catch (err) {
      console.warn('Backend addCompanyToMela call error:', err);
    }

    const matchedComp = companies.find(c => c.id === companyData.companyId || c.name === companyData.company);
    const newEntry = serverComp ? {
      ...serverComp,
      applications: 0
    } : {
      id: `pmc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      companyId: companyData.companyId || matchedComp?.id || '',
      company: companyData.company || companyData.name || 'Participating Employer',
      recruiter: companyData.recruiter || matchedComp?.recruiter || 'Talent Acquisition Lead',
      position: companyData.position || 'Software / Technical Professional',
      qualification: companyData.qualification || 'Any Graduate / B.Tech / Diploma',
      experience: companyData.experience || '0-3 Years',
      salary: companyData.salary || '₹3,50,000 - ₹7,00,000 / year',
      vacancies: Number(companyData.vacancies) || 10,
      applications: Number(companyData.applications) || 0,
      location: companyData.location || 'On-site Mela Stalls',
      notes: companyData.notes || 'Walk-in interview',
      ...companyData,
    };

    setJobMelas(prev =>
      prev.map(m => {
        if (m.id === melaId) {
          const currentCompanies = Array.isArray(m.participatingCompanies) ? m.participatingCompanies : [];
          const updatedCompanies = [...currentCompanies, newEntry];
          return {
            ...m,
            participatingCompanies: updatedCompanies,
            companiesCount: updatedCompanies.length,
          };
        }
        return m;
      })
    );

    addAuditLog('Company Added to Job Mela', `${newEntry.company} — Event #${melaId}`, 'JOB_MELA');
    return newEntry;
  };

  const updateCompanyInJobMela = async (melaId, companyEntryId, updatedData) => {
    try {
      await adminService.updateCompanyInMela(melaId, companyEntryId, updatedData);
    } catch (err) {
      console.warn('Backend updateCompanyInMela call error:', err);
    }

    setJobMelas(prev =>
      prev.map(m => {
        if (m.id === melaId) {
          const currentCompanies = Array.isArray(m.participatingCompanies) ? m.participatingCompanies : [];
          const updatedCompanies = currentCompanies.map(c =>
            c.id === companyEntryId ? { ...c, ...updatedData } : c
          );
          return {
            ...m,
            participatingCompanies: updatedCompanies,
            companiesCount: updatedCompanies.length,
          };
        }
        return m;
      })
    );
    addAuditLog('Job Mela Company Details Updated', `Entry #${companyEntryId} in Event #${melaId}`, 'JOB_MELA');
  };

  const removeCompanyFromJobMela = async (melaId, companyEntryId) => {
    try {
      await adminService.removeCompanyFromMela(melaId, companyEntryId);
    } catch (err) {
      console.warn('Backend removeCompanyFromMela call error:', err);
    }

    setJobMelas(prev =>
      prev.map(m => {
        if (m.id === melaId) {
          const currentCompanies = Array.isArray(m.participatingCompanies) ? m.participatingCompanies : [];
          const updatedCompanies = currentCompanies.filter(c => c.id !== companyEntryId);
          return {
            ...m,
            participatingCompanies: updatedCompanies,
            companiesCount: updatedCompanies.length,
          };
        }
        return m;
      })
    );
    addAuditLog('Company Removed from Job Mela', `Entry #${companyEntryId} removed from Event #${melaId}`, 'JOB_MELA');
  };

  const approveJobMela = async (melaId) => {
    const mela = jobMelas.find(m => m.id === melaId);
    const isRequest = !mela?.createdByAdmin || mela?.status === 'PENDING' || String(melaId).startsWith('req-') || String(melaId).startsWith('jmr-');

    try {
      if (isRequest) {
        await adminService.approveJobMelaRequest(melaId);
      } else {
        await adminService.updateJobMelaStatus(melaId, 'APPROVED');
      }
    } catch (err) {
      console.warn('Backend approveJobMela call error:', err);
    }

    setJobMelas(prev =>
      prev.map(m => (m.id === melaId ? { ...m, status: 'APPROVED' } : m))
    );
    addAuditLog('Job Mela Event Approved', mela?.event || melaId, 'JOB_MELA');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_JOB_MELA_APPROVED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'JOB_MELA',
        title: `Job Mela Approved: ${mela?.event || 'Job Mela'}`,
        message: `Event "${mela?.event || 'Job Mela'}" confirmed and open for candidate registrations.`,
        link: '/admin/job-melas',
        meta: { melaId, eventName: mela?.event, status: 'APPROVED' }
      },
      meta: { melaId, status: 'APPROVED' }
    });
  };

  const rejectJobMela = async (melaId, reason = '') => {
    const mela = jobMelas.find(m => m.id === melaId);
    const isRequest = !mela?.createdByAdmin || mela?.status === 'PENDING' || String(melaId).startsWith('req-') || String(melaId).startsWith('jmr-');

    try {
      if (isRequest) {
        await adminService.rejectJobMelaRequest(melaId, reason || 'Does not meet requirements.');
      } else {
        await adminService.updateJobMelaStatus(melaId, 'REJECTED');
      }
    } catch (err) {
      console.warn('Backend rejectJobMela call error:', err);
    }

    setJobMelas(prev =>
      prev.map(m => (m.id === melaId ? { ...m, status: 'REJECTED', rejectionReason: reason } : m))
    );
    addAuditLog('Job Mela Event Rejected', mela?.event || melaId, 'JOB_MELA');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_JOB_MELA_REJECTED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'JOB_MELA',
        title: `Job Mela Rejected: ${mela?.event || 'Job Mela'}`,
        message: `Event "${mela?.event || 'Job Mela'}" has been rejected.`,
        link: '/admin/job-melas',
        meta: { melaId, eventName: mela?.event, status: 'REJECTED' }
      },
      meta: { melaId, status: 'REJECTED' }
    });
  };

  const registerForJobMela = (regData) => {
    const matchedMela = jobMelas.find(m => String(m.id) === String(regData.melaId));
    const newReg = {
      id: regData.id || `REG-${regData.melaId || 'MELA'}-${Date.now().toString().slice(-4)}`,
      melaId: regData.melaId || matchedMela?.id || '',
      candidateId: regData.candidateId || '',
      candidate: regData.candidateName || regData.name || regData.candidate || 'Registered Candidate',
      candidateName: regData.candidateName || regData.name || regData.candidate || 'Registered Candidate',
      email: regData.email || regData.candidateEmail || '',
      candidateEmail: regData.email || regData.candidateEmail || '',
      phone: regData.phone || '',
      event: regData.event || regData.title || regData.eventName || matchedMela?.title || matchedMela?.event || 'Mega Job Mela',
      eventName: regData.event || regData.title || regData.eventName || matchedMela?.title || matchedMela?.event || 'Mega Job Mela',
      registrationDate: regData.registrationDate || new Date().toISOString().split('T')[0],
      status: regData.status || 'CONFIRMED',
      entryToken: regData.entryToken || `TKN-${(regData.city || matchedMela?.city || 'AP').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      passId: regData.passId || `PASS-AP-${Math.floor(100000 + Math.random() * 900000)}`,
      gateNumber: regData.gateNumber || 'Gate 2 (General Fast-Track)',
      timeSlot: regData.timeSlot || 'Morning Session (09:00 AM - 01:00 PM)',
      ...regData
    };

    setRegistrations(prev => [newReg, ...prev.filter(r => !(r.id === newReg.id || (String(r.melaId) === String(newReg.melaId) && r.candidateEmail === newReg.candidateEmail)))]);

    // Update registeredCandidatesCount on Job Mela
    if (newReg.melaId) {
      setJobMelas(prev => prev.map(m => {
        if (String(m.id) === String(newReg.melaId)) {
          return {
            ...m,
            registeredCandidatesCount: (Number(m.registeredCandidatesCount) || 0) + 1
          };
        }
        return m;
      }));
    }

    addAuditLog('Candidate Registered for Job Mela', `${newReg.candidate} for ${newReg.event}`, 'JOB_MELA');
    return newReg;
  };

  const applyToJobMelaCompany = (appData) => {
    const matchedMela = jobMelas.find(m => String(m.id) === String(appData.melaId));
    const newApp = {
      id: appData.id || `app-mela-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      melaId: appData.melaId || matchedMela?.id || '',
      melaTitle: appData.melaTitle || matchedMela?.title || matchedMela?.event || 'Job Mela',
      company: appData.company || appData.companyName || 'Participating Company',
      companyName: appData.company || appData.companyName || 'Participating Company',
      companyId: appData.companyId || '',
      job: appData.role || appData.position || appData.title || 'Walk-in Role',
      title: appData.role || appData.position || appData.title || 'Walk-in Role',
      role: appData.role || appData.position || appData.title || 'Walk-in Role',
      candidateId: appData.candidateId || '',
      candidate: appData.candidate || appData.candidateName || appData.name || 'Candidate',
      candidateName: appData.candidate || appData.candidateName || appData.name || 'Candidate',
      candidateEmail: appData.candidateEmail || appData.email || '',
      email: appData.candidateEmail || appData.email || '',
      phone: appData.phone || '',
      appNumber: appData.appNumber || appData.appId || `NTR-APP-${Date.now().toString().slice(-4)}`,
      applicationType: 'Job Mela Application',
      appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
      status: appData.status || 'APPLIED',
      salary: appData.salary || 'Best in Industry',
      location: appData.location || matchedMela?.venue || matchedMela?.city || '',
      ...appData
    };

    setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id && a.appNumber !== newApp.appNumber)]);

    // Update applications count on that specific company in the Job Mela
    if (newApp.melaId) {
      setJobMelas(prev => prev.map(m => {
        if (String(m.id) === String(newApp.melaId)) {
          const updatedCompanies = (m.participatingCompanies || []).map(c => {
            const isMatch = (c.id && (c.id === appData.companyEntryId || c.id === appData.companyId)) ||
              (c.companyId && c.companyId === newApp.companyId) ||
              (c.company && newApp.company && c.company.trim().toLowerCase() === newApp.company.trim().toLowerCase());
            if (isMatch) {
              return {
                ...c,
                applications: (Number(c.applications) || 0) + 1
              };
            }
            return c;
          });
          return {
            ...m,
            participatingCompanies: updatedCompanies
          };
        }
        return m;
      }));
    }

    addAuditLog('Candidate Applied to Job Mela Company', `${newApp.candidate} -> ${newApp.company} (${newApp.role})`, 'JOB_MELA');
    return newApp;
  };

  const getMelaStats = (melaId) => {
    if (!melaId) return null;
    const mela = jobMelas.find(m => String(m.id) === String(melaId));
    if (!mela) return null;

    const participatingCompanies = Array.isArray(mela.participatingCompanies) ? mela.participatingCompanies : [];
    const companiesCount = participatingCompanies.length;

    // Applications submitted to any company in this Job Mela
    const melaApplications = (applications || []).filter(a => {
      if (a.melaId && String(a.melaId) === String(melaId)) return true;
      if (a.melaTitle && (mela.title && a.melaTitle.toLowerCase() === mela.title.toLowerCase() || mela.event && a.melaTitle.toLowerCase() === mela.event.toLowerCase())) return true;
      return false;
    });

    // Registrations for entry pass to this Job Mela
    const melaRegistrations = (registrations || []).filter(r => {
      if (r.melaId && String(r.melaId) === String(melaId)) return true;
      if (r.event && (mela.title && r.event.toLowerCase() === mela.title.toLowerCase() || mela.event && r.event.toLowerCase() === mela.event.toLowerCase())) return true;
      if (r.eventName && (mela.title && r.eventName.toLowerCase() === mela.title.toLowerCase() || mela.event && r.eventName.toLowerCase() === mela.event.toLowerCase())) return true;
      return false;
    });

    // Unique Candidates map: 1 person applying to 3 companies counts as 1 person for the Job Mela
    const uniqueCandidatesMap = new Map();

    melaApplications.forEach(app => {
      const key = (app.candidateEmail || app.email || app.candidateId || app.candidate || app.candidateName || '').toLowerCase().trim();
      if (key) {
        if (!uniqueCandidatesMap.has(key)) {
          uniqueCandidatesMap.set(key, {
            id: app.candidateId || `cand-app-${key}`,
            name: app.candidate || app.candidateName || key,
            email: app.candidateEmail || app.email || key,
            phone: app.phone || '',
            appliedCompanies: [app.company || app.companyName],
            appliedRoles: [app.role || app.title || 'Role'],
            applicationsCount: 1,
            hasPass: false,
            passId: app.passId || null,
          });
        } else {
          const existing = uniqueCandidatesMap.get(key);
          const compName = app.company || app.companyName;
          if (compName && !existing.appliedCompanies.includes(compName)) {
            existing.appliedCompanies.push(compName);
          }
          const roleName = app.role || app.title;
          if (roleName && !existing.appliedRoles.includes(roleName)) {
            existing.appliedRoles.push(roleName);
          }
          existing.applicationsCount += 1;
        }
      }
    });

    melaRegistrations.forEach(reg => {
      const key = (reg.candidateEmail || reg.email || reg.candidateId || reg.candidate || reg.candidateName || '').toLowerCase().trim();
      if (key) {
        if (!uniqueCandidatesMap.has(key)) {
          uniqueCandidatesMap.set(key, {
            id: reg.candidateId || `cand-reg-${key}`,
            name: reg.candidate || reg.candidateName || key,
            email: reg.candidateEmail || reg.email || key,
            phone: reg.phone || '',
            appliedCompanies: [],
            appliedRoles: [],
            applicationsCount: 0,
            hasPass: true,
            passId: reg.passId || reg.entryToken || reg.id,
            gateNumber: reg.gateNumber || 'Gate 1',
            registrationDate: reg.registrationDate || ''
          });
        } else {
          const existing = uniqueCandidatesMap.get(key);
          existing.hasPass = true;
          existing.passId = reg.passId || reg.entryToken || reg.id;
          if (reg.gateNumber) existing.gateNumber = reg.gateNumber;
          if (reg.registrationDate) existing.registrationDate = reg.registrationDate;
        }
      }
    });

    const uniqueAppliedCandidates = Array.from(uniqueCandidatesMap.values());
    const uniqueAppliedCandidatesCount = uniqueAppliedCandidates.length;
    const totalCompanyApplicationsCount = melaApplications.length;

    // Candidates NOT applied/registered in this Job Mela
    const appliedKeys = new Set(Array.from(uniqueCandidatesMap.keys()));
    const notAppliedCandidates = (candidates || []).filter(c => {
      const candEmail = (c.email || '').toLowerCase().trim();
      const candId = (c.id || '').toLowerCase().trim();
      const candName = (c.name || '').toLowerCase().trim();
      return !appliedKeys.has(candEmail) && !appliedKeys.has(candId) && !appliedKeys.has(candName);
    });

    const totalPlatformCandidatesCount = (candidates || []).length;
    const notAppliedCandidatesCount = Math.max(0, totalPlatformCandidatesCount - uniqueAppliedCandidatesCount);

    // Specific company stats helper
    const getCompanyStats = (comp) => {
      const compName = (comp.company || comp.name || '').trim().toLowerCase();
      const compId = comp.companyId || comp.id;
      const compApps = melaApplications.filter(a => {
        const aName = (a.company || a.companyName || '').trim().toLowerCase();
        const aId = a.companyId || a.companyEntryId;
        return (compName && aName === compName) || (compId && aId === compId);
      });
      return {
        appliedCount: compApps.length,
        applicants: compApps
      };
    };

    return {
      mela,
      companiesCount,
      participatingCompanies,
      melaApplications,
      melaRegistrations,
      totalCompanyApplicationsCount,
      uniqueAppliedCandidates,
      uniqueAppliedCandidatesCount,
      notAppliedCandidates,
      notAppliedCandidatesCount,
      totalPlatformCandidatesCount,
      getCompanyStats
    };
  };

  // Report actions
  const resolveReport = (reportId, resolutionNotes = '') => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: 'RESOLVED', actionTaken: resolutionNotes || 'Resolved by administrator.' } : r))
    );
    const rep = reports.find(r => r.id === reportId);
    addAuditLog('Report Complaint Resolved', rep?.reportedEntity || reportId, 'REPORT');

    dispatchAdminEvent({
      eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_REPORT_RESOLVED,
      adminEmail: currentAdmin.email,
      recipientName: currentAdmin.name,
      addNotification,
      notification: {
        category: 'REPORT',
        title: `Report Resolved: #${reportId}`,
        message: `Complaint regarding "${rep?.reportedEntity || 'Entity'}" resolved with action: ${resolutionNotes || 'Disciplinary action completed'}.`,
        link: '/admin/reports',
        meta: { reportId, status: 'RESOLVED' }
      },
      meta: { reportId, status: 'RESOLVED' }
    });
  };

  const rejectReport = (reportId) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: 'DISMISSED', actionTaken: 'Dismissed as non-actionable.' } : r))
    );
    const rep = reports.find(r => r.id === reportId);
    addAuditLog('Report Complaint Dismissed', rep?.reportedEntity || reportId, 'REPORT');
  };

  // Settings update
  const updateAdminSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('Admin System Settings Updated', 'System Configuration', 'SETTINGS');
  };

  // Home Page Content CMS update
  const updateHomeContent = (newContent) => {
    setHomeContent(prev => {
      const updated = {
        ...prev,
        ...newContent,
        hero: { ...prev.hero, ...(newContent.hero || {}) },
        stats: newContent.stats || prev.stats,
        whyChoose: {
          ...prev.whyChoose,
          ...(newContent.whyChoose || {}),
          cards: newContent.whyChoose?.cards || prev.whyChoose.cards,
        },
        welcomePopup: {
          ...(prev.welcomePopup || DEFAULT_HOME_CONTENT.welcomePopup),
          ...(newContent.welcomePopup || {}),
        },
        gallery: {
          ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
          ...(newContent.gallery || {}),
          images: newContent.gallery?.images || prev.gallery?.images || DEFAULT_HOME_CONTENT.gallery.images,
          videos: newContent.gallery?.videos || prev.gallery?.videos || DEFAULT_HOME_CONTENT.gallery.videos,
        },
        newsArticles: {
          ...(prev.newsArticles || DEFAULT_HOME_CONTENT.newsArticles),
          ...(newContent.newsArticles || {}),
          articles: newContent.newsArticles?.articles || prev.newsArticles?.articles || DEFAULT_HOME_CONTENT.newsArticles.articles,
        },
      };
      return updated;
    });
    addAuditLog('Home Page Content Updated', 'Public Home Page Content CMS', 'SETTINGS');
  };

  const resetHomeContent = () => {
    setHomeContent(DEFAULT_HOME_CONTENT);
    addAuditLog('Home Page Content Reset to Defaults', 'Public Home Page Content CMS', 'SETTINGS');
  };

  // Gallery CMS Helper Actions
  const addGalleryImage = (image) => {
    const newImage = {
      id: `img-${Date.now()}`,
      title: image.title || 'Untitled Image',
      category: image.category || 'Job Melas',
      imageUrl: image.imageUrl || '',
      date: image.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: image.description || '',
    };
    setHomeContent(prev => ({
      ...prev,
      gallery: {
        ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
        images: [newImage, ...(prev.gallery?.images || [])],
      },
    }));
    addAuditLog('Gallery Image Added', newImage.title, 'SETTINGS');
    return newImage;
  };

  const updateGalleryImage = (imageId, updatedData) => {
    setHomeContent(prev => ({
      ...prev,
      gallery: {
        ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
        images: (prev.gallery?.images || []).map(img => img.id === imageId ? { ...img, ...updatedData } : img),
      },
    }));
    addAuditLog('Gallery Image Updated', updatedData.title || imageId, 'SETTINGS');
  };

  const deleteGalleryImage = (imageId) => {
    setHomeContent(prev => ({
      ...prev,
      gallery: {
        ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
        images: (prev.gallery?.images || []).filter(img => img.id !== imageId),
      },
    }));
    addAuditLog('Gallery Image Deleted', imageId, 'SETTINGS');
  };

  const addGalleryVideo = (video) => {
    const newVideo = {
      id: `vid-${Date.now()}`,
      title: video.title || 'Untitled Video',
      youtubeUrl: video.youtubeUrl || '',
      category: video.category || 'Job Melas',
      date: video.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: video.description || '',
    };
    setHomeContent(prev => ({
      ...prev,
      gallery: {
        ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
        videos: [newVideo, ...(prev.gallery?.videos || [])],
      },
    }));
    addAuditLog('Gallery Video Added', newVideo.title, 'SETTINGS');
    return newVideo;
  };

  const updateGalleryVideo = (videoId, updatedData) => {
    setHomeContent(prev => ({
      ...prev,
      gallery: {
        ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
        videos: (prev.gallery?.videos || []).map(vid => vid.id === videoId ? { ...vid, ...updatedData } : vid),
      },
    }));
    addAuditLog('Gallery Video Updated', updatedData.title || videoId, 'SETTINGS');
  };

  const deleteGalleryVideo = (videoId) => {
    setHomeContent(prev => ({
      ...prev,
      gallery: {
        ...(prev.gallery || DEFAULT_HOME_CONTENT.gallery),
        videos: (prev.gallery?.videos || []).filter(vid => vid.id !== videoId),
      },
    }));
    addAuditLog('Gallery Video Deleted', videoId, 'SETTINGS');
  };

  // News Articles CMS Helper Actions
  const addNewsArticle = (article) => {
    const newArticle = {
      id: article.id || `news-${Date.now()}`,
      newspaper: article.newspaper || article.publication_name || 'Daily News',
      title: article.title || 'Untitled Article',
      date: article.date || article.publication_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      edition: article.edition || '',
      imageUrl: article.imageUrl || article.image_url || '',
      sourceUrl: article.sourceUrl || article.source_url || article.article_url || '',
      summary: article.summary || article.description || '',
    };
    setHomeContent(prev => ({
      ...prev,
      newsArticles: {
        ...(prev.newsArticles || DEFAULT_HOME_CONTENT.newsArticles),
        articles: [newArticle, ...(prev.newsArticles?.articles || [])],
      },
    }));
    addAuditLog('News Article Added', newArticle.title, 'SETTINGS');
    return newArticle;
  };

  const updateNewsArticle = (articleId, updatedData) => {
    setHomeContent(prev => ({
      ...prev,
      newsArticles: {
        ...(prev.newsArticles || DEFAULT_HOME_CONTENT.newsArticles),
        articles: (prev.newsArticles?.articles || []).map(a => a.id === articleId ? { ...a, ...updatedData } : a),
      },
    }));
    addAuditLog('News Article Updated', updatedData.title || articleId, 'SETTINGS');
  };

  const deleteNewsArticle = (articleId) => {
    setHomeContent(prev => ({
      ...prev,
      newsArticles: {
        ...(prev.newsArticles || DEFAULT_HOME_CONTENT.newsArticles),
        articles: (prev.newsArticles?.articles || []).filter(a => a.id !== articleId),
      },
    }));
    addAuditLog('News Article Deleted', articleId, 'SETTINGS');
  };

  // Jobs Page Hero & Search Content CMS update
  const updateJobsPageContent = (newContent) => {
    setJobsPageContent(prev => {
      const updated = {
        ...prev,
        ...newContent,
        hero: { ...prev.hero, ...(newContent.hero || {}) },
        search: {
          ...prev.search,
          ...(newContent.search || {}),
          popularSearches: newContent.search?.popularSearches || prev.search.popularSearches,
        },
      };
      try {
        localStorage.setItem('ntr_admin_jobs_page_content_v1', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    addAuditLog('Jobs Page Content Updated', 'Public Jobs Page Hero & Search CMS', 'SETTINGS');
  };

  const resetJobsPageContent = () => {
    setJobsPageContent(DEFAULT_JOBS_PAGE_CONTENT);
    try {
      localStorage.removeItem('ntr_admin_jobs_page_content_v1');
    } catch (e) {
      // ignore
    }
    addAuditLog('Jobs Page Content Reset to Defaults', 'Public Jobs Page Hero & Search CMS', 'SETTINGS');
  };

  // Job Mela Page Hero Content CMS update
  const updateJobMelaContent = (newContent) => {
    setJobMelaContent(prev => {
      const updated = {
        ...prev,
        ...newContent,
        hero: { ...prev.hero, ...(newContent.hero || {}) },
      };
      return updated;
    });
    addAuditLog('Job Mela Page Content Updated', 'Public Job Mela Hero CMS', 'SETTINGS');
  };

  const resetJobMelaContent = () => {
    setJobMelaContent(DEFAULT_JOB_MELA_CONTENT);
    addAuditLog('Job Mela Page Content Reset to Defaults', 'Public Job Mela Hero CMS', 'SETTINGS');
  };

  // Skill Development Page Content CMS update
  const updateSkillPageContent = (newContent) => {
    setSkillPageContent(prev => {
      const updated = {
        ...prev,
        ...newContent,
        hero: { ...prev.hero, ...(newContent.hero || {}) },
        highlights: newContent.highlights || prev.highlights,
        empoweringSkills: {
          ...prev.empoweringSkills,
          ...(newContent.empoweringSkills || {}),
          cards: newContent.empoweringSkills?.cards || prev.empoweringSkills.cards,
        },
        trainingJourney: {
          ...prev.trainingJourney,
          ...(newContent.trainingJourney || {}),
          steps: newContent.trainingJourney?.steps || prev.trainingJourney.steps,
        },
        programsWeOffer: {
          ...prev.programsWeOffer,
          ...(newContent.programsWeOffer || {}),
          categories: newContent.programsWeOffer?.categories || prev.programsWeOffer.categories,
        },
        whyChoose: {
          ...prev.whyChoose,
          ...(newContent.whyChoose || {}),
          cards: newContent.whyChoose?.cards || prev.whyChoose.cards,
        },
      };
      try {
        localStorage.setItem('ntr_admin_skill_page_content_v1', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    addAuditLog('Skill Development Page Content Updated', 'Public Skill Development CMS', 'SETTINGS');
  };

  const resetSkillPageContent = () => {
    setSkillPageContent(DEFAULT_SKILL_PAGE_CONTENT);
    try {
      localStorage.removeItem('ntr_admin_skill_page_content_v1');
    } catch (e) {
      // ignore
    }
    addAuditLog('Skill Development Page Content Reset to Defaults', 'Public Skill Development CMS', 'SETTINGS');
  };

  // About Us Page Content CMS update
  const updateAboutContent = (newContent) => {
    setAboutContent(prev => {
      const updated = {
        ...prev,
        ...newContent,
        hero: {
          ...prev.hero,
          ...(newContent.hero || {}),
        },
        stats: newContent.stats || prev.stats,
        whatWeStandFor: {
          ...prev.whatWeStandFor,
          ...(newContent.whatWeStandFor || {}),
          cards: newContent.whatWeStandFor?.cards || prev.whatWeStandFor.cards,
        },
        team: {
          ...prev.team,
          ...(newContent.team || {}),
          members: newContent.team?.members || prev.team.members,
        },
        leadershipMessages: {
          ...prev.leadershipMessages,
          ...(newContent.leadershipMessages || {}),
          messages: newContent.leadershipMessages?.messages || prev.leadershipMessages.messages,
        },
        partners: {
          ...prev.partners,
          ...(newContent.partners || {}),
          list: newContent.partners?.list || prev.partners.list,
        },
      };
      return updated;
    });
    addAuditLog('About Us Page Content Updated', 'Public About Us Page CMS', 'SETTINGS');
  };

  const resetAboutContent = () => {
    setAboutContent(DEFAULT_ABOUT_CONTENT);
    addAuditLog('About Us Page Content Reset to Defaults', 'Public About Us Page CMS', 'SETTINGS');
  };

  // Summary counts for badges
  const pendingCounts = {
    recruiterVerifications: recruiters.filter(r => r.verificationStatus === 'PENDING').length,
    companyVerifications: companies.filter(c => c.verificationStatus === 'PENDING').length,
    jobApprovals: jobs.filter(j => j.status === 'PENDING').length,
    internshipApprovals: internships.filter(i => i.status === 'PENDING').length,
    jobMelaApprovals: jobMelas.filter(m => m.status === 'PENDING').length,
    openReports: reports.filter(r => r.status === 'PENDING').length,
    unreadNotifications: notifications.filter(n => n.unread).length,
  };

  return (
    <AdminContext.Provider
      value={{
        adminUsers,
        currentAdmin,
        activeAdminId,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        switchAdmin,
        candidates,
        recruiters,
        companies,
        jobs,
        internships,
        applications,
        jobMelas,
        registrations,
        reports,
        auditLogs,
        notifications,
        settings,
        homeContent,
        jobsPageContent,
        jobMelaContent,
        skillPageContent,
        aboutContent,
        pendingCounts,
        verifyRecruiter,
        suspendRecruiter,
        activateRecruiter,
        addRecruiter,
        suspendCandidate,
        activateCandidate,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        updateCandidatePlacement,
        approveCompany,
        rejectCompany,
        suspendCompany,
        activateCompany,
        addCompany,
        approveJob,
        rejectJob,
        requestJobChanges,
        approveInternship,
        rejectInternship,
        approveJobMela,
        rejectJobMela,
        createJobMela,
        addCompanyToJobMela,
        updateCompanyInJobMela,
        removeCompanyFromJobMela,
        registerForJobMela,
        applyToJobMelaCompany,
        getMelaStats,
        setJobMelas,
        setRegistrations,
        setApplications,
        resolveReport,
        rejectReport,
        updateAdminSettings,
        updateHomeContent,
        resetHomeContent,
        addGalleryImage,
        updateGalleryImage,
        deleteGalleryImage,
        addGalleryVideo,
        updateGalleryVideo,
        deleteGalleryVideo,
        addNewsArticle,
        updateNewsArticle,
        deleteNewsArticle,
        updateJobsPageContent,
        resetJobsPageContent,
        updateJobMelaContent,
        resetJobMelaContent,
        updateSkillPageContent,
        resetSkillPageContent,
        updateAboutContent,
        resetAboutContent,
        addAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
