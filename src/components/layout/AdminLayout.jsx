import { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, Users, Building2,
  UserCheck, CalendarDays, AlertTriangle,
  TrendingUp, History, Settings, LayoutTemplate
} from 'lucide-react';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';
import { SidebarProvider } from '../../context/SidebarContext';
import { useAdmin } from '../../context/AdminContext';

function getPageTitle(pathname) {
  const map = {
    '/admin/dashboard':               'System Administration Dashboard',
    '/admin/profile':                 'Admin Profile',
    '/admin/change-password':         'Change Password',
    '/admin/candidates':              'Platform Candidates Management',
    '/admin/recruiters':              'Registered Recruiters',
    '/admin/companies':               'Registered Companies',
    '/admin/jobs':                    'Platform Jobs Directory',
    '/admin/internships':             'Platform Internships Directory',
    '/admin/applications':            'Applications Activity Monitoring',
    '/admin/recruiter-verification':  'Recruiter Verification Requests',
    '/admin/recruiters/requests':     'Recruiter Verification Requests',
    '/admin/company-verification':    'Company Verification Requests',
    '/admin/companies/requests':      'Company Verification Requests',
    '/admin/job-approvals':           'Job Posting Approval Queue',
    '/admin/jobs/requests':           'Job Posting Approval Queue',
    '/admin/internship-approvals':    'Internship Approval Queue',
    '/admin/internships/requests':    'Internship Approval Queue',
    '/admin/job-melas':               'Job Melas & Career Summits',
    '/admin/job-melas/create':        'Create New Job Mela Event',
    '/admin/registrations':           'Job Mela Candidate Registrations',
    '/admin/job-melas/registrations': 'Job Mela Candidate Registrations',
    '/admin/job-melas/participation': 'Job Mela Company Participation',
    '/admin/reports':                 'Platform Reports & Complaints Moderation',
    '/admin/analytics':               'Platform Performance & Recruitment Analytics',
    '/admin/audit-logs':              'Security & System Audit Logs',
    '/admin/notifications':           'Admin Notifications & System Alerts',
    '/admin/website-content':         'Website Content Management',
    '/admin/content':                 'Website Content Management',
    '/admin/home-content':            'Website Content Management',
    '/admin/jobs-content':            'Website Content Management',
    '/admin/skill-content':           'Website Content Management',
    '/admin/skill-development-content': 'Website Content Management',
    '/admin/job-melas-content':       'Website Content Management',
    '/admin/about-content':           'Website Content Management',
    '/admin/settings':                'Platform Administration Settings',
  };
  return map[pathname] || 'NTR VIKASA Administration';
}

export default function AdminLayout() {
  const location = useLocation();
  const { currentAdmin, pendingCounts, isAdminLoggedIn } = useAdmin();
  const title = getPageTitle(location.pathname);

  const token = localStorage.getItem('ntr_access_token');
  if (!isAdminLoggedIn && !token) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname + location.search }} replace />;
  }

  const [customProfile, setCustomProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_custom_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [customAvatar, setCustomAvatar] = useState(() => {
    try {
      return localStorage.getItem('ntr_admin_custom_avatar') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        setCustomAvatar(localStorage.getItem('ntr_admin_custom_avatar') || null);
        const storedProf = localStorage.getItem('ntr_admin_custom_profile');
        if (storedProf) setCustomProfile(JSON.parse(storedProf));
      } catch (e) {}
    };
    window.addEventListener('storage', handleAvatarUpdate);
    window.addEventListener('admin_avatar_updated', handleAvatarUpdate);
    window.addEventListener('admin_profile_updated', handleAvatarUpdate);
    return () => {
      window.removeEventListener('storage', handleAvatarUpdate);
      window.removeEventListener('admin_avatar_updated', handleAvatarUpdate);
      window.removeEventListener('admin_profile_updated', handleAvatarUpdate);
    };
  }, []);

  const navItems = [
    // 1. MAIN
    { label: 'Home',                  href: '/',                            icon: <Home size={18} />,             end: true, section: 'MAIN' },
    { label: 'Dashboard',             href: '/admin/dashboard',             icon: <LayoutDashboard size={18} />,  end: true, section: 'MAIN' },

    // 2. USERS
    { label: 'Candidates',            href: '/admin/candidates',            icon: <Users size={18} />,            section: 'USERS' },
    { label: 'Recruiters',            href: '/admin/recruiters',            icon: <UserCheck size={18} />,        section: 'USERS' },
    { label: 'Companies',             href: '/admin/companies',             icon: <Building2 size={18} />,        section: 'USERS' },

    // 3. EVENTS
    { label: 'Job Melas',             href: '/admin/job-melas',             icon: <CalendarDays size={18} />,     section: 'EVENTS' },

    // 4. MODERATION
    { label: 'Reports / Complaints',  href: '/admin/reports',               icon: <AlertTriangle size={18} />,    section: 'MODERATION', badge: pendingCounts?.openReports || null },

    // 5. ANALYTICS
    { label: 'Analytics',             href: '/admin/analytics',             icon: <TrendingUp size={18} />,       section: 'ANALYTICS' },
    { label: 'Audit Logs',            href: '/admin/audit-logs',            icon: <History size={18} />,          section: 'ANALYTICS' },

    // 6. SYSTEM
    { label: 'Website Content',       href: '/admin/website-content',       icon: <LayoutTemplate size={18} />,   section: 'SYSTEM' },
    { label: 'Settings',              href: '/admin/settings',              icon: <Settings size={18} />,         section: 'SYSTEM' },
  ];

  const adminUserObj = {
    name: customProfile?.name || currentAdmin?.name || 'Admin User',
    role: customProfile?.role || currentAdmin?.title || 'Admin Control',
    avatar: customAvatar || currentAdmin?.avatar || 'A',
  };

  return (
    <SidebarProvider>
      <div className="portal-layout">
        <Sidebar
          navItems={navItems}
          footerItems={[]}
          user={null}
          portalName="NTR Vikasa Admin"
        />
        <div className="portal-main">
          <PortalHeader
            title={title}
            user={adminUserObj}
          />
          <main className="portal-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
