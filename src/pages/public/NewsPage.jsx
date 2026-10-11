import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper, Search, Filter, Sparkles, ChevronRight, Home,
  Calendar, ExternalLink, RefreshCw
} from 'lucide-react';
import { useAdmin, DEFAULT_HOME_CONTENT } from '../../context/AdminContext';
import NewsArticleCard from '../../components/ui/NewsArticleCard';
import NewsArticleLightbox from '../../components/ui/NewsArticleLightbox';
import Button from '../../components/ui/Button';
import publicService from '../../services/publicService';

export default function NewsPage() {
  const { homeContent } = useAdmin();
  const currentContent = homeContent || DEFAULT_HOME_CONTENT;
  const fallbackNews = currentContent.newsArticles || DEFAULT_HOME_CONTENT.newsArticles;

  const [liveArticles, setLiveArticles] = useState(null);
  const [liveHeader, setLiveHeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const fetchNewsData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pressRes, headerRes] = await Promise.allSettled([
        publicService.getPublishedPressArticles({ page_size: 100 }),
        publicService.getPublishedSectionHeader('news'),
      ]);

      if (pressRes.status === 'fulfilled' && Array.isArray(pressRes.value)) {
        setLiveArticles(pressRes.value.map(a => ({
          id: a.id,
          newspaper: a.newspaper || a.publication_name,
          title: a.title,
          date: a.date || a.publication_date,
          edition: a.edition || '',
          imageUrl: a.imageUrl || a.image_url,
          sourceUrl: a.sourceUrl || a.source_url || a.article_url || '',
          summary: a.summary || a.description || '',
          category: a.category || 'Press Coverage',
        })));
      } else if (pressRes.status === 'rejected') {
        setLoadError('Unable to load press coverage at this time.');
      }

      if (headerRes.status === 'fulfilled' && headerRes.value) {
        setLiveHeader(headerRes.value);
      }
    } catch (err) {
      console.warn('NewsPage fetch warning:', err);
      setLoadError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const [selectedPublication, setSelectedPublication] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);

  const articles = useMemo(() => {
    if (liveArticles !== null) return liveArticles;
    return fallbackNews?.articles || [];
  }, [liveArticles, fallbackNews]);

  const activeHeader = useMemo(() => ({
    badge: liveHeader?.badge || fallbackNews?.badge || 'In The Media & Press',
    heading1: liveHeader?.heading1 || fallbackNews?.heading1 || 'Official Newspaper &',
    heading2: liveHeader?.heading2 || fallbackNews?.heading2 || 'Press Highlights',
    subtitle: liveHeader?.subtitle || fallbackNews?.subtitle || 'Read authentic press coverage, newspaper clippings, and administrative reports of NTR VIKASA Mega Job Melas across Andhra Pradesh.',
  }), [liveHeader, fallbackNews]);

  const publications = useMemo(() => {
    const set = new Set();
    articles.forEach(item => {
      if (item.newspaper) set.add(item.newspaper.trim());
    });
    return ['All', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(item => {
      const matchPub = selectedPublication === 'All' || item.newspaper === selectedPublication;
      if (!matchPub) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchPaper = (item.newspaper || '').toLowerCase().includes(q);
        const matchEdition = (item.edition || '').toLowerCase().includes(q);
        const matchSummary = (item.summary || '').toLowerCase().includes(q);
        return matchTitle || matchPaper || matchEdition || matchSummary;
      }
      return true;
    });
  }, [articles, selectedPublication, searchTerm]);

  const handleOpenLightbox = (index) => {
    setActiveArticleIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevArticle = () => {
    setActiveArticleIndex(prev => (prev === 0 ? filteredArticles.length - 1 : prev - 1));
  };

  const handleNextArticle = () => {
    setActiveArticleIndex(prev => (prev === filteredArticles.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ── Top Hero Banner (matching GalleryPage pattern) ── */}
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
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>News & Press Clippings</span>
          </div>

          <div style={{ maxWidth: 780 }}>
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
                  background: 'linear-gradient(135deg, #f87171 0%, #fb923c 50%, #fde047 100%)',
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

          {/* Counter Badge */}
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
              <Newspaper size={18} style={{ color: '#fb923c' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Verified Press Clippings</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{articles.length} Reports Published</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Container ── */}
      <section style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
        <div className="container">
          {/* Controls Bar: Search & Publication Filter Chips */}
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
            {/* Search Input */}
            <div style={{ position: 'relative', width: 340, maxWidth: '100%' }}>
              <Search
                size={15}
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
                placeholder="Search clippings by newspaper or headline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-xs)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
            </div>

            {/* Total Results Count */}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Showing <strong>{filteredArticles.length}</strong> of <strong>{articles.length}</strong> clippings
            </div>
          </div>

          {/* Publication Chips (Filter Bar) */}
          {publications.length > 2 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 'var(--space-8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginRight: 4 }}>
                <Filter size={13} />
                <span>Publication:</span>
              </div>
              {publications.map((pub) => {
                const isSelected = selectedPublication === pub;
                return (
                  <button
                    key={pub}
                    type="button"
                    onClick={() => setSelectedPublication(pub)}
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
                    {pub}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-20) var(--space-4)',
                color: 'var(--color-text-muted)',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  border: '3px solid var(--color-border)',
                  borderTopColor: 'var(--color-primary-600)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: 12,
                }}
              />
              <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>Loading verified newspaper clippings from database...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && loadError && articles.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-16) var(--space-4)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-2xl)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <p style={{ fontSize: 'var(--text-base)', color: '#ef4444', marginBottom: 16 }}>{loadError}</p>
              <Button variant="secondary" size="sm" onClick={fetchNewsData} leftIcon={<RefreshCw size={14} />}>
                Retry Loading
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && (!loadError || articles.length > 0) && filteredArticles.length === 0 && (
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
              <Newspaper size={44} style={{ opacity: 0.35, marginBottom: 12 }} />
              <h3 style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-lg)' }}>
                No newspaper clippings matched your criteria
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>
                Try adjusting your search keywords or select another publication filter.
              </p>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && filteredArticles.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 'var(--space-6)',
              }}
            >
              {filteredArticles.map((article, index) => (
                <NewsArticleCard
                  key={article.id || index}
                  article={article}
                  onClick={() => handleOpenLightbox(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Fullscreen News Clipping Lightbox ── */}
      {lightboxOpen && (
        <NewsArticleLightbox
          articles={filteredArticles}
          currentIndex={activeArticleIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={handlePrevArticle}
          onNext={handleNextArticle}
        />
      )}
    </div>
  );
}
