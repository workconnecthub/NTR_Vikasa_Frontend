/**
 * NotificationContext — Shared notification store for all portals.
 * Provides unread counts, notification list, mark-read, and dismiss.
 * Ready for API integration: replace mock data with real fetch calls.
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import candidateNotificationService from '../services/candidateNotificationService';

const NotificationContext = createContext(null);

// ─── Category icons / labels ──────────────────────────────────────────────
export const NOTIF_CATEGORY = {
  APPLICATION:  { label: 'Application',    color: '#3b82f6', bg: '#eff6ff' },
  SHORTLIST:    { label: 'Shortlisted',     color: '#10b981', bg: '#f0fdf4' },
  INTERVIEW:    { label: 'Interview',       color: '#8b5cf6', bg: '#f5f3ff' },
  OFFER:        { label: 'Offer',           color: '#f59e0b', bg: '#fffbeb' },
  REJECTION:    { label: 'Rejection',       color: '#ef4444', bg: '#fef2f2' },
  JOB_MELA:     { label: 'Job Mela',        color: '#ec4899', bg: '#fdf2f8' },
  JOB_APPROVAL: { label: 'Job Approval',    color: '#10b981', bg: '#f0fdf4' },
  ACCOUNT:      { label: 'Account',         color: '#6b7280', bg: '#f9fafb' },
  SYSTEM:       { label: 'System',          color: '#6366f1', bg: '#eef2ff' },
  SUPPORT:      { label: 'Support',         color: '#0284c7', bg: '#e0f2fe' },
  RECRUITER:    { label: 'Recruiter',       color: '#d97706', bg: '#fffbeb' },
  COMPANY:      { label: 'Company',         color: '#0284c7', bg: '#e0f2fe' },
  VERIFICATION: { label: 'Verification',    color: '#059669', bg: '#ecfdf5' },
  TEAM:         { label: 'Team',            color: '#7c3aed', bg: '#f5f3ff' },
  REPORT:       { label: 'Report',          color: '#dc2626', bg: '#fef2f2' },
  SECURITY:     { label: 'Security',        color: '#b91c1c', bg: '#fff1f2' },

  // Lowercase / backend aliases
  shortlisted:  { label: 'Shortlisted',     color: '#10b981', bg: '#f0fdf4' },
  shortlist:    { label: 'Shortlisted',     color: '#10b981', bg: '#f0fdf4' },
  interview:    { label: 'Interview',       color: '#8b5cf6', bg: '#f5f3ff' },
  application:  { label: 'Application',    color: '#3b82f6', bg: '#eff6ff' },
  job_mela:     { label: 'Job Mela',        color: '#ec4899', bg: '#fdf2f8' },
  offer:        { label: 'Offer',           color: '#f59e0b', bg: '#fffbeb' },
  rejection:    { label: 'Rejection',       color: '#ef4444', bg: '#fef2f2' },
  account:      { label: 'Account',         color: '#6b7280', bg: '#f9fafb' },
  support:      { label: 'Support',         color: '#0284c7', bg: '#e0f2fe' },
};

// ─── Portal-specific mock notification sets ────────────────────────────────
const CANDIDATE_NOTIFS = [
  {
    id: 'cn-1',
    category: 'SHORTLIST',
    title: 'Application Shortlisted: Senior Python Developer',
    message: 'TechCorp India has shortlisted your application (Application No: APP-000124) for Senior Python Developer. The recruiter may contact you soon for interview scheduling.',
    time: '15 mins ago',
    read: false,
    link: '/candidate/applications',
    meta: {
      appNumber: 'APP-000124',
      company: 'TechCorp India',
      role: 'Senior Python Developer',
      status: 'Shortlisted',
      applicationType: 'Direct Job Application',
    }
  },
  {
    id: 'cn-2',
    category: 'INTERVIEW',
    title: 'Interview Scheduled: Technical Round 1 with Infosys Digital',
    message: 'Infosys Digital scheduled your Technical Round 1 for Senior React Developer on 10 Sept 2026, 11:00 AM - 12:00 PM IST via Google Meet.',
    time: '45 mins ago',
    read: false,
    link: '/candidate/interviews',
    meta: {
      company: 'Infosys Digital',
      role: 'Senior React Developer',
      date: '10 Sept 2026',
      time: '11:00 AM - 12:00 PM',
      format: 'Google Meet',
      meetingUrl: 'https://meet.google.com/ntr-vikasa-interview',
    }
  },
  {
    id: 'cn-3',
    category: 'APPLICATION',
    title: 'Application Submitted: Design Systems Engineer',
    message: 'Your application for Design Systems Engineer at Flipkart AP Tech Hub has been submitted successfully (Application No: APP-000004). Status: Applied.',
    time: '2 hours ago',
    read: false,
    link: '/candidate/applications',
    meta: {
      appNumber: 'APP-000004',
      company: 'Flipkart AP Tech Hub',
      role: 'Design Systems Engineer',
      status: 'Applied',
      applicationType: 'Direct Job Application',
    }
  },
  {
    id: 'cn-4',
    category: 'JOB_MELA',
    title: 'Job Mela Shortlist: Graduate Trainee Engineer',
    message: 'AP Mega IT & ITES Job Mela 2026: TechCorp India shortlisted your Job Mela application (Job Mela Application No: NTR-01-02-0024) for spot interview at the event.',
    time: '4 hours ago',
    read: false,
    link: '/candidate/applications',
    meta: {
      appNumber: 'NTR-01-02-0024',
      melaTitle: 'AP Mega IT & ITES Job Mela 2026',
      company: 'TechCorp India',
      role: 'Graduate Trainee Engineer',
      status: 'Shortlisted for Spot Interview',
      applicationType: 'Job Mela Application',
    }
  },
  {
    id: 'cn-5',
    category: 'INTERVIEW',
    title: 'Interview Reminder: Technical Round 1 in 2 Hours',
    message: 'Reminder: Your online technical interview with Infosys Digital for Senior React Developer starts at 11:00 AM IST today via Google Meet. Please join 10 minutes prior.',
    time: '5 hours ago',
    read: false,
    link: '/candidate/interviews',
    meta: {
      company: 'Infosys Digital',
      role: 'Senior React Developer',
      time: '11:00 AM IST',
      format: 'Google Meet',
    }
  },
  {
    id: 'cn-6',
    category: 'JOB_MELA',
    title: 'Job Mela Entry Pass Confirmed: PASS-AP-849201',
    message: 'Your Fast-Track QR pass for AP Mega IT & ITES Job Mela 2026 is confirmed. Event Date: 28 Sept 2026. Venue: AU Convention Center, Beach Road, Visakhapatnam. Gate 3 opens at 9:00 AM.',
    time: '1 day ago',
    read: true,
    link: '/candidate/job-melas',
    meta: {
      passId: 'PASS-AP-849201',
      melaTitle: 'AP Mega IT & ITES Job Mela 2026',
      date: '28 Sept 2026',
      venue: 'AU Convention Center, Visakhapatnam',
    }
  },
  {
    id: 'cn-7',
    category: 'APPLICATION',
    title: 'Application Status Update: Frontend UI Architect',
    message: 'Your application (Application No: APP-000003) for Frontend UI Architect at Wipro Cloud Services has moved to Screening stage review.',
    time: '1 day ago',
    read: true,
    link: '/candidate/applications',
    meta: {
      appNumber: 'APP-000003',
      company: 'Wipro Cloud Services',
      role: 'Frontend UI Architect',
      status: 'Screening',
      applicationType: 'Direct Job Application',
    }
  },
  {
    id: 'cn-8',
    category: 'OFFER',
    title: 'Congratulations! Selected by TCS Innovation 🎉',
    message: 'You have been selected for Frontend Developer (React) at TCS Innovation (Application No: APP-000005) following successful completion of all interview rounds.',
    time: '2 days ago',
    read: true,
    link: '/candidate/applications',
    meta: {
      appNumber: 'APP-000005',
      company: 'TCS Innovation',
      role: 'Frontend Developer (React)',
      status: 'Selected',
      applicationType: 'Direct Job Application',
    }
  },
  {
    id: 'cn-9',
    category: 'REJECTION',
    title: 'Application Update: Capgemini India',
    message: 'Capgemini India has concluded review for Senior JavaScript Engineer (Application No: APP-000006) and decided not to move forward at this time.',
    time: '3 days ago',
    read: true,
    link: '/candidate/applications',
    meta: {
      appNumber: 'APP-000006',
      company: 'Capgemini India',
      role: 'Senior JavaScript Engineer',
      status: 'Rejected',
      applicationType: 'Direct Job Application',
    }
  },
  {
    id: 'cn-10',
    category: 'ACCOUNT',
    title: 'Resume Updated: Vyshnavi_Resume.pdf',
    message: 'Your active resume "Vyshnavi_Resume.pdf" was updated successfully. Recruiters downloading your profile will now receive this newest document.',
    time: '3 days ago',
    read: true,
    link: '/candidate/resume',
  },
  {
    id: 'cn-11',
    category: 'ACCOUNT',
    title: 'Profile Strength Reminder: 80% Complete',
    message: 'Add your latest project repository links to reach 100% profile strength and get 2x recruiter visibility across the Andhra Pradesh talent pool.',
    time: '4 days ago',
    read: true,
    link: '/candidate/profile',
  },
  {
    id: 'cn-12',
    category: 'ACCOUNT',
    title: 'Security Alert: Password Updated',
    message: 'Your candidate account password was updated securely. If you did not make this change, please contact candidate support immediately.',
    time: '5 days ago',
    read: true,
    link: '/candidate/settings',
  },
  {
    id: 'cn-13',
    category: 'SUPPORT',
    title: 'Support Ticket #732104 Resolved',
    message: 'Your support ticket regarding "Interview Scheduling & Links" has been resolved by the candidate support desk.',
    time: '6 days ago',
    read: true,
    link: '/candidate/help-support',
    meta: {
      ticketId: '732104',
      status: 'Resolved',
    }
  },
];

const RECRUITER_NOTIFS = [
  {
    id: 'rn-1',
    category: 'APPLICATION',
    title: 'New Application: Priya Sharma (94% match)',
    message: 'Priya Sharma submitted an application (Application No: APP-000124) for Senior Frontend Engineer (React / TypeScript). 4 years React experience.',
    time: '20 mins ago',
    read: false,
    link: '/recruiter/jobs/job-101/applicants',
    meta: {
      candidateName: 'Priya Sharma',
      role: 'Senior Frontend Engineer (React / TypeScript)',
      company: 'ABC Technologies Pvt Ltd',
      appNumber: 'APP-000124',
      status: 'Applied',
    }
  },
  {
    id: 'rn-2',
    category: 'JOB_MELA',
    title: 'Job Mela Applicant: Vikram Rao (NTR-01-02-0024)',
    message: 'Vikram Rao registered for spot interview in AP Mega IT & ITES Job Mela 2026 for Graduate Trainee Engineer (Stall Booth B-14).',
    time: '45 mins ago',
    read: false,
    link: '/recruiter/job-melas',
    meta: {
      candidateName: 'Vikram Rao',
      melaTitle: 'AP Mega IT & ITES Job Mela 2026',
      role: 'Graduate Trainee Engineer',
      appNumber: 'NTR-01-02-0024',
      company: 'ABC Technologies Pvt Ltd',
      status: 'Spot Interview Queue',
    }
  },
  {
    id: 'rn-3',
    category: 'INTERVIEW',
    title: 'Technical Round 1 Scheduled: Amitav Ghosh',
    message: 'Technical Round 1 scheduled with Amitav Ghosh for Senior Frontend Engineer on 28 Aug 2026 at 3:00 PM IST via Google Meet. Interviewer: Arjun Reddy.',
    time: '2 hours ago',
    read: false,
    link: '/recruiter/interviews',
    meta: {
      candidateName: 'Amitav Ghosh',
      role: 'Senior Frontend Engineer (React / TypeScript)',
      date: '28 Aug 2026',
      time: '3:00 PM IST',
      format: 'Google Meet',
      interviewer: 'Arjun Reddy',
    }
  },
  {
    id: 'rn-4',
    category: 'INTERVIEW',
    title: 'Interview Feedback Required: Ananya Patel',
    message: 'Technical interview with Ananya Patel for Senior Python & Cloud Backend Developer concluded. Please submit candidate score and interview feedback.',
    time: '3 hours ago',
    read: false,
    link: '/recruiter/interviews',
    meta: {
      candidateName: 'Ananya Patel',
      role: 'Senior Python & Cloud Backend Developer',
      status: 'Feedback Pending',
    }
  },
  {
    id: 'rn-5',
    category: 'JOB_APPROVAL',
    title: 'Job Posting Approved: Senior Frontend Engineer',
    message: '"Senior Frontend Engineer (React / TypeScript)" has been approved by NTR Vikasa Admin and is now live on the public candidate job board.',
    time: '4 hours ago',
    read: false,
    link: '/recruiter/jobs',
    meta: {
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      status: 'PUBLISHED',
      company: 'ABC Technologies Pvt Ltd',
    }
  },
  {
    id: 'rn-6',
    category: 'REJECTION',
    title: 'Job Requires Correction: DevOps & Cloud Specialist',
    message: 'Admin flagged "DevOps & Cloud Infrastructure Specialist": Please update salary band disclosure to comply with state transparency guidelines before approval.',
    time: '5 hours ago',
    read: false,
    link: '/recruiter/jobs',
    meta: {
      jobTitle: 'DevOps & Cloud Infrastructure Specialist',
      status: 'CHANGES_REQUESTED',
      company: 'ABC Technologies Pvt Ltd',
    }
  },
  {
    id: 'rn-7',
    category: 'SHORTLIST',
    title: 'Candidate Shortlisted: Kavita Nair',
    message: 'Kavita Nair was shortlisted for Senior Python & Cloud Backend Developer (Application No: APP-000108). Available for interview scheduling.',
    time: '1 day ago',
    read: true,
    link: '/recruiter/candidates',
    meta: {
      candidateName: 'Kavita Nair',
      role: 'Senior Python & Cloud Backend Developer',
      appNumber: 'APP-000108',
      company: 'ABC Technologies Pvt Ltd',
      status: 'Shortlisted',
    }
  },
  {
    id: 'rn-8',
    category: 'JOB_APPROVAL',
    title: 'Internship Approved: Cloud Native Engineering Intern',
    message: '"Cloud Native Engineering Intern (6 Months)" approved by Admin and open for university student applications across Andhra Pradesh.',
    time: '1 day ago',
    read: true,
    link: '/recruiter/internships',
    meta: {
      internshipTitle: 'Cloud Native Engineering Intern (6 Months)',
      status: 'PUBLISHED',
      company: 'ABC Technologies Pvt Ltd',
    }
  },
  {
    id: 'rn-9',
    category: 'APPLICATION',
    title: 'Internship Application: Sneha Reddy',
    message: 'Sneha Reddy applied for AI / ML Research Intern (Application No: APP-000142). Final year B.Tech Computer Science student.',
    time: '1 day ago',
    read: true,
    link: '/recruiter/internships',
    meta: {
      candidateName: 'Sneha Reddy',
      role: 'AI / ML Research Intern',
      appNumber: 'APP-000142',
      status: 'Applied',
    }
  },
  {
    id: 'rn-10',
    category: 'VERIFICATION',
    title: 'Company Verification Approved: ABC Technologies',
    message: 'ABC Technologies Pvt Ltd has been verified by NTR Vikasa Admin. Verified Recruiter Badge is now active on all job postings.',
    time: '2 days ago',
    read: true,
    link: '/recruiter/company',
    meta: {
      company: 'ABC Technologies Pvt Ltd',
      cin: 'U72200KA2015PTC078912',
      gstin: '29ABCDE1234F1Z5',
      status: 'Verified',
    }
  },
  {
    id: 'rn-11',
    category: 'VERIFICATION',
    title: 'Recruiter Profile Verified: Arjun Reddy',
    message: 'Identity & corporate authorization verification approved for Arjun Reddy, Director of Talent Acquisition.',
    time: '2 days ago',
    read: true,
    link: '/recruiter/settings',
    meta: {
      recruiterName: 'Arjun Reddy',
      designation: 'Director of Talent Acquisition',
      status: 'Verified',
    }
  },
  {
    id: 'rn-12',
    category: 'JOB_MELA',
    title: 'Stall Allocated: Booth B-14, Hall 3',
    message: 'Your participation request for AP Mega IT & ITES Job Mela 2026 is confirmed. Stall Booth B-14, Hall 3 allocated with 3 recruiter desks.',
    time: '3 days ago',
    read: true,
    link: '/recruiter/job-melas',
    meta: {
      melaTitle: 'AP Mega IT & ITES Job Mela 2026',
      booth: 'Booth B-14, Hall 3',
      status: 'Confirmed',
    }
  },
  {
    id: 'rn-13',
    category: 'OFFER',
    title: 'Candidate Selected: Rahul Varma 🎉',
    message: 'Candidate Rahul Varma was marked as Selected for Senior Frontend Engineer (React / TypeScript) following final partner round.',
    time: '3 days ago',
    read: true,
    link: '/recruiter/candidates',
    meta: {
      candidateName: 'Rahul Varma',
      role: 'Senior Frontend Engineer (React / TypeScript)',
      status: 'Selected',
      appNumber: 'APP-000098',
    }
  },
  {
    id: 'rn-14',
    category: 'TEAM',
    title: 'Hiring Team: Pooja Hegde Accepted Invite',
    message: 'Pooja Hegde accepted your hiring team invitation and joined ABC Technologies talent acquisition team as Technical Recruiter.',
    time: '4 days ago',
    read: true,
    link: '/recruiter/settings',
    meta: {
      memberName: 'Pooja Hegde',
      role: 'Technical Recruiter',
      status: 'Active',
    }
  },
  {
    id: 'rn-15',
    category: 'SUPPORT',
    title: 'Support Ticket #921405: Reply Received',
    message: 'Portal Helpdesk replied: "Stall extra electrical line request for Booth B-14 has been approved and provisioned with the venue coordinators."',
    time: '4 days ago',
    read: true,
    link: '/recruiter/help-support',
    meta: {
      ticketId: '921405',
      subject: 'Job Mela Interview Slot Allocation',
      status: 'In Progress',
    }
  },
  {
    id: 'rn-16',
    category: 'ACCOUNT',
    title: 'Security Alert: Password Changed',
    message: 'Your recruiter portal login credentials were updated successfully. If this was not initiated by you, please contact security support immediately.',
    time: '5 days ago',
    read: true,
    link: '/recruiter/settings',
    meta: {
      account: 'recruiter1@ntrvikasa.com',
      action: 'Password Update',
    }
  },
  {
    id: 'rn-17',
    category: 'SYSTEM',
    title: 'Job Posting Closed: Database Administrator',
    message: '"Associate Database Administrator" reached its submission deadline and has been automatically closed for new applications.',
    time: '6 days ago',
    read: true,
    link: '/recruiter/jobs',
    meta: {
      jobTitle: 'Associate Database Administrator',
      status: 'CLOSED',
    }
  },
];

const ADMIN_NOTIFS = [
  {
    id: 'an-1',
    category: 'VERIFICATION',
    priority: 'IMPORTANT',
    title: 'Recruiter Verification Pending: Rahul Mehta',
    message: 'Rahul Mehta from Fintech Corp India Pvt Ltd submitted verification documents (COI, GSTIN, Official Work Email). Awaiting admin KYC moderation.',
    time: '25 mins ago',
    read: false,
    link: '/admin/recruiters/requests',
    meta: {
      recruiterName: 'Rahul Mehta',
      company: 'Fintech Corp India Pvt Ltd',
      status: 'PENDING',
      documents: ['Certificate of Incorporation', 'Company GSTIN', 'Official Work Email'],
      submissionDate: '2026-09-01',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-2',
    category: 'COMPANY',
    priority: 'IMPORTANT',
    title: 'Company Verification Pending: HealthPlus Systems Ltd',
    message: 'HealthPlus Systems Ltd submitted CIN Certificate and Board Authorization. Review required to activate corporate recruitment privileges.',
    time: '45 mins ago',
    read: false,
    link: '/admin/companies/requests',
    meta: {
      company: 'HealthPlus Systems Ltd',
      cin: 'U85110KA2021PTC456789',
      status: 'PENDING',
      documents: ['CIN Certificate', 'Official Board ID'],
      submissionDate: '2026-09-02',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-3',
    category: 'RECRUITER',
    priority: 'NORMAL',
    title: 'New Recruiter Registered: Divya Iyer',
    message: 'Divya Iyer registered as Senior HR Talent Manager for HealthPlus Systems Ltd. Verification documents uploaded.',
    time: '2 hours ago',
    read: true,
    link: '/admin/recruiters/requests',
    meta: {
      recruiterName: 'Divya Iyer',
      company: 'HealthPlus Systems Ltd',
      status: 'PENDING',
      priority: 'NORMAL',
    }
  },
  {
    id: 'an-4',
    category: 'COMPANY',
    priority: 'NORMAL',
    title: 'New Company Registration: NextGen Autonomous Robotics',
    message: 'NextGen Autonomous Robotics (Visakhapatnam, AP) registered with CIN U29300AP2022PTC112233. Awaiting document submission.',
    time: '1 day ago',
    read: true,
    link: '/admin/companies',
    meta: {
      company: 'NextGen Autonomous Robotics',
      location: 'Visakhapatnam, AP',
      status: 'PENDING',
      priority: 'NORMAL',
    }
  },
  {
    id: 'an-5',
    category: 'JOB_APPROVAL',
    priority: 'IMPORTANT',
    title: 'Job Approval Pending: AI / ML Engineer',
    message: 'ABC Technologies Pvt Ltd submitted "AI / ML Engineer — Computer Vision & NLP" (₹18,00,000 - ₹26,00,000 / year) for state job board approval.',
    time: '1 hour ago',
    read: false,
    link: '/admin/jobs/requests',
    meta: {
      jobTitle: 'AI / ML Engineer — Computer Vision & NLP',
      company: 'ABC Technologies Pvt Ltd',
      submissionDate: '2026-08-24',
      salary: '₹18,00,000 - ₹26,00,000 / year',
      status: 'PENDING',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-6',
    category: 'JOB_APPROVAL',
    priority: 'IMPORTANT',
    title: 'Job Resubmitted: Senior Blockchain & Solidity Engineer',
    message: 'Fintech Corp India Pvt Ltd resubmitted "Senior Blockchain & Solidity Engineer" with updated regulatory compliance and salary disclosure.',
    time: '3 hours ago',
    read: false,
    link: '/admin/jobs/requests',
    meta: {
      jobTitle: 'Senior Blockchain & Solidity Engineer',
      company: 'Fintech Corp India Pvt Ltd',
      submissionDate: '2026-09-02',
      status: 'PENDING',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-7',
    category: 'JOB_APPROVAL',
    priority: 'NORMAL',
    title: 'Job Moderation Required: Clinical Data Pipeline Lead',
    message: 'HealthPlus Systems Ltd posted "Clinical Data Pipeline Lead". Review required before public listing on candidate portal.',
    time: '1 day ago',
    read: true,
    link: '/admin/jobs/requests',
    meta: {
      jobTitle: 'Clinical Data Pipeline Lead',
      company: 'HealthPlus Systems Ltd',
      submissionDate: '2026-09-03',
      status: 'PENDING',
      priority: 'NORMAL',
    }
  },
  {
    id: 'an-8',
    category: 'JOB_APPROVAL',
    priority: 'IMPORTANT',
    title: 'Internship Approval Pending: AI & Data Science Intern',
    message: 'ABC Technologies Pvt Ltd submitted a 6-month internship program (₹28,00,000 / month, 2 openings) for university candidates across AP.',
    time: '2 hours ago',
    read: false,
    link: '/admin/internships/requests',
    meta: {
      title: 'AI & Data Science Engineering Intern',
      company: 'ABC Technologies Pvt Ltd',
      duration: '6 Months',
      submissionDate: '2026-08-25',
      status: 'PENDING',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-9',
    category: 'JOB_APPROVAL',
    priority: 'NORMAL',
    title: 'Internship Moderation Pending: Smart Medical Devices Intern',
    message: 'HealthPlus Systems Ltd submitted "Smart Medical Devices Firmware Intern" (3 Months, ₹20,000 / month) for moderation.',
    time: '2 days ago',
    read: true,
    link: '/admin/internships/requests',
    meta: {
      title: 'Smart Medical Devices Firmware Intern',
      company: 'HealthPlus Systems Ltd',
      duration: '3 Months',
      submissionDate: '2026-09-02',
      status: 'PENDING',
      priority: 'NORMAL',
    }
  },
  {
    id: 'an-10',
    category: 'JOB_MELA',
    priority: 'IMPORTANT',
    title: 'Job Mela Request Submitted: Hyderabad Healthcare Summit',
    message: 'Telangana Life Sciences Board submitted "Hyderabad Healthcare & Biotech Hiring Summit" scheduled for 20 Oct 2026 at HITEX Center. 800 vacancies.',
    time: '4 hours ago',
    read: false,
    link: '/admin/job-melas',
    meta: {
      eventName: 'Hyderabad Healthcare & Biotech Hiring Summit',
      organizer: 'Telangana Life Sciences Board',
      date: '2026-10-20',
      status: 'PENDING',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-11',
    category: 'JOB_MELA',
    priority: 'IMPORTANT',
    title: 'Job Mela Participation Review: Foxconn & Seoyon E-Hwa',
    message: 'Bengaluru Mega IT Career Expo 2026 received new corporate stall participation requests from Foxconn and Seoyon E-Hwa Summit.',
    time: '1 day ago',
    read: true,
    link: '/admin/job-melas/participation',
    meta: {
      eventName: 'Bengaluru Mega IT & Cloud Career Expo 2026',
      status: 'REVIEW_REQUIRED',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-12',
    category: 'REPORT',
    priority: 'HIGH',
    title: 'High-Priority Complaint: Job Scam / Fee Solicitation',
    message: 'Report #rep-1 flagged Fast Cash Enterprises (Manoj Kumar) for requesting ₹500 upfront registration fees. Immediate disciplinary action required.',
    time: '50 mins ago',
    read: false,
    link: '/admin/reports',
    meta: {
      reportId: 'rep-1',
      reportType: 'Job Scam / Fee Request',
      reportedUserType: 'RECRUITER',
      priority: 'HIGH',
      status: 'ACTION_REQUIRED',
      submissionDate: '2026-08-26',
    }
  },
  {
    id: 'an-13',
    category: 'REPORT',
    priority: 'IMPORTANT',
    title: 'Moderation Report: Misleading Job Description',
    message: 'Report #rep-2 submitted regarding AI Model Trainer job posting. Discrepancy between advertised technical role and on-ground field work.',
    time: '3 hours ago',
    read: false,
    link: '/admin/reports',
    meta: {
      reportId: 'rep-2',
      reportType: 'Misleading Job Description',
      reportedUserType: 'RECRUITER',
      priority: 'IMPORTANT',
      status: 'PENDING',
      submissionDate: '2026-09-01',
    }
  },
  {
    id: 'an-14',
    category: 'REPORT',
    priority: 'NORMAL',
    title: 'Report Review Required: Profile Spam Submission',
    message: 'Report #rep-3 filed by ABC Technologies regarding repeated offensive message submissions via application flow.',
    time: '2 days ago',
    read: true,
    link: '/admin/reports',
    meta: {
      reportId: 'rep-3',
      reportType: 'Profile Harassment in Messages',
      reportedUserType: 'CANDIDATE',
      priority: 'NORMAL',
      status: 'PENDING',
      submissionDate: '2026-09-03',
    }
  },
  {
    id: 'an-15',
    category: 'SUPPORT',
    priority: 'IMPORTANT',
    title: 'Candidate Support Ticket #732104 Requires Action',
    message: 'Priya Sharma requested assistance with interview slot rescheduling and technical meeting link access.',
    time: '5 hours ago',
    read: false,
    link: '/admin/reports',
    meta: {
      ticketId: '732104',
      userType: 'Candidate',
      subject: 'Interview Scheduling & Links',
      status: 'OPEN',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-16',
    category: 'SUPPORT',
    priority: 'IMPORTANT',
    title: 'Recruiter Support Ticket #921405: Stall Allocation Query',
    message: 'Arjun Reddy (ABC Technologies) submitted enquiry regarding Booth B-14 power provisioning at AP Mega IT Job Mela.',
    time: '1 day ago',
    read: true,
    link: '/admin/reports',
    meta: {
      ticketId: '921405',
      userType: 'Recruiter',
      subject: 'Job Mela Interview Slot Allocation',
      status: 'IN_PROGRESS',
      priority: 'IMPORTANT',
    }
  },
  {
    id: 'an-17',
    category: 'SECURITY',
    priority: 'HIGH',
    title: 'Security Alert: Automated Bot Activity Isolated',
    message: 'Security module flagged and suspended spambot99@temp-mail.org (150 rapid-fire bot applications in 4 hours from single IP).',
    time: '1 hour ago',
    read: false,
    link: '/admin/audit-logs',
    meta: {
      alertType: 'BOT_SCRAPING_ISOLATED',
      priority: 'HIGH',
      status: 'SUSPENDED',
    }
  },
  {
    id: 'an-18',
    category: 'SECURITY',
    priority: 'HIGH',
    title: 'Security Audit: Super Admin Role Verification',
    message: 'Super Administrator permissions verified for admin2@ntrvikasa.com. Audit logging confirmed active across all administrative modules.',
    time: '2 days ago',
    read: true,
    link: '/admin/audit-logs',
    meta: {
      alertType: 'ADMIN_ACCESS_VERIFIED',
      priority: 'HIGH',
      status: 'VERIFIED',
    }
  },
  {
    id: 'an-19',
    category: 'SYSTEM',
    priority: 'NORMAL',
    title: 'Platform Maintenance Scheduled: Database Re-indexing',
    message: 'Routine system optimization & PostgreSQL re-indexing maintenance scheduled for Sunday at 02:00 AM IST (Est. duration: 15 mins).',
    time: '3 days ago',
    read: true,
    link: '/admin/settings',
    meta: {
      scheduledTime: 'Sunday 02:00 AM IST',
      duration: '15 mins',
      priority: 'NORMAL',
    }
  },
];

// Portal → initial notifications mapping
const PORTAL_NOTIFS = {
  candidate: CANDIDATE_NOTIFS,
  recruiter: RECRUITER_NOTIFS,
  admin:     ADMIN_NOTIFS,
};

function mapBackendNotification(item) {
  const catUpper = (item.category || '').toUpperCase().trim();
  const normalizedCategory = catUpper === 'SHORTLISTED' ? 'SHORTLIST' : catUpper;

  // Build meta object for existing card metadata badges
  const meta = item.meta ? { ...item.meta } : {};
  if (item.application_id && !meta.appNumber) {
    meta.appNumber = item.application_id;
  }
  if (item.job_mela_id && !meta.passId) {
    meta.passId = item.job_mela_id;
  }
  if (item.interview_id && !meta.format) {
    meta.format = 'Google Meet';
  }

  // Derive route link if not provided
  let link = item.link;
  if (!link) {
    if (item.application_id) link = '/candidate/applications';
    else if (item.interview_id) link = '/candidate/interviews';
    else if (item.job_mela_id) link = '/candidate/job-melas';
  }

  return {
    id: String(item.id),
    category: normalizedCategory || 'SYSTEM',
    title: item.title,
    message: item.message,
    time: item.time || 'Just now',
    read: Boolean(item.is_read ?? item.read),
    link: link || null,
    meta: Object.keys(meta).length > 0 ? meta : null,
    priority: item.priority || null,
  };
}

const STORAGE_KEY = 'ntr_portal_notifications_v6';

export function NotificationProvider({ children }) {
  const [allNotifs, setAllNotifs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            candidate: parsed.candidate || PORTAL_NOTIFS.candidate,
            recruiter: parsed.recruiter || PORTAL_NOTIFS.recruiter,
            admin:     parsed.admin     || PORTAL_NOTIFS.admin,
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return PORTAL_NOTIFS;
  });

  const [candidateUnreadCount, setCandidateUnreadCount] = useState(null);

  // Sync candidate notifications from backend
  const fetchCandidateNotifications = useCallback(async (params = {}) => {
    const token = localStorage.getItem('ntr_access_token');
    const role = localStorage.getItem('ntr_user_role');
    if (!token || role !== 'CANDIDATE') return;

    try {
      const res = await candidateNotificationService.getNotifications(params);
      if (res && Array.isArray(res.items)) {
        const mapped = res.items.map(mapBackendNotification);
        setAllNotifs(prev => ({
          ...prev,
          candidate: mapped,
        }));
        if (typeof res.unread_count === 'number') {
          setCandidateUnreadCount(res.unread_count);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch candidate notifications from backend:', err);
    }
  }, []);

  /** Fetch candidate unread count directly */
  const fetchCandidateUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('ntr_access_token');
    const role = localStorage.getItem('ntr_user_role');
    if (!token || role !== 'CANDIDATE') return;

    try {
      const res = await candidateNotificationService.getUnreadCount();
      if (res && typeof res.unread_count === 'number') {
        setCandidateUnreadCount(res.unread_count);
      }
    } catch (err) {
      console.warn('Failed to fetch candidate unread count:', err);
    }
  }, []);

  // Fetch candidate notifications on mount and when token/user changes
  useEffect(() => {
    const checkAndFetch = () => {
      const token = localStorage.getItem('ntr_access_token');
      const role = localStorage.getItem('ntr_user_role');
      if (token && role === 'CANDIDATE') {
        fetchCandidateNotifications();
      }
    };

    checkAndFetch();
    window.addEventListener('storage', checkAndFetch);
    window.addEventListener('focus', checkAndFetch);
    return () => {
      window.removeEventListener('storage', checkAndFetch);
      window.removeEventListener('focus', checkAndFetch);
    };
  }, [fetchCandidateNotifications]);

  // Persist notifications to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifs));
    } catch (e) {
      // ignore
    }
  }, [allNotifs]);

  /** Get notifications for a specific portal */
  const getNotifs = useCallback((portal) => allNotifs[portal] || [], [allNotifs]);

  /** Unread count for a portal */
  const getUnreadCount = useCallback((portal) => {
    if (portal === 'candidate' && typeof candidateUnreadCount === 'number') {
      return candidateUnreadCount;
    }
    return (allNotifs[portal] || []).filter(n => !n.read).length;
  }, [allNotifs, candidateUnreadCount]);

  /** Mark a single notification as read */
  const markRead = useCallback((portal, id) => {
    setAllNotifs(prev => ({
      ...prev,
      [portal]: (prev[portal] || []).map(n => n.id === id ? { ...n, read: true } : n),
    }));
    if (portal === 'candidate') {
      setCandidateUnreadCount(prev => (prev && prev > 0 ? prev - 1 : 0));
      candidateNotificationService.markRead(id).catch(err => {
        console.warn('Failed to mark read on backend:', err);
      });
    }
  }, []);

  /** Mark all as read for a portal */
  const markAllRead = useCallback((portal) => {
    setAllNotifs(prev => ({
      ...prev,
      [portal]: (prev[portal] || []).map(n => ({ ...n, read: true })),
    }));
    if (portal === 'candidate') {
      setCandidateUnreadCount(0);
      candidateNotificationService.markMultipleRead(null).catch(err => {
        console.warn('Failed to mark all read on backend:', err);
      });
    }
  }, []);

  /** Mark multiple notifications as read */
  const bulkMarkRead = useCallback((portal, ids) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setAllNotifs(prev => ({
      ...prev,
      [portal]: (prev[portal] || []).map(n => idSet.has(n.id) ? { ...n, read: true } : n),
    }));
    if (portal === 'candidate') {
      setCandidateUnreadCount(prev => (prev && prev >= ids.length ? prev - ids.length : 0));
      candidateNotificationService.markMultipleRead(ids).catch(err => {
        console.warn('Failed to bulk mark read on backend:', err);
      });
    }
  }, []);

  /** Dismiss / delete a notification */
  const dismiss = useCallback((portal, id) => {
    setAllNotifs(prev => {
      const removed = (prev[portal] || []).find(n => n.id === id);
      if (portal === 'candidate' && removed && !removed.read) {
        setCandidateUnreadCount(c => (c && c > 0 ? c - 1 : 0));
      }
      return {
        ...prev,
        [portal]: (prev[portal] || []).filter(n => n.id !== id),
      };
    });
    if (portal === 'candidate') {
      candidateNotificationService.deleteNotification(id).catch(err => {
        console.warn('Failed to delete notification on backend:', err);
      });
    }
  }, []);

  /** Bulk dismiss notifications */
  const bulkDismiss = useCallback((portal, ids) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setAllNotifs(prev => {
      if (portal === 'candidate') {
        const unreadRemoved = (prev[portal] || []).filter(n => idSet.has(n.id) && !n.read).length;
        if (unreadRemoved > 0) {
          setCandidateUnreadCount(c => (c && c >= unreadRemoved ? c - unreadRemoved : 0));
        }
      }
      return {
        ...prev,
        [portal]: (prev[portal] || []).filter(n => !idSet.has(n.id)),
      };
    });
    if (portal === 'candidate') {
      candidateNotificationService.deleteNotifications(ids).catch(err => {
        console.warn('Failed to bulk delete notifications on backend:', err);
      });
    }
  }, []);

  /** Add a new notification */
  const addNotification = useCallback((portal, notif) => {
    setAllNotifs(prev => ({
      ...prev,
      [portal]: [
        {
          id: notif.id || `notif-${Date.now()}`,
          category: notif.category || 'SYSTEM',
          title: notif.title,
          message: notif.message,
          time: notif.time || 'Just now',
          read: false,
          link: notif.link || null,
          meta: notif.meta || null,
        },
        ...(prev[portal] || [])
      ]
    }));
  }, []);

  const ctx = useMemo(() => ({
    getNotifs,
    getUnreadCount,
    markRead,
    markAllRead,
    bulkMarkRead,
    dismiss,
    bulkDismiss,
    addNotification,
    fetchCandidateNotifications,
    fetchCandidateUnreadCount,
  }), [
    getNotifs,
    getUnreadCount,
    markRead,
    markAllRead,
    bulkMarkRead,
    dismiss,
    bulkDismiss,
    addNotification,
    fetchCandidateNotifications,
    fetchCandidateUnreadCount,
  ]);

  return (
    <NotificationContext.Provider value={ctx}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
