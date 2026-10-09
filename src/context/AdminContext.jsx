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

// ─── 2. SEED PLATFORM CANDIDATES / STUDENTS ────────────────────────────────
export const SEED_CANDIDATES = [
  // ── 10TH CLASS (SSC) STUDENTS ──
  {
    id: 'cand-101',
    name: 'Sai Krishna Teja',
    email: 'krishna.teja@example.com',
    phone: '+91 98480 11223',
    district: 'NTR District',
    mandal: 'Vijayawada Rural',
    village: 'Gollapudi',
    location: 'Gollapudi, Vijayawada Rural, NTR District',
    headline: 'Certified Inventory & Logistics Assistant',
    experience: '1.0 Year',
    skills: ['Inventory Management', 'Material Inward', 'Packaging', 'Basic Computer'],
    qualificationLevel: '10TH',
    education: '10th Class (SSC), Zilla Parishad High School, Gollapudi',
    placementStatus: 'PLACED',
    placedCompany: 'Aparna Logistics & Distribution',
    placedRole: 'Warehouse Operations Assistant',
    placedSalary: '₹2,10,000 / year',
    referenceAdmin: 'Admin User (State Operations)',
    registrationDate: '2026-08-02',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 3,
  },
  {
    id: 'cand-102',
    name: 'Gopi Chand',
    email: 'gopi.chand@example.com',
    phone: '+91 97001 22334',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Bhavanipuram',
    location: 'Bhavanipuram, Vijayawada Urban, NTR District',
    headline: 'Vocational Retail & Store Associate Trainee',
    experience: 'Fresher (0-1 Year)',
    skills: ['Customer Assistance', 'Stock Sorting', 'Billing Point-of-Sale'],
    qualificationLevel: '10TH',
    education: '10th Class (SSC), Govt High School, Bhavanipuram',
    placementStatus: 'NOT_PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    referenceAdmin: 'District Nodal Officer (Vijayawada)',
    registrationDate: '2026-08-08',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 4,
  },
  {
    id: 'cand-103',
    name: 'Venkata Lakshmi',
    email: 'v.lakshmi@example.com',
    phone: '+91 96112 33445',
    district: 'NTR District',
    mandal: 'Nandigama',
    village: 'Nandigama Town',
    location: 'Nandigama, NTR District',
    headline: 'Frontline Customer Executive & Cashier',
    experience: '1.5 Years',
    skills: ['Retail Management', 'Barcode Scanning', 'Tally Basic'],
    qualificationLevel: '10TH',
    education: '10th Class (SSC), ZP High School, Nandigama',
    placementStatus: 'PLACED',
    placedCompany: 'DMart Retail AP Ltd',
    placedRole: 'Store Operations Associate',
    placedSalary: '₹1,95,000 / year',
    referenceAdmin: 'Nandigama Skill Coordinator',
    registrationDate: '2026-08-12',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 2,
  },

  // ── INTERMEDIATE / DIPLOMA (10+2) STUDENTS ──
  {
    id: 'cand-201',
    name: 'Bhavani Prasad',
    email: 'bhavani.prasad@example.com',
    phone: '+91 98492 44556',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Patamata',
    location: 'Patamata, Vijayawada Urban, NTR District',
    headline: 'Junior Quality & Mechanical Assembly Technician',
    experience: '1.2 Years',
    skills: ['Quality Inspection', 'AutoCAD Drafting', 'Assembly Tolerances'],
    qualificationLevel: 'INTER',
    education: 'Intermediate (MPC), Sri Chaitanya Junior College, Patamata',
    placementStatus: 'PLACED',
    placedCompany: 'Hero MotoCorp AP Plant',
    placedRole: 'Assembly Line Trainee',
    placedSalary: '₹2,80,000 / year',
    referenceAdmin: 'Admin User (State Operations)',
    registrationDate: '2026-08-14',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 5,
  },
  {
    id: 'cand-202',
    name: 'Manikanta Reddy',
    email: 'manikanta.reddy@example.com',
    phone: '+91 99512 55667',
    district: 'NTR District',
    mandal: 'Ibrahimpatnam',
    village: 'Kondapalli Industrial Area',
    location: 'Kondapalli, Ibrahimpatnam, NTR District',
    headline: 'Polytechnic Diploma Civil & Materials Testing',
    experience: '1.8 Years',
    skills: ['Concrete Slump Testing', 'Site Supervision', 'Quantity Survey'],
    qualificationLevel: 'INTER',
    education: 'Diploma in Civil Engineering, Govt Polytechnic, Vijayawada',
    placementStatus: 'PLACED',
    placedCompany: 'Ultratech Cement Ltd',
    placedRole: 'Quality Testing Supervisor',
    placedSalary: '₹3,20,000 / year',
    referenceAdmin: 'Mandal Placement Officer (Ibrahimpatnam)',
    registrationDate: '2026-08-16',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 6,
  },
  {
    id: 'cand-203',
    name: 'Swathi Priya',
    email: 'swathi.priya@example.com',
    phone: '+91 98663 66778',
    district: 'NTR District',
    mandal: 'Ibrahimpatnam',
    village: 'Ibrahimpatnam Center',
    location: 'Ibrahimpatnam, NTR District',
    headline: 'Pharma Lab Assistant & BiPC Candidate',
    experience: 'Fresher (0-1 Year)',
    skills: ['Laboratory Safety', 'Sample Preparation', 'Chemical Titration'],
    qualificationLevel: 'INTER',
    education: 'Intermediate (BiPC), Nalanda Junior College, Ibrahimpatnam',
    placementStatus: 'NOT_PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    referenceAdmin: 'Mandal Placement Officer (Ibrahimpatnam)',
    registrationDate: '2026-08-19',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 7,
  },
  {
    id: 'cand-204',
    name: 'Ramesh Babu',
    email: 'ramesh.babu@example.com',
    phone: '+91 97014 77889',
    district: 'NTR District',
    mandal: 'Mylavaram',
    village: 'Mylavaram Rural',
    location: 'Mylavaram, NTR District',
    headline: 'Electrical Diploma & Wiring Specialist',
    experience: 'Fresher (0-1 Year)',
    skills: ['Circuit Troubleshooting', 'Transformer Maintenance', 'Electrical Safety'],
    qualificationLevel: 'INTER',
    education: 'Diploma in Electrical (EEE), Polytechnic College, Mylavaram',
    placementStatus: 'NOT_PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    referenceAdmin: 'Mylavaram Field Counselor',
    registrationDate: '2026-08-22',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 3,
  },

  // ── UNDERGRADUATE (UG) STUDENTS ──
  {
    id: 'cand-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Kanuru',
    location: 'Kanuru, Vijayawada Urban, NTR District',
    headline: 'Senior React & Frontend Engineer',
    experience: '4.2 Years',
    skills: ['React.js', 'TypeScript', 'Redux', 'HTML/CSS'],
    qualificationLevel: 'UG',
    education: 'B.Tech in Computer Science, VR Siddhartha Engineering College',
    placementStatus: 'PLACED',
    placedCompany: 'Tata Consultancy Services',
    placedRole: 'System Engineer (Frontend Lead)',
    placedSalary: '₹4,80,000 / year',
    referenceAdmin: 'Super Admin (Directorate of Employment)',
    registrationDate: '2026-08-01',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 12,
  },
  {
    id: 'cand-2',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    phone: '+91 98123 45678',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Patamata',
    location: 'Patamata, Vijayawada Urban, NTR District',
    headline: 'Backend & Cloud Python Engineer',
    experience: '3.5 Years',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    qualificationLevel: 'UG',
    education: 'B.Tech in Information Technology, JNTU Kakinada',
    placementStatus: 'PLACED',
    placedCompany: 'HCL Technologies Ltd',
    placedRole: 'Cloud Backend Developer',
    placedSalary: '₹4,50,000 / year',
    referenceAdmin: 'Admin User (State Operations)',
    registrationDate: '2026-08-05',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 8,
  },
  {
    id: 'cand-6',
    name: 'Karthik Varma',
    email: 'karthik.v@example.com',
    phone: '+91 98440 98765',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Gunadala',
    location: 'Gunadala, Vijayawada Urban, NTR District',
    headline: 'Associate Full Stack Developer',
    experience: '1.2 Years',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    qualificationLevel: 'UG',
    education: 'B.Sc in Computer Science, Andhra Loyola College, Vijayawada',
    placementStatus: 'PLACED',
    placedCompany: 'Wipro Technologies',
    placedRole: 'Project Engineer',
    placedSalary: '₹3,60,000 / year',
    referenceAdmin: 'District Nodal Officer (Vijayawada)',
    registrationDate: '2026-08-20',
    profileStatus: 'UNDER_REVIEW',
    accountStatus: 'ACTIVE',
    applicationsCount: 4,
  },
  {
    id: 'cand-301',
    name: 'Anusha Devi',
    email: 'anusha.devi@example.com',
    phone: '+91 97788 11223',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Bhavanipuram',
    location: 'Bhavanipuram, Vijayawada Urban, NTR District',
    headline: 'Banking Operations & Financial Accounting Graduate',
    experience: '1.0 Year',
    skills: ['Tally Prime', 'Financial Reconciliation', 'Banking Operations'],
    qualificationLevel: 'UG',
    education: 'B.Com Computer Applications, Maris Stella College, Vijayawada',
    placementStatus: 'PLACED',
    placedCompany: 'ICICI Bank Regional Operations',
    placedRole: 'Banking Operations Officer',
    placedSalary: '₹3,40,000 / year',
    referenceAdmin: 'Admin User (State Operations)',
    registrationDate: '2026-08-23',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 6,
  },
  {
    id: 'cand-302',
    name: 'Manoj Kumar',
    email: 'manoj.kumar@example.com',
    phone: '+91 98877 22334',
    district: 'NTR District',
    mandal: 'Vijayawada Rural',
    village: 'Enikepadu',
    location: 'Enikepadu, Vijayawada Rural, NTR District',
    headline: 'Graduate Mechanical Engineer — CAD & QA',
    experience: 'Fresher (0-1 Year)',
    skills: ['SolidWorks', 'ANSYS', 'Production Planning', 'GD&T'],
    qualificationLevel: 'UG',
    education: 'B.Tech in Mechanical Engineering, Dhanekula College of Engg',
    placementStatus: 'NOT_PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    referenceAdmin: 'Mandal Placement Officer (Ibrahimpatnam)',
    registrationDate: '2026-08-25',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 9,
  },
  {
    id: 'cand-303',
    name: 'Deepika Sri',
    email: 'deepika.sri@example.com',
    phone: '+91 99665 33445',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Moghalrajpuram',
    location: 'Moghalrajpuram, Vijayawada Urban, NTR District',
    headline: 'BCA Cloud & Web Technology Aspirant',
    experience: 'Fresher (0-1 Year)',
    skills: ['JavaScript', 'HTML5', 'SQL Database', 'Java Basics'],
    qualificationLevel: 'UG',
    education: 'BCA, PB Siddhartha College of Arts & Science, Vijayawada',
    placementStatus: 'NOT_PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    referenceAdmin: 'Super Admin (Directorate of Employment)',
    registrationDate: '2026-08-27',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 5,
  },

  // ── POSTGRADUATE (PG) STUDENTS ──
  {
    id: 'cand-4',
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 97765 11223',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Governorpet',
    location: 'Governorpet, Vijayawada Urban, NTR District',
    headline: 'AI / Machine Learning Engineer',
    experience: '2.5 Years',
    skills: ['PyTorch', 'Python', 'NLP', 'TensorFlow', 'LLMs'],
    qualificationLevel: 'PG',
    education: 'M.Tech in Data Science & Artificial Intelligence, IIIT',
    placementStatus: 'PLACED',
    placedCompany: 'Tech Mahindra AI Labs',
    placedRole: 'Associate Data Scientist',
    placedSalary: '₹7,50,000 / year',
    referenceAdmin: 'Super Admin (Directorate of Employment)',
    registrationDate: '2026-08-14',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 7,
  },
  {
    id: 'cand-3',
    name: 'Vikram Sethi',
    email: 'vikram.sethi@example.com',
    phone: '+91 99887 66554',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Moghalrajpuram',
    location: 'Moghalrajpuram, Vijayawada Urban, NTR District',
    headline: 'DevOps & Kubernetes SRE Specialist',
    experience: '5.0 Years',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Docker'],
    qualificationLevel: 'PG',
    education: 'MCA in Software Architecture, PB Siddhartha College, Vijayawada',
    placementStatus: 'PLACED',
    placedCompany: 'Infosys Ltd',
    placedRole: 'Senior Associate Consultant — DevOps',
    placedSalary: '₹6,20,000 / year',
    referenceAdmin: 'Admin User (State Operations)',
    registrationDate: '2026-08-10',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 5,
  },
  {
    id: 'cand-401',
    name: 'Naveen Teja',
    email: 'naveen.teja@example.com',
    phone: '+91 98485 55667',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Gandhinagar',
    location: 'Gandhinagar, Vijayawada Urban, NTR District',
    headline: 'MBA Human Resources & Industrial Relations',
    experience: '2.0 Years',
    skills: ['Talent Acquisition', 'HRIS Systems', 'Labor Compliance', 'Employee Relations'],
    qualificationLevel: 'PG',
    education: 'MBA in HR & General Management, Andhra University PG Center',
    placementStatus: 'PLACED',
    placedCompany: "Dr. Reddy's Laboratories AP",
    placedRole: 'Assistant Manager — Talent Acquisition',
    placedSalary: '₹5,40,000 / year',
    referenceAdmin: 'District Nodal Officer (Vijayawada)',
    registrationDate: '2026-08-15',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 8,
  },
  {
    id: 'cand-402',
    name: 'Harika V',
    email: 'harika.v@example.com',
    phone: '+91 97003 66778',
    district: 'NTR District',
    mandal: 'Mylavaram',
    village: 'Chandrala',
    location: 'Chandrala, Mylavaram, NTR District',
    headline: 'M.Sc Organic Chemistry Research Scholar',
    experience: 'Fresher (0-1 Year)',
    skills: ['HPLC Chromatography', 'Spectroscopy', 'Quality Control Lab'],
    qualificationLevel: 'PG',
    education: 'M.Sc in Organic Chemistry, Acharya Nagarjuna University',
    placementStatus: 'NOT_PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    referenceAdmin: 'Mylavaram Field Counselor',
    registrationDate: '2026-08-28',
    profileStatus: 'COMPLETE',
    accountStatus: 'ACTIVE',
    applicationsCount: 6,
  }
];

