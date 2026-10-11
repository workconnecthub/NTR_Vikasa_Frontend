import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { dispatchRecruiterEvent, RECRUITER_NOTIFICATION_EVENTS } from '../services/notificationEventService';

// ─── RECRUITER 1 SEED DATA: Arjun Reddy (ABC Technologies) ─────────────────
const RECRUITER_1_DATA = {
  id: 'rec-1',
  email: 'recruiter1@ntrvikasa.com',
  name: 'Arjun Reddy',
  role: 'recruiter',
  designation: 'Director of Talent Acquisition',
  phone: '+91 98765 00112',
  avatar: 'A',

  // Company details
  company: {
    name: 'ABC Technologies Pvt Ltd',
    tagline: 'Leading enterprise cloud modernization, DevOps & digital transformation engineering.',
    description: 'ABC Technologies is a premier enterprise IT software solutions provider. With global delivery centers across Bengaluru, Hyderabad, and Vijayawada, ABC Technologies powers digital platforms for Fortune 500 enterprises across Fintech, E-Commerce, and Supply Chain.',
    industry: 'Information Technology',
    size: '1000-5000 employees',
    employeesCount: '2,400+',
    foundedYear: '2015',
    website: 'https://abctechnologies.example.com',
    email: 'careers@abctechnologies.example.com',
    phone: '+91 80 4920 1000',
    location: 'Bengaluru, Karnataka (Offices in Hyderabad & Vijayawada)',
    address: 'Block B, RMZ Ecospace, Outer Ring Road, Bellandur, Bengaluru 560103',
    cinNumber: 'U72200KA2015PTC078912',
    gstNumber: '29ABCDE1234F1Z5',
    verified: true,
    activeJobsCount: 0,
    internshipsCount: 0,
  },

  jobs: [],
  applications: [],
  candidates: [],
  interviews: [],
  internships: [],
  jobMelas: [],
  analytics: {
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0,
    views: 0,
  },
  settings: {
    applicantAlerts: true,
    interviewAlerts: true,
    jobMelaAlerts: true,
    weeklyDigest: true,
    teamMembers: []
  }
};

// ─── RECRUITER 2 SEED DATA: Sneha Rao (Tech Solutions) ─────────────────────
const RECRUITER_2_DATA = {
  id: 'rec-2',
  email: 'recruiter2@ntrvikasa.com',
  name: 'Sneha Rao',
  role: 'recruiter',
  designation: 'Head of People & University Talent',
  phone: '+91 91234 88776',
  avatar: 'S',

  company: {
    name: 'Tech Solutions Global Ltd',
    tagline: 'Building next-generation fintech architectures, AI platforms, and enterprise microservices.',
    description: 'Tech Solutions is an enterprise innovation powerhouse delivering mission-critical financial platforms, automated compliance workflows, and cloud-native solutions to multinational banks and tier-1 fintech startups.',
    industry: 'Fintech & Banking Technology',
    size: '500-1000 employees',
    employeesCount: '850+',
    foundedYear: '2018',
    website: 'https://techsolutions.example.com',
    email: 'hiring@techsolutions.example.com',
    phone: '+91 40 6820 4000',
    location: 'Hyderabad, Telangana (Offices in Visakhapatnam & Pune)',
    address: 'Floor 9, Cyber Towers, Hitec City, Madhapur, Hyderabad 500081',
    cinNumber: 'U72900TG2018PTC099142',
    gstNumber: '36TECHG1234H1Z8',
    verified: true,
    activeJobsCount: 0,
    internshipsCount: 0,
  },

  jobs: [],
  applications: [],
  candidates: [],
  interviews: [],
  internships: [],
  jobMelas: [],
  analytics: {
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0,
    views: 0,
  },
  settings: {
    applicantAlerts: true,
    interviewAlerts: true,
    jobMelaAlerts: true,
    weeklyDigest: true,
    teamMembers: []
  }
};

