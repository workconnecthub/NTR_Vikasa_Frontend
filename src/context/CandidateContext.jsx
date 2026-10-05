import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNotifications } from './NotificationContext';
import { dispatchCandidateEvent, NOTIFICATION_EVENTS } from '../services/notificationEventService';
import authService from '../services/authService';
import candidateSavedJobsService from '../services/candidateSavedJobsService';

export const calculateProfileCompletion = (c) => {
  if (!c) return 0;
  let score = 0;
  // 1. Five Signup/Personal fields: 5% each = 25% total
  if (c.name && c.name.trim()) score += 5;
  if (c.email && c.email.trim()) score += 5;
  if (c.phone && c.phone.trim()) score += 5;
  if (c.location && c.location.trim()) score += 5;
  if (c.aadhaarNumber && c.aadhaarNumber.trim()) score += 5;

  // 2. Profile Details (Headline & Bio): 10% each = 20% total
  // (Note: signup fields 25% + headline 10% + bio 10% = exactly 45%)
  if (c.headline && c.headline.trim().length >= 3) score += 10;
  if (c.bio && c.bio.trim().length >= 10) score += 10;

  // 3. Resume: 20%
  if (c.resume?.fileName && c.resume.fileName.trim()) score += 20;

  // 4. Skills: 15% (at least 3 skills)
  if (c.skillsPreferences?.skills && c.skillsPreferences.skills.length >= 3) score += 15;

  // 5. Work Experience: 10%
  if (
    (c.experienceList && c.experienceList.length > 0) ||
    (c.skillsPreferences?.experience && c.skillsPreferences.experience !== 'Fresher (0-1 yr)' && c.skillsPreferences.experience !== 'Fresher')
  ) {
    score += 10;
  }

  // 6. Education: 10%
  if (
    (c.educationList && c.educationList.length > 0) ||
    (c.skillsPreferences?.educationLevel && c.skillsPreferences.educationLevel.trim())
  ) {
    score += 10;
  }

  return Math.min(score, 100);
};

