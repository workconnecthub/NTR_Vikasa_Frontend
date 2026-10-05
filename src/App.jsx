import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { CandidateProvider } from './context/CandidateContext';
import { RecruiterProvider } from './context/RecruiterContext';
import { AdminProvider } from './context/AdminContext';
import ToastContainer from './components/ui/Toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import CandidateLayout from './components/layout/CandidateLayout';
import RecruiterLayout from './components/layout/RecruiterLayout';
import AdminLayout from './components/layout/AdminLayout';

// ── Public Pages ──────────────────────────────────────────────────────────────
import HomePage               from './pages/public/HomePage';
import JobsPage               from './pages/public/JobsPage';
import JobDetailPage          from './pages/public/JobDetailPage';
import CompaniesPage          from './pages/public/CompaniesPage';
import CompanyDetailPage      from './pages/public/CompanyDetailPage';
import InternshipsPage        from './pages/public/InternshipsPage';
import InternshipDetailPage   from './pages/public/InternshipDetailPage';
import JobMelasPage           from './pages/public/JobMelasPage';
import JobMelaDetailPage      from './pages/public/JobMelaDetailPage';
import TrainingPage           from './pages/public/TrainingPage';
import SkillDevelopmentOverviewPage from './pages/public/SkillDevelopmentOverviewPage';
import SkillCoursesPage       from './pages/public/SkillCoursesPage';
import AboutPage              from './pages/public/AboutPage';
import GalleryPage            from './pages/public/GalleryPage';
import ContactPage            from './pages/public/ContactPage';
import PrivacyPage            from './pages/public/PrivacyPage';
import TermsPage              from './pages/public/TermsPage';
import LoginPage              from './pages/public/LoginPage';
import RegisterCandidatePage  from './pages/public/RegisterCandidatePage';
import RegisterRecruiterPage  from './pages/public/RegisterRecruiterPage';
import RecruiterApprovalPage  from './pages/public/RecruiterApprovalPage';
import ForgotPasswordPage     from './pages/public/ForgotPasswordPage';
import ResetPasswordPage      from './pages/public/ResetPasswordPage';
import AcceptInvitationPage   from './pages/public/AcceptInvitationPage';
import MobileBottomNav        from './components/layout/MobileBottomNav';

// ── Error Pages ───────────────────────────────────────────────────────────────
import NotFoundPage           from './pages/errors/NotFoundPage';
import ForbiddenPage          from './pages/errors/ForbiddenPage';
import ServerErrorPage        from './pages/errors/ServerErrorPage';

// ── Candidate Pages ───────────────────────────────────────────────────────────
import CandidateDashboard         from './pages/candidate/DashboardPage';
import CandidateJobsPage          from './pages/candidate/CandidateJobsPage';
import CandidateJobDetailPage     from './pages/candidate/CandidateJobDetailPage';
import CandidateInternshipsPage   from './pages/candidate/CandidateInternshipsPage';
import CandidateCompaniesPage     from './pages/candidate/CandidateCompaniesPage';
import CandidateProfilePage       from './pages/candidate/ProfilePage';
import CandidateApplicationsPage  from './pages/candidate/ApplicationsPage';
import CandidateSavedJobsPage     from './pages/candidate/SavedJobsPage';
import CandidateJobMelaPage       from './pages/candidate/JobMelaPage';
import CandidateNotificationsPage from './pages/candidate/NotificationsPage';
import CandidateInterviewsPage    from './pages/candidate/InterviewsPage';
import CandidateHelpSupportPage   from './pages/candidate/CandidateHelpSupportPage';
import CandidateSettingsPage      from './pages/candidate/SettingsPage';

