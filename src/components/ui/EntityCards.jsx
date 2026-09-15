import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Banknote, Bookmark, BookmarkCheck, Building2 } from 'lucide-react';
import { Badge, StatusBadge } from './Badge';
import Button from './Button';
import { JobCardSkeleton } from './Skeleton';

/**
 * JobCard — displays a job listing matching Company cards design
 * @param {Object}   job
 * @param {boolean}  saved
 * @param {Function} onSave
 * @param {boolean}  loading
 * @param {boolean}  showStatus
 */
export function JobCard({ job, saved = false, onSave, loading = false, showStatus = false }) {
  if (loading) return <JobCardSkeleton />;

  const {
    id, title, company, companyLogo, location, type, salary,
    experience, deadline, status, tags = [], isNew, isFeatured, workMode
  } = job;

  const timeLeft = deadline ? getTimeLeft(deadline) : null;

  return (
    <div
      className="card card-hoverable entity-job-card"
      style={{
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--space-4)'
      }}
    >
      <div>
        {/* Header: Logo + Badges + Bookmark */}
        <div className="entity-job-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div className="entity-job-card-logo" style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            color: '#fff',
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}>
            {companyLogo ? <img src={companyLogo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : (company?.[0] || 'J')}
          </div>

          <div className="entity-job-card-badges" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {isFeatured && <Badge variant="primary">Featured</Badge>}
            {isNew && <Badge variant="success">New</Badge>}
            {onSave && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onSave(id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? 'var(--color-primary-600)' : 'var(--color-text-light)', padding: 2 }}
                aria-label={saved ? 'Unsave job' : 'Save job'}
              >
                {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/jobs/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="entity-job-card-title" style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            marginBottom: 4,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {title}
          </h3>
        </Link>

        {/* Company */}
        <Link to={`/companies/${job.companyId || id}`} style={{ textDecoration: 'none' }}>
          <p className="entity-job-card-company" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
            {company}
          </p>
        </Link>

        {/* Meta Info */}
        <div className="entity-job-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} style={{ flexShrink: 0 }} /> {location}
            </span>
          )}
          {salary && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)', fontWeight: 700 }}>
              <Banknote size={13} style={{ flexShrink: 0 }} /> {salary}
            </span>
          )}
          {(experience || type || workMode) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={13} style={{ flexShrink: 0 }} />
              {[experience, type, workMode].filter(Boolean).join(' • ')}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="entity-job-card-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="gray">{tag}</Badge>
            ))}
            {tags.length > 3 && <Badge variant="gray">+{tags.length - 3}</Badge>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="entity-job-card-footer" style={{
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--color-gray-100)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
        <div className="entity-job-card-time">
          {showStatus && status && <StatusBadge status={status} />}
          {timeLeft && !showStatus && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {timeLeft}
            </span>
          )}
        </div>
        <Link to={`/jobs/${id}`} className="entity-job-card-link" style={{ textDecoration: 'none' }}>
          <Button size="sm" variant="outline" className="entity-job-card-btn">View Job</Button>
        </Link>
      </div>
    </div>
  );
}

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  if (diff < 0) return 'Expired';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Closes today';
  if (days === 1) return '1 day left';
  if (days <= 30) return `${days} days left`;
  const weeks = Math.ceil(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} left`;
}


/**
 * CompanyCard
 */
export function CompanyCard({ company, loading = false }) {
  if (loading) {
    return (
      <div className="company-card">
        <div className="skeleton skeleton-circle" style={{ width: 72, height: 72, margin: '0 auto var(--space-4)' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto var(--space-2)' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto var(--space-4)', height: 12 }} />
      </div>
    );
  }

  const { id, name, industry, logo, openJobs = 0, employees } = company;

  return (
    <Link to={`/companies/${id}`} className="company-card hover-lift">
      <div className="company-card-logo">
        {logo ? <img src={logo} alt={`${name} logo`} /> : <span>{name?.[0] || 'C'}</span>}
      </div>
      <h3 className="company-card-name">{name}</h3>
      {industry && <p className="company-card-industry">{industry}</p>}
      <div className="company-card-stats">
        <div className="company-card-stat">
          <p className="company-card-stat-value">{openJobs}</p>
          <p className="company-card-stat-label">Open Jobs</p>
        </div>
        {employees && (
          <div className="company-card-stat">
            <p className="company-card-stat-value">{employees}</p>
            <p className="company-card-stat-label">Employees</p>
          </div>
        )}
      </div>
    </Link>
  );
}


/**
 * InternshipCard — matching Companies cards design & visual density
 */
export function InternshipCard({ internship, saved = false, onSave, loading = false }) {
  if (loading) return <JobCardSkeleton />;

  const { id, title, company, companyLogo, location, duration, stipend, mode, deadline, tags = [], skills = [] } = internship;
  const displaySkills = tags.length > 0 ? tags : skills;

  return (
    <div
      className="card card-hoverable entity-internship-card"
      style={{
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--space-4)'
      }}
    >
      <div>
        {/* Header: Company Logo & Stipend Badge */}
        <div className="entity-internship-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div className="entity-internship-card-logo" style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            color: '#fff',
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}>
            {companyLogo ? <img src={companyLogo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : (company?.[0] || 'I')}
          </div>

          <div className="entity-internship-card-badge-wrap" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="entity-internship-card-badge" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-success-700)',
              background: 'var(--color-success-50)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-md)'
            }}>
              {stipend || 'Paid Stipend'}
            </span>
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? 'var(--color-primary-600)' : 'var(--color-text-light)', padding: 2 }}
                aria-label={saved ? 'Remove Bookmark' : 'Save Internship'}
              >
                {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/internships/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="entity-internship-card-title" style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            marginBottom: 4,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {title}
          </h3>
        </Link>

        {/* Company */}
        <p className="entity-internship-card-company" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
          {company}
        </p>

        {/* Meta Info: Location, Work Mode, Duration */}
        <div className="entity-internship-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: displaySkills.length > 0 ? 'var(--space-3)' : 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={13} style={{ flexShrink: 0 }} /> {location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Briefcase size={13} style={{ flexShrink: 0 }} /> {mode || 'Hybrid'} • {duration || '3 Months'}
          </span>
        </div>

        {/* Skills/Tags if any */}
        {displaySkills && displaySkills.length > 0 && (
          <div className="entity-internship-card-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {displaySkills.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-primary-800)',
                  background: 'var(--color-primary-50)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {tag}
              </span>
            ))}
            {displaySkills.length > 3 && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: 'center', fontWeight: 600 }}>
                +{displaySkills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Apply by deadline & View Details CTA */}
      <div className="entity-internship-card-footer" style={{
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--color-gray-100)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
        <span className="entity-internship-card-time" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {deadline ? `Apply by ${new Date(deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : 'Actively Hiring'}
        </span>
        <Link to={`/internships/${id}`} className="entity-internship-card-link" style={{ textDecoration: 'none' }}>
          <Button size="sm" variant="outline" className="entity-internship-card-btn">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}


