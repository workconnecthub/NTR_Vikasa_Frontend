import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Plus, Search, Filter, Users, Eye, Edit2,
  XCircle, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  MoreVertical, Calendar, DollarSign, MapPin, Sparkles, Building2,
  Loader2
} from 'lucide-react';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/States';
import { ConfirmDialog } from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename } from '../../utils/exportUtils';
import { formatJobId } from '../../utils/applicationUtils';
import recruiterJobService from '../../services/recruiterJobService';

const PAGE_SIZE = 9;

export default function JobsPage() {
  const navigate = useNavigate();
  const { recruiter } = useRecruiter();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [closingJobId, setClosingJobId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tabCounts, setTabCounts] = useState({ all: 0, active: 0, pending: 0, draft: 0, closed: 0 });
  const [allDepartments, setAllDepartments] = useState([
    'Core Engineering',
    'Platform Core',
    'Infra & SecOps',
    'AI Innovation Lab',
    'Marketing & Growth',
  ]);

  // Fetch tab counts across all statuses
  const fetchCountsAndDepts = useCallback(async () => {
    try {
      const res = await recruiterJobService.getJobs({ page: 1, page_size: 100, status: 'ALL' });
      if (res && res.items) {
        const allItems = res.items;
        setTabCounts({
          all: res.total || allItems.length,
          active: allItems.filter(j => j.status === 'PUBLISHED').length,
          pending: allItems.filter(j => j.status === 'PENDING').length,
          draft: allItems.filter(j => j.status === 'DRAFT').length,
          closed: allItems.filter(j => j.status === 'CLOSED').length,
        });

        const depts = Array.from(new Set(allItems.map(j => j.department).filter(Boolean)));
        if (depts.length > 0) {
          setAllDepartments(depts);
        }
      }
    } catch (err) {
      console.error('Failed to load tab counts:', err);
    }
  }, []);

  // Fetch paginated jobs based on current filters
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruiterJobService.getJobs({
        page: currentPage,
        page_size: PAGE_SIZE,
        status: selectedStatusTab,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res && res.items) {
        setJobs(res.items);
        setTotalItems(res.total || res.items.length);
        setTotalPages(res.total_pages || Math.max(1, Math.ceil((res.total || res.items.length) / PAGE_SIZE)));
      } else {
        setJobs([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      addToast('Failed to load jobs from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatusTab, departmentFilter, searchQuery, addToast]);

  // Initial load
  useEffect(() => {
    fetchCountsAndDepts();
  }, [fetchCountsAndDepts]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusTab, departmentFilter]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleConfirmClose = async () => {
    if (closingJobId) {
      try {
        await recruiterJobService.closeJob(closingJobId);
        addToast('Job posting has been closed successfully.', 'info');
        setClosingJobId(null);
        fetchJobs();
        fetchCountsAndDepts();
      } catch (err) {
        addToast(err.message || 'Failed to close job.', 'error');
      }
    }
  };

  const handleReopen = async (jobId) => {
    try {
      await recruiterJobService.updateJob(jobId, { status: 'PUBLISHED' });
      addToast('Job posting has been republished and is now active.', 'success');
      fetchJobs();
      fetchCountsAndDepts();
    } catch (err) {
      addToast(err.message || 'Failed to reopen job.', 'error');
    }
  };

  const handleExportExcel = () => {
    if (jobs.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting jobs list to Excel...', 'info');
    const headers = [
      'Job Number',
      'Job Title',
      'Department',
      'Employment Type',
      'Location',
      'Salary',
      'Experience',
      'Posted Date',
      'Deadline',
      'Status',
      'Applicants Count',
      'Shortlisted Count',
      'Interview Count'
    ];
    const rows = jobs.map(j => [
      j.job_number || j.job_id || 'N/A',
      j.title || 'N/A',
      j.department || 'General',
      j.job_type || j.work_mode || 'Full-time',
      j.location || 'India',
      j.salary || 'Competitive',
      j.experience || '2-5 Years',
      j.createdAt || j.posted_at || 'Aug 2026',
      j.deadline || 'Ongoing',
      j.status || 'PUBLISHED',
      j.applicantsCount || j.applicant_count || 0,
      j.shortlistedCount || j.shortlisted_count || 0,
      j.interviewsCount || j.interview_count || 0
    ]);
    exportToExcel({
      filename: getExportFilename('my_jobs', selectedStatusTab.toLowerCase(), 'xlsx'),
      sheetName: 'My Jobs',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    if (jobs.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting jobs list to PDF...', 'info');
    const headers = ['Job Number', 'Job Title', 'Department', 'Type', 'Location', 'Salary', 'Deadline', 'Status', 'Applicants'];
    const rows = jobs.map(j => [
      j.job_number || j.job_id || 'N/A',
      j.title || 'N/A',
      j.department || 'General',
      j.job_type || j.work_mode || 'Full-time',
      j.location || 'India',
      j.salary || 'Competitive',
      j.deadline || 'Ongoing',
      j.status || 'PUBLISHED',
      j.applicantsCount || j.applicant_count || 0
    ]);
    const tabObj = [
      { id: 'ALL', label: 'All Jobs' },
      { id: 'ACTIVE', label: 'Active / Published' },
      { id: 'PENDING', label: 'Pending Approval' },
      { id: 'DRAFT', label: 'Drafts' },
      { id: 'CLOSED', label: 'Closed' },
    ].find(t => t.id === selectedStatusTab);
    const statusLabel = tabObj ? tabObj.label : selectedStatusTab;

    exportToPDF({
      filename: getExportFilename('my_jobs', selectedStatusTab.toLowerCase(), 'pdf'),
      title: 'Job Postings & Requisitions Report',
      subtitle: `Employer: ${recruiter?.company?.name || recruiter?.name || 'Recruiter'}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusLabel,
        'Department': departmentFilter === 'ALL' ? 'All Departments' : departmentFilter,
        'Total Records': totalItems
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  return (
    <div className="portal-page">
      {/* Page Header */}
      <div className="portal-header-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
            Job Postings & Requisitions
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage active hiring positions, review incoming applicants, and track recruitment progress.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/recruiter/candidates">
            <Button variant="outline" icon={<Search size={16} />}>
              Find Talent
            </Button>
          </Link>
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 auto' }}>
            <div style={{ flex: '1 1 260px', minWidth: '220px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by job title, department, location, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', borderRadius: '8px' }}
              />
            </div>

            <div style={{ width: '200px' }}>
              <select
                className="form-control"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{ height: '42px', borderRadius: '8px' }}
              >
                <option value="ALL">All Departments</option>
                {allDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            disabled={jobs.length === 0}
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
            { id: 'ALL', label: 'All Jobs', count: tabCounts.all },
            { id: 'ACTIVE', label: 'Active / Published', count: tabCounts.active },
            { id: 'PENDING', label: 'Pending Approval', count: tabCounts.pending },
            { id: 'DRAFT', label: 'Drafts', count: tabCounts.draft },
            { id: 'CLOSED', label: 'Closed', count: tabCounts.closed },
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

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '0.75rem' }}>
          <Loader2 className="animate-spin" size={36} style={{ color: 'var(--color-primary-600)' }} />
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem' }}>Loading job requisitions...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} />}
          title="No job postings found"
          description="Try changing your search terms or filters, or post a new job requisition to start receiving applicants."
          action={
            <Link to="/recruiter/jobs/new">
              <Button variant="primary" icon={<Plus size={16} />}>Post New Job</Button>
            </Link>
          }
        />
      ) : (
        <div>
          <div className="recruiter-jobs-grid">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`card recruiter-job-card ${job.status === 'PUBLISHED' ? 'is-published' : ''}`}
              >
                {/* Header: Status & Work Mode */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        color: 'var(--color-primary-700)',
                        background: 'var(--color-primary-50)',
                        border: '1px solid var(--color-primary-200)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}>
                        {job.job_number || formatJobId(job.job_id || job.id)}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      background: 'var(--color-gray-100)',
                      color: 'var(--color-gray-700)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {job.workMode || job.work_mode || 'Hybrid'}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h2
                    title={job.title}
                    style={{
                      margin: '0 0 0.4rem 0',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--color-gray-900)',
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.7em'
                    }}
                  >
                    {job.title}
                  </h2>

                  {/* Metadata: Dept, Location, Salary, Dates */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-gray-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Building2 size={13} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.department}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <MapPin size={13} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span>{job.location || 'India'}</span>
                      </span>
                    </div>

                    {job.salary && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--color-gray-800)' }}>
                        <DollarSign size={13} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span>{job.salary}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-gray-500)', fontSize: '0.74rem' }}>
                      <Calendar size={13} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                      <span>Posted: {job.createdAt || job.posted_at?.split(' ')[0] || 'Ongoing'} • Deadline: {job.deadline || 'Ongoing'}</span>
                    </div>
                  </div>
                </div>

                {/* Pipeline Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: 'var(--color-gray-50)',
                  padding: '0.45rem 0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-gray-200)',
                  textAlign: 'center',
                  gap: '2px',
                  marginTop: '0.25rem'
                }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>{job.applicantsCount ?? job.applicant_count ?? 0}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Applicants</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--color-gray-200)', borderRight: '1px solid var(--color-gray-200)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>{job.shortlistedCount ?? job.shortlisted_count ?? 0}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Shortlisted</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>{job.interviewsCount ?? job.interview_count ?? 0}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Interviews</div>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center', minHeight: '22px' }}>
                    {job.skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--color-primary-50)',
                          color: 'var(--color-primary-700)',
                          fontSize: '0.72rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}
                      >
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: '0.65rem', gap: '0.5rem', marginTop: 'auto' }}>
                  <Link to="/recruiter/applications" style={{ textDecoration: 'none', flex: 1 }}>
                    <Button variant="primary" size="sm" style={{ width: '100%' }} icon={<Users size={13} />}>
                      View Applicants ({job.applicantsCount ?? job.applicant_count ?? 0})
                    </Button>
                  </Link>

                  <div>
                    {job.status === 'CLOSED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<CheckCircle2 size={13} />}
                        onClick={() => handleReopen(job.id)}
                      >
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: 'var(--color-danger-600)' }}
                        icon={<XCircle size={13} />}
                        onClick={() => setClosingJobId(job.id)}
                        title="Close Job"
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              itemName="jobs"
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Close Job Confirm Dialog */}
      {closingJobId && (
        <ConfirmDialog
          isOpen={!!closingJobId}
          onClose={() => setClosingJobId(null)}
          onConfirm={handleConfirmClose}
          title="Close Job Posting?"
          message="Are you sure you want to close this job posting? Candidates will no longer be able to submit new applications for this role."
          confirmText="Yes, Close Job"
          variant="danger"
        />
      )}
    </div>
  );
}
