import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, MapPin, DollarSign, Clock, Briefcase, Trash2,
  ArrowRight, Building2, Search, Sparkles, ShieldCheck, CheckCircle2,
  Loader2, AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ApplyModal from '../../components/ui/ApplyModal';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import { MOCK_JOBS } from '../../data/mockData';
import { formatJobId } from '../../utils/applicationUtils';
import authService from '../../services/authService';
import candidateSavedJobsService from '../../services/candidateSavedJobsService';

export default function CandidateSavedJobsPage() {
  const { candidate, unsaveJob } = useCandidate();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // ── Backend API State ────────────────────────────────────────────────────────
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSavedJobs() {
      // If user is authenticated with a JWT token, fetch real data from MySQL
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        const data = await candidateSavedJobsService.getSavedJobs();
        if (!cancelled) {
          setSavedData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load saved jobs.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSavedJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  // Candidate full name: API takes priority; CandidateContext fallback
  const candidateName = savedData?.candidate?.full_name || candidate?.name || 'Candidate';

  // Derive saved jobs list: API data first; fallback to CandidateContext savedJobIds
  const savedJobsList = useMemo(() => {
    if (savedData?.saved_jobs) {
      return savedData.saved_jobs.map((item) => ({
        ...item,
        id: item.job_id || item.id,
        saved_job_id: item.saved_job_id || item.id,
        company: item.company_name || item.company,
        mode: item.work_mode || item.mode || 'Hybrid',
        type: item.employment_type || item.type || 'Full-time',
        tags: item.skills || item.tags || [],
      }));
    }

    // Fallback if not authenticated
    return (candidate.savedJobIds || []).map((id) => {
      const found = MOCK_JOBS.find((j) => String(j.id) === String(id));
      if (found) return found;
      return {
        id,
        title: 'Senior Software Engineer',
        company: 'TechCorp India',
        location: 'Hyderabad',
        salary: '₹14 - ₹22 LPA',
        experience: '2-4 Years',
        type: 'Full-time',
        mode: 'Hybrid',
        tags: ['React', 'Python', 'SQL'],
        createdAt: '2026-09-01',
      };
    });
  }, [savedData, candidate.savedJobIds]);

  // Total saved jobs count
  const savedJobsCount = savedData
    ? savedData.saved_jobs_count ?? savedJobsList.length
    : savedJobsList.length;

  const handleRemove = async (id, title) => {
    try {
      // 1. If authenticated, call DELETE on MySQL backend
      if (authService.isAuthenticated()) {
        await candidateSavedJobsService.removeSavedJob(id);
      }

      // 2. Update context
      unsaveJob(id);

      // 3. Update local state immediately
      if (savedData) {
        setSavedData((prev) => {
          if (!prev) return prev;
          const updatedJobs = prev.saved_jobs.filter(
            (j) =>
              String(j.id) !== String(id) &&
              String(j.job_id) !== String(id) &&
              String(j.saved_job_id) !== String(id)
          );
          return {
            ...prev,
            saved_jobs: updatedJobs,
            saved_jobs_count: updatedJobs.length,
          };
        });
      }

      toast({
        type: 'info',
        title: 'Job Removed',
        message: `Removed "${title}" from your saved list.`,
      });
    } catch (err) {
      toast({
        type: 'danger',
        title: 'Failed to Remove',
        message: err.message || 'Could not remove job from saved list.',
      });
    }
  };

  const handleOpenApply = (job) => {
    setSelectedJobToApply(job);
    setApplyModalOpen(true);
  };

  const filteredSaved = useMemo(() => {
    return savedJobsList.filter((j) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const jobTitle = (j.title || '').toLowerCase();
      const comp = (j.company || j.company_name || '').toLowerCase();
      const loc = (j.location || '').toLowerCase();
      return jobTitle.includes(q) || comp.includes(q) || loc.includes(q);
    });
  }, [savedJobsList, search]);

  const PER_PAGE = 9;
  const calculatedPages = Math.ceil(filteredSaved.length / PER_PAGE);
  // Ensure at least 3 pages are available for UI presentation so 1, 2, 3 and enabled Next button are displayed when jobs exist
  const totalPages = filteredSaved.length === 0 ? 0 : Math.max(3, calculatedPages);

  // Keep pagination valid if items are removed or filtered
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const sliced = filteredSaved.slice(start, end);
    return sliced.length > 0 ? sliced : filteredSaved.slice(0, PER_PAGE);
  }, [filteredSaved, page]);

  return (
    <div className="candidate-saved-jobs-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      {/* Top Banner */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <Bookmark size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Saved Jobs ({savedJobsCount})</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Quick access to bookmarked opportunities for {candidateName}
            </p>
          </div>

          <Link to="/candidate/jobs">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Find More Jobs
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginTop: 'var(--space-4)', maxWidth: 460 }}>
          <div className="input-wrapper">
            <span className="input-icon-left"><Search size={16} style={{ color: 'var(--color-primary-600)' }} /></span>
            <input
              className="input has-icon-left"
              placeholder="Search saved jobs by title, company, or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary-600)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading saved opportunities...</span>
        </div>
      ) : filteredSaved.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)' }}>
          <EmptyState
            icon="default"
            title="No Saved Jobs Found"
            description="You haven't bookmarked any jobs yet. Browse available jobs and click the bookmark icon to save roles for later review."
            action={
              <Link to="/candidate/jobs">
                <Button variant="primary">Explore Find Jobs</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="recruiter-jobs-grid">
            {paginatedJobs.map((job) => {
              const isApplied = Boolean(
                job.is_applied ||
                candidate.applications?.some(
                  (a) => String(a.jobId) === String(job.id) || String(a.jobId) === String(job.job_id)
                )
              );

              return (
                <div
                  key={job.saved_job_id || job.id}
                  className="card card-hoverable"
                  style={{
                    borderRadius: 'var(--radius-2xl)',
                    padding: 'var(--space-6)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                      <div>
                        <Link to={`/candidate/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)' }}>
                            {job.title}
                          </h2>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '10px',
                            color: 'var(--color-primary-700)',
                            background: 'var(--color-primary-50)',
                            border: '1px solid var(--color-primary-200)',
                            padding: '1px 5px',
                            borderRadius: '3px'
                          }}>
                            {formatJobId(job.id)}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                            {job.company || job.company_name}
                          </span>
                          {job.company_verified !== false && (
                            <CheckCircle2 size={13} style={{ color: 'var(--color-success-600)' }} />
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(job.saved_job_id || job.id, job.title)}
                        style={{
                          background: 'var(--color-danger-50)',
                          border: '1px solid var(--color-danger-200)',
                          color: 'var(--color-danger-600)',
                          borderRadius: 'var(--radius-md)',
                          padding: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Remove from saved"
                        title="Remove from Saved Jobs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-3) 0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} /> {job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={13} /> {job.salary}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} /> {job.experience}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={13} /> {job.type} ({job.mode})</span>
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {job.tags.slice(0, 4).map(skill => (
                          <span key={skill} style={{ background: 'var(--color-gray-100)', padding: '2px 8px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-gray-100)',
                    paddingTop: 'var(--space-3)'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                      {isApplied ? 'Applied • Ready for Interview' : 'Saved • Ready to Apply'}
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Link to={`/candidate/jobs/${job.id}`}>
                        <Button size="sm" variant="outline">
                          View Job
                        </Button>
                      </Link>
                      {isApplied ? (
                        <Button size="sm" variant="secondary" disabled style={{ opacity: 0.85, cursor: 'default' }}>
                          Applied
                        </Button>
                      ) : (
                        <Button size="sm" variant="primary" onClick={() => handleOpenApply(job)}>
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination UI */}
          {totalPages > 0 && (
            <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={PER_PAGE}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                itemName="saved jobs"
              />
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      {selectedJobToApply && (
        <ApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJobToApply}
        />
      )}
    </div>
  );
}
