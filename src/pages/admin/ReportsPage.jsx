import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Search, Filter, Eye, CheckCircle2, XCircle,
  ShieldAlert, ShieldCheck, FileText, User, Building2, Download, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import adminReportService from '../../services/adminReportService';

// Helper to determine whether a report is related to a Candidate or Recruiter
export const getReportUserType = (r) => {
  if (!r) return 'RECRUITER';
  const explicit = (
    r.reported_user_type ||
    r.reportedUserType ||
    r.userType ||
    r.targetType ||
    r.entityType ||
    r.reported_entity?.type ||
    ''
  ).toUpperCase();
  if (explicit === 'CANDIDATE' || explicit === 'CANDIDATES') return 'CANDIDATE';
  if (explicit === 'RECRUITER' || explicit === 'RECRUITERS' || explicit === 'EMPLOYER' || explicit === 'COMPANY') return 'RECRUITER';

  const entity = (r.reportedEntity || r.reported_entity?.name || '').toLowerCase();
  if (entity.includes('candidate')) return 'CANDIDATE';
  if (entity.includes('recruiter') || entity.includes('company') || entity.includes('technologies') || entity.includes('enterprises') || entity.includes('pvt ltd') || entity.includes('techglobal')) return 'RECRUITER';

  const reportType = (r.report_type_label || r.reportType || r.type || r.report_type || '').toLowerCase();
  const reason = (r.details || r.reason || r.description || '').toLowerCase();
  if (reportType.includes('job scam') || reportType.includes('job description') || reportType.includes('fee request') || reportType.includes('employer') || reason.includes('recruiter') || reason.includes('job')) {
    return 'RECRUITER';
  }
  if (reportType.includes('harassment') || reportType.includes('candidate') || reason.includes('candidate') || reason.includes('application portal')) {
    return 'CANDIDATE';
  }

  const reporter = (r.reporter?.name || r.reporter || '').toLowerCase();
  if (reporter.includes('hr') || reporter.includes('recruiter') || reporter.includes('technologies') || reporter.includes('company')) {
    return 'CANDIDATE';
  }
  if (reporter.includes('candidate')) {
    return 'RECRUITER';
  }

  return 'RECRUITER';
};

