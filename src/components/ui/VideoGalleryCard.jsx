import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, ExternalLink, Calendar, Film, Play, Pause, Sparkles } from 'lucide-react';
import { getYouTubeVideoId, buildYouTubeEmbedUrl, getYouTubeWatchUrl, getYouTubeThumbnailUrl } from '../../utils/youtube';

export default function VideoGalleryCard({ video }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clickFeedback, setClickFeedback] = useState(null); // 'play' | 'pause' | null
  const iframeRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const videoId = getYouTubeVideoId(video.youtubeUrl);
  const watchUrl = video.youtubeUrl || getYouTubeWatchUrl(videoId);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, 'hqdefault');

  const sendIframeCommand = (command, args = '') => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: args || '',
          }),
          '*'
        );
      }
    } catch (err) {
      // ignore cross-origin errors if any
    }
  };

  const handleMouseEnter = () => {
    // Hover to play
    sendIframeCommand('playVideo');
    setIsPlaying(true);
  };

  const handleMouseLeave = () => {
    // Mouse leave to pause
    sendIframeCommand('pauseVideo');
    setIsPlaying(false);
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
      showFeedback('pause');
    } else {
      sendIframeCommand('playVideo');
      setIsPlaying(true);
      showFeedback('play');
    }
  };

  const showFeedback = (type) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setClickFeedback(type);
    feedbackTimerRef.current = setTimeout(() => {
      setClickFeedback(null);
    }, 700);
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    if (isMuted) {
      sendIframeCommand('unMute');
      setIsMuted(false);
    } else {
      sendIframeCommand('mute');
      setIsMuted(true);
    }
  };

  const handleRedirectYouTube = (e) => {
    e.stopPropagation();
    if (watchUrl) {
      window.open(watchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  if (!videoId) {
    return (
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 280,
          color: 'var(--color-text-muted)',
        }}
      >
        <Film size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
        <h4 style={{ fontWeight: 600, color: 'var(--color-text)' }}>{video.title || 'Video Unavailable'}</h4>
        <p style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>Invalid YouTube URL provided</p>
      </div>
    );
  }

  const embedUrl = buildYouTubeEmbedUrl(videoId, {
    controls: 0,
    autoplay: 0,
    mute: 1,
    loop: 1,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
    enablejsapi: 1,
  });

  return (
    <div
      className="video-gallery-card card-hoverable"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--color-surface)',
        border: isPlaying ? '1px solid var(--color-primary-500)' : '1px solid var(--color-border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isPlaying ? '0 12px 30px -8px rgba(37, 99, 235, 0.22)' : 'var(--shadow-sm)',
        transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
    >
      {/* ── Top Video Player Container ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          background: '#090d16',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={handleVideoClick}
      >
        {/* YouTube Iframe */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={video.title || 'YouTube video'}
          onLoad={() => setIsLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'none', // clicks are handled by the custom interactive overlay
            transition: 'opacity 200ms ease',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Thumbnail fallback placeholder while iframe initialises */}
        {!isLoaded && thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={video.title || 'Video preview'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Transparent Click Overlay to capture user clicks for Play/Pause */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            background: 'transparent',
          }}
          title={isPlaying ? 'Click to pause video' : 'Click to play video'}
        />

        {/* Floating Top Controls Bar (Redirect to YouTube & Mute/Unmute) */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 20,
          }}
        >
          {/* Mute / Unmute Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-full)',
              background: isMuted ? 'rgba(15, 23, 42, 0.75)' : 'rgba(37, 99, 235, 0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'all 160ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Redirect to YouTube Button */}
          <button
            type="button"
            onClick={handleRedirectYouTube}
            aria-label="Watch on YouTube"
            title="Watch original video on YouTube"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.9)', // YouTube brand red accent
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              transition: 'all 160ms ease',
              letterSpacing: '0.02em',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = '#dc2626';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
            }}
          >
            <span>YouTube</span>
            <ExternalLink size={12} />
          </button>
        </div>

        {/* Bottom State Pill (Playing / Hover to Play) */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 12,
            zIndex: 20,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: isPlaying ? 'rgba(34, 197, 94, 0.88)' : 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isPlaying ? '#ffffff' : '#94a3b8',
                boxShadow: isPlaying ? '0 0 8px #ffffff' : 'none',
                display: 'inline-block',
                animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            {isPlaying ? 'Playing' : 'Hover to Play'}
          </span>
        </div>

        {/* Temporary Click Feedback Indicator Animation (Play / Pause pulse) */}
        {clickFeedback && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              zIndex: 30,
              pointerEvents: 'none',
              animation: 'feedbackPop 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {clickFeedback === 'play' ? <Play size={24} fill="#ffffff" /> : <Pause size={24} fill="#ffffff" />}
          </div>
        )}
      </div>

      {/* ── Card Body Info ── */}
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
            {video.category || 'Event'}
          </span>

          {video.date && (
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
              {video.date}
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
          {video.title}
        </h3>

        {video.description && (
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
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}
