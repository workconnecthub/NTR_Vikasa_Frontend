import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Briefcase, Banknote, Clock, Building2,
  Bookmark, BookmarkCheck, CheckCircle2, SlidersHorizontal,
  RotateCcw, Sparkles, Filter, ChevronRight, Zap, ArrowRight,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ApplyModal from '../../components/ui/ApplyModal';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import publicService from '../../services/publicService';
import {
  LOCATIONS,
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  SALARY_RANGES,
  INDUSTRIES,
  SKILL_OPTIONS
} from '../../data/mockData';
import { formatJobId } from '../../utils/applicationUtils';

const POPULAR_SEARCHES = ['React Developer', 'Python FastAPI', 'Fullstack Engineer', 'Data Analyst', 'DevOps', 'UI/UX Designer'];

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Posted recently';
  try {
    const cleanStr = String(dateStr).replace(' ', 'T');
    const date = new Date(cleanStr);
    const now = new Date();
    const diffMs = now - date;
    if (isNaN(diffMs)) return 'Posted recently';
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays > 30) return `Posted ${Math.floor(diffDays / 30)}mo ago`;
    if (diffDays > 0) return `Posted ${diffDays}d ago`;
    if (diffHrs > 0) return `Posted ${diffHrs}h ago`;
    return 'Posted today';
  } catch {
    return 'Posted recently';
  }
}

