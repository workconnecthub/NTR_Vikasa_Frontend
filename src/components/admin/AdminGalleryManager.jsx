import { useState, useMemo } from 'react';
import {
  Camera, Film, Plus, Edit3, Trash2, ExternalLink, Search,
  Filter, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon,
  UploadCloud, Eye, RotateCcw, Video, Play, Volume2
} from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAdmin, DEFAULT_HOME_CONTENT } from '../../context/AdminContext';
import { getYouTubeVideoId, getYouTubeThumbnailUrl, buildYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/youtube';

const CATEGORY_OPTIONS = [
  'Job Melas',
  'Skill Training',
  'Placements',
  'Conferences',
  'Youth Summits',
  'Success Stories',
  'Press Coverage',
  'General',
];

export default function AdminGalleryManager() {
  const { addToast } = useToast();
  const {
    homeContent,
    updateHomeContent,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    addGalleryVideo,
    updateGalleryVideo,
    deleteGalleryVideo,
  } = useAdmin();

  const gallery = (homeContent && homeContent.gallery) || DEFAULT_HOME_CONTENT.gallery;
  const images = gallery.images || [];
  const videos = gallery.videos || [];

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'videos' | 'header'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // ── Header Settings Form State ──
  const [headerForm, setHeaderForm] = useState({
    badge: gallery.badge || '',
    heading1: gallery.heading1 || '',
    heading2: gallery.heading2 || '',
    subtitle: gallery.subtitle || '',
  });

  const handleSaveHeader = (e) => {
    e.preventDefault();
    updateHomeContent({
      gallery: {
        ...gallery,
        ...headerForm,
      },
    });
    addToast('Gallery section header settings saved successfully!', 'success');
  };

  const handleResetHeader = () => {
    const def = DEFAULT_HOME_CONTENT.gallery;
    setHeaderForm({
      badge: def.badge,
      heading1: def.heading1,
      heading2: def.heading2,
      subtitle: def.subtitle,
    });
    updateHomeContent({
      gallery: {
        ...gallery,
        badge: def.badge,
        heading1: def.heading1,
        heading2: def.heading2,
        subtitle: def.subtitle,
      },
    });
    addToast('Gallery header reset to default values.', 'info');
  };

  // ── Photo Modal State ──
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    category: 'Job Melas',
    imageUrl: '',
    date: '',
    description: '',
  });

  const handleOpenAddPhoto = () => {
    setEditingPhotoId(null);
    setPhotoForm({
      title: '',
      category: 'Job Melas',
      imageUrl: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: '',
    });
    setPhotoModalOpen(true);
  };

  const handleOpenEditPhoto = (photo) => {
    setEditingPhotoId(photo.id);
    setPhotoForm({
      title: photo.title || '',
      category: photo.category || 'Job Melas',
      imageUrl: photo.imageUrl || '',
      date: photo.date || '',
      description: photo.description || '',
    });
    setPhotoModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      addToast('Image size should be less than 3MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoForm(prev => ({ ...prev, imageUrl: reader.result }));
      addToast('Photo loaded successfully.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e) => {
    e.preventDefault();
    if (!photoForm.title.trim()) {
      addToast('Photo title is required', 'error');
      return;
    }
    if (!photoForm.imageUrl.trim()) {
      addToast('Please provide an image URL or upload an image file', 'error');
      return;
    }

    if (editingPhotoId) {
      updateGalleryImage(editingPhotoId, photoForm);
      addToast('Gallery photo updated successfully!', 'success');
    } else {
      addGalleryImage(photoForm);
      addToast('New photo added to gallery!', 'success');
    }
    setPhotoModalOpen(false);
  };

  const handleDeletePhoto = (photo) => {
    if (window.confirm(`Are you sure you want to delete photo "${photo.title}"?`)) {
      deleteGalleryImage(photo.id);
      addToast('Photo deleted from gallery.', 'info');
    }
  };

  // ── Video Modal State ──
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    youtubeUrl: '',
    category: 'Job Melas',
    date: '',
    description: '',
  });

  const detectedVideoId = useMemo(() => {
    return getYouTubeVideoId(videoForm.youtubeUrl);
  }, [videoForm.youtubeUrl]);

  const handleOpenAddVideo = () => {
    setEditingVideoId(null);
    setVideoForm({
      title: '',
      youtubeUrl: '',
      category: 'Job Melas',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: '',
    });
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (video) => {
    setEditingVideoId(video.id);
    setVideoForm({
      title: video.title || '',
      youtubeUrl: video.youtubeUrl || '',
      category: video.category || 'Job Melas',
      date: video.date || '',
      description: video.description || '',
    });
    setVideoModalOpen(true);
  };

  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!videoForm.title.trim()) {
      addToast('Video title is required', 'error');
      return;
    }
    if (!videoForm.youtubeUrl.trim() || !detectedVideoId) {
      addToast('Please provide a valid YouTube video URL', 'error');
      return;
    }

    if (editingVideoId) {
      updateGalleryVideo(editingVideoId, videoForm);
      addToast('Gallery video updated successfully!', 'success');
    } else {
      addGalleryVideo(videoForm);
      addToast('New video added to gallery! Hover playback is enabled.', 'success');
    }
    setVideoModalOpen(false);
  };

  const handleDeleteVideo = (video) => {
    if (window.confirm(`Are you sure you want to delete video "${video.title}"?`)) {
      deleteGalleryVideo(video.id);
      addToast('Video deleted from gallery.', 'info');
    }
  };

  // ── Filtered items ──
  const filteredPhotos = useMemo(() => {
    return images.filter(item => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      if (!matchCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (item.title || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [images, categoryFilter, searchQuery]);

  const filteredVideos = useMemo(() => {
    return videos.filter(item => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      if (!matchCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (item.title || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [videos, categoryFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Sub Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'inline-flex', gap: 6, background: 'var(--color-bg)', padding: 4, borderRadius: 'var(--radius-lg)' }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('photos');
              setCategoryFilter('All');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'photos' ? 'var(--color-primary-600)' : 'transparent',
              color: activeTab === 'photos' ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: activeTab === 'photos' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <Camera size={16} />
            <span>Photo Gallery ({images.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('videos');
              setCategoryFilter('All');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'videos' ? 'var(--color-primary-600)' : 'transparent',
              color: activeTab === 'videos' ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: activeTab === 'videos' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <Film size={16} />
            <span>Video Gallery ({videos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('header')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'header' ? 'var(--color-primary-600)' : 'transparent',
              color: activeTab === 'header' ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: activeTab === 'header' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <Sparkles size={16} />
            <span>Section Header</span>
          </button>
        </div>

        {/* Action Button */}
        {activeTab === 'photos' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddPhoto}
            leftIcon={<Plus size={16} />}
          >
            Add New Photo
          </Button>
        )}

        {activeTab === 'videos' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddVideo}
            leftIcon={<Plus size={16} />}
          >
            Add YouTube Video
          </Button>
        )}
      </div>

      {/* ── 1. HEADER SETTINGS TAB ── */}
      {activeTab === 'header' && (
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--color-border)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Gallery Section Header</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                Controls the badge, main headings, and description displayed above the gallery on the landing page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetHeader}
              className="btn btn-secondary btn-xs"
              style={{ gap: 4 }}
            >
              <RotateCcw size={12} /> Reset Defaults
            </button>
          </div>

          <form onSubmit={handleSaveHeader} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Top Pill Badge">
              <Input
                value={headerForm.badge}
                onChange={(e) => setHeaderForm({ ...headerForm, badge: e.target.value })}
                placeholder="Moments & Media Highlights"
                required
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <FormField label="Main Heading 1 (Left Part)">
                <Input
                  value={headerForm.heading1}
                  onChange={(e) => setHeaderForm({ ...headerForm, heading1: e.target.value })}
                  placeholder="NTR VIKASA Event &"
                  required
                />
              </FormField>

              <FormField label="Main Heading 2 (Gradient Highlight)">
                <Input
                  value={headerForm.heading2}
                  onChange={(e) => setHeaderForm({ ...headerForm, heading2: e.target.value })}
                  placeholder="Media Gallery"
                  required
                />
              </FormField>
            </div>

            <FormField label="Subtitle / Description">
              <Textarea
                rows={3}
                value={headerForm.subtitle}
                onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })}
                placeholder="Explore glimpses from our mega job fairs, candidate felicitations..."
                required
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type="submit" variant="primary">
                Save Header Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. PHOTOS TAB ── */}
      {activeTab === 'photos' && (
        <>
          {/* Controls bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search photos by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Category:</span>
              {['All', ...CATEGORY_OPTIONS.slice(0, 4)].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: categoryFilter === cat ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                    background: categoryFilter === cat ? 'var(--color-primary-50)' : 'var(--color-surface)',
                    color: categoryFilter === cat ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                    fontSize: '12px',
                    fontWeight: categoryFilter === cat ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Camera size={40} style={{ opacity: 0.35, marginBottom: 8 }} />
              <h4 style={{ fontWeight: 600, color: 'var(--color-text)' }}>No photos found</h4>
              <p style={{ fontSize: '13px', marginTop: 4 }}>Click &quot;Add New Photo&quot; to upload your first image.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ position: 'relative', paddingTop: '60%', background: '#0f172a', overflow: 'hidden' }}>
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(6px)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {photo.category}
                    </span>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{photo.date}</span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--color-text)', lineHeight: 1.3 }}>
                      {photo.title}
                    </h4>

                    {photo.description && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {photo.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditPhoto(photo)}
                        className="btn btn-secondary btn-xs"
                        style={{ gap: 4 }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo)}
                        className="btn btn-danger btn-xs"
                        style={{ gap: 4 }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 3. VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <>
          {/* Controls bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search videos by title or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Category:</span>
              {['All', ...CATEGORY_OPTIONS.slice(0, 4)].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: categoryFilter === cat ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                    background: categoryFilter === cat ? 'var(--color-primary-50)' : 'var(--color-surface)',
                    color: categoryFilter === cat ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                    fontSize: '12px',
                    fontWeight: categoryFilter === cat ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Film size={40} style={{ opacity: 0.35, marginBottom: 8 }} />
              <h4 style={{ fontWeight: 600, color: 'var(--color-text)' }}>No YouTube videos registered</h4>
              <p style={{ fontSize: '13px', marginTop: 4 }}>Click &quot;Add YouTube Video&quot; to link your first video with hover playback.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {filteredVideos.map((video) => {
                const vidId = getYouTubeVideoId(video.youtubeUrl);
                const thumb = getYouTubeThumbnailUrl(vidId, 'hqdefault');
                const watchUrl = video.youtubeUrl || getYouTubeWatchUrl(vidId);

                return (
                  <div
                    key={video.id}
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#090d16', overflow: 'hidden' }}>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={video.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <Film size={32} />
                        </div>
                      )}

                      {/* Video Category Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(6px)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {video.category}
                      </span>

                      {/* YouTube Play Icon Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}
                      >
                        <Play size={18} fill="#ffffff" />
                      </div>
                    </div>

                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{video.date}</span>
                        {watchUrl && (
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '11px',
                              color: '#ef4444',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <span>YouTube</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--color-text)', lineHeight: 1.3 }}>
                        {video.title}
                      </h4>

                      {video.description && (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {video.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideo(video)}
                          className="btn btn-secondary btn-xs"
                          style={{ gap: 4 }}
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(video)}
                          className="btn btn-danger btn-xs"
                          style={{ gap: 4 }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── PHOTO MODAL (ADD / EDIT) ── */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title={editingPhotoId ? 'Edit Gallery Photo' : 'Add New Photo to Gallery'}
        size="md"
      >
        <form onSubmit={handleSavePhoto} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Photo Title" required>
            <Input
              value={photoForm.title}
              onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
              placeholder="e.g. Mega Job Mela Vijayawada 2026"
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Category">
              <select
                value={photoForm.category}
                onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: '13px',
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Date">
              <Input
                value={photoForm.date}
                onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                placeholder="e.g. 15 Sep 2026"
              />
            </FormField>
          </div>

          <FormField label="Image File or URL" required>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={photoForm.imageUrl}
                  onChange={(e) => setPhotoForm({ ...photoForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  style={{ flex: 1 }}
                />
                <label
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-gray-100)',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <UploadCloud size={14} /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {photoForm.imageUrl && (
                <div style={{ position: 'relative', height: 160, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#0f172a' }}>
                  <img
                    src={photoForm.imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Description / Context (Optional)">
            <Textarea
              rows={2}
              value={photoForm.description}
              onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
              placeholder="Brief description of the ceremony, event, or attendees..."
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button type="button" variant="outline" onClick={() => setPhotoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPhotoId ? 'Update Photo' : 'Add Photo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── VIDEO MODAL (ADD / EDIT) ── */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={editingVideoId ? 'Edit YouTube Video' : 'Add YouTube Video to Gallery'}
        size="md"
      >
        <form onSubmit={handleSaveVideo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField
            label="YouTube Video Link (URL)"
            required
            helperText="Paste full YouTube watch URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
          >
            <Input
              value={videoForm.youtubeUrl}
              onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </FormField>

          {/* Real-time YouTube Link Detection Status & Preview */}
          {videoForm.youtubeUrl && (
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-lg)',
                background: detectedVideoId ? '#ecfdf5' : '#fef2f2',
                border: detectedVideoId ? '1px solid #a7f3d0' : '1px solid #fecaca',
                color: detectedVideoId ? '#065f46' : '#991b1b',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {detectedVideoId ? (
                <>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>
                    <strong>Valid YouTube Video Detected!</strong> Video ID: <code>{detectedVideoId}</code>
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span>
                    Could not parse video ID. Please check the URL format.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Live Video Preview if valid */}
          {detectedVideoId && (
            <div
              style={{
                position: 'relative',
                paddingTop: '56.25%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#090d16',
                border: '1px solid var(--color-border)',
              }}
            >
              <iframe
                src={buildYouTubeEmbedUrl(detectedVideoId, { controls: 1, autoplay: 0, mute: 1 })}
                title="Preview"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <FormField label="Video Title" required>
            <Input
              value={videoForm.title}
              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
              placeholder="e.g. Mega Job Mela Vijayawada Highlights"
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Category">
              <select
                value={videoForm.category}
                onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: '13px',
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Date">
              <Input
                value={videoForm.date}
                onChange={(e) => setVideoForm({ ...videoForm, date: e.target.value })}
                placeholder="e.g. 16 Sep 2026"
              />
            </FormField>
          </div>

          <FormField label="Description / Highlights (Optional)">
            <Textarea
              rows={2}
              value={videoForm.description}
              onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
              placeholder="Brief summary of what this video showcases..."
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button type="button" variant="outline" onClick={() => setVideoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!detectedVideoId}>
              {editingVideoId ? 'Update Video' : 'Add Video'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