// ─── SEED USERS ACCOUNTS ──────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: 'user-arjun',
    name: 'Arjun Reddy',
    email: 'recruiter1@ntrvikasa.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Director of Talent Acquisition',
    phone: '+91 98765 00112',
    avatar: 'A',
    companyId: 'rec-1',
    status: 'ACTIVE',
    createdAt: '2026-08-01',
  },
  {
    id: 'user-pooja',
    name: 'Pooja Nair',
    email: 'pooja.nair@example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Technical Recruiter',
    phone: '+91 98765 00113',
    avatar: 'P',
    companyId: 'rec-1',
    status: 'ACTIVE',
    createdAt: '2026-08-10',
  },
  {
    id: 'user-karthik',
    name: 'Karthik Varma',
    email: 'karthik.varma@example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Hiring Lead',
    designation: 'Hiring Lead',
    phone: '+91 98765 00114',
    avatar: 'K',
    companyId: 'rec-1',
    status: 'ACTIVE',
    createdAt: '2026-08-12',
  },
  {
    id: 'user-sneha',
    name: 'Sneha Rao',
    email: 'recruiter2@ntrvikasa.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Head of People & University Talent',
    phone: '+91 91234 88776',
    avatar: 'S',
    companyId: 'rec-2',
    status: 'ACTIVE',
    createdAt: '2026-08-01',
  },
  {
    id: 'user-rohit',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@techsolutions.example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Technical Recruiter',
    phone: '+91 91234 88777',
    avatar: 'R',
    companyId: 'rec-2',
    status: 'ACTIVE',
    createdAt: '2026-08-15',
  },
  {
    id: 'user-priya',
    name: 'Priya Nair',
    email: 'priya.nair@techsolutions.example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Hiring Manager',
    designation: 'Hiring Manager',
    phone: '+91 91234 88778',
    avatar: 'P',
    companyId: 'rec-2',
    status: 'ACTIVE',
    createdAt: '2026-08-18',
  }
];

// ─── SEED INVITATIONS ──────────────────────────────────────────────────────
const SEED_INVITATIONS = [
  {
    token: 'inv_demo_ravi_101',
    name: 'Ravi Kumar',
    email: 'ravi@abctech.com',
    role: 'Interview Panelist',
    companyId: 'rec-1',
    companyName: 'ABC Technologies Pvt Ltd',
    inviterId: 'user-arjun',
    inviterName: 'Arjun Reddy',
    status: 'INVITED',
    invitedAt: '2026-08-28',
    expiresAt: '2026-09-30',
  }
];

const RecruiterContext = createContext(null);

