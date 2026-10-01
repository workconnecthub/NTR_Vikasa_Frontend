import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';

export default function ImageLightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scrolling while lightbox is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onPrev, onNext]);

  if (!currentImage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(9, 13, 22, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.02em',
            }}
          >
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.category && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '12px',
                fontWeight: 600,
                color: '#60a5fa',
                background: 'rgba(59, 130, 246, 0.15)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Tag size={12} />
              {currentImage.category}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          style={{
            width: 40,
            height: 40,
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
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)';
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

      {/* ── Main Media Center ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '16px 0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: 12,
              zIndex: 20,
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              transition: 'all 160ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'var(--color-primary-600)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Image Frame */}
        <div
          style={{
            maxWidth: '90%',
            maxHeight: '75vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#090d16',
          }}
        >
          <img
            src={currentImage.imageUrl}
            alt={currentImage.title}
            style={{
              maxWidth: '100%',
              maxHeight: '75vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: 12,
              zIndex: 20,
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              transition: 'all 160ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'var(--color-primary-600)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
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
          maxWidth: '800px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-2xl)',
          padding: '16px 24px',
          color: '#ffffff',
          textAlign: 'center',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            {currentImage.title}
          </h3>
          {currentImage.date && (
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
              {currentImage.date}
            </span>
          )}
        </div>
        {currentImage.description && (
          <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            {currentImage.description}
          </p>
        )}
      </div>
    </div>
  );
}
