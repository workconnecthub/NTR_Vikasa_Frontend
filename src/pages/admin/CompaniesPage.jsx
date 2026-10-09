import { useState, useMemo, useEffect } from 'react';
import {
  Building2, Search, Filter, Eye, ShieldCheck, ShieldAlert,
  Users, Briefcase, Globe, Mail, Phone, MapPin, CheckCircle2,
  XCircle, AlertTriangle, FileText, Plus, Sparkles, Download
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename, exportCompanyDossierPDF } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';
import { useAdmin, NTR_MANDALS } from '../../context/AdminContext';

export default function AdminCompaniesPage() {
  const { addToast } = useToast();
  const {
    companies,
    recruiters = [],
    jobs = [],
    internships = [],
    applications = [],
    jobMelas = [],
    approveCompany,
    rejectCompany,
    suspendCompany,
    addCompany
  } = useAdmin();

  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Live Backend State
  const [serverCompanies, setServerCompanies] = useState(null);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverVerifiedCount, setServerVerifiedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyDocs, setCompanyDocs] = useState([]);

  const fetchLiveCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getCompanies({
        page: currentPage,
        page_size: pageSize,
        search,
        status: statusFilter,
        industry: industryFilter,
      });

      if (res && typeof res === 'object' && Array.isArray(res.items)) {
        setServerCompanies(res.items);
        setServerTotal(res.total);
        setServerVerifiedCount(res.verified_count || 0);
      } else if (Array.isArray(res)) {
        setServerCompanies(res);
        setServerTotal(res.length);
        setServerVerifiedCount(res.filter(c => c.verificationStatus === 'VERIFIED' || c.status === 'APPROVED').length);
      }
    } catch (err) {
      console.warn('Failed to load companies from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLiveCompanies();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, industryFilter, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, industryFilter, statusFilter, pageSize]);

  // Add Company Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    industry: 'Information Technology & Services',
    recruiter: '',
    email: '',
    phone: '',
    district: 'NTR District',
    mandal: 'Vijayawada Urban',
    village: 'Benz Circle',
    size: '100-500 employees',
    type: 'Private Limited (Pvt Ltd)',
    cin: '',
    gstin: '',
    website: '',
    about: '',
  });

  const handleAddCompanySubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      addToast('Please enter the organization name.', 'error');
      return;
    }

    if (addForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      addToast('Please enter a valid corporate email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const companyLocation = `${addForm.village ? addForm.village + ', ' : ''}${addForm.mandal}, ${addForm.district}`;

      const newCompany = {
        name: addForm.name.trim(),
        industry: addForm.industry.trim() || 'Information Technology & Services',
        recruiter: addForm.recruiter.trim() || 'Corporate HR Lead',
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        location: companyLocation,
        mandal: addForm.mandal,
        village: addForm.village,
        district: addForm.district,
        size: addForm.size || '100-500 employees',
        type: addForm.type || 'Private Limited (Pvt Ltd)',
        cin: addForm.cin.trim(),
        gstin: addForm.gstin.trim(),
        website: addForm.website.trim(),
        description: addForm.about.trim(),
        about: addForm.about.trim(),
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
        activeJobsCount: 0
      };

      await addCompany(newCompany);
      addToast(`Company "${newCompany.name}" successfully registered and verified in NTR Vikasa!`, 'success');
      setAddModalOpen(false);
      setAddForm({
        name: '',
        industry: 'Information Technology & Services',
        recruiter: '',
        email: '',
        phone: '',
        district: 'NTR District',
        mandal: 'Vijayawada Urban',
        village: 'Benz Circle',
        size: '100-500 employees',
        type: 'Private Limited (Pvt Ltd)',
        cin: '',
        gstin: '',
        website: '',
        about: '',
      });
      await fetchLiveCompanies();
    } catch (err) {
      addToast(err.message || 'Failed to register company. Please verify corporate credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View modal
  const [selectedComp, setSelectedComp] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleOpenView = async (comp) => {
    setSelectedComp(comp);
    setViewModalOpen(true);
    try {
      const [full, docs] = await Promise.all([
        adminService.getCompanyById(comp.id).catch(() => null),
        adminService.getCompanyDocuments(comp.id).catch(() => []),
      ]);
      if (full) {
        setSelectedComp(prev => ({ ...prev, ...full }));
      }
      if (docs) {
        setCompanyDocs(docs);
      }
    } catch (err) {
      console.warn('Error fetching company details:', err);
    }
  };

  // Recruiter Dossier Modal state (when clicking a related recruiter)
  const [selectedRecruiterForDossier, setSelectedRecruiterForDossier] = useState(null);
  const [recruiterDossierOpen, setRecruiterDossierOpen] = useState(false);

  const handleOpenRecruiterDossier = (rec) => {
    setSelectedRecruiterForDossier(rec);
    setRecruiterDossierOpen(true);
  };

  // Suspend Dialog
  const [suspendTarget, setSuspendTarget] = useState(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    try {
      if (suspendCompany) {
        await suspendCompany(suspendTarget.id);
      }
      addToast(`Company record for ${suspendTarget.name} has been SUSPENDED.`, 'error');
      if (selectedComp?.id === suspendTarget.id) {
        setSelectedComp({ ...selectedComp, verificationStatus: 'SUSPENDED', accountStatus: 'SUSPENDED', status: 'SUSPENDED' });
      }
      setSuspendTarget(null);
      await fetchLiveCompanies();
    } catch (err) {
      addToast(err.message || 'Failed to suspend company.', 'error');
    }
  };

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesIndustry = c.industry?.toLowerCase().includes(q);
        const matchesRecruiter = c.recruiter?.toLowerCase().includes(q);
        const matchesLocation = c.location?.toLowerCase().includes(q);
        if (!matchesName && !matchesIndustry && !matchesRecruiter && !matchesLocation) return false;
      }
      if (industryFilter !== 'ALL' && c.industry !== industryFilter) return false;
      if (statusFilter !== 'ALL' && c.verificationStatus !== statusFilter) return false;
      return true;
    });
  }, [companies, search, industryFilter, statusFilter]);

  const totalPagesFallback = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Unified Directory Presentation Data (Priority: Live Backend MySQL)
  const displayCompanies = serverCompanies !== null ? serverCompanies : paginatedCompanies;
  const totalRecords = serverCompanies !== null ? serverTotal : filtered.length;
  const totalPages = serverCompanies !== null ? Math.max(1, Math.ceil(serverTotal / pageSize)) : totalPagesFallback;
  const verifiedCount = serverCompanies !== null
    ? serverVerifiedCount
    : companies.filter(c => c.verificationStatus === 'VERIFIED' || c.status === 'APPROVED').length;

  const handleExportExcel = () => {
    const exportData = serverCompanies !== null && serverCompanies.length > 0 ? serverCompanies : filtered;
    if (exportData.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting companies directory to Excel...', 'info');
    const headers = [
      'Company Name',
      'Recruiter Lead',
      'Email',
      'Industry',
      'Employee Count',
      'Location',
      'Registration Date',
      'Verification Status'
    ];
    const rows = exportData.map(c => [
      c.name || 'N/A',
      c.recruiter || 'N/A',
      c.email || 'N/A',
      c.industry || 'IT / Software',
      c.size || '100-500 emp',
      c.location || 'India',
      c.registrationDate || c.foundedYear ? (c.registrationDate ? new Date(c.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : `Est. ${c.foundedYear}`) : 'Aug 2026',
      c.verificationStatus || 'PENDING'
    ]);
    exportToExcel({
      filename: getExportFilename('companies', statusFilter.toLowerCase(), 'xlsx'),
      sheetName: 'Companies',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    const exportData = serverCompanies !== null && serverCompanies.length > 0 ? serverCompanies : filtered;
    if (exportData.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting companies directory to PDF...', 'info');
    const headers = ['Company Name', 'Recruiter Lead', 'Industry', 'Employees', 'Location', 'Status'];
    const rows = exportData.map(c => [
      c.name || 'N/A',
      c.recruiter || 'N/A',
      c.industry || 'IT / Software',
      c.size || '100-500',
      c.location || 'India',
      c.verificationStatus || 'PENDING'
    ]);

    exportToPDF({
      filename: getExportFilename('companies', statusFilter.toLowerCase(), 'pdf'),
      title: 'Platform Corporate Employers Directory Report',
      subtitle: `NTR Vikasa Admin Audit - Filter: ${statusFilter === 'ALL' ? 'All Status' : statusFilter}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusFilter === 'ALL' ? 'All Status' : statusFilter,
        'Industry Filter': industryFilter === 'ALL' ? 'All Industries' : industryFilter,
        'Search Query': search || 'None',
        'Total Records': exportData.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const handleApprove = async (c) => {
    try {
      await approveCompany(c.id);
      addToast(`${c.name} has been marked as VERIFIED & APPROVED.`, 'success');
      if (selectedComp?.id === c.id) {
        setSelectedComp({ ...selectedComp, verificationStatus: 'VERIFIED', status: 'APPROVED' });
      }
      await fetchLiveCompanies();
    } catch (err) {
      addToast(err.message || 'Failed to approve company.', 'error');
    }
  };

  const handleOpenReject = (c) => {
    setRejectTarget(c);
    setRejectionReason('Company business incorporation and GST credentials could not be verified.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      addToast('Please specify a rejection reason.', 'error');
      return;
    }
    try {
      await rejectCompany(rejectTarget.id, rejectionReason.trim());
      addToast(`${rejectTarget.name} verification has been REJECTED.`, 'info');
      setRejectModalOpen(false);
      if (selectedComp?.id === rejectTarget.id) {
        setSelectedComp({ ...selectedComp, verificationStatus: 'REJECTED', status: 'REJECTED', rejectionReason: rejectionReason.trim() });
      }
      setRejectTarget(null);
      await fetchLiveCompanies();
    } catch (err) {
      addToast(err.message || 'Failed to reject company.', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Company',
      sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #1e1b4b, #3b82f6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 'var(--text-sm)',
            overflow: 'hidden'
          }}>
            {row.logo || row.logo_url || row.company_logo_path ? (
              <img
                src={row.logo || row.logo_url || row.company_logo_path}
                alt={row.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : null}
            {(!row.logo && !row.logo_url && !row.company_logo_path) && (row.name?.[0] || 'C')}
          </div>
          <div>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block' }}>{row.name}</strong>
            <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>{row.website || 'Official Employer'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'recruiter',
      label: 'Recruiter Lead',
      render: (_, row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <strong>{row.recruiter}</strong>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>{row.email || 'hr@company.com'}</span>
        </div>
      )
    },
    {
      key: 'industry',
      label: 'Industry',
      render: (_, row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <strong>{row.industry}</strong>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>{row.size || '100-500 emp'}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>📍 {v}</span>
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
        const isPending = v === 'PENDING';
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: isVerified ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
            color: isVerified ? '#047857' : isPending ? '#b45309' : '#b91c1c',
            border: isVerified ? '1px solid #a7f3d0' : isPending ? '1px solid #fde68a' : '1px solid #fecaca',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {isVerified ? <CheckCircle2 size={12} /> : isPending ? <AlertTriangle size={12} /> : <XCircle size={12} />}
            {v || 'PENDING'}
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
            leftIcon={<Eye size={12} />}
            onClick={() => handleOpenView(row)}
          >
            View
          </Button>

          <Button
            size="xs"
            variant="outline"
            leftIcon={<Download size={12} />}
            onClick={() => {
              exportCompanyDossierPDF(row);
              addToast(`Downloading company dossier for ${row.name}...`, 'success');
            }}
            title="Download Company Dossier (PDF)"
          >
            PDF
          </Button>

          {row.verificationStatus !== 'VERIFIED' && (
            <Button
              size="xs"
              variant="primary"
              onClick={() => handleApprove(row)}
            >
              Approve
            </Button>
          )}

          {row.verificationStatus !== 'REJECTED' && (
            <Button
              size="xs"
              variant="danger"
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
    <div className="admin-companies-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <Building2 size={20} style={{ color: 'var(--color-primary-600)' }} />
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Registered Companies Directory</h1>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Audit enterprise credentials, industry classifications, and manage verified employer records.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700
                }}>
                  {verifiedCount} Verified Organizations
                </span>

                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setAddModalOpen(true)}
                >
                  Add Company
                </Button>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 440 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search company name, industry, recruiter lead, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius-lg)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
                  {['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setStatusFilter(filterKey)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: statusFilter === filterKey ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        background: statusFilter === filterKey ? 'var(--color-primary-600)' : 'var(--color-surface)',
                        color: statusFilter === filterKey ? '#fff' : 'var(--color-text-muted)',
                        transition: 'all 150ms ease'
                      }}
                    >
                      {filterKey === 'ALL' ? 'All Status' : filterKey}
                    </button>
                  ))}
                </div>

                <ExportDropdown
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                  disabled={displayCompanies.length === 0}
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {displayCompanies.length === 0 ? (
              <EmptyState
                icon={<Building2 size={40} />}
                title="No Companies Found"
                description="No company records match your current search and filter criteria."
              />
            ) : (
              <>
                <Table columns={columns} data={displayCompanies} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalRecords}
                  pageSize={pageSize}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  itemName="companies"
                />
              </>
            )}
          </div>

          {/* ── 1. Company Record / Detail Modal ── */}
          {viewModalOpen && selectedComp && (() => {
            const cJobs = (jobs || []).filter(j =>
              (j.company && j.company.trim().toLowerCase() === selectedComp.name?.trim().toLowerCase()) ||
              j.companyId === selectedComp.id
            );
            const actJobs = cJobs.filter(j => j.status === 'ACTIVE' || j.status === 'APPROVED' || j.status === 'PUBLISHED');

            const cInternships = (internships || []).filter(i =>
              (i.company && i.company.trim().toLowerCase() === selectedComp.name?.trim().toLowerCase()) ||
              i.companyId === selectedComp.id
            );
            const actInternships = cInternships.filter(i => i.status === 'ACTIVE' || i.status === 'APPROVED' || i.status === 'PUBLISHED');

            const cApplications = (applications || []).filter(a =>
              (a.company && a.company.trim().toLowerCase() === selectedComp.name?.trim().toLowerCase()) ||
              cJobs.some(j => j.id === a.jobId)
            );

            const cMelas = (jobMelas || []).filter(m =>
              (m.participatingCompanies || []).some(c =>
                (typeof c === 'string' && c.toLowerCase() === selectedComp.name?.toLowerCase()) ||
                c.name?.toLowerCase() === selectedComp.name?.toLowerCase() ||
                c.company?.toLowerCase() === selectedComp.name?.toLowerCase()
              )
            );

            const cRecruiters = (recruiters || []).filter(r =>
              (r.company && r.company.trim().toLowerCase() === selectedComp.name?.trim().toLowerCase()) ||
              r.companyId === selectedComp.id
            );

            const primaryRecruiter = cRecruiters[0];
            const isSuspended = selectedComp.verificationStatus === 'SUSPENDED' || selectedComp.accountStatus === 'SUSPENDED';

            return (
              <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title={`Company Record: ${selectedComp.name}`}
                size="lg"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {/* 1. COMPANY OVERVIEW - Header Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                    color: '#fff',
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-xl)'
                  }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: 'var(--radius-xl)',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {selectedComp.name?.[0] || 'C'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>{selectedComp.name}</h3>
                        <StatusBadge status={selectedComp.verificationStatus || 'PENDING'} />
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: '#93c5fd', margin: '3px 0 0 0' }}>
                        {selectedComp.industry || 'Information Technology & Cloud'} • 📍 {selectedComp.location || 'India'}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#cbd5e1', flexWrap: 'wrap' }}>
                        <span>🌐 {selectedComp.website || `https://${selectedComp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}</span>
                        <span>📅 Registered: {selectedComp.registrationDate ? new Date(selectedComp.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026'}</span>
                        <span>🛡️ Status: {selectedComp.verificationStatus || 'PENDING'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. CORPORATE IDENTITY & 3. RECRUITER CONTACT (2-Col Grid) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    {/* 2. CORPORATE IDENTITY */}
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} /> Corporate Identity
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                        <p style={{ margin: 0 }}><strong>CIN:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--color-text)' }}>{selectedComp.cin || selectedComp.cinNumber || 'U72200KA2015PTC078912'}</span></p>
                        <p style={{ margin: 0 }}><strong>GSTIN:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--color-text)' }}>{selectedComp.gstin || selectedComp.gstNumber || '29ABCDE1234F1Z5'}</span></p>
                        <p style={{ margin: 0 }}><strong>Company Size:</strong> <span>{selectedComp.size || selectedComp.employeeCount || '500-1000 employees'}</span></p>
                        <p style={{ margin: 0 }}><strong>Company Type:</strong> <span>{selectedComp.type || selectedComp.companyType || 'Private Limited (Pvt Ltd)'}</span></p>
                        <p style={{ margin: 0 }}><strong>Registered State:</strong> <span>{selectedComp.state || (selectedComp.location ? selectedComp.location.split(',')[1]?.trim() : 'Karnataka, India')}</span></p>
                      </div>
                    </div>

                    {/* 3. RECRUITER CONTACT */}
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} /> Recruiter Contact
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                        <p style={{ margin: 0 }}><strong>Authorized Lead:</strong> <span>{selectedComp.recruiter || primaryRecruiter?.name || 'Talent Acquisition Lead'}</span></p>
                        <p style={{ margin: 0 }}><strong>Designation:</strong> <span>{primaryRecruiter?.designation || 'Director of Talent Acquisition'}</span></p>
                        <p style={{ margin: 0 }}><strong>Official Email:</strong> <span style={{ color: 'var(--color-primary-600)' }}>{selectedComp.email || primaryRecruiter?.email || 'hr@company.com'}</span></p>
                        <p style={{ margin: 0 }}><strong>Phone:</strong> <span>{selectedComp.phone || primaryRecruiter?.phone || '+91 80 4920 1000'}</span></p>
                        {cRecruiters.length > 1 && (
                          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '11px' }}>
                            + {cRecruiters.length - 1} other registered recruiter(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. COMPANY OVERVIEW / ABOUT */}
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} /> Company Overview & Description
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                      {selectedComp.description || selectedComp.about || `${selectedComp.name} is an enterprise employer specializing in ${selectedComp.industry || 'advanced technology and engineering solutions'}. The organization participates in government and state recruitment drives, campus internship programs, and direct hiring.`}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: '11px', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                      <span><strong>Industry:</strong> {selectedComp.industry || 'Information Technology'}</span>
                      <span><strong>Headquarters:</strong> {selectedComp.location || 'Bengaluru, Karnataka'}</span>
                      <span><strong>Website:</strong> {selectedComp.website || `https://${selectedComp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}</span>
                    </div>
                  </div>

                  {/* 4. RELATED RECRUITERS */}
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} /> Related Recruiters
                      </h4>
                      {cRecruiters.length > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {cRecruiters.length} {cRecruiters.length === 1 ? 'Recruiter' : 'Recruiters'}
                        </span>
                      )}
                    </div>

                    {cRecruiters.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {cRecruiters.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => handleOpenRecruiterDossier(r)}
                            style={{
                              background: '#fff',
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 'var(--space-3)',
                              cursor: 'pointer',
                              transition: 'all 150ms ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-400)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'var(--color-primary-100)',
                                color: 'var(--color-primary-700)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '13px',
                                flexShrink: 0
                              }}>
                                {r.name?.[0] || 'R'}
                              </div>
                              <div>
                                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>
                                  {r.name}
                                </strong>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                  {r.designation || 'Director of Talent Acquisition'}
                                </span>
                                {r.email && (
                                  <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', display: 'block', marginTop: 1 }}>
                                    ✉️ {r.email} {r.phone ? `• 📞 ${r.phone}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              <StatusBadge status={r.verificationStatus || 'VERIFIED'} />
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: r.accountStatus === 'ACTIVE' || !r.accountStatus ? '#ecfdf5' : '#fef2f2',
                                color: r.accountStatus === 'ACTIVE' || !r.accountStatus ? '#047857' : '#b91c1c',
                                border: r.accountStatus === 'ACTIVE' || !r.accountStatus ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                textTransform: 'uppercase'
                              }}>
                                {r.accountStatus || 'ACTIVE'}
                              </span>
                              <Button size="xs" variant="outline" leftIcon={<Eye size={12} />}>
                                View Dossier
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: 'var(--space-4)',
                        background: '#fff',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                      }}>
                        <Users size={16} />
                        <span>No recruiters associated with this company.</span>
                      </div>
                    )}
                  </div>

                  {/* 5. RECRUITMENT ACTIVITY */}
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={14} /> Platform Recruitment Activity
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary-600)', display: 'block' }}>
                          {actJobs.length || selectedComp.activeJobsCount || 0}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Jobs</span>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', display: 'block' }}>
                          {cJobs.length || selectedComp.activeJobsCount || 0}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Jobs</span>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#047857', display: 'block' }}>
                          {actInternships.length}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Internships</span>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', display: 'block' }}>
                          {cInternships.length}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Internships</span>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#b45309', display: 'block' }}>
                          {cApplications.length}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Applications</span>
                      </div>

                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#6d28d9', display: 'block' }}>
                          {cMelas.length}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Job Melas</span>
                      </div>
                    </div>

                    {/* Compact Recent Vacancies Preview if any */}
                    {cJobs.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Recent Job Postings</span>
                        {cJobs.slice(0, 2).map((j) => (
                          <div key={j.id} style={{ background: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                            <div>
                              <strong>{j.title}</strong>
                              <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>💼 {j.type || 'Full-time'} • 📍 {j.location || 'India'}</span>
                            </div>
                            <StatusBadge status={j.status || 'ACTIVE'} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verification Compliance Documents if present in system */}
                  {companyDocs && companyDocs.length > 0 && (
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-700)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} /> Verification Compliance Documents
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {companyDocs.map((doc, idx) => (
                          <div key={idx} style={{ background: '#fff', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FileText size={16} style={{ color: 'var(--color-primary-600)' }} />
                              <div>
                                <strong>{doc.name}</strong>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>{doc.file_path}</span>
                              </div>
                            </div>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <Button size="xs" variant="outline" leftIcon={<Eye size={12} />}>
                                  View Document
                                </Button>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. ADMIN ACTIONS */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <Button
                      variant="primary"
                      leftIcon={<Download size={14} />}
                      onClick={() => {
                        exportCompanyDossierPDF(selectedComp);
                        addToast(`Downloading enterprise profile for ${selectedComp.name}...`, 'success');
                      }}
                    >
                      Download Company Profile (PDF)
                    </Button>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                        Close
                      </Button>
                      <Button
                        variant={isSuspended ? 'secondary' : 'danger'}
                        onClick={() => {
                          setViewModalOpen(false);
                          setSuspendTarget(selectedComp);
                        }}
                      >
                        {isSuspended ? 'Company Suspended' : 'Suspend Company'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Modal>
            );
          })()}

          {/* ── Recruiter Dossier Modal ── */}
          {recruiterDossierOpen && selectedRecruiterForDossier && (() => {
            const r = selectedRecruiterForDossier;
            const rLocation = r.location || selectedComp?.location || 'India';
            const rIndustry = r.industry || selectedComp?.industry || 'Information Technology & Services';

            const rJobs = (jobs || []).filter(j =>
              (r.company && j.company?.toLowerCase() === r.company.toLowerCase()) ||
              (r.name && j.recruiter?.toLowerCase() === r.name.toLowerCase()) ||
              (r.id && j.recruiterId === r.id)
            );

            const rInternships = (internships || []).filter(i =>
              (r.company && i.company?.toLowerCase() === r.company.toLowerCase()) ||
              (r.name && i.recruiter?.toLowerCase() === r.name.toLowerCase()) ||
              (r.id && i.recruiterId === r.id)
            );

            const rApplications = (applications || []).filter(a =>
              (r.company && a.company?.toLowerCase() === r.company.toLowerCase()) ||
              (r.name && a.recruiter?.toLowerCase() === r.name.toLowerCase())
            );

            return (
              <Modal
                isOpen={recruiterDossierOpen}
                onClose={() => setRecruiterDossierOpen(false)}
                title={`Recruiter Dossier: ${r.name}`}
                size="lg"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {/* Overview Banner */}
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
                      {r.name?.[0] || 'R'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>{r.name}</h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: '#c7d2fe', margin: '2px 0 0 0' }}>
                        {r.designation || 'Director of Talent Acquisition'} • {r.company || selectedComp?.name}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#e0e7ff', flexWrap: 'wrap' }}>
                        <span>📍 {rLocation}</span>
                        <span>🏢 {rIndustry}</span>
                        <span>📅 Joined: {r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information & Employer Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        Contact Information
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Email:</strong> {r.email || 'N/A'}</p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Phone:</strong> {r.phone || '+91 98765 00112'}</p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Location:</strong> {rLocation}</p>
                    </div>

                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        Employer & Verification
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6 }}><strong>Company:</strong> {r.company || selectedComp?.name}</p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong>Verification:</strong> <StatusBadge status={r.verificationStatus || 'VERIFIED'} />
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong>Account Status:</strong> <span style={{ fontWeight: 700, color: r.accountStatus === 'ACTIVE' || !r.accountStatus ? '#047857' : '#b91c1c' }}>{r.accountStatus || 'ACTIVE'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Recruitment Activity Stats */}
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                      Recruiter Recruitment Activity
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary-600)', display: 'block' }}>{rJobs.length}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Jobs Posted</span>
                      </div>
                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#047857', display: 'block' }}>{rInternships.length}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Internships</span>
                      </div>
                      <div style={{ background: '#fff', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#b45309', display: 'block' }}>{rApplications.length}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Applications</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                    <Button variant="outline" onClick={() => setRecruiterDossierOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </Modal>
            );
          })()}

          {/* ── 2. Confirm Suspend Dialog ── */}
          {suspendTarget && (
            <ConfirmDialog
              isOpen={!!suspendTarget}
              onClose={() => setSuspendTarget(null)}
              onConfirm={handleConfirmSuspend}
              title={`Suspend Company: ${suspendTarget.name}`}
              message={`Are you sure you want to suspend ${suspendTarget.name}? This will suspend the company profile and prevent further hiring listings.`}
              confirmText="Confirm Suspension"
              variant="danger"
            />
          )}

          {/* ── 3. Reject Reason Modal ── */}
          {rejectModalOpen && rejectTarget && (
            <Modal
              isOpen={rejectModalOpen}
              onClose={() => setRejectModalOpen(false)}
              title={`Reject Verification: ${rejectTarget.name}`}
              size="md"
            >
              <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Specify the administrative reason for rejecting {rejectTarget.name}.
                </p>

                <FormField label="Rejection Notes" required>
                  <Textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    required
                  />
                </FormField>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                  <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger">
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* ── 4. Add Company Modal ── */}
          {addModalOpen && (
            <Modal
              isOpen={addModalOpen}
              onClose={() => setAddModalOpen(false)}
              title="Direct Onboard Corporate Employer / Enterprise"
              size="lg"
            >
              <form onSubmit={handleAddCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                      Admin Corporate Authorization & Partner Verification
                    </strong>
                    <span style={{ fontSize: '11px', color: '#3b82f6', lineHeight: 1.4 }}>
                      Enterprises onboarded directly by District/State Administrator are instantly marked as Verified Partner Organizations in the NTR Vikasa Portal.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Company / Entity Name" required>
                    <Input
                      placeholder="e.g. Amaravati Tech Systems Pvt Ltd"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Industry Domain" required>
                    <select
                      className="form-control"
                      value={addForm.industry}
                      onChange={(e) => setAddForm({ ...addForm, industry: e.target.value })}
                      style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                    >
                      <option value="Information Technology & Services">Information Technology & Services</option>
                      <option value="Manufacturing & Automobile">Manufacturing & Automobile</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Banking & Financial Services">Banking & Financial Services</option>
                      <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                      <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Construction & Infrastructure">Construction & Infrastructure</option>
                    </select>
                  </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Authorized Recruiter / HR Lead">
                    <Input
                      placeholder="e.g. Ramesh Varma"
                      value={addForm.recruiter}
                      onChange={(e) => setAddForm({ ...addForm, recruiter: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Official Corporate Email">
                    <Input
                      type="email"
                      placeholder="e.g. careers@company.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    />
                  </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Contact Phone">
                    <Input
                      type="tel"
                      placeholder="e.g. +91 866 245 0000"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Official Website">
                    <Input
                      type="url"
                      placeholder="e.g. https://www.company.com"
                      value={addForm.website}
                      onChange={(e) => setAddForm({ ...addForm, website: e.target.value })}
                    />
                  </FormField>
                </div>

                {/* Geographic Address in NTR District */}
                <div style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} style={{ color: 'var(--color-primary-600)' }} />
                    <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                      Corporate Location (NTR District Hub)
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                    <FormField label="District">
                      <Input value="NTR District" disabled />
                    </FormField>

                    <FormField label="Mandal in NTR District" required>
                      <select
                        className="form-control"
                        value={addForm.mandal}
                        onChange={(e) => setAddForm({ ...addForm, mandal: e.target.value })}
                        style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                      >
                        {NTR_MANDALS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Village / Industrial Area / Ward">
                      <Input
                        placeholder="e.g. Kondapalli / Autonagar / Benz Circle"
                        value={addForm.village}
                        onChange={(e) => setAddForm({ ...addForm, village: e.target.value })}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Corporate Registration & Verification Credentials */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                  <FormField label="Company Size">
                    <select
                      className="form-control"
                      value={addForm.size}
                      onChange={(e) => setAddForm({ ...addForm, size: e.target.value })}
                      style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
                    >
                      <option value="1-50 employees">1-50 employees</option>
                      <option value="50-200 employees">50-200 employees</option>
                      <option value="100-500 employees">100-500 employees</option>
                      <option value="500-1000 employees">500-1000 employees</option>
                      <option value="1000-5000 employees">1000-5000 employees</option>
                      <option value="5000+ employees">5000+ employees</option>
                    </select>
                  </FormField>

                  <FormField label="Corporate CIN Number">
                    <Input
                      placeholder="e.g. U72200AP2021PTC118942"
                      value={addForm.cin}
                      onChange={(e) => setAddForm({ ...addForm, cin: e.target.value.toUpperCase() })}
                    />
                  </FormField>

                  <FormField label="GSTIN Number">
                    <Input
                      placeholder="e.g. 37AAAAA1234A1Z5"
                      value={addForm.gstin}
                      onChange={(e) => setAddForm({ ...addForm, gstin: e.target.value.toUpperCase() })}
                    />
                  </FormField>
                </div>

                <FormField label="Company Overview & Bio">
                  <Textarea
                    rows={2}
                    placeholder="Brief description of operations, products/services, and employment opportunities..."
                    value={addForm.about}
                    onChange={(e) => setAddForm({ ...addForm, about: e.target.value })}
                  />
                </FormField>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" leftIcon={<Building2 size={16} />} disabled={isSubmitting}>
                    {isSubmitting ? 'Registering & Verifying...' : 'Register & Verify Company'}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
    </div>
  );
}
