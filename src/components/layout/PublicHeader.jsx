import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Briefcase, Building2, BookOpen, CalendarDays,
  ChevronDown, User, UserPlus, Info, Sparkles, Globe, Home,
  ExternalLink, LogOut, LayoutDashboard, Search, FileText, Camera
} from 'lucide-react';
import Button from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import NotificationDropdown from '../ui/NotificationDropdown';
import { useLanguage } from '../../context/LanguageContext';
import { useCandidate } from '../../context/CandidateContext';
import { useRecruiter } from '../../context/RecruiterContext';
import { useAdmin } from '../../context/AdminContext';

export default function PublicHeader() {
  const { t, toggle, lang } = useLanguage();
  const { candidate, isLoggedIn: isCandidateLoggedIn, logout: logoutCandidate } = useCandidate();
  const { recruiter, isRecruiterLoggedIn, logoutRecruiter } = useRecruiter();
  const { currentAdmin, isAdminLoggedIn, logoutAdmin } = useAdmin();

  const nav = t.nav;
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const getStartedRef = useRef(null);
  const aboutRef = useRef(null);

  // Nav links built from translations
  const NAV_LINKS = [
    { label: nav.home,        href: '/',                  icon: <Home size={16} /> },
    { label: nav.jobs,        href: '/jobs',              icon: <Briefcase size={16} /> },
    { label: nav.internships, href: '/internships',       icon: <BookOpen size={16} /> },
    { label: nav.companies,   href: '/companies',         icon: <Building2 size={16} /> },
    { label: nav.jobMelas,    href: '/job-melas',         icon: <CalendarDays size={16} /> },
    { label: nav.skillDev,    href: '/skill-development', icon: <Sparkles size={16} /> },
  ];

  const handleAboutToggle = (e) => {
    e.stopPropagation();
    setGetStartedOpen(false);
    setAboutDropdownOpen((prev) => !prev);
  };

  const handleGetStartedToggle = (e) => {
    e.stopPropagation();
    setAboutDropdownOpen(false);
    setGetStartedOpen((prev) => !prev);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (getStartedRef.current && !getStartedRef.current.contains(e.target)) {
        setGetStartedOpen(false);
      }
      if (aboutRef.current && !aboutRef.current.contains(e.target)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCandidateLogout = () => {
    logoutCandidate();
    navigate('/login');
  };

  const handleRecruiterLogout = () => {
    logoutRecruiter();
    navigate('/login');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const candidateMenuItems = [
    { label: `${candidate?.name || 'Candidate'} (Candidate)`, header: `${candidate?.name || 'Candidate'} (Candidate)` },
    { label: 'Dashboard', icon: <LayoutDashboard size={15} />, onClick: () => navigate('/candidate/dashboard') },
    { divider: true },
    { label: 'Log Out', icon: <LogOut size={15} />, danger: true, onClick: handleCandidateLogout },
  ];

  const recruiterMenuItems = [
    { label: `${recruiter?.name || 'Recruiter'} (Recruiter)`, header: `${recruiter?.name || 'Recruiter'} (${recruiter?.company?.name || 'Company'})` },
    { label: 'Dashboard', icon: <LayoutDashboard size={15} />, onClick: () => navigate('/recruiter/dashboard') },
    { divider: true },
    { label: 'Log Out', icon: <LogOut size={15} />, danger: true, onClick: handleRecruiterLogout },
  ];

  const adminMenuItems = [
    { label: `${currentAdmin?.name || 'Admin User'} (Administrator)`, header: `${currentAdmin?.name || 'Admin User'} (Administrator)` },
    { label: 'Dashboard', icon: <LayoutDashboard size={15} />, onClick: () => navigate('/admin/dashboard') },
    { divider: true },
    { label: 'Log Out', icon: <LogOut size={15} />, danger: true, onClick: handleAdminLogout },
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="public-header-inner">
          {/* ── 1. Official NTR VIKASA Branding ── */}
          <Link to="/" className="public-header-logo" aria-label="NTR Vikasa Home">
            <img src="/logo_image.png" alt="NTR Vikasa Logo" />
          </Link>

          {/* ── 2. Desktop Navigation ── */}
          <nav className="public-nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isSkillDevActive = link.href === '/skill-development' && (
                location.pathname.startsWith('/skill-development') || location.pathname.startsWith('/training')
              );
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `public-nav-link ${isActive || isSkillDevActive ? 'active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}

            {/* About Dropdown (Click-to-open only) */}
            <div
              ref={aboutRef}
              className="nav-dropdown-wrapper"
            >
              <button
                type="button"
                className={`public-nav-link ${location.pathname.startsWith('/about') ? 'active' : ''}`}
                onClick={handleAboutToggle}
                aria-expanded={aboutDropdownOpen}
                aria-haspopup="true"
              >
                <span>{nav.about}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: aboutDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 200ms ease',
                    opacity: 0.75
                  }}
                />
              </button>

              {aboutDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <Link
                    to="/about"
                    className="nav-dropdown-item"
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    <div className="nav-dropdown-icon-box">
                      <Info size={16} />
                    </div>
                    <div>
                      <p className="nav-dropdown-title">{nav.aboutUs}</p>
                      <p className="nav-dropdown-desc">{nav.aboutDesc}</p>
                    </div>
                  </Link>

                  <Link
                    to="/gallery"
                    className="nav-dropdown-item"
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    <div className="nav-dropdown-icon-box">
                      <Camera size={16} />
                    </div>
                    <div>
                      <p className="nav-dropdown-title">Media & Gallery</p>
                      <p className="nav-dropdown-desc">Event photos, job fairs & video highlights</p>
                    </div>
                  </Link>

                  <a
                    href="https://naipunyam.ap.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-dropdown-item"
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    <div className="nav-dropdown-icon-box">
                      <ExternalLink size={16} />
                    </div>
                    <div>
                      <p className="nav-dropdown-title">{nav.trainingPrograms}</p>
                      <p className="nav-dropdown-desc">{nav.trainingProgramsDesc}</p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* ── 3. Action Buttons / Logged In User Views ── */}
          <div className="public-header-actions">
            {isAdminLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {/* Notification Dropdown */}
                <NotificationDropdown portal="admin" notifPageLink="/admin/notifications" />

                {/* Admin User Dropdown */}
                <DropdownMenu
                  items={adminMenuItems}
                  align="right"
                  trigger={
                    <div className="nav-user-trigger admin-trigger">
                      <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-xs)', background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', color: '#fff' }}>
                        {currentAdmin?.avatar || 'A'}
                      </div>
                      <div className="hide-mobile" style={{ textAlign: 'left' }}>
                        <span className="nav-user-name">
                          {currentAdmin?.name || 'Admin User'}
                        </span>
                        <span className="nav-user-role admin-role">
                          Administrator
                        </span>
                      </div>
                      <ChevronDown size={14} className="hide-mobile" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  }
                />
              </div>
            ) : isCandidateLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {/* Notification Dropdown */}
                <NotificationDropdown portal="candidate" notifPageLink="/candidate/notifications" />

                {/* Candidate User Dropdown */}
                <DropdownMenu
                  items={candidateMenuItems}
                  align="right"
                  trigger={
                    <div className="nav-user-trigger candidate-trigger">
                      <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-xs)' }}>
                        {candidate?.name?.[0] || 'P'}
                      </div>
                      <span className="hide-mobile nav-user-name">
                        {candidate?.name}
                      </span>
                      <ChevronDown size={14} className="hide-mobile" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  }
                />
              </div>
            ) : isRecruiterLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {/* Notification Dropdown */}
                <NotificationDropdown portal="recruiter" notifPageLink="/recruiter/notifications" />

                {/* Recruiter User Dropdown */}
                <DropdownMenu
                  items={recruiterMenuItems}
                  align="right"
                  trigger={
                    <div className="nav-user-trigger recruiter-trigger">
                      <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 'var(--text-xs)', background: 'linear-gradient(135deg, var(--color-primary-600), #7c3aed)', color: '#fff' }}>
                        {recruiter?.avatar || recruiter?.name?.[0] || 'R'}
                      </div>
                      <div className="hide-mobile" style={{ textAlign: 'left' }}>
                        <span className="nav-user-name">
                          {recruiter?.name}
                        </span>
                        <span className="nav-user-role recruiter-role">
                          Recruiter
                        </span>
                      </div>
                      <ChevronDown size={14} className="hide-mobile" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  }
                />
              </div>
            ) : (
              <>
                <div className="nav-vertical-divider hide-mobile" />

                <Link to="/login" className="hide-mobile">
                  <span className="nav-login-btn">{nav.login}</span>
                </Link>

                {/* Get Started Dropdown (Candidate vs Recruiter) */}
                <div ref={getStartedRef} className="nav-dropdown-wrapper hide-mobile">
                  <button
                    type="button"
                    className="nav-get-started-btn"
                    onClick={handleGetStartedToggle}
                    aria-expanded={getStartedOpen}
                    aria-haspopup="true"
                  >
                    <span>{nav.getStarted}</span>
                    <ChevronDown
                      size={14}
                      style={{
                        transform: getStartedOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 200ms ease'
                      }}
                    />
                  </button>

                  {getStartedOpen && (
                    <div className="nav-get-started-menu">
                      <Link
                        to="/register/candidate"
                        className="nav-dropdown-item"
                        onClick={() => setGetStartedOpen(false)}
                      >
                        <div className="nav-dropdown-icon-box candidate-box">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="nav-dropdown-title">
                            {nav.asJobSeeker || nav.candidateReg || 'Candidate Registration'}
                          </p>
                          <p className="nav-dropdown-desc">
                            {nav.asJobSeekerDesc || nav.candidateDesc || 'Find jobs, internships & job fairs'}
                          </p>
                        </div>
                      </Link>

                      <div className="nav-dropdown-divider" />

                      <Link
                        to="/register/recruiter"
                        className="nav-dropdown-item"
                        onClick={() => setGetStartedOpen(false)}
                      >
                        <div className="nav-dropdown-icon-box recruiter-box">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="nav-dropdown-title">
                            {nav.asEmployer || nav.recruiterReg || 'Recruiter Registration'}
                          </p>
                          <p className="nav-dropdown-desc">
                            {nav.asEmployerDesc || nav.recruiterDesc || 'Post jobs & hire verified talent'}
                          </p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Language switch button */}
            <button
              className={`nav-lang-btn notranslate hide-mobile ${lang === 'te' ? 'te-active' : ''}`}
              onClick={toggle}
              aria-label={lang === 'en' ? 'Switch to Telugu' : 'Switch to English'}
            >
              <Globe size={14} />
              <span>{lang === 'en' ? 'Telugu' : 'English'}</span>
            </button>

            {/* Mobile menu hamburger button */}
            <button
              className="nav-hamburger-btn hide-desktop"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 4. Responsive Mobile Drawer ── */}
      {menuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-panel">
            <div className="mobile-nav-header">
              <Link to="/" className="logo" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '36px', objectFit: 'contain' }} />
              </Link>
              <button
                className="modal-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mobile-nav-links">
              {NAV_LINKS.map((link) => {
                const isSkillDevActive = link.href === '/skill-development' && (
                  location.pathname.startsWith('/skill-development') || location.pathname.startsWith('/training')
                );
                return (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive || isSkillDevActive ? 'active' : ''}`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                );
              })}

              {/* About Collapsible */}
              <div>
                <button
                  type="button"
                  className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                  onClick={() => setMobileAboutOpen((v) => !v)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    font: 'inherit',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Info size={16} />
                    {nav.about}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: mobileAboutOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 150ms ease'
                    }}
                  />
                </button>
                {mobileAboutOpen && (
                  <div style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 'var(--space-2)' }}>
                    <NavLink
                      to="/about"
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                      style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }}
                    >
                      <Info size={14} />
                      {nav.aboutUs}
                    </NavLink>
                    <NavLink
                      to="/gallery"
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                      style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }}
                    >
                      <Camera size={14} />
                      Media & Gallery
                    </NavLink>
                    <a
                      href="https://naipunyam.ap.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-nav-link"
                      onClick={() => setMenuOpen(false)}
                      style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }}
                    >
                      <ExternalLink size={14} />
                      {nav.trainingPrograms}
                    </a>
                  </div>
                )}
              </div>

              <NavLink to="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                <UserPlus size={16} /> {nav.contactSupport}
              </NavLink>

              {/* Language toggle in mobile drawer */}
              <button
                className="mobile-nav-link notranslate"
                onClick={() => { toggle(); setMenuOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: lang === 'te' ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                  fontWeight: lang === 'te' ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 'var(--space-3)',
                }}
                aria-label={lang === 'en' ? 'Switch to Telugu' : 'Switch to English'}
              >
                <Globe size={16} /> {lang === 'en' ? 'Telugu' : 'English'}
              </button>
            </div>

            <div className="mobile-nav-actions">
              {isAdminLoggedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" fullWidth leftIcon={<LayoutDashboard size={16} />}>
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" fullWidth onClick={() => { handleAdminLogout(); setMenuOpen(false); }}>
                    Log Out
                  </Button>
                </div>
              ) : isCandidateLoggedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Link to="/candidate/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" fullWidth leftIcon={<LayoutDashboard size={16} />}>
                      Go to Candidate Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" fullWidth onClick={() => { handleCandidateLogout(); setMenuOpen(false); }}>
                    Log Out
                  </Button>
                </div>
              ) : isRecruiterLoggedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Link to="/recruiter/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" fullWidth leftIcon={<LayoutDashboard size={16} />}>
                      Go to Recruiter Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" fullWidth onClick={() => { handleRecruiterLogout(); setMenuOpen(false); }}>
                    Log Out
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" fullWidth>{nav.login}</Button>
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <Link to="/register/candidate" onClick={() => setMenuOpen(false)}>
                      <Button variant="primary" fullWidth leftIcon={<User size={16} />}>
                        {nav.candidateReg}
                      </Button>
                    </Link>
                    <Link to="/register/recruiter" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" fullWidth leftIcon={<Building2 size={16} />}>
                        {nav.recruiterReg}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
          <div
            style={{ flex: 1 }}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}
