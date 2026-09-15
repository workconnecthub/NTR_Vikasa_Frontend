import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronDown, ArrowUp, Phone, Mail, ShieldCheck } from 'lucide-react';

const FOOTER_LINKS = {
  'For Job Seekers': [
    { label: 'Browse Jobs',           href: '/jobs' },
    { label: 'Internships',           href: '/internships' },
    { label: 'Job Melas',             href: '/job-melas' },
    { label: 'Training Programs',     href: '/skill-development/courses' },
    { label: 'Companies',             href: '/companies' },
    { label: 'Register as Candidate', href: '/register/candidate' },
  ],
  'For Recruiters': [
    { label: 'Post a Job',        href: '/register/recruiter' },
    { label: 'Post Internship',   href: '/register/recruiter' },
    { label: 'Recruiter Login',   href: '/login' },
    { label: 'Recruiter Registration', href: '/register/recruiter' },
  ],
  'Company': [
    { label: 'About Us',          href: '/about' },
    { label: 'Skill Development', href: '/skill-development' },
    { label: 'Contact & Helpdesk',href: '/contact' },
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Service',  href: '/terms' },
  ],
};

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const SOCIAL_LINKS = [
  { icon: <FacebookIcon size={16} />,  href: 'https://www.facebook.com/ntrvikasajobs', label: 'Facebook' },
  { icon: <TwitterIcon size={16} />,   href: 'https://x.com/NTRVikasa', label: 'Twitter' },
  { icon: <InstagramIcon size={16} />, href: 'https://www.instagram.com/ntrvikasa/', label: 'Instagram' },
  { icon: <YoutubeIcon size={16} />,   href: 'https://www.youtube.com/@NTRVIKASA', label: 'YouTube' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  // On mobile, allow expanding/collapsing link sections interactively
  const [openSections, setOpenSections] = useState({ 'For Job Seekers': true });

  const toggleSection = (col) => {
    setOpenSections(prev => ({
      ...prev,
      [col]: !prev[col]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <RouterLink to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </RouterLink>
          <p className="footer-desc" style={{ marginTop: 'var(--space-3)' }}>
            NTR Vikasa — Society for Employment Generation. Empowering youth with employment opportunities, skill development programs, and Mega Job Melas.
          </p>

          {/* Interactive Helpdesk & Support Badge */}
          <div className="footer-support-pills" style={{ marginTop: 'var(--space-4)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <RouterLink to="/contact" className="footer-support-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-full)',
              color: '#94a3b8',
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 150ms ease'
            }}>
              <Phone size={13} style={{ color: 'var(--color-primary-400)' }} />
              <span>Contact Support</span>
            </RouterLink>
            <RouterLink to="/about" className="footer-support-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-full)',
              color: '#94a3b8',
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 150ms ease'
            }}>
              <ShieldCheck size={13} style={{ color: 'var(--color-success-500)' }} />
              <span>Govt. Recognized</span>
            </RouterLink>
          </div>
        </div>

        {/* Link columns with mobile interactive accordion */}
        {Object.entries(FOOTER_LINKS).map(([col, links]) => {
          const isOpen = !!openSections[col];
          return (
            <div key={col} className={`footer-col ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="footer-col-header"
                onClick={() => toggleSection(col)}
                aria-expanded={isOpen}
              >
                <h3 className="footer-col-title">{col}</h3>
                <ChevronDown
                  size={16}
                  className="footer-col-chevron"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease'
                  }}
                />
              </button>
              <ul className={`footer-links ${isOpen ? 'show' : ''}`}>
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <RouterLink to={link.href} className="footer-link">{link.label}</RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="footer-bottom">
          <p className="footer-bottom-text">
            © {year} NTR VIKASA Job Portal. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="footer-social">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} className="footer-social-link" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Interactive Back to Top */}
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-back-to-top"
              aria-label="Back to top"
              title="Back to top"
            >
              <ArrowUp size={14} />
              <span className="footer-back-to-top-label">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

