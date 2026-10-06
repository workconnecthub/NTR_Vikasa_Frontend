import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, MapPin, Users, Globe, Mail, Phone, Calendar,
  Star, Briefcase, GraduationCap, CheckCircle2, ExternalLink,
  Sparkles, ArrowLeft
} from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import { JobCard, InternshipCard } from '../../components/ui/EntityCards';
import { Tabs, TabsList, Tab, TabPanel } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/States';
import publicService from '../../services/publicService';

const resolveLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('jobs');
  const [company, setCompany] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const c = await publicService.getPublishedCompany(id);
        if (isMounted && c) {
          setCompany(c);
          // Fetch company jobs
          try {
            const jobsRes = await publicService.getPublishedJobs({ search: c.name || c.company_name, page_size: 50 });
            if (isMounted) setOpenJobs(jobsRes?.items || []);
          } catch (e) {
            console.warn('Failed to load company jobs:', e);
          }
          // Fetch company internships
          try {
            const internRes = await publicService.getPublishedInternships({ search: c.name || c.company_name, page_size: 50 });
            if (isMounted) setInternships(internRes?.items || []);
          } catch (e) {
            console.warn('Failed to load company internships:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching company detail:', err);
        if (isMounted) setLoadError('Company not found or has not been verified.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCompanyData();
    return () => { isMounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (loadError || !company) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0' }}>
        <EmptyState
          icon="companies"
          title="Company Not Found"
          description={loadError || "The requested organization does not exist or has not been verified."}
          action={<Link to="/companies"><Button variant="primary">Browse All Companies</Button></Link>}
        />
      </div>
    );
  }

  const logoSrc = resolveLogoUrl(company.logo || company.logo_url || company.company_logo_path);
  const companyName = company.name || company.company_name;


  return (
    <div className="company-detail-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      {/* Breadcrumb Header */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: 'Companies', href: '/companies' }, { label: company.name }]} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        {/* Company Hero Profile Header */}
        <div className="card" style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          {/* Header Banner */}
          <div style={{
            height: '140px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
            position: 'relative'
          }} />

          <div className="card-body" style={{ padding: '0 var(--space-8) var(--space-8)', position: 'relative' }}>
            {/* Logo Badge offset */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              marginTop: '-50px',
              marginBottom: 'var(--space-5)'
            }}>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: 'var(--radius-2xl)',
                background: '#ffffff',
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-4xl)',
                fontWeight: 800,
                color: 'var(--color-primary-600)',
                overflow: 'hidden'
              }}>
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={companyName}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  companyName?.[0] || 'C'
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={14} />}>
                      Visit Website
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>{companyName}</h1>
                {company.verified && (
                  <CheckCircle2 size={24} style={{ color: 'var(--color-success-600)' }} />
                )}
                {company.rating ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'var(--color-warning-50)',
                    color: 'var(--color-warning-700)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700
                  }}>
                    <Star size={13} fill="currentColor" /> {company.rating} rating
                  </div>
                ) : null}
              </div>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: 800 }}>
                {company.tagline || company.description}
              </p>
            </div>


            {/* Meta tags bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-6)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                <Building2 size={16} style={{ color: 'var(--color-primary-600)' }} />
                <span>Industry: <strong>{company.industry}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                <Users size={16} style={{ color: 'var(--color-primary-600)' }} />
                <span>Size: <strong>{company.size} ({company.employees})</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                <MapPin size={16} style={{ color: 'var(--color-primary-600)' }} />
                <span>HQ: <strong>{company.location}</strong></span>
              </div>
              {company.foundedYear && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                  <Calendar size={16} style={{ color: 'var(--color-primary-600)' }} />
                  <span>Founded: <strong>{company.foundedYear}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout: Info Sidebar + Tabs (Open Jobs, Internships, About) */}
        <div className="responsive-split-detail">

          {/* ── Left Content: Tabs for Open Jobs & Internships ── */}
          <div>
            <Tabs defaultTab="jobs" value={activeTab} onChange={setActiveTab}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <TabsList>
                  <Tab value="jobs" badge={openJobs.length}>
                    <Briefcase size={16} style={{ marginRight: 6 }} /> Open Jobs
                  </Tab>
                  <Tab value="internships" badge={internships.length}>
                    <GraduationCap size={16} style={{ marginRight: 6 }} /> Internships
                  </Tab>
                  <Tab value="about">About & Culture</Tab>
                </TabsList>
              </div>

              {/* Tab 1: Open Jobs */}
              <TabPanel value="jobs">
                {openJobs.length === 0 ? (
                  <EmptyState
                    icon="jobs"
                    title={`No active jobs at ${company.name}`}
                    description="Check back soon or explore other verified hiring employers."
                    action={<Link to="/jobs"><Button variant="primary">Browse All Jobs</Button></Link>}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {openJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </TabPanel>

              {/* Tab 2: Internships */}
              <TabPanel value="internships">
                {internships.length === 0 ? (
                  <EmptyState
                    icon="default"
                    title={`No active internships at ${company.name}`}
                    description="Internship opportunities will appear here once published by the recruiter."
                    action={<Link to="/internships"><Button variant="primary">Browse All Internships</Button></Link>}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {internships.map((internship) => (
                      <InternshipCard key={internship.id} internship={internship} />
                    ))}
                  </div>
                )}
              </TabPanel>

              {/* Tab 3: About & Culture */}
              <TabPanel value="about">
                <div className="card" style={{ borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--space-6)' }}>
                  <div className="card-header">
                    <h2 className="card-title">Company Overview</h2>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text)' }}>
                      {company.description}
                    </p>
                  </div>
                </div>

                {company.culture && (
                  <div className="card" style={{ borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                      <h2 className="card-title">Work Culture & Values</h2>
                    </div>
                    <div className="card-body">
                      <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-text)' }}>
                        {company.culture}
                      </p>
                    </div>
                  </div>
                )}

                {company.benefits && (
                  <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
                    <div className="card-header">
                      <h2 className="card-title">Employee Benefits & Perks</h2>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                        {company.benefits.map((b, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                            <CheckCircle2 size={16} style={{ color: 'var(--color-success-600)', flexShrink: 0 }} />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabPanel>
            </Tabs>
          </div>

          {/* ── Right Sidebar: Contact & Quick Info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Company Information</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                {company.address && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Office Address</span>
                    <strong style={{ fontSize: 'var(--text-xs)', lineHeight: 1.4 }}>{company.address}</strong>
                  </div>
                )}
                {company.website && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Website</span>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', wordBreak: 'break-all' }}>
                      {company.website}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Careers Email</span>
                    <a href={`mailto:${company.email}`} style={{ color: 'var(--color-primary-600)', textDecoration: 'none' }}>
                      {company.email}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Contact Phone</span>
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', textAlign: 'center' }}>
              <Sparkles size={28} style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--space-2)' }} />
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                Want to work at {company.name}?
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Explore open positions above and submit your resume directly to their hiring team.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => setActiveTab('jobs')}>
                View {openJobs.length} Open Positions
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