// ─── 3. SEED RECRUITERS ────────────────────────────────────────────────────
const SEED_RECRUITERS = [
  {
    id: 'rec-u-1',
    name: 'Arjun Reddy',
    email: 'recruiter1@ntrvikasa.com',
    company: 'ABC Technologies Pvt Ltd',
    designation: 'Director of Talent Acquisition',
    phone: '+91 98765 00112',
    registrationDate: '2026-08-01',
    verificationStatus: 'VERIFIED',
    accountStatus: 'ACTIVE',
    postedJobsCount: 5,
  },
  {
    id: 'rec-u-2',
    name: 'Sneha Rao',
    email: 'recruiter2@ntrvikasa.com',
    company: 'Tech Solutions Global Ltd',
    designation: 'Head of People & University Talent',
    phone: '+91 91234 88776',
    registrationDate: '2026-08-03',
    verificationStatus: 'VERIFIED',
    accountStatus: 'ACTIVE',
    postedJobsCount: 4,
  },
  {
    id: 'rec-u-3',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@fintechcorp.example.com',
    company: 'Fintech Corp India Pvt Ltd',
    designation: 'Lead Technical Recruiter',
    phone: '+91 98111 22334',
    registrationDate: '2026-09-01',
    verificationStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    postedJobsCount: 0,
    documentsSubmitted: ['Certificate of Incorporation', 'Company GSTIN', 'Official Work Email'],
  },
  {
    id: 'rec-u-4',
    name: 'Divya Iyer',
    email: 'divya.iyer@healthplus.example.com',
    company: 'HealthPlus Systems Ltd',
    designation: 'Senior HR Talent Manager',
    phone: '+91 98222 33445',
    registrationDate: '2026-09-02',
    verificationStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    postedJobsCount: 0,
    documentsSubmitted: ['CIN Certificate', 'Official Board ID'],
  },
  {
    id: 'rec-u-5',
    name: 'Manoj Kumar',
    email: 'manoj.k@fraudventures.xyz',
    company: 'Fast Cash Enterprises',
    designation: 'Hiring Agent',
    phone: '+91 99999 00000',
    registrationDate: '2026-08-25',
    verificationStatus: 'REJECTED',
    accountStatus: 'SUSPENDED',
    postedJobsCount: 0,
    rejectionReason: 'Invalid CIN and unverified corporate address.',
  }
];

// ─── 4. SEED COMPANIES ─────────────────────────────────────────────────────
const SEED_COMPANIES = [
  {
    id: 'comp-1',
    name: 'ABC Technologies Pvt Ltd',
    recruiter: 'Arjun Reddy',
    industry: 'Information Technology & Cloud',
    location: 'Vijayawada Urban, NTR District',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Auto Nagar IT Zone',
    eligibleMandals: ['Vijayawada Urban', 'Vijayawada Rural', 'Ibrahimpatnam', 'Mylavaram'],
    eligibleVillages: ['All Villages & Wards'],
    size: '1000-5000 employees',
    cin: 'U72200AP2015PTC078912',
    gstin: '37ABCDE1234F1Z5',
    verificationStatus: 'VERIFIED',
    registrationDate: '2026-08-01',
    activeJobsCount: 5,
  },
  {
    id: 'comp-2',
    name: 'Tech Solutions Global Ltd',
    recruiter: 'Sneha Rao',
    industry: 'Fintech & Banking Systems',
    location: 'MG Road, Vijayawada Urban, NTR District',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'MG Road Commercial Hub',
    eligibleMandals: ['All Mandals of NTR District'],
    eligibleVillages: ['All Villages & Wards'],
    size: '500-1000 employees',
    cin: 'U72900AP2018PTC099142',
    gstin: '37ABCDE9876F1Z2',
    verificationStatus: 'VERIFIED',
    registrationDate: '2026-08-03',
    activeJobsCount: 4,
  },
  {
    id: 'comp-3',
    name: 'Hero MotoCorp AP Manufacturing',
    recruiter: 'Akash Chouhan',
    industry: 'Automotive & Heavy Assembly',
    location: 'Kondapalli Industrial Area, Ibrahimpatnam',
    district: 'NTR District',
    mandal: 'Ibrahimpatnam',
    village: 'Kondapalli Industrial Corridor',
    eligibleMandals: ['Ibrahimpatnam', 'Vijayawada Rural', 'Mylavaram', 'G.Konduru'],
    eligibleVillages: ['Kondapalli', 'Ibrahimpatnam', 'Gollapudi', 'Nunna', 'Velagaleru'],
    size: '2000-5000 employees',
    cin: 'U34100AP2019PTC112345',
    gstin: '37ABCDE5678F1Z9',
    verificationStatus: 'VERIFIED',
    registrationDate: '2026-08-10',
    activeJobsCount: 3,
  },
  {
    id: 'comp-4',
    name: 'Ultratech Cement & Infrastructure',
    recruiter: 'Girish Chand',
    industry: 'Manufacturing & Civil Testing',
    location: 'Industrial Corridor, Jaggaiahpet, NTR District',
    district: 'NTR District',
    mandal: 'Jaggaiahpet',
    village: 'Cement Nagar Industrial Area',
    eligibleMandals: ['Jaggaiahpet', 'Nandigama', 'Tiruvuru', 'Kanchikacherla'],
    eligibleVillages: ['All Local Mandal Villages'],
    size: '500-1500 employees',
    cin: 'U26940AP2016PTC087654',
    gstin: '37ABCDE4321F1Z8',
    verificationStatus: 'VERIFIED',
    registrationDate: '2026-08-15',
    activeJobsCount: 2,
  },
  {
    id: 'comp-5',
    name: 'DMart Retail AP Operations',
    recruiter: 'Kiran Deshmukh',
    industry: 'Retail Chain & Supply Chain',
    location: 'Bhavanipuram & Patamata, Vijayawada Urban',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Bhavanipuram Central',
    eligibleMandals: ['All Mandals of NTR District'],
    eligibleVillages: ['All Villages & Wards'],
    size: '250-500 employees',
    cin: 'U52100AP2020PTC112233',
    gstin: '37ABCDE1122F1Z1',
    verificationStatus: 'VERIFIED',
    registrationDate: '2026-09-03',
    activeJobsCount: 2,
  },
];

// ─── 5. SEED JOBS ──────────────────────────────────────────────────────────
const SEED_JOBS = [
  {
    id: 'job-101',
    title: 'Senior Frontend Engineer (React / TypeScript)',
    company: 'ABC Technologies Pvt Ltd',
    location: 'Bengaluru, Karnataka',
    experience: '3-5 years',
    salary: '₹16,00,000 - ₹24,00,000 / year',
    recruiter: 'Arjun Reddy',
    postedDate: '2026-08-15',
    status: 'ACTIVE',
    applicantsCount: 78,
    type: 'Full-time',
  },
  {
    id: 'job-102',
    title: 'Senior Python & Cloud Backend Developer',
    company: 'ABC Technologies Pvt Ltd',
    location: 'Hyderabad, Telangana',
    experience: '3-6 years',
    salary: '₹14,00,000 - ₹22,00,000 / year',
    recruiter: 'Arjun Reddy',
    postedDate: '2026-08-18',
    status: 'ACTIVE',
    applicantsCount: 45,
    type: 'Full-time',
  },
  {
    id: 'job-103',
    title: 'DevOps & Cloud Infrastructure Specialist',
    company: 'ABC Technologies Pvt Ltd',
    location: 'Remote (India)',
    experience: '4-7 years',
    salary: '₹20,00,000 - ₹30,00,000 / year',
    recruiter: 'Arjun Reddy',
    postedDate: '2026-08-20',
    status: 'ACTIVE',
    applicantsCount: 32,
    type: 'Full-time',
  },
  {
    id: 'job-104',
    title: 'AI / ML Engineer — Computer Vision & NLP',
    company: 'ABC Technologies Pvt Ltd',
    location: 'Bengaluru, Karnataka',
    experience: '2-4 years',
    salary: '₹18,00,000 - ₹26,00,000 / year',
    recruiter: 'Arjun Reddy',
    postedDate: '2026-08-24',
    status: 'PENDING',
    applicantsCount: 12,
    type: 'Full-time',
  },
  {
    id: 'job-201',
    title: 'Full Stack UI Architect (React / Node.js)',
    company: 'Tech Solutions Global Ltd',
    location: 'Hyderabad, Telangana',
    experience: '4-8 years',
    salary: '₹18,00,000 - ₹28,00,000 / year',
    recruiter: 'Sneha Rao',
    postedDate: '2026-08-10',
    status: 'ACTIVE',
    applicantsCount: 64,
    type: 'Full-time',
  },
  {
    id: 'job-202',
    title: 'Cloud Data Platform Engineer (Snowflake/PySpark)',
    company: 'Tech Solutions Global Ltd',
    location: 'Visakhapatnam, AP',
    experience: '3-5 years',
    salary: '₹15,00,000 - ₹22,00,000 / year',
    recruiter: 'Sneha Rao',
    postedDate: '2026-08-16',
    status: 'ACTIVE',
    applicantsCount: 38,
    type: 'Full-time',
  },
  {
    id: 'job-301',
    title: 'Senior Blockchain & Solidity Engineer',
    company: 'Fintech Corp India Pvt Ltd',
    location: 'Mumbai, Maharashtra',
    experience: '3-6 years',
    salary: '₹22,00,000 - ₹35,00,000 / year',
    recruiter: 'Rahul Mehta',
    postedDate: '2026-09-02',
    status: 'PENDING',
    applicantsCount: 0,
    type: 'Full-time',
  },
  {
    id: 'job-302',
    title: 'Clinical Data Pipeline Lead',
    company: 'HealthPlus Systems Ltd',
    location: 'Bengaluru, Karnataka',
    experience: '4-7 years',
    salary: '₹18,00,000 - ₹25,00,000 / year',
    recruiter: 'Divya Iyer',
    postedDate: '2026-09-03',
    status: 'PENDING',
    applicantsCount: 0,
    type: 'Full-time',
  }
];

