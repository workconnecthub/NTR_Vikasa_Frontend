import { useState } from 'react';
import { Calendar, Maximize2, Tag } from 'lucide-react';

export default function ImageGalleryCard({ image, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card card-hoverable"
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
        transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* ── Image Container ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '62.5%', // 16:10 Aspect Ratio
          overflow: 'hidden',
          backgroundColor: '#0f172a',
        }}
      >
        <img
          src={image.imageUrl}
          alt={image.title}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />

        {/* Gradient shadow overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isHovered
              ? 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%)'
              : 'linear-gradient(to top, rgba(15, 23, 42, 0.25) 0%, transparent 50%)',
            transition: 'background 200ms ease',
          }}
        />

        {/* Hover Expand Icon Button */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.85)',
            transition: 'all 200ms ease',
          }}
          title="Click to view high-resolution photo"
        >
          <Maximize2 size={16} />
        </div>
      </div>

      {/* ── Info Body ── */}
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
          <span
            className="badge badge-primary"
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            {image.category || 'Event'}
          </span>

          {image.date && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Calendar size={12} />
              {image.date}
            </span>
          )}
        </div>

        <h3
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 1.35,
            margin: '2px 0 0 0',
          }}
        >
          {image.title}
        </h3>

        {image.description && (
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
            {image.description}
          </p>
        )}
      </div>
    </div>
  );
}
