/**
 * Media detection & utilities for Images (JPG, PNG, WEBP) and Videos (MP4, WEBM)
 */

export const isVideoMedia = (url) => {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  
  // Data URL base64 video check
  if (clean.startsWith('data:video/')) return true;

  // File extension checks
  const urlWithoutParams = clean.split('?')[0].split('#')[0];
  if (
    urlWithoutParams.endsWith('.mp4') ||
    urlWithoutParams.endsWith('.webm') ||
    urlWithoutParams.endsWith('.mov') ||
    urlWithoutParams.endsWith('.m4v')
  ) {
    return true;
  }

  // Keywords in URL
  if (clean.includes('video/mp4') || clean.includes('.mp4?') || clean.includes('/videos/')) {
    return true;
  }

  return false;
};

export const getMediaType = (url) => {
  if (isVideoMedia(url)) return 'video';
  return 'image';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