// ─── 6. SEED INTERNSHIPS ───────────────────────────────────────────────────
const SEED_INTERNSHIPS = [
  {
    id: 'int-101',
    title: 'Frontend React Development Intern',
    company: 'ABC Technologies Pvt Ltd',
    duration: '6 Months',
    stipend: '₹25,000 / month',
    location: 'Bengaluru, Karnataka',
    submittedDate: '2026-08-16',
    status: 'ACTIVE',
    openings: 4,
    applicantsCount: 42,
  },
  {
    id: 'int-102',
    title: 'Cloud Infrastructure & DevOps Intern',
    company: 'ABC Technologies Pvt Ltd',
    duration: '6 Months',
    stipend: '₹30,000 / month',
    location: 'Hyderabad, Telangana',
    submittedDate: '2026-08-19',
    status: 'ACTIVE',
    openings: 2,
    applicantsCount: 28,
  },
  {
    id: 'int-103',
    title: 'AI & Data Science Engineering Intern',
    company: 'ABC Technologies Pvt Ltd',
    duration: '6 Months',
    stipend: '₹28,000 / month',
    location: 'Remote (India)',
    submittedDate: '2026-08-25',
    status: 'PENDING',
    openings: 2,
    applicantsCount: 19,
  },
  {
    id: 'int-201',
    title: 'Fintech Microservices & Backend Intern',
    company: 'Tech Solutions Global Ltd',
    duration: '6 Months',
    stipend: '₹22,000 / month',
    location: 'Hyderabad, Telangana',
    submittedDate: '2026-08-18',
    status: 'ACTIVE',
    openings: 3,
    applicantsCount: 35,
  },
  {
    id: 'int-301',
    title: 'Smart Medical Devices Firmware Intern',
    company: 'HealthPlus Systems Ltd',
    duration: '3 Months',
    stipend: '₹20,000 / month',
    location: 'Bengaluru, Karnataka',
    submittedDate: '2026-09-02',
    status: 'PENDING',
    openings: 2,
    applicantsCount: 0,
  }
];

// ─── 7. SEED APPLICATIONS MONITORING ──────────────────────────────────────
const SEED_APPLICATIONS = [
  {
    id: 'app-1',
    candidate: 'Priya Sharma',
    candidateEmail: 'priya.sharma@example.com',
    job: 'Senior Frontend Engineer (React / TypeScript)',
    company: 'ABC Technologies Pvt Ltd',
    appliedDate: '2026-08-20',
    status: 'SHORTLISTED',
  },
  {
    id: 'app-2',
    candidate: 'Rahul Kumar',
    candidateEmail: 'rahul.kumar@example.com',
    job: 'Senior Python & Cloud Backend Developer',
    company: 'ABC Technologies Pvt Ltd',
    appliedDate: '2026-08-21',
    status: 'INTERVIEW',
  },
  {
    id: 'app-3',
    candidate: 'Vikram Sethi',
    candidateEmail: 'vikram.sethi@example.com',
    job: 'DevOps & Cloud Infrastructure Specialist',
    company: 'ABC Technologies Pvt Ltd',
    appliedDate: '2026-08-22',
    status: 'SELECTED',
  },
  {
    id: 'app-4',
    candidate: 'Ananya Roy',
    candidateEmail: 'ananya.roy@example.com',
    job: 'AI / ML Engineer — Computer Vision & NLP',
    company: 'ABC Technologies Pvt Ltd',
    appliedDate: '2026-08-24',
    status: 'APPLIED',
  },
  {
    id: 'app-5',
    candidate: 'Sneha Kulkarni',
    candidateEmail: 'sneha.kulkarni@example.com',
    job: 'Full Stack UI Architect (React / Node.js)',
    company: 'Tech Solutions Global Ltd',
    appliedDate: '2026-08-25',
    status: 'SHORTLISTED',
  },
  {
    id: 'app-6',
    candidate: 'Karthik Varma',
    candidateEmail: 'karthik.v@example.com',
    job: 'Cloud Data Platform Engineer',
    company: 'Tech Solutions Global Ltd',
    appliedDate: '2026-08-26',
    status: 'APPLIED',
  },
];

