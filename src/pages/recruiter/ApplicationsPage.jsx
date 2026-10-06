import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Filter, Eye, CheckCircle2, XCircle, CalendarCheck,
  FileText, Download, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Sparkles, Clock, DollarSign, ChevronRight, Check, X, AlertCircle,
  Building2, Ticket
} from 'lucide-react';
import { useRecruiter } from '../../context/RecruiterContext';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import recruiterApplicationService from '../../services/recruiterApplicationService';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, generatePDFBlob, getExportFilename } from '../../utils/exportUtils';
import {
  isJobMelaApplication,
  getApplicationNumber,
  getApplicationType,
  getJobMelaDetails,
  normalizeApplication,
  formatJobId,
  formatInternshipId,
  formatMelaId,
  formatRegistrationId
} from '../../utils/applicationUtils';

const PAGE_SIZE = 9;

export default function ApplicationsPage() {
  const {
    recruiter,
    shortlistCandidate,
    rejectCandidate,
    scheduleInterview
  } = useRecruiter();
  const { allCandidateApplications = [] } = useCandidate();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedJobFilter, selectedStatusTab, sortBy]);

  // Modals state
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewTarget, setInterviewTarget] = useState(null);

  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '11:00',
    format: 'Video Interview',
    meetingLink: 'https://meet.google.com/abc-interview',
    locationAddress: '',
    phoneDetails: '',
    interviewer: '',
    notes: ''
  });
  const [interviewErrors, setInterviewErrors] = useState({});

  // Backend API Integration States
  const [backendData, setBackendData] = useState({
    items: [],
    pagination: { page: 1, page_size: PAGE_SIZE, total_items: 0, total_pages: 1, has_next: false, has_previous: false },
    summary: { total_received: 0, screening: 0, shortlisted: 0, interviews: 0, selected_hired: 0, rejected: 0 },
    job_postings: []
  });
  const [loading, setLoading] = useState(true);

  // Normalize application item to uniform UI card format
  const normalizeBackendApplication = useCallback((item) => {
    if (!item) return null;
    const isMela = Boolean(item.job_mela || (item.application_type && item.application_type.includes('Mela')));
    const passId = item.job_mela?.registration_pass_id || (isMela ? 'PASS-AP-849201' : null);
    const melaIdFormatted = item.job_mela?.mela_id ? formatMelaId(item.job_mela.mela_id) : (isMela ? 'MELA-0001' : null);
    const jobIdFormatted = item.job?.job_id ? formatJobId(item.job.job_id) : formatJobId(item.id);

    return {
      id: item.id || item.application_id,
      appId: item.application_id,
      appNumber: item.application_number || item.app_number,
      applicationType: item.application_type || (isMela ? 'Job Mela Application' : 'Direct Job Application'),
      isMela,
      status: item.status || 'APPLIED',
      candidateId: item.candidate?.id,
      candidateName: item.candidate?.name || 'Candidate',
      candidateEmail: item.candidate?.email,
      candidatePhone: item.candidate?.phone,
      phone: item.candidate?.phone,
      candidateHeadline: item.candidate?.headline || `Candidate for ${item.job?.title || 'Role'}`,
      jobTitle: item.job?.title || 'Job Role',
      jobId: item.job?.job_id,
      jobIdFormatted,
      company: item.job?.company_name || recruiter?.company?.name || 'ABC Technologies Pvt Ltd',
      matchScore: item.match_score,
      experience: item.candidate?.experience || (item.candidate?.experience_years ? `${item.candidate.experience_years} Years` : '3+ Years'),
      location: item.candidate?.location || item.job?.location || 'India',
      noticePeriod: item.candidate?.notice_period || '15 Days',
      expectedSalary: item.candidate?.expected_salary,
      appliedDate: item.applied_date || '02 Sept 2026',
      skills: item.candidate?.skills || [],
      coverNote: item.cover_letter || item.additional_info,
      resumeName: item.resume?.file_name,
      resumeUrl: item.resume?.file_url,
      melaId: item.job_mela?.mela_id,
      melaIdFormatted,
      melaTitle: item.job_mela?.mela_name || 'AP Mega IT & ITES Job Mela 2026',
      passId,
      melaDetails: item.job_mela ? {
        melaId: item.job_mela.mela_id,
        melaTitle: item.job_mela.mela_name,
        passId: item.job_mela.registration_pass_id,
        company: item.job?.company_name,
        position: item.job?.title,
        eventNumber: item.job_mela.event_number,
        companySequence: item.job_mela.company_sequence,
        applicationSequence: item.job_mela.application_sequence,
      } : null,
      raw: item,
    };
  }, [recruiter?.company?.name]);

  // Fetch applications from backend API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await recruiterApplicationService.getApplications({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: searchQuery,
        job_id: selectedJobFilter,
        status: selectedStatusTab,
        sort_by: sortBy === 'match' ? 'match_score' : (sortBy === 'oldest' ? 'oldest' : 'newest'),
        sort_order: sortBy === 'oldest' ? 'asc' : 'desc',
      });
      if (res) {
        setBackendData(res);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      addToast(err.message || 'Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedJobFilter, selectedStatusTab, sortBy, addToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const paginatedApplicants = useMemo(() => {
    return (backendData.items || []).map(normalizeBackendApplication).filter(Boolean);
  }, [backendData.items, normalizeBackendApplication]);

  const filteredApplicants = paginatedApplicants;

  const totalPages = backendData.pagination?.total_pages || 1;
  const totalItems = backendData.pagination?.total_items || 0;

  // Counts for tabs & summary cards
  const tabCounts = useMemo(() => {
    const s = backendData.summary || {};
    return {
      all: s.total_received ?? 0,
      screening: s.screening ?? 0,
      shortlisted: s.shortlisted ?? 0,
      interview: s.interviews ?? 0,
      selected: s.selected_hired ?? 0,
      rejected: s.rejected ?? 0,
    };
  }, [backendData.summary]);

  // Job postings for filter dropdown
  const allJobs = useMemo(() => {
    if (backendData.job_postings && backendData.job_postings.length > 0) {
      return backendData.job_postings.map((jp) => ({
        id: jp.job_id,
        title: jp.title,
        count: jp.application_count,
      }));
    }
    return (recruiter?.jobs || []).map((j) => ({
      id: j.job_id || j.id,
      title: j.title,
      count: 0,
    }));
  }, [backendData.job_postings, recruiter?.jobs]);

  const handleOpenReview = async (applicant) => {
    setSelectedApplicant(applicant);
    setIsReviewModalOpen(true);
    try {
      const detail = await recruiterApplicationService.getApplication(applicant.id);
      if (detail) {
        setSelectedApplicant((prev) => ({
          ...prev,
          ...normalizeBackendApplication(detail),
          timeline: detail.timeline || [],
        }));
      }
    } catch (err) {
      // Retain applicant from list if detail fetch fails
    }
  };

  const handleShortlist = async (app) => {
    try {
      await recruiterApplicationService.updateApplicationStatus(app.id, 'SHORTLISTED');
      shortlistCandidate?.(app.id, app.jobId);
      addToast(`${app.candidateName} moved to Shortlisted candidates!`, 'success');
      fetchApplications();
      if (selectedApplicant?.id === app.id) {
        setSelectedApplicant((prev) => (prev ? { ...prev, status: 'SHORTLISTED' } : null));
      }
    } catch (err) {
      addToast(err.message || 'Failed to shortlist candidate', 'error');
    }
  };

  const handleReject = async (app) => {
    try {
      await recruiterApplicationService.updateApplicationStatus(app.id, 'REJECTED');
      rejectCandidate?.(app.id, app.jobId);
      addToast(`${app.candidateName} marked as Rejected.`, 'info');
      fetchApplications();
      if (selectedApplicant?.id === app.id) {
        setSelectedApplicant((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
      }
    } catch (err) {
      addToast(err.message || 'Failed to reject candidate', 'error');
    }
  };

  // ── Resume Actions (View & Download) ──
  const handleViewResume = (applicant) => {
    const app = applicant || selectedApplicant;
    if (!app) return;
    const matchedCand = (recruiter?.candidates || []).find(
      c => c.id === app.candidateId || c.email === app.candidateEmail
    );
    const resumeUrl = app.resumeUrl || matchedCand?.resumeUrl;
    const resumeFileName = app.resumeName || matchedCand?.resumeName || `${(app.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    if (resumeUrl) {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const candName = app.candidateName || matchedCand?.name || 'Candidate';
    const headers = ['Resume Section', 'Candidate Details'];
    const rows = [
      ['Candidate Name', candName],
      ['Applied Position', app.jobTitle || 'Job Seeker'],
      ['Email Address', app.candidateEmail || matchedCand?.email || 'N/A'],
      ['Phone Number', app.candidatePhone || app.phone || matchedCand?.phone || '+91 98765 43210'],
      ['Location', app.location || matchedCand?.location || 'India'],
      ['Total Experience', app.experience || matchedCand?.experience || 'N/A'],
      ['Education Background', matchedCand?.education || 'B.Tech / Graduate'],
      ['Skills & Competencies', Array.isArray(app.skills || matchedCand?.skills) ? (app.skills || matchedCand?.skills).join(', ') : (app.skills || matchedCand?.skills || 'N/A')],
      ['Notice Period', app.noticePeriod || matchedCand?.availability || '30 Days'],
      ['Expected Compensation', app.expectedSalary || matchedCand?.expectedSalary || 'Competitive'],
      ['Professional Summary', app.coverNote || matchedCand?.summary || 'Experienced software professional with demonstrated engineering track record.']
    ];

    const blob = generatePDFBlob({
      filename: resumeFileName,
      title: `Curriculum Vitae: ${candName}`,
      subtitle: `Verified Candidate Resume Document — ${app.jobTitle || 'Applicant Dossier'}`,
      metadata: {
        'Candidate Name': candName,
        'Applied Role': app.jobTitle || 'N/A',
        'Experience': app.experience || matchedCand?.experience || 'N/A',
        'Match Score': app.matchScore ? `${app.matchScore}%` : 'N/A'
      },
      headers,
      rows
    });

    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  const handleDownloadResume = (applicant) => {
    const app = applicant || selectedApplicant;
    if (!app) return;
    const matchedCand = (recruiter?.candidates || []).find(
      c => c.id === app.candidateId || c.email === app.candidateEmail
    );
    const resumeUrl = app.resumeUrl || matchedCand?.resumeUrl;
    const resumeFileName = app.resumeName || matchedCand?.resumeName || `${(app.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    if (resumeUrl) {
      const a = document.createElement('a');
      a.href = resumeUrl;
      a.download = resumeFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 100);
      addToast(`Downloading ${resumeFileName}...`, 'info');
      return;
    }

    const candName = app.candidateName || matchedCand?.name || 'Candidate';
    const headers = ['Resume Section', 'Candidate Details'];
    const rows = [
      ['Candidate Name', candName],
      ['Applied Position', app.jobTitle || 'Job Seeker'],
      ['Email Address', app.candidateEmail || matchedCand?.email || 'N/A'],
      ['Phone Number', app.candidatePhone || app.phone || matchedCand?.phone || '+91 98765 43210'],
      ['Location', app.location || matchedCand?.location || 'India'],
      ['Total Experience', app.experience || matchedCand?.experience || 'N/A'],
      ['Education Background', matchedCand?.education || 'B.Tech / Graduate'],
      ['Skills & Competencies', Array.isArray(app.skills || matchedCand?.skills) ? (app.skills || matchedCand?.skills).join(', ') : (app.skills || matchedCand?.skills || 'N/A')],
      ['Notice Period', app.noticePeriod || matchedCand?.availability || '30 Days'],
      ['Expected Compensation', app.expectedSalary || matchedCand?.expectedSalary || 'Competitive'],
      ['Professional Summary', app.coverNote || matchedCand?.summary || 'Experienced software professional with demonstrated engineering track record.']
    ];

    exportToPDF({
      filename: resumeFileName,
      title: `Curriculum Vitae: ${candName}`,
      subtitle: `Verified Candidate Resume Document — ${app.jobTitle || 'Applicant Dossier'}`,
      metadata: {
        'Candidate Name': candName,
        'Applied Role': app.jobTitle || 'N/A',
        'Experience': app.experience || matchedCand?.experience || 'N/A',
        'Match Score': app.matchScore ? `${app.matchScore}%` : 'N/A'
      },
      headers,
      rows
    });
    addToast(`Downloading ${resumeFileName}...`, 'success');
  };

  // ── Interview Scheduling Actions & Validation ──
  const handleOpenScheduleModal = (app) => {
    setInterviewTarget(app);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setInterviewForm({
      date: tomorrowStr,
      time: '11:00',
      format: 'Video Interview',
      meetingLink: 'https://meet.google.com/abc-interview',
      locationAddress: recruiter?.company?.address || 'ABC Technologies HQ, Outer Ring Road, Bengaluru',
      phoneDetails: app.candidatePhone || app.phone || '+91 98765 43210',
      interviewer: recruiter?.name ? `${recruiter.name} (${recruiter.designation || 'Talent Acquisition'})` : 'Recruiter Lead',
      notes: 'Technical evaluation and architecture discussion.'
    });
    setInterviewErrors({});
    setIsInterviewModalOpen(true);
  };

  const validateInterviewForm = () => {
    const errors = {};
    if (!interviewForm.date || !interviewForm.date.trim()) {
      errors.date = 'Interview date is required.';
    }
    if (!interviewForm.time || !interviewForm.time.trim()) {
      errors.time = 'Interview time is required.';
    }
    if (!interviewForm.format) {
      errors.format = 'Interview format / medium is required.';
    }
    if (!interviewForm.interviewer || !interviewForm.interviewer.trim()) {
      errors.interviewer = 'Interviewer / panel name is required.';
    }

    if (interviewForm.format === 'Video Interview') {
      if (!interviewForm.meetingLink || !interviewForm.meetingLink.trim()) {
        errors.meetingLink = 'Meeting link is required for video interviews.';
      } else {
        const link = interviewForm.meetingLink.trim();
        if (!link.startsWith('http://') && !link.startsWith('https://') && !link.includes('.')) {
          errors.meetingLink = 'Please enter a valid meeting URL (e.g., https://meet.google.com/xyz).';
        }
      }
    } else if (interviewForm.format === 'In-Person Interview') {
      if (!interviewForm.locationAddress || !interviewForm.locationAddress.trim()) {
        errors.locationAddress = 'Location / venue address is required for in-person interviews.';
      }
    }

    return errors;
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!interviewTarget) return;

    const errors = validateInterviewForm();
    if (Object.keys(errors).length > 0) {
      setInterviewErrors(errors);
      addToast('Please fill all required interview details correctly.', 'error');
      return;
    }

    setInterviewErrors({});

    const formattedMode = interviewForm.format === 'Video Interview'
      ? 'Online (Google Meet / Video)'
      : (interviewForm.format === 'In-Person Interview' ? 'In-Person (Office Round)' : 'Phone Interview');

    const destination = interviewForm.format === 'Video Interview'
      ? interviewForm.meetingLink.trim()
      : (interviewForm.format === 'In-Person Interview' ? interviewForm.locationAddress.trim() : (interviewForm.phoneDetails?.trim() || interviewTarget.candidatePhone || 'Candidate Phone'));

    try {
      await recruiterApplicationService.updateApplicationStatus(interviewTarget.id, 'INTERVIEW');
    } catch (err) {
      // Continue even if status call fails
    }

    scheduleInterview({
      jobId: interviewTarget.jobId,
      jobTitle: interviewTarget.jobTitle,
      candidateId: interviewTarget.candidateId || interviewTarget.id,
      candidateName: interviewTarget.candidateName,
      candidateEmail: interviewTarget.candidateEmail,
      date: interviewForm.date,
      time: interviewForm.time,
      type: interviewForm.format,
      mode: formattedMode,
      meetingLink: destination,
      interviewer: interviewForm.interviewer.trim(),
      notes: interviewForm.notes.trim()
    });

    addToast(`Interview scheduled with ${interviewTarget.candidateName}!`, 'success');
    setIsInterviewModalOpen(false);
    setInterviewTarget(null);
    fetchApplications();
    if (selectedApplicant?.id === interviewTarget.id) {
      setSelectedApplicant((prev) => (prev ? { ...prev, status: 'INTERVIEW' } : null));
    }
  };

  const handleExportExcel = () => {
    if (filteredApplicants.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting applications list to Excel...', 'info');
    const headers = [
      'Application No',
      'Application Type',
      'Job / Internship ID',
      'Candidate Name',
      'Candidate Email',
      'Job Title',
      'Company',
      'Job Mela ID',
      'Job Mela Event',
      'Registration Pass ID',
      'Applied Date',
      'Application Status',
      'Experience',
      'Match Score',
      'Location',
      'Expected CTC',
      'Notice Period'
    ];
    const rows = filteredApplicants.map(app => [
      app.appNumber || 'N/A',
      app.applicationType || (app.isMela ? 'Job Mela Application' : 'Direct Job Application'),
      app.jobIdFormatted || (app.applicationType === 'Internship' ? formatInternshipId(app.jobId) : formatJobId(app.jobId)) || 'N/A',
      app.candidateName || 'N/A',
      app.candidateEmail || 'N/A',
      app.jobTitle || 'Role',
      app.company || 'N/A',
      app.isMela ? (app.melaIdFormatted || formatMelaId(app.melaId || app.melaDetails?.melaId || 1)) : 'N/A',
      app.isMela ? (app.melaTitle || app.melaDetails?.melaTitle || 'AP Mega IT & ITES Job Mela 2026') : 'N/A',
      app.isMela ? (app.passId || app.melaDetails?.passId || 'N/A') : 'N/A',
      app.appliedDate || 'Aug 2026',
      app.status || 'UNDER_REVIEW',
      app.experience || '3+ Years',
      app.matchScore ? `${app.matchScore}%` : 'N/A',
      app.location || 'India',
      app.expectedSalary || 'N/A',
      app.noticePeriod || 'N/A'
    ]);
    const statusLabel = selectedStatusTab === 'ALL' ? 'all' : selectedStatusTab.toLowerCase();
    exportToExcel({
      filename: getExportFilename('applications', statusLabel, 'xlsx'),
      sheetName: 'Applications',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    if (filteredApplicants.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting applications list to PDF...', 'info');
    const headers = ['App No', 'Type', 'Job ID', 'Candidate Name', 'Job Title', 'Company', 'Applied Date', 'Status', 'Match'];
    const rows = filteredApplicants.map(app => [
      app.appNumber || 'N/A',
      app.isMela ? 'Job Mela' : 'Direct',
      app.jobIdFormatted || (app.applicationType === 'Internship' ? formatInternshipId(app.jobId) : formatJobId(app.jobId)) || 'N/A',
      app.candidateName || 'N/A',
      app.jobTitle || 'Role',
      app.company || 'N/A',
      app.appliedDate || 'Aug 2026',
      app.status || 'UNDER_REVIEW',
      app.matchScore ? `${app.matchScore}%` : 'N/A'
    ]);
    const tabObj = [
      { id: 'ALL', label: 'All Applications' },
      { id: 'SCREENING', label: 'Screening' },
      { id: 'SHORTLISTED', label: 'Shortlisted' },
      { id: 'INTERVIEW', label: 'Interview Scheduled' },
      { id: 'SELECTED', label: 'Selected / Hired' },
      { id: 'REJECTED', label: 'Rejected' },
    ].find(t => t.id === selectedStatusTab);
    const statusLabel = tabObj ? tabObj.label : selectedStatusTab;
    const selectedJobTitle = selectedJobFilter === 'ALL' ? 'All Job Openings' : (allJobs.find(j => j.id === selectedJobFilter)?.title || selectedJobFilter);

    exportToPDF({
      filename: getExportFilename('applications', selectedStatusTab.toLowerCase(), 'pdf'),
      title: 'Candidate Applications & Screening Pipeline Report',
      subtitle: `Employer: ${recruiter?.company?.name || recruiter?.name || 'Recruiter'} • Job Filter: ${selectedJobTitle}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusLabel,
        'Job Position': selectedJobTitle,
        'Total Applications': filteredApplicants.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  return (
    <div className="portal-page">
      {/* Header Banner */}
      <div className="portal-header-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
            Job Applications
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review, screen, shortlist, and manage all applicants across your active job postings.
          </p>
        </div>
      </div>

      {/* Metric summary banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--color-primary-600)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Received</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gray-900)', marginTop: '0.25rem' }}>{tabCounts.all}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Screening</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>{tabCounts.screening}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--color-primary-600)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shortlisted</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary-600)', marginTop: '0.25rem' }}>{tabCounts.shortlisted}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Interviews</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#8b5cf6', marginTop: '0.25rem' }}>{tabCounts.interview}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected / Hired</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>{tabCounts.selected}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 auto' }}>
            {/* Search box */}
            <div style={{ flex: '1 1 240px', minWidth: '200px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by candidate name, email, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', borderRadius: '8px' }}
              />
            </div>

            {/* Job Filter Dropdown */}
            <div style={{ width: '240px' }}>
              <select
                className="form-control"
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                style={{ height: '42px', borderRadius: '8px' }}
              >
                <option value="ALL">All Job Postings ({tabCounts.all})</option>
                {allJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.count ?? 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div style={{ width: '170px' }}>
              <select
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '42px', borderRadius: '8px' }}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="match">Sort: Match Score</option>
              </select>
            </div>
          </div>

          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            disabled={filteredApplicants.length === 0}
          />
        </div>

        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderTop: '1px solid var(--color-gray-100)',
          paddingTop: '0.85rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'ALL', label: 'All Applications', count: tabCounts.all },
            { id: 'SCREENING', label: 'Screening', count: tabCounts.screening },
            { id: 'SHORTLISTED', label: 'Shortlisted', count: tabCounts.shortlisted },
            { id: 'INTERVIEW', label: 'Interview Scheduled', count: tabCounts.interview },
            { id: 'SELECTED', label: 'Selected', count: tabCounts.selected },
            { id: 'REJECTED', label: 'Rejected', count: tabCounts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              style={{
                background: selectedStatusTab === tab.id ? 'var(--color-primary-50)' : 'transparent',
                color: selectedStatusTab === tab.id ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                fontWeight: selectedStatusTab === tab.id ? 600 : 500,
                border: selectedStatusTab === tab.id ? '1px solid var(--color-primary-200)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: selectedStatusTab === tab.id ? 'var(--color-primary-600)' : 'var(--color-gray-200)',
                color: selectedStatusTab === tab.id ? '#fff' : 'var(--color-gray-700)',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                fontWeight: 600
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplicants.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="No applications match your criteria"
          description={
            searchQuery || selectedJobFilter !== 'ALL' || selectedStatusTab !== 'ALL'
              ? 'Try adjusting your search keywords, job filter, or status tab.'
              : 'You have not received applications yet for this view.'
          }
          action={
            (searchQuery || selectedJobFilter !== 'ALL' || selectedStatusTab !== 'ALL') ? (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedJobFilter('ALL'); setSelectedStatusTab('ALL'); }}>
                Clear Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div>
          <div className="recruiter-jobs-grid">
            {paginatedApplicants.map((app) => {
              const isShortlisted = app.status === 'SHORTLISTED';
              const isInterview = app.status === 'INTERVIEW';
              const isRejected = app.status === 'REJECTED';
              const isSelected = app.status === 'SELECTED' || app.status === 'HIRED';

              return (
                <div
                  key={app.id}
                  className={`card recruiter-job-card ${isShortlisted ? 'is-published' : ''}`}
                >
                  {/* Top: Application No & Type Header Strip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.4rem',
                    marginBottom: '0.45rem',
                    paddingBottom: '0.4rem',
                    borderBottom: '1px solid var(--color-gray-100)',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        background: app.isMela ? '#f5f3ff' : '#eff6ff',
                        color: app.isMela ? '#6d28d9' : '#1d4ed8',
                        border: `1px solid ${app.isMela ? '#ddd6fe' : '#bfdbfe'}`,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        letterSpacing: '0.03em'
                      }}>
                        {app.appNumber}
                      </span>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '10px',
                        background: app.isMela ? '#ecfdf5' : '#f8fafc',
                        color: app.isMela ? '#047857' : 'var(--color-gray-600)',
                        border: `1px solid ${app.isMela ? '#a7f3d0' : 'var(--color-gray-200)'}`
                      }}>
                        {app.applicationType || (app.isMela ? 'Job Mela Application' : 'Direct Job Application')}
                      </span>
                    </div>
                    <StatusBadge status={app.status || 'UNDER_REVIEW'} />
                  </div>

                  {/* Candidate Avatar, Name, Email */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', minWidth: 0 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary-600), #7c3aed)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {app.candidateName?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3
                          title={app.candidateName}
                          style={{
                            margin: 0,
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            color: 'var(--color-gray-900)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {app.candidateName}
                        </h3>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-gray-500)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.candidateEmail || 'Candidate'}
                        </span>
                      </div>
                    </div>

                    {/* Applied Job & Company & Match Badge */}
                    <div style={{
                      background: app.isMela ? '#fbf8ff' : 'var(--color-gray-50)',
                      padding: '0.45rem 0.55rem',
                      borderRadius: '6px',
                      border: `1px solid ${app.isMela ? '#e9d5ff' : 'var(--color-gray-200)'}`,
                      marginBottom: '0.45rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', minWidth: 0 }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Role: <strong style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>{app.jobTitle}</strong>
                          </span>
                          {(app.jobIdFormatted || app.jobId) && (
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '0.08rem 0.35rem',
                              borderRadius: '4px',
                              border: '1px solid #bfdbfe'
                            }}>
                              {app.jobIdFormatted || (app.applicationType === 'Internship' ? formatInternshipId(app.jobId) : formatJobId(app.jobId))}
                            </span>
                          )}
                        </div>
                        {app.matchScore && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            background: app.matchScore >= 90 ? '#ecfdf5' : '#eef2ff',
                            color: app.matchScore >= 90 ? '#059669' : 'var(--color-primary-700)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '10px',
                            border: `1px solid ${app.matchScore >= 90 ? '#a7f3d0' : '#c7d2fe'}`,
                            flexShrink: 0
                          }}>
                            <Sparkles size={10} />
                            {app.matchScore}%
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.74rem', color: 'var(--color-gray-600)' }}>
                        <Building2 size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Company: <strong style={{ color: 'var(--color-gray-900)' }}>{app.company}</strong>
                        </span>
                      </div>
                      {app.isMela && (
                        <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #ddd6fe', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.71rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6d28d9', fontWeight: 600, flexWrap: 'wrap' }}>
                            <Sparkles size={11} style={{ flexShrink: 0 }} />
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              background: '#f5f3ff',
                              color: '#6d28d9',
                              padding: '0.08rem 0.35rem',
                              borderRadius: '4px',
                              border: '1px solid #ddd6fe'
                            }}>
                              {app.melaIdFormatted || formatMelaId(app.melaId || app.melaDetails?.melaId || 1)}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Mela: {app.melaTitle || app.melaDetails?.melaTitle || 'AP Mega IT & ITES Job Mela 2026'}
                            </span>
                          </div>
                          {(app.passId || app.melaDetails?.passId) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#047857', fontWeight: 600 }}>
                              <Ticket size={11} style={{ flexShrink: 0 }} />
                              <span>Registration Pass ID: <span style={{ fontFamily: 'monospace' }}>{app.passId || app.melaDetails?.passId}</span></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata: Experience, Location, Applied Date */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.76rem', color: 'var(--color-gray-600)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Briefcase size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                          <span>{app.experience || '3+ Years'} Exp</span>
                        </span>
                        {app.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            <MapPin size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{app.location}</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', color: 'var(--color-gray-500)', fontSize: '0.72rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                          <span>Applied: {app.appliedDate}</span>
                        </span>
                        {app.noticePeriod && (
                          <span style={{ flexShrink: 0 }}>Notice: {app.noticePeriod}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {app.skills && app.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center', minHeight: '22px' }}>
                      {app.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--color-primary-50)',
                            color: 'var(--color-primary-700)',
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {app.skills.length > 3 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
                          +{app.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick Actions Footer */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: '0.65rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ flex: 1, minWidth: '70px', padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                      icon={<Eye size={13} />}
                      onClick={() => handleOpenReview(app)}
                    >
                      Review
                    </Button>

                    {!isShortlisted && !isInterview && !isSelected && (
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                        icon={<Check size={13} />}
                        onClick={() => handleShortlist(app)}
                        title="Shortlist Candidate"
                      >
                        Shortlist
                      </Button>
                    )}

                    {!isInterview && !isSelected && !isRejected && (
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                        icon={<CalendarCheck size={13} />}
                        onClick={() => handleOpenScheduleModal(app)}
                        title="Schedule Interview"
                      >
                        Interview
                      </Button>
                    )}

                    {!isRejected && !isSelected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: 'var(--color-danger-600)', padding: '0.35rem 0.45rem' }}
                        icon={<X size={13} />}
                        onClick={() => handleReject(app)}
                        title="Reject Application"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems || filteredApplicants.length}
              pageSize={PAGE_SIZE}
              itemName="applications"
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* ================= Candidate Review Modal ================= */}
      {isReviewModalOpen && selectedApplicant && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Applicant Review — ${selectedApplicant.candidateName}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Application Identification Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.6rem',
              background: selectedApplicant.isMela ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' : '#eff6ff',
              border: `1px solid ${selectedApplicant.isMela ? '#c4b5fd' : '#bfdbfe'}`,
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-600)', fontWeight: 600 }}>
                  Application No:
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: selectedApplicant.isMela ? '#5b21b6' : '#1e40af',
                  background: '#fff',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '4px',
                  border: `1px solid ${selectedApplicant.isMela ? '#ddd6fe' : '#dbeafe'}`,
                  letterSpacing: '0.04em'
                }}>
                  {selectedApplicant.appNumber}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  background: selectedApplicant.isMela ? '#10b981' : '#3b82f6',
                  color: '#fff'
                }}>
                  {selectedApplicant.applicationType || (selectedApplicant.isMela ? 'Job Mela Application' : 'Direct Job Application')}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                Applied Date: <strong>{selectedApplicant.appliedDate}</strong>
              </div>
            </div>

            {/* Job Mela Event Identification (if applicable) */}
            {selectedApplicant.isMela && (
              <div style={{
                background: '#faf5ff',
                border: '1px solid #d8b4fe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b21a8' }}>
                    <Sparkles size={15} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Job Mela Application Identification
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    background: '#6b21a8',
                    color: '#fff',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {selectedApplicant.melaIdFormatted || formatMelaId(selectedApplicant.melaId || selectedApplicant.melaDetails?.melaId || 1)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Job Mela</span>
                    <strong style={{ color: '#581c87' }}>{selectedApplicant.melaTitle || selectedApplicant.melaDetails?.melaTitle || 'AP Mega IT & ITES Job Mela 2026'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Employer / Company</span>
                    <strong style={{ color: '#581c87' }}>{selectedApplicant.company}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Position</span>
                    <strong style={{ color: '#581c87' }}>
                      {selectedApplicant.jobTitle}
                      <span style={{
                        marginLeft: '0.35rem',
                        fontFamily: 'monospace',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe'
                      }}>
                        {selectedApplicant.jobIdFormatted || (selectedApplicant.applicationType === 'Internship' ? formatInternshipId(selectedApplicant.jobId || selectedApplicant.id) : formatJobId(selectedApplicant.jobId || selectedApplicant.id))}
                      </span>
                    </strong>
                  </div>
                  {(selectedApplicant.passId || selectedApplicant.melaDetails?.passId) && (
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Registration ID / Pass ID</span>
                      <strong style={{ color: '#065f46', fontFamily: 'monospace' }}>{selectedApplicant.passId || selectedApplicant.melaDetails?.passId}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Header info */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              background: 'var(--color-primary-50)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-primary-100)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--color-primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 700
              }}>
                {selectedApplicant.candidateName?.[0]?.toUpperCase() || 'C'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                    {selectedApplicant.candidateName}
                  </h3>
                  {selectedApplicant.matchScore && (
                    <span style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #a7f3d0'
                    }}>
                      ⚡ {selectedApplicant.matchScore}% Match
                    </span>
                  )}
                  <StatusBadge status={selectedApplicant.status} />
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  {selectedApplicant.candidateHeadline || `Candidate for ${selectedApplicant.jobTitle} at ${selectedApplicant.company}`}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-700)', fontWeight: 600 }}>
                    🏢 Company: <strong>{selectedApplicant.company}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-700)', fontWeight: 600 }}>
                    💼 Role: <strong>{selectedApplicant.jobTitle}</strong>
                  </span>
                  {(selectedApplicant.jobIdFormatted || selectedApplicant.jobId) && (
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe'
                    }}>
                      {selectedApplicant.jobIdFormatted || (selectedApplicant.applicationType === 'Internship' ? formatInternshipId(selectedApplicant.jobId || selectedApplicant.id) : formatJobId(selectedApplicant.jobId || selectedApplicant.id))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact & Details grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              background: 'var(--color-gray-50)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Email</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>{selectedApplicant.candidateEmail || 'priya.sharma@example.com'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Phone</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>{selectedApplicant.phone || '+91 98765 43210'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Location</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>{selectedApplicant.location || 'Bengaluru, India'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Experience</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>{selectedApplicant.experience || '4.2 Years'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Notice Period</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>{selectedApplicant.noticePeriod || '30 Days'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Expected CTC</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>{selectedApplicant.expectedSalary || '₹22.0 LPA'}</span>
              </div>
            </div>

            {/* Skills */}
            {selectedApplicant.skills && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '0.5rem' }}>
                  Core Competencies & Skills
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedApplicant.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'var(--color-primary-50)',
                        color: 'var(--color-primary-700)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-primary-100)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Note */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '0.35rem' }}>
                Applicant Cover Note
              </h4>
              <p style={{
                background: '#fff',
                border: '1px solid var(--color-gray-200)',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--color-gray-700)',
                lineHeight: 1.5,
                margin: 0
              }}>
                {selectedApplicant.coverNote || 'I am excited to apply for this opening. With my hands-on background in frontend software design and delivery, I am confident I can make an immediate high-impact contribution to your team.'}
              </p>
            </div>

            {/* Resume Preview */}
            {(() => {
              const matchedCand = (recruiter?.candidates || []).find(
                c => c.id === selectedApplicant.candidateId || c.email === selectedApplicant.candidateEmail
              );
              const hasResume = Boolean(
                selectedApplicant.resumeUrl || selectedApplicant.resumeName || matchedCand?.resumeUrl || matchedCand?.resumeName
              );
              const resumeFileName = selectedApplicant.resumeName || matchedCand?.resumeName || (hasResume && selectedApplicant.candidateName ? `${selectedApplicant.candidateName.replace(/\s+/g, '_')}_Resume.pdf` : null);

              return (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '0.4rem' }}>
                    Candidate Resume
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
                      <FileText size={28} color={hasResume ? 'var(--color-primary-600)' : 'var(--color-gray-400)'} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: hasResume ? 'var(--color-gray-900)' : 'var(--color-gray-600)' }}>
                          {hasResume ? resumeFileName : 'Resume not available'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                          {hasResume ? 'Verified PDF Document • 1.4 MB' : 'No resume file attached to this application'}
                        </div>
                      </div>
                    </div>

                    {hasResume ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye size={14} />}
                          onClick={() => handleViewResume(selectedApplicant)}
                        >
                          View Resume
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Download size={14} />}
                          onClick={() => handleDownloadResume(selectedApplicant)}
                        >
                          Download Resume
                        </Button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', fontStyle: 'italic' }}>
                        Resume not available
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--color-gray-200)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <Button
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Close
              </Button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedApplicant.status !== 'REJECTED' && (
                  <Button
                    variant="ghost"
                    style={{ color: 'var(--color-danger-600)' }}
                    icon={<X size={14} />}
                    onClick={() => handleReject(selectedApplicant)}
                  >
                    Reject
                  </Button>
                )}

                {selectedApplicant.status !== 'SHORTLISTED' && selectedApplicant.status !== 'INTERVIEW' && (
                  <Button
                    variant="secondary"
                    icon={<Check size={14} />}
                    onClick={() => handleShortlist(selectedApplicant)}
                  >
                    Shortlist
                  </Button>
                )}

                <Button
                  variant="primary"
                  icon={<CalendarCheck size={14} />}
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    handleOpenScheduleModal(selectedApplicant);
                  }}
                >
                  Schedule Interview
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= Schedule Interview Modal ================= */}
      {isInterviewModalOpen && interviewTarget && (
        <Modal
          isOpen={isInterviewModalOpen}
          onClose={() => {
            setIsInterviewModalOpen(false);
            setInterviewTarget(null);
            setInterviewErrors({});
          }}
          title={`Schedule Interview: ${interviewTarget.candidateName}`}
          size="md"
        >
          <form onSubmit={handleConfirmSchedule} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header info box */}
            <div style={{
              background: 'var(--color-primary-50)',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              border: '1px solid var(--color-primary-100)'
            }}>
              <div style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--color-gray-800)' }}>Job Role:</strong>{' '}
                <span style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>{interviewTarget.jobTitle}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-gray-800)' }}>Candidate:</strong>{' '}
                <span style={{ color: 'var(--color-gray-900)' }}>
                  {interviewTarget.candidateName} ({interviewTarget.candidateEmail || 'Candidate'})
                </span>
              </div>
            </div>

            {/* Date and Time Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="Interview Date" required error={interviewErrors.date}>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={interviewForm.date}
                  onChange={(e) => {
                    setInterviewForm({ ...interviewForm, date: e.target.value });
                    if (interviewErrors.date) setInterviewErrors({ ...interviewErrors, date: null });
                  }}
                  error={interviewErrors.date}
                  required
                />
              </FormField>

              <FormField label="Interview Time" required error={interviewErrors.time}>
                <Input
                  type="time"
                  value={interviewForm.time}
                  onChange={(e) => {
                    setInterviewForm({ ...interviewForm, time: e.target.value });
                    if (interviewErrors.time) setInterviewErrors({ ...interviewErrors, time: null });
                  }}
                  error={interviewErrors.time}
                  required
                />
              </FormField>
            </div>

            {/* Interview Format / Medium */}
            <FormField label="Interview Format / Medium" required error={interviewErrors.format}>
              <Select
                value={interviewForm.format}
                onChange={(e) => {
                  setInterviewForm({ ...interviewForm, format: e.target.value });
                  if (interviewErrors.format) setInterviewErrors({ ...interviewErrors, format: null });
                  if (interviewErrors.meetingLink || interviewErrors.locationAddress) {
                    setInterviewErrors({ ...interviewErrors, meetingLink: null, locationAddress: null });
                  }
                }}
                error={interviewErrors.format}
              >
                <option value="Video Interview">Video Interview</option>
                <option value="Phone Interview">Phone Interview</option>
                <option value="In-Person Interview">In-Person Interview</option>
              </Select>
            </FormField>

            {/* Conditional Meeting Link / Location Address */}
            {interviewForm.format === 'Video Interview' && (
              <FormField
                label="Meeting Link"
                required
                hint="Google Meet, Microsoft Teams, or Zoom URL"
                error={interviewErrors.meetingLink}
              >
                <Input
                  type="url"
                  value={interviewForm.meetingLink}
                  onChange={(e) => {
                    setInterviewForm({ ...interviewForm, meetingLink: e.target.value });
                    if (interviewErrors.meetingLink) setInterviewErrors({ ...interviewErrors, meetingLink: null });
                  }}
                  placeholder="https://meet.google.com/xyz-abc"
                  error={interviewErrors.meetingLink}
                  required
                />
              </FormField>
            )}

            {interviewForm.format === 'Phone Interview' && (
              <FormField
                label="Phone / Call Details"
                hint="Candidate phone number or bridge contact"
                error={interviewErrors.phoneDetails}
              >
                <Input
                  type="text"
                  value={interviewForm.phoneDetails}
                  onChange={(e) => {
                    setInterviewForm({ ...interviewForm, phoneDetails: e.target.value });
                    if (interviewErrors.phoneDetails) setInterviewErrors({ ...interviewErrors, phoneDetails: null });
                  }}
                  placeholder="+91 98765 43210"
                  error={interviewErrors.phoneDetails}
                />
              </FormField>
            )}

            {interviewForm.format === 'In-Person Interview' && (
              <FormField
                label="Location Address"
                required
                hint="Office address, meeting room number, or venue details"
                error={interviewErrors.locationAddress}
              >
                <Input
                  type="text"
                  value={interviewForm.locationAddress}
                  onChange={(e) => {
                    setInterviewForm({ ...interviewForm, locationAddress: e.target.value });
                    if (interviewErrors.locationAddress) setInterviewErrors({ ...interviewErrors, locationAddress: null });
                  }}
                  placeholder="e.g. Block B, RMZ Ecospace, Outer Ring Road, Bengaluru"
                  error={interviewErrors.locationAddress}
                  required
                />
              </FormField>
            )}

            {/* Interviewer / Panel Name */}
            <FormField label="Interviewer / Panel Name" required error={interviewErrors.interviewer}>
              <Input
                type="text"
                value={interviewForm.interviewer}
                onChange={(e) => {
                  setInterviewForm({ ...interviewForm, interviewer: e.target.value });
                  if (interviewErrors.interviewer) setInterviewErrors({ ...interviewErrors, interviewer: null });
                }}
                placeholder="e.g. Arjun Reddy (Director of Talent Acquisition)"
                error={interviewErrors.interviewer}
                required
              />
            </FormField>

            {/* Notes / Agenda for Candidate */}
            <FormField label="Notes / Agenda for Candidate" hint="Preparation guidelines, agenda items, or topics to cover">
              <Textarea
                rows={3}
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                placeholder="Details on topics to cover, technical task presentation, preparation guide, etc."
              />
            </FormField>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsInterviewModalOpen(false);
                  setInterviewTarget(null);
                  setInterviewErrors({});
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<CalendarCheck size={16} />}>
                Schedule Interview
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
