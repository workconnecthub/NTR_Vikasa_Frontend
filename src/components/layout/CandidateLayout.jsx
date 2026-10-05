import { Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, Search, BookOpen, Building2, Bookmark,
  FileText, CalendarDays, User, Video,
  HelpCircle, Settings
} from 'lucide-react';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';
import { SidebarProvider } from '../../context/SidebarContext';
import { useCandidate } from '../../context/CandidateContext';

const NAV_ITEMS = [
  // ── MAIN ──
  { section: 'MAIN', label: 'Home',                 href: '/',                            icon: <Home size={18} />, end: true },
  { section: 'MAIN', label: 'Dashboard',            href: '/candidate/dashboard',         icon: <LayoutDashboard size={18} />, end: true },
  { section: 'MAIN', label: 'Find Jobs',            href: '/candidate/jobs',              icon: <Search size={18} /> },
  { section: 'MAIN', label: 'Internships',          href: '/candidate/internships',       icon: <BookOpen size={18} /> },
  { section: 'MAIN', label: 'Companies',            href: '/candidate/companies',         icon: <Building2 size={18} /> },
  { section: 'MAIN', label: 'Saved Jobs',           href: '/candidate/saved-jobs',        icon: <Bookmark size={18} /> },
  { section: 'MAIN', label: 'My Applications',      href: '/candidate/applications',      icon: <FileText size={18} /> },
  { section: 'MAIN', label: 'Job Melas',            href: '/candidate/job-melas',         icon: <CalendarDays size={18} /> },

  // ── PROFILE ──
  { section: 'PROFILE', label: 'Profile', href: '/candidate/profile', icon: <User size={18} /> },

  // ── ACTIVITY ──
  { section: 'ACTIVITY', label: 'Interviews',       href: '/candidate/interviews',        icon: <Video size={18} /> },

  // ── SUPPORT ──
  { section: 'SUPPORT', label: 'Help & Support',    href: '/candidate/help-support',      icon: <HelpCircle size={18} />, hideOnMobile: true },
  { section: 'SUPPORT', label: 'Settings',          href: '/candidate/settings',          icon: <Settings size={18} /> },
];

function getPageTitle(pathname) {
  const map = {
    '/candidate/dashboard':         'Dashboard',
    '/candidate/jobs':              'Find Jobs',
    '/candidate/internships':       'Internships',
    '/candidate/companies':         'Companies',
    '/candidate/profile':           'Profile',
    '/candidate/resume':            'Profile',
    '/candidate/skills-preferences':'Profile',
    '/candidate/applications':      'My Applications',
    '/candidate/saved-jobs':        'Saved Jobs',
    '/candidate/job-mela':          'Job Melas',
    '/candidate/job-melas':         'Job Melas',
    '/candidate/notifications':     'Notifications',
    '/candidate/interviews':        'Interviews',
    '/candidate/help-support':      'Help & Support',
    '/candidate/settings':          'Settings',
  };
  return map[pathname] || 'Candidate Workspace';
}

export default function CandidateLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const { candidate, isLoggedIn } = useCandidate();

  const token = localStorage.getItem('ntr_access_token');
  if (!isLoggedIn && !token) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname + location.search }} replace />;
  }

  const currentUser = {
    name: candidate.name,
    role: 'Candidate',
    email: candidate.email,
    avatar: (candidate.avatar && (candidate.avatar.startsWith('data:') || candidate.avatar.startsWith('http') || candidate.avatar.startsWith('/'))) ? candidate.avatar : null
  };

  return (
    <SidebarProvider>
      <div className="portal-layout">
        <Sidebar
          navItems={NAV_ITEMS}
          portalName="Candidate"
        />
        <div className="portal-main">
          <PortalHeader
            title={title}
            user={currentUser}
          />
          <main className="portal-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