// ─── 8. SEED JOB MELAS & REGISTRATIONS ────────────────────────────────────
const SEED_JOB_MELAS = [
  {
    id: 'mela-1',
    event: 'Bengaluru Mega IT & Cloud Career Expo 2026',
    title: 'Bengaluru Mega IT & Cloud Career Expo 2026',
    description: "South India's premier multi-sector recruitment drive bringing together leading IT, Cloud, and Product companies. Walk-in technical interviews and spot offer letters.",
    date: '2026-09-18',
    startTime: '09:00 AM',
    endTime: '05:30 PM',
    time: '09:00 AM - 05:30 PM',
    regStartDate: '2026-08-01',
    regEndDate: '2026-09-15',
    maxCapacity: 5000,
    venue: 'Bengaluru International Exhibition Centre (BIEC), Hall 3 & 4',
    city: 'Bengaluru',
    state: 'Karnataka',
    location: 'Bengaluru, Karnataka',
    organizer: 'NTR Vikasa State Employment Authority',
    companiesCount: 84,
    vacanciesCount: 4200,
    status: 'APPROVED',
    registeredCandidatesCount: 1420,
    createdByAdmin: true,
    banner: '/hero2.jpg',
    posterImage: '/hero2.jpg',
    image: '/hero2.jpg',
    participatingCompanies: [
      {
        id: 'pmc-1',
        companyId: 'comp-foxconn',
        company: 'Foxconn',
        recruiter: 'Arjun Reddy',
        position: 'Mobile Operator',
        qualification: 'ITI / Diploma',
        experience: '—',
        salary: '₹18,279',
        vacancies: 100,
        applications: 22,
        location: 'Hall 3, Booth A-01',
        notes: 'Assembly line operations and electronic device inspection.'
      },
      {
        id: 'pmc-2',
        companyId: 'comp-seoyon',
        company: 'Seoyon E-Hwa Summit',
        recruiter: 'Sneha Rao',
        position: 'GET',
        qualification: 'B.E/B.Tech',
        experience: '0–1',
        salary: '₹18,500',
        vacancies: 20,
        applications: 21,
        location: 'Hall 3, Booth A-02',
        notes: 'Automotive interior component manufacturing & quality control.'
      },
      {
        id: 'pmc-3',
        companyId: 'comp-icici',
        company: 'ICICI Bank',
        recruiter: 'Rahul Mehta',
        position: 'Relationship Manager',
        qualification: 'Any Graduation',
        experience: '0–1',
        salary: '₹32,000–₹38,000',
        vacancies: 20,
        applications: 15,
        location: 'Hall 3, Booth A-03',
        notes: 'Retail branch relationship management and customer onboarding.'
      },
      {
        id: 'pmc-4',
        companyId: 'comp-1',
        company: 'ABC Technologies Pvt Ltd',
        recruiter: 'Arjun Reddy',
        position: 'Senior Frontend Engineer / Cloud Developer',
        qualification: 'B.Tech / B.E / MCA in CS / IT',
        experience: '2-5 Years',
        salary: '₹12,00,000 - ₹20,00,000 / year',
        vacancies: 45,
        applications: 120,
        location: 'Stall B-14 (Hall 3)',
        notes: 'Conducting direct spot technical coding screenings on-site.'
      },
      {
        id: 'pmc-5',
        companyId: 'comp-2',
        company: 'Tech Solutions Global Ltd',
        recruiter: 'Sneha Rao',
        position: 'Full Stack UI Architect & Backend Lead',
        qualification: 'B.Tech / MCA / M.Sc',
        experience: '3-6 Years',
        salary: '₹15,00,000 - ₹24,00,000 / year',
        vacancies: 30,
        applications: 85,
        location: 'Stall A-08 (Hall 3)',
        notes: 'Bring 3 printed resumes and photo ID.'
      },
      {
        id: 'pmc-6',
        companyId: 'comp-3',
        company: 'Fintech Corp India Pvt Ltd',
        recruiter: 'Rahul Mehta',
        position: 'Blockchain Engineer & Smart Contract Dev',
        qualification: 'B.Tech / B.E Computer Science',
        experience: '1-4 Years',
        salary: '₹14,00,000 - ₹22,00,000 / year',
        vacancies: 20,
        applications: 60,
        location: 'Stall C-02 (Hall 4)',
        notes: 'Walk-in technical assessment between 10 AM - 3 PM.'
      },
      {
        id: 'pmc-7',
        companyId: 'comp-4',
        company: 'HealthPlus Systems Ltd',
        recruiter: 'Divya Iyer',
        position: 'Clinical Data Pipeline Lead & Bio-Informatics',
        qualification: 'B.Tech / M.Tech / M.Sc Bioinformatics',
        experience: '2-5 Years',
        salary: '₹10,00,000 - ₹18,00,000 / year',
        vacancies: 15,
        applications: 40,
        location: 'Stall D-05 (Hall 4)',
        notes: 'Immediate spot offers for qualified candidates.'
      },
      {
        id: 'pmc-8',
        companyId: 'comp-tcs',
        company: 'Tata Consultancy Services',
        recruiter: 'Pooja Sharma',
        position: 'Systems Engineer & Digital Developer',
        qualification: 'B.Tech / B.E / MCA',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹7,00,000 / year',
        vacancies: 150,
        applications: 180,
        location: 'Hall 3, Booth B-01',
        notes: 'Ninja and Digital track on-spot interview.'
      },
      {
        id: 'pmc-9',
        companyId: 'comp-infosys',
        company: 'Infosys Limited',
        recruiter: 'Vikram Malhotra',
        position: 'Digital Specialist Engineer',
        qualification: 'B.Tech / B.E / M.Tech',
        experience: '0-3 Years',
        salary: '₹6,50,000 - ₹9,50,000 / year',
        vacancies: 120,
        applications: 145,
        location: 'Hall 3, Booth B-02',
        notes: 'Python, Java, and Cloud microservices technical rounds.'
      },
      {
        id: 'pmc-10',
        companyId: 'comp-wipro',
        company: 'Wipro Technologies',
        recruiter: 'Kavita Nair',
        position: 'Project Engineer (Cloud & Cybersecurity)',
        qualification: 'B.Tech / B.E / MCA',
        experience: '1-3 Years',
        salary: '₹4,00,000 - ₹6,50,000 / year',
        vacancies: 80,
        applications: 95,
        location: 'Hall 3, Booth B-03',
        notes: 'Spot coding evaluation on laptops.'
      },
      {
        id: 'pmc-11',
        companyId: 'comp-hcl',
        company: 'HCL Technologies',
        recruiter: 'Suresh Menon',
        position: 'Associate Cloud Support Engineer',
        qualification: 'Any Graduate / B.Tech',
        experience: '0-2 Years',
        salary: '₹4,25,000 - ₹6,00,000 / year',
        vacancies: 65,
        applications: 78,
        location: 'Hall 3, Booth B-04',
        notes: '24x7 rotation shifts with transport allowance.'
      },
      {
        id: 'pmc-12',
        companyId: 'comp-techm',
        company: 'Tech Mahindra',
        recruiter: 'Anjali Deshmukh',
        position: 'Telecom Network & 5G Operations Trainee',
        qualification: 'Diploma / B.Sc / BCA / B.Tech',
        experience: '0-1 Year',
        salary: '₹3,60,000 - ₹4,80,000 / year',
        vacancies: 50,
        applications: 62,
        location: 'Hall 3, Booth B-05',
        notes: 'Immediate deployment in Bangalore & Hyderabad.'
      },
      {
        id: 'pmc-13',
        companyId: 'comp-ltts',
        company: 'L&T Technology Services',
        recruiter: 'Ramesh Patel',
        position: 'Embedded Firmware Developer',
        qualification: 'B.E / B.Tech Electronics & Comm',
        experience: '1-3 Years',
        salary: '₹5,50,000 - ₹8,50,000 / year',
        vacancies: 40,
        applications: 52,
        location: 'Hall 3, Booth C-01',
        notes: 'Embedded C, RTOS, and CAN bus protocols.'
      },
      {
        id: 'pmc-14',
        companyId: 'comp-lt',
        company: 'Larsen & Toubro (L&T)',
        recruiter: 'Sunil Verma',
        position: 'Graduate Engineer Trainee - Infrastructure',
        qualification: 'B.Tech / B.E (Civil / Mech / Electrical)',
        experience: '0-1 Year',
        salary: '₹6,00,000 - ₹8,00,000 / year',
        vacancies: 75,
        applications: 110,
        location: 'Hall 3, Booth C-02',
        notes: 'Project site leadership & engineering operations.'
      },
      {
        id: 'pmc-15',
        companyId: 'comp-reliance',
        company: 'Reliance Retail',
        recruiter: 'Meera Nambiar',
        position: 'Store Operations & Logistics Lead',
        qualification: 'Any Degree / MBA',
        experience: '0-2 Years',
        salary: '₹3,50,000 - ₹5,50,000 / year',
        vacancies: 90,
        applications: 84,
        location: 'Hall 3, Booth C-03',
        notes: 'Smart Bazaar and Digital retail stores.'
      },
      {
        id: 'pmc-16',
        companyId: 'comp-hdfc',
        company: 'HDFC Bank',
        recruiter: 'Karthik Swaminathan',
        position: 'Customer Service & Branch Operations',
        qualification: 'Any Graduate',
        experience: '0-2 Years',
        salary: '₹3,80,000 - ₹5,00,000 / year',
        vacancies: 55,
        applications: 68,
        location: 'Hall 3, Booth C-04',
        notes: 'Direct branch banking and account management.'
      },
      {
        id: 'pmc-17',
        companyId: 'comp-axis',
        company: 'Axis Bank',
        recruiter: 'Deepak Joshi',
        position: 'Business Development Executive',
        qualification: 'Any Degree',
        experience: '0-1 Year',
        salary: '₹3,20,000 - ₹4,50,000 / year',
        vacancies: 45,
        applications: 54,
        location: 'Hall 3, Booth C-05',
        notes: 'Retail financial products and SME loans.'
      },
      {
        id: 'pmc-18',
        companyId: 'comp-sbi',
        company: 'State Bank of India (SBI Cards)',
        recruiter: 'Priya Namboodiri',
        position: 'Credit Risk Analyst',
        qualification: 'B.Com / MBA Finance / Statistics',
        experience: '1-3 Years',
        salary: '₹5,00,000 - ₹7,50,000 / year',
        vacancies: 35,
        applications: 42,
        location: 'Hall 3, Booth D-01',
        notes: 'Portfolio risk and delinquency modeling.'
      },
      {
        id: 'pmc-19',
        companyId: 'comp-mahindra',
        company: 'Mahindra & Mahindra',
        recruiter: 'Rajesh Kulkarni',
        position: 'Quality Control Inspector',
        qualification: 'Diploma / B.Tech Mechanical',
        experience: '0-2 Years',
        salary: '₹4,00,000 - ₹5,50,000 / year',
        vacancies: 60,
        applications: 71,
        location: 'Hall 3, Booth D-02',
        notes: 'Automotive vehicle assembly testing.'
      },
      {
        id: 'pmc-20',
        companyId: 'comp-hyundai',
        company: 'Hyundai Motor India',
        recruiter: 'Vijay Anand',
        position: 'Production Line Supervisor',
        qualification: 'Diploma / B.E Automobile / Mech',
        experience: '1-3 Years',
        salary: '₹4,20,000 - ₹6,00,000 / year',
        vacancies: 50,
        applications: 59,
        location: 'Hall 3, Booth D-03',
        notes: 'Body shop and paint shop operations.'
      },
      {
        id: 'pmc-21',
        companyId: 'comp-ashok',
        company: 'Ashok Leyland',
        recruiter: 'Manoj Bhat',
        position: 'Assembly Line Technician',
        qualification: 'ITI / Diploma',
        experience: 'Fresher',
        salary: '₹19,500 - ₹24,000 / month',
        vacancies: 70,
        applications: 83,
        location: 'Hall 3, Booth D-04',
        notes: 'Commercial chassis assembly and powertrain integration.'
      },
      {
        id: 'pmc-22',
        companyId: 'comp-bosch',
        company: 'Bosch India',
        recruiter: 'Harish Rao',
        position: 'Automotive Software QA & Validation',
        qualification: 'B.Tech / M.Tech ECE / CS',
        experience: '1-4 Years',
        salary: '₹7,00,000 - ₹12,00,000 / year',
        vacancies: 30,
        applications: 48,
        location: 'Hall 4, Booth A-01',
        notes: 'ADAS and ECU automated test rigs.'
      },
      {
        id: 'pmc-23',
        companyId: 'comp-schneider',
        company: 'Schneider Electric',
        recruiter: 'Shweta Sengupta',
        position: 'Industrial Automation Engineer',
        qualification: 'B.E Electrical / EEE / Instrumentation',
        experience: '2-4 Years',
        salary: '₹6,50,000 - ₹10,50,000 / year',
        vacancies: 25,
        applications: 36,
        location: 'Hall 4, Booth A-02',
        notes: 'PLC, SCADA, and IoT energy management.'
      },
      {
        id: 'pmc-24',
        companyId: 'comp-havells',
        company: 'Havells India',
        recruiter: 'Alok Mishra',
        position: 'Electrical Testing & Standards Engineer',
        qualification: 'Diploma / B.Tech Electrical',
        experience: '1-3 Years',
        salary: '₹4,00,000 - ₹6,00,000 / year',
        vacancies: 35,
        applications: 41,
        location: 'Hall 4, Booth A-03',
        notes: 'Switchgear and circuit breaker testing.'
      },
      {
        id: 'pmc-25',
        companyId: 'comp-drreddys',
        company: "Dr. Reddy's Laboratories",
        recruiter: 'Dr. Swati Sen',
        position: 'QC Chemist & Formulation Scientist',
        qualification: 'B.Pharm / M.Pharm / M.Sc Chemistry',
        experience: '1-3 Years',
        salary: '₹4,80,000 - ₹7,20,000 / year',
        vacancies: 40,
        applications: 49,
        location: 'Hall 4, Booth A-04',
        notes: 'HPLC, GC, and GMP documentation.'
      },
      {
        id: 'pmc-26',
        companyId: 'comp-sunpharma',
        company: 'Sun Pharmaceutical Industries',
        recruiter: 'Venkatesh Prasad',
        position: 'Production Chemist',
        qualification: 'B.Sc Chemistry / B.Pharm',
        experience: '0-2 Years',
        salary: '₹3,80,000 - ₹5,20,000 / year',
        vacancies: 50,
        applications: 58,
        location: 'Hall 4, Booth B-01',
        notes: 'Bulk drug synthesis and regulatory compliance.'
      },
      {
        id: 'pmc-27',
        companyId: 'comp-cipla',
        company: 'Cipla Limited',
        recruiter: 'Neha Singhania',
        position: 'Regulatory Affairs Associate',
        qualification: 'M.Pharm / B.Pharm',
        experience: '1-3 Years',
        salary: '₹5,00,000 - ₹7,50,000 / year',
        vacancies: 25,
        applications: 33,
        location: 'Hall 4, Booth B-02',
        notes: 'USFDA and EMA dossier filings.'
      },
      {
        id: 'pmc-28',
        companyId: 'comp-biocon',
        company: 'Biocon Limited',
        recruiter: 'Dr. Arvind Hegde',
        position: 'Bioprocess Technician',
        qualification: 'M.Sc Biotech / B.Tech Biotech',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹6,80,000 / year',
        vacancies: 30,
        applications: 39,
        location: 'Hall 4, Booth B-03',
        notes: 'Bioreactor scaling and chromatography purification.'
      },
      {
        id: 'pmc-29',
        companyId: 'comp-apollo',
        company: 'Apollo Hospitals Group',
        recruiter: 'Preeti Roy',
        position: 'Healthcare Administration Associate',
        qualification: 'Any Graduate / MHA / BHM',
        experience: '0-2 Years',
        salary: '₹3,20,000 - ₹4,80,000 / year',
        vacancies: 45,
        applications: 52,
        location: 'Hall 4, Booth B-04',
        notes: 'Hospital guest relations and billing desk operations.'
      },
      {
        id: 'pmc-30',
        companyId: 'comp-amazon',
        company: 'Amazon Development Centre',
        recruiter: 'Karan Kapoor',
        position: 'Cloud Support Associate (AWS)',
        qualification: 'B.Tech / BCA / B.Sc IT',
        experience: '0-2 Years',
        salary: '₹8,00,000 - ₹14,00,000 / year',
        vacancies: 40,
        applications: 115,
        location: 'Hall 4, Booth C-01',
        notes: 'Linux, Networking, and AWS core services troubleshooting.'
      },
      {
        id: 'pmc-31',
        companyId: 'comp-flipkart',
        company: 'Flipkart Internet',
        recruiter: 'Rohit Agarwal',
        position: 'Warehouse Operations Executive',
        qualification: 'Any Graduate',
        experience: '0-2 Years',
        salary: '₹3,60,000 - ₹5,00,000 / year',
        vacancies: 80,
        applications: 92,
        location: 'Hall 4, Booth C-02',
        notes: 'Supply chain automation and inventory tracking.'
      },
      {
        id: 'pmc-32',
        companyId: 'comp-swiggy',
        company: 'Swiggy (Bundl Technologies)',
        recruiter: 'Siddharth Jain',
        position: 'City Logistics Lead',
        qualification: 'Any Graduate',
        experience: '1-3 Years',
        salary: '₹4,50,000 - ₹6,50,000 / year',
        vacancies: 35,
        applications: 47,
        location: 'Hall 4, Booth C-03',
        notes: 'Instamart delivery dark-store optimization.'
      },
      {
        id: 'pmc-33',
        companyId: 'comp-zomato',
        company: 'Zomato Limited',
        recruiter: 'Prashant Saxena',
        position: 'Merchant Acquisition Manager',
        qualification: 'Any Graduate',
        experience: '0-2 Years',
        salary: '₹4,00,000 - ₹6,00,000 / year',
        vacancies: 40,
        applications: 55,
        location: 'Hall 4, Booth C-04',
        notes: 'B2B restaurant onboarding and POS rollout.'
      },
      {
        id: 'pmc-34',
        companyId: 'comp-razorpay',
        company: 'Razorpay Software',
        recruiter: 'Gaurav Tandon',
        position: 'Tech Support Specialist',
        qualification: 'BCA / B.Tech / B.Sc',
        experience: '0-2 Years',
        salary: '₹5,50,000 - ₹8,00,000 / year',
        vacancies: 25,
        applications: 41,
        location: 'Hall 4, Booth D-01',
        notes: 'Payment gateway API integrations and webhook debugging.'
      },
      {
        id: 'pmc-35',
        companyId: 'comp-paytm',
        company: 'PayTM (One97 Communications)',
        recruiter: 'Aditya Sen',
        position: 'Field Sales Executive (Soundbox & POS)',
        qualification: '10+2 / Any Degree',
        experience: '0-1 Year',
        salary: '₹2,80,000 - ₹4,00,000 / year',
        vacancies: 100,
        applications: 88,
        location: 'Hall 4, Booth D-02',
        notes: 'Offline merchant payment qr-code expansion.'
      },
      {
        id: 'pmc-36',
        companyId: 'comp-phonepe',
        company: 'PhonePe Private Limited',
        recruiter: 'Richa Chadha',
        position: 'Operations Analyst',
        qualification: 'B.Com / B.Sc / B.Tech',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹6,80,000 / year',
        vacancies: 30,
        applications: 46,
        location: 'Hall 4, Booth D-03',
        notes: 'Reconciliation and UPI chargeback investigations.'
      },
      {
        id: 'pmc-37',
        companyId: 'comp-delhivery',
        company: 'Delhivery Limited',
        recruiter: 'Santosh Gowda',
        position: 'Hub Operations Supervisor',
        qualification: 'Any Degree',
        experience: '1-3 Years',
        salary: '₹3,80,000 - ₹5,20,000 / year',
        vacancies: 60,
        applications: 67,
        location: 'Pavilion 1, Stall 01',
        notes: 'Express parcel sortation center line-haul dispatch.'
      },
      {
        id: 'pmc-38',
        companyId: 'comp-shadowfax',
        company: 'Shadowfax Technologies',
        recruiter: 'Naveen Kumar',
        position: 'Fleet Operations Associate',
        qualification: 'Any Degree / 10+2',
        experience: '0-1 Year',
        salary: '₹2,60,000 - ₹3,60,000 / year',
        vacancies: 70,
        applications: 74,
        location: 'Pavilion 1, Stall 02',
        notes: 'Hyperlocal rider onboarding and route dispatch.'
      },
      {
        id: 'pmc-39',
        companyId: 'comp-bluedart',
        company: 'Blue Dart Express',
        recruiter: 'Mahesh Pillai',
        position: 'Dispatch Logistics Coordinator',
        qualification: '10+2 / Any Degree',
        experience: '0-2 Years',
        salary: '₹2,80,000 - ₹3,80,000 / year',
        vacancies: 50,
        applications: 53,
        location: 'Pavilion 1, Stall 03',
        notes: 'Air-cargo cargo handling and barcode tracking.'
      },
      {
        id: 'pmc-40',
        companyId: 'comp-zoho',
        company: 'Zoho Corporation',
        recruiter: 'Shruti Natarajan',
        position: 'Junior Technical Support Engineer',
        qualification: 'Any Degree / B.Tech',
        experience: '0-2 Years',
        salary: '₹5,00,000 - ₹7,50,000 / year',
        vacancies: 45,
        applications: 82,
        location: 'Pavilion 1, Stall 04',
        notes: 'Zoho CRM & Books cloud suite support.'
      },
      {
        id: 'pmc-41',
        companyId: 'comp-freshworks',
        company: 'Freshworks Technologies',
        recruiter: 'Varun Murthy',
        position: 'Customer Success Associate',
        qualification: 'Any Graduate',
        experience: '0-2 Years',
        salary: '₹5,50,000 - ₹8,50,000 / year',
        vacancies: 30,
        applications: 54,
        location: 'Pavilion 1, Stall 05',
        notes: 'SaaS client relationship and product onboarding.'
      },
      {
        id: 'pmc-42',
        companyId: 'comp-postman',
        company: 'Postman Software',
        recruiter: 'Tarun Gill',
        position: 'Developer Support Engineer',
        qualification: 'B.Tech / BCA',
        experience: '1-3 Years',
        salary: '₹8,00,000 - ₹14,00,000 / year',
        vacancies: 15,
        applications: 38,
        location: 'Pavilion 1, Stall 06',
        notes: 'REST, GraphQL, and WebSocket API client troubleshooting.'
      },
      {
        id: 'pmc-43',
        companyId: 'comp-browserstack',
        company: 'BrowserStack',
        recruiter: 'Nikhil Bansal',
        position: 'SDET / Automation Engineer',
        qualification: 'B.Tech / MCA',
        experience: '1-3 Years',
        salary: '₹9,00,000 - ₹16,00,000 / year',
        vacancies: 20,
        applications: 44,
        location: 'Pavilion 1, Stall 07',
        notes: 'Selenium, Appium, and Cypress test infrastructure.'
      },
      {
        id: 'pmc-44',
        companyId: 'comp-ola',
        company: 'Ola Electric',
        recruiter: 'Ritu Raj',
        position: 'Battery Assembly Technician',
        qualification: 'ITI / Diploma',
        experience: '0-2 Years',
        salary: '₹20,000 - ₹26,00,000 / year',
        vacancies: 80,
        applications: 91,
        location: 'Pavilion 1, Stall 08',
        notes: 'EV 4680 cell pack automated welding & BMS tests.'
      },
      {
        id: 'pmc-45',
        companyId: 'comp-ather',
        company: 'Ather Energy',
        recruiter: 'Sanjay Somani',
        position: 'EV Diagnostic Specialist',
        qualification: 'Diploma / B.Tech Mech/EEE',
        experience: '0-2 Years',
        salary: '₹3,80,000 - ₹5,50,000 / year',
        vacancies: 40,
        applications: 49,
        location: 'Pavilion 1, Stall 09',
        notes: 'Smart scooter telematics and motor controller maintenance.'
      },
      {
        id: 'pmc-46',
        companyId: 'comp-tataelxsi',
        company: 'Tata Elxsi',
        recruiter: 'Bhavna Seth',
        position: 'Embedded Linux Developer',
        qualification: 'B.Tech / M.Tech ECE',
        experience: '1-4 Years',
        salary: '₹6,50,000 - ₹11,00,000 / year',
        vacancies: 35,
        applications: 52,
        location: 'Pavilion 1, Stall 10',
        notes: 'Connected vehicle infotainment systems.'
      },
      {
        id: 'pmc-47',
        companyId: 'comp-titan',
        company: 'Titan Company',
        recruiter: 'Mansi Gupta',
        position: 'Retail Merchandising Associate',
        qualification: 'Any Graduate',
        experience: '0-2 Years',
        salary: '₹3,40,000 - ₹4,80,000 / year',
        vacancies: 30,
        applications: 37,
        location: 'Pavilion 2, Stall 01',
        notes: 'Tanishq and Fastrack retail distribution management.'
      },
      {
        id: 'pmc-48',
        companyId: 'comp-godrej',
        company: 'Godrej Consumer Products',
        recruiter: 'Chandan Roy',
        position: 'Territory Sales Executive',
        qualification: 'Any Degree / MBA',
        experience: '1-3 Years',
        salary: '₹4,20,000 - ₹6,00,000 / year',
        vacancies: 40,
        applications: 48,
        location: 'Pavilion 2, Stall 02',
        notes: 'FMCG distributor network and channel sales.'
      },
      {
        id: 'pmc-49',
        companyId: 'comp-asianpaints',
        company: 'Asian Paints',
        recruiter: 'Nishant Kaushik',
        position: 'Color Consultant & Technical Sales',
        qualification: 'B.Sc / Any Degree',
        experience: '0-2 Years',
        salary: '₹3,60,000 - ₹5,00,000 / year',
        vacancies: 45,
        applications: 51,
        location: 'Pavilion 2, Stall 03',
        notes: 'Architectural finishes and dealer partner management.'
      },
      {
        id: 'pmc-50',
        companyId: 'comp-britannia',
        company: 'Britannia Industries',
        recruiter: 'Pallavi Reddy',
        position: 'Food Quality Inspector',
        qualification: 'B.Sc / M.Sc Food Tech',
        experience: '0-2 Years',
        salary: '₹3,80,000 - ₹5,20,000 / year',
        vacancies: 30,
        applications: 36,
        location: 'Pavilion 2, Stall 04',
        notes: 'FSSAI standards audit and automated packaging lines.'
      },
      {
        id: 'pmc-51',
        companyId: 'comp-marico',
        company: 'Marico Limited',
        recruiter: 'Kushal Dutta',
        position: 'Supply Chain Trainee',
        qualification: 'B.Tech / MBA Supply Chain',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹6,50,000 / year',
        vacancies: 25,
        applications: 34,
        location: 'Pavilion 2, Stall 05',
        notes: 'Demand forecasting and warehouse inventory flow.'
      },
      {
        id: 'pmc-52',
        companyId: 'comp-itc',
        company: 'ITC Limited',
        recruiter: 'Subhashish Ghosh',
        position: 'Brand Marketing Executive',
        qualification: 'Any Graduate / MBA',
        experience: '1-3 Years',
        salary: '₹5,00,000 - ₹7,50,000 / year',
        vacancies: 35,
        applications: 47,
        location: 'Pavilion 2, Stall 06',
        notes: 'Consumer goods trade promotions & retail branding.'
      },
      {
        id: 'pmc-53',
        companyId: 'comp-ltimindtree',
        company: 'LTIMindtree Limited',
        recruiter: 'Vidya Sagar',
        position: 'Java Microservices Developer',
        qualification: 'B.Tech / MCA',
        experience: '1-4 Years',
        salary: '₹6,00,000 - ₹10,50,000 / year',
        vacancies: 50,
        applications: 72,
        location: 'Pavilion 2, Stall 07',
        notes: 'Spring Boot, Kafka, and Kubernetes cloud applications.'
      },
      {
        id: 'pmc-54',
        companyId: 'comp-capgemini',
        company: 'Capgemini India',
        recruiter: 'Prateek Shukla',
        position: 'Cloud Infrastructure Analyst',
        qualification: 'B.Tech / B.Sc / BCA',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹7,00,000 / year',
        vacancies: 70,
        applications: 89,
        location: 'Pavilion 2, Stall 08',
        notes: 'Azure & AWS cloud migration support.'
      },
      {
        id: 'pmc-55',
        companyId: 'comp-cognizant',
        company: 'Cognizant Technology Solutions',
        recruiter: 'Kavya Shree',
        position: 'Programmer Analyst Trainee',
        qualification: 'B.Tech / MCA / M.Sc',
        experience: '0-1 Year',
        salary: '₹4,20,000 - ₹6,50,000 / year',
        vacancies: 90,
        applications: 112,
        location: 'Pavilion 2, Stall 09',
        notes: 'Full stack web development & cloud operations.'
      },
      {
        id: 'pmc-56',
        companyId: 'comp-accenture',
        company: 'Accenture Solutions',
        recruiter: 'Amol Chitnis',
        position: 'Associate Software Engineer',
        qualification: 'B.Tech / B.E (All Branches)',
        experience: '0-1 Year',
        salary: '₹4,80,000 - ₹7,50,000 / year',
        vacancies: 100,
        applications: 130,
        location: 'Pavilion 2, Stall 10',
        notes: 'Enterprise platform engineering and data analytics.'
      },
      {
        id: 'pmc-57',
        companyId: 'comp-ibm',
        company: 'IBM India',
        recruiter: 'Shailesh Gokhale',
        position: 'System Administrator (Red Hat Linux)',
        qualification: 'BCA / B.Tech / B.Sc',
        experience: '1-3 Years',
        salary: '₹5,50,000 - ₹9,00,000 / year',
        vacancies: 40,
        applications: 58,
        location: 'Pavilion 3, Stall 01',
        notes: 'Red Hat Enterprise Linux cluster maintenance.'
      },
      {
        id: 'pmc-58',
        companyId: 'comp-dell',
        company: 'Dell Technologies',
        recruiter: 'Tanvi Mathur',
        position: 'Technical Support Specialist',
        qualification: 'Any Graduate / BCA',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹7,00,000 / year',
        vacancies: 50,
        applications: 68,
        location: 'Pavilion 3, Stall 02',
        notes: 'Enterprise server hardware and storage support.'
      },
      {
        id: 'pmc-59',
        companyId: 'comp-oracle',
        company: 'Oracle India',
        recruiter: 'Abhishek Pandey',
        position: 'Database Support Engineer',
        qualification: 'B.Tech / MCA',
        experience: '1-3 Years',
        salary: '₹7,50,000 - ₹13,00,000 / year',
        vacancies: 30,
        applications: 52,
        location: 'Pavilion 3, Stall 03',
        notes: 'Oracle Autonomous Database and SQL tuning.'
      },
      {
        id: 'pmc-60',
        companyId: 'comp-cisco',
        company: 'Cisco Systems India',
        recruiter: 'Radhika Menon',
        position: 'TAC Network Support Engineer',
        qualification: 'B.Tech ECE / CS',
        experience: '1-3 Years',
        salary: '₹9,00,000 - ₹15,00,000 / year',
        vacancies: 25,
        applications: 47,
        location: 'Pavilion 3, Stall 04',
        notes: 'Routing, switching, firewall, and SD-WAN troubleshooting.'
      },
      {
        id: 'pmc-61',
        companyId: 'comp-intel',
        company: 'Intel Technology India',
        recruiter: 'Vinod Nair',
        position: 'SoC Validation Trainee',
        qualification: 'B.Tech / M.Tech VLSI',
        experience: '0-2 Years',
        salary: '₹10,00,000 - ₹17,00,000 / year',
        vacancies: 20,
        applications: 39,
        location: 'Pavilion 3, Stall 05',
        notes: 'SystemVerilog and UVM chip verification.'
      },
      {
        id: 'pmc-62',
        companyId: 'comp-qualcomm',
        company: 'Qualcomm India',
        recruiter: 'Anirudh Das',
        position: 'Wireless Modem QA Engineer',
        qualification: 'B.E / B.Tech ECE',
        experience: '1-3 Years',
        salary: '₹9,50,000 - ₹16,00,000 / year',
        vacancies: 20,
        applications: 42,
        location: 'Pavilion 3, Stall 06',
        notes: '5G NR and LTE protocol stack testing.'
      },
      {
        id: 'pmc-63',
        companyId: 'comp-ti',
        company: 'Texas Instruments',
        recruiter: 'Kavitha Raman',
        position: 'Analog Design Testing Engineer',
        qualification: 'B.Tech / M.Tech Electronics',
        experience: '1-3 Years',
        salary: '₹11,00,000 - ₹18,00,000 / year',
        vacancies: 15,
        applications: 31,
        location: 'Pavilion 3, Stall 07',
        notes: 'Power management ICs and mixed-signal verification.'
      },
      {
        id: 'pmc-64',
        companyId: 'comp-amd',
        company: 'AMD India',
        recruiter: 'Girish Iyer',
        position: 'Silicon Design Trainee',
        qualification: 'B.Tech / M.Tech Microelectronics',
        experience: '0-2 Years',
        salary: '₹10,50,000 - ₹17,50,000 / year',
        vacancies: 15,
        applications: 33,
        location: 'Pavilion 3, Stall 08',
        notes: 'GPU architecture RTL synthesis and timing closure.'
      },
      {
        id: 'pmc-65',
        companyId: 'comp-nvidia',
        company: 'Nvidia Graphics India',
        recruiter: 'Sameer Khan',
        position: 'Deep Learning Solutions QA',
        qualification: 'B.Tech / M.Tech CS',
        experience: '1-3 Years',
        salary: '₹12,00,000 - ₹20,00,000 / year',
        vacancies: 15,
        applications: 40,
        location: 'Pavilion 3, Stall 09',
        notes: 'CUDA and TensorRT performance benchmarking.'
      },
      {
        id: 'pmc-66',
        companyId: 'comp-msft',
        company: 'Microsoft India',
        recruiter: 'Priyanka Chopra',
        position: 'Cloud Solution Architect (Azure)',
        qualification: 'B.Tech / MCA',
        experience: '2-5 Years',
        salary: '₹16,00,000 - ₹28,00,000 / year',
        vacancies: 20,
        applications: 65,
        location: 'Pavilion 3, Stall 10',
        notes: 'Azure cloud native app modernization.'
      },
      {
        id: 'pmc-67',
        companyId: 'comp-google',
        company: 'Google India',
        recruiter: 'Rahul Sundaram',
        position: 'Partner Technical Solutions Engineer',
        qualification: 'B.Tech / B.E',
        experience: '2-5 Years',
        salary: '₹18,00,000 - ₹32,00,000 / year',
        vacancies: 15,
        applications: 58,
        location: 'Pavilion 4, Stall 01',
        notes: 'Google Cloud Platform partner integrations.'
      },
      {
        id: 'pmc-68',
        companyId: 'comp-siemens',
        company: 'Siemens Technology India',
        recruiter: 'Madhusudan Rao',
        position: 'PLC & SCADA Engineer',
        qualification: 'B.Tech Electrical / Instrumentation',
        experience: '1-3 Years',
        salary: '₹5,50,000 - ₹9,00,000 / year',
        vacancies: 30,
        applications: 41,
        location: 'Pavilion 4, Stall 02',
        notes: 'TIA Portal automation and digital factory drives.'
      },
      {
        id: 'pmc-69',
        companyId: 'comp-abb',
        company: 'ABB India',
        recruiter: 'Geeta Krishnan',
        position: 'Robotics Automation Technician',
        qualification: 'Diploma / B.E Mechatronics',
        experience: '1-3 Years',
        salary: '₹4,80,000 - ₹7,80,000 / year',
        vacancies: 25,
        applications: 36,
        location: 'Pavilion 4, Stall 03',
        notes: 'Industrial robot programming & commissioning.'
      },
      {
        id: 'pmc-70',
        companyId: 'comp-honeywell',
        company: 'Honeywell Technology',
        recruiter: 'Sridhar Balan',
        position: 'Aerospace Avionics QA',
        qualification: 'B.E Aeronautical / ECE',
        experience: '1-4 Years',
        salary: '₹7,00,000 - ₹12,00,000 / year',
        vacancies: 20,
        applications: 34,
        location: 'Pavilion 4, Stall 04',
        notes: 'DO-178C software flight safety verification.'
      },
      {
        id: 'pmc-71',
        companyId: 'comp-bel',
        company: 'Bharat Electronics Limited (BEL)',
        recruiter: 'Vijay Kumar',
        position: 'Trainee Engineer (Radar Systems)',
        qualification: 'B.Tech ECE / EEE',
        experience: '0-2 Years',
        salary: '₹4,50,000 - ₹6,50,000 / year',
        vacancies: 40,
        applications: 62,
        location: 'Pavilion 4, Stall 05',
        notes: 'Defense electronics and RF test engineering.'
      },
      {
        id: 'pmc-72',
        companyId: 'comp-bhel',
        company: 'Bharat Heavy Electricals (BHEL)',
        recruiter: 'Anupama Sen',
        position: 'Graduate Apprentice Trainee',
        qualification: 'B.Tech Mech / Electrical',
        experience: 'Fresher',
        salary: '₹3,80,000 - ₹5,00,000 / year',
        vacancies: 50,
        applications: 75,
        location: 'Pavilion 4, Stall 06',
        notes: 'Power turbine and generator manufacturing.'
      },
      {
        id: 'pmc-73',
        companyId: 'comp-hal',
        company: 'Hindustan Aeronautics (HAL)',
        recruiter: 'Devendra Rathore',
        position: 'Aircraft Technician',
        qualification: 'Diploma Aeronautical / Mech',
        experience: '0-2 Years',
        salary: '₹3,60,000 - ₹5,20,000 / year',
        vacancies: 45,
        applications: 68,
        location: 'Pavilion 4, Stall 07',
        notes: 'Aircraft assembly and avionics integration.'
      },
      {
        id: 'pmc-74',
        companyId: 'comp-gail',
        company: 'GAIL India',
        recruiter: 'Mithun Das',
        position: 'Pipeline Maintenance Engineer',
        qualification: 'B.Tech Chemical / Mech',
        experience: '1-3 Years',
        salary: '₹6,00,000 - ₹9,50,000 / year',
        vacancies: 25,
        applications: 38,
        location: 'Pavilion 4, Stall 08',
        notes: 'Natural gas pipeline pressure and SCADA monitoring.'
      },
      {
        id: 'pmc-75',
        companyId: 'comp-ntpc',
        company: 'NTPC Limited',
        recruiter: 'Shubham Tiwari',
        position: 'Power Plant Operations Trainee',
        qualification: 'B.Tech Electrical / Mech',
        experience: '0-2 Years',
        salary: '₹5,50,000 - ₹8,50,000 / year',
        vacancies: 35,
        applications: 54,
        location: 'Pavilion 4, Stall 09',
        notes: 'Thermal power plant boiler and grid operations.'
      },
      {
        id: 'pmc-76',
        companyId: 'comp-ongc',
        company: 'ONGC',
        recruiter: 'Saurabh Mukhopadhyay',
        position: 'Petroleum Geologist Trainee',
        qualification: 'M.Sc Geology / M.Tech',
        experience: '0-2 Years',
        salary: '₹7,00,000 - ₹11,00,000 / year',
        vacancies: 20,
        applications: 33,
        location: 'Pavilion 4, Stall 10',
        notes: 'Offshore drilling and reservoir seismic analysis.'
      },
      {
        id: 'pmc-77',
        companyId: 'comp-tatamotors',
        company: 'Tata Motors',
        recruiter: 'Hemant Sawant',
        position: 'Commercial Vehicle Design Trainee',
        qualification: 'B.Tech Automobile / Mech',
        experience: '0-2 Years',
        salary: '₹5,00,000 - ₹7,50,000 / year',
        vacancies: 50,
        applications: 67,
        location: 'Pavilion 5, Stall 01',
        notes: 'Electric bus and heavy truck CAD prototyping.'
      },
      {
        id: 'pmc-78',
        companyId: 'comp-tvs',
        company: 'TVS Motor Company',
        recruiter: 'Kalyan Chakravarthy',
        position: 'Two-Wheeler Assembly Engineer',
        qualification: 'Diploma / B.Tech Mech',
        experience: '0-2 Years',
        salary: '₹4,00,000 - ₹5,80,000 / year',
        vacancies: 60,
        applications: 72,
        location: 'Pavilion 5, Stall 02',
        notes: 'iQube EV assembly lines and quality checkpoints.'
      },
      {
        id: 'pmc-79',
        companyId: 'comp-royalenfield',
        company: 'Royal Enfield (Eicher Motors)',
        recruiter: 'Bikram Singh',
        position: 'Dealership Service Lead',
        qualification: 'Diploma / B.Tech Mech',
        experience: '1-3 Years',
        salary: '₹3,80,000 - ₹5,40,000 / year',
        vacancies: 40,
        applications: 49,
        location: 'Pavilion 5, Stall 03',
        notes: 'Cruiser motorcycle maintenance & technical support.'
      },
      {
        id: 'pmc-80',
        companyId: 'comp-maruti',
        company: 'Maruti Suzuki India',
        recruiter: 'Rohit Bakshi',
        position: 'Service Workshop Supervisor',
        qualification: 'Diploma Automobile / Mech',
        experience: '0-2 Years',
        salary: '₹3,60,000 - ₹5,00,000 / year',
        vacancies: 70,
        applications: 81,
        location: 'Pavilion 5, Stall 04',
        notes: 'Arena & Nexa authorized service centers.'
      },
      {
        id: 'pmc-81',
        companyId: 'comp-heromotocorp',
        company: 'Hero MotoCorp',
        recruiter: 'Akash Chouhan',
        position: 'Quality Audit Associate',
        qualification: 'Diploma / ITI',
        experience: '0-2 Years',
        salary: '₹2,80,000 - ₹4,00,000 / year',
        vacancies: 80,
        applications: 88,
        location: 'Pavilion 5, Stall 05',
        notes: 'Engine dyno testing and assembly tolerance inspection.'
      },
      {
        id: 'pmc-82',
        companyId: 'comp-apollotyres',
        company: 'Apollo Tyres',
        recruiter: 'Lalit Mohan',
        position: 'Rubber Polymer Chemist',
        qualification: 'B.Sc Chemistry / B.Tech Polymer',
        experience: '1-3 Years',
        salary: '₹4,50,000 - ₹6,80,000 / year',
        vacancies: 30,
        applications: 39,
        location: 'Pavilion 5, Stall 06',
        notes: 'Tread compound development and vulcanization testing.'
      },
      {
        id: 'pmc-83',
        companyId: 'comp-ultratech',
        company: 'Ultratech Cement',
        recruiter: 'Girish Chand',
        position: 'Civil Quality Testing Engineer',
        qualification: 'Diploma / B.Tech Civil',
        experience: '0-2 Years',
        salary: '₹3,80,000 - ₹5,50,000 / year',
        vacancies: 45,
        applications: 56,
        location: 'Pavilion 5, Stall 07',
        notes: 'Concrete compressive strength and slump testing.'
      },
      {
        id: 'pmc-84',
        companyId: 'comp-jsw',
        company: 'JSW Steel',
        recruiter: 'Vikas Shinde',
        position: 'Metallurgy Process Trainee',
        qualification: 'B.Tech Metallurgy / Mech',
        experience: '0-2 Years',
        salary: '₹4,80,000 - ₹7,20,000 / year',
        vacancies: 50,
        applications: 64,
        location: 'Pavilion 5, Stall 08',
        notes: 'Blast furnace operations and hot strip mill rolling.'
      }
    ]
  },
  {
    id: 'mela-2',
    event: 'AP Mega IT & Engineering Job Mela 2026',
    title: 'AP Mega IT & Engineering Job Mela 2026',
    description: 'State-wide employment initiative organized by APSSDC connecting engineering and polytechnic graduates with top corporate hiring teams.',
    date: '2026-10-05',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    time: '09:00 AM - 06:00 PM',
    regStartDate: '2026-09-01',
    regEndDate: '2026-10-01',
    maxCapacity: 4000,
    venue: 'AU Convention Center, Beach Road, Visakhapatnam',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    location: 'Visakhapatnam, Andhra Pradesh',
    organizer: 'Andhra Pradesh Skill Development Corp',
    companiesCount: 12,
    vacanciesCount: 1800,
    status: 'APPROVED',
    registeredCandidatesCount: 950,
    createdByAdmin: true,
    participatingCompanies: [
      {
        id: 'pmc-201',
        companyId: 'comp-1',
        company: 'ABC Technologies Pvt Ltd',
        recruiter: 'Arjun Reddy',
        position: 'Graduate Engineer Trainee (GET)',
        qualification: 'B.Tech / B.E (All Branches) / MCA',
        experience: 'Fresher (0-1 Year)',
        salary: '₹4,50,000 - ₹6,50,000 / year',
        vacancies: 60,
        applications: 180,
        location: 'Pavilion 1, Stall 12',
        notes: 'Aptitude and coding assessment on spot.'
      },
      {
        id: 'pmc-202',
        companyId: 'comp-2',
        company: 'Tech Solutions Global Ltd',
        recruiter: 'Sneha Rao',
        position: 'Associate Cloud Support & Operations',
        qualification: 'B.Sc / BCA / B.Tech / Diploma',
        experience: '0-2 Years',
        salary: '₹4,00,000 - ₹5,50,000 / year',
        vacancies: 40,
        applications: 110,
        location: 'Pavilion 1, Stall 15',
        notes: 'Immediate joining required.'
      },
      {
        id: 'pmc-203',
        companyId: 'comp-4',
        company: 'HealthPlus Systems Ltd',
        recruiter: 'Divya Iyer',
        position: 'Healthcare Operations & Tech Support',
        qualification: 'Any Degree / B.Com / B.Sc / B.Tech',
        experience: '0-2 Years',
        salary: '₹3,50,000 - ₹5,00,000 / year',
        vacancies: 25,
        applications: 75,
        location: 'Pavilion 2, Stall 04',
        notes: 'Multiple shifts available.'
      },
      {
        id: 'pmc-204',
        companyId: 'comp-foxconn',
        company: 'Foxconn',
        recruiter: 'Arjun Reddy',
        position: 'Electronics Assembly Line Operator',
        qualification: 'ITI / Diploma (ECE/EEE/Mech)',
        experience: 'Fresher',
        salary: '₹19,200 / month',
        vacancies: 80,
        applications: 140,
        location: 'Pavilion 2, Stall 08',
        notes: 'Subsidized hostel and transportation provided.'
      },
      {
        id: 'pmc-205',
        companyId: 'comp-tcs',
        company: 'Tata Consultancy Services',
        recruiter: 'Pooja Sharma',
        position: 'Smart Hiring Trainee (B.Sc / BCA)',
        qualification: 'B.Sc / BCA / B.Voc',
        experience: 'Fresher (2026 Batch)',
        salary: '₹3,50,000 - ₹4,80,000 / year',
        vacancies: 50,
        applications: 160,
        location: 'Pavilion 3, Stall 01',
        notes: 'Direct technical interview.'
      }
    ]
  },
  {
    id: 'mela-3',
    event: 'Hyderabad Healthcare & Biotech Hiring Summit',
    title: 'Hyderabad Healthcare & Biotech Hiring Summit',
    description: 'Specialized healthcare, pharmaceutical, and medical device recruitment drive for graduates and experienced professionals.',
    date: '2026-10-20',
    startTime: '09:30 AM',
    endTime: '05:00 PM',
    time: '09:30 AM - 05:00 PM',
    regStartDate: '2026-09-15',
    regEndDate: '2026-10-18',
    maxCapacity: 2500,
    venue: 'HITEX Exhibition Center, Hitec City, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    location: 'Hyderabad, Telangana',
    organizer: 'Telangana Life Sciences Board',
    companiesCount: 8,
    vacanciesCount: 800,
    status: 'PENDING',
    registeredCandidatesCount: 320,
    createdByAdmin: false,
    participatingCompanies: [
      {
        id: 'pmc-301',
        companyId: 'comp-4',
        company: 'HealthPlus Systems Ltd',
        recruiter: 'Divya Iyer',
        position: 'Biomedical Informatics & Data Analyst',
        qualification: 'B.Pharm / M.Pharm / M.Sc / B.Tech Biotech',
        experience: '1-3 Years',
        salary: '₹5,50,000 - ₹9,00,000 / year',
        vacancies: 20,
        applications: 45,
        location: 'Hall 2, Stall B-05',
        notes: 'Technical panel interview on spot.'
      },
      {
        id: 'pmc-302',
        companyId: 'comp-1',
        company: 'ABC Technologies Pvt Ltd',
        recruiter: 'Arjun Reddy',
        position: 'HealthTech Platform QA Engineer',
        qualification: 'B.Tech / B.E / MCA',
        experience: '2-4 Years',
        salary: '₹8,00,000 - ₹13,00,000 / year',
        vacancies: 15,
        applications: 32,
        location: 'Hall 2, Stall B-08',
        notes: 'Automation testing experience preferred.'
      }
    ]
  }
];

