import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BANNER_SLIDES } from '../data/banners';

export default function BannerSlider({ onSelectCategory, banners = BANNER_SLIDES }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners && banners.length > 0 ? banners : BANNER_SLIDES;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black aspect-[16/9] sm:aspect-[21/9] max-h-[580px] group">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative h-full cursor-pointer select-none"
            onClick={() => onSelectCategory(slide.category || 'Todos')}
          >
            <picture>
              <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
              <img
                src={slide.desktopImage}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </picture>

            {/* Subtle luxury gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end sm:items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 w-full text-left">
                <span className="inline-block px-3 py-1 bg-brand-rose text-white text-[11px] font-bold uppercase tracking-widest rounded-sm mb-2 shadow-md">
                  Millany Modas Exclusivo
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-white max-w-xl leading-tight drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="mt-2 text-xs sm:text-base text-gray-200 max-w-md drop-shadow">
                  {slide.subtitle}
                </p>
                <div className="mt-4 sm:mt-6">
                  <button className="px-6 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs uppercase font-bold tracking-widest rounded-sm transition-all shadow-lg hover:shadow-brand-rose/40">
                    {slide.ctaText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-brand-rose text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/10"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-brand-rose text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/10"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {activeBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              currentIndex === idx ? 'w-8 bg-brand-rose' : 'w-2 bg-white/40 hover:bg-white'
            }`}
            aria-label={`Ir para slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
