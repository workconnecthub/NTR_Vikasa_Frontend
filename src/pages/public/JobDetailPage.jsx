import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Clock, Briefcase, Banknote, Building2, Calendar, Users,
  Share2, Bookmark, BookmarkCheck, ArrowLeft, CheckCircle2, Flag,
  ChevronRight, Sparkles, ExternalLink, Mail, Phone, ShieldCheck,
  Send, AlertTriangle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Textarea from '../../components/ui/Textarea';
import { JobCard } from '../../components/ui/EntityCards';
import ApplyModal from '../../components/ui/ApplyModal';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { MOCK_JOBS, MOCK_COMPANIES } from '../../data/mockData';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLoggedIn } = useCandidate();

  const [saved, setSaved] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  // Report job form fields
  const [reportReason, setReportReason] = useState('Misleading salary or job description');
  const [reportDetails, setReportDetails] = useState('');

  const [liveJob, setLiveJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveJob() {
      setIsLoading(true);
      try {
        const data = await publicService.getPublishedJob(jobId);
        if (isMounted && data) {
          setLiveJob(data);
        }
      } catch (err) {
        console.warn('Public JobDetailPage load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchLiveJob();
    return () => { isMounted = false; };
  }, [jobId]);

  // Locate the job or fallback to live job
  const job = useMemo(() => {
    if (liveJob) {
      return {
        ...liveJob,
        id: liveJob.job_id || liveJob.id,
        title: liveJob.title,
        company: liveJob.company_name || liveJob.company?.name || 'Employer',
        companyId: liveJob.company_id || 'comp-1',
        location: liveJob.location,
        salary: liveJob.salary || (liveJob.salary_min ? `₹${liveJob.salary_min >= 100000 ? (liveJob.salary_min / 100000) : liveJob.salary_min} - ₹${liveJob.salary_max >= 100000 ? (liveJob.salary_max / 100000) : liveJob.salary_max} LPA` : 'Competitive'),
        experience: liveJob.experience || liveJob.experience_level || '3-5 years',
        type: liveJob.job_type || liveJob.employment_type || 'Full-time',
        mode: liveJob.work_mode || liveJob.workMode || 'Hybrid',
        tags: liveJob.skills || liveJob.tags || [],
        matchScore: liveJob.match_score || 92,
        verified: liveJob.company_verified ?? true,
        postedTime: liveJob.posted_at ? `Posted ${liveJob.posted_at.split(' ')[0]}` : 'Posted recently',
        description: liveJob.description || liveJob.job_summary || '',
        requirements: liveJob.requirements ? [liveJob.requirements] : [],
        responsibilities: liveJob.responsibilities ? [liveJob.responsibilities] : [],
      };
    }
    return null;
  }, [liveJob]);

  // Locate company information
  const company = useMemo(() => {
    if (!job) return null;
    return {
      id: job.companyId || 'comp-1',
      name: job.company || 'Employer',
      verified: true,
      location: job.location || 'India',
      industry: job.department || 'Information Technology',
      description: 'Verified corporate employer partner on NTR Vikasa Job Portal.',
    };
  }, [job]);

  // Similar jobs (empty or loaded)
  const similarJobs = useMemo(() => [], []);

  // If user returned from login with ?apply=true, automatically open the apply modal
  useEffect(() => {
    if (searchParams.get('apply') === 'true' && isLoggedIn) {
      setApplyModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('apply');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, isLoggedIn, setSearchParams]);

  const handleApplyClick = () => {
    if (applied) return;
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: `/jobs/${job.id}?apply=true`,
          jobId: job.id,
          jobTitle: job.title
        }
      });
      return;
    }
    setApplyModalOpen(true);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setReportModalOpen(false);
      toast({
        type: 'info',
        title: 'Report Received',
        message: 'Thank you for keeping NTR VIKASA Job Portal safe. Our trust & safety team will review this listing within 24 hours.',
      });
    }, 800);
  };

  const handleToggleSave = () => {
    const newState = !saved;
    setSaved(newState);
    toast({
      type: newState ? 'success' : 'info',
      title: newState ? 'Job Saved' : 'Job Removed',
      message: newState ? `Added "${job.title}" to your Saved Jobs.` : `Removed from Saved Jobs.`,
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        type: 'info',
        title: 'Link Copied',
        message: 'Job link copied to clipboard!',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="job-detail-page" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--color-text-muted)' }}>Loading job opening details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-page" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Job Not Found</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 var(--space-4)' }}>
            The requested job opening is not available or has not been published yet.
          </p>
          <Link to="/jobs">
            <Button variant="primary">Browse Jobs Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-20)' }}>
      {/* Top Breadcrumb navigation */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Jobs', href: '/jobs' }, { label: job.title }]} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        {/* Header Hero Card */}
        <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-body" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="job-card-logo" style={{
                width: 72, height: 72,
                borderRadius: 'var(--radius-2xl)',
                fontSize: 'var(--text-3xl)',
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {job.company?.[0] || 'J'}
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                    {job.title}
                  </h1>
                  {job.isNew && <Badge variant="success">New</Badge>}
                  {job.isFeatured && <Badge variant="primary">Featured</Badge>}
                  <StatusBadge status={job.status || 'PUBLISHED'} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <Link
                    to={`/companies/${job.companyId}`}
                    style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontSize: 'var(--text-base)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Building2 size={16} /> {job.company}
                  </Link>
                  <ShieldCheck size={16} style={{ color: 'var(--color-primary-600)' }} />
                  <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    {job.department || 'Engineering'}
                  </span>
                </div>
              </div>

              {/* Header action buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant={applied ? 'secondary' : 'primary'}
                  size="md"
                  onClick={handleApplyClick}
                  disabled={applied}
                >
                  {applied ? '✓ Applied' : 'Apply Now'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  leftIcon={<Share2 size={16} />}
                  onClick={handleShare}
                  aria-label="Share Job"
                  title="Share Job"
                />
                <Button
                  variant={saved ? 'primary' : 'secondary'}
                  size="sm"
                  iconOnly
                  leftIcon={saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  onClick={handleToggleSave}
                  aria-label={saved ? 'Unsave Job' : 'Save Job'}
                  title={saved ? 'Saved' : 'Save Job'}
                />
              </div>
            </div>

            {/* Meta Attributes Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Banknote size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Salary</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{job.salary || '₹14–₹22 LPA'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{job.location}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Experience</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{job.experience}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Job Type / Work Mode</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{job.type} • {job.workMode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>

          {/* Left Column — Detailed Job Breakdown */}
          <div style={{ gridColumn: 'span 8' }} className="job-detail-main">

            {/* 1. Job Description */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header">
                <h2 className="card-title">Job Description</h2>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                  {job.description}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                  We are looking for passionate engineers with strong problem-solving acumen who thrive in high-autonomy environments. You will collaborate closely with cross-functional product managers, designers, and site reliability engineers.
                </p>
              </div>
            </div>

            {/* 2. Responsibilities */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header">
                <h2 className="card-title">Key Responsibilities</h2>
              </div>
              <div className="card-body">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingLeft: 0, listStyle: 'none' }}>
                  {[
                    'Design, build, and maintain efficient, reusable, and testable code across micro-services.',
                    'Participate in agile code reviews, architecture RFC sessions, and technical design sprints.',
                    'Optimize database queries and background worker queues for minimal response times.',
                    'Collaborate with UI/UX designers to translate Figma designs into pixel-perfect components.',
                    'Mentor junior software engineers and champion engineering best practices.'
                  ].map((resp, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: 'var(--color-text)' }}>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Required Skills & Qualifications */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header">
                <h2 className="card-title">Required Skills & Qualifications</h2>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                    Technical Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {job.skills?.map((skill) => (
                      <span key={skill} style={{
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: 'var(--color-primary-700)', background: 'var(--color-primary-50)',
                        padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-primary-200)'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                    Education & Credentials
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                    {job.education || "Bachelor's / Master's degree in Computer Science, Information Technology, or equivalent practical experience."}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Salary & Benefits */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header">
                <h2 className="card-title">Salary, Perks & Benefits</h2>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                  {['Comprehensive Health & Life Insurance', 'Hybrid Work Flexibility', 'Annual Learning Stipend (₹50,000)', 'Performance Bonuses & Stock Grants', 'Free Meals & Shuttle Support'].map((benefit) => (
                    <div key={benefit} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: 'var(--space-3)', background: 'var(--color-gray-50)',
                      borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)'
                    }}>
                      <Sparkles size={16} style={{ color: 'var(--color-accent-600)', flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. About the Hiring Company */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">About {company.name}</h2>
                <Link to={`/companies/${company.id}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ExternalLink size={14} />}>
                    View Company Profile
                  </Button>
                </Link>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                  {company.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                  <span><strong>Industry:</strong> {company.industry}</span>
                  <span><strong>Company Size:</strong> {company.size}</span>
                  <span><strong>Headquarters:</strong> {company.location}</span>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                      Visit Website <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ── Sticky Right Action Sidebar ── */}
          <div style={{ gridColumn: 'span 4' }} className="hide-mobile">
            <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Apply Action Card */}
              <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="card-body" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Total Applications</p>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                      {job.applicationsCount || 45}+ Applicants
                    </p>
                  </div>

                  {applied ? (
                    <div style={{
                      background: 'var(--color-success-50)',
                      border: '1px solid var(--color-success-200)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: 'var(--space-4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      <CheckCircle2 size={28} style={{ color: 'var(--color-success-600)' }} />
                      <p style={{ fontWeight: 700, color: 'var(--color-success-700)', fontSize: 'var(--text-sm)' }}>
                        Application Submitted!
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginBottom: 'var(--space-2)' }}>
                        Status: <strong>Applied & Under Review</strong>
                      </p>
                      <Link to="/candidate/applications" style={{ width: '100%' }}>
                        <Button variant="primary" size="sm" fullWidth rightIcon={<ChevronRight size={14} />}>
                          Track on Candidate Portal
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleApplyClick}
                      style={{ marginBottom: 'var(--space-3)' }}
                    >
                      Apply for this Position
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleToggleSave}
                    leftIcon={saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  >
                    {saved ? 'Saved in My Bookmarks' : 'Save for Later'}
                  </Button>

                  <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer'
                      }}
                    >
                      <Flag size={12} /> Report this Job
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Job Summary Info Card */}
              <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Job Overview</h3>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Posted Date:</span>
                    <strong>{new Date(job.postedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Industry:</span>
                    <strong>{job.industry}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Work Mode:</span>
                    <strong>{job.workMode}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Openings:</span>
                    <strong>{job.openings}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
                    <strong>{job.location}</strong>
                  </div>
                </div>
              </div>

              {/* Trust & Safety notice */}
              <div style={{
                background: 'var(--color-gray-100)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start'
              }}>
                <ShieldCheck size={20} style={{ color: 'var(--color-success-600)', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
                  <strong>NTR VIKASA Job Portal Verified:</strong> This recruiter is verified. NTR VIKASA Job Portal never charges job seekers for interview slots or offer letters.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* 6. Similar Jobs Section — Full Width at Bottom */}
        <div style={{ marginTop: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Similar Job Openings
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {similarJobs.map((simJob) => (
              <JobCard key={simJob.id} job={simJob} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Apply Bar (Visible only on <= 1024px) ── */}
      <div className="mobile-apply-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.title}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
            {job.salary} • {job.company}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            variant={applied ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleApplyClick}
            disabled={applied}
          >
            {applied ? '✓ Applied' : 'Apply Now'}
          </Button>
          <Button
            variant={saved ? 'primary' : 'secondary'}
            size="sm"
            iconOnly
            leftIcon={saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            onClick={handleToggleSave}
            aria-label={saved ? 'Unsave Job' : 'Save Job'}
          />
        </div>
      </div>

      {/* ── 1. Apply Job Modal ── */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={job}
        onAppliedSuccess={() => setApplied(true)}
      />

      {/* ── 2. Report Job Modal ── */}
      <Modal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Job Listing"
        size="sm"
      >
        <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Help us maintain a safe community. Reports are reviewed by our trust team.
          </p>

          <FormField label="Reason for Report" htmlFor="reportReason" required>
            <select
              id="reportReason"
              className="select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="Misleading salary or job description">Misleading salary or job description</option>
              <option value="Asking for money or registration fee">Asking for money or registration fee</option>
              <option value="Suspicious or fake company identity">Suspicious or fake company identity</option>
              <option value="Expired or inactive position">Expired or inactive position</option>
              <option value="Inappropriate or offensive content">Inappropriate or offensive content</option>
            </select>
          </FormField>

          <FormField label="Additional Details" htmlFor="reportDetails">
            <Textarea
              id="reportDetails"
              rows={3}
              placeholder="Provide any additional context or evidence..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
          </FormField>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" type="button" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" loading={isSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