// ── Recruiter Pages ───────────────────────────────────────────────────────────
import RecruiterDashboard         from './pages/recruiter/DashboardPage';
import RecruiterCompanyPage       from './pages/recruiter/CompanyPage';
import RecruiterJobsPage          from './pages/recruiter/JobsPage';
import RecruiterCreateJobPage     from './pages/recruiter/CreateJobPage';
import RecruiterJobDetailPage     from './pages/recruiter/JobDetailPage';
import RecruiterApplicantsPage    from './pages/recruiter/ApplicantsPage';
import RecruiterCandidatesPage    from './pages/recruiter/CandidatesPage';
import RecruiterApplicationsPage  from './pages/recruiter/ApplicationsPage';
import RecruiterShortlistedPage   from './pages/recruiter/ShortlistedPage';
import RecruiterAnalyticsPage     from './pages/recruiter/AnalyticsPage';
import RecruiterInternshipsPage   from './pages/recruiter/InternshipsPage';
import RecruiterInterviewsPage    from './pages/recruiter/InterviewsPage';
import RecruiterJobMelaPage       from './pages/recruiter/JobMelaPage';
import RecruiterNotificationsPage from './pages/recruiter/NotificationsPage';
import RecruiterHelpSupportPage   from './pages/recruiter/RecruiterHelpSupportPage';
import RecruiterSettingsPage      from './pages/recruiter/SettingsPage';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboard              from './pages/admin/DashboardPage';
import AdminRecruiterRequestsPage  from './pages/admin/RecruiterRequestsPage';
import AdminRecruitersPage         from './pages/admin/RecruitersPage';
import AdminCandidatesPage         from './pages/admin/CandidatesPage';
import AdminCompaniesPage          from './pages/admin/CompaniesPage';
import AdminCompanyVerificationPage from './pages/admin/CompanyVerificationPage';
import AdminJobRequestsPage        from './pages/admin/JobRequestsPage';
import AdminJobsPage               from './pages/admin/JobsPage';
import AdminInternshipRequestsPage from './pages/admin/InternshipRequestsPage';
import AdminInternshipsPage        from './pages/admin/InternshipsPage';
import AdminApplicationsPage       from './pages/admin/ApplicationsPage';
import AdminJobMelasPage           from './pages/admin/JobMelasPage';
import AdminCreateJobMelaPage      from './pages/admin/CreateJobMelaPage';
import AdminParticipationPage      from './pages/admin/ParticipationPage';
import AdminRegistrationsPage      from './pages/admin/RegistrationsPage';
import AdminNotificationsPage      from './pages/admin/NotificationsPage';
import AdminReportsPage            from './pages/admin/ReportsPage';
import AdminAnalyticsPage          from './pages/admin/AnalyticsPage';
import AdminAuditLogsPage          from './pages/admin/AuditLogsPage';
import AdminWebsiteContentPage    from './pages/admin/WebsiteContentPage';
import AdminHomeContentPage        from './pages/admin/HomeContentPage';
import AdminSkillContentPage       from './pages/admin/SkillContentPage';
import AdminAboutContentPage       from './pages/admin/AboutContentPage';
import AdminSettingsPage           from './pages/admin/SettingsPage';
import AdminProfilePage            from './pages/admin/ProfilePage';
import AdminChangePasswordPage     from './pages/admin/ChangePasswordPage';

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <LanguageProvider>
          <CandidateProvider>
            <RecruiterProvider>
              <AdminProvider>
                <BrowserRouter>
                  <Routes>
                    {/* ── Public Routes (with PublicLayout) ── */}
                    <Route element={<PublicLayout />}>
                      <Route path="/"                          element={<HomePage />} />
                      <Route path="/jobs"                      element={<JobsPage />} />
                      <Route path="/jobs/:jobId"               element={<JobDetailPage />} />
                      <Route path="/companies"                 element={<CompaniesPage />} />
                      <Route path="/companies/:id"             element={<CompanyDetailPage />} />
                      <Route path="/internships"               element={<InternshipsPage />} />
                      <Route path="/internships/:id"           element={<InternshipDetailPage />} />
                      <Route path="/job-melas"                 element={<JobMelasPage />} />
                      <Route path="/job-melas/:id"             element={<JobMelaDetailPage />} />
                      <Route path="/skill-development"          element={<SkillDevelopmentOverviewPage />} />
                      <Route path="/skill-development/overview" element={<SkillDevelopmentOverviewPage />} />
                      <Route path="/skill-development/courses"  element={<SkillCoursesPage />} />
                      <Route path="/training"                  element={<SkillDevelopmentOverviewPage />} />
                      <Route path="/training/courses"          element={<SkillCoursesPage />} />
                      <Route path="/about"                     element={<AboutPage />} />
                      <Route path="/gallery"                   element={<GalleryPage />} />
                      <Route path="/contact"                   element={<ContactPage />} />
                      <Route path="/privacy"                   element={<PrivacyPage />} />
                      <Route path="/terms"                     element={<TermsPage />} />
                      <Route path="/403"                       element={<ForbiddenPage />} />
                      <Route path="/500"                       element={<ServerErrorPage />} />
                    </Route>

                    {/* ── Auth Routes (standalone layout) ── */}
                    <Route path="/login"                       element={<LoginPage />} />
                    <Route path="/register/candidate"          element={<RegisterCandidatePage />} />
                    <Route path="/register/recruiter"          element={<RegisterRecruiterPage />} />
                    <Route path="/register/recruiter/pending"  element={<RecruiterApprovalPage />} />
                    <Route path="/accept-invitation/:token"    element={<AcceptInvitationPage />} />
                    <Route path="/forgot-password"             element={<ForgotPasswordPage />} />
                    <Route path="/reset-password"              element={<ResetPasswordPage />} />

                    {/* ── Candidate Portal Workspace ── */}
                    <Route path="/candidate" element={<CandidateLayout />}>
                      <Route index element={<Navigate to="/candidate/dashboard" replace />} />
                      <Route path="dashboard"          element={<CandidateDashboard />} />
                      <Route path="jobs"               element={<CandidateJobsPage />} />
                      <Route path="jobs/:id"           element={<CandidateJobDetailPage />} />
                      <Route path="internships"        element={<CandidateInternshipsPage />} />
                      <Route path="companies"          element={<CandidateCompaniesPage />} />
                      <Route path="profile"            element={<CandidateProfilePage />} />
                      <Route path="resume"             element={<Navigate to="/candidate/profile" replace />} />
                      <Route path="skills-preferences" element={<Navigate to="/candidate/profile" replace />} />
                      <Route path="applications"       element={<CandidateApplicationsPage />} />
                      <Route path="saved-jobs"         element={<CandidateSavedJobsPage />} />
                      <Route path="job-mela"           element={<CandidateJobMelaPage />} />
                      <Route path="job-melas"          element={<CandidateJobMelaPage />} />
                      <Route path="notifications"      element={<CandidateNotificationsPage />} />
                      <Route path="interviews"         element={<CandidateInterviewsPage />} />
                      <Route path="help-support"       element={<CandidateHelpSupportPage />} />
                      <Route path="settings"           element={<CandidateSettingsPage />} />
                    </Route>

                    {/* ── Recruiter Portal Workspace ── */}
                    <Route path="/recruiter" element={<RecruiterLayout />}>
                      <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
                      <Route path="dashboard"          element={<RecruiterDashboard />} />
                      <Route path="jobs"               element={<RecruiterJobsPage />} />
                      <Route path="jobs/new"           element={<RecruiterCreateJobPage />} />
                      <Route path="jobs/create"        element={<RecruiterCreateJobPage />} />
                      <Route path="jobs/:id"           element={<RecruiterJobDetailPage />} />
                      <Route path="jobs/:id/applicants" element={<RecruiterApplicantsPage />} />
                      <Route path="candidates"         element={<RecruiterCandidatesPage />} />
                      <Route path="applications"       element={<RecruiterApplicationsPage />} />
                      <Route path="shortlisted"        element={<RecruiterShortlistedPage />} />
                      <Route path="interviews"         element={<RecruiterInterviewsPage />} />
                      <Route path="company"            element={<RecruiterCompanyPage />} />
                      <Route path="internships"        element={<RecruiterInternshipsPage />} />
                      <Route path="job-melas"          element={<RecruiterJobMelaPage />} />
                      <Route path="job-mela"           element={<RecruiterJobMelaPage />} />
                      <Route path="analytics"          element={<RecruiterAnalyticsPage />} />
                      <Route path="notifications"      element={<RecruiterNotificationsPage />} />
                      <Route path="help-support"        element={<RecruiterHelpSupportPage />} />
                      <Route path="settings"           element={<RecruiterSettingsPage />} />
                    </Route>

                    {/* ── Admin Portal Workspace ── */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard"                  element={<AdminDashboard />} />
                      <Route path="candidates"                 element={<AdminCandidatesPage />} />
                      <Route path="recruiters"                 element={<AdminRecruitersPage />} />
                      <Route path="recruiters/requests"        element={<AdminRecruiterRequestsPage />} />
                      <Route path="recruiter-verification"     element={<AdminRecruiterRequestsPage />} />
                      <Route path="companies"                  element={<AdminCompaniesPage />} />
                      <Route path="companies/requests"        element={<AdminCompanyVerificationPage />} />
                      <Route path="company-verification"       element={<AdminCompanyVerificationPage />} />
                      <Route path="jobs"                       element={<AdminJobsPage />} />
                      <Route path="jobs/requests"              element={<AdminJobRequestsPage />} />
                      <Route path="job-approvals"              element={<AdminJobRequestsPage />} />
                      <Route path="internships"                element={<AdminInternshipsPage />} />
                      <Route path="internships/requests"       element={<AdminInternshipRequestsPage />} />
                      <Route path="internship-approvals"       element={<AdminInternshipRequestsPage />} />
                      <Route path="applications"               element={<AdminApplicationsPage />} />
                      <Route path="job-melas"                  element={<AdminJobMelasPage />} />
                      <Route path="job-melas/create"           element={<AdminCreateJobMelaPage />} />
                      <Route path="job-melas/participation"    element={<AdminParticipationPage />} />
                      <Route path="job-melas/registrations"    element={<AdminRegistrationsPage />} />
                      <Route path="registrations"              element={<AdminRegistrationsPage />} />
                      <Route path="reports"                    element={<AdminReportsPage />} />
                      <Route path="analytics"                  element={<AdminAnalyticsPage />} />
                      <Route path="audit-logs"                 element={<AdminAuditLogsPage />} />
                      <Route path="notifications"              element={<AdminNotificationsPage />} />
                      <Route path="website-content"            element={<AdminWebsiteContentPage />} />
                      <Route path="content"                    element={<AdminWebsiteContentPage />} />
                      <Route path="home-content"               element={<AdminWebsiteContentPage />} />
                      <Route path="jobs-content"               element={<AdminWebsiteContentPage />} />
                      <Route path="skill-content"              element={<AdminWebsiteContentPage />} />
                      <Route path="skill-development-content"  element={<AdminWebsiteContentPage />} />
                      <Route path="job-melas-content"          element={<AdminWebsiteContentPage />} />
                      <Route path="about-content"              element={<AdminWebsiteContentPage />} />
                      <Route path="gallery-content"            element={<AdminWebsiteContentPage />} />
                      <Route path="news-content"               element={<AdminWebsiteContentPage />} />
                      <Route path="settings"                   element={<AdminSettingsPage />} />
                      <Route path="profile"                    element={<AdminProfilePage />} />
                      <Route path="change-password"            element={<AdminChangePasswordPage />} />
                    </Route>

                    {/* ── 404 Fallback ── */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>

                  {/* ── Global Animated Curved Mobile Bottom Navigation Bar (Mobile Only) ── */}
                  <MobileBottomNav />
                </BrowserRouter>
              </AdminProvider>
            </RecruiterProvider>
          </CandidateProvider>
        </LanguageProvider>
        <ToastContainer />
      </NotificationProvider>
    </ToastProvider>
  );
}