export default function CandidateJobsPage() {
  const { candidate, isJobSaved, saveJob, unsaveJob } = useCandidate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Search & Filter State
  const initialCompany = searchParams.get('company') || searchParams.get('company_name') || searchParams.get('search') || '';
  const [search, setSearch] = useState(initialCompany);

  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  // Backend Data State
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  const PER_PAGE = 9;

  // Real Backend Fetch
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await publicService.getPublishedJobs({
        search: search.trim() || undefined,
        location: location && location !== 'All Locations' ? location : undefined,
        experience_level: experience && experience !== 'All Experience' ? experience : undefined,
        salary_range: salary && salary !== 'All Salaries' ? salary : undefined,
        employment_type: jobType && jobType !== 'All Types' ? jobType : undefined,
        work_mode: workMode && workMode !== 'All Modes' ? workMode : undefined,
        industry_sector: industry && industry !== 'All Industries' ? industry : undefined,
        required_skill: selectedSkill && selectedSkill !== 'All Skills' ? selectedSkill : undefined,
        sort: sortBy,
        page,
        page_size: PER_PAGE,
      });

      const fetchedItems = res?.items || [];
      setJobs(fetchedItems);
      setTotalJobs(res?.total ?? fetchedItems.length);
      const calcPages = res?.total_pages ?? (Math.ceil((res?.total || fetchedItems.length) / PER_PAGE) || 1);
      setTotalPages(calcPages);
    } catch (err) {
      console.error('Error loading published jobs:', err);
      setLoadError('Failed to load published jobs from the database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, location, experience, salary, jobType, workMode, industry, selectedSkill, sortBy, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const q = searchParams.get('company') || searchParams.get('company_name') || searchParams.get('search');
    if (q) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);


  const handleOpenApply = (job) => {
    setSelectedJobForApply(job);
    setApplyModalOpen(true);
  };

  const handleAppliedSuccess = (appliedJob) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === appliedJob.id || j.job_id === appliedJob.job_id || j.job_number === appliedJob.job_number
          ? { ...j, has_applied: true }
          : j
      )
    );
  };

  const handleToggleSave = (job) => {
    const jobId = job.job_id || job.id;
    const isCurrentlySaved = isJobSaved(jobId) || job.is_saved;
    if (isCurrentlySaved) {
      unsaveJob(jobId);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id || j.job_id === jobId ? { ...j, is_saved: false } : j
        )
      );
      toast({ type: 'info', title: 'Removed from Saved', message: 'Job has been removed from your saved list.' });
    } else {
      saveJob(jobId, job);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id || j.job_id === jobId ? { ...j, is_saved: true } : j
        )
      );
      toast({ type: 'success', title: 'Job Saved', message: 'Job bookmarked to your Saved Jobs workspace.' });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setExperience('');
    setSalary('');
    setJobType('');
    setWorkMode('');
    setIndustry('');
    setSelectedSkill('');
    setSortBy('relevance');
    setPage(1);
  };

  const activeFiltersCount = [
    location && location !== 'All Locations',
    experience && experience !== 'All Experience',
    salary && salary !== 'All Salaries',
    jobType && jobType !== 'All Types',
    workMode && workMode !== 'All Modes',
    industry && industry !== 'All Industries',
    selectedSkill && selectedSkill !== 'All Skills'
  ].filter(Boolean).length;

  const handlePageChange = (p) => {
    setPage(p);
    const resultsPane = document.querySelector('.candidate-results-pane');
    if (resultsPane) {
      resultsPane.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="candidate-jobs-page">
      
      {/* ── Two-Column Layout: Stationary Left Filter + Dedicated Scrolling Right Results ── */}
      <div className="candidate-find-jobs-layout">

        {/* ── Left Stationary Filter Panel ── */}
        <aside className="candidate-filter-pane">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Filter size={16} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Filter Jobs</h2>
              </div>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  border: '1px solid var(--color-primary-200)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px'
                }}>
                  {activeFiltersCount} active
                </span>
              )}
            </div>

            {/* Experience */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Experience Level
              </label>
              <Select
                options={EXPERIENCE_LEVELS}
                value={experience}
                onChange={(e) => { setExperience(e.target.value); setPage(1); }}
              />
            </div>

            {/* Salary */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Salary Range
              </label>
              <Select
                options={SALARY_RANGES}
                value={salary}
                onChange={(e) => { setSalary(e.target.value); setPage(1); }}
              />
            </div>

            {/* Work Mode */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Work Mode
              </label>
              <Select
                options={WORK_MODES}
                value={workMode}
                onChange={(e) => { setWorkMode(e.target.value); setPage(1); }}
              />
            </div>

            {/* Job Type */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Employment Type
              </label>
              <Select
                options={JOB_TYPES}
                value={jobType}
                onChange={(e) => { setJobType(e.target.value); setPage(1); }}
              />
            </div>

            {/* Key Skill */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Required Skill
              </label>
              <Select
                options={['All Skills', ...SKILL_OPTIONS]}
                value={selectedSkill}
                onChange={(e) => { setSelectedSkill(e.target.value === 'All Skills' ? '' : e.target.value); setPage(1); }}
              />
            </div>

            {/* Industry */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Industry Sector
              </label>
              <Select
                options={INDUSTRIES}
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Bottom Area: Reset Filters Action */}
          <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={activeFiltersCount === 0 && !search && !location}
              style={{
                width: '100%',
                fontSize: '0.78rem',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                color: activeFiltersCount > 0 || search || location ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                borderColor: activeFiltersCount > 0 || search || location ? 'var(--color-primary-300)' : 'var(--color-border)'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </Button>
          </div>
        </aside>

        {/* ── Right Column: The Dedicated Scrolling Container ── */}
        <main className="candidate-results-pane">
          
          {/* Top Search Card in Right Column */}
          <div
            className="card"
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '1.1rem 1.25rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', border: '1px solid rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <Sparkles size={11} /> AI Job Match for {candidate.name}
                </div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                  Find Your Next Career Opportunity
                </h1>
              </div>
            </div>

            {/* Search Inputs */}
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); fetchJobs(); }}
              className="candidate-search-grid"
            >
              <div className="input-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius-md)' }}>
                <span className="input-icon-left"><Search size={15} style={{ color: 'var(--color-primary-600)' }} /></span>
                <input
                  className="input has-icon-left"
                  style={{ border: 'none', background: 'transparent', height: '36px', fontSize: '0.85rem' }}
                  placeholder="Job title, skills (React, Python), or company..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)' }}>
                <select
                  className="select"
                  style={{ border: 'none', background: 'transparent', height: '36px', width: '100%', fontSize: '0.85rem' }}
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                >
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                style={{ background: 'var(--color-primary-500)', borderColor: 'var(--color-primary-400)', height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}
              >
                Search
              </Button>
            </form>

            {/* Popular Search Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem', fontSize: '0.72rem', maxWidth: '100%' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => { setSearch(term); setPage(1); }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#e0e7ff',
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header with Count and Sort */}
          <div className="candidate-results-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0 }}>
                {totalJobs} Jobs Found
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                Showing page {page} of {totalPages || 1} • Sorted by best match for your profile
              </p>
            </div>

            <div className="candidate-sort-container">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sort by:</span>
              <select
                className="select"
                style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', width: 'auto', height: '34px' }}
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              >
                <option value="relevance">Relevance / Best Match</option>
                <option value="latest">Latest Posted</option>
                <option value="salaryHigh">Salary: High to Low</option>
                <option value="salaryLow">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {loadError && (
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: '1rem', border: '1px solid var(--color-danger-200)', background: 'var(--color-danger-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger-700)', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{loadError}</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchJobs} style={{ height: '30px', fontSize: '0.75rem' }}>
                Retry
              </Button>
            </div>
          )}

          {/* Loading Skeleton State */}
          {isLoading ? (
            <div className="recruiter-jobs-grid">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="card recruiter-job-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    gap: '0.65rem',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-gray-200)',
                    background: '#fff',
                    minHeight: '260px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-gray-200)', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 14, width: '70%', background: 'var(--color-gray-200)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                        <div style={{ height: 10, width: '40%', background: 'var(--color-gray-100)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                      </div>
                    </div>
                    <div style={{ height: 26, background: 'var(--color-gray-100)', borderRadius: 6, marginBottom: '0.6rem', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 12, width: '80%', background: 'var(--color-gray-100)', borderRadius: 4, marginBottom: 4, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 12, width: '60%', background: 'var(--color-gray-100)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: '0.5rem' }}>
                    <div style={{ height: 28, background: 'var(--color-gray-200)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)' }}>
              <EmptyState
                icon="default"
                title="No jobs found matching your criteria"
                description="Try clearing your search query or broadening your experience and location filters."
                action={<Button variant="primary" onClick={handleResetFilters}>Reset All Filters</Button>}
              />
            </div>
          ) : (
            <div className="recruiter-jobs-grid">
              {jobs.map((job) => {
                const jobId = job.job_id || job.id;
                const isSaved = isJobSaved(jobId) || job.is_saved;
                const companyName = job.company_name || job.company?.name || job.company || 'Employer';
                const companyInitial = companyName?.[0]?.toUpperCase() || 'C';
                const formattedId = formatJobId(job.job_number || job.job_id || job.id);
                const displaySalary = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min >= 100000 ? (job.salary_min / 100000) : job.salary_min} - ₹${job.salary_max >= 100000 ? (job.salary_max / 100000) : job.salary_max} LPA` : 'Competitive');
                const displayType = job.employment_type || job.job_type || job.type || 'Full-time';
                const displayMode = job.work_mode || job.workMode || job.mode || 'Hybrid';
                const skillsList = job.skills || job.tags || [];

                return (
                  <div
                    key={job.id}
                    className="card recruiter-job-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      gap: '0.65rem',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--color-gray-200)',
                      background: '#fff',
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Header: Company Avatar + Title + Company Name + Verified + Bookmark */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.45rem', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', minWidth: 0 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {companyInitial}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <Link
                              to={`/candidate/jobs/${job.job_id || job.id}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <h3
                                title={job.title}
                                style={{
                                  fontSize: '0.92rem',
                                  fontWeight: 700,
                                  color: 'var(--color-gray-900)',
                                  margin: 0,
                                  lineHeight: 1.25,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {job.title}
                              </h3>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 2 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {companyName}
                              </span>
                              <CheckCircle2 size={11} style={{ color: 'var(--color-success-600)', flexShrink: 0 }} />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSave(job)}
                          style={{
                            background: isSaved ? 'var(--color-primary-50)' : 'transparent',
                            border: isSaved ? '1px solid var(--color-primary-200)' : '1px solid var(--color-gray-200)',
                            color: isSaved ? 'var(--color-primary-600)' : 'var(--color-gray-400)',
                            borderRadius: 'var(--radius-md)',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                          aria-label={isSaved ? 'Unsave job' : 'Save job'}
                        >
                          {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        </button>
                      </div>

                      {/* Match Score & Status Badge Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.35rem',
                        flexWrap: 'wrap',
                        background: 'var(--color-gray-50)',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-gray-200)',
                        marginBottom: '0.45rem'
                      }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            color: 'var(--color-primary-700)',
                            background: 'var(--color-primary-50)',
                            border: '1px solid var(--color-primary-200)',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '4px'
                          }}>
                            {formattedId}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            <CheckCircle2 size={11} style={{ color: 'var(--color-success-600)' }} /> Verified Employer
                          </span>
                        </div>
                        {job.match_score && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            background: job.match_score >= 90 ? '#ecfdf5' : '#eef2ff',
                            color: job.match_score >= 90 ? '#059669' : 'var(--color-primary-700)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.08rem 0.35rem',
                            borderRadius: '10px',
                            border: `1px solid ${job.match_score >= 90 ? '#a7f3d0' : '#c7d2fe'}`,
                            flexShrink: 0
                          }}>
                            <Zap size={10} fill="currentColor" />
                            {job.match_score}% Match
                          </span>
                        )}
                      </div>

                      {/* Metadata: Location, Salary, Experience, Mode */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <MapPin size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{job.location}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--color-gray-800)', flexShrink: 0 }}>
                            <Banknote size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{displaySalary}</span>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', flexWrap: 'wrap', color: 'var(--color-gray-500)', fontSize: '0.72rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Clock size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{job.experience || job.experience_level}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            <Briefcase size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{displayType} ({displayMode})</span>
                          </span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      {skillsList && skillsList.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.4rem', minHeight: '20px' }}>
                          {skillsList.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'var(--color-gray-100)',
                                color: 'var(--color-gray-700)',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 500
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {skillsList.length > 3 && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
                              +{skillsList.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer: Posted Date + View Job & Apply Buttons */}
                    <div style={{
                      borderTop: '1px solid var(--color-gray-100)',
                      paddingTop: '0.5rem',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)' }}>
                          {formatRelativeTime(job.posted_at || job.created_at)} • Active hiring
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.35rem' }}>
                        <Link to={`/candidate/jobs/${job.job_id || job.id}`} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="outline" style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.4rem', height: '30px' }}>
                            View Job
                          </Button>
                        </Link>
                        {job.has_applied ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            style={{
                              width: '100%',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.4rem',
                              height: '30px',
                              background: '#ecfdf5',
                              color: '#059669',
                              borderColor: '#a7f3d0',
                              cursor: 'default',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={12} /> Applied
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenApply(job)}
                            style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.4rem', height: '30px' }}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalJobs}
                pageSize={PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>

      {/* Reusable Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJobForApply}
          onAppliedSuccess={handleAppliedSuccess}
        />
      )}
    </div>
  );
}
