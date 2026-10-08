import { useState, useEffect } from 'react';
import {
  History, Search, Download, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import adminAuditService from '../../services/adminAuditService';

export default function AdminAuditLogsPage() {
  const { addToast } = useToast();

  const PAGE_SIZE = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch paginated audit logs from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await adminAuditService.getAuditLogs({
          page: currentPage,
          page_size: PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
        });

        if (isMounted && data) {
          setAuditLogs(data.items || []);
          setTotalItems(data.total || 0);
          setTotalPages(data.total_pages || Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE)));
        }
      } catch (err) {
        console.warn('Failed to load audit logs from backend:', err);
        if (isMounted) {
          addToast(err.message || 'Failed to load audit logs from server.', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();
    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearch]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await adminAuditService.exportAuditCsv({
        search: debouncedSearch.trim() || undefined,
      });
      addToast('Audit log records exported as CSV successfully.', 'success');
    } catch (err) {
      console.warn('Failed to export audit logs CSV:', err);
      addToast(err.message || 'Failed to export audit logs CSV.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <History size={14} style={{ color: 'var(--color-primary-600)' }} />
          <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{v}</strong>
        </div>
      )
    },
    {
      key: 'admin',
      label: 'Admin / User',
      sortable: true,
      render: (v, row) => {
        const userName = v || row.user || row.actor || 'Admin User';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-full)',
              background: '#e0e7ff',
              color: '#3730a3',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {userName[0] || 'A'}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{userName}</span>
          </div>
        );
      }
    },
    {
      key: 'target',
      label: 'Target',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{v || 'System Entity'}</span>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{v || '2026-10-08'}</span>
    },
    {
      key: 'time',
      label: 'Time',
      render: (v) => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{v || '10:32 AM'}</span>
    },
    {
      key: 'result',
      label: 'Result',
      render: (v) => {
        const isSuccess = (v || 'SUCCESS').toUpperCase() === 'SUCCESS';
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: isSuccess ? '#ecfdf5' : '#fef2f2',
            color: isSuccess ? '#047857' : '#b91c1c',
            border: isSuccess ? '1px solid #a7f3d0' : '1px solid #fecaca',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isSuccess ? 'SUCCESS' : 'FAILED'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="admin-audit-logs-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <History size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Security & System Audit Logs</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Immutable audit trail recording administrative approvals, user suspensions, and security operations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              onClick={handleExport}
              disabled={isExporting || isLoading || totalItems === 0}
            >
              {isExporting ? 'Exporting...' : 'Export Audit CSV'}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative', maxWidth: 440 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by action, admin name, target entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ width: '100%', paddingLeft: 36, height: 38, borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto var(--space-3)' }} />
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Loading security audit logs...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <EmptyState
            icon={<History size={40} />}
            title="No Audit Records Found"
            description="No audit events matched your search query."
          />
        ) : (
          <>
            <Table columns={columns} data={auditLogs} />
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
    </div>
  );
}
