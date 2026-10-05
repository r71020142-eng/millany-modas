import React from 'react';
import { isVideoMedia } from '../../utils/media';
import { Play } from 'lucide-react';

export default function ProductMedia({
  src,
  alt = '',
  className = 'w-full h-full object-cover',
  controls = false,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  showBadge = false,
  badgeText = 'Vídeo',
  onClick,
  ...props
}) {
  const fallback = 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp';
  const mediaSrc = src || fallback;
  const isVideo = isVideoMedia(mediaSrc);

  if (isVideo) {
    return (
      <div className="relative w-full h-full" onClick={onClick}>
        <video
          src={mediaSrc}
          className={className}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          {...props}
        />
        {showBadge && (
          <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-md z-10 pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-white text-white" /> {badgeText}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={mediaSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
      {...props}
    />
  );
}
