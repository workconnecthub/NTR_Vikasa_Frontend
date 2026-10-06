import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Building2, Users, CheckCircle2,
  Star, Briefcase, GraduationCap, ArrowRight, ShieldCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import publicService from '../../services/publicService';
import {
  INDUSTRIES
} from '../../data/mockData';

const resolveLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatSize = (s) => {
  if (!s) return '1,000+ employees';
  return s.toLowerCase().includes('employee') ? s : `${s} employees`;
};

export default function CandidateCompaniesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [page, setPage] = useState(1);

  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const PER_PAGE = 12;

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await publicService.getPublishedCompanies({
        search: search.trim() || undefined,
        industry: industry && industry !== 'All Industries' ? industry : undefined,
        page,
        page_size: PER_PAGE,
      });

      const items = res?.items || [];
      setCompanies(items);
      setTotalCompanies(res?.total ?? items.length);
      const calculatedPages = res?.total_pages ?? (Math.ceil((res?.total || items.length) / PER_PAGE) || 1);
      setTotalPages(calculatedPages);
    } catch (err) {
      console.error('CandidateCompaniesPage fetch error:', err);
      setLoadError('Failed to load verified companies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [search, industry, page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setIndustry('');
    setPage(1);
  };

  return (
    <div className="candidate-companies-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <ShieldCheck size={18} style={{ color: '#c7d2fe' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe' }}>
              Verified Employers & Hiring Partners
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
            Explore Top Hiring Companies
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: '#cbd5e1' }}>
            Discover company work cultures, tech stacks, active job openings, and internship opportunities across Andhra Pradesh and India.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: 'minmax(240px, 2fr) minmax(180px, 1fr) auto', gap: 'var(--space-2)', background: 'rgba(255,255,255,0.12)', padding: 'var(--space-2)', borderRadius: 'var(--radius-xl)' }}>
          <div className="input-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius-lg)' }}>
            <span className="input-icon-left"><Search size={16} style={{ color: 'var(--color-primary-600)' }} /></span>
            <input
              className="input has-icon-left"
              style={{ border: 'none', background: 'transparent' }}
              placeholder="Search companies by name or technology..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)' }}>
            <select
              className="select"
              style={{ border: 'none', background: 'transparent', height: '100%', width: '100%' }}
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
            >
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          <Button type="submit" variant="primary" style={{ background: 'var(--color-primary-500)' }}>
            Search
          </Button>
        </form>
      </div>

      {/* Companies Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>
            {totalCompanies} Verified Employers Hiring Now
          </h2>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="card"
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--space-6)',
                  border: '1px solid var(--color-border)',
                  minHeight: 260,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="spinner" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)' }}>
            <EmptyState
              icon="companies"
              title="Unable to load companies"
              description={loadError}
              action={<Button variant="primary" onClick={fetchCompanies}>Try Again</Button>}
            />
          </div>
        ) : companies.length === 0 ? (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)' }}>
            <EmptyState
              icon="companies"
              title="No verified companies found matching your search or industry."
              description="Try clearing your search query or choosing another industry."
              action={<Button variant="primary" onClick={handleResetFilters}>Clear Filters</Button>}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {companies.map((company) => {
              const companyName = company.name || company.company_name;
              const logoSrc = resolveLogoUrl(company.logo || company.logo_url || company.company_logo_path);
              const openJobsCount = company.open_jobs_count ?? company.openJobs ?? company.open_jobs ?? 0;
              const employeesText = formatSize(company.company_size || company.employees || company.size);

              return (
                <div
                  key={company.id}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                        color: '#fff',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={companyName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          companyName?.[0] || 'C'
                        )}
                      </div>

                      {company.rating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-warning-50)', color: 'var(--color-warning-700)', padding: '3px 8px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700 }}>
                          <Star size={12} fill="currentColor" /> {company.rating}
                        </div>
                      ) : null}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)' }}>
                        {companyName}
                      </h3>
                      {company.verified && (
                        <CheckCircle2 size={14} style={{ color: 'var(--color-success-600)' }} />
                      )}
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, marginTop: 2 }}>
                      {company.industry}
                    </p>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {company.tagline || company.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} /> {company.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={13} /> {employeesText}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-success-700)',
                      background: 'var(--color-success-50)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      {openJobsCount} Open Jobs
                    </span>

                    <Link to={`/candidate/jobs?company=${encodeURIComponent(companyName)}`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight size={13} />}>
                        View Jobs
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && !isLoading && companies.length > 0 && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Pagination currentPage={page} totalPages={totalPages} totalItems={totalCompanies} pageSize={PER_PAGE} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

