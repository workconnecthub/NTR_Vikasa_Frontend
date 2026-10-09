import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAdmin, DEFAULT_HOME_CONTENT } from '../../context/AdminContext';
import {
  Search, MapPin, Briefcase, Building2, GraduationCap, CalendarDays,
  ArrowRight, TrendingUp, Users, CheckCircle2, Award, Sparkles,
  ChevronRight, ArrowUpRight, ShieldCheck, Clock, ChevronDown,
  ExternalLink, X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { JobCard, CompanyCard, InternshipCard, JobMelaCard } from '../../components/ui/EntityCards';
import {
  MOCK_JOBS,
  MOCK_COMPANIES,
  MOCK_INTERNSHIPS,
  MOCK_JOB_MELAS,
  MOCK_STATS,
  WHY_CHOOSE_US,
  LOCATIONS
} from '../../data/mockData';
import heroImg from '../../assets/hero.jpeg';
import GallerySection from '../../components/home/GallerySection';
import NewsArticlesSection from '../../components/home/NewsArticlesSection';
import publicService from '../../services/publicService';


export default function HomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { homeContent, jobMelas = [] } = useAdmin();

  const currentContent = homeContent || DEFAULT_HOME_CONTENT;
  const heroContent = currentContent.hero || DEFAULT_HOME_CONTENT.hero;
  const statsContent = currentContent.stats || DEFAULT_HOME_CONTENT.stats;
  const wcContent = currentContent.whyChoose || DEFAULT_HOME_CONTENT.whyChoose;
  const welcomePopup = currentContent.welcomePopup || DEFAULT_HOME_CONTENT.welcomePopup;
  const galleryContent = currentContent.gallery || DEFAULT_HOME_CONTENT.gallery;
  const newsContent = currentContent.newsArticles || DEFAULT_HOME_CONTENT.newsArticles;

  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    if (welcomePopup?.enabled && welcomePopup?.imageUrl && welcomePopup?.startDate && welcomePopup?.endDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // Show only when current date is within the configured schedule (inclusive)
      const isWithinSchedule = todayStr >= welcomePopup.startDate && todayStr <= welcomePopup.endDate;
      if (!isWithinSchedule) return;

      const dismissed = sessionStorage.getItem('ntr_welcome_popup_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowWelcomePopup(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [welcomePopup]);

  const handleDismissPopup = () => {
    sessionStorage.setItem('ntr_welcome_popup_dismissed', 'true');
    setShowWelcomePopup(false);
  };

  const handlePosterClick = () => {
    if (welcomePopup?.redirectUrl) {
      window.open(welcomePopup.redirectUrl, '_blank', 'noopener,noreferrer');
    }
    handleDismissPopup();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const { t } = useLanguage();
  const hero = t.hero;
  const wc = t.whyChoose;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedLocation && selectedLocation !== 'All Locations') params.set('location', selectedLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const [liveJobs, setLiveJobs] = useState([]);
  const [liveCompanies, setLiveCompanies] = useState([]);
  const [liveInternships, setLiveInternships] = useState([]);
  const [liveJobMelas, setLiveJobMelas] = useState([]);
  const [liveGallery, setLiveGallery] = useState(null);
  const [liveNews, setLiveNews] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPublicData = async () => {
      try {
        const [jobsRes, compsRes, internsRes, melasRes, photosRes, videosRes, pressRes, galleryHdrRes, newsHdrRes] = await Promise.allSettled([
          publicService.getPublishedJobs({ page_size: 10 }),
          publicService.getPublishedCompanies({ page_size: 10 }),
          publicService.getPublishedInternships({ page_size: 10 }),
          publicService.getPublishedJobMelas(),
          publicService.getPublishedGalleryPhotos({ page_size: 50 }),
          publicService.getPublishedGalleryVideos({ page_size: 50 }),
          publicService.getPublishedPressArticles({ page_size: 50 }),
          publicService.getPublishedSectionHeader('gallery'),
          publicService.getPublishedSectionHeader('news'),
        ]);

        if (!isMounted) return;

        if (jobsRes.status === 'fulfilled' && jobsRes.value?.items?.length) {
          setLiveJobs(jobsRes.value.items.map(j => ({
            id: j.job_id || j.id,
            title: j.title,
            company: j.company_name,
            location: j.location,
            type: j.job_type,
            salary: j.salary || 'Competitive',
            experience: j.experience,
            tags: j.skills || [],
            isFeatured: true,
            isNew: true,
            workMode: j.work_mode,
          })));
        }

        if (compsRes.status === 'fulfilled' && compsRes.value?.items?.length) {
          setLiveCompanies(compsRes.value.items.map(c => ({
            id: c.id,
            name: c.name || c.company_name,
            industry: c.industry,
            logo: c.logo || c.company_logo_path,
            openJobs: c.openJobs || c.open_jobs || 0,
            employees: c.employees || c.size || '1000+',
          })));
        }

        if (internsRes.status === 'fulfilled' && internsRes.value?.items?.length) {
          setLiveInternships(internsRes.value.items.map(i => ({
            id: i.internship_number || i.id,
            title: i.title,
            company: i.company_name,
            location: i.location,
            duration: i.duration,
            stipend: i.stipend,
            mode: i.work_mode,
            tags: [i.work_mode, i.duration].filter(Boolean),
          })));
        }

        if (melasRes.status === 'fulfilled' && Array.isArray(melasRes.value) && melasRes.value.length) {
          setLiveJobMelas(melasRes.value.map(m => ({
            id: m.id || m.mela_number,
            title: m.title,
            event: m.title,
            event_date: m.event_date,
            date: m.event_date,
            venue: m.venue,
            city: m.city,
            status: m.status,
            participatingCompaniesCount: m.participating_companies_count || 10,
          })));
        }

        if (photosRes.status === 'fulfilled' || videosRes.status === 'fulfilled' || galleryHdrRes.status === 'fulfilled') {
          const imgs = photosRes.status === 'fulfilled' && Array.isArray(photosRes.value) && photosRes.value.length > 0
            ? photosRes.value.map(p => ({
                id: p.id,
                title: p.title,
                category: p.category,
                imageUrl: p.imageUrl || p.image_url,
                date: p.date,
                description: p.description || '',
              }))
            : null;

          const vids = videosRes.status === 'fulfilled' && Array.isArray(videosRes.value) && videosRes.value.length > 0
            ? videosRes.value.map(v => ({
                id: v.id,
                title: v.title,
                youtubeUrl: v.youtubeUrl || v.youtube_url,
                category: v.category,
                date: v.date || '',
                description: v.description || '',
              }))
            : null;

          const hdr = galleryHdrRes.status === 'fulfilled' && galleryHdrRes.value ? galleryHdrRes.value : null;

          if (imgs || vids || hdr) {
            setLiveGallery({
              badge: hdr?.badge || galleryContent.badge,
              heading1: hdr?.heading1 || galleryContent.heading1,
              heading2: hdr?.heading2 || galleryContent.heading2,
              subtitle: hdr?.subtitle || galleryContent.subtitle,
              images: imgs || galleryContent.images || [],
              videos: vids || galleryContent.videos || [],
            });
          }
        }

        if (pressRes.status === 'fulfilled' || newsHdrRes.status === 'fulfilled') {
          const arts = pressRes.status === 'fulfilled' && Array.isArray(pressRes.value) && pressRes.value.length > 0
            ? pressRes.value.map(a => ({
                id: a.id,
                newspaper: a.newspaper || a.publication_name,
                title: a.title,
                date: a.date || a.publication_date,
                edition: a.edition || '',
                imageUrl: a.imageUrl || a.image_url,
                sourceUrl: a.sourceUrl || a.source_url || a.article_url || '',
                summary: a.summary || a.description || '',
              }))
            : null;

          const nhdr = newsHdrRes.status === 'fulfilled' && newsHdrRes.value ? newsHdrRes.value : null;

          if (arts || nhdr) {
            setLiveNews({
              badge: nhdr?.badge || newsContent.badge,
              heading1: nhdr?.heading1 || newsContent.heading1,
              heading2: nhdr?.heading2 || newsContent.heading2,
              subtitle: nhdr?.subtitle || newsContent.subtitle,
              articles: arts || newsContent.articles || [],
            });
          }
        }
      } catch (e) {
        console.warn('HomePage public data load warning:', e);
      }
    };

    fetchPublicData();
    return () => { isMounted = false; };
  }, []);

  const displayJobs = liveJobs.length > 0 ? liveJobs : MOCK_JOBS;
  const displayCompanies = liveCompanies.length > 0 ? liveCompanies : MOCK_COMPANIES;
  const displayInternships = liveInternships.length > 0 ? liveInternships : MOCK_INTERNSHIPS;
  const displayMelas = liveJobMelas.length > 0 ? liveJobMelas : (jobMelas.length > 0 ? jobMelas : MOCK_JOB_MELAS);

  const featuredJobs = displayJobs.filter(j => j.isFeatured).slice(0, 3);
  const latestJobs = displayJobs.slice(0, 6);
  const topCompanies = displayCompanies.slice(0, 8);
  const featuredInternships = displayInternships.slice(0, 3);
  const upcomingJobMelas = displayMelas
    .filter(m => m.status === 'REGISTRATION_OPEN' || m.status === 'UPCOMING' || m.status === 'APPROVED' || m.status === 'PUBLISHED')
    .slice(0, 2);


  const iconMap24 = {
    Briefcase: <Briefcase size={24} />,
    Building2: <Building2 size={24} />,
    Users: <Users size={24} />,
    TrendingUp: <TrendingUp size={24} />,
    Award: <Award size={24} />,
    ShieldCheck: <ShieldCheck size={24} />,
    GraduationCap: <GraduationCap size={24} />,
    CalendarDays: <CalendarDays size={24} />,
  };

  const default24Icons = [
    <Briefcase size={24} key="1" />,
    <Building2 size={24} key="2" />,
    <Users size={24} key="3" />,
    <TrendingUp size={24} key="4" />
  ];

  const statsList = (statsContent || []).map((stat, idx) => ({
    value: stat.value,
    label: stat.label,
    icon: iconMap24[stat.icon] || default24Icons[idx % 4]
  }));

  const activeHeroImg = heroContent.heroImage || heroImg;
  const popularSearches = heroContent.popularSearches || ['React', 'Python', 'Java', 'Data Science', 'Figma', 'Fintech', 'Freshers', 'Remote'];

  // Hero carousel state
  const heroImages = [activeHeroImg, '/hero2.jpg', '/hero3.jpg'];
  const [heroCarouselIdx, setHeroCarouselIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCarouselIdx(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="home-page" style={{ minHeight: '100vh' }}>
      {/* ── 1. Hero Section ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        position: 'relative',
      }}>
        {/* ── Full-bleed hero background carousel ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          {/* Glow ambient decorations — desktop only */}
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 480, height: 480,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            pointerEvents: 'none', filter: 'blur(30px)'
          }} />
          <div style={{
            position: 'absolute', bottom: -150, left: -100, width: 420, height: 420,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,70,239,0.2) 0%, transparent 70%)',
            pointerEvents: 'none', filter: 'blur(30px)'
          }} />

          {/* ── Desktop: right-side 55% masked panel ── */}
          <div className="hero-carousel-desktop">
            {heroImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Hero slide ${idx + 1}`}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: idx === heroCarouselIdx ? 1 : 0,
                  transition: 'opacity 0.9s ease-in-out',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center, black 20%, transparent 75%)',
                  maskImage: 'radial-gradient(ellipse 80% 70% at center, black 20%, transparent 75%)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          {/* ── Mobile: full-bleed background carousel ── */}
          <div className="hero-carousel-mobile">
            {heroImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Hero slide ${idx + 1}`}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: idx === heroCarouselIdx ? 1 : 0,
                  transition: 'opacity 0.9s ease-in-out',
                  pointerEvents: 'none',
                }}
              />
            ))}
            {/* Dark overlay so text stays legible on mobile */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(15,23,42,0.72) 0%, rgba(30,27,75,0.65) 60%, rgba(49,46,129,0.55) 100%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* ── Carousel dot indicators (shared, visible both layouts) ── */}
        <div style={{
          position: 'absolute', bottom: 18, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 8,
          zIndex: 10, pointerEvents: 'auto',
        }}>
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroCarouselIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === heroCarouselIdx ? 22 : 8,
                height: 8, borderRadius: 4,
                border: 'none', cursor: 'pointer', padding: 0,
                background: idx === heroCarouselIdx ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', padding: 'var(--space-20) var(--space-6)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'left', maxWidth: 680, marginBottom: 'var(--space-8)' }}>
              <div className="badge badge-primary" style={{
                marginBottom: 'var(--space-4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: '#c7d2fe',
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(165,180,252,0.3)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)'
              }}>
                <Sparkles size={14} style={{ color: '#a5b4fc' }} />
                <span>{heroContent.badge || hero.badge}</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.15,
                marginBottom: 'var(--space-5)',
                letterSpacing: '-0.02em',
              }}>
                {heroContent.heading1 || hero.heading1}<br />
                <span style={{
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #e0e7ff 50%, #f5d0fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {heroContent.heading2 || hero.heading2}
                </span>
              </h1>

              <p style={{
                fontSize: 'var(--text-lg)',
                color: '#cbd5e1',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: 680,
              }}>
                {heroContent.subtext || hero.subtext}
              </p>
            </div>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-bar" style={{
              maxWidth: 780,
              margin: '0 auto var(--space-6)',
              boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div className="search-bar-input-wrapper" style={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%' }}>
                <span style={{ padding: '0 var(--space-2) 0 var(--space-5)', color: 'var(--color-text-muted)', display: 'flex' }}>
                  <Search size={20} />
                </span>
                <input
                  className="search-bar-input"
                  placeholder={heroContent.searchPlaceholder || hero.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Job search"
                />
              </div>
              <div className="search-bar-divider" />
              <div ref={locationDropdownRef} style={{ display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', position: 'relative' }}>
                <MapPin size={18} style={{ color: 'var(--color-text-muted)', marginRight: 6 }} />
                <button
                  type="button"
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '8px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  aria-label="Filter location"
                >
                  <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedLocation || 'All Locations'}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transform: locationDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
                </button>

                {locationDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: 240,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: 'var(--space-2)',
                      zIndex: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                    className="custom-scrollbar"
                  >
                    {LOCATIONS.map((loc) => {
                      const isSelected = selectedLocation === loc || (!selectedLocation && loc === 'All Locations');
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc === 'All Locations' ? '' : loc);
                            setLocationDropdownOpen(false);
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-lg)',
                            background: isSelected ? 'var(--color-primary-50)' : 'transparent',
                            color: isSelected ? 'var(--color-primary-600)' : 'var(--color-text)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            fontWeight: isSelected ? 600 : 500,
                            transition: 'background 150ms ease, color 150ms ease'
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'var(--color-gray-50)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button type="submit" className="search-bar-btn">
                {hero.searchBtn}
              </button>
            </form>

            {/* Quick skill pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 'var(--text-xs)', marginRight: 4 }}>{hero.popularSearches}</span>
              {popularSearches.map((tag) => (
                <Link
                  key={tag}
                  to={`/jobs?q=${tag}`}
                  style={{
                    padding: '5px 14px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 'var(--radius-full)',
                    color: '#e2e8f0',
                    fontSize: 'var(--text-xs)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* NTR Vikasa organisation identity */}
            <p style={{
              textAlign: 'center',
              marginTop: 'var(--space-8)',
              fontSize: 'var(--text-xs)',
              color: 'rgba(148,163,184,0.75)',
              letterSpacing: '0.03em'
            }}>
              Powered by{' '}
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>NTR Vikasa</span>
              {' '}—{' '}{hero.ntrSociety}
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Statistics Section ── */}
      <section style={{ background: 'var(--color-surface)', padding: 'var(--space-10) 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="home-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
            {statsList.map((stat) => (
              <div key={stat.label} style={{
                textAlign: 'center',
                padding: 'var(--space-4)',
                borderRight: '1px solid var(--color-gray-100)'
              }}>
                <div style={{
                  width: 54, height: 54,
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-3)',
                }}>
                  {stat.icon}
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Our Job Portal? ── */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--color-bg)' }}>
        <div className="container">
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, var(--text-3xl))',
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1.2,
            }}>
              {wcContent.heading1 || wc.heading1}{' '}
              <span style={{ color: 'var(--color-primary-600)' }}>{wcContent.heading2 || wc.heading2}</span>
            </h2>
            <p style={{
              marginTop: 'var(--space-3)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-base)',
              maxWidth: 560,
              marginInline: 'auto',
            }}>
              {wcContent.subtitle || wc.subtitle}
            </p>
          </div>

          {/* Feature cards — 6-col desktop · 3-col tablet · 2-col mobile · 1-col xs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 'var(--space-4)',
          }}
            className="why-choose-grid"
          >
            {(wcContent.cards || wc.cards).map((item, i) => {
              const iconMap20 = {
                ShieldCheck: <ShieldCheck size={20} />,
                GraduationCap: <GraduationCap size={20} />,
                CalendarDays: <CalendarDays size={20} />,
                ArrowUpRight: <ArrowUpRight size={20} />,
                TrendingUp: <TrendingUp size={20} />,
                Users: <Users size={20} />,
                CheckCircle2: <CheckCircle2 size={20} />,
                Award: <Award size={20} />,
                Sparkles: <Sparkles size={20} />,
                Briefcase: <Briefcase size={20} />,
                Building2: <Building2 size={20} />,
              };
              const defaultIcons = [
                <ShieldCheck size={20} key="1" />,
                <GraduationCap size={20} key="2" />,
                <CalendarDays size={20} key="3" />,
                <ArrowUpRight size={20} key="4" />,
                <TrendingUp size={20} key="5" />,
                <Users size={20} key="6" />,
              ];
              return (
                <button
                  key={item.title || i}
                  type="button"
                  onClick={() => toast({ type: 'success', title: 'Feedback Received', message: 'Thank you for the reply, that helps us.' })}
                  className="card why-choose-card hover-lift"
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 'var(--space-2)',
                    background: 'var(--color-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary-50)',
                    color: 'var(--color-primary-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {iconMap20[item.icon] || defaultIcons[i % defaultIcons.length]}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Jobs Section ── */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div className="badge badge-primary" style={{ marginBottom: 'var(--space-2)' }}>
                <Sparkles size={12} style={{ marginRight: 4 }} /> Prime Opportunities
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Featured Jobs</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                Curated high-growth roles from industry leaders and verified startups
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                Explore All Jobs
              </Button>
            </Link>
          </div>
          <div className="home-featured-jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Latest Jobs Section ── */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div className="badge badge-success" style={{ marginBottom: 'var(--space-2)' }}>
                <Clock size={12} style={{ marginRight: 4 }} /> Fresh Openings
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Latest Job Listings</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                Recently posted openings across engineering, product, sales, and operations
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="ghost" rightIcon={<ArrowRight size={16} />}>
                View All {MOCK_JOBS.length}+ Jobs
              </Button>
            </Link>
          </div>
          <div className="home-latest-jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Top Companies Section ── */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>
                <Building2 size={12} style={{ marginRight: 4 }} /> Top Employers
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Top Companies Hiring Now</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                Discover great workplaces with transparent culture ratings, perks, and open positions
              </p>
            </div>
            <Link to="/companies">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                Browse All Companies
              </Button>
            </Link>
          </div>
          <div className="home-companies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            {topCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Featured Internships Section ── */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>
                <GraduationCap size={12} style={{ marginRight: 4 }} /> Early Career
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Featured Internships & Trainee Roles</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                Paid stipends, pre-placement offers (PPOs), and real-world project mentorship
              </p>
            </div>
            <Link to="/internships">
              <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
                Explore Internships
              </Button>
            </Link>
          </div>
          <div className="home-internships-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {featuredInternships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Upcoming Job Melas Section ── */}
      <section style={{ padding: 'var(--space-16) 0', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div className="badge badge-primary" style={{ marginBottom: 'var(--space-2)' }}>
                <CalendarDays size={12} style={{ marginRight: 4 }} /> Mega Career Fairs
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Upcoming & Active Job Melas</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                Meet 100+ recruiters face-to-face, attend spot interview rounds, and receive offer letters
              </p>
            </div>
            <Link to="/job-melas">
              <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
                View All Job Melas
              </Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {upcomingJobMelas.map((event) => (
              <JobMelaCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Media & Event Gallery (Photos & Interactive Hover-to-Play Videos) ── */}
      <GallerySection galleryContent={liveGallery || galleryContent} />

      {/* ── 9. Newspaper Articles & Media Highlights (Slow auto-moving carousel) ── */}
      <NewsArticlesSection newsContent={liveNews || newsContent} />

      {/* ── 10. Why Choose Us Section ── */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto var(--space-12)' }}>
            <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
              <ShieldCheck size={14} style={{ marginRight: 4 }} /> Why NTR VIKASA Job Portal
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
              Engineered for Candidate Success & Recruiter Efficiency
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
              We eliminate middleman spam, fake postings, and black-box application cycles through verified employers and direct job mela access.
            </p>
          </div>

          <div className="home-why-choose-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {WHY_CHOOSE_US.map((item) => (
              <div
                key={item.title}
                className="card card-hoverable"
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-2xl)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-gray-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-border)'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Call to Action Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
        padding: 'var(--space-16) var(--space-6)',
        color: '#ffffff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 800,
            marginBottom: 'var(--space-4)',
            color: '#ffffff'
          }}>
            Ready to Take the Next Step in Your Career?
          </h2>
          <p style={{
            color: '#cbd5e1',
            fontSize: 'var(--text-lg)',
            maxWidth: 600,
            margin: '0 auto var(--space-8)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            Join over 2,80,000+ candidates who found opportunities with top employers through NTR VIKASA Job Portal.
          </p>
          <div className="home-cta-buttons" style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register/candidate">
              <Button variant="primary" size="lg" style={{ background: '#ffffff', color: '#312e81', fontWeight: 700 }}>
                Register as Job Seeker (Free)
              </Button>
            </Link>
            <Link to="/register/recruiter">
              <Button variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}>
                Post Jobs as Recruiter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. Welcome Popup Poster Overlay ── */}
      {showWelcomePopup && welcomePopup?.imageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 200ms ease'
          }}
          onClick={handleDismissPopup}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dismiss Close Button */}
            <button
              type="button"
              onClick={handleDismissPopup}
              aria-label="Close welcome popup"
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#0f172a',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'transform 150ms ease, background 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={18} />
            </button>

            {/* Poster Card */}
            <div
              onClick={handlePosterClick}
              style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                cursor: welcomePopup.redirectUrl ? 'pointer' : 'default',
                background: '#1e293b',
                transition: 'transform 200ms ease'
              }}
            >
              <img
                src={welcomePopup.imageUrl}
                alt="Welcome Announcement"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 'var(--radius-2xl)'
                }}
              />
            </div>

            {welcomePopup.redirectUrl && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#f8fafc',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                  }}
                  onClick={handlePosterClick}
                >
                  Click poster to open link <ExternalLink size={12} />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
