import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Briefcase, Banknote, Clock,
  GraduationCap, RotateCcw, CheckCircle2, Bookmark, BookmarkCheck,
  Filter, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ApplyModal from '../../components/ui/ApplyModal';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import {
  LOCATIONS,
  WORK_MODES,
  STIPEND_RANGES,
  INTERNSHIP_DURATIONS,
  SKILL_OPTIONS
} from '../../data/mockData';
import { formatInternshipId } from '../../utils/applicationUtils';
import publicService from '../../services/publicService';

// ── Stipend range string -> { min, max } ────────────────────────────────────
function parseStipenRange(rangeStr) {
  if (!rangeStr || rangeStr === 'All Stipends') return { min: null, max: null };
  if (rangeStr.includes('Unpaid')) return { min: 0, max: 0 };
  // e.g. "₹5,000 - ₹10,000 / mo"
  const nums = rangeStr.replace(/[₹,\s]/g, '').match(/\d+/g);
  if (!nums) return { min: null, max: null };
  if (rangeStr.includes('+')) return { min: parseInt(nums[0], 10), max: null };
  return { min: parseInt(nums[0], 10), max: parseInt(nums[1], 10) };
}

const PER_PAGE = 9;

export default function CandidateInternshipsPage() {
  const { isJobSaved, saveJob, unsaveJob } = useCandidate();
  const { toast } = useToast();

  // ── Filters (server-side) ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [stipendRange, setStipendRange] = useState('');
  const [duration, setDuration] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);

  // ── API state ──────────────────────────────────────────────────────────────
  const [internships, setInternships] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Apply modal ────────────────────────────────────────────────────────────
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState(null);

  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // ── Fetch from backend ─────────────────────────────────────────────────────
  const fetchInternships = useCallback(async (resetPage = false) => {
    const targetPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    setLoading(true);
    setError(null);

    const { min: stipendMin, max: stipendMax } = parseStipenRange(stipendRange);

    // Map sortBy UI values to backend sort values
    const sortMap = {
      latest: 'latest',
      stipendHigh: 'stipend_high',
      stipendLow: 'stipend_low',
    };

    try {
      const res = await publicService.getPublishedInternships({
        page: targetPage,
        page_size: PER_PAGE,
        search: search.trim() || undefined,
        location: location && location !== 'All Locations' ? location : undefined,
        mode: workMode && workMode !== 'All Modes' ? workMode : undefined,
        duration: duration && duration !== 'All Durations' ? duration : undefined,
        stipend_min: stipendMin,
        stipend_max: stipendMax,
        sort: sortMap[sortBy] || 'latest',
      });

      const mapped = (res.items || []).map(i => ({
        id: i.id,
        internship_number: i.internship_number,
        title: i.title,
        company: i.company_name || 'Employer',
        company_id: i.company_id,
        location: i.location || 'Bengaluru, Karnataka',
        duration: i.duration || '6 Months',
        stipend: i.stipend || (i.stipend_monthly ? `₹${i.stipend_monthly.toLocaleString('en-IN')} / month` : '₹15,000 / month'),
        stipendAmount: i.stipend_monthly || 15000,
        mode: i.work_mode || 'Hybrid',
        deadline: i.published_at ? null : null,
        postedOn: i.postedOn || i.created_at,
        description: i.description,
        skills: [],
        isNew: !!i.published_at && (Date.now() - new Date(i.published_at).getTime()) < 7 * 24 * 60 * 60 * 1000,
        isFeatured: false,
      }));

      setInternships(mapped);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('CandidateInternshipsPage fetch error:', err);
      setError('Failed to load internships. Please try again.');
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, location, workMode, stipendRange, duration, sortBy]);

  // Fetch on filter/page change
  useEffect(() => {
    fetchInternships();
  }, [page, location, workMode, stipendRange, duration, sortBy]); // eslint-disable-line

  // Reset page when search text changes (debounced trigger via button or Enter)
  const handleSearch = () => {
    fetchInternships(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenApply = (internship) => {
    setSelectedInternshipForApply({
      ...internship,
      salary: internship.stipend,
    });
    setApplyModalOpen(true);
  };

  const handleToggleSave = (id) => {
    if (isJobSaved(id)) {
      unsaveJob(id);
      toast({ type: 'info', title: 'Removed', message: 'Internship removed from saved list.' });
    } else {
      saveJob(id);
      toast({ type: 'success', title: 'Saved', message: 'Internship saved to your list.' });
    }
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setWorkMode('');
    setStipendRange('');
    setDuration('');
    setSortBy('latest');
    setPage(1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    if (resultsRef.current) {
      resultsRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeFiltersCount = [
    location && location !== 'All Locations',
    workMode && workMode !== 'All Modes',
    stipendRange && stipendRange !== 'All Stipends',
    duration && duration !== 'All Durations',
  ].filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="candidate-internships-page">
      
      {/* ── Main Split Layout: Filters on Left, Internships on Right ── */}
      <div className="candidate-find-jobs-layout">
        
        {/* Filters Sidebar (Left Stationary - Full Panel Height) */}
        <aside className="candidate-filter-pane">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Filter size={16} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Filter Internships</h2>
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

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Monthly Stipend
              </label>
              <Select options={STIPEND_RANGES} value={stipendRange} onChange={(e) => { setStipendRange(e.target.value); setPage(1); }} />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Duration
              </label>
              <Select options={INTERNSHIP_DURATIONS} value={duration} onChange={(e) => { setDuration(e.target.value); setPage(1); }} />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                Work Mode
              </label>
              <Select options={WORK_MODES} value={workMode} onChange={(e) => { setWorkMode(e.target.value); setPage(1); }} />
            </div>
          </div>

          {/* Bottom Area: Reset Filters Action */}
          <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
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

        {/* Results (Right Column Dedicated Scroll Container) */}
        <main className="candidate-results-pane" ref={resultsRef}>
          
          {/* Header Banner */}
          <div
            className="card"
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '1.1rem 1.25rem',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
              color: '#fff'
            }}
          >
            <div style={{ maxWidth: 700, marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '0.25rem' }}>
                <GraduationCap size={16} style={{ color: '#c7d2fe' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe' }}>
                  Campus & Early Career Programs
                </span>
              </div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                Explore Verified Paid Internships
              </h1>
            </div>

            {/* Quick Search */}
            <div className="candidate-search-grid">
              <div className="input-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius-md)' }}>
                <span className="input-icon-left"><Search size={15} style={{ color: 'var(--color-primary-600)' }} /></span>
                <input
                  ref={searchInputRef}
                  className="input has-icon-left"
                  style={{ border: 'none', background: 'transparent', height: '36px', fontSize: '0.85rem' }}
                  placeholder="Search by role, company, or key skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                variant="primary"
                style={{ background: 'var(--color-primary-500)', height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Results Header with Count and Sort */}
          <div className="candidate-results-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0 }}>
                {loading ? 'Loading...' : `${total} Internships Found`}
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                {loading ? 'Fetching internships...' : `Showing page ${page} of ${totalPages || 1} • Verified paid internships with stipends & PPO`}
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
                <option value="latest">Latest Posted</option>
                <option value="stipendHigh">Stipend: High to Low</option>
                <option value="stipendLow">Stipend: Low to High</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)', textAlign: 'center' }}>
              <Loader2 size={32} style={{ color: 'var(--color-primary-500)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading internship opportunities...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)' }}>
              <EmptyState
                icon="default"
                title="Failed to load internships"
                description={error}
                action={<Button variant="primary" onClick={() => fetchInternships()}>Try Again</Button>}
              />
            </div>
          ) : internships.length === 0 ? (
            /* Empty State */
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)' }}>
              <EmptyState
                icon="default"
                title="No internships found matching your criteria"
                description="Try clearing your search query or broadening your stipend and duration filters."
                action={<Button variant="primary" onClick={handleReset}>Clear All Filters</Button>}
              />
            </div>
          ) : (
            <div className="recruiter-jobs-grid">
              {internships.map((item) => {
                const isSaved = isJobSaved(item.id);
                return (
                  <div
                    key={item.id}
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
                      {/* Header: Company Avatar + Title + Badges + Save */}
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
                            {item.company?.[0] || 'I'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <Link
                              to={`/internships/${item.internship_number || item.id}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <h3
                                title={item.title}
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
                                {item.title}
                              </h3>
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 2 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.company}
                              </span>
                              <CheckCircle2 size={11} style={{ color: 'var(--color-success-600)', flexShrink: 0 }} />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSave(item.id)}
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
                          aria-label={isSaved ? 'Unsave internship' : 'Save internship'}
                        >
                          {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        </button>
                      </div>

                      {/* Status / Feature Badges */}
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
                            {item.internship_number || formatInternshipId(item.id)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            <CheckCircle2 size={11} style={{ color: 'var(--color-success-600)' }} /> Verified Employer
                          </span>
                        </div>
                        {item.isFeatured && (
                          <span style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '10px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            flexShrink: 0
                          }}>
                            Featured
                          </span>
                        )}
                        {item.isNew && !item.isFeatured && (
                          <span style={{
                            background: '#eef2ff',
                            color: 'var(--color-primary-700)',
                            border: '1px solid #c7d2fe',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '10px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            flexShrink: 0
                          }}>
                            New
                          </span>
                        )}
                      </div>

                      {/* Metadata: Location, Stipend, Duration, Mode */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <MapPin size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{item.location}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--color-gray-800)', flexShrink: 0 }}>
                            <Banknote size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{item.stipend?.includes('/mo') || item.stipend?.includes('/month') ? item.stipend : `${item.stipend || '₹15,000'}/month`}</span>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', flexWrap: 'wrap', color: 'var(--color-gray-500)', fontSize: '0.72rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Clock size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>{item.duration}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Briefcase size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                            <span>Internship ({item.mode})</span>
                          </span>
                        </div>
                      </div>

                      {/* Skills Tags (shown when available) */}
                      {item.skills && item.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.4rem', minHeight: '20px' }}>
                          {item.skills.slice(0, 3).map((skill, idx) => (
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
                          {item.skills.length > 3 && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
                              +{item.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer: Posted Date + View & Apply Buttons */}
                    <div style={{
                      borderTop: '1px solid var(--color-gray-100)',
                      paddingTop: '0.5rem',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-500)' }}>
                          {item.postedOn
                            ? `Posted ${new Date(item.postedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                            : 'Recently posted'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.35rem' }}>
                        <Link to={`/internships/${item.internship_number || item.id}`} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="outline" style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.4rem', height: '30px' }}>
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenApply(item)}
                          style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.4rem', height: '30px' }}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>

      {/* Reusable Apply Modal */}
      {selectedInternshipForApply && (
        <ApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedInternshipForApply}
        />
      )}
    </div>
  );
}