const CANDIDATE_1_DATA = {
  id: 'cand-1',
  email: 'candidate1@ntrvikasa.com',
  name: 'Priya Sharma',
  aadhaarNumber: '4532 8901 2345',
  role: 'candidate',
  headline: 'Senior React & Frontend Developer | 4+ Years Experience',
  phone: '+91 98765 43210',
  location: 'Visakhapatnam, Andhra Pradesh',
  bio: 'Passionate frontend engineer specializing in performant React architectures, design systems, TypeScript, and micro-frontend state management with 4+ years of industry experience across enterprise web applications.',
  avatar: '/candidate_avatar.jpg',
  verified: true,
  profileCompletion: 100,
  linkedin: 'https://linkedin.com/in/priyasharma-dev',
  github: 'https://github.com/priyasharma-frontend',
  portfolio: 'https://priyasharma.dev',

  // Current Resume
  resume: {
    fileName: 'Vyshnavi_Resume.pdf',
    uploadedDate: '2 Sept 2026',
    fileSize: '1.4 MB',
    atsScore: 88,
    fileType: 'PDF Document',
  },

  // Skills & Preferences
  skillsPreferences: {
    skills: ['React.js', 'TypeScript', 'Next.js', 'JavaScript (ES6+)', 'Redux Toolkit', 'Tailwind CSS', 'HTML5/CSS3', 'Jest & Testing Library', 'Webpack/Vite', 'REST APIs & GraphQL'],
    preferredRoles: ['Senior Frontend Developer', 'React Specialist', 'UI Engineer', 'Fullstack UI Lead'],
    preferredLocations: ['Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Bengaluru'],
    expectedSalary: '₹18,00,000 - ₹24,00,000 / year',
    currentSalary: '₹14,50,000 / year',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    industries: ['Information Technology', 'E-Commerce & Retail', 'Fintech & Banking'],
    experience: '4.2 Years',
    educationLevel: "Bachelor's Degree (B.Tech - CSE)"
  },

  // Experience & Education for Profile
  experienceList: [
    {
      id: 'exp-1',
      role: 'Senior Frontend Engineer',
      company: 'Infosys Digital',
      location: 'Hyderabad (Hybrid)',
      duration: 'June 2023 - Present (1 yr 3 mos)',
      description: 'Architected responsive portal components for banking clients. Reduced initial bundle size by 35% using code-splitting and dynamic imports.'
    },
    {
      id: 'exp-2',
      role: 'Frontend Developer',
      company: 'TCS Innovation Labs',
      location: 'Visakhapatnam',
      duration: 'Aug 2021 - May 2023 (1 yr 10 mos)',
      description: 'Developed scalable single-page applications using React, Redux, and RESTful APIs for telecom enterprise solutions.'
    }
  ],

  educationList: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Andhra University College of Engineering, Visakhapatnam',
      duration: '2017 - 2021',
      score: '8.7 CGPA'
    },
    {
      id: 'edu-2',
      degree: 'Intermediate (MPC)',
      institution: 'Sri Chaitanya Junior College, Vijayawada',
      duration: '2015 - 2017',
      score: '96.2%'
    }
  ],

  certificationsList: [
    { id: 'cert-1', name: 'Meta Certified Frontend Developer', issuer: 'Meta / Coursera', year: '2024' },
    { id: 'cert-2', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2023' }
  ],

  projectsList: [
    { id: 'proj-1', title: 'NTR Vikasa Candidate Portal', tech: 'React, Vite, CSS Modules', description: 'Interactive job portal frontend with responsive candidate dashboard, multi-step filter search, and applicant tracking.' },
    { id: 'proj-2', title: 'Enterprise Design System UI Kit', tech: 'TypeScript, Storybook, Tailwind', description: 'Comprehensive component library with 45+ accessible UI components used across 6 product teams.' }
  ],

  languages: ['English (Fluent)', 'Telugu (Native)', 'Hindi (Conversational)'],

  // Applications
  applications: [
    {
      id: 'app-mela-1',
      jobId: 'mela-1-comp-2',
      melaId: '1',
      melaTitle: 'AP Mega IT & ITES Job Mela 2026',
      eventNumber: '01',
      companySequence: '02',
      applicationSequence: '0024',
      appNumber: 'NTR-01-02-0024',
      applicationType: 'Job Mela Application',
      title: 'Graduate Trainee Engineer',
      company: 'TechCorp India',
      companyLogo: null,
      location: 'Visakhapatnam',
      salary: '₹5.0 - ₹8.0 LPA',
      type: 'Full-time',
      mode: 'On-site',
      appliedDate: '22 Aug 2026',
      status: 'SHORTLISTED',
      melaDate: '28 Sept 2026',
      melaVenue: 'AU Convention Center, Beach Road, Visakhapatnam',
      passId: 'PASS-AP-849201',
      passStatus: 'Confirmed / Active Pass (Gate 3)',
      timeline: [
        { stage: 'Applied', date: '22 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '24 Aug 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: '26 Aug 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Spot Interview at Event (28 Sept)', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-mela-2',
      jobId: 'mela-1-comp-7',
      melaId: '1',
      melaTitle: 'AP Mega IT & ITES Job Mela 2026',
      eventNumber: '01',
      companySequence: '04',
      applicationSequence: '0001',
      appNumber: 'NTR-01-04-0001',
      applicationType: 'Job Mela Application',
      title: 'TCS Digital Software Developer',
      company: 'TCS',
      companyLogo: null,
      location: 'Visakhapatnam',
      salary: '₹7.0 - ₹9.0 LPA',
      type: 'Full-time',
      mode: 'On-site',
      appliedDate: '28 Aug 2026',
      status: 'APPLIED',
      melaDate: '28 Sept 2026',
      melaVenue: 'AU Convention Center, Beach Road, Visakhapatnam',
      passId: 'PASS-AP-849201',
      passStatus: 'Confirmed / Active Pass (Gate 3)',
      timeline: [
        { stage: 'Applied', date: '28 Aug 2026', completed: true, current: true },
        { stage: 'Screening', date: 'Pending Review', completed: false, current: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false, current: false },
        { stage: 'Interview', date: 'Spot Interview at Event (28 Sept)', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-1',
      jobId: '1',
      appNumber: 'APP-000124',
      applicationType: 'Direct Job Application',
      title: 'Senior Python Developer',
      company: 'TechCorp India',
      companyLogo: null,
      location: 'Hyderabad',
      salary: '₹12,00,000 - ₹18,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '02 Sept 2026',
      status: 'SHORTLISTED',
      timeline: [
        { stage: 'Applied', date: '02 Sept 2026', completed: true, current: false },
        { stage: 'Screening', date: '03 Sept 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: '04 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending Schedule', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-2',
      jobId: '2',
      appNumber: 'APP-000002',
      applicationType: 'Direct Job Application',
      title: 'Senior React Developer',
      company: 'Infosys Digital',
      companyLogo: null,
      location: 'Visakhapatnam',
      salary: '₹15,00,000 - ₹22,00,000',
      type: 'Full-time',
      mode: 'Remote',
      appliedDate: '30 Aug 2026',
      status: 'INTERVIEW',
      timeline: [
        { stage: 'Applied', date: '30 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '31 Aug 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: '01 Sept 2026', completed: true, current: false },
        { stage: 'Interview', date: '10 Sept 2026 (11:00 AM)', completed: true, current: true },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-3',
      jobId: '3',
      appNumber: 'APP-000003',
      applicationType: 'Direct Job Application',
      title: 'Frontend UI Architect',
      company: 'Wipro Cloud Services',
      companyLogo: null,
      location: 'Bengaluru',
      salary: '₹18,00,000 - ₹25,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '26 Aug 2026',
      status: 'SCREENING',
      timeline: [
        { stage: 'Applied', date: '26 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '28 Aug 2026', completed: true, current: true },
        { stage: 'Shortlisted', date: 'Pending Review', completed: false, current: false },
        { stage: 'Interview', date: 'TBD', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-4',
      jobId: '4',
      appNumber: 'APP-000004',
      applicationType: 'Direct Job Application',
      title: 'Design Systems Engineer',
      company: 'Flipkart AP Tech Hub',
      companyLogo: null,
      location: 'Vijayawada',
      salary: '₹14,00,000 - ₹20,00,000',
      type: 'Full-time',
      mode: 'On-site',
      appliedDate: '01 Sept 2026',
      status: 'APPLIED',
      timeline: [
        { stage: 'Applied', date: '01 Sept 2026', completed: true, current: true },
        { stage: 'Screening', date: 'Pending Review', completed: false, current: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false, current: false },
        { stage: 'Interview', date: 'Pending', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-5',
      jobId: '5',
      appNumber: 'APP-000005',
      applicationType: 'Direct Job Application',
      title: 'Frontend Developer (React)',
      company: 'TCS Innovation',
      companyLogo: null,
      location: 'Visakhapatnam',
      salary: '₹12,00,000 - ₹16,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '15 Aug 2026',
      status: 'SELECTED',
      timeline: [
        { stage: 'Applied', date: '15 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '17 Aug 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: '19 Aug 2026', completed: true, current: false },
        { stage: 'Interview', date: '20 Aug 2026', completed: true, current: false },
        { stage: 'Selected', date: '24 Aug 2026', completed: true, current: true },
      ]
    },
    {
      id: 'app-6',
      jobId: '6',
      appNumber: 'APP-000006',
      applicationType: 'Direct Job Application',
      title: 'Senior JavaScript Engineer',
      company: 'Capgemini India',
      companyLogo: null,
      location: 'Hyderabad',
      salary: '₹13,00,000 - ₹17,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '05 Aug 2026',
      status: 'REJECTED',
      timeline: [
        { stage: 'Applied', date: '05 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '08 Aug 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: 'Not Progressed', completed: false, current: false },
        { stage: 'Interview', date: 'N/A', completed: false, current: false },
        { stage: 'Rejected', date: '10 Aug 2026', completed: true, current: true },
      ]
    }
  ],

  // Saved Jobs
  savedJobIds: ['1', '2', '3', '7', '8', '11'],

  // Interviews
  interviews: [
    {
      id: 'int-1',
      title: 'Technical Round 1: React & Architecture',
      role: 'Senior React Developer',
      company: 'Infosys Digital',
      date: '10 Sept 2026',
      time: '11:00 AM - 12:00 PM',
      mode: 'Online Interview',
      meetingPlatform: 'Google Meet',
      meetingUrl: 'https://meet.google.com/ntr-vikasa-interview',
      status: 'UPCOMING',
      panel: 'Deepak Verma (Principal Architect)',
      instructions: 'Please be ready with your code IDE and a working camera/microphone 10 minutes prior.'
    },
    {
      id: 'int-2',
      title: 'System Design & State Management Discussion',
      role: 'Frontend UI Architect',
      company: 'TechCorp India',
      date: '14 Sept 2026',
      time: '03:00 PM - 04:00 PM',
      mode: 'Online Interview',
      meetingPlatform: 'Microsoft Teams',
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/techcorp-priya',
      status: 'UPCOMING',
      panel: 'Ananya Roy (Director of Engineering)',
      instructions: 'Focus on performance optimization, design system architecture, and real-time state synchronization.'
    },
    {
      id: 'int-3',
      title: 'Final Technical & Culture Fit Round',
      role: 'Frontend Developer (React)',
      company: 'TCS Innovation',
      date: '20 Aug 2026',
      time: '10:30 AM - 11:30 AM',
      mode: 'Online Interview',
      status: 'COMPLETED',
      result: 'Selected / Offer Released',
      panel: 'Raghavan Iyer (VP of Talent)'
    }
  ],

  // Notifications
  notifications: [
    {
      id: 'n-1',
      title: 'Interview Scheduled for Senior React Developer',
      message: 'Infosys Digital scheduled your Technical Round 1 on 10 Sept 2026 at 11:00 AM IST.',
      category: 'INTERVIEW',
      read: false,
      time: '10 mins ago',
      link: '/candidate/interviews'
    },
    {
      id: 'n-2',
      title: 'Application Shortlisted by TechCorp India',
      message: 'Great news! Your profile for Senior Python Developer was shortlisted by the hiring manager.',
      category: 'APPLICATION',
      read: false,
      time: '2 hours ago',
      link: '/candidate/applications'
    },
    {
      id: 'n-3',
      title: 'New High-Match Job in Visakhapatnam',
      message: 'Swiggy AP Tech Hub posted "Lead UI Developer" matching 95% of your React & TypeScript skills.',
      category: 'SYSTEM',
      read: false,
      time: '5 hours ago',
      link: '/candidate/jobs'
    },
    {
      id: 'n-4',
      title: 'Job Mela Gate Entry Pass Ready',
      message: 'Your Digital QR Pass for AP Mega IT Job Mela 2026 has been generated. Entry Gate: 3.',
      category: 'JOB_MELA',
      read: true,
      time: '1 day ago',
      link: '/candidate/job-melas'
    },
    {
      id: 'n-5',
      title: 'Profile Strength: 80% Complete',
      message: 'Add your latest project repository links to reach 100% profile strength and get 2x recruiter visibility.',
      category: 'ACCOUNT',
      read: true,
      time: '3 days ago',
      link: '/candidate/profile'
    }
  ]
};

const CANDIDATE_2_DATA = {
  id: 'cand-2',
  email: 'candidate2@ntrvikasa.com',
  name: 'Rahul Kumar',
  aadhaarNumber: '8912 3456 7890',
  role: 'candidate',
  headline: 'Senior Python & Cloud Backend Developer | 3.5 Years Experience',
  phone: '+91 91234 56789',
  location: 'Vijayawada, Andhra Pradesh',
  bio: 'Backend engineer specialized in Python, FastAPI, Django, PostgreSQL, and AWS microservice architectures. Experienced in building high-throughput RESTful services, async task pipelines, and distributed databases.',
  avatar: 'R',
  verified: true,
  profileCompletion: 85,
  linkedin: 'https://linkedin.com/in/rahulkumar-python',
  github: 'https://github.com/rahulkumar-backend',
  portfolio: 'https://rahulkumar.dev',

  // Current Resume
  resume: {
    fileName: 'Rahul_Kumar_Python_Backend.pdf',
    uploadedDate: '28 Aug 2026',
    fileSize: '1.2 MB',
    atsScore: 92,
    fileType: 'PDF Document',
  },

  // Skills & Preferences
  skillsPreferences: {
    skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'Microservices', 'SQLAlchemy', 'Git & CI/CD'],
    preferredRoles: ['Python Developer', 'Backend Engineer', 'Cloud API Developer', 'FastAPI Specialist'],
    preferredLocations: ['Vijayawada', 'Visakhapatnam', 'Hyderabad', 'Pune'],
    expectedSalary: '₹14,00,000 - ₹20,00,000 / year',
    currentSalary: '₹11,00,000 / year',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    industries: ['Information Technology', 'Fintech & Banking', 'Logistics & Supply Chain'],
    experience: '3.5 Years',
    educationLevel: "Bachelor's Degree (B.Tech - IT)"
  },

  experienceList: [
    {
      id: 'exp-1',
      role: 'Backend Python Engineer',
      company: 'TechCorp India',
      location: 'Hyderabad (Hybrid)',
      duration: 'Jan 2023 - Present (1 yr 8 mos)',
      description: 'Built high-concurrency microservices using FastAPI, Redis, and PostgreSQL. Improved async worker processing latency by 40%.'
    },
    {
      id: 'exp-2',
      role: 'Junior Python Developer',
      company: 'HCL Technologies',
      location: 'Vijayawada',
      duration: 'July 2021 - Dec 2022 (1 yr 6 mos)',
      description: 'Developed REST APIs in Django REST Framework, implemented database indexing, and integrated payment gateways.'
    }
  ],

  educationList: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Information Technology',
      institution: 'VR Siddhartha Engineering College, Vijayawada',
      duration: '2017 - 2021',
      score: '8.4 CGPA'
    }
  ],

  certificationsList: [
    { id: 'cert-1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', year: '2024' },
    { id: 'cert-2', name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF / Linux Foundation', year: '2023' }
  ],

  projectsList: [
    { id: 'proj-1', title: 'High-Throughput API Gateway', tech: 'FastAPI, Redis, Docker', description: 'Built reverse-proxy API rate-limiting middleware capable of handling 20,000 requests/sec with low latency.' },
    { id: 'proj-2', title: 'Distributed Event Pipeline', tech: 'Python, Kafka, PostgreSQL', description: 'Real-time telemetry event streaming pipeline processing sensor data from 100+ IoT edge nodes.' }
  ],

  languages: ['English (Fluent)', 'Telugu (Native)', 'Hindi (Fluent)'],

  // Applications
  applications: [
    {
      id: 'app-101',
      jobId: '1',
      title: 'Senior Python Developer',
      company: 'TechCorp India',
      companyLogo: null,
      location: 'Hyderabad',
      salary: '₹12,00,000 - ₹18,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '01 Sept 2026',
      status: 'INTERVIEW',
      timeline: [
        { stage: 'Applied', date: '01 Sept 2026', completed: true, current: false },
        { stage: 'Screening', date: '02 Sept 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: '03 Sept 2026', completed: true, current: false },
        { stage: 'Interview', date: '12 Sept 2026 (02:00 PM)', completed: true, current: true },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-102',
      jobId: '7',
      title: 'Backend API Specialist (Python / FastAPI)',
      company: 'Swiggy AP Labs',
      companyLogo: null,
      location: 'Vijayawada',
      salary: '₹14,00,000 - ₹20,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '29 Aug 2026',
      status: 'SHORTLISTED',
      timeline: [
        { stage: 'Applied', date: '29 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '31 Aug 2026', completed: true, current: false },
        { stage: 'Shortlisted', date: '02 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-103',
      jobId: '8',
      title: 'Django & Cloud Backend Developer',
      company: 'Zoho Corporation',
      companyLogo: null,
      location: 'Tirupati',
      salary: '₹10,00,000 - ₹15,00,000',
      type: 'Full-time',
      mode: 'On-site',
      appliedDate: '22 Aug 2026',
      status: 'SCREENING',
      timeline: [
        { stage: 'Applied', date: '22 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '25 Aug 2026', completed: true, current: true },
        { stage: 'Shortlisted', date: 'Pending', completed: false, current: false },
        { stage: 'Interview', date: 'TBD', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-104',
      jobId: '9',
      title: 'Cloud Backend Engineer',
      company: 'HCL Technologies',
      companyLogo: null,
      location: 'Visakhapatnam',
      salary: '₹11,00,000 - ₹16,00,000',
      type: 'Full-time',
      mode: 'Remote',
      appliedDate: '31 Aug 2026',
      status: 'APPLIED',
      timeline: [
        { stage: 'Applied', date: '31 Aug 2026', completed: true, current: true },
        { stage: 'Screening', date: 'Pending', completed: false, current: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false, current: false },
        { stage: 'Interview', date: 'Pending', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    },
    {
      id: 'app-105',
      jobId: '10',
      title: 'Python Data Engineer',
      company: 'Cognizant Technology Solutions',
      companyLogo: null,
      location: 'Hyderabad',
      salary: '₹9,00,000 - ₹13,00,000',
      type: 'Full-time',
      mode: 'Hybrid',
      appliedDate: '10 Aug 2026',
      status: 'REJECTED',
      timeline: [
        { stage: 'Applied', date: '10 Aug 2026', completed: true, current: false },
        { stage: 'Screening', date: '12 Aug 2026', completed: true, current: false },
        { stage: 'Interview', date: '15 Aug 2026', completed: true, current: false },
        { stage: 'Rejected', date: '18 Aug 2026', completed: true, current: true },
      ]
    }
  ],

  // Saved Jobs
  savedJobIds: ['1', '7', '8', '12'],

  // Interviews
  interviews: [
    {
      id: 'int-101',
      title: 'Technical Round: Python, FastAPI & Concurrency',
      role: 'Senior Python Developer',
      company: 'TechCorp India',
      date: '12 Sept 2026',
      time: '02:00 PM - 03:00 PM',
      mode: 'Online Interview',
      meetingPlatform: 'Google Meet',
      meetingUrl: 'https://meet.google.com/ntr-python-rahul',
      status: 'UPCOMING',
      panel: 'Vikram Sethi (Engineering Manager)',
      instructions: 'Live coding on Python async programming, database optimization, and caching strategies.'
    },
    {
      id: 'int-102',
      title: 'Data Pipelines & Algorithms',
      role: 'Python Data Engineer',
      company: 'Cognizant',
      date: '15 Aug 2026',
      time: '11:00 AM - 12:00 PM',
      mode: 'Online Interview',
      status: 'COMPLETED',
      result: 'Not Selected',
      panel: 'Kavita Rao (Lead Architect)'
    }
  ],

  // Notifications
  notifications: [
    {
      id: 'n-101',
      title: 'Interview Scheduled for Senior Python Developer',
      message: 'TechCorp India scheduled your Technical Round on 12 Sept 2026 at 02:00 PM IST.',
      category: 'INTERVIEW',
      read: false,
      time: '30 mins ago',
      link: '/candidate/interviews'
    },
    {
      id: 'n-102',
      title: 'Application Shortlisted by Swiggy AP Labs',
      message: 'Your profile for Backend API Specialist was shortlisted for technical review.',
      category: 'APPLICATION',
      read: false,
      time: '3 hours ago',
      link: '/candidate/applications'
    },
    {
      id: 'n-103',
      title: 'New High-Match Job in Vijayawada',
      message: 'Zoho Corporation posted "Senior Backend Engineer" matching 92% of your Python & PostgreSQL skills.',
      category: 'SYSTEM',
      read: true,
      time: '1 day ago',
      link: '/candidate/jobs'
    }
  ]
};

const CandidateContext = createContext(null);

export function CandidateProvider({ children }) {
  const { addNotification } = useNotifications();

  // Store both candidate datasets
  const [candidatesData, setCandidatesData] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_candidate_users_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed['cand-1']?.applications) {
          // Check if app-mela-1 and app-mela-2 Job Mela applications are present
          const hasMela1 = parsed['cand-1'].applications.some(
            a => a.id === 'app-mela-1' || a.appNumber === 'NTR-01-02-0024'
          );
          if (!hasMela1) {
            const melaApp1 = CANDIDATE_1_DATA.applications.find(a => a.id === 'app-mela-1');
            if (melaApp1) {
              parsed['cand-1'].applications = [melaApp1, ...parsed['cand-1'].applications];
            }
          }

          const hasMela2 = parsed['cand-1'].applications.some(
            a => a.id === 'app-mela-2' || a.appNumber === 'NTR-01-04-0001' || a.title === 'TCS Digital Software Developer'
          );
          if (!hasMela2) {
            const melaApp2 = CANDIDATE_1_DATA.applications.find(a => a.id === 'app-mela-2');
            if (melaApp2) {
              parsed['cand-1'].applications = [melaApp2, ...parsed['cand-1'].applications];
            }
          }

          // Ensure each application has its own distinct appNumber and applicationType
          parsed['cand-1'].applications = parsed['cand-1'].applications.map((app, idx) => {
            const fallback = CANDIDATE_1_DATA.applications.find(a => a.id === app.id);
            const isMela = Boolean(app.melaId || app.applicationType === 'Job Mela Application' || (app.appNumber && app.appNumber.startsWith('NTR-')));
            return {
              ...app,
              appNumber: app.appNumber || fallback?.appNumber || (isMela ? (app.appId || 'NTR-01-02-0024') : `APP-${String(app.id || idx + 1).replace(/\D/g, '').padStart(6, '0')}`),
              applicationType: app.applicationType || fallback?.applicationType || (isMela ? 'Job Mela Application' : 'Direct Job Application')
            };
          });
        }
        if (parsed['cand-1'] && parsed['cand-1'].avatar !== 'REMOVED' && (parsed['cand-1'].avatar === 'P' || !parsed['cand-1'].avatar)) {
          parsed['cand-1'].avatar = CANDIDATE_1_DATA.avatar;
        }
        if (parsed['cand-1'] && !parsed['cand-1'].aadhaarNumber) {
          parsed['cand-1'].aadhaarNumber = CANDIDATE_1_DATA.aadhaarNumber;
        }
        if (parsed['cand-2'] && !parsed['cand-2'].aadhaarNumber) {
          parsed['cand-2'].aadhaarNumber = CANDIDATE_2_DATA.aadhaarNumber;
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return {
      'cand-1': CANDIDATE_1_DATA,
      'cand-2': CANDIDATE_2_DATA,
    };
  });

  // Current active candidate ID (default 'cand-1' -> Priya Sharma)
  const [activeCandidateId, setActiveCandidateId] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_active_candidate_id');
      if (stored && (stored === 'cand-1' || stored === 'cand-2')) return stored;
    } catch (e) {
      // ignore
    }
    return 'cand-1';
  });

  // Is candidate logged in?
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_candidate_logged_in');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ntr_candidate_users_v2', JSON.stringify(candidatesData));
      localStorage.setItem('ntr_active_candidate_id', activeCandidateId);
      localStorage.setItem('ntr_candidate_logged_in', String(isLoggedIn));
    } catch (e) {
      // ignore
    }
  }, [candidatesData, activeCandidateId, isLoggedIn]);

  const rawCandidate = candidatesData[activeCandidateId] || CANDIDATE_1_DATA;
  const candidate = {
    ...rawCandidate,
    profileCompletion: calculateProfileCompletion(rawCandidate)
  };

  // Helper to update active candidate state
  const updateCandidate = (updater) => {
    setCandidatesData((prev) => {
      const current = prev[activeCandidateId] || CANDIDATE_1_DATA;
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return {
        ...prev,
        [activeCandidateId]: updated
      };
    });
  };

  // Candidate Registration handler
  const registerCandidate = (signupData) => {
    const newCandidateId = `cand-${Date.now()}`;
    const newCandidate = {
      id: newCandidateId,
      email: signupData.email || 'candidate@ntrvikasa.com',
      name: signupData.fullName || 'Candidate',
      aadhaarNumber: signupData.aadhaarNumber || '',
      phone: signupData.phone || '',
      location: signupData.location || '',
      role: 'candidate',
      headline: '',
      bio: '',
      avatar: signupData.fullName ? signupData.fullName[0].toUpperCase() : 'C',
      verified: true,
      linkedin: '',
      github: '',
      portfolio: '',
      resume: {
        fileName: '',
        uploadedDate: '',
        fileSize: '',
        atsScore: 0,
        fileType: '',
      },
      skillsPreferences: {
        skills: [],
        preferredRoles: [],
        preferredLocations: signupData.location ? [signupData.location] : [],
        expectedSalary: '',
        currentSalary: '',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        industries: [],
        experience: 'Fresher (0-1 yr)',
        educationLevel: '',
      },
      experienceList: [],
      educationList: [],
      certificationsList: [],
      projectsList: [],
      languages: [],
      applications: [],
      savedJobIds: [],
      interviews: [],
      notifications: [
        {
          id: `n-${Date.now()}`,
          title: 'Welcome to NTR VIKASA!',
          message: 'Complete at least 70% of your profile to start applying for jobs.',
          category: 'ACCOUNT',
          read: false,
          time: 'Just now',
          link: '/candidate/profile'
        }
      ]
    };

    setCandidatesData((prev) => ({
      ...prev,
      [newCandidateId]: newCandidate
    }));
    setActiveCandidateId(newCandidateId);
    setIsLoggedIn(true);
    return newCandidate;
  };

  // Login handler
  const login = (email) => {
    if (email) {
      const emailLower = email.toLowerCase();
      const foundEntry = Object.entries(candidatesData).find(([_, c]) => c.email?.toLowerCase() === emailLower);
      if (foundEntry) {
        setActiveCandidateId(foundEntry[0]);
        setIsLoggedIn(true);
        return;
      }
      if (emailLower.includes('candidate2') || emailLower.includes('rahul')) {
        setActiveCandidateId('cand-2');
        setIsLoggedIn(true);
        return;
      }
    }
    setActiveCandidateId('cand-1');
    setIsLoggedIn(true);
  };

  // Logout handler
  const logout = () => {
    setIsLoggedIn(false);
  };

  // Switch Candidate (convenient for testing Candidate 1 vs Candidate 2)
  const switchCandidate = (candidateId) => {
    if (candidateId === 'cand-1' || candidateId === 'cand-2') {
      setActiveCandidateId(candidateId);
      setIsLoggedIn(true);
    }
  };

  // Apply for Job
  const applyJob = (job, applicationDetails = {}) => {
    const isJobMela = Boolean(job.melaId || applicationDetails.melaId || applicationDetails.applicationType === 'Job Mela Application');
    
    // Deterministic sequential application numbering without Math.random()
    let defaultAppNumber;
    if (isJobMela) {
      defaultAppNumber = applicationDetails.appNumber || job.appNumber || 'NTR-01-02-0024';
    } else {
      const normalCount = candidate.applications.filter(a => !a.melaId && a.applicationType !== 'Job Mela Application').length + 1;
      const numStr = String(job.id ? Number(job.id) || normalCount : normalCount).padStart(6, '0');
      defaultAppNumber = job.appNumber || `APP-${numStr}`;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      jobId: String(job.id),
      appNumber: applicationDetails.appNumber || defaultAppNumber,
      applicationType: isJobMela ? 'Job Mela Application' : 'Direct Job Application',
      melaId: job.melaId || applicationDetails.melaId || null,
      melaTitle: job.melaTitle || applicationDetails.melaTitle || null,
      eventNumber: applicationDetails.eventNumber || job.eventNumber || (isJobMela ? '01' : null),
      companySequence: applicationDetails.companySequence || job.companySequence || (isJobMela ? '02' : null),
      applicationSequence: applicationDetails.applicationSequence || job.applicationSequence || (isJobMela ? '0024' : null),
      title: job.title || job.role,
      company: job.company,
      companyLogo: job.companyLogo || null,
      location: job.location,
      salary: job.salary,
      type: job.type || 'Full-time',
      mode: job.mode || 'Hybrid',
      appliedDate: 'Just now (Today)',
      status: 'APPLIED',
      coverLetter: applicationDetails.coverLetter || '',
      additionalInfo: applicationDetails.additionalInfo || '',
      resumeName: applicationDetails.resumeName || candidate.resume?.fileName || 'Candidate_Resume.pdf',
      timeline: [
        { stage: 'Applied', date: 'Today (Just now)', completed: true, current: true },
        { stage: 'Screening', date: 'Pending Review', completed: false, current: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false, current: false },
        { stage: 'Interview', date: 'Pending Schedule', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    };

    updateCandidate((prev) => ({
      ...prev,
      applications: [newApp, ...(prev.applications || []).filter(a => String(a.jobId) !== String(job.id))],
      notifications: [
        {
          id: `n-${Date.now()}`,
          title: `Application Submitted: ${job.title}`,
          message: `Your application has been successfully submitted to ${job.company}. Track your progress in My Applications.`,
          category: 'APPLICATION',
          read: false,
          time: 'Just now',
          link: '/candidate/applications'
        },
        ...(prev.notifications || [])
      ]
    }));

    // Dispatch real-time Candidate Notification & Email event
    dispatchCandidateEvent({
      eventType: isJobMela ? NOTIFICATION_EVENTS.JOB_MELA_APP_SUBMITTED : NOTIFICATION_EVENTS.APP_SUBMITTED,
      candidateEmail: candidate.email,
      recipientName: candidate.name,
      addNotification,
      notification: {
        category: isJobMela ? 'JOB_MELA' : 'APPLICATION',
        title: isJobMela
          ? `Job Mela Application Submitted: ${job.title || job.role}`
          : `Application Submitted: ${job.title || job.role}`,
        message: isJobMela
          ? `Your application for "${job.title || job.role}" at ${job.company} for ${newApp.melaTitle || 'Job Mela'} was submitted successfully (Job Mela Application No: ${newApp.appNumber}). Status: Applied.`
          : `Your application for "${job.title || job.role}" at ${job.company} was submitted successfully (Application No: ${newApp.appNumber}). Status: Applied.`,
        time: 'Just now',
        link: '/candidate/applications',
        meta: {
          appNumber: newApp.appNumber,
          company: job.company,
          role: job.title || job.role,
          status: 'Applied',
          melaTitle: newApp.melaTitle,
          applicationType: isJobMela ? 'Job Mela Application' : 'Direct Job Application',
        }
      },
      meta: {
        appNumber: newApp.appNumber,
        company: job.company,
        role: job.title || job.role,
        status: 'Applied',
      }
    });

    return newApp;
  };

  // Save / Unsave Job
  const saveJob = (jobId, jobData = {}) => {
    updateCandidate((prev) => {
      const idStr = String(jobId);
      if ((prev.savedJobIds || []).includes(idStr)) return prev;
      return {
        ...prev,
        savedJobIds: [...(prev.savedJobIds || []), idStr]
      };
    });

    // Synchronize to MySQL database if logged in
    if (authService.isAuthenticated()) {
      candidateSavedJobsService.saveJob({
        job_id: String(jobId),
        title: jobData.title || 'Senior Software Engineer',
        company_name: jobData.company || jobData.company_name || 'TechCorp India',
        company_verified: jobData.company_verified ?? true,
        location: jobData.location || 'Bengaluru, Karnataka',
        salary: jobData.salary || '₹14 - ₹22 LPA',
        experience: jobData.experience || '3-5 years',
        employment_type: jobData.type || jobData.employment_type || 'Full-time',
        work_mode: jobData.mode || jobData.work_mode || 'Hybrid',
        skills: jobData.tags || jobData.skills || [],
      }).catch((err) => {
        // Silently log; UI already updated optimistically
        console.warn('Saved job sync error:', err.message);
      });
    }
  };

  const unsaveJob = (jobId) => {
    updateCandidate((prev) => {
      const idStr = String(jobId);
      return {
        ...prev,
        savedJobIds: (prev.savedJobIds || []).filter(id => id !== idStr)
      };
    });

    // Synchronize removal to MySQL database if logged in
    if (authService.isAuthenticated()) {
      candidateSavedJobsService.removeSavedJob(String(jobId)).catch((err) => {
        console.warn('Unsave job sync error:', err.message);
      });
    }
  };

  const isJobSaved = (jobId) => {
    return (candidate.savedJobIds || []).includes(String(jobId));
  };

  // Update Resume
  const updateResume = (resumeData) => {
    updateCandidate((prev) => ({
      ...prev,
      resume: {
        ...(prev.resume || {}),
        ...resumeData,
        uploadedDate: 'Just now (Today)'
      },
      notifications: [
        {
          id: `n-${Date.now()}`,
          title: 'Resume Updated Successfully',
          message: `Your active resume ${resumeData.fileName || prev.resume?.fileName} has been updated. Recruiters will now receive your newest version.`,
          category: 'ACCOUNT',
          read: false,
          time: 'Just now',
          link: '/candidate/resume'
        },
        ...(prev.notifications || [])
      ]
    }));

    // Add internal notification for resume update
    addNotification('candidate', {
      category: 'ACCOUNT',
      title: `Resume Updated: ${resumeData.fileName || 'Candidate_Resume.pdf'}`,
      message: `Your active resume "${resumeData.fileName || candidate.resume?.fileName}" has been updated. Recruiters will now receive your newest version.`,
      time: 'Just now',
      link: '/candidate/resume',
    });
  };

  // Update Profile
  const updateProfile = (profileData) => {
    updateCandidate((prev) => ({
      ...prev,
      ...profileData
    }));
  };

  // Update Skills & Preferences
  const updateSkillsPreferences = (prefData) => {
    updateCandidate((prev) => ({
      ...prev,
      skillsPreferences: {
        ...(prev.skillsPreferences || {}),
        ...prefData
      }
    }));
  };

  // Mark notification read
  const markNotificationRead = (notifId) => {
    updateCandidate((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => n.id === notifId ? { ...n, read: true } : n)
    }));
  };

  const markAllNotificationsRead = () => {
    updateCandidate((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
    }));
  };

  // Derived metrics for current candidate
  const stats = {
    applied: (candidate.applications || []).length,
    shortlisted: (candidate.applications || []).filter(a => a.status === 'SHORTLISTED').length,
    interviews: (candidate.interviews || []).filter(i => i.status === 'UPCOMING').length,
    savedJobs: (candidate.savedJobIds || []).length,
  };

  // All applications across all candidates in the system
  const allCandidateApplications = useMemo(() => {
    const list = [];
    Object.values(candidatesData || {}).forEach((cand) => {
      (cand.applications || []).forEach((app) => {
        list.push({
          ...app,
          candidateId: cand.id,
          candidateName: cand.name,
          candidateEmail: cand.email,
          candidatePhone: cand.phone,
          candidateLocation: cand.location,
          experience: cand.skillsPreferences?.experience || cand.experience || '3+ Years',
          education: cand.skillsPreferences?.educationLevel || cand.education || 'Graduate',
          skills: cand.skillsPreferences?.skills || cand.skills || [],
          resumeName: app.resumeName || cand.resume?.fileName || `${(cand.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`,
        });
      });
    });
    return list;
  }, [candidatesData]);

  return (
    <CandidateContext.Provider
      value={{
        candidate,
        candidatesData,
        allCandidateApplications,
        activeCandidateId,
        isLoggedIn,
        stats,
        login,
        logout,
        registerCandidate,
        calculateProfileCompletion,
        switchCandidate,
        updateCandidate,
        applyJob,
        saveJob,
        unsaveJob,
        isJobSaved,
        updateResume,
        updateProfile,
        updateSkillsPreferences,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidate() {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidate must be used within a CandidateProvider');
  }
  return context;
}