export default function AdminReportsPage() {
  const { addToast } = useToast();

  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userTypeFilter, setUserTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Data & loading states
  const [reports, setReports] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ all: 0, pending: 0, resolved: 0, dismissed: 0, open_complaints: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Resolve Modal
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  // Reject / Dismiss Modal
  const [dismissTarget, setDismissTarget] = useState(null);
  const [dismissModalOpen, setDismissModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, userTypeFilter]);

  // Fetch summary counts
  const fetchSummary = useCallback(async () => {
    try {
      const data = await adminReportService.getSummary();
      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.warn('Failed to load moderation summary:', err);
    }
  }, []);

  // Fetch reports from backend API
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminReportService.getReports({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        reported_user_type: userTypeFilter !== 'ALL' ? userTypeFilter : undefined,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      });

      if (data) {
        setReports(data.items || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.total_pages || Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE)));
      }
    } catch (err) {
      console.error('Failed to load moderation reports:', err);
      addToast(err.message || 'Failed to load reports from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, userTypeFilter, debouncedSearch, currentPage, addToast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportExcel = () => {
    if (reports.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting moderation complaints to Excel...', 'info');
    const headers = [
      'Report ID',
      'Reported User Type',
      'Reported Entity',
      'Reporter',
      'Report Type',
      'Reason / Details',
      'Created Date',
      'Status',
      'Action / Resolution'
    ];
    const rows = reports.map(r => {
      const uType = getReportUserType(r);
      const entityName = r.reported_entity?.name || r.reportedEntity || 'Entity';
      const reporterName = r.reporter?.name || r.reporter || 'Platform User';
      const repType = r.report_type_label || r.reportType || r.type || 'Flagged Content';
      const narrative = r.description || r.details || r.reason || 'N/A';
      const formattedDate = r.date || (r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A');
      const action = r.action_taken || r.admin_notes || (r.status === 'RESOLVED' ? 'Corrective action taken' : 'Under Investigation');

      return [
        r.report_number || r.id || 'N/A',
        uType === 'CANDIDATE' ? 'Candidate' : 'Recruiter',
        entityName,
        reporterName,
        repType,
        narrative,
        formattedDate,
        r.status || 'PENDING',
        action
      ];
    });

    exportToExcel({
      filename: getExportFilename('reports_complaints', statusFilter.toLowerCase(), 'xlsx'),
      sheetName: 'Reports',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    if (reports.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting moderation complaints to PDF...', 'info');
    const headers = ['Report ID', 'User Type', 'Reported Entity', 'Reporter', 'Type', 'Date', 'Status'];
    const rows = reports.map(r => {
      const uType = getReportUserType(r);
      const entityName = r.reported_entity?.name || r.reportedEntity || 'Entity';
      const reporterName = r.reporter?.name || r.reporter || 'Candidate';
      const repType = r.report_type_label || r.reportType || r.type || 'Flagged';
      const formattedDate = r.date || (r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A');

      return [
        r.report_number || r.id || 'N/A',
        uType === 'CANDIDATE' ? 'Candidate' : 'Recruiter',
        entityName,
        reporterName,
        repType,
        formattedDate,
        r.status || 'PENDING'
      ];
    });

    const tabObj = [
      { key: 'ALL', label: 'All Reports' },
      { key: 'PENDING', label: 'Pending' },
      { key: 'RESOLVED', label: 'Resolved' },
      { key: 'DISMISSED', label: 'Dismissed' }
    ].find(t => t.key === statusFilter);
    const statusLabel = tabObj ? tabObj.label : statusFilter;
    const userTypeLabel = userTypeFilter === 'ALL' ? 'All User Types' : (userTypeFilter === 'CANDIDATE' ? 'Candidates' : 'Recruiters');

    exportToPDF({
      filename: getExportFilename('reports_complaints', statusFilter.toLowerCase(), 'pdf'),
      title: 'Platform Moderation & Complaints Audit Report',
      subtitle: `NTR Vikasa Admin Trust & Safety - Status: ${statusLabel} • Target: ${userTypeLabel}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusLabel,
        'User Type Filter': userTypeLabel,
        'Search Query': search || 'None',
        'Total Records': totalItems
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  const handleOpenResolve = (rep) => {
    setResolveTarget(rep);
    setResolutionNotes('Reviewed evidence. Corrective action enforced against reported entity.');
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolveTarget) return;

    setIsSubmitting(true);
    try {
      await adminReportService.resolveReport(resolveTarget.id, {
        admin_notes: resolutionNotes,
        resolution_reason: 'POLICY_VIOLATION_CONFIRMED'
      });

      const targetName = resolveTarget.reported_entity?.name || resolveTarget.reportedEntity || 'Entity';
      addToast(`Report #${resolveTarget.report_number || resolveTarget.id} against ${targetName} has been RESOLVED.`, 'success');
      setResolveModalOpen(false);

      if (selectedReport?.id === resolveTarget.id) {
        setSelectedReport({
          ...selectedReport,
          status: 'RESOLVED',
          action_taken: resolutionNotes,
          admin_notes: resolutionNotes
        });
      }
      setResolveTarget(null);

      // Refresh data
      await fetchReports();
      await fetchSummary();
    } catch (err) {
      console.error('Failed to resolve report:', err);
      addToast(err.message || 'Failed to resolve report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDismiss = (rep) => {
    setDismissTarget(rep);
    setDismissModalOpen(true);
  };

  const handleConfirmDismiss = async () => {
    if (!dismissTarget) return;

    setIsSubmitting(true);
    try {
      await adminReportService.dismissReport(dismissTarget.id, {
        admin_notes: 'Dismissed as non-actionable or insufficient evidence.',
        resolution_reason: 'INSUFFICIENT_EVIDENCE'
      });

      addToast(`Report #${dismissTarget.report_number || dismissTarget.id} has been DISMISSED.`, 'info');
      setDismissModalOpen(false);

      if (selectedReport?.id === dismissTarget.id) {
        setSelectedReport({
          ...selectedReport,
          status: 'DISMISSED',
          action_taken: 'Dismissed as non-actionable.'
        });
      }
      setDismissTarget(null);

      // Refresh data
      await fetchReports();
      await fetchSummary();
    } catch (err) {
      console.error('Failed to dismiss report:', err);
      addToast(err.message || 'Failed to dismiss report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'reportType',
      label: 'Report Type',
      sortable: true,
      render: (_, row) => {
        const type = row.report_type_label || row.reportType || row.type || 'Flagged Content';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={15} style={{ color: '#dc2626' }} />
            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{type}</strong>
          </div>
        );
      }
    },
    {
      key: 'reportedEntity',
      label: 'Reported Entity',
      sortable: true,
      render: (_, row) => {
        const uType = getReportUserType(row);
        const entityName = row.reported_entity?.name || row.reportedEntity || 'Target Entity';
        const displayId = row.report_number || row.id;
        return (
          <div>
            <strong style={{ fontSize: 'var(--text-xs)', color: '#b91c1c' }}>{entityName}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>ID: {displayId}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)',
                background: uType === 'CANDIDATE' ? '#f0fdf4' : '#eff6ff',
                color: uType === 'CANDIDATE' ? '#166534' : '#1e40af',
                border: uType === 'CANDIDATE' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                textTransform: 'uppercase'
              }}>
                {uType === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'reporter',
      label: 'Reporter',
      render: (_, row) => {
        const uType = getReportUserType(row);
        const reporterName = row.reporter?.name || row.reporter || 'Platform User';
        return (
          <div style={{ fontSize: 'var(--text-xs)' }}>
            <strong>{reporterName}</strong>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
              {uType === 'CANDIDATE' ? 'Employer / Recruiter' : 'Verified Candidate'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (_, row) => {
        const d = row.date || row.created_at || row.createdAt;
        return (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Aug 2026'}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const isPending = v === 'PENDING';
        const isResolved = v === 'RESOLVED';
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: isPending ? '#fef2f2' : isResolved ? '#ecfdf5' : '#f8fafc',
            color: isPending ? '#b91c1c' : isResolved ? '#047857' : '#475569',
            border: isPending ? '1px solid #fecaca' : isResolved ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {isPending ? <AlertTriangle size={12} /> : isResolved ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
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
            onClick={() => {
              setSelectedReport(row);
              setViewModalOpen(true);
            }}
          >
            Review
          </Button>

          {row.status === 'PENDING' && (
            <>
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleOpenResolve(row)}
              >
                Resolve
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => handleOpenDismiss(row)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="admin-reports-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <AlertTriangle size={20} style={{ color: '#dc2626' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Reports & Complaints Moderation</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Investigate candidate grievances, employer policy violations, spam alerts, and fee-charging reports.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <span style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '6px 12px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700
            }}>
              {summary.open_complaints} Open Complaints
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Row 1: Status Filter Tabs & Export */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
            {['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'].map((filterKey) => (
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
                {filterKey === 'ALL' ? 'All Reports' : filterKey}
              </button>
            ))}
          </div>

          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            disabled={totalItems === 0 || isLoading}
          />
        </div>

        {/* Row 2: Reported User Type Filter Dropdown & Search Bar */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
          {/* User Type Filter */}
          <div style={{ position: 'relative', minWidth: 230, flex: '0 1 260px' }}>
            <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
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
                background: userTypeFilter === 'ALL' ? 'var(--color-surface)' : 'var(--color-primary-50, #eff6ff)',
                borderColor: userTypeFilter === 'ALL' ? 'var(--color-border)' : 'var(--color-primary-500)'
              }}
            >
              <option value="ALL">Reported User Type: All</option>
              <option value="CANDIDATE">Candidates</option>
              <option value="RECRUITER">Recruiters</option>
            </select>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by report type, reported entity, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}
            />
          </div>

          {/* Active Filter Clear */}
          {(userTypeFilter !== 'ALL' || statusFilter !== 'ALL' || search.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setUserTypeFilter('ALL');
                setStatusFilter('ALL');
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

      {/* Data Table */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto var(--space-3)' }} />
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Loading moderation complaints...</p>
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={40} />}
            title="No Moderation Complaints"
            description="No reports or complaints match your current search and filter criteria."
          />
        ) : (
          <>
            <Table columns={columns} data={reports} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* ── 1. Review Modal ── */}
      {viewModalOpen && selectedReport && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Grievance Report: #${selectedReport.report_number || selectedReport.id}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
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
                <AlertTriangle size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {selectedReport.report_type_label || selectedReport.reportType || selectedReport.type || selectedReport.report_type}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: '#fecaca', margin: '2px 0 0 0' }}>
                  Reported Target: {selectedReport.reported_entity?.name || selectedReport.reportedEntity} ({getReportUserType(selectedReport) === 'CANDIDATE' ? 'Candidate' : 'Recruiter'})
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#fee2e2' }}>
                  <span>👤 Reporter: {selectedReport.reporter?.name || selectedReport.reporter}</span>
                  <span>📅 Date: {selectedReport.date || (selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A')}</span>
                  <span>🛡️ Status: {selectedReport.status}</span>
                </div>
              </div>
            </div>

            {/* Complaint Narrative */}
            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Complaint Description & Evidence
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                {selectedReport.description || selectedReport.details || selectedReport.reason || 'Candidate reported suspicious recruitment behavior requesting security deposits or unofficial registration fees.'}
              </p>
            </div>

            {(selectedReport.action_taken || selectedReport.admin_notes) && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#047857', marginBottom: 'var(--space-1)' }}>
                  Action Taken / Resolution
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: '#065f46', margin: 0 }}>
                  {selectedReport.action_taken || selectedReport.admin_notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              {selectedReport.status === 'PENDING' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpenDismiss(selectedReport);
                    }}
                  >
                    Dismiss / Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpenResolve(selectedReport);
                    }}
                  >
                    Resolve Complaint
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── 2. Resolve Modal ── */}
      {resolveModalOpen && resolveTarget && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => !isSubmitting && setResolveModalOpen(false)}
          title={`Resolve Report #${resolveTarget.report_number || resolveTarget.id}`}
          size="md"
        >
          <form onSubmit={handleConfirmResolve} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Specify the corrective action or resolution summary for complaint against <strong>{resolveTarget.reported_entity?.name || resolveTarget.reportedEntity}</strong>.
            </p>

            <FormField label="Resolution Summary" required>
              <Textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Resolution details..."
                required
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button type="button" variant="outline" onClick={() => setResolveModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Resolving...' : 'Confirm & Mark Resolved'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 3. Dismiss Dialog ── */}
      {dismissModalOpen && dismissTarget && (
        <Modal
          isOpen={dismissModalOpen}
          onClose={() => !isSubmitting && setDismissModalOpen(false)}
          title={`Dismiss Complaint #${dismissTarget.report_number || dismissTarget.id}`}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Are you sure you want to dismiss the complaint against <strong>{dismissTarget.reported_entity?.name || dismissTarget.reportedEntity}</strong> as non-actionable?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button variant="outline" onClick={() => setDismissModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDismiss} disabled={isSubmitting}>
                {isSubmitting ? 'Dismissing...' : 'Dismiss Complaint'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
