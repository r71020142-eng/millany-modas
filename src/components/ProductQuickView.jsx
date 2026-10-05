import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck, ShieldCheck, CreditCard, ChevronRight, Check, Sparkles, Star, MessageSquare, Play, Film } from 'lucide-react';
import { formatBRL, maskCEP, fetchAddressByCEP } from '../utils/masks';
import { isVideoMedia } from '../utils/media';
import ShopeeReviews from './reviews/ShopeeReviews';
import { getProductRatingStats } from '../data/reviews';

export default function ProductQuickView({
  product,
  onClose,
  onAddToCart,
  onBuyNow
}) {
  if (!product) return null;

  const [selectedImg, setSelectedImg] = useState(
    product.images?.[0] || 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp'
  );

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImg(product.images[0]);
    }
  }, [product]);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Padrão');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Tamanho Único');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const ratingStats = getProductRatingStats(product.id);

  const handleAdd = () => {
    onAddToCart({
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const handleCheckoutDirect = () => {
    onAddToCart({
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
    onBuyNow();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto z-10 shadow-2xl text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/60 rounded-full transition-colors z-20"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
          
          {/* Left Column: Image / Video Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] bg-black/50 rounded-xl overflow-hidden border border-brand-border">
              {isVideoMedia(selectedImg) ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    key={selectedImg}
                    src={selectedImg}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] text-white flex items-center gap-1.5 font-semibold z-10 pointer-events-none">
                    <Film className="w-3 h-3 text-brand-rose" /> Vídeo Demonstrativo
                  </div>
                </div>
              ) : (
                <img
                  src={selectedImg}
                  alt={product.title}
                  className="w-full h-full object-cover object-top"
                />
              )}

              {product.badges?.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.badges.map((b, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-brand-rose text-white shadow">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, idx) => {
                  const isThumbVideo = isVideoMedia(img);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImg(img)}
                      className={`relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
                        selectedImg === img ? 'border-brand-rose ring-2 ring-brand-rose/40' : 'border-brand-border/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isThumbVideo ? (
                        <div className="relative w-full h-full bg-black">
                          <video
                            src={img}
                            muted
                            playsInline
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                            <div className="w-5 h-5 rounded-full bg-brand-rose/90 flex items-center justify-center text-white shadow">
                              <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details & Options */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-rose-light font-semibold">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-white mt-1">
                {product.title}
              </h1>

              {/* Shopee-style Rating Bar */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(ratingStats.average)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-white">{ratingStats.average}</span>
                <span className="text-gray-500 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('shopee-reviews-anchor');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-brand-rose-light hover:underline font-semibold"
                >
                  {ratingStats.count} avaliações
                </button>
                {ratingStats.withPhotosCount > 0 && (
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                    ✓ {ratingStats.withPhotosCount} com fotos
                  </span>
                )}
              </div>

              {/* Price Block */}
              <div className="mt-3 p-3.5 rounded-xl bg-black/50 border border-brand-border/60">
                {product.compare_price && product.compare_price !== 'R$0,00' && (
                  <span className="text-xs text-gray-500 line-through mr-2">
                    {product.compare_price}
                  </span>
                )}
                <span className="text-2xl font-bold text-white tracking-tight">
                  {product.price || formatBRL(product.price_number)}
                </span>
                
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-pix">
                    {product.pix_price}
                  </span>
                  <span className="text-xs text-gray-300">com Pix (1% de desconto)</span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Ou em até <strong className="text-gray-200">{product.installments}</strong>
                </p>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2">
                    Cor: <span className="text-brand-rose-light normal-case font-bold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
                          selectedColor === c.name
                            ? 'border-brand-rose bg-brand-rose/20 text-white font-semibold'
                            : 'border-brand-border bg-black/40 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2">
                    Tamanho: <span className="text-brand-rose-light normal-case font-bold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[48px] px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                          selectedSize === s
                            ? 'border-brand-rose bg-brand-rose text-white shadow-md'
                            : 'border-brand-border bg-black/40 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Quantidade:
                </span>
                <div className="flex items-center border border-brand-border rounded-lg bg-black/40">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-sm font-bold text-white min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-4 pt-3 border-t border-white/5 text-xs text-gray-300 leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                  added
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-brand-card hover:bg-brand-rose/20 text-white border-brand-rose/60 hover:border-brand-rose'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Adicionado à Sacola!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-brand-rose-light" /> Adicionar à Sacola
                  </>
                )}
              </button>

              <button
                onClick={handleCheckoutDirect}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-brand-rose/40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Comprar Agora
              </button>
            </div>
          </div>
        </div>

        {/* Shopee Reviews Section */}
        <div id="shopee-reviews-anchor" className="px-6 sm:px-8 pb-8">
          <ShopeeReviews productId={product.id} product={product} />
        </div>
      </div>
    </div>
  );
}