const SEED_REGISTRATIONS = [
  {
    id: 'reg-1',
    candidate: 'Priya Sharma',
    candidateEmail: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    event: 'Bengaluru Mega IT & Cloud Career Expo 2026',
    registrationDate: '2026-08-28',
    status: 'CONFIRMED',
    entryToken: 'TKN-BLR-0042',
  },
  {
    id: 'reg-2',
    candidate: 'Rahul Kumar',
    candidateEmail: 'rahul.kumar@example.com',
    phone: '+91 98123 45678',
    event: 'Bengaluru Mega IT & Cloud Career Expo 2026',
    registrationDate: '2026-08-29',
    status: 'CONFIRMED',
    entryToken: 'TKN-BLR-0043',
  },
  {
    id: 'reg-3',
    candidate: 'Karthik Varma',
    candidateEmail: 'karthik.v@example.com',
    phone: '+91 98440 98765',
    event: 'AP Mega IT & Engineering Job Mela 2026',
    registrationDate: '2026-09-01',
    status: 'CONFIRMED',
    entryToken: 'TKN-VIZ-0012',
  },
  {
    id: 'reg-4',
    candidate: 'Ananya Roy',
    candidateEmail: 'ananya.roy@example.com',
    phone: '+91 97765 11223',
    event: 'Hyderabad Healthcare & Biotech Hiring Summit',
    registrationDate: '2026-09-02',
    status: 'WAITLISTED',
    entryToken: 'TKN-HYD-0008',
  }
];

