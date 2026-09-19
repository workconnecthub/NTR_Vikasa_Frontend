import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  BookOpen,
  CalendarDays,
  User,
  LayoutDashboard,
  FileText,
  Bookmark,
  Users,
  UserCheck,
  Building2,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';
import { useCandidate } from '../../context/CandidateContext';
import { useRecruiter } from '../../context/RecruiterContext';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/mobile-bottom-nav.css';

/**
 * MobileBottomNav
 * 
 * Production animated curved notch bottom navigation bar for NTR Vikasa mobile view.
 * Dynamically provides 5 context-aware navigation items for:
 *   1) Public / Guest (without login): Home, Find Jobs, Internships, Job Melas, Login
 *   2) Job Seeker (candidate logged in): Home, Jobs, Applied, Saved, Profile
 *   3) Admin: Dashboard, Candidates, Recruiters, Jobs, Job Melas
 *   4) Recruiter: Dashboard, My Jobs, Applicants, Interviews, Company
 */
export default function MobileBottomNav({
  items: customItems,
  activeKey: customActiveKey,
  onSelect: customOnSelect,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn: isCandidateLoggedIn } = useCandidate();
  const { isRecruiterLoggedIn } = useRecruiter();
  const { isAdminLoggedIn } = useAdmin();

  const pathname = location.pathname;

  // Build role-based items if custom items are not explicitly provided
  const items = useMemo(() => {
    if (customItems && customItems.length > 0) {
      return customItems;
    }

    // 1. ADMIN LOGGED IN OR IN ADMIN WORKSPACE
    if (isAdminLoggedIn || pathname.startsWith('/admin')) {
      return [
        {
          key: 'dashboard',
          label: 'Dashboard',
          route: '/admin/dashboard',
          icon: <LayoutDashboard size={22} strokeWidth={1.75} />,
        },
        {
          key: 'candidates',
          label: 'Candidates',
          route: '/admin/candidates',
          icon: <Users size={22} strokeWidth={1.75} />,
        },
        {
          key: 'recruiters',
          label: 'Recruiters',
          route: '/admin/recruiters',
          icon: <UserCheck size={22} strokeWidth={1.75} />,
        },
        {
          key: 'jobs',
          label: 'Jobs',
          route: '/admin/jobs',
          icon: <Briefcase size={22} strokeWidth={1.75} />,
        },
        {
          key: 'job-melas',
          label: 'Job Melas',
          route: '/admin/job-melas',
          icon: <CalendarDays size={22} strokeWidth={1.75} />,
        },
      ];
    }

    // 2. CANDIDATE (JOB SEEKER) LOGGED IN OR IN CANDIDATE WORKSPACE
    if (isCandidateLoggedIn || pathname.startsWith('/candidate')) {
      return [
        {
          key: 'home',
          label: 'Home',
          route: '/candidate/dashboard',
          icon: <Home size={22} strokeWidth={1.75} />,
        },
        {
          key: 'jobs',
          label: 'Jobs',
          route: '/candidate/jobs',
          icon: <Briefcase size={22} strokeWidth={1.75} />,
        },
        {
          key: 'applications',
          label: 'Applied',
          route: '/candidate/applications',
          icon: <FileText size={22} strokeWidth={1.75} />,
        },
        {
          key: 'saved',
          label: 'Saved',
          route: '/candidate/saved-jobs',
          icon: <Bookmark size={22} strokeWidth={1.75} />,
        },
        {
          key: 'profile',
          label: 'Profile',
          route: '/candidate/profile',
          icon: <User size={22} strokeWidth={1.75} />,
        },
      ];
    }

    // 3. RECRUITER LOGGED IN OR IN RECRUITER WORKSPACE
    if (isRecruiterLoggedIn || pathname.startsWith('/recruiter')) {
      return [
        {
          key: 'dashboard',
          label: 'Dashboard',
          route: '/recruiter/dashboard',
          icon: <LayoutDashboard size={22} strokeWidth={1.75} />,
        },
        {
          key: 'jobs',
          label: 'My Jobs',
          route: '/recruiter/jobs',
          icon: <Briefcase size={22} strokeWidth={1.75} />,
        },
        {
          key: 'applications',
          label: 'Applicants',
          route: '/recruiter/applications',
          icon: <FileText size={22} strokeWidth={1.75} />,
        },
        {
          key: 'interviews',
          label: 'Interviews',
          route: '/recruiter/interviews',
          icon: <CalendarCheck size={22} strokeWidth={1.75} />,
        },
        {
          key: 'company',
          label: 'Company',
          route: '/recruiter/company',
          icon: <Building2 size={22} strokeWidth={1.75} />,
        },
      ];
    }

    // 4. WITHOUT LOGIN / PUBLIC GUEST USER
    return [
      {
        key: 'home',
        label: 'Home',
        route: '/',
        icon: <Home size={22} strokeWidth={1.75} />,
      },
      {
        key: 'jobs',
        label: 'Find Jobs',
        route: '/jobs',
        icon: <Briefcase size={22} strokeWidth={1.75} />,
      },
      {
        key: 'internships',
        label: 'Internships',
        route: '/internships',
        icon: <BookOpen size={22} strokeWidth={1.75} />,
      },
      {
        key: 'job-melas',
        label: 'Job Melas',
        route: '/job-melas',
        icon: <CalendarDays size={22} strokeWidth={1.75} />,
      },
      {
        key: 'login',
        label: 'Login',
        route: '/login',
        icon: <User size={22} strokeWidth={1.75} />,
      },
    ];
  }, [customItems, isAdminLoggedIn, isCandidateLoggedIn, isRecruiterLoggedIn, pathname]);

  // Determine active item index
  const activeIndex = useMemo(() => {
    if (!items || items.length === 0) return 0;

    if (customActiveKey) {
      const idx = items.findIndex((item) => item.key === customActiveKey);
      if (idx !== -1) return idx;
    }

    // Exact match
    const exactIdx = items.findIndex((item) => item.route === pathname);
    if (exactIdx !== -1) return exactIdx;

    // Subpath match (for paths longer than 1 character)
    const subpathIdx = items.findIndex(
      (item) => item.route !== '/' && pathname.startsWith(item.route)
    );
    if (subpathIdx !== -1) return subpathIdx;

    // If on a sub-route belonging to a section:
    if (pathname.startsWith('/admin')) {
      return 0; // default admin dashboard
    }
    if (pathname.startsWith('/candidate')) {
      return 0; // default candidate dashboard
    }
    if (pathname.startsWith('/recruiter')) {
      return 0; // default recruiter dashboard
    }
    if (pathname === '/' || pathname === '') {
      return 0;
    }

    return 0;
  }, [items, customActiveKey, pathname]);

  const activeItem = items[activeIndex] || items[0];

  const handleTabClick = (item, index) => {
    if (customOnSelect) {
      customOnSelect(item, index);
      return;
    }
    if (item.route && item.route !== pathname) {
      navigate(item.route);
    }
  };

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === items.length - 1;

  return (
    <aside
      className="mobile-bottom-nav-root"
      aria-label="Mobile Bottom Navigation"
    >
      <nav className="mobile-bottom-nav-container" role="navigation">
        {/* White rounded bottom bar background with edge-conforming corner transitions */}
        <div
          className={`mobile-bottom-nav-bg ${
            isFirst ? 'is-first' : isLast ? 'is-last' : 'is-middle'
          }`}
          aria-hidden="true"
        />

        {/* Sliding Indicator (Organic Wave Cutout + Elevated Circular Badge) */}
        <div
          className="mobile-bottom-nav-slider"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
          aria-hidden="true"
        >
          {/* Organic Wave Hump */}
          <div
            className={`mobile-bottom-nav-wave ${
              isFirst ? 'is-first' : isLast ? 'is-last' : 'is-middle'
            }`}
          >
            <svg
              viewBox="0 0 76 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* C1-continuous Bézier hill tailored for edge tabs and middle tabs */}
              <path
                d={
                  isFirst
                    ? "M 0 22 C 14 22, 22 2, 38 2 C 54 2, 60 22, 76 22 L 0 22 Z"
                    : isLast
                    ? "M 0 22 C 16 22, 22 2, 38 2 C 54 2, 62 22, 76 22 L 0 22 Z"
                    : "M 0 22 C 18 22, 22 2, 38 2 C 54 2, 58 22, 76 22 L 0 22 Z"
                }
                fill="#ffffff"
              />
            </svg>
          </div>

          {/* Elevated Circular Badge with primary border and light fill */}
          <div
            className="mobile-bottom-nav-badge"
            onClick={() => handleTabClick(activeItem, activeIndex)}
            title={activeItem?.label}
          >
            <div
              key={activeItem?.key || activeIndex}
              className="mobile-bottom-nav-badge-icon"
            >
              {activeItem?.icon}
            </div>
          </div>
        </div>

        {/* Navigation Items (5 columns) */}
        <div className="mobile-bottom-nav-items">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.key || item.route || index}
                type="button"
                className={`mobile-bottom-nav-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleTabClick(item, index)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Static Icon Slot (fades out when tab is active) */}
                <span className="mobile-bottom-nav-icon-slot" aria-hidden="true">
                  {item.icon}
                </span>

                {/* Badge count indicator if applicable */}
                {item.badge && (
                  <span className="mobile-bottom-nav-badge-count">
                    {item.badge}
                  </span>
                )}

                {/* Text Label */}
                <span className="mobile-bottom-nav-label">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* iOS-style home indicator safe area bar */}
        <div className="mobile-bottom-nav-safe-area" aria-hidden="true">
          <div className="mobile-bottom-nav-home-pill" />
        </div>
      </nav>
    </aside>
  );
}
