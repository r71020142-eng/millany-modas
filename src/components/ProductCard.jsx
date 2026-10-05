import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Check, Star, Play } from 'lucide-react';
import { formatBRL } from '../utils/masks';
import { isVideoMedia } from '../utils/media';
import { getProductRatingStats } from '../data/reviews';

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  onOpenProduct
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );

  const ratingStats = getProductRatingStats(product.id);

  const mainImg = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp';

  const hoverImg = product.images && product.images.length > 1
    ? product.images[1]
    : mainImg;

  const currentMedia = isHovered ? hoverImg : mainImg;
  const isVideo = isVideoMedia(currentMedia);
  const hasAnyVideo = product.images?.some(isVideoMedia);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddToCart({
      ...product,
      color: selectedColor || (product.colors?.[0]?.name || 'Padrão'),
      size: product.sizes?.[0] || 'Tamanho Único',
      quantity: 1
    });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div
      className="group relative bg-brand-card/80 border border-brand-border/80 hover:border-brand-rose/60 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-brand-rose/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image / Video Container */}
      <div
        className="relative w-full aspect-[3/4] bg-black/60 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        {isVideo ? (
          <video
            src={currentMedia}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
          />
        ) : (
          <img
            src={currentMedia}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Video Badge indicator */}
        {hasAnyVideo && (
          <span className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-md z-10 pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-white text-white" /> Vídeo
          </span>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badges?.map((badge, idx) => (
            <span
              key={idx}
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm shadow-md ${
                badge === 'Promoção'
                  ? 'bg-red-600 text-white'
                  : badge === 'Poliamida premium'
                  ? 'bg-amber-600 text-white'
                  : 'bg-black/80 text-brand-rose-light backdrop-blur-md border border-brand-rose/40'
              }`}
            >
              {badge}
            </span>
          ))}
          {product.compare_price && product.compare_price !== 'R$0,00' && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-brand-rose text-white shadow-md">
              OFF
            </span>
          )}
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="px-4 py-2 bg-black/80 hover:bg-brand-rose text-white text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg border border-white/20"
          >
            <Eye className="w-3.5 h-3.5" /> Espiar
          </button>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              {product.colors.slice(0, 5).map((c, i) => (
                <button
                  key={i}
                  title={c.name}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(c.name); }}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    selectedColor === c.name
                      ? 'ring-2 ring-brand-rose ring-offset-1 ring-offset-black scale-110 border-white'
                      : 'border-white/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-gray-400">+{product.colors.length - 5}</span>
              )}
            </div>
          )}

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-sm sm:text-base text-gray-100 group-hover:text-brand-rose-light transition-colors line-clamp-1 cursor-pointer"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Category Tag */}
          <span className="text-[11px] text-gray-400 uppercase tracking-wider block mt-0.5">
            {product.category}
          </span>

          {/* Rating Stars (Shopee Style) */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-white ml-1">{ratingStats.average}</span>
            </div>
            <span className="text-[11px] text-gray-400">({ratingStats.count})</span>
          </div>

          {/* Pricing */}
          <div className="mt-2.5">
            {product.compare_price && product.compare_price !== 'R$0,00' && (
              <span className="text-xs text-gray-500 line-through mr-2">
                {product.compare_price}
              </span>
            )}
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              {product.price || formatBRL(product.price_number)}
            </span>

            {/* Pix Discount */}
            <div className="text-xs text-brand-pix font-medium mt-0.5 flex items-center gap-1">
              <span>{product.pix_price}</span>
              <span className="text-[10px] text-gray-300">com Pix</span>
            </div>

            {/* Installments */}
            <div className="text-[11px] text-gray-400 mt-0.5">
              {product.installments}
            </div>
          </div>
        </div>

        {/* 3. Action Button ("Comprar") */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <button
            onClick={handleQuickAdd}
            disabled={addedAnim}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
              addedAnim
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-rose hover:bg-brand-rose-dark text-white hover:shadow-brand-rose/30'
            }`}
          >
            {addedAnim ? (
              <>
                <Check className="w-4 h-4" /> Pronto!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
