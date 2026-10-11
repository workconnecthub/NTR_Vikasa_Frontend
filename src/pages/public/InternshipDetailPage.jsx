import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Clock, Briefcase, Banknote, Building2, Calendar, Users,
  Share2, Bookmark, BookmarkCheck, ArrowLeft, CheckCircle2,
  GraduationCap, Sparkles, ExternalLink, Send, ShieldCheck,
  AlertCircle, ArrowRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import FileUpload from '../../components/ui/FileUpload';
import { InternshipCard } from '../../components/ui/EntityCards';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import publicService from '../../services/publicService';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { candidate, isLoggedIn } = useCandidate();
  const completion = candidate?.profileCompletion ?? 0;

  const [saved, setSaved] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveInternship, setLiveInternship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [coverNote, setCoverNote] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchInternship() {
      setIsLoading(true);
      try {
        const data = await publicService.getPublishedInternship(id);
        if (isMounted && data) {
          setLiveInternship(data);
        }
      } catch (err) {
        console.warn('InternshipDetailPage load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchInternship();
    return () => { isMounted = false; };
  }, [id]);

  const internship = useMemo(() => {
    if (!liveInternship) return null;
    return {
      ...liveInternship,
      id: liveInternship.internship_id || liveInternship.id,
      title: liveInternship.title,
      company: liveInternship.company_name || liveInternship.company?.name || 'Employer',
      companyId: liveInternship.company_id || 'comp-1',
      location: liveInternship.location || 'India',
      stipend: liveInternship.stipend || (liveInternship.stipend_amount ? `₹${liveInternship.stipend_amount.toLocaleString()}/mo` : 'Unpaid'),
      duration: liveInternship.duration || '3 Months',
      type: liveInternship.employment_type || 'Internship',
      mode: liveInternship.work_mode || 'Hybrid',
      skills: liveInternship.skills || [],
      description: liveInternship.description || '',
      requirements: liveInternship.requirements ? (Array.isArray(liveInternship.requirements) ? liveInternship.requirements : [liveInternship.requirements]) : [],
      perks: liveInternship.perks ? (Array.isArray(liveInternship.perks) ? liveInternship.perks : [liveInternship.perks]) : [],
      startDate: liveInternship.start_date || 'Immediately',
      applicationDeadline: liveInternship.deadline || '2026-11-30',
      openings: liveInternship.vacancies || liveInternship.openings || 1,
    };
  }, [liveInternship]);

  const company = useMemo(() => {
    if (!internship) return null;
    return {
      id: internship.companyId,
      name: internship.company,
      location: internship.location,
      industry: internship.department || 'Technology',
      description: 'Verified employer partner on NTR Vikasa Job Portal.',
    };
  }, [internship]);

  const similar = useMemo(() => [], []);

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
          redirectTo: `/internships/${internship.id}?apply=true`,
          internshipId: internship.id,
          jobTitle: internship.title
        }
      });
      return;
    }
    setApplyModalOpen(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApplied(true);
      setApplyModalOpen(false);
      toast({
        type: 'success',
        title: 'Application Submitted!',
        message: `Your application for ${internship.title} at ${internship.company} has been received.`,
      });
    }, 1000);
  };

  const handleToggleSave = () => {
    const newState = !saved;
    setSaved(newState);
    toast({
      type: newState ? 'success' : 'info',
      title: newState ? 'Internship Saved' : 'Removed from Saved',
      message: newState ? `Added "${internship.title}" to saved items.` : `Removed from saved items.`,
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        type: 'info',
        title: 'Link Copied',
        message: 'Internship link copied to clipboard!',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="internship-detail-page" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--color-text-muted)' }}>Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="internship-detail-page" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Internship Not Found</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 var(--space-4)' }}>
            The requested internship opening is not available or has expired.
          </p>
          <Link to="/internships">
            <Button variant="outline">Back to Internships</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="internship-detail-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-20)' }}>
      {/* Breadcrumb Bar */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Internships', href: '/internships' }, { label: internship.title }]} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="responsive-split-detail">

          {/* ── Left Content Column ── */}
          <div>
            {/* Header Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-body" style={{ padding: 'var(--space-8)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className="job-card-logo" style={{
                    width: 72, height: 72,
                    borderRadius: 'var(--radius-2xl)',
                    fontSize: 'var(--text-3xl)',
                    background: 'linear-gradient(135deg, var(--color-info-500), var(--color-primary-600))',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {internship.company?.[0] || 'I'}
                  </div>

                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{internship.title}</h1>
                      <Badge variant="info">Internship</Badge>
                      <StatusBadge status={internship.status || 'PUBLISHED'} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <Link
                        to={`/companies/${internship.companyId}`}
                        style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontSize: 'var(--text-base)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Building2 size={16} /> {internship.company}
                      </Link>
                      <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        {internship.department || 'Product & Tech'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant={applied ? 'secondary' : 'primary'}
                      size="md"
                      onClick={handleApplyClick}
                      disabled={applied}
                    >
                      {applied ? '✓ Applied' : 'Apply Now'}
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly leftIcon={<Share2 size={16} />} onClick={handleShare} aria-label="Share" />
                    <Button variant={saved ? 'primary' : 'secondary'} size="sm" iconOnly leftIcon={saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} onClick={handleToggleSave} aria-label="Save" />
                  </div>
                </div>

                {/* Key Internship Metadata */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-4)',
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-6)',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-success-50)', color: 'var(--color-success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Monthly Stipend</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{internship.stipend}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Duration</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{internship.duration}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-warning-50)', color: 'var(--color-warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Location & Mode</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{internship.location} ({internship.mode})</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-info-50)', color: 'var(--color-info-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Start Date</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                        {new Date(internship.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-danger-50)', color: 'var(--color-danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Apply By</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                        {new Date(internship.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-gray-100)', color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Openings</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{internship.openings} Seats</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
                    Skills Required
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {internship.skills?.map((skill) => (
                      <span key={skill} className="badge badge-info" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header"><h2 className="card-title">About the Internship</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text)' }}>
                  {internship.description}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header"><h2 className="card-title">Intern Responsibilities</h2></div>
              <div className="card-body">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {internship.responsibilities?.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--color-success-600)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Eligibility & Qualifications */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header"><h2 className="card-title">Candidate Eligibility</h2></div>
              <div className="card-body">
                <div style={{ background: 'var(--color-info-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-info-200)', marginBottom: 'var(--space-3)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-info-700)', textTransform: 'uppercase', marginBottom: 2 }}>
                    Who can apply
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontWeight: 600 }}>
                    {internship.eligibility}
                  </p>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Candidates must be available for the full duration of <strong>{internship.duration}</strong> starting around <strong>{internship.startDate}</strong>.
                </p>
              </div>
            </div>

            {/* Perks */}
            {internship.perks && (
              <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                <div className="card-header"><h2 className="card-title">Perks & Learning Benefits</h2></div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                    {internship.perks.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', padding: 'var(--space-2)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <Sparkles size={16} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sticky Right Column ── */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="card-body" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Monthly Compensation</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success-700)' }}>
                    {internship.stipend}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {internship.applicationsCount}+ candidates applied
                  </p>
                </div>

                {applied ? (
                  <div style={{ background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--color-success-600)', margin: '0 auto var(--space-1)' }} />
                    <p style={{ fontWeight: 700, color: 'var(--color-success-700)', fontSize: 'var(--text-sm)' }}>
                      Application Submitted!
                    </p>
                  </div>
                ) : (
                  <Button variant="primary" size="lg" fullWidth onClick={handleApplyClick} style={{ marginBottom: 'var(--space-3)' }}>
                    Apply for Internship
                  </Button>
                )}

                <Button variant="outline" fullWidth onClick={handleToggleSave}>
                  {saved ? 'Saved in My Internships' : 'Save for Later'}
                </Button>
              </div>
            </div>

            {/* Safety badge */}
            <div style={{ background: 'var(--color-gray-100)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-success-600)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-normal)' }}>
                <strong>Verified Internship:</strong> Certified authentic stipend offer. No application charges.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Sticky Apply Bar (Visible only on <= 1024px) ── */}
      <div className="mobile-apply-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {internship.title}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
            {internship.stipend} • {internship.company}
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
            aria-label="Save"
          />
        </div>
      </div>

      {/* Apply Modal */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply: ${internship.title}`} size="md">
        {completion < 70 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <AlertCircle size={36} />
            </div>

            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              Complete your profile to apply
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
              Your profile is currently {completion}% complete. Please complete at least 70% of your profile before applying for jobs.
            </p>

            <div style={{
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Profile Completion:
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>
                  {completion}% <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ 70% Required</span>
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(completion, 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                onClick={() => {
                  setApplyModalOpen(false);
                  navigate('/candidate/profile');
                }}
                rightIcon={<ArrowRight size={15} />}
              >
                Complete Profile
              </Button>
              <Button variant="secondary" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Full Name" htmlFor="name" required>
              <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <FormField label="Email" htmlFor="email" required>
                <Input id="email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </FormField>
              <FormField label="Phone" htmlFor="phone" required>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
              <FormField label="College / University" htmlFor="college" required>
                <Input id="college" placeholder="e.g. IIT Bengaluru, NIT..." value={college} onChange={(e) => setCollege(e.target.value)} required />
              </FormField>
              <FormField label="Graduation Year" htmlFor="gradYear">
                <Input id="gradYear" placeholder="2026" value={gradYear} onChange={(e) => setGradYear(e.target.value)} />
              </FormField>
            </div>

            <FormField label="Resume / CV" required hint="PDF, DOC, DOCX up to 5MB">
              <FileUpload accept=".pdf,.doc,.docx" maxSize="5 MB" />
            </FormField>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button variant="secondary" type="button" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={isSubmitting} leftIcon={<Send size={16} />}>Submit Application</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
