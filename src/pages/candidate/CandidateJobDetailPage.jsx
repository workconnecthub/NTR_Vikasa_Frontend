import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, Banknote, Clock, Building2, CheckCircle2,
  Bookmark, BookmarkCheck, ArrowLeft, Share2, ShieldCheck,
  Zap, Award, Check, ExternalLink, Calendar, Users, Globe,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ApplyModal from '../../components/ui/ApplyModal';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import publicService from '../../services/publicService';
import { formatJobId } from '../../utils/applicationUtils';

export default function CandidateJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidate, isJobSaved, saveJob, unsaveJob } = useCandidate();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchJob() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await publicService.getPublishedJob(id);
        if (isMounted && data) {
          setJob(data);
          // Fetch similar jobs by department/industry
          try {
            const simRes = await publicService.getPublishedJobs({
              department: data.department,
              page_size: 4,
            });
            if (isMounted && simRes?.items) {
              setSimilarJobs(simRes.items.filter(sj => sj.id !== data.id && sj.job_id !== data.job_id).slice(0, 3));
            }
          } catch {
            // ignore similar jobs error
          }
        }
      } catch (err) {
        if (isMounted) setLoadError('Job opening not found or not published.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchJob();
    return () => { isMounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="candidate-job-detail-page" style={{ padding: 'var(--space-8)' }}>
        <div style={{ height: 24, width: 140, background: 'var(--color-gray-200)', borderRadius: 4, marginBottom: 'var(--space-6)', animation: 'pulse 1.5s infinite' }} />
        <div className="card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', minHeight: 200, animation: 'pulse 1.5s infinite' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-2xl)', background: 'var(--color-gray-200)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 24, width: '40%', background: 'var(--color-gray-200)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 16, width: '25%', background: 'var(--color-gray-100)', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="candidate-job-detail-page" style={{ padding: 'var(--space-8)' }}>
        <Link
          to="/candidate/jobs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600, marginBottom: 'var(--space-4)' }}
        >
          <ArrowLeft size={16} /> Back to Find Jobs
        </Link>
        <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center', borderRadius: 'var(--radius-2xl)' }}>
          <AlertCircle size={40} style={{ color: 'var(--color-danger-500)', margin: '0 auto var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Job Not Found</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            {loadError || 'The job requisition you are looking for is either closed, pending review, or does not exist.'}
          </p>
          <Link to="/candidate/jobs">
            <Button variant="primary">Browse Published Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const jobId = job.job_id || job.id;
  const isSaved = isJobSaved(jobId) || job.is_saved;
  const companyName = job.company_name || job.company?.name || 'Employer';
  const displaySalary = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min >= 100000 ? (job.salary_min / 100000) : job.salary_min} - ₹${job.salary_max >= 100000 ? (job.salary_max / 100000) : job.salary_max} LPA` : 'Competitive');
  const displayType = job.job_type || job.type || job.employment_type || 'Full-time';
  const displayMode = job.work_mode || job.workMode || job.mode || 'Hybrid';
  const skillsList = job.skills || job.tags || [];

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveJob(jobId);
      setJob(prev => ({ ...prev, is_saved: false }));
      toast({ type: 'info', title: 'Job Removed', message: 'Job removed from your saved list.' });
    } else {
      saveJob(jobId, job);
      setJob(prev => ({ ...prev, is_saved: true }));
      toast({ type: 'success', title: 'Job Saved', message: 'Job saved to your Saved Jobs workspace.' });
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({ type: 'success', title: 'Link Copied', message: 'Job link copied to clipboard.' });
  };

  const handleAppliedSuccess = () => {
    setJob(prev => ({ ...prev, has_applied: true }));
    setApplyModalOpen(false);
  };

  return (
    <div className="candidate-job-detail-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* Back button */}
      <div>
        <Link
          to="/candidate/jobs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Back to Find Jobs
        </Link>
      </div>

      {/* ── Top Hero Card ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              color: '#fff',
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              {companyName?.[0]?.toUpperCase() || 'C'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{job.title}</h1>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '11px',
                  color: 'var(--color-primary-700)',
                  background: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-200)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {formatJobId(job.job_number || job.job_id || job.id)}
                </span>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>
                  <ShieldCheck size={12} style={{ marginRight: 2 }} /> Verified Employer
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                  {companyName}
                </span>
                <span style={{ color: 'var(--color-text-light)' }}>•</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {formatRelativeTime(job.posted_at || job.created_at)}
                </span>
              </div>

              {/* Meta pills */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-700)' }}><Briefcase size={14} /> {formatJobId(job.job_number || job.job_id || job.id)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Banknote size={14} /> {displaySalary}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {job.experience || job.experience_level}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={14} /> {displayType} ({displayMode})</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="md"
              leftIcon={isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              onClick={handleToggleSave}
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
            {job.has_applied ? (
              <Button
                variant="outline"
                size="md"
                disabled
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  borderColor: '#a7f3d0',
                  cursor: 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <CheckCircle2 size={16} /> Applied
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setApplyModalOpen(true)}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-Column Details Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 'var(--space-6)' }}>
        
        {/* Left Column: Description, Responsibilities, Skills, Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Job Description */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
              Job Description
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)' }}>
              {job.description || `We are looking for an experienced ${job.title} to join our high-performing technology team. You will be responsible for building, optimizing, and deploying mission-critical systems and interfaces supporting millions of users across India.`}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                Key Responsibilities
              </h2>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', whiteSpace: 'pre-line', lineHeight: 'var(--leading-relaxed)' }}>
                {job.responsibilities}
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                Requirements & Qualifications
              </h2>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', whiteSpace: 'pre-line', lineHeight: 'var(--leading-relaxed)' }}>
                {job.requirements}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {skillsList.length > 0 && (
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                Required Skills & Tags
              </h2>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: 'var(--color-primary-50)',
                      color: 'var(--color-primary-700)',
                      border: '1px solid var(--color-primary-200)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Overview Card & Similar Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Job Overview Card */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              Job Overview
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-gray-100)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Job Location</span>
                <strong style={{ color: 'var(--color-text)' }}>{job.location}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-gray-100)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Salary Offered</span>
                <strong style={{ color: 'var(--color-success-700)' }}>{displaySalary}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-gray-100)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Experience</span>
                <strong style={{ color: 'var(--color-text)' }}>{job.experience || job.experience_level}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-gray-100)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Work Mode</span>
                <strong style={{ color: 'var(--color-text)' }}>{displayMode}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Job Type</span>
                <strong style={{ color: 'var(--color-text)' }}>{displayType}</strong>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              {job.has_applied ? (
                <Button fullWidth variant="outline" disabled style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                  <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Already Applied
                </Button>
              ) : (
                <Button fullWidth variant="primary" onClick={() => setApplyModalOpen(true)}>
                  Apply for this Role
                </Button>
              )}
            </div>
          </div>

          {/* Similar Jobs Widget */}
          {similarJobs.length > 0 && (
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
                Similar Jobs You May Like
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {similarJobs.map((simJob) => (
                  <Link
                    key={simJob.id}
                    to={`/candidate/jobs/${simJob.job_id || simJob.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-gray-100)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      background: 'var(--color-bg)'
                    }}
                  >
                    <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                      {simJob.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{simJob.company_name || simJob.company} • {simJob.location}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)' }}>{simJob.salary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={job}
        onAppliedSuccess={handleAppliedSuccess}
      />
    </div>
  );
}
