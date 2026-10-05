import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Clock, CheckCircle2, TrendingUp, AlertCircle,
  Plus, ArrowRight, Eye, CalendarCheck, Building2, UserCheck,
  Sparkles, FileText, ChevronRight, Video, MapPin, Loader2
} from 'lucide-react';
import { useRecruiter } from '../../context/RecruiterContext';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import recruiterDashboardService from '../../services/recruiterDashboardService';

export default function RecruiterDashboard() {
  const { recruiter } = useRecruiter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recruiterDashboardService.getDashboard();
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load recruiter dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const liveRecruiter = dashboardData?.recruiter || recruiter;
  const summary = dashboardData?.summary;
  const pipeline = dashboardData?.pipeline;

  const jobs = dashboardData?.active_jobs || recruiter?.jobs || [];
  const applicants = dashboardData?.recent_applications || recruiter?.applicants || [];
  const interviews = dashboardData?.upcoming_interviews || recruiter?.interviews || [];

  const activeJobsCount = summary ? summary.active_jobs : jobs.filter(j => j.status === 'PUBLISHED').length;
  const pendingJobsCount = summary ? summary.pending_approvals : jobs.filter(j => j.status === 'PENDING').length;
  const totalApplicantsCount = summary ? summary.total_applications : applicants.length;
  const shortlistedCount = summary ? summary.shortlisted_pool : applicants.filter(a => a.status === 'SHORTLISTED').length;
  const upcomingInterviewsCount = summary ? summary.upcoming_interviews : interviews.filter(i => (i.status === 'SCHEDULED' || i.status === 'CONFIRMED')).length;

  const STATS = [
    { label: 'Active Jobs', value: String(activeJobsCount), change: 'Currently live', positive: true, icon: <Briefcase size={20} />, iconBg: '#eef2ff', iconColor: 'var(--color-primary-600)' },
    { label: 'Pending Approvals', value: String(pendingJobsCount), change: 'Admin moderation', positive: false, icon: <Clock size={20} />, iconBg: '#fffbeb', iconColor: '#d97706', variant: 'warning' },
    { label: 'Total Applications', value: String(totalApplicantsCount), change: '+18 this week', positive: true, icon: <Users size={20} />, iconBg: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Shortlisted Pool', value: String(shortlistedCount), change: 'Ready for interview', positive: true, icon: <TrendingUp size={20} />, iconBg: '#f0fdf4', iconColor: '#16a34a', variant: 'success' },
    { label: 'Upcoming Interviews', value: String(upcomingInterviewsCount), change: 'Scheduled rounds', positive: true, icon: <CalendarCheck size={20} />, iconBg: '#fdf4ff', iconColor: '#9333ea', variant: 'default' },
  ];

  const recentApplicants = applicants.slice(0, 5);
  const recentJobs = jobs.slice(0, 4);
  const upcomingInterviews = interviews.slice(0, 3);

  const underReviewCount = pipeline ? pipeline.under_review : applicants.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'APPLIED').length;
  const shortlistedPipelineCount = pipeline ? pipeline.shortlisted : shortlistedCount;
  const interviewsPipelineCount = pipeline ? pipeline.interviews : interviews.length;
  const selectedHiredCount = pipeline ? pipeline.selected_hired : applicants.filter(a => a.status === 'SELECTED' || a.status === 'HIRED').length;

  if (loading && !dashboardData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320, color: 'var(--color-text-muted)' }}>
        <Loader2 size={28} className="spin" style={{ marginRight: 10, animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 'var(--text-base)' }}>Loading recruiter dashboard…</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* ── Inline API Error Banner (if any) ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: '#c2410c',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── 1. Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span className="badge badge-success" style={{ fontSize: '11px', background: '#10b981', color: '#fff' }}>
              ✓ Verified Employer
            </span>
            <span style={{ fontSize: 'var(--text-xs)', opacity: 0.9, color: '#c7d2fe', fontWeight: 600 }}>
              {liveRecruiter?.company_name || liveRecruiter?.company?.name || 'Enterprise Employer'}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: '#ffffff', marginBottom: 'var(--space-2)' }}>
            Welcome back, {liveRecruiter?.name || 'Recruiter'}!
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: '#cbd5e1', maxWidth: '650px', margin: 0 }}>
            {liveRecruiter?.designation || 'Talent Acquisition'} • You have <strong>{shortlistedCount} shortlisted candidates</strong> awaiting interview scheduling and <strong>{upcomingInterviewsCount} upcoming interviews</strong>.
          </p>
        </div>
      </div>

      {/* ── 2. Stat Cards (5 Core Metrics) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── 3. Recruitment Pipeline Funnel ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Active Recruitment Pipeline</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>Real-time conversion across all job requisitions</p>
          </div>
          <Link to="/recruiter/analytics" style={{ fontSize: '0.85rem', color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
            Detailed Analytics →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
          {[
            { stage: '1. Applications', count: totalApplicantsCount, color: 'var(--color-primary-600)', pct: '100%' },
            { stage: '2. Under Review', count: underReviewCount, color: '#f59e0b', pct: `${totalApplicantsCount > 0 ? Math.round((underReviewCount / totalApplicantsCount) * 100) : 0}%` },
            { stage: '3. Shortlisted', count: shortlistedPipelineCount, color: '#8b5cf6', pct: `${totalApplicantsCount > 0 ? Math.round((shortlistedPipelineCount / totalApplicantsCount) * 100) : 0}%` },
            { stage: '4. Interviews', count: interviewsPipelineCount, color: '#06b6d4', pct: `${totalApplicantsCount > 0 ? Math.round((interviewsPipelineCount / totalApplicantsCount) * 100) : 0}%` },
            { stage: '5. Selected / Hired', count: selectedHiredCount, color: '#10b981', pct: `${totalApplicantsCount > 0 ? Math.round((selectedHiredCount / totalApplicantsCount) * 100) : 0}%` },
          ].map((step) => (
            <div key={step.stage} style={{
              background: 'var(--color-gray-50)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>{step.stage}</span>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: step.color, margin: 0 }}>{step.count}</p>
              <div style={{ height: 4, background: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: step.pct, height: '100%', background: step.color }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>{step.pct} of applicants</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main Grid: Recent Applications + Posted Jobs + Upcoming Interviews ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>

        {/* Recent Applications Card */}
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Recent Applications</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Latest candidate submissions</span>
            </div>
            <Link to="/recruiter/applications">
              <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />}>View All</Button>
            </Link>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            {recentApplicants.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>No applications yet.</div>
            ) : (
              recentApplicants.map((cand, i) => {
                const candName = cand.candidateName || cand.candidate_name || 'Applicant';
                const matchVal = cand.matchScore ?? cand.match_percentage;
                const jobTitle = cand.jobTitle || cand.job_title;
                const appliedDate = cand.appliedDate || cand.applied_date;
                return (
                  <div key={cand.id || i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderBottom: i < recentApplicants.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--color-gray-900)' }}>{candName}</p>
                        {matchVal != null && (
                          <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '0.1rem 0.4rem', borderRadius: '8px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                            ⚡ {matchVal}% Match
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary-700)', fontWeight: 600, margin: '0.15rem 0' }}>{jobTitle}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Experience: {cand.experience || '3+ yrs'} • Applied {appliedDate}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <StatusBadge status={cand.status} />
                      <Link to="/recruiter/applications">
                        <Button size="xs" variant="outline">Review</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Posted Jobs Card */}
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Active Job Positions</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Requisitions and applicant status</span>
            </div>
            <Link to="/recruiter/jobs">
              <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />}>Manage Jobs</Button>
            </Link>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            {recentJobs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>No jobs posted yet.</div>
            ) : (
              recentJobs.map((job, i) => {
                const appCount = job.applicantsCount ?? job.applications_count ?? 0;
                return (
                  <div key={job.id || i} style={{
                    padding: '1rem 1.25rem',
                    borderBottom: i < recentJobs.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <Link to={`/recruiter/jobs`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--color-gray-900)' }}>{job.title}</p>
                      </Link>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2, margin: 0 }}>
                        {job.department} • {job.location || 'Bengaluru'}
                      </p>
                      <Link to={`/recruiter/applications`} style={{ fontSize: '0.8rem', color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                        {appCount} Applicants Received →
                      </Link>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={job.status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

      </div>

      {/* ── 5. Upcoming Interviews Bar ── */}
      {upcomingInterviews.length > 0 && (
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarCheck size={20} color="var(--color-primary-600)" />
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Upcoming Interviews</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Confirmed rounds for the week</span>
              </div>
            </div>
            <Link to="/recruiter/interviews">
              <Button variant="outline" size="sm">Full Calendar</Button>
            </Link>
          </CardHeader>
          <CardBody style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {upcomingInterviews.map((item, idx) => {
                const candName = item.candidateName || item.candidate_name;
                const jobTitle = item.jobTitle || item.job_title;
                const meetLink = item.meetingLink || item.meeting_link;
                const interviewType = item.type || item.interview_type || item.round_name;
                return (
                  <div key={item.id || idx} style={{
                    background: '#f8fafc',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: '0.9rem' }}>{candName}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#e0e7ff', color: '#4338ca', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {item.time || '11:00 AM'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-700)', fontWeight: 500 }}>
                      {jobTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {item.date} • {interviewType}
                    </div>
                    {meetLink && (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginTop: '0.25rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          color: '#2563eb',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <Video size={14} /> Join Meeting Round
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

    </div>
  );
}
