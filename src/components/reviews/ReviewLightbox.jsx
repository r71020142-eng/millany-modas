import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ReviewLightbox({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onNavigate
}) {
  if (!isOpen || images.length === 0) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1));
      if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, currentIndex + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  const currentImg = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Top Controls Bar */}
      <div className="absolute top-4 left-0 right-0 px-6 flex items-center justify-between z-20 text-white">
        <div className="text-xs sm:text-sm font-semibold bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          Foto {currentIndex + 1} de {images.length}
        </div>

        <button
          onClick={onClose}
          className="p-2 text-gray-300 hover:text-white bg-black/60 hover:bg-black/90 rounded-full transition-all border border-white/10"
          aria-label="Fechar visualizador"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative max-w-4xl max-h-[85vh] z-10 flex items-center justify-center">
        <img
          src={currentImg}
          alt={`Foto da avaliação ${currentIndex + 1}`}
          className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl border border-white/10"
        />

        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-2 sm:-left-12 p-3 text-white bg-black/70 hover:bg-brand-rose rounded-full transition-all border border-white/20 shadow-xl"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-2 sm:-right-12 p-3 text-white bg-black/70 hover:bg-brand-rose rounded-full transition-all border border-white/20 shadow-xl"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-20 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-brand-rose scale-105 shadow-lg'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
