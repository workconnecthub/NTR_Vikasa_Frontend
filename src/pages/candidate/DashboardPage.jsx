import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Bookmark, CalendarDays, TrendingUp, Clock,
  ArrowRight, Search, User, ShieldCheck, Sparkles, CheckCircle2,
  Video, BookmarkCheck, MapPin, DollarSign, Layers, Zap, ExternalLink,
  Settings, BookOpen, GraduationCap, FileCheck, AlertCircle, Loader2
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ApplyModal from '../../components/ui/ApplyModal';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { MOCK_JOBS } from '../../data/mockData';
import candidateDashboardService from '../../services/candidateDashboardService';
import authService from '../../services/authService';

export default function CandidateDashboard() {
  const { toast } = useToast();
  const { candidate, isJobSaved, saveJob, unsaveJob } = useCandidate();

  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // ── API Dashboard State ────────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      // Only call the API if the candidate has a valid JWT token
      if (!authService.isAuthenticated()) {
        setDashLoading(false);
        return;
      }
      try {
        const data = await candidateDashboardService.getDashboard();
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          setDashError(err.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (!cancelled) setDashLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  // ── Derived values: API data takes priority; CandidateContext is the fallback ─
  const displayName     = dashboard?.candidate?.full_name  ?? candidate.name;
  const appliedCount    = dashboard?.statistics?.applied_jobs   ?? 0;
  const shortlistedCnt  = dashboard?.statistics?.shortlisted    ?? 0;
  const interviewsCnt   = dashboard?.statistics?.interviews     ?? 0;
  const savedJobsCnt    = dashboard?.statistics?.saved_jobs     ?? 0;

  // Profile strength — API first, then CandidateContext calculated value
  const profilePct    = dashboard?.profile_strength?.percentage  ?? candidate.profileCompletion;
  const profileLabel  = dashboard?.profile_strength?.label       ?? 'Getting Started';
  const profileItems  = dashboard?.profile_strength?.items       ?? [
    { key: 'basic_info',     label: 'Basic contact information completed', completed: true },
    { key: 'email_verified', label: 'Email address verified',              completed: true },
    { key: 'qualification',  label: 'Education qualification added',       completed: true },
    { key: 'headline',       label: 'Professional headline added',         completed: false },
    { key: 'bio',            label: 'Professional bio / summary written',  completed: false },
    { key: 'location',       label: 'Village / address details added',     completed: false },
  ];

  // Recent Applications — API first
  const recentApplications = dashboard?.recent_applications ?? [];
  const totalApplications  = recentApplications.length;

  // Recommended Jobs — API first, fall back to MOCK_JOBS (max 3) with match scores
  const recommendedJobs = (dashboard?.recommended_jobs?.length > 0)
    ? dashboard.recommended_jobs
    : MOCK_JOBS.slice(0, 3).map((job, idx) => ({
        job_id:          String(job.id),
        title:           job.title,
        company_name:    job.company,
        location:        job.location,
        salary:          job.salary,
        experience:      job.experience,
        employment_type: job.mode,
        match_percentage:idx === 0 ? 94 : idx === 1 ? 92 : 89,
        tags:            job.tags || [],
        is_applied:      false,
        is_saved:        isJobSaved(job.id),
      }));

  // Upcoming Interviews — API only (no fake data)
  const upcomingInterviews = dashboard?.upcoming_interviews ?? [];

  // ── Stat Cards ─────────────────────────────────────────────────────────────
  const statItems = [
    { label: 'Applied',     value: String(appliedCount),    change: '+2 this week', positive: true, icon: <FileText size={20} />, iconBg: '#eef2ff', iconColor: '#4f46e5' },
    { label: 'Shortlisted', value: String(shortlistedCnt),  change: 'In Review',    positive: true, icon: <TrendingUp size={20} />, iconBg: '#f0fdf4', iconColor: '#16a34a', variant: 'success' },
    { label: 'Interviews',  value: String(interviewsCnt),   change: 'Scheduled',    positive: true, icon: <Clock size={20} />, iconBg: '#fffbeb', iconColor: '#d97706', variant: 'warning' },
    { label: 'Saved Jobs',  value: String(savedJobsCnt),    change: 'Bookmarked',   icon: <Bookmark size={20} />, iconBg: '#eff6ff', iconColor: '#2563eb' },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleSave = (jobId, title) => {
    if (isJobSaved(jobId)) {
      unsaveJob(jobId);
      toast({ type: 'info',    title: 'Removed from Saved', message: `Removed "${title}" from saved jobs.` });
    } else {
      saveJob(jobId);
      toast({ type: 'success', title: 'Job Saved',          message: `Saved "${title}" to your bookmarks.` });
    }
  };

  const handleOpenApply = (job) => {
    setSelectedJobToApply(job);
    setApplyModalOpen(true);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (dashLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320, color: 'var(--color-text-muted)' }}>
        <Loader2 size={28} className="spin" style={{ marginRight: 10, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 'var(--text-base)' }}>Loading your dashboard…</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* ── Inline API Error Banner (non-intrusive) ── */}
      {dashError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: '#c2410c',
        }}>
          <AlertCircle size={16} />
          Dashboard data could not be loaded from the server. Showing cached data.
        </div>
      )}

      {/* ── 1. Welcome Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-lg)' }}>👋</span>
            <span style={{ fontSize: 'var(--text-sm)', color: '#c7d2fe', fontWeight: 600 }}>Candidate Career Overview</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: '#ffffff', marginBottom: 'var(--space-1)' }}>
            Welcome back, {displayName} 👋
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: '#cbd5e1' }}>
            Find your next opportunity across top corporate employers in Andhra Pradesh &amp; India.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link to="/candidate/jobs">
            <Button variant="primary" style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 700 }} leftIcon={<Search size={16} />}>
              Search Jobs
            </Button>
          </Link>
          <Link to="/candidate/profile">
            <Button variant="secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }} leftIcon={<User size={16} />}>
              Update Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Statistics Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))', gap: 'var(--space-4)' }}>
        {statItems.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── 3. Quick Links ── */}
      <Card style={{ borderRadius: 'var(--radius-xl)' }}>
        <CardBody style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Links:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Link to="/candidate/jobs" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<Search size={13} />}>Find Jobs</Button>
              </Link>
              <Link to="/candidate/internships" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<BookOpen size={13} />}>Internships</Button>
              </Link>
              <Link to="/candidate/applications" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<FileText size={13} />}>Applied Jobs</Button>
              </Link>
              <Link to="/candidate/saved-jobs" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<Bookmark size={13} />}>Saved Jobs</Button>
              </Link>
              <Link to="/candidate/profile" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<FileCheck size={13} />}>Resume Builder</Button>
              </Link>
              <Link to="/skill-development" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<GraduationCap size={13} />}>Career Resources</Button>
              </Link>
              <Link to="/candidate/settings" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="outline" leftIcon={<Settings size={13} />}>Settings</Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── 4. Main Split Grid: Recent Applications & Profile Strength ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--space-6)' }}>

        {/* Left Column: Recent Applications */}
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title" style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Recent Applications</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Latest active recruitment progress</p>
            </div>
            <Link to="/candidate/applications">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                View All ({totalApplications})
              </Button>
            </Link>
          </CardHeader>

          <CardBody style={{ padding: 0 }}>
            {recentApplications.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.35 }} />
                <p style={{ fontSize: 'var(--text-sm)' }}>No applications yet.</p>
                <Link to="/candidate/jobs" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="primary" style={{ marginTop: 'var(--space-3)' }}>Find Jobs</Button>
                </Link>
              </div>
            ) : (
              recentApplications.slice(0, 4).map((app, i) => (
                <div
                  key={app.application_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: i < recentApplications.slice(0, 4).length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                      {app.job_title}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      <strong>{app.company_name}</strong> • Applied: {app.applied_at}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {app.location}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Right Column: Profile Strength */}
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h2 className="card-title" style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Profile Strength</h2>
            </div>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)' }}>
                Profile {profilePct}% complete
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success-600)', background: 'var(--color-success-50)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {profileLabel}
              </span>
            </div>

            <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: `${profilePct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-600), var(--color-accent-500))', borderRadius: 'var(--radius-full)' }} />
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              Complete the remaining items to increase your recruiter profile visibility by 3.5x:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              {profileItems.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: item.completed ? 'var(--color-success-500)' : 'var(--color-gray-200)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 10
                  }}>
                    {item.completed ? '✓' : ''}
                  </div>
                  <span style={{ color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/candidate/profile" style={{ display: 'block' }}>
              <Button fullWidth variant="outline" size="sm">
                Complete Profile
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* ── 5. Recommended Jobs For You ── */}
      <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Briefcase size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h2 className="card-title" style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Recommended Jobs For You</h2>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Tailored matching based on your skills &amp; preferences
            </p>
          </div>
          <Link to="/candidate/jobs">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              Explore All Jobs
            </Button>
          </Link>
        </CardHeader>

        <CardBody>
          {recommendedJobs.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Briefcase size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.35 }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>No recommended jobs yet. Complete your profile to unlock matches.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)' }}>
              {recommendedJobs.map((job) => {
                const jobId   = job.job_id ?? job.id;
                const saved   = isJobSaved(jobId);
                const title   = job.title   ?? job.title;
                const company = job.company_name ?? job.company;
                const tags    = job.tags ?? [];
                const match   = job.match_percentage ?? job.matchScore;
                const empType = job.employment_type ?? job.mode;

                return (
                  <div
                    key={jobId}
                    className="card card-hoverable"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-5)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Link to={`/candidate/jobs/${jobId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)' }}>
                                {title}
                              </h3>
                            </Link>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>{company}</span>
                            <CheckCircle2 size={13} style={{ color: 'var(--color-success-600)' }} />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSave(jobId, title)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? 'var(--color-primary-600)' : 'var(--color-text-light)' }}
                          aria-label={saved ? 'Unsave job' : 'Save job'}
                        >
                          {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {job.location}</span>}
                        {job.salary   && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12} /> {job.salary}</span>}
                        {job.experience && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {job.experience}</span>}
                        {empType      && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12} /> {empType}</span>}
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                        {(tags.length > 0 ? tags : ['React', 'TypeScript', 'Node.js']).map((skill) => (
                          <span key={skill} style={{ background: 'var(--color-gray-100)', padding: '2px 8px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                      {match != null && (
                        <span style={{ fontSize: '11px', color: 'var(--color-success-600)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Zap size={12} /> {match}% Match
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'auto' }}>
                        <Link to={`/candidate/jobs/${jobId}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Button size="sm" variant="primary" onClick={() => handleOpenApply({ id: jobId, title, company, location: job.location, salary: job.salary, mode: empType })}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 6. Upcoming Scheduled Interviews ── */}
      {upcomingInterviews.length > 0 && (
        <Card style={{ borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-primary-200)', background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Video size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h2 className="card-title" style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Upcoming Scheduled Interviews</h2>
            </div>
            <Link to="/candidate/interviews">
              <Button size="sm" variant="outline">View Calendar</Button>
            </Link>
          </CardHeader>

          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)' }}>
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.interview_id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-5)',
                    border: '1px solid var(--color-primary-100)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <span className="badge badge-warning" style={{ fontSize: '10px', marginBottom: 4 }}>
                      {interview.mode ?? 'Online Interview'}
                    </span>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, marginTop: 4 }}>
                      {interview.job_title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                      {interview.company_name}
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarDays size={13} /> {interview.scheduled_date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {interview.start_time}{interview.end_time ? ` - ${interview.end_time}` : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Platform: {interview.platform ?? '—'}</span>
                    {interview.meeting_url ? (
                      <a href={interview.meeting_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Button size="xs" variant="primary" leftIcon={<ExternalLink size={12} />}>Join Meeting</Button>
                      </a>
                    ) : (
                      <Button size="xs" variant="outline" disabled>Link Pending</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Reusable Apply Modal */}
      {selectedJobToApply && (
        <ApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJobToApply}
        />
      )}
    </div>
  );
}