export function RecruiterProvider({ children }) {
  const { addNotification } = useNotifications();

  // 1. Companies Dataset
  const [companiesData, setCompaniesData] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_companies_data_v5') || localStorage.getItem('ntr_recruiter_data_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed['rec-1'] && parsed['rec-2']) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return {
      'rec-1': RECRUITER_1_DATA,
      'rec-2': RECRUITER_2_DATA,
    };
  });

  // 2. User Accounts Dataset (Separate user accounts for recruiters in each company)
  const [userAccounts, setUserAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_recruiter_users_v5');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_USERS;
  });

  // 3. Invitations Dataset
  const [invitations, setInvitations] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_invitations_v5');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_INVITATIONS;
  });

  // 4. Current Active User ID (Default 'user-arjun')
  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_active_user_id_v5');
      if (stored) return stored;
    } catch (e) {
      // ignore
    }
    return 'user-arjun';
  });

  // 5. Is Recruiter Logged In
  const [isRecruiterLoggedIn, setIsRecruiterLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_recruiter_logged_in');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });

  // Persist all state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ntr_companies_data_v5', JSON.stringify(companiesData));
      localStorage.setItem('ntr_recruiter_users_v5', JSON.stringify(userAccounts));
      localStorage.setItem('ntr_invitations_v5', JSON.stringify(invitations));
      localStorage.setItem('ntr_active_user_id_v5', activeUserId);
      localStorage.setItem('ntr_recruiter_logged_in', String(isRecruiterLoggedIn));
    } catch (e) {
      // ignore
    }
  }, [companiesData, userAccounts, invitations, activeUserId, isRecruiterLoggedIn]);

  // Derive Current User and Current Company
  const currentUser = userAccounts.find(u => u.id === activeUserId) || userAccounts[0] || SEED_USERS[0];
  const activeCompanyId = currentUser.companyId || 'rec-1';
  const currentCompany = companiesData[activeCompanyId] || RECRUITER_1_DATA;

  // Composite Recruiter object for backward-compatibility across all recruiter pages
  const currentRecruiter = {
    ...currentCompany,
    id: currentUser.id,
    userId: currentUser.id,
    companyId: activeCompanyId,
    name: currentUser.name,
    email: currentUser.email,
    role: 'recruiter',
    teamRole: currentUser.teamRole || 'Technical Recruiter',
    designation: currentUser.designation || currentUser.teamRole || 'Recruiter',
    phone: currentUser.phone || currentCompany.phone || '+91 98765 00112',
    avatar: currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || 'R',
    company: currentCompany.company,
    jobs: currentCompany.jobs || [],
    applications: currentCompany.applications || [],
    applicants: currentCompany.applications || [],
    candidates: currentCompany.candidates || [],
    interviews: currentCompany.interviews || [],
    internships: currentCompany.internships || [],
    jobMelas: currentCompany.jobMelas || [],
    analytics: currentCompany.analytics || {},
    settings: currentCompany.settings || {},
  };

  // Helper to update current company dataset
  const updateRecruiter = (updater) => {
    setCompaniesData((prev) => {
      const comp = prev[activeCompanyId] || RECRUITER_1_DATA;
      const updated = typeof updater === 'function' ? updater(comp) : { ...comp, ...updater };
      return {
        ...prev,
        [activeCompanyId]: updated
      };
    });
  };

  // Login handler with support for individual user accounts
  const loginRecruiter = (email, enteredPassword) => {
    const cleanEmail = email?.trim().toLowerCase();
    
    // Find matching user account
    const matchedUser = userAccounts.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (matchedUser) {
      setActiveUserId(matchedUser.id);
      setIsRecruiterLoggedIn(true);
      return {
        success: true,
        user: matchedUser,
        company: companiesData[matchedUser.companyId]?.company
      };
    }

    // Fallback based on email substring (e.g. recruiter2 -> Sneha, recruiter1 -> Arjun)
    if (cleanEmail?.includes('recruiter2') || cleanEmail?.includes('sneha') || cleanEmail?.includes('tech')) {
      const snehaUser = userAccounts.find(u => u.id === 'user-sneha') || SEED_USERS[3];
      setActiveUserId(snehaUser.id);
      setIsRecruiterLoggedIn(true);
      return { success: true, user: snehaUser, company: companiesData['rec-2']?.company };
    }

    const arjunUser = userAccounts.find(u => u.id === 'user-arjun') || SEED_USERS[0];
    setActiveUserId(arjunUser.id);
    setIsRecruiterLoggedIn(true);
    return { success: true, user: arjunUser, company: companiesData['rec-1']?.company };
  };

  // Logout handler
  const logoutRecruiter = () => {
    setIsRecruiterLoggedIn(false);
  };

  // Switch Recruiter Demo helper
  const switchRecruiter = (identifier) => {
    if (identifier === 'rec-1' || identifier === 'user-arjun') {
      setActiveUserId('user-arjun');
      setIsRecruiterLoggedIn(true);
    } else if (identifier === 'rec-2' || identifier === 'user-sneha') {
      setActiveUserId('user-sneha');
      setIsRecruiterLoggedIn(true);
    } else if (identifier === 'user-pooja') {
      setActiveUserId('user-pooja');
      setIsRecruiterLoggedIn(true);
    } else {
      const target = userAccounts.find(u => u.id === identifier || u.email.toLowerCase() === identifier.toLowerCase());
      if (target) {
        setActiveUserId(target.id);
        setIsRecruiterLoggedIn(true);
      }
    }
  };

  // ── INVITATION SYSTEM METHODS ──────────────────────────────────────────────

  // 1. Invite a Team Member
  const inviteTeamMember = (memberData) => {
    const emailToInvite = memberData.email?.trim().toLowerCase();
    const companyTeam = currentCompany.settings?.teamMembers || [];

    // Check duplicate email in the current company's team
    const isDuplicateTeam = companyTeam.some(
      (m) => m.email?.trim().toLowerCase() === emailToInvite
    );
    const isDuplicateUser = userAccounts.some(
      (u) => u.companyId === activeCompanyId && u.email.toLowerCase() === emailToInvite
    );

    if (isDuplicateTeam || isDuplicateUser) {
      return { success: false, error: 'This email is already a member of your hiring team.' };
    }

    // Generate secure unique token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create invitation record
    const newInvitation = {
      token,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role || 'Technical Recruiter',
      companyId: activeCompanyId,
      companyName: currentCompany.company?.name || 'Company',
      inviterId: currentUser.id,
      inviterName: currentUser.name,
      status: 'INVITED',
      invitedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // New Team Member record in Company Settings
    const newTeamMember = {
      id: `tm-${Date.now()}`,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role || 'Technical Recruiter',
      status: 'INVITED',
      invitationToken: token,
      invitedAt: new Date().toISOString().split('T')[0],
      companyId: activeCompanyId,
      companyName: currentCompany.company?.name || 'Company',
    };

    // Update invitations store
    setInvitations((prev) => [newInvitation, ...prev]);

    // Update company team members
    updateRecruiter((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        teamMembers: [newTeamMember, ...(prev.settings?.teamMembers || [])],
      },
    }));

    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_TEAM_MEMBER_ADDED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'TEAM',
        title: `Team Invitation Sent: ${memberData.name}`,
        message: `Invitation sent to ${memberData.name} (${memberData.email}) for role: ${memberData.role || 'Technical Recruiter'}.`,
        link: '/recruiter/settings',
        meta: { memberName: memberData.name, email: memberData.email, role: memberData.role }
      },
      meta: { memberName: memberData.name, email: memberData.email, role: memberData.role }
    });

    return {
      success: true,
      invitationToken: token,
      invitation: newInvitation,
      member: newTeamMember
    };
  };

  // 2. Get Invitation by Token
  const getInvitationByToken = (token) => {
    if (!token) return { valid: false, reason: 'Invalid token.' };

    const inv = invitations.find((i) => i.token === token);
    if (!inv) {
      return { valid: false, reason: 'Invitation not found or link has expired.' };
    }

    if (inv.status === 'ACCEPTED') {
      return { valid: false, invitation: inv, reason: 'This invitation has already been accepted.' };
    }

    if (inv.status === 'EXPIRED') {
      return { valid: false, invitation: inv, reason: 'This invitation has expired. Please ask your team administrator to send a new invitation.' };
    }

    return { valid: true, invitation: inv };
  };

  // 3. Accept Invitation & Create Individual User Account
  const acceptInvitation = ({ token, password }) => {
    const check = getInvitationByToken(token);
    if (!check.valid || !check.invitation) {
      return { success: false, error: check.reason || 'Invalid invitation.' };
    }

    const inv = check.invitation;
    const cleanEmail = inv.email.trim().toLowerCase();

    // Create new separate User Account
    const newUserId = `user-${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: inv.name,
      email: inv.email,
      password: password || 'password123',
      role: 'recruiter',
      teamRole: inv.role,
      designation: inv.role,
      phone: '+91 98000 00000',
      avatar: inv.name[0]?.toUpperCase() || 'U',
      companyId: inv.companyId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 1. Add to User Accounts
    setUserAccounts((prev) => [...prev, newUser]);

    // 2. Update Invitation status
    setInvitations((prev) =>
      prev.map((i) => (i.token === token ? { ...i, status: 'ACCEPTED', acceptedAt: new Date().toISOString() } : i))
    );

    // 3. Update Company Team Member status to ACTIVE
    setCompaniesData((prev) => {
      const targetCompany = prev[inv.companyId] || RECRUITER_1_DATA;
      const updatedMembers = (targetCompany.settings?.teamMembers || []).map((m) => {
        if (m.invitationToken === token || m.email?.toLowerCase() === cleanEmail) {
          return { ...m, status: 'ACTIVE', role: inv.role, acceptedAt: new Date().toISOString() };
        }
        return m;
      });

      return {
        ...prev,
        [inv.companyId]: {
          ...targetCompany,
          settings: {
            ...targetCompany.settings,
            teamMembers: updatedMembers,
          }
        }
      };
    });

    // 4. Set Active User to this new user and log them in
    setActiveUserId(newUserId);
    setIsRecruiterLoggedIn(true);

    return {
      success: true,
      user: newUser,
      company: companiesData[inv.companyId]?.company
    };
  };

  // 4. Remove Team Member
  const removeTeamMember = (memberId) => {
    updateRecruiter((prev) => {
      const removedMember = (prev.settings?.teamMembers || []).find((m) => m.id === memberId);
      const updatedMembers = (prev.settings?.teamMembers || []).filter((m) => m.id !== memberId);

      // Also clean up pending invitations if any
      if (removedMember?.email) {
        setInvitations((invPrev) =>
          invPrev.filter((i) => i.email.toLowerCase() !== removedMember.email.toLowerCase())
        );
      }

      return {
        ...prev,
        settings: {
          ...prev.settings,
          teamMembers: updatedMembers,
        },
      };
    });
  };

  // ── RECRUITMENT OPERATIONS ─────────────────────────────────────────────────

  // Create Job (tagged with creator ID)
  const createJob = (jobData) => {
    const newJob = {
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      shortlistedCount: 0,
      interviewsCount: 0,
      hiredCount: 0,
      status: jobData.status || 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      ...jobData
    };
    updateRecruiter((prev) => ({
      ...prev,
      jobs: [newJob, ...prev.jobs],
      company: {
        ...prev.company,
        activeJobsCount: prev.company.activeJobsCount + 1
      }
    }));
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_JOB_SUBMITTED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Job Submitted: ${newJob.title}`,
        message: `"${newJob.title}" was submitted for review. It will be live once approved by NTR Vikasa Admin.`,
        link: '/recruiter/jobs',
        meta: { jobId: newJob.id, title: newJob.title, status: newJob.status }
      },
      meta: { jobId: newJob.id, title: newJob.title }
    });
    return newJob;
  };

  // Update Job
  const updateJob = (jobId, updatedFields) => {
    updateRecruiter((prev) => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === jobId ? { ...j, ...updatedFields } : j)
    }));
  };

  // Close Job
  const closeJob = (jobId) => {
    updateRecruiter((prev) => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === jobId ? { ...j, status: 'CLOSED' } : j)
    }));
  };

  // Create Internship
  const createInternship = (internshipData) => {
    const newIntern = {
      id: `intern-${Date.now()}`,
      applicantsCount: 0,
      status: 'PENDING',
      postedOn: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      ...internshipData
    };
    updateRecruiter((prev) => ({
      ...prev,
      internships: [newIntern, ...prev.internships],
      company: {
        ...prev.company,
        internshipsCount: prev.company.internshipsCount + 1
      }
    }));
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_INTERNSHIP_SUBMITTED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Internship Submitted: ${newIntern.title}`,
        message: `"${newIntern.title}" was submitted for admin review.`,
        link: '/recruiter/internships',
        meta: { internshipId: newIntern.id, title: newIntern.title, status: 'PENDING' }
      },
      meta: { internshipId: newIntern.id, title: newIntern.title }
    });
    return newIntern;
  };

  // Shortlist candidate
  const shortlistCandidate = (candidateId, jobId) => {
    let candidateName = 'Candidate';
    updateRecruiter((prev) => {
      const updatedCandidates = prev.candidates.map(c => {
        if (c.id === candidateId) {
          candidateName = c.name || candidateName;
          return { ...c, shortlisted: true, status: 'SHORTLISTED' };
        }
        return c;
      });
      const updatedApps = prev.applications.map(a => {
        if (a.candidateId === candidateId) {
          candidateName = a.candidateName || candidateName;
          return { ...a, status: 'SHORTLISTED' };
        }
        return a;
      });
      return {
        ...prev,
        candidates: updatedCandidates,
        applications: updatedApps
      };
    });
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_CANDIDATE_SHORTLISTED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'SHORTLIST',
        title: `Candidate Shortlisted: ${candidateName}`,
        message: `${candidateName} was shortlisted for further evaluation and interview scheduling.`,
        link: '/recruiter/candidates',
        meta: { candidateId, candidateName }
      },
      meta: { candidateId, candidateName }
    });
  };

  // Reject candidate
  const rejectCandidate = (candidateId) => {
    updateRecruiter((prev) => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.candidateId === candidateId ? { ...a, status: 'REJECTED' } : a
      )
    }));
  };

  // Schedule Interview
  const scheduleInterview = (interviewData) => {
    const newInterview = {
      id: `int-${Date.now()}`,
      status: 'SCHEDULED',
      scheduledBy: currentUser.id,
      scheduledByName: currentUser.name,
      ...interviewData
    };
    updateRecruiter((prev) => ({
      ...prev,
      interviews: [newInterview, ...prev.interviews],
      applications: prev.applications.map(a =>
        a.candidateId === interviewData.candidateId || a.candidateName === interviewData.candidateName
          ? { ...a, status: 'INTERVIEW' }
          : a
      )
    }));
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_INTERVIEW_SCHEDULED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'INTERVIEW',
        title: `Interview Scheduled: ${interviewData.candidateName || 'Candidate'}`,
        message: `Interview scheduled with ${interviewData.candidateName || 'Candidate'} on ${interviewData.date || 'upcoming date'} at ${interviewData.time || 'scheduled time'}. Format: ${interviewData.type || 'Online'}.`,
        link: '/recruiter/interviews',
        meta: {
          interviewId: newInterview.id,
          candidateName: interviewData.candidateName,
          date: interviewData.date,
          time: interviewData.time,
          format: interviewData.type || 'Online',
        }
      },
      meta: {
        interviewId: newInterview.id,
        candidateName: interviewData.candidateName,
        date: interviewData.date,
        time: interviewData.time,
      }
    });
    return newInterview;
  };

  // Reschedule Interview
  const rescheduleInterview = (interviewId, newSchedule) => {
    updateRecruiter((prev) => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId ? { ...i, ...newSchedule, status: 'RESCHEDULED' } : i
      )
    }));
  };

  // Cancel Interview
  const cancelInterview = (interviewId) => {
    updateRecruiter((prev) => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId ? { ...i, status: 'CANCELLED' } : i
      )
    }));
  };

  // Update Interview Status (e.g. COMPLETED)
  const updateInterviewStatus = (interviewId, newStatus) => {
    updateRecruiter((prev) => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId ? { ...i, status: newStatus } : i
      )
    }));
  };

  // Update Company Profile

  const updateCompanyProfile = (companyData) => {
    updateRecruiter((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        ...companyData
      }
    }));
  };

  // Register Job Mela
  const registerJobMela = (melaData) => {
    const newMela = {
      id: `mela-${Date.now()}`,
      participationStatus: 'PENDING',
      boothNumber: 'Awaiting Admin Allocation',
      registeredCandidatesAtBooth: 0,
      spotInterviewsConducted: 0,
      spotOffersGiven: 0,
      candidatesQueue: [],
      registeredBy: currentUser.id,
      ...melaData
    };
    updateRecruiter((prev) => ({
      ...prev,
      jobMelas: [newMela, ...prev.jobMelas]
    }));
  };

  // Update Settings
  const updateSettings = (settingsData) => {
    if (settingsData.profile) {
      // Also update currentUser in userAccounts
      setUserAccounts((prev) =>
        prev.map((u) => (u.id === activeUserId ? { ...u, ...settingsData.profile } : u))
      );
    }
    updateRecruiter((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settingsData
      }
    }));
  };

  // Summary statistics for company dashboard
  const stats = {
    activeJobs: currentRecruiter.jobs.filter(j => j.status === 'PUBLISHED').length,
    pendingJobs: currentRecruiter.jobs.filter(j => j.status === 'PENDING').length,
    totalApplicants: currentRecruiter.applications.length,
    shortlisted: currentRecruiter.applications.filter(a => a.status === 'SHORTLISTED').length,
    interviews: currentRecruiter.interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED').length,
    selectedHired: currentRecruiter.applications.filter(a => a.status === 'SELECTED').length || 6,
  };

  return (
    <RecruiterContext.Provider
      value={{
        recruiter: currentRecruiter,
        currentUser,
        currentCompany,
        userAccounts,
        invitations,
        activeRecruiterId: activeCompanyId,
        activeUserId,
        isRecruiterLoggedIn,
        stats,
        loginRecruiter,
        logoutRecruiter,
        switchRecruiter,
        updateRecruiter,
        createJob,
        updateJob,
        closeJob,
        createInternship,
        shortlistCandidate,
        rejectCandidate,
        scheduleInterview,
        rescheduleInterview,
        cancelInterview,
        updateInterviewStatus,
        updateCompanyProfile,

        registerJobMela,
        updateSettings,
        inviteTeamMember,
        removeTeamMember,
        getInvitationByToken,
        acceptInvitation,
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error('useRecruiter must be used within a RecruiterProvider');
  }
  return context;
}

