import { useState, useMemo, useEffect } from 'react';
import {
  Briefcase, Search, Filter, Eye, CheckCircle2, XCircle,
  Building2, MapPin, DollarSign, Clock, ShieldAlert, AlertTriangle,
  FileEdit, HelpCircle, Check, X, ShieldCheck, GraduationCap, Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import { formatJobId } from '../../utils/applicationUtils';

export default function AdminJobsPage() {
  const { addToast } = useToast();
  const {
    jobs = [],
    companies = [],
    recruiters = [],
    approveJob,
    rejectJob,
    requestJobChanges
  } = useAdmin();

  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [mandalFilter, setMandalFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to match job to company details (address, mandal, village, eligibility)
  const getCompanyDetails = (job) => {
    if (!job) return null;
    const target = job.companyId
      ? companies.find(c => c.id === job.companyId)
      : companies.find(c => (c.name || '').toLowerCase() === (job.company || job.companyName || '').toLowerCase());
    return target || null;
  };

  const pendingJobsCount = useMemo(() => {
    return (jobs || []).filter(j => j.status === 'PENDING').length;
  }, [jobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, companyFilter, mandalFilter]);

  // Derive unique company names from existing job, company, and recruiter data
  const availableCompanies = useMemo(() => {
    const set = new Set();
    jobs?.forEach(j => {
      const c = j.company || j.companyName;
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
  }, [jobs, companies]);

  // View modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Request Changes modal
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesTarget, setChangesTarget] = useState(null);
  const [changeNotes, setChangeNotes] = useState('');

  const filterTabs = [
    { key: 'ALL', label: 'All Job Posts' },
    { key: 'PENDING', label: `Pending Verification (${pendingJobsCount})`, highlight: pendingJobsCount > 0 },
    { key: 'ACTIVE', label: 'Verified & Active' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const filtered = useMemo(() => {
    return (jobs || []).filter((j) => {
      const comp = getCompanyDetails(j);

      // 1. Company Filter
      if (companyFilter !== 'ALL') {
        const jobCompany = (j.company || j.companyName || '').trim().toLowerCase();
        if (jobCompany !== companyFilter.trim().toLowerCase()) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'APPROVED' && (j.status !== 'APPROVED' && j.status !== 'PUBLISHED')) return false;
        if (statusFilter === 'ACTIVE' && (j.status !== 'ACTIVE' && j.status !== 'PUBLISHED' && j.status !== 'APPROVED')) return false;
        if (statusFilter === 'PENDING' && j.status !== 'PENDING') return false;
        if (statusFilter === 'REJECTED' && j.status !== 'REJECTED') return false;
        if (statusFilter === 'CLOSED' && j.status !== 'CLOSED') return false;
      }

      // 3. Mandal Filter
      if (mandalFilter !== 'ALL') {
        const targetMandal = mandalFilter.toLowerCase();
        const jobMandal = (j.mandal || comp?.mandal || '').toLowerCase();
        const eligibleMandals = comp?.eligibleMandals?.map(m => m.toLowerCase()) || [];
        if (jobMandal !== targetMandal && !eligibleMandals.includes(targetMandal)) {
          return false;
        }
      }

      // 4. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = j.title?.toLowerCase().includes(q);
        const matchesJobId = (formatJobId(j.id) || '').toLowerCase().includes(q) || String(j.id || '').toLowerCase().includes(q);
        const matchesCompany = j.company?.toLowerCase().includes(q);
        const matchesRecruiter = j.recruiter?.toLowerCase().includes(q);
        const matchesLocation = j.location?.toLowerCase().includes(q);
        const matchesMandal = (j.mandal || comp?.mandal || '').toLowerCase().includes(q);
        const matchesVillage = (j.village || comp?.village || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesJobId && !matchesCompany && !matchesRecruiter && !matchesLocation && !matchesMandal && !matchesVillage) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, search, statusFilter, companyFilter, mandalFilter, companies]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting jobs list to Excel...', 'info');
    const headers = [
      'Job ID',
      'Job Title',
      'Company Name',
      'Company Mandal',
      'Company Village',
      'Eligible Mandals',
      'Eligible Villages',
      'Job Type',
      'Salary',
      'Verification Status'
    ];
    const rows = filtered.map(j => {
      const comp = getCompanyDetails(j);
      return [
        formatJobId(j.id),
        j.title || 'N/A',
        j.company || 'N/A',
        j.mandal || comp?.mandal || 'Vijayawada Rural',
        j.village || comp?.village || 'Gollapudi',
        comp?.eligibleMandals ? comp.eligibleMandals.join(', ') : 'All NTR Mandals',
        comp?.eligibleVillages || 'All villages',
        j.type || 'Full-time',
        j.salary || 'Competitive',
        j.status || 'ACTIVE'
      ];
    });
    const fileSuffix = companyFilter !== 'ALL'
      ? `${companyFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${statusFilter.toLowerCase()}`
      : statusFilter.toLowerCase();
    exportToExcel({
      filename: getExportFilename('admin_jobs', fileSuffix, 'xlsx'),
      sheetName: 'Jobs',
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
    addToast('Exporting jobs list to PDF...', 'info');
    const headers = ['Job ID', 'Job Title', 'Company', 'Mandal & Village', 'Salary', 'Status'];
    const rows = filtered.map(j => {
      const comp = getCompanyDetails(j);
      return [
        formatJobId(j.id),
        j.title || 'N/A',
        j.company || 'N/A',
        `${comp?.mandal || 'Vijayawada'} (${comp?.village || 'Central'})`,
        j.salary || 'Competitive',
        j.status || 'ACTIVE'
      ];
    });

    exportToPDF({
      filename: getExportFilename('admin_jobs', statusFilter.toLowerCase(), 'pdf'),
      title: 'Platform Job Postings Governance & Verification Report',
      subtitle: `NTR Vikasa Admin Audit - Filter: ${statusFilter}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusFilter,
        'Search Query': search || 'None',
        'Total Records': filtered.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const handleApprove = async (j) => {
    try {
      await approveJob(j.id);
      addToast(`"${j.title}" by ${j.company} is now VERIFIED & APPROVED.`, 'success');
      if (selectedJob?.id === j.id) {
        setSelectedJob({ ...selectedJob, status: 'APPROVED' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to approve job', 'error');
    }
  };

  const handleOpenReject = (j) => {
    setRejectTarget(j);
    setRejectionReason('Job details do not comply with wage transparency or employment authenticity guidelines.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    try {
      await rejectJob(rejectTarget.id, rejectionReason || 'Rejected by administrator.');
      addToast(`"${rejectTarget.title}" has been REJECTED.`, 'info');
      setRejectModalOpen(false);
      if (selectedJob?.id === rejectTarget.id) {
        setSelectedJob({ ...selectedJob, status: 'REJECTED' });
      }
      setRejectTarget(null);
    } catch (err) {
      addToast(err.message || 'Failed to reject job', 'error');
    }
  };

  const handleOpenRequestChanges = (j) => {
    setChangesTarget(j);
    setChangeNotes('Please clarify salary compensation range, educational criteria, and job responsibilities.');
    setChangesModalOpen(true);
  };

  const handleConfirmRequestChanges = (e) => {
    e.preventDefault();
    if (!changesTarget) return;
    requestJobChanges(changesTarget.id, changeNotes || 'Changes requested by administrator.');
    addToast(`Changes requested for "${changesTarget.title}". Recruiter notified.`, 'warning');
    setChangesModalOpen(false);
    if (selectedJob?.id === changesTarget.id) {
      setSelectedJob({ ...selectedJob, status: 'CHANGES_REQUESTED' });
    }
    setChangesTarget(null);
  };

  const columns = [
    {
      key: 'title',
      label: 'Job Title & Post ID',
      sortable: true,
      render: (_, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{row.title}</strong>
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
              {formatJobId(row.id)}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>{row.type || 'Full-time'}</span>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Employer Details',
      sortable: true,
      render: (_, row) => {
        const comp = getCompanyDetails(row);
        return (
          <div>
            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>{row.company}</strong>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              {comp?.industry || 'Enterprise'}
            </span>
            <div style={{ marginTop: 2 }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: '1px 5px',
                borderRadius: '3px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2
              }}>
                <ShieldCheck size={10} /> Verified Employer
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'companyLocation',
      label: 'Company Address & Mandal',
      render: (_, row) => {
        const comp = getCompanyDetails(row);
        const mandal = row.mandal || comp?.mandal || 'Vijayawada Rural';
        const village = row.village || comp?.village || 'Gollapudi';
        return (
          <div style={{ fontSize: 'var(--text-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <MapPin size={12} style={{ color: 'var(--color-primary-600)' }} />
              <span>{mandal} Mandal</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
              Village / Locality: <strong>{village}</strong>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              {comp?.address || row.location || 'NTR District, AP'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'eligibility',
      label: 'Student Eligibility (Mandal & Village)',
      render: (_, row) => {
        const comp = getCompanyDetails(row);
        const eligibleMandals = comp?.eligibleMandals || ['Vijayawada Urban', 'Vijayawada Rural', 'Ibrahimpatnam'];
        const eligibleVillages = comp?.eligibleVillages || 'All villages in selected mandals';
        return (
          <div style={{ fontSize: 'var(--text-xs)', maxWidth: 210 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary-700)', display: 'block' }}>
              Eligible Mandals:
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text)', display: 'block' }}>
              {eligibleMandals.slice(0, 2).join(', ')}{eligibleMandals.length > 2 ? ` +${eligibleMandals.length - 2} more` : ''}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginTop: 1 }}>
              Villages: <em>{eligibleVillages}</em>
            </span>
          </div>
        );
      }
    },
    {
      key: 'salary',
      label: 'Salary & Experience',
      render: (_, row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <strong style={{ color: '#047857', display: 'block' }}>{row.salary}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{row.experience || '2-5 Years'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Verification Status',
      render: (v) => {
        const isApproved = v === 'APPROVED' || v === 'ACTIVE' || v === 'PUBLISHED';
        const isPending = v === 'PENDING';
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
            color: isApproved ? '#047857' : isPending ? '#b45309' : '#b91c1c',
            border: isApproved ? '1px solid #a7f3d0' : isPending ? '1px solid #fde68a' : '1px solid #fecaca',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {isApproved ? <CheckCircle2 size={12} /> : isPending ? <Clock size={12} /> : <XCircle size={12} />}
            {isPending ? 'Pending Verification' : isApproved ? 'Verified & Active' : v}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Admin Verification Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Eye size={12} />}
            onClick={() => {
              setSelectedJob(row);
              setViewModalOpen(true);
            }}
          >
            Details
          </Button>

          {row.status === 'PENDING' && (
            <Button
              size="xs"
              variant="primary"
              leftIcon={<Check size={12} />}
              onClick={() => handleApprove(row)}
            >
              Verify & Approve
            </Button>
          )}

          {row.status !== 'APPROVED' && row.status !== 'ACTIVE' && row.status !== 'PENDING' && (
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
              leftIcon={<X size={12} />}
              onClick={() => handleOpenReject(row)}
            >
              Reject
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="admin-jobs-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <Briefcase size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Employer Job Posting & Verification Center</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Verify jobs posted by employers, inspect company addresses (mandal/village), and ensure student eligibility criteria before publishing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            {pendingJobsCount > 0 && (
              <span style={{
                background: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <AlertTriangle size={14} /> {pendingJobsCount} Employer Postings Awaiting Verification
              </span>
            )}

            <span style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '6px 12px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700
            }}>
              {jobs.filter(j => j.status === 'ACTIVE' || j.status === 'APPROVED').length} Verified Active Jobs
            </span>
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
                  border: statusFilter === tab.key
                    ? '1px solid var(--color-primary-600)'
                    : tab.highlight
                      ? '1px solid #fde68a'
                      : '1px solid var(--color-border)',
                  background: statusFilter === tab.key
                    ? 'var(--color-primary-600)'
                    : tab.highlight
                      ? '#fffbeb'
                      : 'var(--color-surface)',
                  color: statusFilter === tab.key
                    ? '#fff'
                    : tab.highlight
                      ? '#b45309'
                      : 'var(--color-text-muted)',
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
              placeholder="Search jobs, company, village, mandal, recruiter..."
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
            icon={<Briefcase size={40} />}
            title="No Jobs Found"
            description="No job postings match your current search and filter criteria."
          />
        ) : (
          <>
            <Table columns={columns} data={paginatedJobs} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* ── 1. Job View Details Modal ── */}
      {viewModalOpen && selectedJob && (() => {
        const comp = getCompanyDetails(selectedJob);
        const isPending = selectedJob.status === 'PENDING';

        return (
          <Modal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            title={`Job Post Verification: ${selectedJob.title}`}
            size="lg"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Header Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                background: isPending
                  ? 'linear-gradient(135deg, #78350f 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
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
                  <Briefcase size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>
                      {selectedJob.title}
                    </h3>
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
                      {formatJobId(selectedJob.id)}
                    </span>
                    {isPending && (
                      <span style={{ fontSize: '10px', background: '#fbbf24', color: '#78350f', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                        ⚠️ Awaiting Admin Verification
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: '#93c5fd', margin: '2px 0 0 0' }}>
                    🏢 {selectedJob.company} • 📍 {comp?.mandal || 'Vijayawada Rural'} Mandal (Village: {comp?.village || 'Gollapudi'})
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#cbd5e1' }}>
                    <span>💰 {selectedJob.salary}</span>
                    <span>💼 {selectedJob.experience || '2-5 Years'}</span>
                    <span>🛡️ Status: {selectedJob.status}</span>
                  </div>
                </div>
              </div>

              {/* Company Details & Address Fetching */}
              <div style={{ background: '#f8fafc', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={15} /> Company Address & Eligibility Scope
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Company Name:</strong> {selectedJob.company}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Headquarters / Address:</strong> {comp?.address || selectedJob.location}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Company Mandal:</strong> {comp?.mandal || 'Vijayawada Rural'}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Company Village / Locality:</strong> {comp?.village || 'Gollapudi'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4, color: 'var(--color-primary-700)' }}>
                      <strong>Eligible Student Mandals:</strong> {comp?.eligibleMandals ? comp.eligibleMandals.join(', ') : 'All NTR District Mandals'}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                      <strong>Eligible Villages:</strong> {comp?.eligibleVillages || 'All villages in selected mandals'}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}>
                      <strong>Eligible Qualifications:</strong> {comp?.eligibleQualifications ? comp.eligibleQualifications.join(', ') : '10th, Intermediate, UG & PG Graduates'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                    Posting Parameters
                  </h4>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                    <strong>Job ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-600)' }}>{formatJobId(selectedJob.id)}</span>
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Authorized Recruiter:</strong> {selectedJob.recruiter || 'Enterprise Talent'}</p>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Job Type:</strong> {selectedJob.type || 'Full-time'}</p>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Posted Date:</strong> {selectedJob.postedDate || 'Aug 2026'}</p>
                </div>

                <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                    Compensation & Experience
                  </h4>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Salary Range:</strong> {selectedJob.salary}</p>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Required Experience:</strong> {selectedJob.experience || '2-5 Years'}</p>
                  <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Applicant Pool:</strong> {selectedJob.applicantsCount || 0} candidates</p>
                </div>
              </div>

              {/* Description / Requirements */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  Role Description & Candidate Eligibility
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.6, background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', margin: 0 }}>
                  {selectedJob.description || 'Enterprise role responsibilities including hands-on project delivery, cross-functional collaboration, and quality execution.'}
                </p>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {selectedJob.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      leftIcon={<Check size={14} />}
                      onClick={() => handleApprove(selectedJob)}
                    >
                      Verify & Approve Job Post
                    </Button>
                  )}
                  {selectedJob.status !== 'REJECTED' && (
                    <Button
                      variant="danger"
                      leftIcon={<X size={14} />}
                      onClick={() => {
                        setViewModalOpen(false);
                        handleOpenReject(selectedJob);
                      }}
                    >
                      Reject Posting
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    leftIcon={<FileEdit size={14} />}
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpenRequestChanges(selectedJob);
                    }}
                  >
                    Request Changes
                  </Button>
                </div>

                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* ── 2. Reject Dialog ── */}
      {rejectModalOpen && rejectTarget && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Job: ${rejectTarget.title}`}
          size="sm"
        >
          <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Specify the rationale for rejecting this employer job post. The recruiter will be notified.
            </p>
            <FormField label="Rejection Reason" required>
              <Textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this listing is being rejected..."
                required
              />
            </FormField>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <Button variant="outline" type="button" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 3. Request Changes Dialog ── */}
      {changesModalOpen && changesTarget && (
        <Modal
          isOpen={changesModalOpen}
          onClose={() => setChangesModalOpen(false)}
          title={`Request Modifications: ${changesTarget.title}`}
          size="sm"
        >
          <form onSubmit={handleConfirmRequestChanges} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Provide clear feedback to the employer regarding updates required prior to approval.
            </p>
            <FormField label="Modification Notes" required>
              <Textarea
                rows={3}
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="List required revisions (compensation, job scope, etc.)..."
                required
              />
            </FormField>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <Button variant="outline" type="button" onClick={() => setChangesModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send Change Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
