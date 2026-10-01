import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, Building2, Users, CheckCircle2,
  AlertCircle, Share2, Sparkles, Send, ShieldCheck, FileText,
  Mail, Phone, Info, Award, Eye, Download
} from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import JobMelaPosterModal, { downloadPosterImage } from '../../components/ui/JobMelaPosterModal';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import { useCandidate } from '../../context/CandidateContext';
import { MOCK_JOB_MELAS } from '../../data/mockData';

export default function JobMelaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { jobMelas, getMelaStats, registerForJobMela, applyToJobMelaCompany } = useAdmin();
  const { candidate, isLoggedIn, updateCandidate } = useCandidate();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  // Form inputs - prepopulate from candidate profile if logged in
  const [candidateName, setCandidateName] = useState(candidate?.name || '');
  const [candidateEmail, setCandidateEmail] = useState(candidate?.email || '');
  const [candidatePhone, setCandidatePhone] = useState(candidate?.phone || '');
  const [qualification, setQualification] = useState("Bachelor's Degree (B.Tech, B.E, B.Sc, B.Com, BCA)");
  const [experience, setExperience] = useState('Fresher (0-1 yr)');

  const mela = useMemo(() => {
    const fromAdmin = (jobMelas || []).find((m) => String(m.id) === String(id));
    if (fromAdmin) {
      const companies = (fromAdmin.participatingCompanies && fromAdmin.participatingCompanies.length > 0)
        ? fromAdmin.participatingCompanies
        : (fromAdmin.availableJobs && fromAdmin.availableJobs.length > 0
          ? fromAdmin.availableJobs.map((j, idx) => ({
              id: `${fromAdmin.id}-c-${idx}`,
              company: j.company,
              position: j.title,
              salary: j.salary,
              vacancies: j.vacancies,
              qualification: 'Graduate',
              experience: '0-2 Yrs'
            }))
          : []);

      return {
        ...fromAdmin,
        title: fromAdmin.title || fromAdmin.event,
        venue: fromAdmin.venue || fromAdmin.location,
        city: fromAdmin.city || (fromAdmin.location ? fromAdmin.location.split(',')[0].trim() : 'City'),
        state: fromAdmin.state || (fromAdmin.location && fromAdmin.location.includes(',') ? fromAdmin.location.split(',')[1].trim() : 'Andhra Pradesh'),
        time: fromAdmin.time || `${fromAdmin.startTime || '09:00 AM'} - ${fromAdmin.endTime || '06:00 PM'}`,
        registrationDeadline: fromAdmin.regEndDate || fromAdmin.registrationDeadline || '2026-11-10',
        participatingCompanies: companies,
        companiesCount: companies.length || fromAdmin.companiesCount || fromAdmin.companies || 0,
        availableJobs: companies.map(c => ({
          title: c.position || c.title || c.role || 'Walk-in Role',
          company: c.company || c.name || 'Participating Company',
          salary: c.salary || 'Best in Industry',
          vacancies: c.vacancies ? (typeof c.vacancies === 'number' ? `${c.vacancies} Spots` : String(c.vacancies)) : 'Multiple',
        }))
      };
    }
    const fallback = MOCK_JOB_MELAS.find((m) => String(m.id) === String(id)) || MOCK_JOB_MELAS[0];
    return {
      ...fallback,
      companiesCount: (fallback.participatingCompanies && fallback.participatingCompanies.length) || fallback.companiesCount || 0
    };
  }, [id, jobMelas]);

  const stats = useMemo(() => {
    return getMelaStats ? getMelaStats(mela?.id) : null;
  }, [mela, getMelaStats]);

  // Prepopulate candidate fields when candidate context updates
  useEffect(() => {
    if (candidate) {
      if (candidate.name) setCandidateName(candidate.name);
      if (candidate.email) setCandidateEmail(candidate.email);
      if (candidate.phone) setCandidatePhone(candidate.phone);
    }
  }, [candidate]);

  // Auto-open modal if returning from login / register with ?apply=true
  useEffect(() => {
    const shouldApply = searchParams.get('apply') === 'true' || searchParams.get('register') === 'true';
    if (shouldApply && isLoggedIn) {
      const comp = searchParams.get('company');
      if (comp) {
        setSelectedCompany(comp);
      }
      setRegisterModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('apply');
      newParams.delete('register');
      newParams.delete('company');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, isLoggedIn, setSearchParams]);

  const handleApplyClick = (companyName = null, position = null) => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: `/job-melas/${mela.id}?apply=true${companyName ? `&company=${encodeURIComponent(companyName)}` : ''}`,
          jobId: mela.id,
          jobTitle: companyName ? `${position || 'Role'} at ${companyName} (${mela.title})` : `Free Entry for ${mela.title}`,
        }
      });
      return;
    }
    setSelectedCompany(companyName);
    setRegisterModalOpen(true);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (registerForJobMela) {
      registerForJobMela({
        melaId: mela.id,
        candidateId: candidate?.id,
        candidateName: candidateName || candidate?.name || 'Candidate',
        candidateEmail: candidateEmail || candidate?.email || 'candidate@example.com',
        phone: candidatePhone || candidate?.phone || '',
        location: mela.city,
        event: mela.title,
        venue: mela.venue,
        city: mela.city,
        date: mela.date
      });
    }

    if (selectedCompany && applyToJobMelaCompany) {
      applyToJobMelaCompany({
        melaId: mela.id,
        melaTitle: mela.title,
        company: selectedCompany,
        candidateId: candidate?.id,
        candidateName: candidateName || candidate?.name,
        candidateEmail: candidateEmail || candidate?.email,
        phone: candidatePhone || candidate?.phone,
        status: 'APPLIED',
        role: 'Walk-in Role',
        appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsRegistered(true);
      setRegisterModalOpen(false);
      toast({
        type: 'success',
        title: selectedCompany ? 'Application & Registration Confirmed!' : 'Registration Successful!',
        message: selectedCompany
          ? `You have registered for ${selectedCompany} at ${mela.title}. Your Fast-Track Entry QR Code has been generated.`
          : `You are registered for ${mela.title}. Your Fast-Track Entry QR Code has been generated.`,
      });
    }, 600);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        type: 'info',
        title: 'Link Copied',
        message: 'Job Mela event link copied to clipboard!',
      });
    }
  };

  const isRegistrationOpen = mela.status === 'REGISTRATION_OPEN' || mela.status === 'UPCOMING' || mela.status === 'APPROVED';

  return (
    <div className="job-mela-detail-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Job Melas', href: '/job-melas' }, { label: mela.title }]} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="responsive-split-detail">

          {/* ── Left Main Content Column ── */}
          <div>
            {/* Header Event Card with Official Flyer */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
              {/* Official Flyer Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '340px',
                  background: '#090d16',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onClick={() => setPosterModalOpen(true)}
                title="Click to view full official flyer"
              >
                <img
                  src={mela?.posterImage || mela?.banner || mela?.image || '/hero2.jpg'}
                  alt={mela?.title || 'Official Job Mela Flyer'}
                  style={{
                    width: '100%',
                    maxHeight: '340px',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 250ms ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                {/* Floating Quick Action Buttons on Image */}
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  display: 'flex',
                  gap: 8,
                  zIndex: 2
                }}>
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<Eye size={12} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPosterModalOpen(true);
                    }}
                    style={{ background: 'rgba(15,23,42,0.85)', color: '#fff', border: 'none', backdropFilter: 'blur(4px)' }}
                  >
                    View Full Poster
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    leftIcon={<Download size={12} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPosterImage(mela?.posterImage || mela?.banner || mela?.image || '/hero2.jpg', mela?.title);
                    }}
                  >
                    Download Poster
                  </Button>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
                color: '#ffffff',
                padding: 'var(--space-8)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <StatusBadge status={mela.status} />
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.85, color: '#e0e7ff' }}>
                        Reg. Deadline: {new Date(mela.registrationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, color: '#ffffff' }}>
                      {mela.title}
                    </h1>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    leftIcon={<Share2 size={16} />}
                    onClick={handleShare}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                    aria-label="Share Event"
                  />
                </div>
              </div>

              {/* Event Metadata Bar */}
              <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Event Date & Duration</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                        {new Date(mela.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--color-info-50)', color: 'var(--color-info-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Timings</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{mela.time}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--color-warning-50)', color: 'var(--color-warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Location & Venue</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{mela.city}, {mela.state}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-xl)', background: 'var(--color-success-50)', color: 'var(--color-success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Participating Companies</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{mela.companiesCount}+ Companies</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    <strong>Full Venue Address:</strong> {mela.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header"><h2 className="card-title">About this Job Mela</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text)' }}>
                  {mela.description}
                </p>
              </div>
            </div>

            {/* Candidate Eligibility & Instructions */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header"><h2 className="card-title">Eligibility & Instructions</h2></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {mela.eligibility && (
                  <div style={{ background: 'var(--color-info-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-info-200)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-info-700)', textTransform: 'uppercase', marginBottom: 2 }}>
                      Eligible Candidates
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                      {mela.eligibility}
                    </p>
                  </div>
                )}

                {mela.instructions && (
                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                      Important Instructions for Attendees:
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {mela.instructions.map((inst, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', fontSize: 'var(--text-sm)' }}>
                          <CheckCircle2 size={16} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: 2 }} />
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Participating Companies */}
            {mela.participatingCompanies && mela.participatingCompanies.length > 0 && (
              <div className="card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-2xl)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <h2 className="card-title">Participating Companies ({mela.participatingCompanies.length})</h2>
                  <span className="badge badge-primary">
                    {mela.totalOpportunities || `${mela.participatingCompanies.reduce((acc, c) => acc + (Number(c.vacancies) || 10), 0)}+ Vacancies`}
                  </span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {mela.participatingCompanies.map((c, idx) => {
                    const companyName = c.company || c.name || 'Participating Employer';
                    const positionTitle = c.position || (c.roles ? c.roles.join(', ') : 'Various Roles');
                    return (
                      <div key={c.id || idx} style={{
                        padding: 'var(--space-4) var(--space-5)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--text-lg)' }}>
                              {companyName[0]}
                            </div>
                            <div>
                              <h3 style={{ fontWeight: 800, fontSize: 'var(--text-base)', margin: 0 }}>{companyName}</h3>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, margin: '2px 0 0 0' }}>
                                {positionTitle}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span className="badge badge-success" style={{ fontSize: '11px' }}>
                              {c.vacancies ? `${c.vacancies} Vacancies` : (c.openJobs || 'Walk-in Hiring')}
                            </span>
                            {isRegistrationOpen && (
                              <Button size="xs" variant="primary" onClick={() => handleApplyClick(companyName, positionTitle)}>
                                Apply / Attend
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Details grid: Qualification, Experience, Salary, Location */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 'var(--space-2)',
                          background: 'var(--color-gray-50)',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--text-xs)'
                        }}>
                          {c.qualification && (
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Qualification</span>
                              <strong>{c.qualification}</strong>
                            </div>
                          )}
                          {c.experience && (
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Experience</span>
                              <strong>{c.experience}</strong>
                            </div>
                          )}
                          {c.salary && (
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Salary Package</span>
                              <strong style={{ color: 'var(--color-primary-700)' }}>{c.salary}</strong>
                            </div>
                          )}
                          {(c.location || c.notes) && (
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Stall / Notes</span>
                              <span>{c.location || c.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Jobs on the Spot */}
            {mela.availableJobs && mela.availableJobs.length > 0 && (
              <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
                <div className="card-header">
                  <h2 className="card-title">Spot Hiring Openings at the Event</h2>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {mela.availableJobs.map((job, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-4) var(--space-6)',
                      borderBottom: idx < mela.availableJobs.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)'
                    }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{job.title}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {job.company} • {job.vacancies} open slots
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                          {job.salary}
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>Walk-in</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sticky Right Column: Registration Card ── */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="card-body" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Registered Candidates</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                    {stats?.uniqueAppliedCandidatesCount ?? (mela.registeredCount || 0)} / {mela.seats || 3500} Seats
                  </p>
                  <div style={{ height: 6, background: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden', margin: 'var(--space-2) 0' }}>
                    <div style={{ width: `${Math.min(100, Math.round(((stats?.uniqueAppliedCandidatesCount ?? (mela.registeredCount || 0)) / (mela.seats || 3500)) * 100))}%`, height: '100%', background: 'var(--color-primary-600)' }} />
                  </div>
                </div>

                {isRegistered ? (
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
                      You are Registered!
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)' }}>
                      Fast-Track Entry Pass issued.
                    </p>
                    <Link to="/candidate/job-mela" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                      <Button variant="primary" size="sm" fullWidth>
                        View Digital Pass & QR Code
                      </Button>
                    </Link>
                  </div>
                ) : isRegistrationOpen ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => handleApplyClick()}
                    style={{ marginBottom: 'var(--space-3)' }}
                  >
                    Register for Free Entry
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" fullWidth disabled style={{ marginBottom: 'var(--space-3)' }}>
                    Registration Closed
                  </Button>
                )}

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Entry Fee:</span>
                    <strong style={{ color: 'var(--color-success-600)' }}>100% FREE</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pass Type:</span>
                    <strong>Digital QR Badge</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Event Flyer / Poster Sidebar Card */}
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} style={{ color: 'var(--color-primary-600)' }} />
                  Official Event Poster / Flyer
                </h3>
              </div>
              <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'center' }}>
                <div
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    background: '#0b1120',
                    marginBottom: 'var(--space-3)',
                    maxHeight: 220
                  }}
                  onClick={() => setPosterModalOpen(true)}
                  title="Click to inspect full event flyer"
                >
                  <img
                    src={mela?.posterImage || mela?.banner || mela?.image || '/hero2.jpg'}
                    alt="Official event flyer"
                    style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', textAlign: 'left' }}>
                  Official announcement flyer containing participating companies, walk-in interview schedule, and venue map.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    leftIcon={<Eye size={13} />}
                    onClick={() => setPosterModalOpen(true)}
                  >
                    View Full
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<Download size={13} />}
                    onClick={() => downloadPosterImage(mela?.posterImage || mela?.banner || mela?.image || '/hero2.jpg', mela?.title)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Organizer Contact Info */}
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header"><h3 className="card-title" style={{ fontSize: 'var(--text-sm)' }}>Event Helpline</h3></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                {mela.contactEmail && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} style={{ color: 'var(--color-primary-600)' }} />
                    <a href={`mailto:${mela.contactEmail}`} style={{ color: 'var(--color-primary-600)', textDecoration: 'none' }}>{mela.contactEmail}</a>
                  </span>
                )}
                {mela.contactPhone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} style={{ color: 'var(--color-primary-600)' }} />
                    <span>{mela.contactPhone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Register Modal */}
      <Modal
        open={registerModalOpen}
        onClose={() => { setRegisterModalOpen(false); setSelectedCompany(null); }}
        title={selectedCompany ? `Apply: ${selectedCompany} (${mela.title})` : `Register: ${mela.title}`}
        size="md"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {selectedCompany ? (
              <>Walk-in interview application for <strong>{selectedCompany}</strong> at <strong>{mela.venue}</strong>.</>
            ) : (
              <>Free registration for walk-in interviews at <strong>{mela.venue}</strong>.</>
            )}
          </p>

          <FormField label="Full Name" htmlFor="candName" required>
            <Input id="candName" placeholder="Priya Sharma" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Email" htmlFor="candEmail" required>
              <Input id="candEmail" type="email" placeholder="priya@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
            </FormField>
            <FormField label="Mobile Number" htmlFor="candPhone" required>
              <Input id="candPhone" type="tel" placeholder="+91 98765 43210" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} required />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Highest Qualification" required>
              <select className="select" value={qualification} onChange={(e) => setQualification(e.target.value)}>
                <option>Diploma / Vocational</option>
                <option>Bachelor's Degree (B.Tech, B.E, B.Sc, B.Com, BCA)</option>
                <option>Master's Degree (M.Tech, MBA, MCA, M.Sc)</option>
                <option>Doctorate / Ph.D</option>
              </select>
            </FormField>
            <FormField label="Work Experience" required>
              <select className="select" value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option>Fresher (0-1 yr)</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5+ years</option>
              </select>
            </FormField>
          </div>

          <FormField label="Upload Resume (Optional)" hint="Carrying 10 printed copies to the venue is mandatory">
            <FileUpload accept=".pdf,.doc,.docx" maxSize="5 MB" />
          </FormField>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="secondary" type="button" onClick={() => { setRegisterModalOpen(false); setSelectedCompany(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" loading={isSubmitting} leftIcon={<Send size={16} />}>
              {selectedCompany ? 'Confirm Walk-in Application' : 'Confirm Free Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full Resolution Poster Lightbox Modal */}
      {posterModalOpen && (
        <JobMelaPosterModal
          isOpen={posterModalOpen}
          onClose={() => setPosterModalOpen(false)}
          posterUrl={mela?.posterImage || mela?.banner || mela?.image || '/hero2.jpg'}
          eventTitle={mela?.title || 'Official Job Mela Event Flyer'}
          eventDate={mela?.date}
          eventVenue={mela?.venue}
        />
      )}
    </div>
  );
}
