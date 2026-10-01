import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, Building2, QrCode, Download,
  CheckCircle2, ArrowRight, Sparkles, ExternalLink, Ticket, Users, X,
  Briefcase, FileText, Check, Send, User, Mail, Phone, ShieldCheck,
  ChevronRight, ArrowLeft, Search, Filter, DollarSign, Award, Layers,
  AlertCircle, Info, TrendingUp, Eye
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import JobMelaPosterModal, { downloadPosterImage } from '../../components/ui/JobMelaPosterModal';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { useAdmin } from '../../context/AdminContext';
import { useNotifications } from '../../context/NotificationContext';
import { dispatchCandidateEvent, NOTIFICATION_EVENTS } from '../../services/notificationEventService';
import { MOCK_JOB_MELAS } from '../../data/mockData';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import { formatMelaId, formatJobId, formatRegistrationId } from '../../utils/applicationUtils';

export default function CandidateJobMelaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { candidate, updateCandidate, isLoggedIn } = useCandidate();
  const { addNotification } = useNotifications();
  const {
    jobMelas = [],
    applications: adminApplications = [],
    registrations: adminRegistrations = [],
    candidates: adminCandidates = [],
    registerForJobMela,
    applyToJobMelaCompany,
    getMelaStats
  } = useAdmin();

  // Combine admin jobMelas with fallback to MOCK_JOB_MELAS
  const allMelas = useMemo(() => {
    return jobMelas && jobMelas.length > 0 ? jobMelas : MOCK_JOB_MELAS;
  }, [jobMelas]);

  // Navigation state: null = Browse/Main Listing, object = Specific Job Mela Details
  const [selectedMela, setSelectedMela] = useState(null);
  const [selectedPosterMela, setSelectedPosterMela] = useState(null);

  // Status Filter for Melas Listing: 'ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'
  const [melaStatusFilter, setMelaStatusFilter] = useState('ALL');
  const [melaSearch, setMelaSearch] = useState('');

  // Participating Companies Search & Pagination for Details view
  const [companySearch, setCompanySearch] = useState('');
  const [companySectorFilter, setCompanySectorFilter] = useState('ALL');
  const [companyPage, setCompanyPage] = useState(1);
  const COMPANIES_PER_PAGE = 10;

  // View switch in Details level: 'COMPANIES' | 'BREAKDOWN'
  const [activeDetailTab, setActiveDetailTab] = useState('COMPANIES');

  // Application Details Modal State
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [appDetailsModalOpen, setAppDetailsModalOpen] = useState(false);

  // Modals state
  const [selectedPass, setSelectedPass] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  // Event Registration Modal
  const [selectedMelaForReg, setSelectedMelaForReg] = useState(null);
  const [eventRegModalOpen, setEventRegModalOpen] = useState(false);
  const [eventRegForm, setEventRegForm] = useState({
    name: candidate.name || 'Vyshnavi Reddy',
    email: candidate.email || 'vyshnavi.reddy@example.com',
    phone: candidate.phone || '+91 98765 43210',
    location: 'Vijayawada, NTR District',
    resume: candidate.resume?.fileName || 'Vyshnavi_Reddy_Resume_2026.pdf',
    timeSlot: 'Morning Session (09:00 AM - 01:00 PM)',
  });

  // Company-Specific Application Modal
  const [selectedCompanyJob, setSelectedCompanyJob] = useState(null);
  const [companyApplyModalOpen, setCompanyApplyModalOpen] = useState(false);
  const [companyApplyForm, setCompanyApplyForm] = useState({
    name: candidate.name || 'Vyshnavi Reddy',
    email: candidate.email || 'vyshnavi.reddy@example.com',
    phone: candidate.phone || '+91 98765 43210',
    resume: candidate.resume?.fileName || 'Vyshnavi_Reddy_Resume_2026.pdf',
    skills: candidate.skillsPreferences?.skills?.join(', ') || 'React, JavaScript, TypeScript, Python, SQL',
    experience: candidate.skillsPreferences?.experience || candidate.experience || '2+ Years Experience',
    education: candidate.skillsPreferences?.educationLevel || candidate.education || 'B.Tech in Computer Science & Engineering',
    coverNote: 'I am excited to apply for this walk-in opportunity and meet your technical team at the Job Mela.',
  });

  // Success Confirmation Modal
  const [submittedAppInfo, setSubmittedAppInfo] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Keep selectedMela synced with live jobMelas updates
  useEffect(() => {
    if (selectedMela) {
      const live = allMelas.find(m => String(m.id) === String(selectedMela.id));
      if (live) setSelectedMela(live);
    }
  }, [allMelas]);

  // Reset company page when search / filter changes
  useEffect(() => {
    setCompanyPage(1);
  }, [companySearch, companySectorFilter, selectedMela]);

  // Registered Event Passes for the current logged in candidate (purely dynamic)
  const registeredEvents = useMemo(() => {
    const myEmail = (candidate.email || '').toLowerCase().trim();
    const myId = (candidate.id || '').toLowerCase().trim();
    const myName = (candidate.name || '').toLowerCase().trim();

    const matchingRegs = (adminRegistrations || []).filter(r => {
      const rEmail = (r.candidateEmail || r.email || '').toLowerCase().trim();
      const rId = (r.candidateId || '').toLowerCase().trim();
      const rName = (r.candidate || r.candidateName || '').toLowerCase().trim();
      return (myEmail && rEmail === myEmail) || (myId && rId === myId) || (myName && rName === myName);
    });

    return matchingRegs.map(reg => {
      const mela = allMelas.find(m => String(m.id) === String(reg.melaId) ||
        (reg.event && (m.title && reg.event.toLowerCase() === m.title.toLowerCase() || m.event && reg.event.toLowerCase() === m.event.toLowerCase()))
      );
      return {
        ...mela,
        ...reg,
        id: reg.melaId || mela?.id || reg.id,
        melaId: reg.melaId || mela?.id || reg.id,
        title: mela?.title || mela?.event || reg.event || reg.eventName || 'Mega Job Mela',
        venue: mela?.venue || mela?.location || 'Main Convention Hall',
        city: mela?.city || 'Vijayawada',
        date: mela?.date || reg.registrationDate || '2026-11-15',
        time: mela?.time || '09:00 AM - 05:00 PM',
        passId: reg.passId || reg.entryToken || reg.id,
        registeredOn: reg.registrationDate || 'Recently',
        gateNumber: reg.gateNumber || 'Gate 2 (General Fast-Track)',
        entryQrCode: reg.entryQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(reg.passId || reg.id)}`,
      };
    });
  }, [candidate, adminRegistrations, allMelas]);

  // Candidate applications specifically for Job Melas (purely dynamic)
  const candidateJobMelaApplications = useMemo(() => {
    const myEmail = (candidate.email || '').toLowerCase().trim();
    const myId = (candidate.id || '').toLowerCase().trim();
    const candidateApps = (candidate.applications || []).filter(a => a.applicationType === 'Job Mela Application' || Boolean(a.melaId));
    
    const adminMatched = (adminApplications || []).filter(a => {
      const aEmail = (a.candidateEmail || a.email || '').toLowerCase().trim();
      const aId = (a.candidateId || '').toLowerCase().trim();
      return (a.applicationType === 'Job Mela Application' || Boolean(a.melaId)) &&
        ((myEmail && aEmail === myEmail) || (myId && aId === myId));
    });

    const combined = [...candidateApps];
    adminMatched.forEach(adm => {
      if (!combined.some(c => (c.appNumber && c.appNumber === adm.appNumber) || (c.id && c.id === adm.id))) {
        combined.push(adm);
      }
    });
    return combined;
  }, [candidate.applications, adminApplications, candidate.email, candidate.id]);

  // Status Tabs Counts
  const melaTabs = useMemo(() => {
    return [
      { key: 'ALL', label: 'All', count: allMelas.length },
      { key: 'UPCOMING', label: 'Upcoming', count: allMelas.filter(m => m.status === 'UPCOMING' || m.status === 'APPROVED' || m.status === 'REGISTRATION_OPEN').length },
      { key: 'ONGOING', label: 'Ongoing', count: allMelas.filter(m => m.status === 'ONGOING' || m.status === 'ACTIVE').length },
      { key: 'COMPLETED', label: 'Completed', count: allMelas.filter(m => m.status === 'COMPLETED' || m.status === 'CONCLUDED').length },
    ];
  }, [allMelas]);

  // Filtered Job Melas for Listing (includes APPROVED as upcoming)
  const filteredMelas = useMemo(() => {
    return allMelas.filter(m => {
      if (melaSearch.trim()) {
        const q = melaSearch.toLowerCase();
        const matchTitle = (m.title || m.event || '').toLowerCase().includes(q);
        const matchCity = (m.city || m.location || '').toLowerCase().includes(q);
        const matchVenue = (m.venue || '').toLowerCase().includes(q);
        const matchId = (formatMelaId(m.id) || '').toLowerCase().includes(q) || String(m.id || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchVenue && !matchId) return false;
      }
      if (melaStatusFilter === 'UPCOMING') {
        return m.status === 'UPCOMING' || m.status === 'APPROVED' || m.status === 'REGISTRATION_OPEN';
      }
      if (melaStatusFilter === 'ONGOING') {
        return m.status === 'ONGOING' || m.status === 'ACTIVE';
      }
      if (melaStatusFilter === 'COMPLETED') {
        return m.status === 'COMPLETED' || m.status === 'CONCLUDED';
      }
      return true;
    });
  }, [allMelas, melaSearch, melaStatusFilter]);

  // Browse listing pagination: 9 per page (3 columns × 3 rows)
  const MELAS_PER_PAGE = 9;
  const [melaPage, setMelaPage] = useState(1);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setMelaPage(1);
  }, [melaSearch, melaStatusFilter]);

  const totalMelaPages = Math.max(1, Math.ceil(filteredMelas.length / MELAS_PER_PAGE));
  const paginatedMelas = useMemo(() => {
    const start = (melaPage - 1) * MELAS_PER_PAGE;
    return filteredMelas.slice(start, start + MELAS_PER_PAGE);
  }, [filteredMelas, melaPage]);

  // Calculate live statistics for selected Job Mela
  const currentMelaStats = useMemo(() => {
    if (!selectedMela) return null;
    if (getMelaStats) {
      return getMelaStats(selectedMela.id);
    }
    return null;
  }, [selectedMela, getMelaStats, adminApplications, adminRegistrations, adminCandidates, jobMelas]);

  // Derive real participating companies list for the selected Job Mela
  const selectedMelaCompanies = useMemo(() => {
    if (!selectedMela) return [];
    
    const raw = Array.isArray(selectedMela.participatingCompanies) && selectedMela.participatingCompanies.length > 0
      ? selectedMela.participatingCompanies
      : (Array.isArray(selectedMela.availableJobs) && selectedMela.availableJobs.length > 0
        ? selectedMela.availableJobs.map((j, idx) => ({
            id: `${selectedMela.id}-job-${idx}`,
            companyId: `comp-${idx}`,
            company: j.company,
            position: j.title,
            salary: j.salary,
            vacancies: j.vacancies,
            location: selectedMela.venue || selectedMela.city,
            sector: 'Information Technology'
          }))
        : []);

    return raw.flatMap((c, cIdx) => {
      const companyName = c.company || c.name || 'Participating Company';
      const roles = Array.isArray(c.roles) && c.roles.length > 0
        ? c.roles
        : [c.position || c.role || 'Walk-in Role'];

      return roles.map((role, rIdx) => ({
        id: c.id || `${selectedMela.id}-c-${cIdx}-${rIdx}`,
        companyEntryId: c.id,
        companyId: c.companyId || c.id || `comp-${cIdx}`,
        company: companyName,
        role: role,
        salary: c.salary || 'Best in Industry',
        vacancies: c.vacancies ? (typeof c.vacancies === 'number' ? `${c.vacancies} Spots` : String(c.vacancies)) : 'Multiple Openings',
        rawVacancies: Number(c.vacancies) || 10,
        qualification: c.qualification || 'Any Degree / Graduate',
        experience: c.experience || '0-2 Years',
        location: c.location || selectedMela.venue || selectedMela.city || 'On-site Pavilion',
        sector: c.sector || (cIdx % 2 === 0 ? 'Information Technology' : 'Corporate Services'),
        notes: c.notes || 'Direct walk-in technical interview on spot'
      }));
    });
  }, [selectedMela]);

  // Filtered participating companies based on search and sector
  const filteredCompanies = useMemo(() => {
    return selectedMelaCompanies.filter(c => {
      if (companySearch.trim()) {
        const q = companySearch.toLowerCase();
        const matchComp = c.company.toLowerCase().includes(q);
        const matchRole = c.role.toLowerCase().includes(q);
        const matchLoc = c.location?.toLowerCase().includes(q);
        if (!matchComp && !matchRole && !matchLoc) return false;
      }
      if (companySectorFilter !== 'ALL' && c.sector !== companySectorFilter) {
        return false;
      }
      return true;
    });
  }, [selectedMelaCompanies, companySearch, companySectorFilter]);

  // Paginated companies (10 per page)
  const totalCompanyPages = Math.max(1, Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE));
  const paginatedCompanies = useMemo(() => {
    const validPage = Math.min(Math.max(1, companyPage), totalCompanyPages);
    const start = (validPage - 1) * COMPANIES_PER_PAGE;
    return filteredCompanies.slice(start, start + COMPANIES_PER_PAGE);
  }, [filteredCompanies, companyPage, totalCompanyPages]);

  // Digital Pass Handlers
  const handleOpenPass = (event) => {
    setSelectedPass(event);
    setPassModalOpen(true);
  };

  const handleDownloadPass = () => {
    toast({
      type: 'success',
      title: 'Pass Downloaded',
      message: 'Your Digital QR Entry Pass has been downloaded as PDF.',
    });
  };

  // Event Registration Handlers
  const handleOpenEventRegistration = (mela) => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: `/candidate/job-mela?melaId=${mela.id}&register=true`,
          melaId: mela.id,
          jobTitle: `Entry Pass for ${mela.title || mela.event}`
        }
      });
      return;
    }
    if (registeredEvents.some(e => String(e.id) === String(mela.id) || String(e.melaId) === String(mela.id))) {
      toast({ type: 'info', title: 'Already Registered', message: 'You already have an active entry pass for this event.' });
      return;
    }
    setSelectedMelaForReg(mela);
    setEventRegForm({
      name: candidate.name || 'Vyshnavi Reddy',
      email: candidate.email || 'vyshnavi.reddy@example.com',
      phone: candidate.phone || '+91 98765 43210',
      location: mela.city || 'Vijayawada, NTR District',
      resume: candidate.resume?.fileName || 'Vyshnavi_Reddy_Resume_2026.pdf',
      timeSlot: 'Morning Session (09:00 AM - 01:00 PM)',
    });
    setEventRegModalOpen(true);
  };

  const handleConfirmEventRegistration = (e) => {
    e.preventDefault();
    if (!selectedMelaForReg) return;

    const newPass = registerForJobMela ? registerForJobMela({
      melaId: selectedMelaForReg.id,
      candidateId: candidate.id,
      candidateName: eventRegForm.name || candidate.name,
      candidateEmail: eventRegForm.email || candidate.email,
      phone: eventRegForm.phone || candidate.phone,
      location: eventRegForm.location,
      timeSlot: eventRegForm.timeSlot,
      event: selectedMelaForReg.title || selectedMelaForReg.event,
      venue: selectedMelaForReg.venue || selectedMelaForReg.city,
      city: selectedMelaForReg.city,
      state: selectedMelaForReg.state,
      date: selectedMelaForReg.date
    }) : {
      ...selectedMelaForReg,
      passId: `PASS-AP-${Math.floor(100000 + Math.random() * 900000)}`,
      registeredOn: 'Today',
      gateNumber: 'Gate 2 (General Fast-Track)',
      entryQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=JOBMELA-PASS',
    };

    setEventRegModalOpen(false);
    setSelectedPass(newPass);
    setPassModalOpen(true);

    // Dispatch real-time candidate notification event
    dispatchCandidateEvent({
      eventType: NOTIFICATION_EVENTS.JOB_MELA_REGISTERED,
      candidateEmail: candidate.email,
      recipientName: candidate.name,
      addNotification,
      notification: {
        category: 'JOB_MELA',
        title: `Job Mela Pass Confirmed: ${newPass.passId}`,
        message: `Your Fast-Track QR pass (${newPass.passId}) is confirmed for ${selectedMelaForReg.title || selectedMelaForReg.event}. Event Date: ${selectedMelaForReg.date || 'Upcoming'}. Venue: ${selectedMelaForReg.venue || selectedMelaForReg.city}. Gate: ${newPass.gateNumber}.`,
        time: 'Just now',
        link: '/candidate/job-melas',
        meta: {
          passId: newPass.passId,
          melaTitle: selectedMelaForReg.title || selectedMelaForReg.event,
          date: selectedMelaForReg.date,
          venue: selectedMelaForReg.venue || selectedMelaForReg.city,
        }
      },
      meta: {
        passId: newPass.passId,
        melaTitle: selectedMelaForReg.title || selectedMelaForReg.event,
      }
    });

    toast({
      type: 'success',
      title: 'Registration Confirmed! 🎉',
      message: `Your fast-track entry pass for ${selectedMelaForReg.title || selectedMelaForReg.event} is ready.`,
    });
  };

  // Company-Specific Apply Handlers
  const handleOpenCompanyApply = (mela, companyName, role, salary, location, companyEntryId, companyId) => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: `/candidate/job-melas?melaId=${mela.id}&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(role || '')}&salary=${encodeURIComponent(salary || '')}&loc=${encodeURIComponent(location || '')}&apply=true`,
          melaId: mela.id,
          companyName,
          role,
          jobTitle: `${role || 'Walk-in Role'} at ${companyName}`
        }
      });
      return;
    }

    const compJob = {
      melaId: mela.id,
      melaTitle: mela.title || mela.event,
      companyName: companyName,
      companyId: companyId || '',
      companyEntryId: companyEntryId || '',
      role: role || 'Software Developer',
      salary: salary || '₹5.0 - ₹8.0 LPA',
      location: location || mela.city,
    };

    setSelectedCompanyJob(compJob);
    setCompanyApplyForm({
      name: candidate.name || 'Vyshnavi Reddy',
      email: candidate.email || 'vyshnavi.reddy@example.com',
      phone: candidate.phone || '+91 98765 43210',
      resume: candidate.resume?.fileName || 'Vyshnavi_Reddy_Resume_2026.pdf',
      skills: candidate.skillsPreferences?.skills?.join(', ') || 'React, JavaScript, TypeScript, Python, SQL',
      experience: candidate.skillsPreferences?.experience || candidate.experience || '2+ Years Experience',
      education: candidate.skillsPreferences?.educationLevel || candidate.education || 'B.Tech in Computer Science & Engineering',
      coverNote: `I am interested in interviewing for the ${role} position at ${companyName} during the ${mela.title || mela.event}.`,
    });
    setCompanyApplyModalOpen(true);
  };

  // If user returned from login with ?apply=true or ?register=true
  useEffect(() => {
    const shouldApply = searchParams.get('apply') === 'true';
    const shouldRegister = searchParams.get('register') === 'true';
    const melaId = searchParams.get('melaId');
    const company = searchParams.get('company');
    const role = searchParams.get('role');
    const salary = searchParams.get('salary');
    const loc = searchParams.get('loc');

    if (shouldApply && melaId && company && isLoggedIn) {
      const targetMela = allMelas.find(m => String(m.id) === String(melaId));
      if (targetMela) {
        setSelectedMela(targetMela);
        handleOpenCompanyApply(targetMela, company, role, salary, loc);
        setSearchParams({}, { replace: true });
      }
    } else if (shouldRegister && melaId && isLoggedIn) {
      const targetMela = allMelas.find(m => String(m.id) === String(melaId));
      if (targetMela) {
        setSelectedMela(targetMela);
        handleOpenEventRegistration(targetMela);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, isLoggedIn, allMelas]);

  // Generate NTR-{EVENT_NO}-{COMPANY_NO}-{APPLICATION_NO} format
  const generateNtrAppId = (melaId, companyName, currentApps) => {
    const melaIdx = allMelas.findIndex(m => String(m.id) === String(melaId));
    const eventNo = String(Math.max(1, melaIdx + 1)).padStart(2, '0');

    const melaApps = currentApps.filter(a => String(a.melaId) === String(melaId));
    const uniqueCompanies = [];
    melaApps.forEach(a => {
      const cName = (a.company || a.companyName || '').toLowerCase();
      if (cName && !uniqueCompanies.includes(cName)) {
        uniqueCompanies.push(cName);
      }
    });
    const existingIdx = uniqueCompanies.indexOf(companyName.toLowerCase());
    const companyNo = String(existingIdx >= 0 ? existingIdx + 1 : uniqueCompanies.length + 1).padStart(2, '0');

    const existingCount = currentApps.filter(
      a => String(a.melaId) === String(melaId) && (a.company || a.companyName || '').toLowerCase() === companyName.toLowerCase()
    ).length;
    const appNo = String(existingCount + 1).padStart(4, '0');

    return `NTR-${eventNo}-${companyNo}-${appNo}`;
  };

  const getAppliedCompanyApp = (melaId, companyName, role) => {
    return candidateJobMelaApplications.find(
      a => (!a.melaId || String(a.melaId) === String(melaId)) &&
           (a.company || a.companyName || '').toLowerCase() === (companyName || '').toLowerCase() &&
           (!role || (a.title || a.role || '').toLowerCase() === role.toLowerCase())
    );
  };

  const handleSubmitCompanyApplication = (e) => {
    e.preventDefault();
    if (!selectedCompanyJob) return;

    const completion = candidate?.profileCompletion ?? 0;
    if (completion < 70) {
      toast({
        type: 'error',
        title: 'Profile Incomplete',
        message: `Your profile is currently ${completion}% complete. Please complete at least 70% of your profile before applying for jobs.`,
      });
      return;
    }

    // Compute NTR application ID
    const ntrAppId = generateNtrAppId(
      selectedCompanyJob.melaId,
      selectedCompanyJob.companyName,
      candidateJobMelaApplications
    );

    const matchingPass = registeredEvents.find(e => String(e.id) === String(selectedCompanyJob.melaId) || String(e.melaId) === String(selectedCompanyJob.melaId));
    const parts = ntrAppId.split('-');
    const eventNumber = parts[1] || '01';
    const companySequence = parts[2] || '02';
    const applicationSequence = parts[3] || '0024';

    const candidateApp = {
      id: `app-mela-${Date.now()}`,
      jobId: `mela-${selectedCompanyJob.melaId}-${selectedCompanyJob.companyName}`,
      melaId: selectedCompanyJob.melaId,
      melaTitle: selectedCompanyJob.melaTitle,
      companyId: selectedCompanyJob.companyId || '',
      companyEntryId: selectedCompanyJob.companyEntryId || '',
      company: selectedCompanyJob.companyName,
      companyName: selectedCompanyJob.companyName,
      title: selectedCompanyJob.role,
      role: selectedCompanyJob.role,
      position: selectedCompanyJob.role,
      candidateId: candidate.id,
      candidateName: companyApplyForm.name || candidate.name,
      candidateEmail: companyApplyForm.email || candidate.email,
      phone: companyApplyForm.phone || candidate.phone,
      location: selectedCompanyJob.location || selectedMela?.city || 'Andhra Pradesh',
      salary: selectedCompanyJob.salary || 'Best in Industry',
      eventNumber,
      companySequence,
      applicationSequence,
      appNumber: ntrAppId,
      applicationType: 'Job Mela Application',
      type: 'Full-time',
      mode: 'On-site',
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'APPLIED',
      melaDate: selectedMela?.date || 'Upcoming',
      melaVenue: selectedMela?.venue || 'Event Venue',
      passId: matchingPass?.passId || null,
      passStatus: matchingPass ? 'Confirmed / Active Pass' : null,
      coverNote: companyApplyForm.coverNote || '',
      skills: companyApplyForm.skills || '',
      experience: companyApplyForm.experience || '',
      education: companyApplyForm.education || '',
      timeline: [
        { stage: 'Applied', date: 'Today (Just now)', completed: true, current: true },
        { stage: 'Screening', date: 'Pending Review', completed: false, current: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false, current: false },
        { stage: 'Interview', date: 'Spot Interview at Event', completed: false, current: false },
        { stage: 'Selected', date: 'TBD', completed: false, current: false },
      ]
    };

    // Save to AdminContext
    if (applyToJobMelaCompany) {
      applyToJobMelaCompany(candidateApp);
    }

    // Save to CandidateContext
    if (updateCandidate) {
      updateCandidate(prev => ({
        ...prev,
        applications: [candidateApp, ...(prev.applications || []).filter(a => a.appNumber !== ntrAppId)]
      }));
    }

    // Dispatch real-time candidate notification event
    dispatchCandidateEvent({
      eventType: NOTIFICATION_EVENTS.JOB_MELA_APP_SUBMITTED,
      candidateEmail: candidate.email,
      recipientName: candidate.name,
      addNotification,
      notification: {
        category: 'JOB_MELA',
        title: `Job Mela Application: ${selectedCompanyJob.role}`,
        message: `Application submitted to ${selectedCompanyJob.companyName} for "${selectedCompanyJob.role}" at ${selectedCompanyJob.melaTitle || 'Job Mela'}. Job Mela Application No: ${ntrAppId}. Status: Applied.`,
        time: 'Just now',
        link: '/candidate/applications',
        meta: {
          appNumber: ntrAppId,
          company: selectedCompanyJob.companyName,
          role: selectedCompanyJob.role,
          melaTitle: selectedCompanyJob.melaTitle,
          status: 'Applied',
          applicationType: 'Job Mela Application',
        }
      },
      meta: {
        appNumber: ntrAppId,
        company: selectedCompanyJob.companyName,
        role: selectedCompanyJob.role,
        status: 'Applied',
      }
    });

    setCompanyApplyModalOpen(false);
    setSubmittedAppInfo({
      ...candidateApp,
      appId: ntrAppId,
      companyName: selectedCompanyJob.companyName,
      role: selectedCompanyJob.role,
      melaTitle: selectedCompanyJob.melaTitle
    });
    setSuccessModalOpen(true);

    toast({
      type: 'success',
      title: 'Application Submitted!',
      message: `Submitted application to ${selectedCompanyJob.companyName} for ${selectedCompanyJob.role}.`,
    });
  };

  const isCompanyJobApplied = (melaId, companyName, role) => {
    return candidateJobMelaApplications.some(a => {
      const melaMatch = !a.melaId || String(a.melaId) === String(melaId);
      const compMatch = (a.company || a.companyName || '').toLowerCase().trim() === (companyName || '').toLowerCase().trim();
      const roleMatch = !role || (a.title || a.role || '').toLowerCase().trim() === (role || '').toLowerCase().trim();
      return melaMatch && compMatch && roleMatch;
    });
  };

  const isEventRegistered = (melaId) => {
    return registeredEvents.some(e => String(e.id) === String(melaId) || String(e.melaId) === String(melaId));
  };

  // Scroll to Browse All Job Melas
  const handleScrollToBrowse = () => {
    const el = document.getElementById('browse-job-melas-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="candidate-job-mela-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* ── TOP HERO / BANNER ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <CalendarDays size={22} style={{ color: '#c7d2fe' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#ffffff' }}>Mega Job Melas & Walk-in Drives</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: '#cbd5e1' }}>
              Free fast-track entry passes, digital QR check-in badges, and direct spot interviews for {candidate.name}
            </p>
          </div>

          {!selectedMela && (
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={handleScrollToBrowse}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Browse All Job Melas
            </Button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          VIEW LEVEL 2: SPECIFIC JOB MELA DETAILS VIEW
         ══════════════════════════════════════════════════════════════ */}
      {selectedMela ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Breadcrumb Back button */}
          <div>
            <button
              type="button"
              onClick={() => {
                setSelectedMela(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-600)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 0'
              }}
            >
              <ArrowLeft size={16} /> Back to All Job Melas
            </button>
          </div>

          {/* Official Event Flyer Banner in Selected View */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxHeight: '260px',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              background: '#090d16',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedPosterMela(selectedMela)}
            title="Click to view full official flyer / poster"
          >
            <img
              src={selectedMela.posterImage || selectedMela.banner || selectedMela.image || '/hero2.jpg'}
              alt={selectedMela.title || selectedMela.event}
              style={{
                width: '100%',
                maxHeight: '260px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              display: 'flex',
              gap: 8,
              zIndex: 2
            }}>
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<Eye size={12} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPosterMela(selectedMela);
                }}
                style={{ background: 'rgba(15,23,42,0.85)', color: '#fff', border: 'none', backdropFilter: 'blur(4px)' }}
              >
                View Full Flyer
              </Button>
              <Button
                variant="primary"
                size="xs"
                leftIcon={<Download size={12} />}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPosterImage(
                    selectedMela.posterImage || selectedMela.banner || selectedMela.image || '/hero2.jpg',
                    selectedMela.title || selectedMela.event
                  );
                }}
              >
                Download Poster
              </Button>
            </div>
          </div>

          {/* Specific Job Mela Header Details Card */}
          <div
            className="card"
            style={{
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '11px',
                    color: '#7c3aed',
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {formatMelaId(selectedMela.id)}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {selectedMela.status || 'Upcoming'}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Location: <strong>{selectedMela.city}, {selectedMela.state || 'Andhra Pradesh'}</strong>
                  </span>
                </div>

                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  {selectedMela.title || selectedMela.event}
                </h2>

                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 780, lineHeight: 1.5 }}>
                  {selectedMela.description || 'Premier recruitment drive featuring verified state and national employers. Candidates can participate in fast-track spot interviews, receive guidance, and apply for open vacancies.'}
                </p>
              </div>

              {/* Event Registration Status / Action */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                {isEventRegistered(selectedMela.id) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className="badge badge-success" style={{ fontSize: '11px', padding: '6px 12px' }}>
                      <CheckCircle2 size={13} style={{ marginRight: 4 }} /> Registration Confirmed
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Ticket size={14} />}
                      onClick={() => handleOpenPass(registeredEvents.find(e => String(e.id) === String(selectedMela.id) || String(e.melaId) === String(selectedMela.id)) || selectedMela)}
                    >
                      View Digital QR Pass
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Ticket size={16} />}
                    onClick={() => handleOpenEventRegistration(selectedMela)}
                  >
                    Register for Job Mela Pass
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Logistics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 'var(--space-4)',
              background: 'var(--color-bg)',
              padding: 'var(--space-4) var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Date & Timings</span>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{selectedMela.date}</strong>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedMela.time || '09:00 AM - 05:30 PM'}</p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Venue Location</span>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{selectedMela.venue || selectedMela.address}</strong>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedMela.city}, {selectedMela.state || 'AP'}</p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Organizing Authority</span>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{selectedMela.organizer || 'NTR Vikasa Authority'}</strong>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>State Employment Initiative</p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Event Capacity</span>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)' }}>{selectedMela.maxCapacity || selectedMela.seats || 3500} Students</strong>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pre-registered Fast-Track</p>
              </div>
            </div>

            {/* ── HIGHLIGHTED LIVE METRICS DASHBOARD (User Specification) ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)'
            }}>
              {/* Stat 1: Unique Candidates Applied */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Applied Candidates
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: '#bfdbfe',
                    color: '#1e3a8a',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    Unique Person
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1e3a8a', lineHeight: 1 }}>
                    {currentMelaStats?.uniqueAppliedCandidatesCount || 0}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#2563eb' }}>
                    {(currentMelaStats?.uniqueAppliedCandidatesCount || 0) === 1 ? 'Candidate' : 'Candidates'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#3b82f6', margin: 0, marginTop: 2 }}>
                  Distinct individuals applied / registered
                </p>
              </div>

              {/* Stat 2: Participating Companies */}
              <div style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1.5px solid #ddd6fe',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Companies in Mela
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: '#ddd6fe',
                    color: '#5b21b6',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    Active Stalls
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#4c1d95', lineHeight: 1 }}>
                    {selectedMelaCompanies.length || currentMelaStats?.companiesCount || 0}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#7c3aed' }}>
                    Companies
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#8b5cf6', margin: 0, marginTop: 2 }}>
                  Employers interviewing on spot
                </p>
              </div>

              {/* Stat 3: Total Company Applications Submitted */}
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1.5px solid #a7f3d0',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Submissions
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: '#a7f3d0',
                    color: '#065f46',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    Multi-Apply
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#064e3b', lineHeight: 1 }}>
                    {currentMelaStats?.totalCompanyApplicationsCount || 0}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#059669' }}>
                    Applications
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#10b981', margin: 0, marginTop: 2 }}>
                  Role applications across all stalls
                </p>
              </div>

              {/* Stat 4: Candidates Not in This Mela */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1.5px solid #cbd5e1',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Not in This Mela
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: '#e2e8f0',
                    color: '#334155',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    Unregistered
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                    {currentMelaStats?.notAppliedCandidatesCount || 0}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#64748b' }}>
                    Candidates
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0, marginTop: 2 }}>
                  Eligible platform talent pool
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setActiveDetailTab('COMPANIES')}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeDetailTab === 'COMPANIES' ? '2.5px solid var(--color-primary-600)' : '2.5px solid transparent',
                  color: activeDetailTab === 'COMPANIES' ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Building2 size={16} />
                Participating Companies & Openings ({filteredCompanies.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('BREAKDOWN')}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeDetailTab === 'BREAKDOWN' ? '2.5px solid var(--color-primary-600)' : '2.5px solid transparent',
                  color: activeDetailTab === 'BREAKDOWN' ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Users size={16} />
                Candidate Participation Breakdown & Summary
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: PARTICIPATING COMPANIES & ROLES
             ══════════════════════════════════════════════════════════════ */}
          {activeDetailTab === 'COMPANIES' ? (
            <div
              className="card"
              style={{
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-6)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <Building2 size={20} style={{ color: 'var(--color-primary-600)' }} />
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>
                    Participating Companies ({filteredCompanies.length})
                  </h3>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Each company manages direct walk-in interviews. You can apply to multiple employers; your event pass grants access to all interview stalls.
                </p>
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ flex: 1, minWidth: 260, maxWidth: 440 }}>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><Search size={15} style={{ color: 'var(--color-primary-600)' }} /></span>
                    <input
                      className="input has-icon-left"
                      placeholder="Search participating companies by name or role..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sector Filters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['ALL', 'Information Technology', 'Digital Services', 'Engineering & Product', 'Corporate Services'].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCompanySectorFilter(sec)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: companySectorFilter === sec ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        background: companySectorFilter === sec ? 'var(--color-primary-50)' : 'var(--color-surface)',
                        color: companySectorFilter === sec ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {sec === 'ALL' ? 'All Companies' : sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Responsive Grid */}
              {filteredCompanies.length === 0 ? (
                <div style={{ padding: 'var(--space-8)' }}>
                  <EmptyState
                    icon="default"
                    title="No Companies Found"
                    description="No participating companies match your search or filter criteria in this Job Mela."
                  />
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 'var(--space-4)'
                  }}>
                    {paginatedCompanies.map((comp) => {
                      const isApplied = isCompanyJobApplied(selectedMela.id, comp.company, comp.role);
                      const compStat = currentMelaStats?.getCompanyStats ? currentMelaStats.getCompanyStats(comp) : { appliedCount: 0, applicants: [] };

                      return (
                        <div
                          key={comp.id}
                          className="card card-hoverable"
                          style={{
                            borderRadius: 'var(--radius-xl)',
                            padding: 'var(--space-5)',
                            border: isApplied ? '1.5px solid var(--color-success-400)' : '1px solid var(--color-border)',
                            background: isApplied ? '#f0fdf4' : 'var(--color-surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 'var(--space-4)'
                          }}
                        >
                          <div>
                            {/* Top: Avatar + Name + Sector Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                                <div style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 'var(--radius-lg)',
                                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                                  color: '#fff',
                                  fontSize: 'var(--text-base)',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {comp.company?.[0] || 'C'}
                                </div>

                                <div>
                                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
                                    {comp.company}
                                  </h4>
                                  <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                                    {comp.sector || 'Participating Employer'}
                                  </span>
                                </div>
                              </div>

                              <span className="badge badge-gray" style={{ fontSize: '10px', flexShrink: 0 }}>
                                {comp.location}
                              </span>
                            </div>

                            {/* Specific Company Applicants Counter Pill (User Specification) */}
                            <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                background: compStat.appliedCount > 0 ? '#eff6ff' : 'var(--color-gray-100)',
                                border: compStat.appliedCount > 0 ? '1px solid #bfdbfe' : '1px solid var(--color-border)',
                                color: compStat.appliedCount > 0 ? '#1e40af' : 'var(--color-text-muted)',
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                <Users size={12} />
                                <span>
                                  {compStat.appliedCount} {compStat.appliedCount === 1 ? 'Candidate Applied' : 'Candidates Applied'}
                                </span>
                              </div>

                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                • {comp.vacancies}
                              </span>
                            </div>

                            {/* Role Details */}
                            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Walk-in Hiring Role:</span>
                              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                                {comp.role}
                              </strong>
                              <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ color: 'var(--color-success-700)', fontWeight: 700 }}>💰 {comp.salary}</span>
                                <span>🎓 {comp.qualification}</span>
                                <span>⏱️ {comp.experience}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Action */}
                          {isApplied ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                              width: '100%',
                              borderTop: '1px solid var(--color-gray-200)',
                              paddingTop: 'var(--space-3)'
                            }}>
                              {(() => {
                                const appliedApp = getAppliedCompanyApp(selectedMela.id, comp.company, comp.role);
                                return (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                                      <span style={{ fontSize: '11px', color: 'var(--color-success-700)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CheckCircle2 size={14} /> Applied to this Company
                                      </span>
                                      <StatusBadge status={appliedApp?.status || 'APPLIED'} />
                                    </div>

                                    <div style={{
                                      fontSize: '11px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 3,
                                      background: '#ffffff',
                                      padding: '8px 10px',
                                      borderRadius: 'var(--radius-md)',
                                      border: '1px solid var(--color-border)'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Application No:</span>
                                        <span style={{ fontFamily: 'monospace, monospace', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                                          {appliedApp?.appNumber || appliedApp?.appId || 'NTR-01-02-0024'}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Applied Date:</span>
                                        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{appliedApp?.appliedDate || 'Today'}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Mela Pass Ref:</span>
                                        <span style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontFamily: 'monospace' }}>
                                          {appliedApp?.passId || 'PASS-AP-CONFIRMED'}
                                        </span>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedAppForDetails(appliedApp);
                                          setAppDetailsModalOpen(true);
                                        }}
                                      >
                                        View Application Details
                                      </Button>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderTop: '1px solid var(--color-gray-100)',
                              paddingTop: 'var(--space-3)'
                            }}>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                                Direct Walk-in Slot Available
                              </span>

                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleOpenCompanyApply(selectedMela, comp.company, comp.role, comp.salary, comp.location, comp.companyEntryId, comp.companyId)}
                              >
                                Apply to {comp.company}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination (10 companies per page) */}
                  {totalCompanyPages > 1 && (
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
                      <Pagination
                        currentPage={companyPage}
                        totalPages={totalCompanyPages}
                        pageSize={COMPANIES_PER_PAGE}
                        onPageChange={(p) => setCompanyPage(p)}
                        itemName="participating companies"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════════
                TAB 2: CANDIDATE PARTICIPATION BREAKDOWN & SUMMARY
               ══════════════════════════════════════════════════════════════ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {/* Architecture Explanation Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1.5px solid #93c5fd',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#2563eb', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Info size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#1e3a8a', margin: '0 0 4px 0' }}>
                    Multi-Company Application Rule & Single Candidate Metrics
                  </h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: '#1e40af', lineHeight: 1.5, margin: 0 }}>
                    In this Job Mela, a single candidate can apply to multiple participating companies simultaneously.
                    The total Job Mela metric accurately reflects <strong>unique candidates ({currentMelaStats?.uniqueAppliedCandidatesCount || 0} individuals)</strong>,
                    while each company stall tracks their own separate applicant members.
                    Total role applications submitted across all stalls: <strong>{currentMelaStats?.totalCompanyApplicationsCount || 0} applications</strong>.
                  </p>
                </div>
              </div>

              {/* Two Column Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
                {/* Column A: Applied / Registered Candidates */}
                <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={16} style={{ color: '#2563eb' }} />
                        Applied / Registered Candidates ({currentMelaStats?.uniqueAppliedCandidates?.length || 0})
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Unique individuals with entry passes or applications</span>
                    </div>
                  </div>

                  {(currentMelaStats?.uniqueAppliedCandidates || []).length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No candidates have applied or registered for this Job Mela yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {(currentMelaStats?.uniqueAppliedCandidates || []).map((cand, idx) => (
                        <div
                          key={cand.id || idx}
                          style={{
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                              {cand.name} {cand.email === candidate.email && <span className="badge badge-primary" style={{ fontSize: '9px', marginLeft: 4 }}>You</span>}
                            </strong>
                            {cand.hasPass && (
                              <span className="badge badge-success" style={{ fontSize: '9px' }}>
                                Pass #{cand.passId}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{cand.email}</span>
                          {cand.appliedCompanies && cand.appliedCompanies.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Applied to:</span>
                              {cand.appliedCompanies.map((cName, cIdx) => (
                                <span key={cIdx} style={{ fontSize: '10px', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                                  {cName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column B: Candidates Not in This Mela */}
                <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={16} style={{ color: '#64748b' }} />
                        Candidates Not in This Mela ({currentMelaStats?.notAppliedCandidates?.length || 0})
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Registered platform job seekers who haven't applied yet</span>
                    </div>
                  </div>

                  {(currentMelaStats?.notAppliedCandidates || []).length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>All platform candidates are registered for this event.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 420, overflowY: 'auto' }}>
                      {(currentMelaStats?.notAppliedCandidates || []).slice(0, 15).map((cand, idx) => (
                        <div
                          key={cand.id || idx}
                          style={{
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{cand.name}</strong>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                              {cand.education || cand.qualificationLevel || 'Graduate'} • {cand.location || 'NTR District'}
                            </p>
                          </div>
                          <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                            Unregistered
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
            VIEW LEVEL 1: MAIN CANDIDATE JOB MELAS LISTING VIEW
           ══════════════════════════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

          {/* ── Section 1: My Registered Event Passes ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Ticket size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>
                My Registered Event Passes ({registeredEvents.length})
              </h2>
            </div>

            {registeredEvents.length === 0 ? (
              <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', textAlign: 'center' }}>
                <EmptyState
                  icon="default"
                  title="No Registered Job Melas Yet"
                  description="You have not registered for any upcoming Job Melas yet. Browse the scheduled events below to reserve your free fast-track digital pass."
                />
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <Button variant="primary" size="sm" onClick={handleScrollToBrowse}>
                    Browse Job Melas Below
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {registeredEvents.map((event) => (
                  <div
                    key={event.id || event.passId}
                    className="card"
                    style={{
                      borderRadius: 'var(--radius-2xl)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-primary-200)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Top Pass Banner */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
                      color: '#fff',
                      padding: 'var(--space-4) var(--space-6)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '10px',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.35)',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {formatMelaId(event.id || event.melaId)}
                          </span>
                          <span className="badge badge-success" style={{ fontSize: '10px' }}>
                            <CheckCircle2 size={11} style={{ marginRight: 2 }} /> Registration Confirmed
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>Pass ID: {event.passId}</span>
                        </div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#ffffff' }}>
                          {event.title}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Ticket size={14} />}
                          onClick={() => handleOpenPass(event)}
                          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                          View Digital QR Pass
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ArrowRight size={13} />}
                          onClick={() => {
                            setSelectedMela(event);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          View Details & Apply
                        </Button>
                      </div>
                    </div>

                    {/* Event Compact Details */}
                    <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Date & Timings</span>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>{event.date}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{event.time}</p>
                        </div>

                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Venue Location</span>
                          <strong style={{ fontSize: 'var(--text-xs)' }}>{event.venue}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{event.city}, Andhra Pradesh</p>
                        </div>

                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Allocated Entry Point</span>
                          <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)' }}>{event.gateNumber}</strong>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Priority check-in gate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 2: Browse All Job Melas ── */}
          <div id="browse-job-melas-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <CalendarDays size={18} style={{ color: 'var(--color-primary-600)' }} />
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>
                    Browse All Job Melas
                  </h2>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Explore scheduled hiring drives, check participating employers, and reserve your free pass.
                </p>
              </div>

              {/* Search Bar */}
              <div style={{ width: '100%', maxWidth: 360 }}>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Search size={15} style={{ color: 'var(--color-primary-600)' }} /></span>
                  <input
                    className="input has-icon-left"
                    placeholder="Search by title, city, venue..."
                    value={melaSearch}
                    onChange={(e) => setMelaSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 2 }}>
              {melaTabs.map((tab) => {
                const active = melaStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMelaStatusFilter(tab.key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: active ? 'var(--color-primary-600)' : 'var(--color-surface)',
                      color: active ? '#fff' : 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {tab.label}
                    <span style={{
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--color-gray-100)',
                      color: active ? '#fff' : 'var(--color-text-muted)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px'
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Job Melas Grid — 3 columns × 3 rows = 9 per page */}
            {filteredMelas.length === 0 ? (
              <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)' }}>
                <EmptyState
                  icon="default"
                  title="No Job Melas Found"
                  description="No job melas match your current search and filter criteria."
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {paginatedMelas.map((mela) => {
                  const isRegistered = isEventRegistered(mela.id);
                  const stats = getMelaStats ? getMelaStats(mela.id) : null;
                  const companiesCount = (mela.participatingCompanies && mela.participatingCompanies.length) || mela.companiesCount || mela.companies || 0;
                  const appliedCandidatesCount = stats ? stats.uniqueAppliedCandidatesCount : (mela.registeredCandidatesCount || 0);

                  const posterImage = mela.posterImage || mela.banner || mela.image || '/hero2.jpg';

                  return (
                    <div
                      key={mela.id}
                      className="card card-hoverable"
                      style={{
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--space-6)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)'
                      }}
                    >
                      <div>
                        {/* Official Flyer / Poster Image */}
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: '170px',
                            background: '#090d16',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            marginBottom: 'var(--space-3)'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedPosterMela(mela);
                          }}
                          title="Click to view full official flyer and download"
                        >
                          <img
                            src={posterImage}
                            alt={mela.title || mela.event}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 250ms ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              left: 8,
                              right: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '4px 8px',
                              background: 'rgba(15, 23, 42, 0.82)',
                              backdropFilter: 'blur(6px)',
                              borderRadius: 'var(--radius-md)',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Eye size={12} style={{ color: '#38bdf8' }} /> View Flyer
                            </span>
                            <button
                              type="button"
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                downloadPosterImage(posterImage, mela.title || mela.event);
                              }}
                              title="Download this poster"
                            >
                              <Download size={11} /> Download
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '10px',
                              color: '#7c3aed',
                              background: '#f5f3ff',
                              border: '1px solid #ddd6fe',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {formatMelaId(mela.id)}
                            </span>
                            <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                              {mela.status || 'Upcoming'}
                            </span>
                          </div>

                          {isRegistered && (
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>
                              <CheckCircle2 size={11} style={{ marginRight: 2 }} /> Pass Registered
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.3 }}>
                          {mela.title || mela.event}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-3) 0' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CalendarDays size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                            {mela.date} ({mela.time || '09:00 AM - 05:00 PM'})
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                            {mela.venue || mela.address}, {mela.city}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={13} style={{ color: '#7c3aed', flexShrink: 0 }} />
                            <strong>{companiesCount} Participating Companies</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                            <strong>{appliedCandidatesCount} Unique Candidates Applied</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--color-gray-100)',
                        paddingTop: 'var(--space-3)'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-success-700)', fontWeight: 700 }}>
                          Free Entry Pass
                        </span>

                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Eye size={13} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPosterMela(mela);
                            }}
                            title="View full official flyer"
                          >
                            Poster
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            rightIcon={<ArrowRight size={13} />}
                            onClick={() => {
                              setSelectedMela(mela);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Browse listing pagination */}
            {filteredMelas.length > 0 && (
              <Pagination
                currentPage={melaPage}
                totalPages={totalMelaPages}
                totalItems={filteredMelas.length}
                pageSize={MELAS_PER_PAGE}
                onPageChange={(page) => {
                  setMelaPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                itemName="job melas"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Modal 1: Job Mela Event Registration Modal ── */}
      {eventRegModalOpen && selectedMelaForReg && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setEventRegModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%', maxWidth: 540,
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-bg)'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                  Job Mela Fast-Track Registration
                </span>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{selectedMelaForReg.title}</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {selectedMelaForReg.venue}, {selectedMelaForReg.city} • {selectedMelaForReg.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEventRegModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmEventRegistration} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
              <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', lineHeight: 1.4 }}>
                    ℹ️ <strong>Event Entry Pass:</strong> This registration issues your official digital entry pass for the venue. You will be able to apply to participating companies and book interview slots separately.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Full Name</label>
                  <input
                    className="input"
                    value={eventRegForm.name}
                    onChange={(e) => setEventRegForm({ ...eventRegForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Email Address</label>
                    <input
                      type="email"
                      className="input"
                      value={eventRegForm.email}
                      onChange={(e) => setEventRegForm({ ...eventRegForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Phone Number</label>
                    <input
                      type="tel"
                      className="input"
                      value={eventRegForm.phone}
                      onChange={(e) => setEventRegForm({ ...eventRegForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Preferred Entry Time Slot</label>
                  <select
                    className="input"
                    value={eventRegForm.timeSlot}
                    onChange={(e) => setEventRegForm({ ...eventRegForm, timeSlot: e.target.value })}
                  >
                    <option>Morning Session (09:00 AM - 01:00 PM)</option>
                    <option>Afternoon Session (01:30 PM - 05:30 PM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Selected Resume</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <FileText size={18} style={{ color: 'var(--color-primary-600)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, flex: 1 }}>{eventRegForm.resume}</span>
                    <span className="badge badge-success" style={{ fontSize: '10px' }}>Active Profile Resume</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', background: 'var(--color-bg)' }}>
                <Button type="button" variant="secondary" onClick={() => setEventRegModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" leftIcon={<Ticket size={15} />}>
                  Register for Job Mela
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Company-Specific Job Application Modal ── */}
      {companyApplyModalOpen && selectedCompanyJob && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setCompanyApplyModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%', maxWidth: 580,
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-bg)'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                  Company-Specific Application
                </span>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>
                  Apply to {selectedCompanyJob.companyName}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Role: <strong>{selectedCompanyJob.role}</strong> • {selectedCompanyJob.melaTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompanyApplyModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Completion Gate vs Application Form */}
            {(candidate?.profileCompletion ?? 0) < 70 ? (
              <div style={{ padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)'
                }}>
                  <AlertCircle size={36} />
                </div>

                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  Complete your profile to apply
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
                  Your profile is currently {candidate?.profileCompletion ?? 0}% complete. Please complete at least 70% of your profile before applying for jobs.
                </p>

                <div style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Profile Completion:
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>
                      {candidate?.profileCompletion ?? 0}% <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ 70% Required</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(candidate?.profileCompletion ?? 0, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCompanyApplyModalOpen(false);
                      navigate('/candidate/profile');
                    }}
                    rightIcon={<ArrowRight size={15} />}
                  >
                    Complete Profile
                  </Button>
                  <Button variant="secondary" onClick={() => setCompanyApplyModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmitCompanyApplication} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {/* Notice */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.4 }}>
                      🎯 <strong>Target Employer:</strong> You are submitting a dedicated job application to <strong>{selectedCompanyJob.companyName}</strong> for the position of <strong>{selectedCompanyJob.role}</strong>.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Full Name</label>
                      <input
                        className="input"
                        value={companyApplyForm.name}
                        onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Email Address</label>
                      <input
                        type="email"
                        className="input"
                        value={companyApplyForm.email}
                        onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Phone Number</label>
                      <input
                        type="tel"
                        className="input"
                        value={companyApplyForm.phone}
                        onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Experience</label>
                      <input
                        className="input"
                        value={companyApplyForm.experience}
                        onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, experience: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Education Qualification</label>
                    <input
                      className="input"
                      value={companyApplyForm.education}
                      onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, education: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Key Technical Skills</label>
                    <input
                      className="input"
                      value={companyApplyForm.skills}
                      onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, skills: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Selected Resume</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <FileText size={18} style={{ color: 'var(--color-primary-600)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, flex: 1 }}>{companyApplyForm.resume}</span>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Attached</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>Cover Note / Message to Recruiter</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={companyApplyForm.coverNote}
                      onChange={(e) => setCompanyApplyForm({ ...companyApplyForm, coverNote: e.target.value })}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', background: 'var(--color-bg)' }}>
                  <Button type="button" variant="secondary" onClick={() => setCompanyApplyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" leftIcon={<Send size={15} />}>
                    Submit Application
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal 3: Application Submission Success Modal ── */}
      {successModalOpen && submittedAppInfo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1150,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSuccessModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%', maxWidth: 480,
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--color-border)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--color-success-50)', color: 'var(--color-success-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              border: '2px solid var(--color-success-200)'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 4 }}>
              Application Submitted! 🎉
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Your application has been submitted specifically for:
            </p>

            <div style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Role:</span>
                <strong style={{ fontSize: 'var(--text-xs)' }}>{submittedAppInfo.role}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Company:</span>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)' }}>{submittedAppInfo.companyName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Job Mela:</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text)' }}>{submittedAppInfo.melaTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: 4, marginTop: 4 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Application No:</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-700)', fontFamily: 'monospace, monospace' }}>{submittedAppInfo.appId}</span>
              </div>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.4 }}>
              💡 <strong>Next Step:</strong> Bring 3 hard copies of your resume along with your Digital QR Pass to the company's designated interview counter at the event.
            </p>

            <Button variant="primary" fullWidth onClick={() => setSuccessModalOpen(false)}>
              Got It / Return to Job Mela
            </Button>
          </div>
        </div>
      )}

      {/* ── Modal 4: Digital QR Pass Modal ── */}
      {selectedPass && passModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setPassModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%', maxWidth: 460,
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--color-border)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: '#ffffff',
              border: '2px dashed var(--color-primary-400)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-4)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span className="badge badge-success" style={{ marginBottom: 'var(--space-3)' }}>
                Official Fast-Track Entry Pass
              </span>

              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 2 }}>{selectedPass.title}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Candidate: <strong>{candidate.name}</strong> • Event ID: <strong style={{ fontFamily: 'monospace', color: '#7c3aed' }}>{formatMelaId(selectedPass.id)}</strong> • Registration ID: <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary-600)' }}>{selectedPass.passId}</strong>
              </p>

              {/* QR placeholder */}
              <div style={{
                width: 140, height: 140,
                background: 'var(--color-gray-100)',
                borderRadius: 'var(--radius-xl)',
                margin: '0 auto var(--space-4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--color-border)'
              }}>
                <QrCode size={80} style={{ color: 'var(--color-primary-900)' }} />
                <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: 2 }}>Scan at Entrance</span>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <strong>Venue:</strong> {selectedPass.venue}, {selectedPass.city}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 700, marginTop: 2 }}>
                {selectedPass.gateNumber}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="secondary" fullWidth onClick={() => setPassModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" fullWidth leftIcon={<Download size={14} />} onClick={handleDownloadPass}>
                Download PDF Pass
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal 5: Shared Application Details Modal ── */}
      <ApplicationDetailsModal
        isOpen={appDetailsModalOpen}
        onClose={() => setAppDetailsModalOpen(false)}
        application={selectedAppForDetails}
        candidate={candidate}
      />

      {/* Full Resolution Poster Lightbox Modal */}
      {selectedPosterMela && (
        <JobMelaPosterModal
          isOpen={Boolean(selectedPosterMela)}
          onClose={() => setSelectedPosterMela(null)}
          posterUrl={selectedPosterMela.posterImage || selectedPosterMela.banner || selectedPosterMela.image || '/hero2.jpg'}
          eventTitle={selectedPosterMela.title || selectedPosterMela.event}
          eventDate={selectedPosterMela.date}
          eventVenue={selectedPosterMela.venue || selectedPosterMela.address}
        />
      )}
    </div>
  );
}
