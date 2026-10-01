import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, MapPin, Building2, Users, Search,
  Clock, ArrowRight, CheckCircle2, Sparkles, Filter,
  Eye, Download
} from 'lucide-react';
import { Tabs, TabsList, Tab, TabPanel } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import JobMelaPosterModal, { downloadPosterImage } from '../../components/ui/JobMelaPosterModal';
import { MOCK_JOB_MELAS } from '../../data/mockData';
import { useAdmin, DEFAULT_JOB_MELA_CONTENT } from '../../context/AdminContext';

export default function JobMelasPage() {
  const { jobMelaContent, jobMelas = [], getMelaStats } = useAdmin();
  const currentContent = jobMelaContent || DEFAULT_JOB_MELA_CONTENT;
  const hero = currentContent.hero || DEFAULT_JOB_MELA_CONTENT.hero;

  const [activeTab, setActiveTab] = useState('upcoming');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPosterMela, setSelectedPosterMela] = useState(null);

  // Combine live admin jobMelas with fallback to mock data
  const allMelas = useMemo(() => {
    return jobMelas && jobMelas.length > 0 ? jobMelas : MOCK_JOB_MELAS;
  }, [jobMelas]);

  // Dynamic unique cities list from all melas
  const uniqueCities = useMemo(() => {
    const set = new Set();
    allMelas.forEach(m => {
      if (m.city) set.add(m.city.trim());
    });
    return Array.from(set);
  }, [allMelas]);

  // Reset pagination to page 1 whenever tab, search, or city filter changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, cityFilter]);

  const upcomingMelas = useMemo(() => {
    return allMelas.filter(m => m.status === 'UPCOMING' || m.status === 'APPROVED' || m.status === 'REGISTRATION_OPEN');
  }, [allMelas]);

  const ongoingMelas = useMemo(() => {
    return allMelas.filter(m => m.status === 'ONGOING' || m.status === 'ACTIVE');
  }, [allMelas]);

  const completedMelas = useMemo(() => {
    return allMelas.filter(m => m.status === 'COMPLETED' || m.status === 'CONCLUDED');
  }, [allMelas]);

  const getFilteredList = (list) => {
    return list.filter(m => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (m.title || m.event || '').toLowerCase().includes(q);
        const matchCity = (m.city || '').toLowerCase().includes(q);
        const matchVenue = (m.venue || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchVenue) return false;
      }
      if (cityFilter && (m.city || '').toLowerCase() !== cityFilter.toLowerCase()) return false;
      return true;
    });
  };

  const currentList = useMemo(() => {
    if (activeTab === 'ongoing') return getFilteredList(ongoingMelas);
    if (activeTab === 'completed') return getFilteredList(completedMelas);
    return getFilteredList(upcomingMelas);
  }, [activeTab, search, cityFilter, upcomingMelas, ongoingMelas, completedMelas]);

  const PER_PAGE = 6;
  const totalPages = Math.ceil(currentList.length / PER_PAGE);
  const paginatedList = currentList.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="job-melas-page" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-16)' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: 'var(--space-12) 0',
      }}>
        <div className="container">
          <div style={{ maxWidth: 760 }}>
            <div className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 'var(--space-3)' }}>
              <CalendarDays size={12} style={{ marginRight: 4 }} /> {hero.badge || 'Nationwide Recruitment Drives'}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: '#ffffff' }}>
              {hero.heading || 'Mega Job Melas & Career Fairs'}
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: '#cbd5e1', lineHeight: 'var(--leading-relaxed)' }}>
              {hero.description || 'Attend on-ground walk-in interview sessions with 100+ hiring companies, receive free career guidance, and get spot job offer letters. Free registration for all job seekers.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content & Tabs */}
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, maxWidth: 540 }}>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <span className="input-icon-left"><Search size={16} /></span>
              <input
                className="input has-icon-left"
                placeholder="Search job mela by title, city, or venue..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select
              className="select"
              style={{ width: 170 }}
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs: Upcoming, Ongoing, Completed */}
        <Tabs defaultTab="upcoming" value={activeTab} onChange={(tab) => { setActiveTab(tab); setPage(1); }}>
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <TabsList>
              <Tab value="upcoming" badge={upcomingMelas.length}>
                Upcoming Events
              </Tab>
              <Tab value="ongoing" badge={ongoingMelas.length}>
                Ongoing Today
              </Tab>
              <Tab value="completed" badge={completedMelas.length}>
                Past & Concluded
              </Tab>
            </TabsList>
          </div>

          {currentList.length === 0 ? (
            <EmptyState
              icon="default"
              title={`No ${activeTab} job melas found`}
              description="Check back soon for new announcements or try clearing your search and city filters."
              action={
                <Button variant="primary" onClick={() => { setSearch(''); setCityFilter(''); setPage(1); }}>
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
                {paginatedList.map((mela) => {
                  const stats = getMelaStats ? getMelaStats(mela.id) : null;
                  const companiesCount = (mela.participatingCompanies && mela.participatingCompanies.length) || mela.companiesCount || mela.companies || 0;
                  const appliedCandidatesCount = stats ? stats.uniqueAppliedCandidatesCount : (mela.registeredCandidatesCount || 0);

                  let dateDisplay = mela.date;
                  try {
                    const parsed = new Date(mela.date);
                    if (!isNaN(parsed.getTime())) {
                      dateDisplay = parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    }
                  } catch {
                    dateDisplay = mela.date;
                  }

                  const posterImage = mela.posterImage || mela.banner || mela.image || '/hero2.jpg';

                  return (
                    <div
                      key={mela.id}
                      className="card card-hoverable"
                      style={{
                        borderRadius: 'var(--radius-2xl)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {/* Official Poster / Flyer Display */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '190px',
                          background: '#090d16',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPosterMela(mela);
                        }}
                        title="Click to view full official flyer / poster and download"
                      >
                        <img
                          src={posterImage}
                          alt={mela.title || mela.event}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 250ms ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        />
                        {/* Floating Date & Status Badges */}
                        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
                          <span style={{
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(6px)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <CalendarDays size={12} style={{ color: '#38bdf8' }} /> {dateDisplay}
                          </span>
                        </div>
                        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                          <StatusBadge status={mela.status} size="sm" />
                        </div>

                        {/* Bottom translucent preview overlay pill */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: 'rgba(15, 23, 42, 0.82)',
                            backdropFilter: 'blur(6px)',
                            borderRadius: 'var(--radius-md)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={12} style={{ color: '#38bdf8' }} /> Click to View Poster
                          </span>
                          <button
                            type="button"
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              downloadPosterImage(posterImage, mela.title || mela.event);
                            }}
                            title="Download this poster"
                          >
                            <Download size={11} /> Download
                          </button>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <Link to={`/job-melas/${mela.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, lineHeight: 1.3 }}>
                            {mela.title || mela.event}
                          </h2>
                        </Link>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={14} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                            <span>{mela.venue || mela.address}, <strong>{mela.city}</strong></span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={14} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                            <span>{mela.time || '09:00 AM - 05:00 PM'}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={14} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                            <span><strong>{companiesCount} Companies</strong> Participating</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                            <span><strong>{appliedCandidatesCount} Unique Candidates</strong> Applied</span>
                          </span>
                        </div>

                        <p style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          lineHeight: 'var(--leading-relaxed)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginTop: 'var(--space-1)'
                        }}>
                          {mela.description}
                        </p>
                      </div>

                      {/* Footer CTA & Seats Status */}
                      <div style={{
                        padding: 'var(--space-4) var(--space-6)',
                        background: 'var(--color-gray-50)',
                        borderTop: '1px solid var(--color-gray-100)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          {mela.seats ? (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                              <strong>{Math.max(0, mela.seats - appliedCandidatesCount)}</strong> seats remaining
                            </p>
                          ) : (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', fontWeight: 600, margin: 0 }}>
                              Open Walk-in
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Eye size={13} />}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedPosterMela(mela);
                            }}
                            title="View full official flyer"
                          >
                            Poster
                          </Button>
                          <Link to={`/job-melas/${mela.id}`} style={{ textDecoration: 'none' }}>
                            <Button
                              size="sm"
                              variant={mela.status === 'COMPLETED' ? 'secondary' : 'primary'}
                              rightIcon={<ArrowRight size={14} />}
                            >
                              {mela.status === 'COMPLETED' ? 'View Summary' : 'View Details & Register'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div style={{ marginTop: 'var(--space-10)' }}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={currentList.length}
                    pageSize={PER_PAGE}
                    itemName="job melas"
                    onPageChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Tabs>
      </div>

      {/* Full Resolution Poster Lightbox Modal */}
      {selectedPosterMela && (
        <JobMelaPosterModal
          isOpen={Boolean(selectedPosterMela)}
          onClose={() => setSelectedPosterMela(null)}
          posterUrl={selectedPosterMela.posterImage || selectedPosterMela.banner || selectedPosterMela.image || '/hero2.jpg'}
          eventTitle={selectedPosterMela.title || selectedPosterMela.event}
          eventDate={selectedPosterMela.date}
          eventVenue={selectedPosterMela.venue || selectedPosterMela.location}
        />
      )}
    </div>
  );
}
