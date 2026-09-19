import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';

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
    { label: 'Post a Job',            href: '/register/recruiter' },
    { label: 'Post Internship',       href: '/register/recruiter' },
    { label: 'Recruiter Login',       href: '/login' },
    { label: 'Recruiter Registration',href: '/register/recruiter' },
  ],
  'Company & Helpdesk': [
    { label: 'About Us',              href: '/about' },
    { label: 'Skill Development',     href: '/skill-development' },
    { label: 'Contact & Helpdesk',    href: '/contact' },
    { label: 'Privacy Policy',        href: '/privacy' },
    { label: 'Terms of Service',      href: '/terms' },
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
  { icon: <FacebookIcon size={16} />,  href: 'https://www.facebook.com/ntrvikasajobs', label: 'Facebook', color: '#1877f2' },
  { icon: <TwitterIcon size={16} />,   href: 'https://x.com/NTRVikasa', label: 'Twitter', color: '#38bdf8' },
  { icon: <InstagramIcon size={16} />, href: 'https://www.instagram.com/ntrvikasa/', label: 'Instagram', color: '#e1306c' },
  { icon: <YoutubeIcon size={16} />,   href: 'https://www.youtube.com/@NTRVIKASA', label: 'YouTube', color: '#ff0000' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  
  // Interactive accordion state for mobile devices
  const [openSections, setOpenSections] = useState({
    'For Job Seekers': true,
    'For Recruiters': false,
    'Company & Helpdesk': false,
  });

  const toggleSection = (col) => {
    setOpenSections(prev => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid">
        {/* Brand & Overview Column */}
        <div className="footer-brand">
          <RouterLink
            to="/"
            className="footer-logo-link"
            aria-label="NTR Vikasa Homepage"
          >
            <img
              src="/logo_image.png"
              alt="NTR Vikasa Logo"
              className="footer-logo-img"
            />
          </RouterLink>

          <p className="footer-desc">
            NTR Vikasa — Society for Employment Generation. Empowering youth with verified jobs, vocational skill development, and Statewide Career Summits.
          </p>

          {/* Interactive Badges & Quick Links */}
          <div className="footer-support-pills">
            <RouterLink to="/contact" className="footer-pill-btn">
              <Phone size={13} className="footer-pill-icon primary" />
              <span>Helpdesk Support</span>
            </RouterLink>

            <RouterLink to="/about" className="footer-pill-btn">
              <ShieldCheck size={13} className="footer-pill-icon success" />
              <span>AP Govt. Initiative</span>
            </RouterLink>

            <RouterLink to="/skill-development" className="footer-pill-btn">
              <Sparkles size={13} className="footer-pill-icon warning" />
              <span>Skill Training</span>
            </RouterLink>
          </div>
        </div>

        {/* Dynamic Accordion Columns */}
        {Object.entries(FOOTER_LINKS).map(([col, links]) => {
          const isOpen = !!openSections[col];
          return (
            <div key={col} className={`footer-col ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="footer-col-header"
                onClick={() => toggleSection(col)}
                aria-expanded={isOpen}
                aria-controls={`footer-section-${col.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <h3 className="footer-col-title">{col}</h3>
                <span className="footer-col-chevron-wrapper hide-desktop">
                  <ChevronDown
                    size={18}
                    className={`footer-col-chevron ${isOpen ? 'rotate' : ''}`}
                  />
                </span>
              </button>

              <ul
                id={`footer-section-${col.replace(/\s+/g, '-').toLowerCase()}`}
                className={`footer-links ${isOpen ? 'show' : ''}`}
              >
                {links.map((link) => (
                  <li key={link.href + link.label} className="footer-link-item">
                    <RouterLink to={link.href} className="footer-link">
                      {link.label}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-wrapper">
        <div className="footer-bottom">
          <div className="footer-bottom-info">
            <p className="footer-bottom-text">
              © {year} NTR VIKASA Job Portal. All rights reserved.
            </p>
            <p className="footer-bottom-subtext">
              Government of Andhra Pradesh • Employment & Training Initiative
            </p>
          </div>

          <div className="footer-bottom-actions">
            {/* Social Media Links */}
            <div className="footer-social" aria-label="Social Media Links">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer-social-link"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ '--hover-color': s.color }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Back to Top Interactive Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-back-to-top"
              aria-label="Back to top of page"
              title="Back to top"
            >
              <ArrowUp size={14} className="footer-back-to-top-icon" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
