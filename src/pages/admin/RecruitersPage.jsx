import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Search, Filter, Eye, ShieldAlert, ShieldCheck,
  Building2, Briefcase, Mail, Phone, MapPin, CheckCircle2,
  XCircle, AlertTriangle, FileText, GraduationCap, UserCheck,
  UserPlus, Plus, Sparkles, Download
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename, exportRecruiterDossierPDF } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';

// Consolidated Sub-Pages
import AdminJobsPage from './JobsPage';
import AdminInternshipsPage from './InternshipsPage';

export default function AdminRecruitersPage() {
  const { addToast } = useToast();
  const {
    recruiters,
    verifyRecruiter,
    suspendRecruiter,
    activateRecruiter,
    addRecruiter,
    companies = [],
    jobs = [],
    internships = [],
    applications = [],
    jobMelas = []
  } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const tabAliasMap = {
    'recruiters': 'recruiters',
    'jobs': 'jobs',
    'internships': 'internships',
  };
  const currentTab = tabAliasMap[tabParam] || 'recruiters';

  const [activeSection, setActiveSection] = useState(currentTab);

  useEffect(() => {
    if (tabParam && tabAliasMap[tabParam]) {
      setActiveSection(tabAliasMap[tabParam]);
    } else if (!tabParam) {
      setActiveSection('recruiters');
    }
  }, [tabParam]);

  const handleTabChange = (tabKey) => {
    setActiveSection(tabKey);
    if (tabKey === 'recruiters') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabKey });
    }
  };

  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, companyFilter, pageSize]);

  // Derive unique company names from existing recruiter and company data
  const availableCompanies = useMemo(() => {
    const set = new Set();
    recruiters?.forEach(r => {
      const c = r.company || r.companyName;
      if (c && typeof c === 'string' && c.trim()) {
        set.add(c.trim());
      }
    });
    companies?.forEach(c => {
      const name = typeof c === 'string' ? c : (c.name || c.companyName || c.company);
      if (name && typeof name === 'string' && name.trim()) {
        set.add(name.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [recruiters, companies]);

  // View modal
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Add Recruiter Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Talent Acquisition Manager',
    companyType: 'EXISTING', // 'EXISTING' | 'NEW'
    selectedCompany: '',
    newCompanyName: '',
    industry: 'Information Technology & Services',
    location: 'Vijayawada, NTR District',
  });

  const handleAddRecruiterSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      addToast('Please enter recruiter name and email address.', 'error');
      return;
    }

    const assignedCompany = addForm.companyType === 'EXISTING'
      ? (addForm.selectedCompany || availableCompanies[0] || 'NTR Partner Enterprise')
      : addForm.newCompanyName.trim();

    if (!assignedCompany) {
      addToast('Please specify a company for this recruiter.', 'error');
      return;
    }

    const newRecruiter = {
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim() || '+91 98480 12345',
      company: assignedCompany,
      designation: addForm.designation.trim() || 'Talent Acquisition Manager',
      industry: addForm.industry.trim() || 'Information Technology & Services',
      location: addForm.location.trim() || 'Vijayawada, NTR District',
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
      postedJobsCount: 0
    };

    try {
      setIsSubmitting(true);
      await addRecruiter(newRecruiter);
      addToast(`Recruiter "${newRecruiter.name}" (${assignedCompany}) successfully registered and verified!`, 'success');
      setAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        designation: 'Talent Acquisition Manager',
        companyType: 'EXISTING',
        selectedCompany: availableCompanies[0] || '',
        newCompanyName: '',
        industry: 'Information Technology & Services',
        location: 'Vijayawada, NTR District',
      });
    } catch (err) {
      addToast(err.message || 'Failed to register recruiter', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suspend Dialog
  const [suspendTarget, setSuspendTarget] = useState(null);

  const filterTabs = [
    { key: 'ALL', label: 'All Recruiters' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'SUSPENDED', label: 'Suspended' },
  ];

  const filtered = useMemo(() => {
    return (recruiters || []).filter((r) => {
      // 1. Company Filter
      if (companyFilter !== 'ALL') {
        const recruiterCompany = (r.company || r.companyName || '').trim().toLowerCase();
        if (recruiterCompany !== companyFilter.trim().toLowerCase()) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'VERIFIED' && r.verificationStatus !== 'VERIFIED') return false;
        if (statusFilter === 'PENDING' && r.verificationStatus !== 'PENDING') return false;
        if (statusFilter === 'SUSPENDED' && r.accountStatus !== 'SUSPENDED') return false;
      }

      // 3. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesEmail = r.email?.toLowerCase().includes(q);
        const matchesCompany = r.company?.toLowerCase().includes(q);
        const matchesDesignation = r.designation?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesDesignation) return false;
      }
      return true;
    });
  }, [recruiters, search, statusFilter, companyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRecruiters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleVerify = async (r) => {
    try {
      await verifyRecruiter(r.id);
      addToast(`${r.name} (${r.company}) has been marked as VERIFIED.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to verify recruiter', 'error');
    }
  };

  const handleActivate = async (r) => {
    try {
      await activateRecruiter(r.id);
      addToast(`${r.name} account is now ACTIVE.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to activate recruiter', 'error');
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await suspendRecruiter(suspendTarget.id);
      addToast(`Recruiter account for ${suspendTarget.name} has been SUSPENDED.`, 'error');
      setSuspendTarget(null);
    } catch (err) {
      addToast(err.message || 'Failed to suspend recruiter', 'error');
    }
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting recruiters list to Excel...', 'info');
    const headers = [
      'Recruiter Name',
      'Email',
      'Company',
      'Designation',
      'Industry',
      'Location',
      'Registration Date',
      'Verification Status',
      'Account Status'
    ];
    const rows = filtered.map(r => [
      r.name || 'N/A',
      r.email || 'N/A',
      r.company || 'N/A',
      r.designation || 'Talent Acquisition',
      r.industry || 'IT / Technology',
      r.location || 'India',
      r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Aug 2026',
      r.verificationStatus || 'PENDING',
      r.accountStatus || 'ACTIVE'
    ]);
    const fileSuffix = companyFilter !== 'ALL'
      ? `${companyFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${statusFilter.toLowerCase()}`
      : statusFilter.toLowerCase();
    exportToExcel({
      filename: getExportFilename('recruiters', fileSuffix, 'xlsx'),
      sheetName: 'Recruiters',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting recruiters list to PDF...', 'info');
    const headers = ['Recruiter', 'Email', 'Company', 'Designation', 'Location', 'Verification', 'Status'];
    const rows = filtered.map(r => [
      r.name || 'N/A',
      r.email || 'N/A',
      r.company || 'N/A',
      r.designation || 'Talent Acquisition',
      r.location || 'India',
      r.verificationStatus || 'PENDING',
      r.accountStatus || 'ACTIVE'
    ]);
    const tabObj = filterTabs.find(t => t.key === statusFilter);
    const statusLabel = tabObj ? tabObj.label : statusFilter;
    const companyLabel = companyFilter === 'ALL' ? 'All Companies' : companyFilter;

    const fileSuffix = companyFilter !== 'ALL'
      ? `${companyFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${statusFilter.toLowerCase()}`
      : statusFilter.toLowerCase();

    exportToPDF({
      filename: getExportFilename('recruiters', fileSuffix, 'pdf'),
      title: 'Platform Registered Recruiters Report',
      subtitle: `NTR Vikasa Admin Audit - Company: ${companyLabel} • Status: ${statusLabel}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Company Filter': companyLabel,
        'Status Filter': statusLabel,
        'Search Query': search || 'None',
        'Total Records': filtered.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const columns = [
    {
      key: 'name',
      label: 'Recruiter',
      sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #4338ca, #7c3aed)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 'var(--text-sm)'
          }}>
            {row.name?.[0] || 'R'}
          </div>
          <div>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block' }}>{row.name}</strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>{row.designation || 'Talent Acquisition'}</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (_, row) => (
        <div>
          <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{row.company}</strong>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>{row.industry || 'IT & Services'}</span>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>📍 {row.location || 'India'}</span>
        </div>
      )
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      sortable: true,
      render: (v) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          {v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Aug 2026'}
        </span>
      )
    },
    {
      key: 'verificationStatus',
      label: 'Verification Status',
      render: (v) => {
        const isVerified = v === 'VERIFIED';
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: isVerified ? '#ecfdf5' : '#fffbeb',
            color: isVerified ? '#047857' : '#b45309',
            border: isVerified ? '1px solid #a7f3d0' : '1px solid #fde68a',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {isVerified ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
            {v || 'PENDING'}
          </span>
        );
      }
    },
    {
      key: 'accountStatus',
      label: 'Account Status',
      render: (v) => {
        const isActive = v === 'ACTIVE';
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: isActive ? '#f0fdf4' : '#fef2f2',
            color: isActive ? '#15803d' : '#b91c1c',
            border: isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            {v || 'ACTIVE'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Eye size={13} />}
            onClick={() => {
              setSelectedRecruiter(row);
              setViewModalOpen(true);
            }}
          >
            View
          </Button>

          <Button
            size="xs"
            variant="outline"
            leftIcon={<Download size={12} />}
            onClick={() => {
              exportRecruiterDossierPDF(row);
              addToast(`Downloading recruiter dossier for ${row.name}...`, 'success');
            }}
            title="Download Recruiter Dossier (PDF)"
          >
            PDF
          </Button>

          {row.verificationStatus === 'PENDING' && (
            <Button
              size="xs"
              variant="primary"
              leftIcon={<CheckCircle2 size={12} />}
              onClick={() => handleVerify(row)}
            >
              Verify
            </Button>
          )}

          {row.accountStatus === 'ACTIVE' ? (
            <Button
              size="xs"
              variant="danger"
              onClick={() => setSuspendTarget(row)}
            >
              Suspend
            </Button>
          ) : (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => handleActivate(row)}
            >
              Activate
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="admin-recruiters-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* ── 0. Consolidated Navigation Tabs (Recruiters | Jobs | Internships) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        background: 'var(--color-surface)',
        padding: '6px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        width: 'fit-content',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => handleTabChange('recruiters')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSection === 'recruiters' ? 'var(--color-primary-600)' : 'transparent',
            color: activeSection === 'recruiters' ? '#fff' : 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSection === 'recruiters' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 150ms ease'
          }}
        >
          <UserCheck size={16} /> Recruiters
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('jobs')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSection === 'jobs' ? 'var(--color-primary-600)' : 'transparent',
            color: activeSection === 'jobs' ? '#fff' : 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSection === 'jobs' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 150ms ease'
          }}
        >
          <Briefcase size={16} /> Jobs
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('internships')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSection === 'internships' ? 'var(--color-primary-600)' : 'transparent',
            color: activeSection === 'internships' ? '#fff' : 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSection === 'internships' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 150ms ease'
          }}
        >
          <GraduationCap size={16} /> Internships
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeSection === 'jobs' ? (
        <AdminJobsPage />
      ) : activeSection === 'internships' ? (
        <AdminInternshipsPage />
      ) : (
        <>
          {/* Header Bar */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <Building2 size={20} style={{ color: 'var(--color-primary-600)' }} />
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Registered Recruiters Management</h1>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Audit employer profiles, verify organizational authorizations, and govern platform recruiters.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700
                }}>
                  {recruiters.filter(r => r.verificationStatus === 'VERIFIED').length} Verified Recruiters
                </span>

                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={() => {
                    setAddForm(prev => ({
                      ...prev,
                      selectedCompany: prev.selectedCompany || availableCompanies[0] || ''
                    }));
                    setAddModalOpen(true);
                  }}
                >
                  Add Recruiter
                </Button>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Row 1: Status Filters & Export */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    style={{
                      padding: '6px 14px',
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
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                disabled={filtered.length === 0}
              />
            </div>

            {/* Row 2: Company Filter Dropdown & Search Bar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
              {/* Company Filter */}
              <div style={{ position: 'relative', minWidth: 260, flex: '0 1 300px' }}>
                <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
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
                    background: companyFilter === 'ALL' ? 'var(--color-surface)' : 'var(--color-primary-50, #eff6ff)',
                    borderColor: companyFilter === 'ALL' ? 'var(--color-border)' : 'var(--color-primary-500)'
                  }}
                >
                  <option value="ALL">All Companies</option>
                  {availableCompanies.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search recruiter, company, email, designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                />
              </div>

              {/* Active Filter Clear */}
              {(companyFilter !== 'ALL' || statusFilter !== 'ALL' || search.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setCompanyFilter('ALL');
                    setStatusFilter('ALL');
                    setSearch('');
                  }}
                  style={{
                    height: 38,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 150ms ease'
                  }}
                  title="Reset all filters"
                >
                  <XCircle size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Users size={40} />}
                title="No Recruiters Found"
                description="No recruiter records match your current search and filter criteria."
              />
            ) : (
              <>
                <Table columns={columns} data={paginatedRecruiters} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={pageSize}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  itemName="recruiters"
                />
              </>
            )}
          </div>

          {/* ── 1. Recruiter Full Details Modal ── */}
          {viewModalOpen && selectedRecruiter && (() => {
            const matchedCompany = companies?.find(c => 
              (selectedRecruiter.company && c.name?.toLowerCase() === selectedRecruiter.company.toLowerCase()) ||
              (selectedRecruiter.companyId && c.id === selectedRecruiter.companyId)
            );

            const recruiterLocation = selectedRecruiter.location || matchedCompany?.location || 'India';
            const recruiterIndustry = selectedRecruiter.industry || matchedCompany?.industry || 'Information Technology & Services';

            const recruiterJobs = jobs?.filter(j => 
              (selectedRecruiter.company && j.company?.toLowerCase() === selectedRecruiter.company.toLowerCase()) || 
              (selectedRecruiter.name && j.recruiter?.toLowerCase() === selectedRecruiter.name.toLowerCase()) ||
              (selectedRecruiter.id && j.recruiterId === selectedRecruiter.id)
            ) || [];

            const recruiterInternships = internships?.filter(i => 
              (selectedRecruiter.company && i.company?.toLowerCase() === selectedRecruiter.company.toLowerCase()) || 
              (selectedRecruiter.name && i.recruiter?.toLowerCase() === selectedRecruiter.name.toLowerCase()) ||
              (selectedRecruiter.id && i.recruiterId === selectedRecruiter.id)
            ) || [];

            const recruiterApplications = applications?.filter(a => 
              (selectedRecruiter.company && a.company?.toLowerCase() === selectedRecruiter.company.toLowerCase()) || 
              (selectedRecruiter.name && a.recruiter?.toLowerCase() === selectedRecruiter.name.toLowerCase())
            ) || [];

            const recruiterMelas = jobMelas?.filter(m => 
              m.participatingCompanies?.some(c => (typeof c === 'string' ? c.toLowerCase() : c.name?.toLowerCase()) === selectedRecruiter.company?.toLowerCase()) ||
              m.companies?.some(c => (typeof c === 'string' ? c.toLowerCase() : c.name?.toLowerCase()) === selectedRecruiter.company?.toLowerCase())
            ) || [];

            const activeJobsCount = recruiterJobs.filter(j => j.status === 'ACTIVE' || j.status === 'APPROVED' || !j.status).length;
            const totalJobsCount = selectedRecruiter.postedJobsCount !== undefined ? selectedRecruiter.postedJobsCount : (recruiterJobs.length > 0 ? recruiterJobs.length : null);

            return (
              <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title={`Recruiter Dossier: ${selectedRecruiter.name}`}
                size="lg"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {/* 1. Recruiter Overview */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                    color: '#fff',
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-xl)'
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-xl)',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 800
                    }}>
                      {selectedRecruiter.name?.[0] || 'R'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>{selectedRecruiter.name}</h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: '#c7d2fe', margin: '2px 0 0 0' }}>
                        {selectedRecruiter.designation || 'Director of Talent Acquisition'} • {selectedRecruiter.company}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#e0e7ff', flexWrap: 'wrap' }}>
                        <span>📍 {recruiterLocation}</span>
                        <span>🏢 {recruiterIndustry}</span>
                        <span>📅 Joined: {selectedRecruiter.registrationDate ? new Date(selectedRecruiter.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact Information & 3. Employer Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    {/* Section 2: Contact Information */}
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        Contact Information
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Email:</strong> {selectedRecruiter.email || 'N/A'}</p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Phone:</strong> {selectedRecruiter.phone || '+91 98765 00112'}</p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Location:</strong> {recruiterLocation}</p>
                    </div>

                    {/* Section 3: Employer Details */}
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        Employer Details
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Company:</strong> {selectedRecruiter.company}</p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Industry:</strong> {recruiterIndustry}</p>
                      <div style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: matchedCompany?.cin || matchedCompany?.size ? 6 : 0 }}>
                        <strong>Verification:</strong>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: (matchedCompany?.verificationStatus === 'VERIFIED' || selectedRecruiter.verificationStatus === 'VERIFIED') ? '#ecfdf5' : '#fffbeb',
                          color: (matchedCompany?.verificationStatus === 'VERIFIED' || selectedRecruiter.verificationStatus === 'VERIFIED') ? '#047857' : '#b45309',
                          border: (matchedCompany?.verificationStatus === 'VERIFIED' || selectedRecruiter.verificationStatus === 'VERIFIED') ? '1px solid #a7f3d0' : '1px solid #fde68a'
                        }}>
                          {matchedCompany?.verificationStatus || (selectedRecruiter.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING')}
                        </span>
                      </div>
                      {matchedCompany?.cin && (
                        <p style={{ fontSize: 'var(--text-xs)', marginBottom: matchedCompany?.size ? 6 : 0 }}><strong>CIN:</strong> {matchedCompany.cin}</p>
                      )}
                      {matchedCompany?.size && (
                        <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Company Size:</strong> {matchedCompany.size}</p>
                      )}
                    </div>
                  </div>

                  {/* 4. Recruiter Account & Verification */}
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                      Recruiter Account & Verification
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                          VERIFICATION STATUS
                        </span>
                        <div style={{ marginTop: 3 }}>
                          <StatusBadge status={selectedRecruiter.verificationStatus || 'PENDING'} />
                        </div>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                          ACCOUNT STATUS
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: selectedRecruiter.accountStatus === 'ACTIVE' ? '#f0fdf4' : '#fef2f2',
                          color: selectedRecruiter.accountStatus === 'ACTIVE' ? '#15803d' : '#b91c1c',
                          border: selectedRecruiter.accountStatus === 'ACTIVE' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 3
                        }}>
                          {selectedRecruiter.accountStatus === 'ACTIVE' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          {selectedRecruiter.accountStatus || 'ACTIVE'}
                        </span>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                          ACTIVE JOBS
                        </span>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', display: 'block', marginTop: 3 }}>
                          {activeJobsCount || (selectedRecruiter.postedJobsCount !== undefined ? selectedRecruiter.postedJobsCount : 0)} Openings
                        </strong>
                      </div>

                      {totalJobsCount !== null && (
                        <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                            TOTAL JOBS POSTED
                          </span>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block', marginTop: 3 }}>
                            {totalJobsCount} Vacancies
                          </strong>
                        </div>
                      )}

                      {recruiterInternships.length > 0 && (
                        <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                            INTERNSHIPS POSTED
                          </span>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block', marginTop: 3 }}>
                            {recruiterInternships.length} Programs
                          </strong>
                        </div>
                      )}

                      {recruiterApplications.length > 0 && (
                        <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                            APPLICATIONS MANAGED
                          </span>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block', marginTop: 3 }}>
                            {recruiterApplications.length} Candidates
                          </strong>
                        </div>
                      )}

                      {recruiterMelas.length > 0 && (
                        <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                            JOB MELA PARTICIPATION
                          </span>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block', marginTop: 3 }}>
                            {recruiterMelas.length} Event(s)
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. Recruiter Activity / Postings */}
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                      Recruiter Activity & Vacancies
                    </h4>
                    {recruiterJobs.length > 0 || recruiterInternships.length > 0 || recruiterMelas.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {recruiterJobs.slice(0, 3).map((job) => (
                          <div key={job.id} style={{
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--space-2)'
                          }}>
                            <div>
                              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>{job.title}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                💼 {job.type || 'Full-time'} • 📍 {job.location || 'India'} • 👥 {job.applicationsCount !== undefined ? `${job.applicationsCount} applicants` : 'Active listing'}
                              </span>
                            </div>
                            <StatusBadge status={job.status || 'ACTIVE'} />
                          </div>
                        ))}

                        {recruiterInternships.slice(0, 2).map((intern) => (
                          <div key={intern.id} style={{
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--space-2)'
                          }}>
                            <div>
                              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>{intern.title}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                🎓 Internship • 📍 {intern.location || 'India'} • ⏱️ {intern.duration || '3 Months'}
                              </span>
                            </div>
                            <StatusBadge status={intern.status || 'ACTIVE'} />
                          </div>
                        ))}

                        {recruiterMelas.slice(0, 2).map((mela) => (
                          <div key={mela.id} style={{
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--space-2)'
                          }}>
                            <div>
                              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>{mela.title || mela.event}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                🎟️ Job Mela Participation • 📍 {mela.location || 'State Level'} • 📅 {mela.date || 'Aug 2026'}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0'
                            }}>
                              PARTICIPATING
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                        No active vacancies or Job Mela participations recorded for this recruiter yet.
                      </p>
                    )}
                  </div>

                  {/* 6. Admin Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <Button
                      variant="primary"
                      leftIcon={<Download size={14} />}
                      onClick={() => {
                        exportRecruiterDossierPDF(selectedRecruiter);
                        addToast(`Downloading verified recruiter dossier for ${selectedRecruiter.name}...`, 'success');
                      }}
                    >
                      Download Dossier (PDF)
                    </Button>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                        Close
                      </Button>
                      {selectedRecruiter.accountStatus === 'ACTIVE' ? (
                        <Button
                          variant="danger"
                          onClick={() => {
                            setViewModalOpen(false);
                            setSuspendTarget(selectedRecruiter);
                          }}
                        >
                          Suspend Account
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => {
                            handleActivate(selectedRecruiter);
                            setSelectedRecruiter({ ...selectedRecruiter, accountStatus: 'ACTIVE' });
                          }}
                        >
                          Activate Account
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Modal>
            );
          })()}

          {/* ── 2. Confirm Suspend Dialog ── */}
          {suspendTarget && (
            <ConfirmDialog
              isOpen={Boolean(suspendTarget)}
              title="Suspend Recruiter Account?"
              message={`Are you sure you want to suspend recruiter ${suspendTarget.name} (${suspendTarget.company})? Their posted vacancies will be paused from public candidate searches.`}
              confirmLabel="Confirm Suspension"
              confirmVariant="danger"
              onConfirm={handleConfirmSuspend}
              onCancel={() => setSuspendTarget(null)}
            />
          )}

          {/* ── 3. Add Recruiter Modal ── */}
          {addModalOpen && (
            <Modal
              isOpen={addModalOpen}
              onClose={() => setAddModalOpen(false)}
              title="Direct Register Recruiter / Employer"
              size="md"
            >
              <form onSubmit={handleAddRecruiterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Notice Banner */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)'
                }}>
                  <Sparkles size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 'var(--text-xs)', color: '#1e40af', display: 'block' }}>
                      Admin Direct Onboarding & Auto-Verification
                    </strong>
                    <span style={{ fontSize: '11px', color: '#3b82f6', lineHeight: 1.4 }}>
                      Recruiters onboarded directly by Administrator are verified and granted authorized access to manage job postings and candidate pipelines.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Recruiter Full Name" required>
                    <Input
                      placeholder="e.g. Anand Mahindra"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Official Work Email" required>
                    <Input
                      type="email"
                      placeholder="e.g. anand@company.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Mobile Phone Number">
                    <Input
                      type="tel"
                      placeholder="e.g. +91 98480 12345"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Designation / Role">
                    <Input
                      placeholder="e.g. Talent Acquisition Lead"
                      value={addForm.designation}
                      onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    />
                  </FormField>
                </div>

                {/* Company Assignment */}
                <div style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                    Company Assignment *
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="recruiterCompanyType"
                        checked={addForm.companyType === 'EXISTING'}
                        onChange={() => setAddForm({ ...addForm, companyType: 'EXISTING' })}
                      />
                      <span>Select Existing Company</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="recruiterCompanyType"
                        checked={addForm.companyType === 'NEW'}
                        onChange={() => setAddForm({ ...addForm, companyType: 'NEW' })}
                      />
                      <span>Register New Company</span>
                    </label>
                  </div>

                  {addForm.companyType === 'EXISTING' ? (
                    <FormField label="Select Registered Organization">
                      <select
                        className="form-control"
                        value={addForm.selectedCompany || (availableCompanies.length > 0 ? availableCompanies[0] : '')}
                        onChange={(e) => setAddForm({ ...addForm, selectedCompany: e.target.value })}
                        style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                      >
                        {availableCompanies.map((cName) => (
                          <option key={cName} value={cName}>
                            {cName}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  ) : (
                    <FormField label="New Company / Organization Name" required>
                      <Input
                        placeholder="e.g. Amaravati Tech Systems Pvt Ltd"
                        value={addForm.newCompanyName}
                        onChange={(e) => setAddForm({ ...addForm, newCompanyName: e.target.value })}
                        required
                      />
                    </FormField>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Industry Domain">
                    <select
                      className="form-control"
                      value={addForm.industry}
                      onChange={(e) => setAddForm({ ...addForm, industry: e.target.value })}
                      style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                    >
                      <option value="Information Technology & Services">Information Technology & Services</option>
                      <option value="Manufacturing & Automobile">Manufacturing & Automobile</option>
                      <option value="Banking & Financial Services">Banking & Financial Services</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                      <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                      <option value="Education & Training">Education & Training</option>
                      <option value="Construction & Infrastructure">Construction & Infrastructure</option>
                    </select>
                  </FormField>

                  <FormField label="Location / District">
                    <Input
                      placeholder="e.g. Vijayawada, NTR District"
                      value={addForm.location}
                      onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    />
                  </FormField>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" leftIcon={<UserPlus size={16} />} disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register & Verify Recruiter'}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
