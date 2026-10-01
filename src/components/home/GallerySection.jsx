import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Film, ArrowRight, Sparkles, Filter, Play } from 'lucide-react';
import VideoGalleryCard from '../ui/VideoGalleryCard';
import ImageGalleryCard from '../ui/ImageGalleryCard';
import ImageLightbox from '../ui/ImageLightbox';
import Button from '../ui/Button';

export default function GallerySection({ galleryContent }) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'videos'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = useMemo(() => galleryContent?.images || [], [galleryContent]);
  const videos = useMemo(() => galleryContent?.videos || [], [galleryContent]);

  // Compute categories for active tab
  const activeItems = activeTab === 'images' ? images : videos;

  const categories = useMemo(() => {
    const set = new Set();
    activeItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return activeItems;
    return activeItems.filter(item => item.category === selectedCategory);
  }, [activeItems, selectedCategory]);

  const handleOpenLightbox = (index) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  const badge = galleryContent?.badge || 'Moments & Media Highlights';
  const heading1 = galleryContent?.heading1 || 'NTR VIKASA Event &';
  const heading2 = galleryContent?.heading2 || 'Media Gallery';
  const subtitle = galleryContent?.subtitle || 'Explore glimpses from our mega job fairs, candidate felicitations, skill training batches, and industry partner summits across Andhra Pradesh.';

  return (
    <section
      id="gallery"
      style={{
        padding: 'var(--space-20) 0',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* ── Section Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ maxWidth: 680 }}>
            <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
              <Sparkles size={12} style={{ marginRight: 5 }} /> {badge}
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.25, margin: 0 }}>
              {heading1}{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--color-primary-600) 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {heading2}
              </span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
              {subtitle}
            </p>
          </div>

          <Link to="/gallery">
            <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
              View Full Gallery
            </Button>
          </Link>
        </div>

        {/* ── Tab Switchers: Photo Gallery vs Video Gallery ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Main Media Tabs */}
          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('images');
                setSelectedCategory('All');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: activeTab === 'images' ? 'var(--color-primary-600)' : 'transparent',
                color: activeTab === 'images' ? '#ffffff' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'images' ? 700 : 500,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                boxShadow: activeTab === 'images' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
              }}
            >
              <Camera size={16} />
              <span>Photo Gallery</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === 'images' ? 'rgba(255,255,255,0.25)' : 'var(--color-gray-100)',
                  color: activeTab === 'images' ? '#ffffff' : 'var(--color-text-muted)',
                }}
              >
                {images.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('videos');
                setSelectedCategory('All');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: activeTab === 'videos' ? 'var(--color-primary-600)' : 'transparent',
                color: activeTab === 'videos' ? '#ffffff' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'videos' ? 700 : 500,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                boxShadow: activeTab === 'videos' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
              }}
            >
              <Film size={16} />
              <span>Video Gallery</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === 'videos' ? 'rgba(255,255,255,0.25)' : 'var(--color-gray-100)',
                  color: activeTab === 'videos' ? '#ffffff' : 'var(--color-text-muted)',
                }}
              >
                {videos.length}
              </span>
            </button>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginRight: 2 }}>
                <Filter size={12} /> Filter:
              </span>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                      color: isSelected ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Video Player Interaction Tip Banner ── */}
        {activeTab === 'videos' && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: '1px solid rgba(37, 99, 235, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-primary-800)',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--color-primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Play size={11} fill="#ffffff" />
              </span>
              <span>
                <strong>Interactive Video Player:</strong> Hover any card to start playing immediately. Click anywhere on the video to pause/play, or toggle sound with the mute button.
              </span>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>
              Total {videos.length} videos available
            </span>
          </div>
        )}

        {/* ── Cards Grid ── */}
        {filteredItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16) var(--space-4)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {activeTab === 'images' ? <Camera size={40} style={{ opacity: 0.35, marginBottom: 12 }} /> : <Film size={40} style={{ opacity: 0.35, marginBottom: 12 }} />}
            <h4 style={{ fontWeight: 600, color: 'var(--color-text)' }}>No {activeTab} in this category</h4>
            <p style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>Select &apos;All&apos; to view all items.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {activeTab === 'images'
              ? filteredItems.map((image, index) => (
                  <ImageGalleryCard
                    key={image.id || index}
                    image={image}
                    onClick={() => handleOpenLightbox(index)}
                  />
                ))
              : filteredItems.map((video, index) => (
                  <VideoGalleryCard
                    key={video.id || index}
                    video={video}
                  />
                ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen Image Lightbox Modal ── */}
      {lightboxOpen && (
        <ImageLightbox
          images={filteredItems}
          currentIndex={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}
    </section>
  );
}
