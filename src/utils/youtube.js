/**
 * YouTube Utility Helpers for Video Gallery
 */

export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Handles:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://youtube.com/shorts/VIDEO_ID?feature=share
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /^([\w-]{11})$/ // Raw 11-char ID
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getYouTubeThumbnailUrl(videoId, quality = 'hqdefault') {
  if (!videoId) return '';
  // quality: maxresdefault, hqdefault, mqdefault, default
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function buildYouTubeEmbedUrl(videoId, options = {}) {
  if (!videoId) return '';
  const {
    controls = 0,
    autoplay = 0,
    mute = 1,
    loop = 0,
    rel = 0,
    modestbranding = 1,
    playsinline = 1,
    enablejsapi = 1
  } = options;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    enablejsapi: String(enablejsapi),
    controls: String(controls),
    autoplay: String(autoplay),
    mute: String(mute),
    loop: String(loop),
    rel: String(rel),
    modestbranding: String(modestbranding),
    playsinline: String(playsinline),
    iv_load_policy: '3',
    showinfo: '0',
    fs: '0',
    origin: origin
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeWatchUrl(videoId) {
  if (!videoId) return '#';
  return `https://www.youtube.com/watch?v=${videoId}`;
}