// ─── 9. SEED REPORTS / COMPLAINTS ─────────────────────────────────────────
const SEED_REPORTS = [
  {
    id: 'rep-1',
    reportType: 'Job Scam / Fee Request',
    reportedEntity: 'Fast Cash Enterprises (Manoj Kumar)',
    reportedUserType: 'RECRUITER',
    reporter: 'Candidate User (Anonymous)',
    reporterEmail: 'cand.verify@example.com',
    date: '2026-08-26',
    status: 'RESOLVED',
    details: 'Recruiter asked for ₹500 registration fee before releasing interview schedule.',
    actionTaken: 'Recruiter account suspended and company blacklisted from platform.',
  },
  {
    id: 'rep-2',
    reportType: 'Misleading Job Description',
    reportedEntity: 'AI Model Trainer (TechGlobal)',
    reportedUserType: 'RECRUITER',
    reporter: 'Sneha Kulkarni',
    reporterEmail: 'sneha.kulkarni@example.com',
    date: '2026-09-01',
    status: 'PENDING',
    details: 'Listed as hybrid engineering job, but actually required door-to-door direct sales.',
    actionTaken: 'Under active moderator review.',
  },
  {
    id: 'rep-3',
    reportType: 'Profile Harassment in Messages',
    reportedEntity: 'Unverified Candidate ID #409',
    reportedUserType: 'CANDIDATE',
    reporter: 'ABC Technologies HR Team',
    reporterEmail: 'careers@abctechnologies.example.com',
    date: '2026-09-03',
    status: 'PENDING',
    details: 'Repeated offensive spam submissions through application portal.',
    actionTaken: 'Awaiting admin disciplinary review.',
  }
];

