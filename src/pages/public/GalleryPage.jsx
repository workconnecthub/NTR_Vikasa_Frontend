import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Film, Search, Filter, Sparkles, ChevronRight, Home,
  Calendar, Play, ArrowLeft
} from 'lucide-react';
import { useAdmin, DEFAULT_HOME_CONTENT } from '../../context/AdminContext';
import VideoGalleryCard from '../../components/ui/VideoGalleryCard';
import ImageGalleryCard from '../../components/ui/ImageGalleryCard';
import ImageLightbox from '../../components/ui/ImageLightbox';
import Button from '../../components/ui/Button';
import publicService from '../../services/publicService';

export default function GalleryPage() {
  const { homeContent } = useAdmin();
  const currentContent = homeContent || DEFAULT_HOME_CONTENT;
  const gallery = currentContent.gallery || DEFAULT_HOME_CONTENT.gallery;

  const [livePhotos, setLivePhotos] = useState(null);
  const [liveVideos, setLiveVideos] = useState(null);
  const [liveHeader, setLiveHeader] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      try {
        const [photosRes, videosRes, headerRes] = await Promise.allSettled([
          publicService.getPublishedGalleryPhotos({ page_size: 100 }),
          publicService.getPublishedGalleryVideos({ page_size: 100 }),
          publicService.getPublishedSectionHeader('gallery'),
        ]);
        if (!isMounted) return;
        if (photosRes.status === 'fulfilled' && Array.isArray(photosRes.value) && photosRes.value.length > 0) {
          setLivePhotos(photosRes.value.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            imageUrl: p.imageUrl || p.image_url,
            date: p.date,
            description: p.description || '',
          })));
        }
        if (videosRes.status === 'fulfilled' && Array.isArray(videosRes.value) && videosRes.value.length > 0) {
          setLiveVideos(videosRes.value.map(v => ({
            id: v.id,
            title: v.title,
            youtubeUrl: v.youtubeUrl || v.youtube_url,
            category: v.category,
            date: v.date || '',
            description: v.description || '',
          })));
        }
        if (headerRes.status === 'fulfilled' && headerRes.value) {
          setLiveHeader(headerRes.value);
        }
      } catch (err) {
        console.warn('GalleryPage load warning:', err);
      }
    };
    fetchGallery();
    return () => { isMounted = false; };
  }, []);

  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'videos'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = useMemo(() => livePhotos || gallery?.images || [], [livePhotos, gallery]);
  const videos = useMemo(() => liveVideos || gallery?.videos || [], [liveVideos, gallery]);

  const activeHeader = useMemo(() => ({
    badge: liveHeader?.badge || gallery?.badge || 'Moments & Media Highlights',
    heading1: liveHeader?.heading1 || gallery?.heading1 || 'NTR VIKASA Event &',
    heading2: liveHeader?.heading2 || gallery?.heading2 || 'Media Gallery',
    subtitle: liveHeader?.subtitle || gallery?.subtitle || 'Explore glimpses from our mega job fairs, candidate felicitations, skill training batches, and industry partner summits across Andhra Pradesh.',
  }), [liveHeader, gallery]);

  const activeItems = activeTab === 'images' ? images : videos;

  const categories = useMemo(() => {
    const set = new Set();
    activeItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [activeItems, selectedCategory, searchTerm]);

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ── Top Hero Banner ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          padding: 'var(--space-16) 0 var(--space-12)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: '#94a3b8', marginBottom: 'var(--space-4)' }}>
            <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Home size={13} /> Home
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Media & Event Gallery</span>
          </div>

          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.18)',
                border: '1px solid rgba(165, 180, 252, 0.3)',
                color: '#c7d2fe',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                marginBottom: 'var(--space-3)',
              }}
            >
              <Sparkles size={13} />
              <span>{activeHeader.badge}</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                margin: '0 0 var(--space-3) 0',
                letterSpacing: '-0.02em',
              }}
            >
              {activeHeader.heading1}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #e0e7ff 50%, #f5d0fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {activeHeader.heading2}
              </span>
            </h1>

            <p style={{ fontSize: 'var(--text-base)', color: '#cbd5e1', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
              {activeHeader.subtitle}
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Camera size={18} style={{ color: '#60a5fa' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Photos</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{images.length} Captured</span>
              </div>
            </div>

            <div
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Film size={18} style={{ color: '#f43f5e' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Video Highlights</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{videos.length} Videos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Gallery Content Container ── */}
      <section style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
        <div className="container">
          {/* Controls Bar: Tabs, Search, and Category Filters */}
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
            {/* Primary Tab Switcher */}
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
                <span>Photo Gallery ({images.length})</span>
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
                <span>Video Gallery ({videos.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'images' ? 'photos' : 'videos'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
                <Filter size={12} /> Category:
              </span>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '5px 14px',
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

          {/* Video Instructions Tip */}
          {activeTab === 'videos' && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                border: '1px solid rgba(37, 99, 235, 0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-primary-800)',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--color-primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Play size={12} fill="#ffffff" />
              </span>
              <span>
                <strong>Player Controls:</strong> Hover to autoplay video • Click video area to pause or resume • Toggle sound using the Mute button • Click &quot;YouTube&quot; to open the original link.
              </span>
            </div>
          )}

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-20) var(--space-4)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-2xl)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              {activeTab === 'images' ? <Camera size={44} style={{ opacity: 0.35, marginBottom: 12 }} /> : <Film size={44} style={{ opacity: 0.35, marginBottom: 12 }} />}
              <h3 style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-lg)' }}>
                No {activeTab} matched your criteria
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>
                Try adjusting your search query or select another category filter.
              </p>
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
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <ImageLightbox
          images={filteredItems}
          currentIndex={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}
    </div>
  );
}
