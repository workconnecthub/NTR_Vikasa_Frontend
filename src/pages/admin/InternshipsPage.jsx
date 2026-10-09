import { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap, Search, Filter, Eye, CheckCircle2, XCircle,
  Building2, MapPin, DollarSign, Clock, ShieldAlert, AlertTriangle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import { formatInternshipId } from '../../utils/applicationUtils';

export default function AdminInternshipsPage() {
  const { addToast } = useToast();
  const {
    internships = [],
    companies = [],
    recruiters = [],
    approveInternship,
    rejectInternship
  } = useAdmin();

  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, companyFilter]);

  // Derive unique company names from existing internship, company, and recruiter data
  const availableCompanies = useMemo(() => {
    const set = new Set();
    internships?.forEach(item => {
      const c = item.company || item.companyName;
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
    recruiters?.forEach(r => {
      const c = r.company || r.companyName;
      if (c && typeof c === 'string' && c.trim()) {
        set.add(c.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [internships, companies, recruiters]);

  // View modal
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const filterTabs = [
    { key: 'ALL', label: 'All Internships' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'PENDING', label: 'Pending Approval' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const filtered = useMemo(() => {
    return (internships || []).filter((item) => {
      // 1. Company Filter
      if (companyFilter !== 'ALL') {
        const itemCompany = (item.company || item.companyName || '').trim().toLowerCase();
        if (itemCompany !== companyFilter.trim().toLowerCase()) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'APPROVED' && (item.status !== 'APPROVED' && item.status !== 'PUBLISHED')) return false;
        if (statusFilter === 'ACTIVE' && (item.status !== 'ACTIVE' && item.status !== 'PUBLISHED' && item.status !== 'APPROVED')) return false;
        if (statusFilter === 'PENDING' && item.status !== 'PENDING') return false;
        if (statusFilter === 'REJECTED' && item.status !== 'REJECTED') return false;
        if (statusFilter === 'CLOSED' && item.status !== 'CLOSED') return false;
      }

      // 3. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesIntId = (formatInternshipId(item.id) || '').toLowerCase().includes(q) || String(item.id || '').toLowerCase().includes(q);
        const matchesCompany = item.company?.toLowerCase().includes(q);
        const matchesRecruiter = item.recruiter?.toLowerCase().includes(q);
        const matchesLocation = item.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesIntId && !matchesCompany && !matchesRecruiter && !matchesLocation) return false;
      }
      return true;
    });
  }, [internships, search, statusFilter, companyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedInternships = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting internships list to Excel...', 'info');
    const headers = [
      'Internship ID',
      'Internship Title',
      'Company',
      'Duration',
      'Stipend',
      'Location',
      'Submitted Date',
      'Status'
    ];
    const rows = filtered.map(i => [
      formatInternshipId(i.id),
      i.title || 'N/A',
      i.company || 'N/A',
      i.duration || '3 Months',
      i.stipend || 'Competitive',
      i.location || 'India',
      i.submittedDate || i.createdAt ? new Date(i.submittedDate || i.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026',
      i.status || 'ACTIVE'
    ]);
    const fileSuffix = companyFilter !== 'ALL'
      ? `${companyFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${statusFilter.toLowerCase()}`
      : statusFilter.toLowerCase();
    exportToExcel({
      filename: getExportFilename('admin_internships', fileSuffix, 'xlsx'),
      sheetName: 'Internships',
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
    addToast('Exporting internships list to PDF...', 'info');
    const headers = ['Internship ID', 'Internship Title', 'Company', 'Duration', 'Stipend', 'Location', 'Status'];
    const rows = filtered.map(i => [
      formatInternshipId(i.id),
      i.title || 'N/A',
      i.company || 'N/A',
      i.duration || '3 Months',
      i.stipend || 'Competitive',
      i.location || 'India',
      i.status || 'ACTIVE'
    ]);
    const tabObj = filterTabs.find(t => t.key === statusFilter);
    const statusLabel = tabObj ? tabObj.label : statusFilter;
    const companyLabel = companyFilter === 'ALL' ? 'All Companies' : companyFilter;

    const fileSuffix = companyFilter !== 'ALL'
      ? `${companyFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${statusFilter.toLowerCase()}`
      : statusFilter.toLowerCase();

    exportToPDF({
      filename: getExportFilename('admin_internships', fileSuffix, 'pdf'),
      title: 'Platform Internship Programs Governance Report',
      subtitle: `NTR Vikasa Admin Audit - Company: ${companyLabel} • Filter: ${statusLabel}`,
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

  const handleApprove = async (item) => {
    try {
      await approveInternship(item.id);
      addToast(`"${item.title}" by ${item.company} is now APPROVED.`, 'success');
      if (selectedInternship?.id === item.id) {
        setSelectedInternship({ ...selectedInternship, status: 'APPROVED' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to approve internship', 'error');
    }
  };

  const handleOpenReject = (item) => {
    setRejectTarget(item);
    setRejectionReason('Internship stipend or requirements do not satisfy fair academic training guidelines.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    try {
      await rejectInternship(rejectTarget.id, rejectionReason || 'Rejected by administrator.');
      addToast(`"${rejectTarget.title}" has been REJECTED.`, 'info');
      setRejectModalOpen(false);
      if (selectedInternship?.id === rejectTarget.id) {
        setSelectedInternship({ ...selectedInternship, status: 'REJECTED' });
      }
      setRejectTarget(null);
    } catch (err) {
      addToast(err.message || 'Failed to reject internship', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Internship',
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
              {formatInternshipId(row.id)}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>{row.company}</span>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (v) => <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{v}</strong>
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>⏳ {v || '3 Months'}</span>
    },
    {
      key: 'stipend',
      label: 'Stipend',
      render: (v) => <strong style={{ fontSize: 'var(--text-xs)', color: '#047857' }}>{v}</strong>
    },
    {
      key: 'location',
      label: 'Location',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>📍 {v}</span>
    },
    {
      key: 'submittedDate',
      label: 'Submitted Date',
      sortable: true,
      render: (v) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          {v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
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
            {v}
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
            onClick={() => {
              setSelectedInternship(row);
              setViewModalOpen(true);
            }}
          >
            View
          </Button>

          {row.status !== 'APPROVED' && row.status !== 'ACTIVE' && (
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
    <div className="admin-internships-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <GraduationCap size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Platform Internships Directory</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Audit campus internships, review student stipends, and manage student training programs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <span style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '6px 12px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700
            }}>
              {internships.filter(i => i.status === 'ACTIVE' || i.status === 'APPROVED' || i.status === 'PUBLISHED').length} Active Internships
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
              placeholder="Search internships, company, recruiter, location..."
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
            icon={<GraduationCap size={40} />}
            title="No Internships Found"
            description="No internship postings match your current search and filter criteria."
          />
        ) : (
          <>
            <Table columns={columns} data={paginatedInternships} />
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

      {/* ── 1. Internship View Details Modal ── */}
      {viewModalOpen && selectedInternship && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Internship Program: ${selectedInternship.title}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header Badge */}
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
                <GraduationCap size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{selectedInternship.title}</span>
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
                    {formatInternshipId(selectedInternship.id)}
                  </span>
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: '#93c5fd', margin: '2px 0 0 0' }}>{selectedInternship.company} • 📍 {selectedInternship.location}</p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#cbd5e1' }}>
                  <span>💰 Stipend: {selectedInternship.stipend}</span>
                  <span>⏳ Duration: {selectedInternship.duration || '3 Months'}</span>
                  <span>🛡️ Status: {selectedInternship.status}</span>
                </div>
              </div>
            </div>

            {/* Internship Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  Employer & Location
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                  <strong>Internship ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-600)' }}>{formatInternshipId(selectedInternship.id)}</span>
                </p>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Company:</strong> {selectedInternship.company}</p>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Location:</strong> {selectedInternship.location}</p>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Submitted Date:</strong> {selectedInternship.submittedDate || 'Aug 2026'}</p>
              </div>

              <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  Stipend & Capacity
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Stipend:</strong> {selectedInternship.stipend}</p>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Duration:</strong> {selectedInternship.duration || '3 Months'}</p>
                <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Openings:</strong> {selectedInternship.openings || 3} Interns</p>
              </div>
            </div>

            {/* Description / Eligibility */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Internship Objectives & Eligibility
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.6, background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                {selectedInternship.description || 'Hands-on practical industry internship providing direct mentorship, project delivery exposure, and career growth pathways.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              {selectedInternship.status !== 'APPROVED' && selectedInternship.status !== 'ACTIVE' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleApprove(selectedInternship);
                    setSelectedInternship({ ...selectedInternship, status: 'APPROVED' });
                  }}
                >
                  Approve Internship
                </Button>
              )}
              {selectedInternship.status !== 'REJECTED' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setViewModalOpen(false);
                    handleOpenReject(selectedInternship);
                  }}
                >
                  Reject Internship
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. Reject Modal ── */}
      {rejectModalOpen && rejectTarget && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Internship: ${rejectTarget.title}`}
          size="md"
        >
          <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Specify the moderation reason for rejecting this internship posting.
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
    </div>
  );
}