// ─── 10. SEED AUDIT LOGS ──────────────────────────────────────────────────
const SEED_AUDIT_LOGS = [
  {
    id: 'log-1',
    action: 'Job Approved',
    adminUser: 'Admin User',
    target: 'Senior Frontend Engineer (React / TypeScript)',
    entityType: 'JOB',
    date: '2026-09-04',
    time: '10:32 AM IST',
    result: 'SUCCESS',
    ip: '10.200.45.12',
  },
  {
    id: 'log-2',
    action: 'Company Verified',
    adminUser: 'Admin User',
    target: 'ABC Technologies Pvt Ltd (U72200KA2015PTC078912)',
    entityType: 'COMPANY',
    date: '2026-09-04',
    time: '09:15 AM IST',
    result: 'SUCCESS',
    ip: '10.200.45.12',
  },
  {
    id: 'log-3',
    action: 'Recruiter Suspended',
    adminUser: 'Super Admin',
    target: 'Manoj Kumar (Fast Cash Enterprises)',
    entityType: 'RECRUITER',
    date: '2026-09-03',
    time: '04:45 PM IST',
    result: 'SUCCESS',
    ip: '10.200.45.1',
  },
  {
    id: 'log-4',
    action: 'Job Mela Approved',
    adminUser: 'Super Admin',
    target: 'AP Mega IT & Engineering Job Mela 2026',
    entityType: 'JOB_MELA',
    date: '2026-09-02',
    time: '02:20 PM IST',
    result: 'SUCCESS',
    ip: '10.200.45.1',
  },
  {
    id: 'log-5',
    action: 'Admin System Login',
    adminUser: 'Admin User',
    target: 'Admin Control Panel Dashboard',
    entityType: 'AUTH',
    date: '2026-09-04',
    time: '08:00 AM IST',
    result: 'SUCCESS',
    ip: '10.200.45.12',
  }
];

