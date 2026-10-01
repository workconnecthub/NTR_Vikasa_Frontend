import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Newspaper, ChevronLeft, ChevronRight, Pause, Play,
  Sparkles, ExternalLink, ArrowRight
} from 'lucide-react';
import NewsArticleCard from '../ui/NewsArticleCard';
import NewsArticleLightbox from '../ui/NewsArticleLightbox';
import Button from '../ui/Button';

export default function NewsArticlesSection({ newsContent }) {
  const articles = useMemo(() => newsContent?.articles || [], [newsContent]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);

  // Responsive items visible
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, articles.length - itemsPerView);

  // ── Auto-Moving: slowly move one by one (3.8s per step, pauses on hover) ──
  useEffect(() => {
    if (!isAutoPlaying || isHovered || articles.length <= itemsPerView) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3800);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, maxIndex, articles.length, itemsPerView]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleOpenLightbox = (index) => {
    setActiveArticleIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevLightbox = () => {
    setActiveArticleIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  const handleNextLightbox = () => {
    setActiveArticleIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  };

  const badge = newsContent?.badge || 'In The Media & Press';
  const heading1 = newsContent?.heading1 || 'Official Newspaper &';
  const heading2 = newsContent?.heading2 || 'Press Highlights';
  const subtitle = newsContent?.subtitle || 'Read authentic press coverage, newspaper clippings, and administrative reports of NTR VIKASA Mega Job Melas across Andhra Pradesh.';

  if (articles.length === 0) return null;

  return (
    <section
      id="news-articles"
      style={{
        padding: 'var(--space-20) 0',
        background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
        borderTop: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container">
        {/* ── Section Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 'var(--space-8)',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
              <Newspaper size={12} style={{ marginRight: 5 }} /> {badge}
            </div>
            <h2
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 800,
                color: 'var(--color-text)',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {heading1}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {heading2}
              </span>
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-2)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Carousel Controls (Autoplay toggle, Left & Right arrows) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Auto-moving status pill */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              title={isAutoPlaying ? 'Pause slow auto-scroll' : 'Resume slow auto-scroll'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: isAutoPlaying ? 'rgba(34, 197, 94, 0.12)' : 'var(--color-gray-100)',
                border: isAutoPlaying ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--color-border)',
                color: isAutoPlaying ? '#15803d' : 'var(--color-text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isAutoPlaying ? (isHovered ? 'Hover Paused' : 'Auto-moving') : 'Paused'}</span>
            </button>

            {/* Left Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous articles"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-50)';
                e.currentTarget.style.color = 'var(--color-primary-600)';
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next articles"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-50)';
                e.currentTarget.style.color = 'var(--color-primary-600)';
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Carousel Slider Container ── */}
        <div style={{ position: 'relative', overflow: 'hidden', padding: '10px 4px 16px 4px' }}>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              transition: 'transform 650ms cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(calc(-${currentIndex} * (100% / ${itemsPerView} + ${24 / itemsPerView}px)))`,
            }}
          >
            {articles.map((article, index) => (
              <div
                key={article.id || index}
                style={{
                  flex: `0 0 calc(${100 / itemsPerView}% - ${(24 * (itemsPerView - 1)) / itemsPerView}px)`,
                  minWidth: `calc(${100 / itemsPerView}% - ${(24 * (itemsPerView - 1)) / itemsPerView}px)`,
                  boxSizing: 'border-box',
                }}
              >
                <NewsArticleCard
                  article={article}
                  onClick={() => handleOpenLightbox(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Pagination Indicators ── */}
        {articles.length > itemsPerView && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'var(--space-6)' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: currentIndex === idx ? 28 : 8,
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: currentIndex === idx ? 'var(--color-primary-600)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 250ms ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen News Clipping Lightbox ── */}
      {lightboxOpen && (
        <NewsArticleLightbox
          articles={articles}
          currentIndex={activeArticleIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={handlePrevLightbox}
          onNext={handleNextLightbox}
        />
      )}
    </section>
  );
}
