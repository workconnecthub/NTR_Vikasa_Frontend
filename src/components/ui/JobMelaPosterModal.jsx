import { useEffect } from 'react';
import { X, Download, Maximize2, ExternalLink, CalendarDays, MapPin, Building2 } from 'lucide-react';
import Button from './Button';

/**
 * Helper to download an image (dataURL, blob, or URL)
 */
export async function downloadPosterImage(imageUrl, eventTitle = 'Job_Mela') {
  if (!imageUrl) return;
  const cleanTitle = (eventTitle || 'Job_Mela')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
  const filename = `${cleanTitle}_Official_Flyer.png`;

  try {
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  } catch (err) {
    console.error('Direct download failed, opening in new tab:', err);
    window.open(imageUrl, '_blank');
  }
}

/**
 * JobMelaPosterModal — High-resolution full flyer/poster viewer with instant download
 */
export default function JobMelaPosterModal({ isOpen, onClose, event, imageUrl }) {
  const activeImage = imageUrl || event?.posterImage || event?.banner || event?.image;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !activeImage) return null;

  const title = event?.title || event?.event || 'Mega Job Mela Official Flyer';
  const date = event?.date;
  const venue = event?.venue || event?.location;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 15, 29, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        animation: 'fadeIn 180ms ease-out',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          padding: '8px 0',
          gap: '12px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Official Event Flyer & Circular
          </span>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </h3>
          {(date || venue) && (
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
              {date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarDays size={13} style={{ color: '#38bdf8' }} /> {date}
                </span>
              )}
              {venue && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} style={{ color: '#38bdf8' }} /> {venue}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => downloadPosterImage(activeImage, title)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              transition: 'all 150ms ease'
            }}
            title="Download Flyer to your device"
          >
            <Download size={15} />
            <span>Download Poster</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(activeImage, '_blank')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Open in new window"
            aria-label="Open in new window"
          >
            <ExternalLink size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Close viewer"
            aria-label="Close viewer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Poster Display Area (Shows Entire Image Clearly) ── */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '8px',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'relative',
            maxHeight: 'calc(100vh - 140px)',
            maxWidth: '100%',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
            background: '#020617'
          }}
        >
          <img
            src={activeImage}
            alt={title}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 140px)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* ── Bottom Info / Helper Banner ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          textAlign: 'center',
          color: '#cbd5e1',
          fontSize: '12px',
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span>💡 All recruitment schedules, venue directions, and company quotas are in this flyer.</span>
        <button
          type="button"
          onClick={() => downloadPosterImage(activeImage, title)}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline'
          }}
        >
          Save copy to device
        </button>
      </div>
    </div>
  );
}
