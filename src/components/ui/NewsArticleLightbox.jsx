import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, ExternalLink, ZoomIn, ZoomOut, Newspaper } from 'lucide-react';

export default function NewsArticleLightbox({ articles, currentIndex, onClose, onPrev, onNext }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const currentArticle = articles[currentIndex];

  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onPrev, onNext]);

  if (!currentArticle) return null;

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 1.6 : prev === 1.6 ? 2.2 : 1));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(9, 13, 22, 0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={onClose}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          zIndex: 10,
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Newspaper size={14} />
            {currentArticle.newspaper || 'Press Clipping'}
          </span>

          <span
            style={{
              fontSize: '12.5px',
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {currentIndex + 1} of {articles.length}
          </span>

          {currentArticle.edition && (
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
              • {currentArticle.edition}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={toggleZoom}
            title={zoomLevel > 1 ? 'Reset Zoom' : 'Zoom In to Read Text'}
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 'var(--radius-full)',
              background: zoomLevel > 1 ? 'var(--color-primary-600)' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            {zoomLevel > 1 ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            <span>{zoomLevel === 1 ? 'Zoom In' : `${Math.round(zoomLevel * 100)}%`}</span>
          </button>

          {/* External Source Link */}
          {currentArticle.sourceUrl && (
            <a
              href={currentArticle.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Official E-Paper Source"
              style={{
                height: 38,
                padding: '0 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-600)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <span>E-Paper</span>
              <ExternalLink size={13} />
            </a>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Main Media Center with Zoom & Scroll ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '12px 0',
          overflow: zoomLevel > 1 ? 'auto' : 'hidden',
          borderRadius: 'var(--radius-2xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {articles.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous article"
            style={{
              position: 'fixed',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              transition: 'all 160ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.background = 'var(--color-primary-600)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Newspaper Clipping Image Frame */}
        <div
          style={{
            maxWidth: zoomLevel > 1 ? 'none' : '90%',
            maxHeight: zoomLevel > 1 ? 'none' : '74vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            background: '#ffffff',
            cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
            transition: 'transform 200ms ease',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
          onClick={toggleZoom}
        >
          <img
            src={currentArticle.imageUrl}
            alt={currentArticle.title}
            style={{
              maxWidth: zoomLevel > 1 ? '1000px' : '100%',
              maxHeight: zoomLevel > 1 ? 'none' : '74vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Next Button */}
        {articles.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next article"
            style={{
              position: 'fixed',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              transition: 'all 160ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.background = 'var(--color-primary-600)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* ── Bottom Caption Bar ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-2xl)',
          padding: '14px 24px',
          color: '#ffffff',
          textAlign: 'center',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            {currentArticle.title}
          </h3>
          {currentArticle.date && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '12px',
                color: '#94a3b8',
              }}
            >
              <Calendar size={13} />
              {currentArticle.date}
            </span>
          )}
        </div>
        {currentArticle.summary && (
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
            {currentArticle.summary}
          </p>
        )}
      </div>
    </div>
  );
}