// ─── 11. SEED NOTIFICATIONS ───────────────────────────────────────────────
const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Recruiter Verification Request',
    message: 'Rahul Mehta (Fintech Corp India Pvt Ltd) submitted verification documents.',
    time: '15 mins ago',
    unread: true,
    link: '/admin/recruiter-verification',
    category: 'APPROVAL',
  },
  {
    id: 'notif-2',
    title: 'Pending Job Posting Review',
    message: 'Clinical Data Pipeline Lead by HealthPlus Systems Ltd requires approval.',
    time: '1 hour ago',
    unread: true,
    link: '/admin/job-approvals',
    category: 'APPROVAL',
  },
  {
    id: 'notif-3',
    title: 'Urgent Moderation Report Filed',
    message: 'A candidate submitted a complaint regarding misleading job description.',
    time: '3 hours ago',
    unread: true,
    link: '/admin/reports',
    category: 'MODERATION',
  },
  {
    id: 'notif-4',
    title: 'Job Mela Registration Milestone',
    message: 'Bengaluru Mega IT Career Expo has crossed 1,400 registered candidates.',
    time: '1 day ago',
    unread: false,
    link: '/admin/job-melas',
    category: 'EVENT',
  }
];

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
    { id: 'stat-1', label: 'Active Jobs', value: '52,480+', icon: 'Briefcase' },
    { id: 'stat-2', label: 'Verified Companies', value: '14,200+', icon: 'Building2' },
    { id: 'stat-3', label: 'Registered Candidates', value: '2,80,000+', icon: 'Users' },
    { id: 'stat-4', label: 'Successful Placements', value: '1,95,000+', icon: 'TrendingUp' },
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
    images: [
      {
        id: 'img-1',
        title: 'Mega Job Mela Vijayawada 2026',
        category: 'Job Melas',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        date: '15 Sep 2026',
        description: 'Over 120 recruiters and 4,500+ candidates attended the grand employment summit in Vijayawada.'
      },
      {
        id: 'img-2',
        title: 'Advanced Skill Training Lab',
        category: 'Skill Training',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
        date: '08 Sep 2026',
        description: 'Enrolled students engaging in practical simulated software engineering and web development modules.'
      },
      {
        id: 'img-3',
        title: 'Spot Offer Letter Distribution Ceremony',
        category: 'Placements',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
        date: '28 Aug 2026',
        description: 'Selected candidates receiving immediate appointment orders from attending enterprise hiring teams.'
      },
      {
        id: 'img-4',
        title: 'Corporate HR & Recruiter Summit',
        category: 'Conferences',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
        date: '18 Aug 2026',
        description: 'Industry leaders discussing youth employability, tech apprenticeships, and regional hiring targets.'
      },
      {
        id: 'img-5',
        title: 'Candidate Counselling & Guidance Booth',
        category: 'Job Melas',
        imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
        date: '02 Aug 2026',
        description: 'Free resume evaluation, soft-skill mock interviews, and career counseling for rural youth.'
      },
      {
        id: 'img-6',
        title: 'Women in Tech Empowerment Program',
        category: 'Skill Training',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
        date: '20 Jul 2026',
        description: 'Empowering women engineers and technicians with cloud computing and AI certification courses.'
      }
    ],
    videos: [
      {
        id: 'vid-1',
        title: 'Mega Job Mela Vijayawada Highlights & Walk-in Drives',
        youtubeUrl: 'https://www.youtube.com/watch?v=kYI_t91Z6oA',
        category: 'Job Melas',
        date: '16 Sep 2026',
        description: 'Watch the energetic atmosphere, recruiter interviews, and joyful candidate reactions at our mega recruitment drive.'
      },
      {
        id: 'vid-2',
        title: 'Candidate Success Journey & Spot Offer Letters — NTR VIKASA',
        youtubeUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        category: 'Placements',
        date: '05 Sep 2026',
        description: 'Hear from our alumni who transitioned from college freshers to placed professionals in top corporations.'
      },
      {
        id: 'vid-3',
        title: 'Skill Development Labs & Practical Industry Training Batch',
        youtubeUrl: 'https://www.youtube.com/watch?v=tgbNymZ7vqY',
        category: 'Skill Training',
        date: '22 Aug 2026',
        description: 'Hands-on training, expert mentor guidance, and real-world project development at our modern center.'
      }
    ]
  },
  newsArticles: {
    badge: 'In The Media & Press',
    heading1: 'Official Newspaper &',
    heading2: 'Press Highlights',
    subtitle: 'Read authentic press coverage, newspaper clippings, and administrative reports of NTR VIKASA Mega Job Melas across Andhra Pradesh.',
    articles: [
      {
        id: 'news-1',
        newspaper: 'Sakshi',
        title: 'జాబ్‌మేళాలో 68 మందికి ఉద్యోగాలు',
        date: '08 Feb 2026',
        edition: 'Tiruvuru Edition | Page 9',
        imageUrl: '/news/news-sakshi-job-mela.png',
        sourceUrl: 'https://epaper.sakshi.com/',
        summary: 'ఆంధ్రప్రదేశ్ రాష్ట్ర నైపుణ్యాభివృద్ధి సంస్థ ఆధ్వర్యంలో జిల్లాలోని నిరుద్యోగ యువతకు గుంటుపల్లిలో నిర్వహించిన జాబ్ మేళాలో 68 మందికి ఉద్యోగాలు లభించాయి. జిల్లా కలెక్టర్ జి. లక్ష్మీశ స్వయంగా నియామక పత్రాలు అందజేశారు.'
      },
      {
        id: 'news-2',
        newspaper: 'Eenadu',
        title: '18న ప్రత్యేక ఉద్యోగ మేళా',
        date: '14 Feb 2026',
        edition: 'Andhra Pradesh State Edition',
        imageUrl: '/news/news-eenadu-job-mela.png',
        sourceUrl: 'https://epaper.eenadu.net/',
        summary: 'కరెన్సీనగర్: రూరల్ ఇంక్యుబేషన్ స్కిల్లింగ్ అండ్ ఎంట్రప్రెన్యూర్ సెంటర్ (రైజ్), ఏపీఎస్ఎస్డీసీ, ఎన్టీఆర్ వికాస, జిల్లా ఉపాధి కల్పన శాఖ సంయుక్తంగా నిర్వహించనున్న ప్రత్యేక డ్రైవ్.'
      },
      {
        id: 'news-3',
        newspaper: 'Special Press Bulletin',
        title: 'గుంటుపల్లిలో “రైజ్” ఆధ్వర్యంలో ఎన్టీఆర్ వికాస జాబ్ మేళా — యువత సద్వినియోగం చేసుకోవాలి',
        date: '07 Feb 2026',
        edition: 'Ibrahimpatnam - Udayatara',
        imageUrl: '/news/news-rise-job-mela.png',
        sourceUrl: 'https://naipunyam.ap.gov.in/',
        summary: 'ఎన్టీఆర్ వికాస జాబ్ మేళా ద్వారా నిరుద్యోగ యువతకు 10కి పైగా ప్రముఖ కంపెనీలలో నెలకు రూ.12,000 నుండి రూ.35,000 వరకు వేతనంతో ఉద్యోగ అవకాశాలు.'
      },
      {
        id: 'news-4',
        newspaper: 'Suryaa',
        title: 'ఎన్టీఆర్ వికాస జాబ్ మేళా నిర్వహణ విజయవంతం',
        date: '08 Feb 2026',
        edition: 'Major News | Page 2',
        imageUrl: '/news/news-surya-job-mela.png',
        sourceUrl: 'https://www.suryaa.com/',
        summary: 'విజయవాడ: గుంటుపల్లిలో నిర్వహించిన జాబ్ మేళాలో 91 మంది హాజరు కాగా 68 మంది అభ్యర్థులకు ప్రైవేట్ కంపెనీలలో ఉద్యోగాలు లభించాయి, 14 మంది షార్ట్‌లిస్ట్ అయ్యారు. కలెక్టర్ డా. జి.లక్ష్మీశ ప్రశంసలు.'
      }
    ]
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
    { id: 'ab-stat-1', label: 'Registered Job Seekers', value: '2,80,000+', color: 'var(--color-primary-600)' },
    { id: 'ab-stat-2', label: 'Confirmed Placements', value: '1,95,000+', color: 'var(--color-success-600)' },
    { id: 'ab-stat-3', label: 'Verified Hiring Employers', value: '14,200+', color: 'var(--color-warning-600)' },
    { id: 'ab-stat-4', label: 'State-Wide Job Melas Held', value: '24+', color: 'var(--color-info-600)' },
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
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].qualificationLevel) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return SEED_CANDIDATES;
  });

  const [recruiters, setRecruiters] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_recruiters_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_RECRUITERS;
  });

  const [companies, setCompanies] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_companies_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [jobs, setJobs] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_jobs_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_JOBS;
  });

  const [internships, setInternships] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_internships_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_INTERNSHIPS;
  });

  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_applications_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_APPLICATIONS;
  });

  const [jobMelas, setJobMelas] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_job_melas_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_JOB_MELAS;
  });

  const [registrations, setRegistrations] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_registrations_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_REGISTRATIONS;
  });

  const [reports, setReports] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_reports_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_audit_logs_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_notifications_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_NOTIFICATIONS;
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
        const [jobsRes, internshipsRes, companiesRes, melasRes, requestsRes, recruitersRes, candidatesRes, photosRes, videosRes, pressRes] = await Promise.allSettled([
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
        ]);

        if (!isMounted) return;

        if (recruitersRes.status === 'fulfilled' && recruitersRes.value) {
          const rawRecs = Array.isArray(recruitersRes.value)
            ? recruitersRes.value
            : (recruitersRes.value.items || []);
          if (rawRecs.length > 0) {
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
            setRecruiters(prev => {
              const liveKeys = new Set(mappedRecs.map(mr => mr.id));
              const retained = prev.filter(p => !liveKeys.has(p.id));
              return [...mappedRecs, ...retained];
            });
          }
        }

        if (candidatesRes.status === 'fulfilled' && candidatesRes.value) {
          const rawCands = Array.isArray(candidatesRes.value)
            ? candidatesRes.value
            : (candidatesRes.value.items || []);
          if (rawCands.length > 0) {
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
            setCandidates(prev => {
              const liveKeys = new Set(mappedCands.map(mc => mc.id));
              const retained = prev.filter(p => !liveKeys.has(p.id));
              return [...mappedCands, ...retained];
            });
          }
        }

        if (jobsRes.status === 'fulfilled' && jobsRes.value?.items?.length) {
          const mappedJobs = jobsRes.value.items.map(j => ({
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
          setJobs(prev => {
            const liveKeys = new Set(mappedJobs.map(mj => mj.id));
            const retained = prev.filter(p => !liveKeys.has(p.id) && !liveKeys.has(p.job_id));
            return [...mappedJobs, ...retained];
          });
        }

        if (internshipsRes.status === 'fulfilled' && internshipsRes.value?.items?.length) {
          const mappedInterns = internshipsRes.value.items.map(i => ({
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
          setInternships(prev => {
            const liveKeys = new Set(mappedInterns.map(mi => mi.id));
            const retained = prev.filter(p => !liveKeys.has(p.id) && !liveKeys.has(p.internship_number));
            return [...mappedInterns, ...retained];
          });
        }

        const rawComps = Array.isArray(companiesRes.value)
          ? companiesRes.value
          : (companiesRes.value?.items || []);
        if (companiesRes.status === 'fulfilled' && rawComps.length) {
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

        if (melasRes.status === 'fulfilled' && Array.isArray(melasRes.value) && melasRes.value.length) {
          const mappedMelas = melasRes.value.map(m => ({
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

          setJobMelas(prev => {
            const liveKeys = new Set(mappedMelas.map(mm => mm.id));
            const retained = prev.filter(p => !liveKeys.has(p.id));
            return [...mappedMelas, ...retained];
          });
        }

        if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value) && requestsRes.value.length) {
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

          setJobMelas(prev => {
            const reqKeys = new Set(mappedRequests.map(mr => mr.id));
            const retained = prev.filter(p => !reqKeys.has(p.id));
            return [...mappedRequests, ...retained];
          });
        }

        if (photosRes.status === 'fulfilled' && Array.isArray(photosRes.value) && photosRes.value.length > 0) {
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

        if (videosRes.status === 'fulfilled' && Array.isArray(videosRes.value) && videosRes.value.length > 0) {
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

        if (pressRes.status === 'fulfilled' && Array.isArray(pressRes.value) && pressRes.value.length > 0) {
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
      id: `news-${Date.now()}`,
      newspaper: article.newspaper || 'Daily News',
      title: article.title || 'Untitled Article',
      date: article.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      edition: article.edition || '',
      imageUrl: article.imageUrl || '',
      sourceUrl: article.sourceUrl || '',
      summary: article.summary || '',
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
      return updated;
    });
    addAuditLog('Jobs Page Content Updated', 'Public Jobs Page Hero & Search CMS', 'SETTINGS');
  };

  const resetJobsPageContent = () => {
    setJobsPageContent(DEFAULT_JOBS_PAGE_CONTENT);
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
      return updated;
    });
    addAuditLog('Skill Development Page Content Updated', 'Public Skill Development CMS', 'SETTINGS');
  };

  const resetSkillPageContent = () => {
    setSkillPageContent(DEFAULT_SKILL_PAGE_CONTENT);
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
