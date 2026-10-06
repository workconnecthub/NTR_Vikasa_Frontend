import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Users, SlidersHorizontal, RotateCcw, Briefcase, Star, ExternalLink, CheckCircle2 } from 'lucide-react';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import publicService from '../../services/publicService';
import {
  INDUSTRIES,
  LOCATIONS,
  COMPANY_SIZES
} from '../../data/mockData';

const resolveLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CompaniesPage() {

  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [page, setPage] = useState(1);

  // Live backend verified companies
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const PER_PAGE = 8;

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await publicService.getPublishedCompanies({
        search: search.trim() || undefined,
        industry: industry && industry !== 'All Industries' ? industry : undefined,
        location: location && location !== 'All Locations' ? location : undefined,
        page,
        page_size: PER_PAGE,
      });

      const items = (res?.items || []).map(c => ({
        id: c.id,
        name: c.name || c.company_name,
        industry: c.industry || 'Information Technology',
        location: c.location || 'Bengaluru, Karnataka',
        size: c.size || c.company_size || '1000+ employees',
        employees: c.employees || c.company_size || '1000+',
        logo: c.logo_url || c.logo || c.company_logo_path,
        openJobsCount: c.open_jobs_count ?? c.openJobs ?? c.open_jobs ?? 0,
        description: c.description || c.tagline || '',
        tagline: c.tagline || c.description || '',
        rating: c.rating || null,
        verified: c.verified ?? true,
      }));

      // Filter by size if selected
      const filteredItems = size && size !== 'All Sizes'
        ? items.filter(c => {
            if (size.includes('1000+') && !c.size.includes('1000') && !c.size.includes('10000')) return false;
            if (size.includes('201-1000') && !c.size.includes('201-1000')) return false;
            if (size.includes('10000+') && !c.size.includes('10000')) return false;
            return true;
          })
        : items;

      setCompanies(filteredItems);
      setTotalCompanies(res?.total ?? items.length);
      const calculatedPages = res?.total_pages ?? (Math.ceil((res?.total || items.length) / PER_PAGE) || 1);
      setTotalPages(calculatedPages);
    } catch (err) {
      console.warn('CompaniesPage live companies error:', err);
      setLoadError('Failed to load verified companies.');
    } finally {
      setIsLoading(false);
    }
  }, [search, industry, location, size, page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleReset = () => {
    setSearch('');
    setIndustry('');
    setLocation('');
    setSize('');
    setPage(1);
  };

  const activeFilters = [
    industry && industry !== 'All Industries',
    location && location !== 'All Locations',
    size && size !== 'All Sizes'
  ].filter(Boolean).length;


  return (
    <div className="companies-page" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-16)' }}>
      {/* Top Banner */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ maxWidth: 700, marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Explore Top Employers & Workplaces</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--text-base)' }}>
              Research company cultures, benefits, employee reviews, and current job openings across India's leading organizations.
            </p>
          </div>

          {/* Search & Filter bar */}
          <div className="responsive-filter-bar">
            <div className="input-wrapper">
              <span className="input-icon-left"><Search size={16} /></span>
              <input
                className="input has-icon-left"
                placeholder="Search company by name, technology or keyword..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <Select
                options={INDUSTRIES}
                placeholder="All Industries"
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <Select
                options={LOCATIONS}
                placeholder="All Locations"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <Select
                options={COMPANY_SIZES}
                placeholder="Company Size"
                value={size}
                onChange={(e) => { setSize(e.target.value); setPage(1); }}
              />
            </div>

            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={14} />}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Company Grid */}
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Showing <strong style={{ color: 'var(--color-text)' }}>{totalCompanies}</strong> verified companies
          </p>
        </div>

        {isLoading ? (
          <div className="responsive-card-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="card"
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--space-6)',
                  minHeight: 280,
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
          <EmptyState
            icon="companies"
            title="Unable to load companies"
            description={loadError}
            action={<Button variant="primary" onClick={fetchCompanies}>Try Again</Button>}
          />
        ) : companies.length === 0 ? (
          <EmptyState
            icon="companies"
            title="No companies found"
            description="Try changing your industry filter, location or keyword query."
            action={<Button variant="primary" onClick={handleReset}>Clear Filters</Button>}
          />
        ) : (
          <>
            <div className="responsive-card-grid">
              {companies.map((company) => {
                const logoSrc = resolveLogoUrl(company.logo);

                return (
                  <div
                    key={company.id}
                    className="card card-hoverable"
                    style={{
                      borderRadius: 'var(--radius-2xl)',
                      padding: 'var(--space-6)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 'var(--space-4)'
                    }}
                  >
                    <div>
                      {/* Header: Logo + Rating */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                        <div style={{
                          width: 56,
                          height: 56,
                          borderRadius: 'var(--radius-xl)',
                          background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
                          color: '#fff',
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-sm)',
                          overflow: 'hidden'
                        }}>
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={company.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            company.name?.[0] || 'C'
                          )}
                        </div>
                        {company.rating ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--color-warning-50)',
                            color: 'var(--color-warning-700)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700
                          }}>
                            <Star size={13} fill="currentColor" /> {company.rating}
                          </div>
                        ) : null}
                      </div>

                      <Link to={`/companies/${company.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                            {company.name}
                          </h2>
                          {company.verified && (
                            <CheckCircle2 size={16} style={{ color: 'var(--color-success-600)' }} />
                          )}
                        </div>
                      </Link>

                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                        {company.industry}
                      </p>

                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        lineHeight: 'var(--leading-relaxed)',
                        marginBottom: 'var(--space-3)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {company.tagline || company.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} /> {company.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={13} /> {company.employees}
                        </span>
                      </div>
                    </div>

                    {/* Footer Stats & CTA */}
                    <div style={{
                      paddingTop: 'var(--space-4)',
                      borderTop: '1px solid var(--color-gray-100)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          color: 'var(--color-success-700)',
                          background: 'var(--color-success-50)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          {company.openJobsCount} Open Jobs
                        </span>
                      </div>
                      <Link to={`/companies/${company.id}`}>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && !isLoading && companies.length > 0 && (
              <div style={{ marginTop: 'var(--space-10)' }}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalCompanies}
                  pageSize={PER_PAGE}
                  itemName="companies"
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

