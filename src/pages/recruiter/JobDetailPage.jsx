import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase, Building2, MapPin, DollarSign, Calendar, Clock,
  Users, ArrowLeft, Edit2, Eye, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { formatJobId } from '../../utils/applicationUtils';
import recruiterJobService from '../../services/recruiterJobService';

export default function RecruiterJobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchJob() {
      setLoading(true);
      try {
        const data = await recruiterJobService.getJob(id);
        if (isMounted && data) {
          setJob(data);
        }
      } catch (err) {
        console.warn('Failed to load recruiter job details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchJob();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320, color: 'var(--color-text-muted)' }}>
        <Loader2 size={28} className="animate-spin" style={{ marginRight: 10 }} />
        <span>Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-12)', textAlign: 'center' }}>
        <Briefcase size={36} style={{ margin: '0 auto var(--space-3)', color: 'var(--color-text-muted)', opacity: 0.5 }} />
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Job Opening Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 var(--space-4)' }}>
          The requested job opening could not be found or you do not have permission to view it.
        </p>
        <Link to="/recruiter/jobs">
          <Button variant="outline">Back to My Jobs</Button>
        </Link>
      </div>
    );
  }

  const applicantsCount = job.applicant_count ?? job.applicantsCount ?? 0;
  const postedDate = job.posted_at ? job.posted_at.split('T')[0] : (job.postedDate || job.createdAt?.split('T')[0] || 'Recently');
  const deadlineDate = job.deadline || job.application_deadline || 'Open until filled';
  const responsibilitiesList = Array.isArray(job.responsibilities)
    ? job.responsibilities
    : (job.responsibilities ? job.responsibilities.split('\n').filter(Boolean) : []);
  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : (job.skills ? String(job.skills).split(',').map(s => s.trim()).filter(Boolean) : []);

  return (
    <div className="recruiter-job-detail-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Link to="/recruiter/jobs" style={{ textDecoration: 'none', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
                <ArrowLeft size={14} /> Back to My Jobs
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{job.title}</h1>
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: 'var(--color-primary-700)',
                background: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-200)',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {formatJobId(job.id)}
              </span>
              <StatusBadge status={job.status || 'PUBLISHED'} size="lg" />
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Job ID: <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary-700)' }}>{formatJobId(job.id)}</strong> • Posted on {postedDate} • Deadline: {deadlineDate}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to={`/recruiter/jobs/${job.id}/applicants`}>
              <Button variant="primary" size="sm" leftIcon={<Users size={15} />}>
                View {applicantsCount} Applicants
              </Button>
            </Link>
            <Link to={`/jobs/${job.id}`} target="_blank">
              <Button variant="secondary" size="sm" leftIcon={<Eye size={15} />}>
                Public View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Work Mode & Location</span>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginTop: 2 }}>{job.location} ({job.work_mode || job.workMode || 'On-site'})</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Offered Salary CTC</span>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-success-700)', marginTop: 2 }}>
            {job.salary || (job.salary_min ? `₹${job.salary_min >= 100000 ? (job.salary_min / 100000) : job.salary_min} - ₹${job.salary_max >= 100000 ? (job.salary_max / 100000) : job.salary_max} LPA` : 'Competitive')}
          </p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Required Experience</span>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginTop: 2 }}>{job.experience || job.experience_level || 'Any'}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Open Positions</span>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginTop: 2 }}>{job.openings || job.number_of_openings || 1} Openings</p>
        </div>
      </div>

      {/* Description & Responsibilities */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header">
          <h2 className="card-title">Job Specifications & Role Scope</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              Summary
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)' }}>{job.description || job.job_summary || 'No description provided.'}</p>
          </div>

          {responsibilitiesList.length > 0 && (
            <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Core Responsibilities
              </h3>
              <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {responsibilitiesList.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {skillsList.length > 0 && (
            <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Required Qualifications & Skills
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                {skillsList.map((s) => (
                  <span key={s} className="badge badge-primary" style={{ fontSize: 'var(--text-xs)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
