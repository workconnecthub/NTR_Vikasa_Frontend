import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, Briefcase, FileText,
  CalendarCheck, GraduationCap, CalendarDays,
  BarChart3, HelpCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';
import { SidebarProvider } from '../../context/SidebarContext';
import { useRecruiter } from '../../context/RecruiterContext';

const NAV_ITEMS = [
  // 1. MAIN
  { label: 'Home',             href: '/',                         icon: <Home size={18} />,           end: true, section: 'MAIN' },
  { label: 'Dashboard',        href: '/recruiter/dashboard',      icon: <LayoutDashboard size={18} />, end: true, section: 'MAIN' },
  { label: 'My Jobs',          href: '/recruiter/jobs',           icon: <Briefcase size={18} />,      section: 'MAIN' },
  { label: 'Applications',     href: '/recruiter/applications',   icon: <FileText size={18} />,       section: 'MAIN' },
  { label: 'Interviews',       href: '/recruiter/interviews',     icon: <CalendarCheck size={18} />,  section: 'MAIN' },

  // 2. COMPANY
  { label: 'My Internships',   href: '/recruiter/internships',    icon: <GraduationCap size={18} />,  section: 'COMPANY' },
  { label: 'Job Melas',        href: '/recruiter/job-melas',      icon: <CalendarDays size={18} />,   section: 'COMPANY' },

  // 3. ANALYTICS
  { label: 'Hiring Analytics', href: '/recruiter/analytics',      icon: <BarChart3 size={18} />,      section: 'ANALYTICS' },

  // 4. SUPPORT
  { label: 'Help & Support',   href: '/recruiter/help-support',   icon: <HelpCircle size={18} />,     section: 'SUPPORT', hideOnMobile: true },
];

function getPageTitle(pathname) {
  const map = {
    '/recruiter/dashboard':    'Recruiter Dashboard',
    '/recruiter/jobs':         'My Jobs',
    '/recruiter/jobs/new':     'Post New Job',
    '/recruiter/jobs/create':  'Post New Job',
    '/recruiter/candidates':   'Find Candidates',
    '/recruiter/applications': 'Applications',
    '/recruiter/shortlisted':  'Shortlisted Candidates',
    '/recruiter/interviews':   'Interviews Schedule',
    '/recruiter/company':      'Company Profile',
    '/recruiter/internships':  'My Internships',
    '/recruiter/job-melas':    'Job Melas Participation',
    '/recruiter/job-mela':     'Job Melas Participation',
    '/recruiter/analytics':    'Hiring Analytics',
    '/recruiter/notifications':'Notifications',
    '/recruiter/help-support': 'Help & Support',
    '/recruiter/settings':     'Recruiter Settings',
  };
  return map[pathname] || 'Recruiter Workspace';
}

export default function RecruiterLayout() {
  const location = useLocation();
  const { recruiter, isRecruiterLoggedIn } = useRecruiter();
  const title = getPageTitle(location.pathname);

  const token = localStorage.getItem('ntr_access_token');
  if (!isRecruiterLoggedIn && !token) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname + location.search }} replace />;
  }

  const currentUser = {
    name: recruiter?.name || 'Arjun Reddy',
    role: recruiter?.company?.name ? `${recruiter.company.name}` : 'Recruiter',
    avatar: recruiter?.avatar || null
  };

  return (
    <SidebarProvider>
      <div className="portal-layout">
        <Sidebar
          navItems={NAV_ITEMS}
          footerItems={[]}
          user={null}
          portalName="Recruiter Workspace"
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
