import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays, Plus, Search, Filter, Eye, Building2, MapPin,
  Clock, CheckCircle2, Ticket, XCircle, Inbox, Check, X, AlertCircle,
  Pencil, Trash2, ExternalLink, Share2, Users, Briefcase,
  ChevronLeft, ChevronRight, User, Phone, Mail, Award, DollarSign,
  FileSpreadsheet, FileText, Download, Info, Calendar, Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, exportToCSV, generatePDFBlob, getExportFilename } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import { formatMelaId, formatJobId } from '../../utils/applicationUtils';
import JobMelaPosterModal, { downloadPosterImage } from '../../components/ui/JobMelaPosterModal';

export default function AdminJobMelasPage() {
  const { addToast } = useToast();
  const {
    jobMelas,
    candidates,
    companies,
    registrations,
    applications,
    getMelaStats,
    approveJobMela,
    rejectJobMela,
    addCompanyToJobMela,
    updateCompanyInJobMela,
    removeCompanyFromJobMela
  } = useAdmin();

  const location = useLocation();

  // Three primary actions state: 'ADMIN_CREATED' | 'REQUESTS'
  const [activeAction, setActiveAction] = useState('ADMIN_CREATED');

  // Search and status filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [requestStatusTab, setRequestStatusTab] = useState('ALL');

  // Main event view modal
  const [selectedMela, setSelectedMela] = useState(null);
  const [selectedPosterMela, setSelectedPosterMela] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Participating Company filtering, search & pagination within modal
  const [companySearch, setCompanySearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [companyPage, setCompanyPage] = useState(1);
  const [companyPageSize, setCompanyPageSize] = useState(25);

  // View Company Details modal state
  const [viewingCompany, setViewingCompany] = useState(null);
  const [companyDetailsModalOpen, setCompanyDetailsModalOpen] = useState(false);

  // Add / Edit Participating Company Modal states
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyFormData, setCompanyFormData] = useState({
    company: '',
    companyId: '',
    recruiter: '',
    position: '',
    qualification: '',
    experience: '',
    salary: '',
    vacancies: '15',
    location: '',
    notes: ''
  });

  // Registered candidates modal state for specific Job Mela
  const [selectedMelaForRegs, setSelectedMelaForRegs] = useState(null);
  const [melaRegistrationsOpen, setMelaRegistrationsOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('ALL');
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidatePageSize, setCandidatePageSize] = useState(10);
  const [selectedPass, setSelectedPass] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  const handleOpenMelaRegistrations = (mela) => {
    setSelectedMelaForRegs(mela);
    setCandidateSearch('');
    setCandidateStatusFilter('ALL');
    setCandidatePage(1);
    setMelaRegistrationsOpen(true);
  };

  // Reset company pagination and search whenever selectedMela changes
  const handleOpenMelaManagement = (mela) => {
    setSelectedMela(mela);
    setCompanySearch('');
    setCompanyFilter('ALL');
    setCompanyPage(1);
    setViewModalOpen(true);
  };

  // Automatically open management view if navigated from create event
  useEffect(() => {
    if (location.state?.openMelaId) {
      const targetMela = jobMelas.find(m => m.id === location.state.openMelaId);
      if (targetMela) {
        handleOpenMelaManagement(targetMela);
      }
    }
  }, [location.state, jobMelas]);

  // Keep selectedMela and selectedMelaForRegs in sync with jobMelas context updates
  useEffect(() => {
    if (selectedMela) {
      const current = jobMelas.find(m => m.id === selectedMela.id);
      if (current) {
        setSelectedMela(current);
      }
    }
    if (selectedMelaForRegs) {
      const currentReg = jobMelas.find(m => m.id === selectedMelaForRegs.id);
      if (currentReg) {
        setSelectedMelaForRegs(currentReg);
      }
    }
  }, [jobMelas]);

  // Request details modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);

  // Status-based filter tabs for Job Melas (strictly preserved)
  const filterTabs = [
    { key: 'ALL', label: 'All Career Melas' },
    { key: 'UPCOMING', label: 'Upcoming' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'ONGOING', label: 'Ongoing Today' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  // Helper to identify Admin Created vs External Requests
  const isAdminCreated = (m) =>
    Boolean(m.createdByAdmin || m.organizer?.includes('NTR Vikasa') || m.organizer === 'NTR Vikasa State Employment Authority');

  // 1. Admin Created Job Melas
  const adminMelas = jobMelas.filter((m) => isAdminCreated(m));

  // 2. External Organization Requests
  const requestsList = jobMelas.filter((m) => !isAdminCreated(m) || m.status === 'PENDING');
  const pendingRequestsCount = jobMelas.filter((m) => m.status === 'PENDING').length;

  const [requestCompanyFilter, setRequestCompanyFilter] = useState('ALL');

  // Derive unique company / organization names from existing Job Mela Requests
  const availableRequestOrganizations = useMemo(() => {
    const set = new Set();
    requestsList.forEach(r => {
      const org = r.organizer || r.company || r.requestingOrganization;
      if (org && typeof org === 'string' && org.trim()) {
        set.add(org.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [requestsList]);

  // Filtered Admin Melas
  const filteredAdminMelas = adminMelas.filter((e) => {
    const eventTitle = e.event || e.title || '';
    const eventCity = e.location || e.city || '';
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMelaId = (formatMelaId(e.id) || '').toLowerCase().includes(q) || String(e.id || '').toLowerCase().includes(q);
      if (!eventTitle.toLowerCase().includes(q) && !eventCity.toLowerCase().includes(q) && !matchMelaId) return false;
    }
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'APPROVED' && (e.status !== 'APPROVED' && e.status !== 'UPCOMING')) return false;
      if (statusFilter === 'UPCOMING' && e.status !== 'UPCOMING' && e.status !== 'APPROVED') return false;
      if (statusFilter !== 'APPROVED' && statusFilter !== 'UPCOMING' && e.status !== statusFilter) return false;
    }
    return true;
  });

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requestsList.filter((r) => {
      // 1. Company / Organization Filter
      if (requestCompanyFilter !== 'ALL') {
        const org = (r.organizer || r.company || r.requestingOrganization || '').trim().toLowerCase();
        if (org !== requestCompanyFilter.trim().toLowerCase()) {
          return false;
        }
      }

      // 2. Status Filter
      if (requestStatusTab !== 'ALL' && r.status !== requestStatusTab) {
        return false;
      }

      // 3. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const title = (r.event || r.title || '').toLowerCase();
        const organizer = (r.organizer || '').toLowerCase();
        const location = (r.location || r.venue || '').toLowerCase();
        const matchMelaId = (formatMelaId(r.id) || '').toLowerCase().includes(q) || String(r.id || '').toLowerCase().includes(q);
        if (!title.includes(q) && !organizer.includes(q) && !location.includes(q) && !matchMelaId) {
          return false;
        }
      }

      return true;
    });
  }, [requestsList, search, requestStatusTab, requestCompanyFilter]);

  const PAGE_SIZE = 10;
  const [adminMelasPage, setAdminMelasPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);

  useEffect(() => {
    setAdminMelasPage(1);
  }, [search, statusFilter, activeAction]);

  useEffect(() => {
    setRequestsPage(1);
  }, [search, requestStatusTab, requestCompanyFilter, activeAction]);

  const totalAdminMelasPages = Math.max(1, Math.ceil(filteredAdminMelas.length / PAGE_SIZE));
  const paginatedAdminMelas = useMemo(() => {
    const startIndex = (adminMelasPage - 1) * PAGE_SIZE;
    return filteredAdminMelas.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAdminMelas, adminMelasPage]);

  const totalRequestsPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = useMemo(() => {
    const startIndex = (requestsPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRequests, requestsPage]);

  // Scoped helper for individual mela candidates
  const getScopedMelaCandidates = (mela) => {
    if (!mela) return [];
    const eventQuery = (mela.event || mela.title || '').toLowerCase();
    const matching = (registrations || []).filter(r => {
      if (r.melaId && (String(r.melaId) === String(mela.id))) return true;
      const regEvent = (r.event || r.eventName || '').toLowerCase();
      return regEvent && (regEvent.includes(eventQuery) || eventQuery.includes(regEvent));
    });

    const melaApps = (applications || []).filter(a => {
      if (a.melaId && (String(a.melaId) === String(mela.id))) return true;
      const aTitle = (a.melaTitle || '').toLowerCase();
      return aTitle && (aTitle.includes(eventQuery) || eventQuery.includes(aTitle));
    });

    const uniqueMap = new Map();
    matching.forEach((r, idx) => {
      const email = (r.candidateEmail || r.email || '').toLowerCase().trim();
      const key = email || r.id;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          ...r,
          id: r.id || `REG-${mela.id || 'MELA'}-${1000 + idx}`,
          candidate: r.candidate || r.candidateName || 'Candidate',
          candidateEmail: r.candidateEmail || r.email || 'candidate@example.com',
          phone: r.phone || '+91 98765 43210',
          entryToken: r.entryToken || r.passId || `TKN-${(mela.location || 'AP').substring(0, 3).toUpperCase()}-${String(100 + idx).padStart(4, '0')}`,
          gateNumber: r.gateNumber || (idx % 2 === 0 ? 'Gate 1 (Main Hall)' : 'Gate 2 (Tech Wing)'),
          registrationDate: r.registrationDate || r.registeredDate || '2026-08-28',
          status: r.status || 'CONFIRMED',
          event: mela.event || mela.title
        });
      }
    });

    melaApps.forEach((a, idx) => {
      const email = (a.candidateEmail || a.email || '').toLowerCase().trim();
      const key = email || a.id;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: a.id || `APP-${mela.id || 'MELA'}-${1000 + idx}`,
          candidate: a.candidateName || a.candidate || 'Candidate',
          candidateEmail: a.candidateEmail || a.email || 'candidate@example.com',
          phone: a.phone || '+91 98765 43210',
          entryToken: a.passId || a.appNumber || `APP-${String(100 + idx).padStart(4, '0')}`,
          gateNumber: 'Gate 2 (Tech Wing)',
          registrationDate: a.appliedDate || 'Today',
          status: 'CONFIRMED',
          event: mela.event || mela.title,
          appliedCompany: a.company || a.companyName
        });
      }
    });

    return Array.from(uniqueMap.values());
  };

  // Scoped helper for individual mela participating companies
  const getScopedMelaCompanies = (mela) => {
    if (!mela) return [];
    const baseList = (Array.isArray(mela.participatingCompanies) && mela.participatingCompanies.length > 0)
      ? mela.participatingCompanies
      : [];

    return baseList.map((item, idx) => {
      const companyName = item.company || item.name || 'Company';
      const realAppCount = (applications || []).filter(a => {
        const melaMatch = (a.melaId && String(a.melaId) === String(mela.id)) ||
          (a.melaTitle && (mela.title || mela.event) && a.melaTitle.toLowerCase() === (mela.title || mela.event).toLowerCase());
        const compMatch = (a.company || a.companyName || '').toLowerCase().trim() === companyName.toLowerCase().trim();
        return melaMatch && compMatch;
      }).length;

      const found = (companies || []).find(c => c.id === item.companyId || c.name?.toLowerCase() === companyName.toLowerCase());
      return {
        ...item,
        id: item.id || `pmc-${idx}`,
        company: companyName,
        recruiter: item.recruiter || found?.recruiter || 'Talent Acquisition Lead',
        applications: item.applications !== undefined && item.applications > realAppCount ? item.applications : realAppCount,
        vacancies: item.vacancies || 15,
        location: item.location || mela.location || 'On-site Mela Stalls',
      };
    });
  };

  const handleOpenViewCompany = (companyRow) => {
    setViewingCompany(companyRow);
    setCompanyDetailsModalOpen(true);
  };

  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyFormData({
      company: companies?.[0]?.name || '',
      companyId: companies?.[0]?.id || '',
      recruiter: companies?.[0]?.recruiter || 'Talent Acquisition Lead',
      position: '',
      qualification: 'B.Tech / B.E / MCA / Any Graduate',
      experience: '0-2 Years',
      salary: '₹4,00,000 - ₹7,00,000 / year',
      vacancies: '15',
      location: selectedMela?.venue ? `${selectedMela.venue}, Stall A-1` : 'Stall A-1 (Hall 1)',
      notes: 'Direct walk-in technical interview.'
    });
    setCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (companyRow) => {
    setEditingCompany(companyRow);
    setCompanyFormData({
      company: companyRow.company || '',
      companyId: companyRow.companyId || '',
      recruiter: companyRow.recruiter || '',
      position: companyRow.position || '',
      qualification: companyRow.qualification || '',
      experience: companyRow.experience || '',
      salary: companyRow.salary || '',
      vacancies: String(companyRow.vacancies || '10'),
      location: companyRow.location || '',
      notes: companyRow.notes || ''
    });
    setCompanyModalOpen(true);
  };

  const handleRemoveCompany = (companyRow) => {
    if (!selectedMela) return;
    removeCompanyFromJobMela(selectedMela.id, companyRow.id);
    addToast(`Removed ${companyRow.company} from this Job Mela.`, 'info');
  };

  const handleExportAdminMelasExcel = () => {
    if (filteredAdminMelas.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting Job Melas list to Excel...', 'info');
    const headers = [
      'Job Mela ID',
      'Job Mela Name',
      'Event Date',
      'Start Time',
      'End Time',
      'Venue',
      'Location / City',
      'Organizing Authority',
      'Status',
      'Participating Companies Count',
      'Registered Candidates Count'
    ];
    const rows = filteredAdminMelas.map(m => {
      const times = (m.time || '09:00 AM - 05:00 PM').split('-');
      const compCount = Array.isArray(m.participatingCompanies) ? m.participatingCompanies.length : (m.companiesCount || 0);
      const regCount = m.registeredCandidatesCount || m.registeredCandidates || 0;
      return [
        formatMelaId(m.id),
        m.event || m.title || 'Job Mela',
        m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Sept 2026',
        times[0]?.trim() || '09:00 AM',
        times[1]?.trim() || '05:00 PM',
        m.venue || m.location || 'Convention Center',
        m.city || m.location || 'Vijayawada',
        m.organizer || 'NTR Vikasa Authority',
        m.status || 'UPCOMING',
        compCount,
        regCount
      ];
    });
    exportToExcel({
      filename: getExportFilename('job_melas', statusFilter.toLowerCase(), 'xlsx'),
      sheetName: 'Job Melas',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportAdminMelasPdf = () => {
    if (filteredAdminMelas.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting Job Melas list to PDF...', 'info');
    const headers = ['Mela ID', 'Event Name', 'Date & Time', 'Venue & Location', 'Companies', 'Status'];
    const rows = filteredAdminMelas.map(m => {
      const compCount = Array.isArray(m.participatingCompanies) ? m.participatingCompanies.length : (m.companiesCount || 0);
      return [
        formatMelaId(m.id),
        m.event || m.title || 'Job Mela',
        `${m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Sept'} (${m.time || '09:00 - 17:00'})`,
        `${m.venue || ''}, ${m.location || m.city || ''}`,
        `${compCount} Companies`,
        m.status || 'UPCOMING'
      ];
    });
    const tabObj = filterTabs.find(t => t.key === statusFilter);
    const statusLabel = tabObj ? tabObj.label : statusFilter;

    exportToPDF({
      filename: getExportFilename('job_melas', statusFilter.toLowerCase(), 'pdf'),
      title: 'State Mega Career Summits & Job Melas Report',
      subtitle: `NTR Vikasa State Employment Authority - Filter: ${statusLabel}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusLabel,
        'Search Query': search || 'None',
        'Total Records': filteredAdminMelas.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const handleExportMelaCompaniesExcel = (mela) => {
    if (!mela) return;
    const comps = getScopedMelaCompanies(mela);
    if (comps.length === 0) {
      addToast('No participating companies found to export.', 'info');
      return;
    }
    addToast('Exporting participating companies to Excel...', 'info');
    const headers = [
      'Company',
      'Position / Role',
      'Qualification',
      'Experience',
      'Salary',
      'Vacancies',
      'Applications',
      'Location',
      'Recruiter Lead',
      'Notes'
    ];
    const rows = comps.map(c => [
      c.company || 'N/A',
      c.position || 'N/A',
      c.qualification || 'Any Degree',
      c.experience || '0-3 Years',
      c.salary || 'Competitive',
      c.vacancies || 0,
      c.applications || 0,
      c.location || mela.location || 'AP',
      c.recruiter || 'HR Lead',
      c.notes || 'N/A'
    ]);
    const eventName = (mela.event || mela.title || 'job_mela').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    exportToExcel({
      filename: `${eventName}_companies_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Companies',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportMelaCompaniesPdf = (mela) => {
    if (!mela) return;
    const comps = getScopedMelaCompanies(mela);
    if (comps.length === 0) {
      addToast('No participating companies found to export.', 'info');
      return;
    }
    addToast('Exporting participating companies to PDF...', 'info');
    const headers = ['Company', 'Role', 'Experience', 'Salary', 'Vacancies', 'Applications'];
    const rows = comps.map(c => [
      c.company || 'N/A',
      c.position || 'Role',
      c.experience || '0-3 Yrs',
      c.salary || 'Competitive',
      c.vacancies || 0,
      c.applications || 0
    ]);
    const eventTitle = mela.event || mela.title || 'Job Mela';
    const eventName = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    exportToPDF({
      filename: `${eventName}_companies_${new Date().toISOString().slice(0, 10)}.pdf`,
      title: `${eventTitle} — Participating Companies`,
      subtitle: `Venue: ${mela.venue || mela.location} • Date: ${mela.date || '15 Sept 2026'}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Total Companies': comps.length,
        'Event Venue': mela.venue || mela.location || 'N/A'
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const handleExportMelaCandidatesExcel = (mela) => {
    if (!mela) return;
    const cands = getScopedMelaCandidates(mela);
    if (cands.length === 0) {
      addToast('No registered candidates found to export.', 'info');
      return;
    }
    addToast('Exporting registered candidates to Excel...', 'info');
    const headers = [
      'Registration ID',
      'Candidate Name',
      'Email',
      'Phone',
      'Job / Role',
      'Gate Number',
      'Entry Token',
      'Registration Date',
      'Registration Status'
    ];
    const rows = cands.map(c => [
      c.id || 'N/A',
      c.candidate || c.candidateName || 'N/A',
      c.candidateEmail || c.email || 'N/A',
      c.phone || 'N/A',
      c.position || c.headline || 'Software Engineer',
      c.gateNumber || 'Main Gate',
      c.entryToken || 'N/A',
      c.registrationDate || c.registeredDate ? new Date(c.registrationDate || c.registeredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026',
      c.status || 'CONFIRMED'
    ]);
    const eventName = (mela.event || mela.title || 'job_mela').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    exportToExcel({
      filename: `${eventName}_candidates_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Candidates',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportMelaCandidatesPdf = (mela) => {
    if (!mela) return;
    const cands = getScopedMelaCandidates(mela);
    if (cands.length === 0) {
      addToast('No registered candidates found to export.', 'info');
      return;
    }
    addToast('Exporting registered candidates to PDF...', 'info');
    const headers = ['Reg ID', 'Candidate Name', 'Email', 'Phone', 'Gate / Token', 'Status'];
    const rows = cands.map(c => [
      c.id || 'N/A',
      c.candidate || c.candidateName || 'N/A',
      c.candidateEmail || c.email || 'N/A',
      c.phone || 'N/A',
      `${c.gateNumber?.substring(0, 6) || 'Gate 1'} (${c.entryToken || 'TKN'})`,
      c.status || 'CONFIRMED'
    ]);
    const eventTitle = mela.event || mela.title || 'Job Mela';
    const eventName = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    exportToPDF({
      filename: `${eventName}_candidates_${new Date().toISOString().slice(0, 10)}.pdf`,
      title: `${eventTitle} — Registered Candidates`,
      subtitle: `Venue: ${mela.venue || mela.location} • Total Registered: ${cands.length}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Total Candidates': cands.length,
        'Event Venue': mela.venue || mela.location || 'N/A'
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!selectedMela) return;
    if (!companyFormData.company.trim() || !companyFormData.position.trim()) {
      addToast('Please enter company name and hiring position/role.', 'error');
      return;
    }

    if (editingCompany) {
      updateCompanyInJobMela(selectedMela.id, editingCompany.id, companyFormData);
      addToast(`Updated participation details for ${companyFormData.company}.`, 'success');
      if (viewingCompany?.id === editingCompany.id) {
        setViewingCompany({ ...viewingCompany, ...companyFormData });
      }
    } else {
      const currentList = Array.isArray(selectedMela.participatingCompanies) ? selectedMela.participatingCompanies : [];
      const duplicate = currentList.some(
        c => c.company.toLowerCase() === companyFormData.company.toLowerCase() &&
             c.position.toLowerCase() === companyFormData.position.toLowerCase()
      );
      if (duplicate) {
        addToast('This company with this specific role is already added to this Job Mela.', 'error');
        return;
      }
      addCompanyToJobMela(selectedMela.id, companyFormData);
      addToast(`Added ${companyFormData.company} to ${selectedMela.event || selectedMela.title}!`, 'success');
    }

    setCompanyModalOpen(false);
  };


  const handleApprove = (m) => {
    approveJobMela(m.id);
    addToast(`"${m.event || m.title}" has been APPROVED.`, 'success');
    if (selectedMela?.id === m.id) {
      setSelectedMela({ ...selectedMela, status: 'APPROVED' });
    }
    if (selectedRequest?.id === m.id) {
      setSelectedRequest({ ...selectedRequest, status: 'APPROVED' });
    }
  };

  const handleReject = (m) => {
    rejectJobMela(m.id);
    addToast(`"${m.event || m.title}" has been REJECTED.`, 'info');
    if (selectedMela?.id === m.id) {
      setSelectedMela({ ...selectedMela, status: 'REJECTED' });
    }
    if (selectedRequest?.id === m.id) {
      setSelectedRequest({ ...selectedRequest, status: 'REJECTED' });
    }
  };

  // Columns for Admin Created Melas Table
  const adminColumns = [
    {
      key: 'event',
      label: 'Event',
      sortable: true,
      render: (_, row) => {
        const title = row.event || row.title || 'Job Mela Event';
        const venue = row.venue || row.location || 'State Convention Center';
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{title}</strong>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                fontWeight: 700,
                background: '#f5f3ff',
                color: '#6d28d9',
                border: '1px solid #ddd6fe',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {formatMelaId(row.id)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>{venue}</span>
            {row.client && (
              <div>
                <span style={{
                  fontSize: '10px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  marginTop: 2,
                  display: 'inline-block'
                }}>
                  🏢 Client: {row.client}
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (_, row) => (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
          <strong style={{ display: 'block' }}>{row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Sept 2026'}</strong>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{row.time || '09:00 AM - 05:00 PM'}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>📍 {v || 'Vijayawada'}</span>
    },
    {
      key: 'organizer',
      label: 'Organizing Authority',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', fontWeight: 600 }}>{v || 'NTR Vikasa Authority'}</span>
    },
    {
      key: 'companies',
      label: 'Companies',
      render: (v, row) => {
        const count = Array.isArray(row.participatingCompanies)
          ? row.participatingCompanies.length
          : (typeof v === 'number' ? v : (Array.isArray(v) ? v.length : (row.companiesCount || 0)));
        return (
          <button
            type="button"
            onClick={() => handleOpenMelaManagement(row)}
            title="Click to view all participating companies"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <span
              className="badge badge-primary"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'transform 120ms ease, box-shadow 120ms ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Building2 size={13} /> {count} Companies
            </span>
          </button>
        );
      }
    },
    {
      key: 'registeredCandidatesCount',
      label: 'Registered Candidates (Banner)',
      sortable: true,
      render: (_, row) => {
        const stats = getMelaStats ? getMelaStats(row.id) : null;
        const regCount = stats
          ? stats.uniqueAppliedCandidatesCount
          : (row.registeredCandidatesCount !== undefined
              ? row.registeredCandidatesCount
              : ((registrations || []).filter(r =>
                  (r.melaId && String(r.melaId) === String(row.id)) ||
                  (r.event && (row.event || row.title) && r.event.toLowerCase().includes((row.event || row.title).toLowerCase()))
                ).length));
        const maxCapacity = Number(row.capacity || row.maxCapacity) || 3000;
        const pct = Math.min(100, Math.round((regCount / maxCapacity) * 100));

        return (
          <div style={{ minWidth: 155 }}>
            <button
              type="button"
              onClick={() => handleOpenMelaRegistrations(row)}
              title="Click to view registered candidates list"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                marginBottom: 3
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#4338ca',
                  background: '#e0e7ff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <Users size={12} /> {(Number(regCount) || 0).toLocaleString('en-IN')} Candidates
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                  {pct}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                background: 'var(--color-gray-200)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: pct > 80 ? '#059669' : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  borderRadius: 3,
                  transition: 'width 300ms ease'
                }} />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginTop: 2 }}>
                Cap: {maxCapacity.toLocaleString('en-IN')} students
              </span>
            </button>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v || 'UPCOMING'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Button
            size="xs"
            variant="secondary"
            leftIcon={<Users size={12} />}
            onClick={() => handleOpenMelaRegistrations(row)}
            title="View candidates registered for this Job Mela"
          >
            Registrations
          </Button>

          {row.status !== 'APPROVED' && row.status !== 'UPCOMING' && (
            <Button
              size="xs"
              variant="primary"
              onClick={() => handleApprove(row)}
            >
              Approve
            </Button>
          )}

          {row.status !== 'REJECTED' && (
            <Button
              size="xs"
              variant="danger"
              onClick={() => handleReject(row)}
            >
              Reject
            </Button>
          )}
        </div>
      )
    }
  ];

  // Columns for Job Mela Requests Table
  const requestColumns = [
    {
      key: 'event',
      label: 'Job Mela / Event Name',
      sortable: true,
      render: (_, row) => {
        const title = row.event || row.title || 'Job Mela Event';
        const venue = row.venue || row.location || 'Proposed Venue';
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block' }}>{title}</strong>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                fontWeight: 700,
                background: '#f5f3ff',
                color: '#6d28d9',
                border: '1px solid #ddd6fe',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {formatMelaId(row.id)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>{venue}</span>
          </div>
        );
      }
    },
    {
      key: 'organizer',
      label: 'Requesting Organization / Authority',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>{v || 'External Authority'}</span>
    },
    {
      key: 'date',
      label: 'Proposed Date & Time',
      render: (_, row) => (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
          <strong style={{ display: 'block' }}>
            {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '20 Oct 2026'}
          </strong>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{row.time || '09:00 AM - 05:00 PM'}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Venue / Location',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>📍 {v || 'Hyderabad'}</span>
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      render: (v, row) => {
        const reqDate = v || row.createdAt || '2026-09-01';
        return (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {new Date(reqDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Request Status',
      render: (v) => <StatusBadge status={v || 'PENDING'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Eye size={12} />}
            onClick={() => {
              setSelectedRequest(row);
              setRequestDetailsOpen(true);
            }}
          >
            View Details
          </Button>

          {row.status === 'PENDING' && (
            <>
              <Button
                size="xs"
                variant="primary"
                leftIcon={<Check size={12} />}
                onClick={() => handleApprove(row)}
              >
                Approve
              </Button>
              <Button
                size="xs"
                variant="danger"
                leftIcon={<X size={12} />}
                onClick={() => handleReject(row)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  // Overall Job Mela Registration Count & Capacity for Admin Banner
  const totalMelaRegistrations = useMemo(() => {
    return jobMelas.reduce((acc, m) => {
      const c = m.registeredCandidatesCount !== undefined
        ? m.registeredCandidatesCount
        : (m.registrationsCount !== undefined ? m.registrationsCount : 150);
      return acc + Number(c || 0);
    }, 0);
  }, [jobMelas]);

  const totalMelaCapacity = useMemo(() => {
    return jobMelas.reduce((acc, m) => {
      const c = Number(m.capacity || m.maxCapacity) || 2500;
      return acc + c;
    }, 0);
  }, [jobMelas]);

  return (
    <div className="admin-job-melas-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar with Exactly 3 Primary Actions */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <CalendarDays size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Mega Job Melas & Career Summits</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Govern state-wide employment drives, review external summit requests, and allocate company booths.
            </p>
          </div>

          {/* Actions Area */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant={activeAction === 'REQUESTS' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Inbox size={16} />}
              onClick={() => setActiveAction('REQUESTS')}
            >
              Job Mela Requests {pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}
            </Button>
            <Button
              variant={activeAction === 'ADMIN_CREATED' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<CalendarDays size={16} />}
              onClick={() => setActiveAction('ADMIN_CREATED')}
            >
              Admin Created Melas
            </Button>
            <Link to="/admin/job-melas/create" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
                Create Job Mela
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Prominent Job Mela Registration Count Banner for Admin ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-6)',
        color: '#fff',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient decorative glow */}
        <div style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-5)', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, backdropFilter: 'blur(4px)' }}>
              <Sparkles size={13} style={{ color: '#fbbf24' }} /> Job Mela Registration Counter
            </div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0, color: '#fff' }}>
              Candidate Registrations & Enrollment Overview
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: '#c7d2fe', margin: '4px 0 0 0', maxWidth: 620, lineHeight: 1.5 }}>
              Track how many candidates have registered for state employment drives, job melas, and client-sponsored expos across NTR District.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: 155
            }}>
              <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Total Registered
              </span>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Users size={20} style={{ color: '#34d399' }} />
                {totalMelaRegistrations.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '10px', color: '#a7f3d0', fontWeight: 600 }}>
                Enrolled Students
              </span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: 155
            }}>
              <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Total Event Capacity
              </span>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Ticket size={20} style={{ color: '#60a5fa' }} />
                {totalMelaCapacity.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 600 }}>
                Across {jobMelas.length} Career Melas
              </span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: 155
            }}>
              <span style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Turnout Fill Rate
              </span>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#fcd34d', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                {totalMelaCapacity > 0 ? Math.round((totalMelaRegistrations / totalMelaCapacity) * 100) : 0}%
              </div>
              <span style={{ fontSize: '10px', color: '#fde68a', fontWeight: 600 }}>
                Intake Capacity Used
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW 1: ADMIN CREATED MELAS ── */}
      {activeAction === 'ADMIN_CREATED' && (
        <>
          {/* Search & Status Filter Tabs for Admin Created Melas */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 440 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search admin-created events, venue, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius-lg)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: statusFilter === tab.key ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        background: statusFilter === tab.key ? 'var(--color-primary-600)' : 'var(--color-surface)',
                        color: statusFilter === tab.key ? '#fff' : 'var(--color-text-muted)',
                        transition: 'all 150ms ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <ExportDropdown
                  onExportExcel={handleExportAdminMelasExcel}
                  onExportPdf={handleExportAdminMelasPdf}
                  disabled={filteredAdminMelas.length === 0}
                />
              </div>
            </div>
          </div>

          {/* Admin Created Melas Table */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {filteredAdminMelas.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={40} />}
                title="No Admin Created Job Melas Found"
                description="No admin-created job mela events match your search or status filter."
              />
            ) : (
              <>
                <Table columns={adminColumns} data={paginatedAdminMelas} />
                <Pagination
                  currentPage={adminMelasPage}
                  totalPages={totalAdminMelasPages}
                  totalItems={filteredAdminMelas.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setAdminMelasPage}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* ── VIEW 2: JOB MELA REQUESTS ── */}
      {activeAction === 'REQUESTS' && (
        <>
          {/* Search & Request Status Filters */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Row 1: Status Filter Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
                {[
                  { key: 'ALL', label: 'All Requests' },
                  { key: 'PENDING', label: `Pending (${pendingRequestsCount})` },
                  { key: 'APPROVED', label: 'Approved' },
                  { key: 'REJECTED', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRequestStatusTab(tab.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: requestStatusTab === tab.key ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: requestStatusTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-surface)',
                      color: requestStatusTab === tab.key ? '#fff' : 'var(--color-text-muted)',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Company / Organization Filter Dropdown & Search Bar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
              {/* Company / Organization Dropdown Filter */}
              <div style={{ position: 'relative', minWidth: 260, flex: '0 1 300px' }}>
                <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <select
                  value={requestCompanyFilter}
                  onChange={(e) => setRequestCompanyFilter(e.target.value)}
                  className="form-control"
                  style={{
                    width: '100%',
                    height: 38,
                    paddingLeft: 36,
                    paddingRight: 28,
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    background: requestCompanyFilter === 'ALL' ? 'var(--color-surface)' : 'var(--color-primary-50, #eff6ff)',
                    borderColor: requestCompanyFilter === 'ALL' ? 'var(--color-border)' : 'var(--color-primary-500)'
                  }}
                >
                  <option value="ALL">All Companies</option>
                  {availableRequestOrganizations.map((orgName) => (
                    <option key={orgName} value={orgName}>
                      {orgName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search request event name, organization, venue..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                />
              </div>

              {/* Active Filter Clear */}
              {(requestCompanyFilter !== 'ALL' || requestStatusTab !== 'ALL' || search.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setRequestCompanyFilter('ALL');
                    setRequestStatusTab('ALL');
                    setSearch('');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 'var(--text-xs)', height: 38, padding: '0 12px', color: 'var(--color-text-muted)' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Job Mela Requests Table */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {filteredRequests.length === 0 ? (
              <EmptyState
                icon={<Inbox size={40} />}
                title="No Job Mela Requests Found"
                description="No external organization requests match your search or filter."
              />
            ) : (
              <>
                <Table columns={requestColumns} data={paginatedRequests} />
                <Pagination
                  currentPage={requestsPage}
                  totalPages={totalRequestsPages}
                  totalItems={filteredRequests.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setRequestsPage}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* ── 1. Job Mela Management View Modal ── */}
      {viewModalOpen && selectedMela && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Job Mela Management: ${selectedMela.event || selectedMela.title}`}
          size="xl"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* ── Event Summary Section ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              color: '#fff',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-xl)',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CalendarDays size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4, flexWrap: 'wrap' }}>
                      <StatusBadge status={selectedMela.status || 'UPCOMING'} />
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {formatMelaId(selectedMela.id)}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0, color: '#fff' }}>
                      {selectedMela.event || selectedMela.title}
                    </h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: '#93c5fd', margin: '4px 0 0 0' }}>
                      📍 {selectedMela.venue || selectedMela.location} • {selectedMela.city || selectedMela.location}, {selectedMela.state || ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    size="xs"
                    variant="secondary"
                    leftIcon={<Eye size={12} />}
                    onClick={() => setSelectedPosterMela(selectedMela)}
                  >
                    View Flyer / Poster
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    leftIcon={<Download size={12} />}
                    onClick={() => {
                      const poster = selectedMela.posterImage || selectedMela.banner || selectedMela.image || '/hero2.jpg';
                      downloadPosterImage(poster, selectedMela.title || selectedMela.event);
                    }}
                  >
                    Download Poster
                  </Button>
                  <Link to={`/job-melas/${selectedMela.id}`} target="_blank" style={{ textDecoration: 'none' }}>
                    <Button size="xs" variant="secondary" leftIcon={<ExternalLink size={12} />}>
                      Public Page
                    </Button>
                  </Link>
                  <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={<Share2 size={12} />}
                    style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`${window.location.origin}/job-melas/${selectedMela.id}`);
                        addToast('Job Mela public link copied to clipboard!', 'info');
                      }
                    }}
                  >
                    Share Link
                  </Button>
                </div>
              </div>

              {/* Event Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-5)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                fontSize: 'var(--text-xs)'
              }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Event Schedule</span>
                  <strong style={{ color: '#f8fafc' }}>
                    📅 {selectedMela.date ? new Date(selectedMela.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Sept 2026'}
                  </strong>
                  <div style={{ color: '#cbd5e1', fontSize: '11px' }}>⏰ {selectedMela.time || '09:00 AM - 05:00 PM'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Registration Window</span>
                  <strong style={{ color: '#f8fafc' }}>
                    {selectedMela.regStartDate ? new Date(selectedMela.regStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '01 Aug'} – {selectedMela.regEndDate ? new Date(selectedMela.regEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (selectedMela.registrationDeadline || '15 Sept 2026')}
                  </strong>
                  <div style={{ color: '#cbd5e1', fontSize: '11px' }}>Capacity: {selectedMela.maxCapacity || selectedMela.seats || 5000} Candidates</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Turnout & Scale</span>
                  <strong style={{ color: '#38bdf8' }}>
                    👥 {selectedMela.registeredCandidatesCount || selectedMela.registeredCandidates || 1420} Registered Passes
                  </strong>
                  <div style={{ color: '#cbd5e1', fontSize: '11px' }}>
                    🏢 {selectedMela.participatingCompanies ? selectedMela.participatingCompanies.length : (selectedMela.companiesCount || 0)} Participating Companies
                  </div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Organizing Authority</span>
                  <strong style={{ color: '#f8fafc' }}>{selectedMela.organizer || 'NTR Vikasa State Employment Authority'}</strong>
                </div>
              </div>
            </div>

            {/* ── Participating Companies Section ── */}
            <div className="card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              
              {/* Header with Title and Counts */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4) var(--space-5)',
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Building2 size={18} style={{ color: 'var(--color-primary-600)' }} />
                    Participating Companies — {getScopedMelaCompanies(selectedMela).length}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    Corporate recruiters, hiring positions, vacancy quotas, and booth allocations for this Job Mela.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <ExportDropdown
                    label="Export"
                    items={[
                      {
                        label: 'Participating Companies - Excel',
                        icon: <FileSpreadsheet size={15} style={{ color: '#16a34a' }} />,
                        onClick: () => handleExportMelaCompaniesExcel(selectedMela)
                      },
                      {
                        label: 'Participating Companies - PDF',
                        icon: <FileText size={15} style={{ color: '#dc2626' }} />,
                        onClick: () => handleExportMelaCompaniesPdf(selectedMela)
                      },
                      {
                        label: 'Registered Candidates - Excel',
                        icon: <FileSpreadsheet size={15} style={{ color: '#2563eb' }} />,
                        onClick: () => handleExportMelaCandidatesExcel(selectedMela)
                      },
                      {
                        label: 'Registered Candidates - PDF',
                        icon: <FileText size={15} style={{ color: '#9333ea' }} />,
                        onClick: () => handleExportMelaCandidatesPdf(selectedMela)
                      }
                    ]}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={handleOpenAddCompany}
                  >
                    + Add Company
                  </Button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--color-gray-50)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 380 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search company, recruiter, position, qualification..."
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setCompanyPage(1);
                    }}
                    className="form-control"
                    style={{ width: '100%', paddingLeft: 32, paddingRight: companySearch ? 28 : 10, height: 34, fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                  />
                  {companySearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCompanySearch('');
                        setCompanyPage(1);
                      }}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs & Page Size */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                    {[
                      { key: 'ALL', label: `All (${getScopedMelaCompanies(selectedMela).length})` },
                      { key: 'ACTIVE', label: `Active (${getScopedMelaCompanies(selectedMela).length})` },
                      { key: 'HIGH_VACANCIES', label: `50+ Vacancies (${getScopedMelaCompanies(selectedMela).filter(c => (Number(c.vacancies) || 0) >= 50).length})` }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setCompanyFilter(tab.key);
                          setCompanyPage(1);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: companyFilter === tab.key ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: companyFilter === tab.key ? 'var(--color-primary-600)' : 'var(--color-surface)',
                          color: companyFilter === tab.key ? '#fff' : 'var(--color-text-muted)',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Page Size Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>Show:</span>
                    <select
                      value={companyPageSize}
                      onChange={(e) => {
                        setCompanyPageSize(Number(e.target.value));
                        setCompanyPage(1);
                      }}
                      className="form-control"
                      style={{ height: 30, padding: '2px 8px', fontSize: '11px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                    >
                      <option value={10}>10 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Companies Table / List */}
              <div style={{ padding: 0 }}>
                {(() => {
                  const currentMelaCompanies = getScopedMelaCompanies(selectedMela);
                  const filteredMelaCompanies = currentMelaCompanies.filter(c => {
                    if (companySearch.trim()) {
                      const q = companySearch.toLowerCase();
                      const matchComp = (c.company || '').toLowerCase().includes(q);
                      const matchRec = (c.recruiter || '').toLowerCase().includes(q);
                      const matchPos = (c.position || '').toLowerCase().includes(q);
                      const matchQual = (c.qualification || '').toLowerCase().includes(q);
                      const matchLoc = (c.location || '').toLowerCase().includes(q);
                      const matchNotes = (c.notes || '').toLowerCase().includes(q);
                      if (!matchComp && !matchRec && !matchPos && !matchQual && !matchLoc && !matchNotes) return false;
                    }
                    if (companyFilter === 'HIGH_VACANCIES') {
                      const v = Number(c.vacancies) || 0;
                      return v >= 50;
                    }
                    return true;
                  });

                  const totalFiltered = filteredMelaCompanies.length;
                  const totalPages = Math.max(1, Math.ceil(totalFiltered / companyPageSize));
                  const safePage = Math.min(Math.max(1, companyPage), totalPages);
                  const startIdx = (safePage - 1) * companyPageSize;
                  const paginatedRows = filteredMelaCompanies.slice(startIdx, startIdx + companyPageSize);

                  if (totalFiltered === 0) {
                    return (
                      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                        <EmptyState
                          icon={<Building2 size={36} style={{ color: 'var(--color-primary-500)' }} />}
                          title="No Participating Companies Found"
                          description={companySearch ? `No companies match your search "${companySearch}". Try a different keyword.` : "No participating companies added yet."}
                        />
                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
                          {companySearch && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCompanySearch('');
                                setCompanyFilter('ALL');
                                setCompanyPage(1);
                              }}
                            >
                              Clear Search Filter
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            onClick={handleOpenAddCompany}
                          >
                            + Add Company
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '10px 12px', width: 44 }}>#</th>
                              <th style={{ padding: '10px 14px' }}>Company</th>
                              <th style={{ padding: '10px 14px' }}>Recruiter</th>
                              <th style={{ padding: '10px 14px' }}>Position(s)</th>
                              <th style={{ padding: '10px 14px' }}>Qualification</th>
                              <th style={{ padding: '10px 14px' }}>Experience</th>
                              <th style={{ padding: '10px 14px' }}>Salary</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Vacancies</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Applications</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedRows.map((c, idx) => {
                              const rowIndex = startIdx + idx + 1;
                              const companyInitial = (c.company || 'C').charAt(0).toUpperCase();
                              return (
                                <tr key={c.id || idx} style={{ borderBottom: '1px solid var(--color-border)', fontSize: 'var(--text-xs)' }}>
                                  <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                    {rowIndex}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                      <div style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 'var(--radius-md)',
                                        background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: '13px',
                                        flexShrink: 0
                                      }}>
                                        {companyInitial}
                                      </div>
                                      <div>
                                        <strong style={{ display: 'block', color: 'var(--color-text)' }}>{c.company}</strong>
                                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>📍 {c.location || 'On-site Pavilion'}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--color-text)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                      <User size={13} style={{ color: 'var(--color-primary-600)' }} />
                                      {c.recruiter || 'Talent Acquisition Lead'}
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--color-primary-700)', fontWeight: 700 }}>
                                    <div>{c.position}</div>
                                    {(c.jobId || c.id) && (
                                      <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: '9.5px',
                                        fontWeight: 700,
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        border: '1px solid #bfdbfe',
                                        padding: '1px 5px',
                                        borderRadius: '3px'
                                      }}>
                                        {formatJobId(c.jobId || c.id)}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)' }}>
                                    {c.qualification || 'Any Degree'}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)' }}>
                                    {c.experience || '0-2 Years'}
                                  </td>
                                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {c.salary || 'Best in Industry'}
                                  </td>
                                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                    <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 700 }}>
                                      {c.vacancies || 10} Slots
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--color-primary-600)', fontSize: '12px' }}>
                                      {c.applications || 0}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                                      <Button
                                        size="xs"
                                        variant="primary"
                                        leftIcon={<Eye size={12} />}
                                        onClick={() => handleOpenViewCompany(c)}
                                        title="View Company & Role Details"
                                      >
                                        View
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        iconOnly
                                        leftIcon={<Pencil size={12} />}
                                        onClick={() => handleOpenEditCompany(c)}
                                        title="Edit Company Details"
                                      />
                                      <Button
                                        size="xs"
                                        variant="danger"
                                        iconOnly
                                        leftIcon={<Trash2 size={12} />}
                                        onClick={() => handleRemoveCompany(c)}
                                        title="Remove Company from Job Mela"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Bar */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-3) var(--space-5)',
                        background: 'var(--color-gray-50)',
                        borderTop: '1px solid var(--color-border)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        <div style={{ color: 'var(--color-text-muted)' }}>
                          Showing <strong>{startIdx + 1}–{Math.min(startIdx + companyPageSize, totalFiltered)}</strong> of <strong>{totalFiltered}</strong> participating companies
                        </div>

                        {totalPages > 1 && (
                          <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={safePage <= 1}
                              onClick={() => setCompanyPage(p => Math.max(1, p - 1))}
                              leftIcon={<ChevronLeft size={13} />}
                            >
                              Previous
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                              .map((p, idx, arr) => {
                                const prev = arr[idx - 1];
                                const showEllipsis = prev && p - prev > 1;
                                return (
                                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {showEllipsis && <span style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>...</span>}
                                    <button
                                      type="button"
                                      onClick={() => setCompanyPage(p)}
                                      style={{
                                        minWidth: 28,
                                        height: 28,
                                        padding: '0 6px',
                                        borderRadius: 'var(--radius-md)',
                                        border: safePage === p ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                                        background: safePage === p ? 'var(--color-primary-600)' : 'var(--color-surface)',
                                        color: safePage === p ? '#fff' : 'var(--color-text)',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {p}
                                    </button>
                                  </span>
                                );
                              })}

                            <Button
                              size="xs"
                              variant="outline"
                              disabled={safePage >= totalPages}
                              onClick={() => setCompanyPage(p => Math.min(totalPages, p + 1))}
                              rightIcon={<ChevronRight size={13} />}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', flexWrap: 'wrap' }}>

              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<Users size={13} />}
                  onClick={() => {
                    setViewModalOpen(false);
                    handleOpenMelaRegistrations(selectedMela);
                  }}
                >
                  Candidate Registrations
                </Button>
                {selectedMela.status !== 'APPROVED' && selectedMela.status !== 'UPCOMING' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleApprove(selectedMela);
                      setSelectedMela({ ...selectedMela, status: 'APPROVED' });
                    }}
                  >
                    Approve Event
                  </Button>
                )}
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* ── 2. View Participating Company Details Modal ── */}
      {companyDetailsModalOpen && viewingCompany && (
        <Modal
          isOpen={companyDetailsModalOpen}
          onClose={() => setCompanyDetailsModalOpen(false)}
          title={`Company Details: ${viewingCompany.company}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            
            {/* Header Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              color: '#fff',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {(viewingCompany.company || 'C').charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>
                      {viewingCompany.company}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: '#93c5fd', margin: '2px 0 0 0' }}>
                      📍 {viewingCompany.location || 'On-site Mela Booth'} • {selectedMela?.event || selectedMela?.title}
                    </p>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 10px' }}>
                    Verified Participant
                  </span>
                </div>
              </div>
            </div>

            {/* Structured 2-Column Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
              
              {/* Job Specification Card */}
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Briefcase size={14} /> Role & Eligibility
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Hiring Position</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{viewingCompany.position}</strong>
                      {(viewingCompany.jobId || viewingCompany.id) && (
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          {formatJobId(viewingCompany.jobId || viewingCompany.id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Eligibility / Qualification</span>
                    <strong style={{ color: 'var(--color-text)' }}>{viewingCompany.qualification || 'Any Degree / Diploma'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Experience Required</span>
                    <strong style={{ color: 'var(--color-text)' }}>{viewingCompany.experience || 'Fresher / 0-2 Years'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Offered Compensation</span>
                    <strong style={{ color: 'var(--color-success-700)', fontSize: 'var(--text-sm)' }}>{viewingCompany.salary || 'Best in Industry'}</strong>
                  </div>
                </div>
              </div>

              {/* Recruiter & Turnout Card */}
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={14} /> Recruiter & Booth Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Assigned Recruiter</span>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{viewingCompany.recruiter || 'Talent Acquisition Lead'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Booth / Stall Allocation</span>
                    <strong style={{ color: 'var(--color-primary-700)' }}>{viewingCompany.location || 'Stall A-1 (Main Pavilion)'}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 4 }}>
                    <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Open Vacancies</span>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-success-600)' }}>{viewingCompany.vacancies || 10}</strong>
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Applications</span>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-600)' }}>{viewingCompany.applications || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Notes & Instructions Card */}
            {viewingCompany.notes && (
              <div style={{ background: '#f8fafc', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  Walk-in Instructions & Candidate Notes
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', margin: 0, lineHeight: 1.6 }}>
                  {viewingCompany.notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button
                variant="outline"
                onClick={() => setCompanyDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={<Pencil size={13} />}
                onClick={() => {
                  setCompanyDetailsModalOpen(false);
                  handleOpenEditCompany(viewingCompany);
                }}
              >
                Edit Company Details
              </Button>
            </div>

          </div>
        </Modal>
      )}

      {/* ── 3. Add / Edit Participating Company Modal ── */}
      {companyModalOpen && (
        <Modal
          isOpen={companyModalOpen}
          onClose={() => setCompanyModalOpen(false)}
          title={editingCompany ? `Edit Company: ${editingCompany.company}` : `Add Participating Company`}
          size="md"
        >
          <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            {/* Select or Enter Company */}
            <FormField label="Company Name" required hint="Choose from registered companies or enter custom name">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <select
                  value={companyFormData.companyId || (companies.some(c => c.name === companyFormData.company) ? companies.find(c => c.name === companyFormData.company)?.id : 'CUSTOM')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setCompanyFormData({ ...companyFormData, companyId: '', company: '' });
                    } else {
                      const matched = companies.find(c => c.id === val);
                      if (matched) {
                        setCompanyFormData({
                          ...companyFormData,
                          companyId: matched.id,
                          company: matched.name,
                          recruiter: matched.recruiter || companyFormData.recruiter,
                          location: companyFormData.location || `${matched.location || 'Stall A-1'}`
                        });
                      }
                    }
                  }}
                  className="form-control"
                  style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                >
                  <option value="">-- Select from Registered Companies --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.industry || 'Corporate'})</option>
                  ))}
                  <option value="CUSTOM">+ Other / Custom Employer Name</option>
                </select>

                <Input
                  placeholder="Or enter company / organization name..."
                  value={companyFormData.company}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, company: e.target.value })}
                  required
                />
              </div>
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <FormField label="Recruiter / Contact Person">
                <Input
                  placeholder="e.g. Arjun Reddy (Talent Lead)"
                  value={companyFormData.recruiter}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, recruiter: e.target.value })}
                />
              </FormField>

              <FormField label="Hiring Position / Role" required>
                <Input
                  placeholder="e.g. Senior Frontend Engineer"
                  value={companyFormData.position}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, position: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <FormField label="Number of Vacancies" required>
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  value={companyFormData.vacancies}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, vacancies: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Offered Salary Package" required>
                <Input
                  placeholder="e.g. ₹4,50,000 - ₹7,00,000 / year"
                  value={companyFormData.salary}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, salary: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <FormField label="Eligibility / Qualification" required>
                <Input
                  placeholder="e.g. B.Tech / MCA / Any Degree"
                  value={companyFormData.qualification}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, qualification: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Experience Required" required>
                <Input
                  placeholder="e.g. 0-2 Years / Fresher"
                  value={companyFormData.experience}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, experience: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Stall / Booth Allocation">
              <Input
                placeholder="e.g. Stall B-14 (Hall 3)"
                value={companyFormData.location}
                onChange={(e) => setCompanyFormData({ ...companyFormData, location: e.target.value })}
              />
            </FormField>

            <FormField label="Notes & Walk-in Instructions">
              <Textarea
                rows={2}
                placeholder="e.g. Carry 3 printed resume copies and government photo ID..."
                value={companyFormData.notes}
                onChange={(e) => setCompanyFormData({ ...companyFormData, notes: e.target.value })}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setCompanyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingCompany ? 'Save Changes' : 'Add Company to Job Mela'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 2. Request Details View Modal ── */}
      {requestDetailsOpen && selectedRequest && (
        <Modal
          isOpen={requestDetailsOpen}
          onClose={() => setRequestDetailsOpen(false)}
          title={`Job Mela Request: ${selectedRequest.event || selectedRequest.title}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* 1. REQUEST OVERVIEW - Header Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#fff',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Inbox size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>{selectedRequest.event || selectedRequest.title}</span>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {formatMelaId(selectedRequest.id)}
                    </span>
                  </h3>
                  <StatusBadge status={selectedRequest.status || 'PENDING'} />
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Submitted by: <strong style={{ color: '#e2e8f0' }}>{selectedRequest.organizer || 'External Authority'}</strong>
                </p>
              </div>
            </div>

            {/* 2. EVENT LOGISTICS & LOCATION + 3. SCALE & REQUIREMENTS (2-Col Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {/* 2. EVENT LOGISTICS & LOCATION */}
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} /> Event Logistics & Location
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Proposed Date:</strong> <span>{selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '20 Oct 2026'}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Event Timings:</strong> <span>{selectedRequest.time || (selectedRequest.startTime && selectedRequest.endTime ? `${selectedRequest.startTime} - ${selectedRequest.endTime}` : '09:00 AM - 05:00 PM')}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Venue / Ground:</strong> <span>{selectedRequest.venue || selectedRequest.location || 'Proposed Venue'}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>City / Region:</strong> <span>{selectedRequest.city || selectedRequest.state ? `${selectedRequest.city || ''}${selectedRequest.city && selectedRequest.state ? ', ' : ''}${selectedRequest.state || ''}` : (selectedRequest.location || 'Andhra Pradesh')}</span>
                  </p>
                </div>
              </div>

              {/* 3. SCALE & REQUIREMENTS */}
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={13} /> Scale & Requirements
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Target Vacancies:</strong> <span>{selectedRequest.vacanciesCount ? `${selectedRequest.vacanciesCount}+ Positions` : (selectedRequest.vacancies || '800+ Positions')}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Expected Companies:</strong> <span>{selectedRequest.companiesCount ? `${selectedRequest.companiesCount}+ Employers` : (Array.isArray(selectedRequest.participatingCompanies) ? `${selectedRequest.participatingCompanies.length}+ Employers` : '40+ Employers')}</span>
                  </p>
                  {selectedRequest.maxCapacity && (
                    <p style={{ margin: 0 }}>
                      <strong>Max Candidate Capacity:</strong> <span>{selectedRequest.maxCapacity.toLocaleString()} Attendees</span>
                    </p>
                  )}
                  {selectedRequest.description && (
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '11px', marginTop: 2, lineHeight: 1.5 }}>
                      {selectedRequest.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. REQUEST TIMELINE & 5. REQUESTER / ORGANIZATION DETAILS (2-Col Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {/* 4. REQUEST TIMELINE */}
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> Request Timeline & Status
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Submission Date:</strong> <span>{new Date(selectedRequest.requestDate || selectedRequest.createdAt || '2026-09-01').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </p>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong>Current Status:</strong> <StatusBadge status={selectedRequest.status || 'PENDING'} />
                  </p>
                  {selectedRequest.approvalDate && (
                    <p style={{ margin: 0 }}>
                      <strong>Decision Date:</strong> <span>{new Date(selectedRequest.approvalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </p>
                  )}
                  {selectedRequest.regStartDate && selectedRequest.regEndDate && (
                    <p style={{ margin: 0 }}>
                      <strong>Registration Window:</strong> <span>{selectedRequest.regStartDate} to {selectedRequest.regEndDate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 5. REQUESTER / ORGANIZATION DETAILS */}
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} /> Requester / Organization Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Organization Name:</strong> <span>{selectedRequest.organizer || 'State Employment Body'}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Contact Person:</strong> <span>{selectedRequest.contactPerson || selectedRequest.contact || selectedRequest.leadPerson || 'Nodal Placement Officer'}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Official Email:</strong> <span style={{ color: 'var(--color-primary-600)' }}>{selectedRequest.email || selectedRequest.officialEmail || 'events@apssdc.in'}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Phone:</strong> <span>{selectedRequest.phone || selectedRequest.contactPhone || '+91 866 242 9999'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 6. ADMIN ACTIONS (Status-Based: PENDING -> [Close][Reject][Approve]; APPROVED/REJECTED -> [Close]) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button variant="outline" size="sm" onClick={() => setRequestDetailsOpen(false)}>
                Close
              </Button>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<X size={14} />}
                    onClick={() => {
                      handleReject(selectedRequest);
                      setSelectedRequest({ ...selectedRequest, status: 'REJECTED' });
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check size={14} />}
                    onClick={() => {
                      handleApprove(selectedRequest);
                      setSelectedRequest({ ...selectedRequest, status: 'APPROVED' });
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── 4. Registered Candidates View Modal for Selected Job Mela ── */}
      {melaRegistrationsOpen && selectedMelaForRegs && (
        <Modal
          isOpen={melaRegistrationsOpen}
          onClose={() => setMelaRegistrationsOpen(false)}
          title={`Registered Candidates: ${selectedMelaForRegs.event || selectedMelaForRegs.title}`}
          size="xl"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* ── Event Summary Section ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              color: '#fff',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-xl)',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Ticket size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4, flexWrap: 'wrap' }}>
                      <StatusBadge status={selectedMelaForRegs.status || 'UPCOMING'} />
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {formatMelaId(selectedMelaForRegs.id)}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0, color: '#fff' }}>
                      {selectedMelaForRegs.event || selectedMelaForRegs.title}
                    </h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: '#93c5fd', margin: '4px 0 0 0' }}>
                      📍 {selectedMelaForRegs.venue || selectedMelaForRegs.location} • {selectedMelaForRegs.city || selectedMelaForRegs.location}, {selectedMelaForRegs.state || ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to="/admin/registrations" style={{ textDecoration: 'none' }}>
                    <Button size="xs" variant="secondary" leftIcon={<ExternalLink size={12} />}>
                      All Platform Passes
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Event Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-5)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                fontSize: 'var(--text-xs)'
              }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Event Schedule</span>
                  <strong style={{ color: '#f8fafc' }}>
                    📅 {selectedMelaForRegs.date ? new Date(selectedMelaForRegs.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Sept 2026'}
                  </strong>
                  <div style={{ color: '#cbd5e1', fontSize: '11px' }}>⏰ {selectedMelaForRegs.time || '09:00 AM - 05:00 PM'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Passes</span>
                  <strong style={{ color: '#38bdf8' }}>
                    👥 {getScopedMelaCandidates(selectedMelaForRegs).length} Verified Candidate Passes
                  </strong>
                  <div style={{ color: '#cbd5e1', fontSize: '11px' }}>Max Capacity: {selectedMelaForRegs.maxCapacity || selectedMelaForRegs.seats || 5000} Candidates</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Participating Employers</span>
                  <strong style={{ color: '#f8fafc' }}>
                    🏢 {getScopedMelaCompanies(selectedMelaForRegs).length} Participating Companies
                  </strong>
                  <div style={{ color: '#cbd5e1', fontSize: '11px' }}>On-site Hiring Booths</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Organizing Authority</span>
                  <strong style={{ color: '#f8fafc' }}>{selectedMelaForRegs.organizer || 'NTR Vikasa State Employment Authority'}</strong>
                </div>
              </div>
            </div>

            {/* ── Candidate Registrations List Card ── */}
            <div className="card" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              
              {/* Header with Title and Export */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4) var(--space-5)',
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Users size={18} style={{ color: 'var(--color-primary-600)' }} />
                    Registered Candidates — {getScopedMelaCandidates(selectedMelaForRegs).length}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    Candidate registrations, digital entry passes, contact details, and entry gate allocations for this Job Mela.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <ExportDropdown
                    onExportExcel={() => handleExportMelaCandidatesExcel(selectedMelaForRegs)}
                    onExportPdf={() => handleExportMelaCandidatesPdf(selectedMelaForRegs)}
                  />
                </div>
              </div>

              {/* Search & Status Filters */}
              <div style={{
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--color-gray-50)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 380 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search candidate name, email, pass ID, token..."
                    value={candidateSearch}
                    onChange={(e) => {
                      setCandidateSearch(e.target.value);
                      setCandidatePage(1);
                    }}
                    className="form-control"
                    style={{ width: '100%', paddingLeft: 32, paddingRight: candidateSearch ? 28 : 10, height: 34, fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                  />
                  {candidateSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateSearch('');
                        setCandidatePage(1);
                      }}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs & Page Size */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                    {[
                      { key: 'ALL', label: `All (${getScopedMelaCandidates(selectedMelaForRegs).length})` },
                      { key: 'CONFIRMED', label: `Confirmed (${getScopedMelaCandidates(selectedMelaForRegs).filter(c => c.status === 'CONFIRMED').length})` },
                      { key: 'WAITLISTED', label: `Waitlisted (${getScopedMelaCandidates(selectedMelaForRegs).filter(c => c.status === 'WAITLISTED').length})` }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setCandidateStatusFilter(tab.key);
                          setCandidatePage(1);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: candidateStatusFilter === tab.key ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: candidateStatusFilter === tab.key ? 'var(--color-primary-600)' : 'var(--color-surface)',
                          color: candidateStatusFilter === tab.key ? '#fff' : 'var(--color-text-muted)',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Page Size Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>Show:</span>
                    <select
                      value={candidatePageSize}
                      onChange={(e) => {
                        setCandidatePageSize(Number(e.target.value));
                        setCandidatePage(1);
                      }}
                      className="form-control"
                      style={{ height: 30, padding: '2px 8px', fontSize: '11px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                    >
                      <option value={10}>10 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Candidates Table */}
              <div style={{ padding: 0 }}>
                {(() => {
                  const allCandidates = getScopedMelaCandidates(selectedMelaForRegs);
                  const filteredCandidates = allCandidates.filter(c => {
                    if (candidateSearch.trim()) {
                      const q = candidateSearch.toLowerCase();
                      const matchName = (c.candidate || c.candidateName || '').toLowerCase().includes(q);
                      const matchEmail = (c.candidateEmail || c.email || '').toLowerCase().includes(q);
                      const matchPhone = (c.phone || '').toLowerCase().includes(q);
                      const matchId = (c.id || '').toLowerCase().includes(q);
                      const matchToken = (c.entryToken || '').toLowerCase().includes(q);
                      if (!matchName && !matchEmail && !matchPhone && !matchId && !matchToken) return false;
                    }
                    if (candidateStatusFilter !== 'ALL' && c.status !== candidateStatusFilter) return false;
                    return true;
                  });

                  const totalFiltered = filteredCandidates.length;
                  const totalPages = Math.max(1, Math.ceil(totalFiltered / candidatePageSize));
                  const safePage = Math.min(Math.max(1, candidatePage), totalPages);
                  const startIdx = (safePage - 1) * candidatePageSize;
                  const paginatedRows = filteredCandidates.slice(startIdx, startIdx + candidatePageSize);

                  if (totalFiltered === 0) {
                    return (
                      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                        <EmptyState
                          icon={<Users size={36} style={{ color: 'var(--color-primary-500)' }} />}
                          title="No Registered Candidates Found"
                          description={candidateSearch ? `No registered candidates match "${candidateSearch}".` : "No candidate registrations found for this Job Mela."}
                        />
                        {candidateSearch && (
                          <div style={{ marginTop: 'var(--space-4)' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCandidateSearch('');
                                setCandidateStatusFilter('ALL');
                                setCandidatePage(1);
                              }}
                            >
                              Clear Search Filter
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '10px 12px', width: 44 }}>#</th>
                              <th style={{ padding: '10px 14px' }}>Pass ID / Token</th>
                              <th style={{ padding: '10px 14px' }}>Candidate Name</th>
                              <th style={{ padding: '10px 14px' }}>Contact Info</th>
                              <th style={{ padding: '10px 14px' }}>Gate / Entry</th>
                              <th style={{ padding: '10px 14px' }}>Registration Date</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedRows.map((c, idx) => {
                              const rowIndex = startIdx + idx + 1;
                              const candidateName = c.candidate || c.candidateName || 'Candidate';
                              const candidateEmail = c.candidateEmail || c.email || 'candidate@example.com';
                              const initial = candidateName.charAt(0).toUpperCase();

                              return (
                                <tr key={c.id || idx} style={{ borderBottom: '1px solid var(--color-border)', fontSize: 'var(--text-xs)' }}>
                                  <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                    {rowIndex}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <div>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        color: 'var(--color-primary-700)',
                                        background: '#eff6ff',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid #bfdbfe'
                                      }}>
                                        <Ticket size={12} /> {c.entryToken || c.id}
                                      </span>
                                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                        ID: {c.id}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                      <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 'var(--radius-full)',
                                        background: 'linear-gradient(135deg, #1e1b4b, #3b82f6)',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: '12px',
                                        flexShrink: 0
                                      }}>
                                        {initial}
                                      </div>
                                      <div>
                                        <strong style={{ display: 'block', color: 'var(--color-text)' }}>{candidateName}</strong>
                                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{candidateEmail}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--color-text)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Phone size={12} style={{ color: 'var(--color-primary-600)' }} />
                                      <span>{c.phone || '+91 98765 43210'}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: 'var(--color-text)',
                                      background: 'var(--color-gray-100)',
                                      padding: '2px 8px',
                                      borderRadius: 'var(--radius-sm)'
                                    }}>
                                      🚪 {c.gateNumber || 'Gate 1 (Main Hall)'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                    {c.registrationDate ? new Date(c.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026'}
                                  </td>
                                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                    <StatusBadge status={c.status || 'CONFIRMED'} />
                                  </td>
                                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      leftIcon={<Eye size={12} />}
                                      onClick={() => {
                                        setSelectedPass({
                                          ...c,
                                          candidate: candidateName,
                                          email: candidateEmail,
                                          event: selectedMelaForRegs.event || selectedMelaForRegs.title
                                        });
                                        setPassModalOpen(true);
                                      }}
                                      title="View Candidate Digital Pass"
                                    >
                                      View Pass
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Bar */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-3) var(--space-5)',
                        background: 'var(--color-gray-50)',
                        borderTop: '1px solid var(--color-border)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        <div style={{ color: 'var(--color-text-muted)' }}>
                          Showing <strong>{startIdx + 1}–{Math.min(startIdx + candidatePageSize, totalFiltered)}</strong> of <strong>{totalFiltered}</strong> registered candidates
                        </div>

                        {totalPages > 1 && (
                          <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={safePage <= 1}
                              onClick={() => setCandidatePage(p => Math.max(1, p - 1))}
                              leftIcon={<ChevronLeft size={13} />}
                            >
                              Previous
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                              .map((p, idx, arr) => {
                                const prev = arr[idx - 1];
                                const showEllipsis = prev && p - prev > 1;
                                return (
                                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {showEllipsis && <span style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>...</span>}
                                    <button
                                      type="button"
                                      onClick={() => setCandidatePage(p)}
                                      style={{
                                        minWidth: 28,
                                        height: 28,
                                        padding: '0 6px',
                                        borderRadius: 'var(--radius-md)',
                                        border: safePage === p ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                                        background: safePage === p ? 'var(--color-primary-600)' : 'var(--color-surface)',
                                        color: safePage === p ? '#fff' : 'var(--color-text)',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {p}
                                    </button>
                                  </span>
                                );
                              })}

                            <Button
                              size="xs"
                              variant="outline"
                              disabled={safePage >= totalPages}
                              onClick={() => setCandidatePage(p => Math.min(totalPages, p + 1))}
                              rightIcon={<ChevronRight size={13} />}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  leftIcon={<Building2 size={14} />}
                  onClick={() => {
                    setMelaRegistrationsOpen(false);
                    handleOpenMelaManagement(selectedMelaForRegs);
                  }}
                >
                  View Participating Companies ({getScopedMelaCompanies(selectedMelaForRegs).length})
                </Button>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <Button variant="outline" onClick={() => setMelaRegistrationsOpen(false)}>
                  Close
                </Button>
                <Link to="/admin/registrations" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" leftIcon={<ExternalLink size={13} />}>
                    Open All Platform Passes
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* ── 5. Candidate Digital Pass Modal ── */}
      {passModalOpen && selectedPass && (() => {
        const matchedCandForPass = candidates?.find(c =>
          (selectedPass.candidateId && c.id === selectedPass.candidateId) ||
          (selectedPass.email && c.email?.toLowerCase() === selectedPass.email?.toLowerCase()) ||
          (selectedPass.candidateEmail && c.email?.toLowerCase() === selectedPass.candidateEmail?.toLowerCase()) ||
          (c.name?.toLowerCase() === (selectedPass.candidate || selectedPass.candidateName)?.toLowerCase())
        );

        const matchedMelaForPass = selectedMelaForRegs || jobMelas?.find(m =>
          (selectedPass.melaId && m.id === selectedPass.melaId) ||
          (selectedPass.event && (m.event?.toLowerCase() === selectedPass.event?.toLowerCase() || m.title?.toLowerCase() === selectedPass.event?.toLowerCase())) ||
          (selectedPass.eventName && (m.event?.toLowerCase() === selectedPass.eventName?.toLowerCase() || m.title?.toLowerCase() === selectedPass.eventName?.toLowerCase()))
        );

        const candResumeName = selectedPass.resumeName || matchedCandForPass?.resumeName || (matchedCandForPass?.name ? `${matchedCandForPass.name.replace(/\s+/g, '_')}_Resume.pdf` : (selectedPass.candidate ? `${selectedPass.candidate.replace(/\s+/g, '_')}_Resume.pdf` : null));

        const handleViewPassResume = () => {
          if (selectedPass.resumeUrl || matchedCandForPass?.resumeUrl) {
            window.open(selectedPass.resumeUrl || matchedCandForPass.resumeUrl, '_blank', 'noopener,noreferrer');
            return;
          }

          const candName = selectedPass.candidate || selectedPass.candidateName || matchedCandForPass?.name || 'Registered Candidate';
          const resumeFileName = candResumeName || `${candName.replace(/\s+/g, '_')}_Resume.pdf`;
          const headers = ['Resume Section', 'Candidate Details'];
          const rows = [
            ['Candidate Name', candName],
            ['Job Mela Registration ID', selectedPass.id || selectedPass.passId || 'N/A'],
            ['Target Job Mela Event', selectedPass.event || selectedPass.eventName || matchedMelaForPass?.title || 'State Employment Mega Job Mela'],
            ['Email Address', selectedPass.candidateEmail || selectedPass.email || matchedCandForPass?.email || 'N/A'],
            ['Phone Number', selectedPass.candidatePhone || selectedPass.phone || matchedCandForPass?.phone || '+91 98765 43210'],
            ['Location / District', selectedPass.location || selectedPass.district || matchedCandForPass?.location || 'Andhra Pradesh'],
            ['Total Experience', selectedPass.experience || matchedCandForPass?.experience || 'N/A'],
            ['Education Qualification', selectedPass.education || selectedPass.qualification || matchedCandForPass?.education || 'Graduate'],
            ['Key Skills', (() => {
              const s = selectedPass.skills || matchedCandForPass?.skills;
              return Array.isArray(s) ? s.join(', ') : (s || 'N/A');
            })()],
            ['Pass / Gate Status', selectedPass.status || 'CONFIRMED']
          ];

          const blob = generatePDFBlob({
            filename: resumeFileName,
            title: `Candidate Resume: ${candName}`,
            subtitle: `Job Mela Registration Record — Pass: ${selectedPass.id || 'N/A'} at ${selectedPass.event || matchedMelaForPass?.title || 'Job Mela'}`,
            metadata: {
              'Candidate Name': candName,
              'Pass ID': selectedPass.id || 'N/A',
              'Event': selectedPass.event || matchedMelaForPass?.title || 'Job Mela',
              'Status': selectedPass.status || 'CONFIRMED'
            },
            headers,
            rows
          });

          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank', 'noopener,noreferrer');
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        };

        const handleDownloadPassResume = () => {
          const candName = selectedPass.candidate || selectedPass.candidateName || matchedCandForPass?.name || 'Registered Candidate';
          const resumeFileName = candResumeName || `${candName.replace(/\s+/g, '_')}_Resume.pdf`;
          if (selectedPass.resumeUrl || matchedCandForPass?.resumeUrl) {
            const a = document.createElement('a');
            a.href = selectedPass.resumeUrl || matchedCandForPass.resumeUrl;
            a.download = resumeFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
          }

          const headers = ['Resume Section', 'Candidate Details'];
          const rows = [
            ['Candidate Name', candName],
            ['Job Mela Registration ID', selectedPass.id || selectedPass.passId || 'N/A'],
            ['Target Job Mela Event', selectedPass.event || selectedPass.eventName || matchedMelaForPass?.title || 'State Employment Mega Job Mela'],
            ['Email Address', selectedPass.candidateEmail || selectedPass.email || matchedCandForPass?.email || 'N/A'],
            ['Phone Number', selectedPass.candidatePhone || selectedPass.phone || matchedCandForPass?.phone || '+91 98765 43210'],
            ['Location / District', selectedPass.location || selectedPass.district || matchedCandForPass?.location || 'Andhra Pradesh'],
            ['Total Experience', selectedPass.experience || matchedCandForPass?.experience || 'N/A'],
            ['Education Qualification', selectedPass.education || selectedPass.qualification || matchedCandForPass?.education || 'Graduate'],
            ['Key Skills', (() => {
              const s = selectedPass.skills || matchedCandForPass?.skills;
              return Array.isArray(s) ? s.join(', ') : (s || 'N/A');
            })()],
            ['Pass / Gate Status', selectedPass.status || 'CONFIRMED']
          ];

          exportToPDF({
            filename: resumeFileName,
            title: `Candidate Resume: ${candName}`,
            subtitle: `Job Mela Registration Record — Pass: ${selectedPass.id || 'N/A'} at ${selectedPass.event || matchedMelaForPass?.title || 'Job Mela'}`,
            metadata: {
              'Candidate Name': candName,
              'Pass ID': selectedPass.id || 'N/A',
              'Event': selectedPass.event || matchedMelaForPass?.title || 'Job Mela',
              'Status': selectedPass.status || 'CONFIRMED'
            },
            headers,
            rows
          });
          addToast(`Downloading candidate resume: ${resumeFileName}`, 'success');
        };

        return (
          <Modal
            isOpen={passModalOpen}
            onClose={() => setPassModalOpen(false)}
            title="Digital Mela Pass Verification"
            size="lg"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Header Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#fff',
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#c7d2fe',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Ticket size={14} /> NTR VIKASA VERIFIED ENTRY PASS
                  </span>
                  <span style={{
                    fontSize: '11px',
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}>
                    Registration ID: {selectedPass.id}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: '2px 0 0 0', color: '#fff' }}>
                    {selectedPass.candidate || selectedPass.candidateName || matchedCandForPass?.name || 'Candidate'}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: '#c7d2fe', margin: '4px 0 0 0' }}>
                    <strong>Event:</strong> {selectedPass.event || selectedPass.eventName || matchedMelaForPass?.event || matchedMelaForPass?.title || 'Job Mela Summit'}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 6, fontSize: '11px', color: '#e0e7ff' }}>
                    <span>🚪 <strong>Gate:</strong> {selectedPass.gateNumber || selectedPass.entryGate || 'Gate 1 (Main Hall)'}</span>
                    <span>🎫 <strong>Pass Status:</strong> {selectedPass.status || 'CONFIRMED'}</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Registration Details */}
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.05em' }}>
                    Registration Details
                  </h4>

                  <div style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Registration ID:</span>
                      <strong>{selectedPass.id}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Candidate Email:</span>
                      <span>{selectedPass.email || selectedPass.candidateEmail || matchedCandForPass?.email || 'N/A'}</span>
                    </div>

                    {(selectedPass.phone || selectedPass.candidatePhone || matchedCandForPass?.phone) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 4 }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Phone:</span>
                        <span>{selectedPass.phone || selectedPass.candidatePhone || matchedCandForPass?.phone}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Registration Date:</span>
                      <span>
                        {selectedPass.registeredDate || selectedPass.registrationDate
                          ? new Date(selectedPass.registeredDate || selectedPass.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '20 Aug 2026'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Entry Gate:</span>
                      <strong>{selectedPass.gateNumber || selectedPass.entryGate || 'Gate 1 – Main Hall'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Registration Status:</span>
                      <StatusBadge status={selectedPass.status || 'CONFIRMED'} />
                    </div>
                  </div>
                </div>

                {/* Job Mela Details */}
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.05em' }}>
                    Job Mela Details
                  </h4>

                  <div style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <strong style={{ color: 'var(--color-text)', fontSize: 'var(--text-sm)', display: 'block' }}>
                        {matchedMelaForPass?.event || matchedMelaForPass?.title || selectedPass.event || selectedPass.eventName || 'Job Mela Summit'}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                        {matchedMelaForPass?.city ? `📍 ${matchedMelaForPass.city}, ${matchedMelaForPass.state || 'AP'}` : '📍 State Exhibition Centre'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                      <Calendar size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                      <span><strong>Event Date:</strong> {matchedMelaForPass?.date ? new Date(matchedMelaForPass.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Sept 2026'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                      <Clock size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                      <span><strong>Event Time:</strong> {matchedMelaForPass?.time || (matchedMelaForPass?.startTime ? `${matchedMelaForPass.startTime} - ${matchedMelaForPass.endTime}` : '09:00 AM - 05:30 PM')}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                      <MapPin size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                      <span><strong>Venue:</strong> {matchedMelaForPass?.venue || 'State Convention & Exhibition Centre'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                      <Building2 size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                      <span><strong>Organizing Authority:</strong> {matchedMelaForPass?.organizer || matchedMelaForPass?.authority || 'NTR Vikasa Authority'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Event Status:</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0'
                      }}>
                        {matchedMelaForPass?.status || 'UPCOMING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entry Verification */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
                  Entry Verification
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-3)',
                  marginTop: 2
                }}>
                  <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      REGISTRATION STATUS
                    </span>
                    <div style={{ marginTop: 3 }}>
                      <StatusBadge status={selectedPass.status || 'CONFIRMED'} />
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      PASS STATUS
                    </span>
                    <strong style={{ fontSize: 'var(--text-xs)', color: '#047857', display: 'block', marginTop: 3 }}>
                      {selectedPass.passStatus || (selectedPass.status === 'CONFIRMED' ? 'Active Entry Pass' : 'Pending Verification')}
                    </strong>
                  </div>

                  <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      CHECK-IN STATUS
                    </span>
                    <strong style={{ fontSize: 'var(--text-xs)', color: selectedPass.checkedIn ? '#047857' : 'var(--color-text-muted)', display: 'block', marginTop: 3 }}>
                      {selectedPass.checkInStatus || (selectedPass.checkedIn ? 'Checked In' : 'Not Checked In')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Resume */}
              <div style={{
                background: 'var(--color-gray-50)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)'
              }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                  Resume
                </h4>

                {candResumeName ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 200 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>
                          {candResumeName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          PDF Document • Verified Candidate Resume
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<Eye size={13} />}
                        onClick={handleViewPassResume}
                      >
                        View Resume
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        leftIcon={<Download size={13} />}
                        onClick={handleDownloadPassResume}
                      >
                        Download Resume
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <Info size={14} />
                    <span>No resume available</span>
                  </div>
                )}
              </div>

              {/* Company Interactions (if present) */}
              {(selectedPass.companyInteractions || selectedPass.appliedCompanies || selectedPass.interactedCompanies) && (
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
                    Company Interactions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(selectedPass.companyInteractions || selectedPass.appliedCompanies || selectedPass.interactedCompanies).map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--color-gray-50)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        <strong>{typeof item === 'string' ? item : item.company}</strong>
                        <span style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                          {typeof item === 'object' ? item.status || 'Applied' : 'Interacted'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-4)',
                marginTop: 'var(--space-2)'
              }}>
                <Link to="/admin/candidates" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPassModalOpen(false)}
                  >
                    View Candidate Profile
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPassModalOpen(false)}
                >
                  Close
                </Button>
              </div>

            </div>
          </Modal>
        );
      })()}

      {/* Full Resolution Poster Lightbox Modal */}
      {selectedPosterMela && (
        <JobMelaPosterModal
          isOpen={Boolean(selectedPosterMela)}
          onClose={() => setSelectedPosterMela(null)}
          posterUrl={selectedPosterMela.posterImage || selectedPosterMela.banner || selectedPosterMela.image || '/hero2.jpg'}
          eventTitle={selectedPosterMela.title || selectedPosterMela.event}
          eventDate={selectedPosterMela.date}
          eventVenue={selectedPosterMela.venue || selectedPosterMela.location}
        />
      )}
    </div>
  );
}


