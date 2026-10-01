import { useState } from 'react';
import { Calendar, ExternalLink, Newspaper, Maximize2, BookOpen } from 'lucide-react';

export default function NewsArticleCard({ article, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="news-article-card card-hoverable"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: isHovered ? 'var(--shadow-xl)' : 'var(--shadow-sm)',
        transform: isHovered ? 'translateY(-6px)' : 'none',
        transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* ── Top Newspaper Masthead Strip ── */}
      <div
        style={{
          padding: '10px 16px',
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--color-primary-500)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Newspaper size={13} />
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.03em', color: '#ffffff' }}>
            {article.newspaper || 'Press Report'}
          </span>
        </div>

        {article.edition && (
          <span style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '50%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {article.edition}
          </span>
        )}
      </div>

      {/* ── Clipping Image Frame ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '62%', // Aspect ratio for clipping
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Hover Click to Read Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isHovered
              ? 'rgba(15, 23, 42, 0.45)'
              : 'linear-gradient(to top, rgba(15, 23, 42, 0.2) 0%, transparent 40%)',
            transition: 'background 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.85)',
              transition: 'all 200ms ease',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Maximize2 size={13} />
            <span>Click to Read Clipping</span>
          </div>
        </div>
      </div>

      {/* ── Card Content Body ── */}
      <div
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {article.date && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--text-xs)',
                color: 'var(--color-primary-700)',
                fontWeight: 600,
              }}
            >
              <Calendar size={12} />
              {article.date}
            </span>
          )}

          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open Official E-Paper"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-gray-100)',
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--color-primary-600)';
                e.currentTarget.style.background = 'var(--color-primary-50)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
                e.currentTarget.style.background = 'var(--color-gray-100)';
              }}
            >
              <span>E-Paper</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        <h3
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 800,
            color: 'var(--color-text)',
            lineHeight: 1.35,
            margin: '2px 0 0 0',
            fontFamily: 'inherit',
          }}
        >
          {article.title}
        </h3>

        {article.summary && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)',
              margin: '4px 0 0 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.summary}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <BookOpen size={13} /> Read Full Article
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            NTR VIKASA
          </span>
        </div>
      </div>
    </div>
  );
}
