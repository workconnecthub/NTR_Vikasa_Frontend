import { useState, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, GraduationCap,
  Loader2
} from 'lucide-react';
import { InternshipCard } from '../../components/ui/EntityCards';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import publicService from '../../services/publicService';
import {
  LOCATIONS,
  WORK_MODES,
  STIPEND_RANGES,
  INTERNSHIP_DURATIONS,
} from '../../data/mockData';

// ── Parse stipend range string -> { min, max } ───────────────────────────────
function parseStipenRange(rangeStr) {
  if (!rangeStr || rangeStr === 'All Stipends') return { min: null, max: null };
  if (rangeStr.includes('Unpaid')) return { min: 0, max: 0 };
  const nums = rangeStr.replace(/[₹,\s]/g, '').match(/\d+/g);
  if (!nums) return { min: null, max: null };
  if (rangeStr.includes('+')) return { min: parseInt(nums[0], 10), max: null };
  return { min: parseInt(nums[0], 10), max: parseInt(nums[1], 10) };
}

const PER_PAGE = 9;

export default function InternshipsPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [stipendRange, setStipendRange] = useState('');
  const [duration, setDuration] = useState('');
  const [page, setPage] = useState(1);

  // API state
  const [internships, setInternships] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInternships = useCallback(async (resetPage = false) => {
    const targetPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    setLoading(true);
    setError(null);

    const { min: stipendMin, max: stipendMax } = parseStipenRange(stipendRange);

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
        sort: 'latest',
      });

      const mapped = (res.items || []).map(i => ({
        id: i.internship_number || i.id,
        title: i.title,
        company: i.company_name || 'Employer',
        companyLogo: null,
        location: i.location || 'Bengaluru, Karnataka',
        duration: i.duration || '6 Months',
        stipend: i.stipend || (i.stipend_monthly ? `₹${i.stipend_monthly.toLocaleString('en-IN')} / month` : '₹15,000 / month'),
        mode: i.work_mode || 'Hybrid',
        deadline: 'Ongoing',
        tags: [i.work_mode, i.duration].filter(Boolean),
        skills: [],
        industry: 'Information Technology',
      }));

      setInternships(mapped);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('InternshipsPage fetch error:', err);
      setError('Failed to load internships. Please try again.');
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, location, workMode, stipendRange, duration]);

  // Fetch when page or filters change
  useEffect(() => {
    fetchInternships();
  }, [page, location, workMode, stipendRange, duration]); // eslint-disable-line

  const handleSearch = () => {
    fetchInternships(true);
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setWorkMode('');
    setStipendRange('');
    setDuration('');
    setPage(1);
  };

  const activeFiltersCount = [
    location && location !== 'All Locations',
    workMode && workMode !== 'All Modes',
    stipendRange && stipendRange !== 'All Stipends',
    duration && duration !== 'All Durations',
  ].filter(Boolean).length;

  return (
    <div className="internships-page" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-16)' }}>
      {/* Top Banner */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-8) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <div className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>
                <GraduationCap size={12} style={{ marginRight: 4 }} /> Campus & Trainee Programs
              </div>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Explore Paid Internships</h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                Launch your career with verified corporate internships, monthly stipends, and PPO opportunities
              </p>
            </div>
          </div>

          {/* Quick Filter Row */}
          <div className="responsive-filter-bar" style={{ marginTop: 'var(--space-6)' }}>
            <div className="input-wrapper">
              <span className="input-icon-left"><Search size={16} /></span>
              <input
                className="input has-icon-left"
                placeholder="Search internships by role, company, skill or stipend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div>
              <Select
                options={LOCATIONS}
                placeholder="Location"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <Select
                options={WORK_MODES}
                placeholder="Work Mode"
                value={workMode}
                onChange={(e) => { setWorkMode(e.target.value); setPage(1); }}
              />
            </div>

            <Button variant="primary" onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="responsive-split-sidebar">

          {/* ── Filters Sidebar ── */}
          <aside className="sticky-filter-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Internship Filters</h2>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', fontSize: 'var(--text-xs)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Stipend Filter */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'block' }}>
                Monthly Stipend
              </label>
              <Select
                options={STIPEND_RANGES}
                value={stipendRange}
                onChange={(e) => { setStipendRange(e.target.value); setPage(1); }}
              />
            </div>

            {/* Duration Filter */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'block' }}>
                Duration
              </label>
              <Select
                options={INTERNSHIP_DURATIONS}
                value={duration}
                onChange={(e) => { setDuration(e.target.value); setPage(1); }}
              />
            </div>

            {/* Work Mode Filter */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'block' }}>
                Work Mode
              </label>
              <Select
                options={WORK_MODES}
                value={workMode}
                onChange={(e) => { setWorkMode(e.target.value); setPage(1); }}
              />
            </div>
          </aside>

          {/* ── Main Results ── */}
          <main style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {loading
                  ? 'Loading internships...'
                  : <>Showing <strong style={{ color: 'var(--color-text)' }}>{total}</strong> available internships</>
                }
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <Loader2 size={36} style={{ color: 'var(--color-primary-500)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>Loading internship opportunities...</p>
              </div>
            ) : error ? (
              <EmptyState
                icon="default"
                title="Failed to load internships"
                description={error}
                action={<Button variant="primary" onClick={() => fetchInternships()}>Try Again</Button>}
              />
            ) : internships.length === 0 ? (
              <EmptyState
                icon="default"
                title="No internships match your filter criteria"
                description="Try lowering stipend requirements, clearing duration or switching location filters."
                action={<Button variant="primary" onClick={handleReset}>Clear All Filters</Button>}
              />
            ) : (
              <>
                <div className="responsive-card-grid">
                  {internships.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{ marginTop: 'var(--space-10)' }}>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      totalItems={total}
                      pageSize={PER_PAGE}
                      itemName="internships"
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
