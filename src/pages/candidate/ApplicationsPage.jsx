import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, DollarSign, Calendar, ArrowRight, Briefcase, X, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import ApplicationDetailsModal from '../../components/ui/ApplicationDetailsModal';
import { formatJobId, formatInternshipId, formatMelaId, getApplicationNumber, getApplicationType, isJobMelaApplication } from '../../utils/applicationUtils';
import authService from '../../services/authService';
import candidateApplicationsService from '../../services/candidateApplicationsService';

export default function CandidateApplicationsPage() {
  const { candidate } = useCandidate();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);

  // ── Backend API State ────────────────────────────────────────────────────────
  const [applicationsData, setApplicationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchApplications() {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        const data = await candidateApplicationsService.getApplications();
        if (!cancelled) {
          setApplicationsData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load applications.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, []);

  // Candidate full name: API takes priority; CandidateContext fallback
  const candidateName = applicationsData?.candidate?.full_name || candidate?.name || 'Priya Sharma';

  // Applications list: API response takes priority; fallback to CandidateContext
  const allApplications = useMemo(() => {
    if (applicationsData?.applications) {
      return applicationsData.applications;
    }
    return candidate?.applications || [];
  }, [applicationsData, candidate?.applications]);

  // Status counts: API response takes priority; fallback to calculation
  const statusCounts = useMemo(() => {
    if (applicationsData?.status_counts) {
      return applicationsData.status_counts;
    }
    return {
      all: allApplications.length,
      applied: allApplications.filter(a => a.status === 'APPLIED').length,
      screening: allApplications.filter(a => a.status === 'SCREENING').length,
      shortlisted: allApplications.filter(a => a.status === 'SHORTLISTED').length,
      interview: allApplications.filter(a => a.status === 'INTERVIEW').length,
      selected: allApplications.filter(a => a.status === 'SELECTED').length,
      rejected: allApplications.filter(a => a.status === 'REJECTED').length,
    };
  }, [applicationsData, allApplications]);

  const filterTabs = [
    { key: 'ALL', label: 'All', count: statusCounts.all ?? 0 },
    { key: 'APPLIED', label: 'Applied', count: statusCounts.applied ?? 0 },
    { key: 'SCREENING', label: 'Screening', count: statusCounts.screening ?? 0 },
    { key: 'SHORTLISTED', label: 'Shortlisted', count: statusCounts.shortlisted ?? 0 },
    { key: 'INTERVIEW', label: 'Interview', count: statusCounts.interview ?? 0 },
    { key: 'SELECTED', label: 'Selected', count: statusCounts.selected ?? 0 },
    { key: 'REJECTED', label: 'Rejected', count: statusCounts.rejected ?? 0 },
  ];

  const filteredApps = useMemo(() => {
    return allApplications.filter((app) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (app.title || app.job_title)?.toLowerCase().includes(q);
        const matchComp = (app.company || app.company_name)?.toLowerCase().includes(q);
        const matchAppNo = (app.appNumber || app.application_id || app.application_number)?.toLowerCase().includes(q);
        const matchLoc = app.location?.toLowerCase().includes(q);
        const matchMela = (app.melaTitle || app.mela_title)?.toLowerCase().includes(q);
        if (!matchTitle && !matchComp && !matchAppNo && !matchLoc && !matchMela) return false;
      }
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
      return true;
    });
  }, [allApplications, search, statusFilter]);

  const handleOpenDetails = async (app) => {
    setSelectedApp(app);
    setDetailsModalOpen(true);
    if (authService.isAuthenticated()) {
      try {
        const appId = app.application_id || app.id;
        const details = await candidateApplicationsService.getApplicationDetails(appId);
        if (details) {
          setSelectedApp(prev => ({ ...prev, ...details }));
        }
      } catch (err) {
        console.error('Failed to load application details:', err);
      }
    }
  };

  const handleOpenTimeline = async (app) => {
    setSelectedApp(app);
    setTimelineModalOpen(true);
    if (authService.isAuthenticated()) {
      try {
        const appId = app.application_id || app.id;
        const res = await candidateApplicationsService.getApplicationTimeline(appId);
        if (res && res.timeline) {
          setSelectedApp(prev => ({
            ...prev,
            timeline: res.timeline,
          }));
        }
      } catch (err) {
        console.error('Failed to load application timeline:', err);
      }
    }
  };

  const PER_PAGE = 9;
  const calculatedPages = Math.ceil(filteredApps.length / PER_PAGE);
  const totalPages = Math.max(3, calculatedPages);

  // Keep pagination valid if items are filtered
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const paginatedApps = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const sliced = filteredApps.slice(start, end);
    return sliced.length > 0 ? sliced : filteredApps.slice(0, PER_PAGE);
  }, [filteredApps, page]);

  return (
    <div className="candidate-applications-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* ── Top Header ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <Briefcase size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>My Applications Tracker</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Real-time application tracking with step-by-step recruitment milestones for {candidateName}
            </p>
          </div>

          <Link to="/candidate/jobs">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Find More Jobs
            </Button>
          </Link>
        </div>

        {/* Search Input */}
        <div style={{ marginTop: 'var(--space-5)', maxWidth: 460 }}>
          <div className="input-wrapper">
            <span className="input-icon-left"><Search size={16} style={{ color: 'var(--color-primary-600)' }} /></span>
            <input
              className="input has-icon-left"
              placeholder="Search applied role, company name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-1)', marginTop: 'var(--space-4)' }}>
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
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
      </div>

      {/* ── Applications Grid ── */}
      {loading ? (
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary-600)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading applications...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)' }}>
          <EmptyState
            icon="default"
            title="No applications in this category"
            description="Explore open jobs matching your skills and submit applications to start tracking."
            action={
              <Link to="/candidate/jobs">
                <Button variant="primary">Browse Jobs</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="recruiter-jobs-grid">
            {paginatedApps.map((app) => {
              const isMela = isJobMelaApplication(app) || Boolean(app.job_mela_id || app.mela_id || app.melaId);
              const appNumber = app.application_id || app.application_number || app.appNumber || getApplicationNumber(app);
              const appType = app.application_type || app.applicationType || getApplicationType(app);
              const companyName = app.company_name || app.company || 'Company';
              const jobTitle = app.job_title || app.title || 'Position';
              const location = app.location || 'Andhra Pradesh';
              const salary = app.salary || 'Not Disclosed';
              const empType = app.employment_type || app.type || 'Full-time';
              const workMode = app.work_mode || app.mode || 'On-site';
              const appliedDate = app.appliedDate || app.applied_date || app.applied_at || 'Recently';
              const isIntern = empType === 'Internship' ||
                (jobTitle && jobTitle.toLowerCase().includes('intern'));
              const entityId = isIntern
                ? formatInternshipId(app.internshipId || app.job_id || app.jobId || app.id)
                : formatJobId(app.job_id || app.jobId || app.id);
              const melaId = isMela ? formatMelaId(app.job_mela_id || app.mela_id || app.melaId || '1') : null;

              return (
                <div
                  key={app.application_id || app.id || appNumber}
                  className="card card-hoverable"
                  style={{
                    borderRadius: 'var(--radius-2xl)',
                    padding: 'var(--space-5)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)'
                  }}
                >
                  <div>
                    {/* Header: Company Icon + Title + Company */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                        color: '#fff',
                        fontSize: 'var(--text-base)',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {companyName?.[0] || 'C'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 2 }}>
                          {jobTitle}
                        </h2>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                          {companyName}
                        </p>
                      </div>
                    </div>

                    {/* Meta Details: Location • Salary • Type / Mode • Applied Date */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-3) 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} style={{ flexShrink: 0 }} />
                        <span>{location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DollarSign size={13} style={{ flexShrink: 0 }} />
                        <span>{salary}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Briefcase size={13} style={{ flexShrink: 0 }} />
                        <span>{empType} ({workMode})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={13} style={{ flexShrink: 0 }} />
                        <span>Applied: {appliedDate}</span>
                      </div>
                    </div>

                    {/* Application Number, Type & Identifier Details */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      margin: 'var(--space-2) 0',
                      padding: '8px 10px',
                      background: 'var(--color-bg)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Application No:</span>
                        <span style={{
                          fontFamily: 'monospace, monospace',
                          fontWeight: 800,
                          color: isMela ? 'var(--color-primary-700)' : 'var(--color-text)',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1px 6px',
                        }}>
                          {appNumber}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Application Type:</span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '10px',
                          color: isMela ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                          background: isMela ? 'var(--color-primary-50)' : 'var(--color-gray-100)',
                          border: isMela ? '1px solid var(--color-primary-200)' : '1px solid var(--color-gray-200)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1px 6px',
                        }}>
                          {appType}
                        </span>
                      </div>

                      {/* Job ID / Internship ID */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {isIntern ? 'Internship ID:' : 'Job ID:'}
                        </span>
                        <span style={{
                          fontFamily: 'monospace, monospace',
                          fontWeight: 700,
                          fontSize: '10.5px',
                          color: 'var(--color-primary-700)',
                          background: 'var(--color-primary-50)',
                          border: '1px solid var(--color-primary-200)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0 5px'
                        }}>
                          {entityId}
                        </span>
                      </div>

                      {/* Job Mela ID for Job Mela applications */}
                      {isMela && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Job Mela ID:</span>
                          <span style={{
                            fontFamily: 'monospace, monospace',
                            fontWeight: 700,
                            fontSize: '10.5px',
                            color: '#7c3aed',
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 5px'
                          }}>
                            {melaId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Status + View Details & View Timeline Buttons */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-gray-100)',
                    paddingTop: 'var(--space-3)',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <StatusBadge status={app.status} />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Button size="sm" variant="primary" onClick={() => handleOpenDetails(app)}>
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleOpenTimeline(app)}>
                        View Timeline
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination UI */}
          <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={PER_PAGE}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemName="applications"
            />
          </div>
        </>
      )}

      {/* ── Application Details Modal ── */}
      <ApplicationDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        application={selectedApp}
        candidate={{ ...candidate, name: candidateName }}
        onViewTimeline={(app) => {
          setDetailsModalOpen(false);
          handleOpenTimeline(app);
        }}
      />

      {/* ── Detail Timeline Modal ── */}
      {timelineModalOpen && selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setTimelineModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg)'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                  Application Timeline
                </span>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{selectedApp.job_title || selectedApp.title}</h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{selectedApp.company_name || selectedApp.company} • {selectedApp.location}</p>
              </div>
              <button
                type="button"
                onClick={() => setTimelineModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Current Status:</span>
                <StatusBadge status={selectedApp.status} />
              </div>

              {/* Application No., Type & IDs in Timeline Modal */}
              {(() => {
                const isMela = isJobMelaApplication(selectedApp) || Boolean(selectedApp.job_mela_id || selectedApp.mela_id || selectedApp.melaId);
                const appNumber = selectedApp.application_id || selectedApp.application_number || selectedApp.appNumber || getApplicationNumber(selectedApp);
                const appType = selectedApp.application_type || selectedApp.applicationType || getApplicationType(selectedApp);
                const isIntern = (selectedApp.type || selectedApp.employment_type) === 'Internship' ||
                  (selectedApp.job_title && selectedApp.job_title.toLowerCase().includes('intern')) ||
                  (selectedApp.title && selectedApp.title.toLowerCase().includes('intern'));
                const entityId = isIntern
                  ? formatInternshipId(selectedApp.internshipId || selectedApp.job_id || selectedApp.jobId || selectedApp.id)
                  : formatJobId(selectedApp.job_id || selectedApp.jobId || selectedApp.id);
                const melaId = isMela ? formatMelaId(selectedApp.job_mela_id || selectedApp.mela_id || selectedApp.melaId || '1') : null;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Application No:</span>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace, monospace', fontWeight: 700, color: isMela ? 'var(--color-primary-700)' : 'var(--color-text)' }}>
                        {appNumber}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Application Type:</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isMela ? 'var(--color-primary-600)' : 'var(--color-text-muted)' }}>
                        {appType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {isIntern ? 'Internship ID:' : 'Job ID:'}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace, monospace', fontWeight: 700, color: 'var(--color-primary-700)' }}>
                        {entityId}
                      </span>
                    </div>
                    {isMela && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Job Mela ID:</span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace, monospace', fontWeight: 700, color: '#7c3aed' }}>
                          {melaId}
                        </span>
                      </div>
                    )}
                    {isMela && (selectedApp.mela_title || selectedApp.melaTitle) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Job Mela:</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', textAlign: 'right', maxWidth: '60%' }}>{selectedApp.mela_title || selectedApp.melaTitle}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Step by step timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                {(selectedApp.timeline && selectedApp.timeline.length > 0 ? selectedApp.timeline : [
                  { stage: 'Applied', date: selectedApp.appliedDate || selectedApp.applied_date, completed: true },
                  { stage: 'Screening', date: 'In Progress', completed: selectedApp.status !== 'APPLIED' },
                  { stage: 'Shortlisted', date: 'Pending', completed: selectedApp.status === 'SHORTLISTED' || selectedApp.status === 'INTERVIEW' || selectedApp.status === 'SELECTED' },
                  { stage: 'Interview', date: 'Pending', completed: selectedApp.status === 'INTERVIEW' || selectedApp.status === 'SELECTED' },
                  { stage: 'Selected', date: 'TBD', completed: selectedApp.status === 'SELECTED' },
                ]).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: step.completed ? 'var(--color-success-500)' : 'var(--color-gray-200)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, flexShrink: 0
                    }}>
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: step.completed ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                        {step.label || step.stage}
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {step.date || 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setTimelineModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