/**
 * JobMelaCard — Job Fair card
 */
export function JobMelaCard({ event, loading = false }) {
  if (loading) {
    return (
      <div className="jobmela-card">
        <div className="jobmela-card-banner" style={{ background: 'var(--color-gray-200)' }} />
        <div className="jobmela-card-body">
          <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: 'var(--space-3)' }} />
          <div className="skeleton skeleton-text sm" style={{ width: '50%', marginBottom: 'var(--space-2)' }} />
          <div className="skeleton skeleton-text sm" style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  const { id, title, date, venue, city, companies = 0, seats, status } = event;

  return (
    <Link to={`/job-melas/${id}`} className="jobmela-card hover-lift">
      <div className="jobmela-card-banner">
        <StatusBadge status={status} size="sm" />
      </div>
      <div className="jobmela-card-body">
        <h3 className="jobmela-card-title">{title}</h3>
        <div className="jobmela-card-meta">
          {date && (
            <span className="jobmela-card-meta-item">
              <Clock size={14} />
              {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
          {venue && (
            <span className="jobmela-card-meta-item">
              <MapPin size={14} />{venue}, {city}
            </span>
          )}
          {companies > 0 && (
            <span className="jobmela-card-meta-item">
              <Building2 size={14} />{companies} Companies Participating
            </span>
          )}
        </div>
      </div>
      <div className="jobmela-card-footer">
        {seats && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{seats} seats available</span>}
        <Button size="sm" variant="primary" style={{ pointerEvents: 'none' }}>Register</Button>
      </div>
    </Link>
  );
}
