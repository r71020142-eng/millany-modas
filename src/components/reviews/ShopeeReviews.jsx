import React, { useState, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  Camera,
  MessageCircle,
  CheckCircle2,
  Filter,
  Plus,
  ShieldCheck,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import ReviewLightbox from './ReviewLightbox';
import ReviewFormModal from './ReviewFormModal';
import {
  getProductReviews,
  getProductRatingStats,
  addProductReview,
  toggleReviewHelpful
} from '../../data/reviews';

export default function ShopeeReviews({
  productId,
  product,
  onReviewAdded
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | '5' | '4' | '3' | '2' | '1' | 'PHOTOS' | 'COMMENTS'
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Load reviews and stats dynamically
  const reviews = useMemo(() => {
    return getProductReviews(productId);
  }, [productId, refreshNonce]);

  const stats = useMemo(() => {
    return getProductRatingStats(productId);
  }, [productId, refreshNonce]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'PHOTOS') return r.images && r.images.length > 0;
      if (activeFilter === 'COMMENTS') return r.comment && r.comment.trim().length > 0;
      const star = parseInt(activeFilter, 10);
      return Math.round(r.rating) === star;
    });
  }, [reviews, activeFilter]);

  const handleOpenLightbox = (images, index = 0) => {
    setLightboxState({
      isOpen: true,
      images,
      currentIndex: index
    });
  };

  const handleToggleLike = (reviewId) => {
    toggleReviewHelpful(reviewId);
    setRefreshNonce((prev) => prev + 1);
  };

  const handleAddReview = (newReviewData) => {
    addProductReview(newReviewData);
    setRefreshNonce((prev) => prev + 1);
    if (onReviewAdded) onReviewAdded();
  };

  return (
    <div className="space-y-6 text-left pt-6 border-t border-white/10 animate-fadeIn">
      
      {/* 1. Header Bar: Title and "Avaliar Produto" CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
            <span>Avaliações do Produto</span>
            <span className="text-xs font-mono font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {stats.count} avaliações
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Comentários e fotos reais enviadas por clientes verificadas da loja
          </p>
        </div>

        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="px-4 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 hover:shadow-brand-rose/30"
        >
          <Camera className="w-4 h-4" />
          <span>Escrever Avaliação</span>
        </button>
      </div>

      {/* 2. Shopee-style Rating Dashboard Box */}
      <div className="bg-brand-card/90 border border-brand-border rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        
        {/* Left: Overall Score and Stars */}
        <div className="flex flex-col items-center justify-center md:border-r md:border-brand-border md:pr-8 text-center shrink-0">
          <div className="text-3xl sm:text-4xl font-serif font-black text-brand-rose-light tracking-tight">
            {stats.average} <span className="text-lg font-normal text-gray-400">de 5</span>
          </div>

          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-5 h-5 ${
                  starIdx <= Math.round(stats.average)
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="text-xs text-gray-400">
            Baseado em <strong className="text-white">{stats.count}</strong> avaliações
          </div>
        </div>

        {/* Right: Shopee-style Filter Pills */}
        <div className="flex-1 flex flex-wrap gap-2 justify-center md:justify-start">
          
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeFilter === 'ALL'
                ? 'bg-brand-rose text-white border-brand-rose shadow-md'
                : 'bg-black/40 text-gray-300 border-brand-border hover:border-gray-500'
            }`}
          >
            Tudo ({stats.count})
          </button>

          <button
            onClick={() => setActiveFilter('5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
              activeFilter === '5'
                ? 'bg-brand-rose text-white border-brand-rose shadow-md'
                : 'bg-black/40 text-gray-300 border-brand-border hover:border-gray-500'
            }`}
          >
            <span>5 Estrelas</span>
            <span className="text-gray-400">({stats.distribution[5] || 0})</span>
          </button>

          <button
            onClick={() => setActiveFilter('4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
              activeFilter === '4'
                ? 'bg-brand-rose text-white border-brand-rose shadow-md'
                : 'bg-black/40 text-gray-300 border-brand-border hover:border-gray-500'
            }`}
          >
            <span>4 Estrelas</span>
            <span className="text-gray-400">({stats.distribution[4] || 0})</span>
          </button>

          <button
            onClick={() => setActiveFilter('3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
              activeFilter === '3'
                ? 'bg-brand-rose text-white border-brand-rose shadow-md'
                : 'bg-black/40 text-gray-300 border-brand-border hover:border-gray-500'
            }`}
          >
            <span>3 Estrelas</span>
            <span className="text-gray-400">({stats.distribution[3] || 0})</span>
          </button>

          {/* With Photos Filter (Iconic Shopee feature) */}
          <button
            onClick={() => setActiveFilter('PHOTOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              activeFilter === 'PHOTOS'
                ? 'bg-brand-rose text-white border-brand-rose shadow-md'
                : 'bg-black/40 text-gray-300 border-brand-border hover:border-gray-500'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Com Fotos ({stats.withPhotosCount})</span>
          </button>

          {/* With Comments Filter */}
          <button
            onClick={() => setActiveFilter('COMMENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              activeFilter === 'COMMENTS'
                ? 'bg-brand-rose text-white border-brand-rose shadow-md'
                : 'bg-black/40 text-gray-300 border-brand-border hover:border-gray-500'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Com Comentários ({stats.withCommentsCount})</span>
          </button>
        </div>
      </div>

      {/* 3. Reviews List (Shopee Style) */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-brand-card/40 border border-brand-border rounded-2xl p-8 text-center space-y-3">
            <Camera className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-sm text-gray-300">
              Nenhuma avaliação encontrada com o filtro selecionado.
            </p>
            <button
              onClick={() => setActiveFilter('ALL')}
              className="text-xs text-brand-rose-light hover:underline font-semibold"
            >
              Ver todas as avaliações
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-brand-card/70 border border-brand-border hover:border-brand-border/90 rounded-2xl p-5 sm:p-6 transition-all space-y-4 shadow-sm"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-rose/20 text-brand-rose-light border border-brand-rose/30 flex items-center justify-center font-bold text-sm shrink-0">
                    {review.userName ? review.userName.charAt(0).toUpperCase() : 'C'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs sm:text-sm">
                        {review.userHandle || review.userName}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Compra Verificada
                        </span>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <Star
                          key={starVal}
                          className={`w-3.5 h-3.5 ${
                            starVal <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-[11px] text-gray-400 shrink-0">
                  {review.date}
                </div>
              </div>

              {/* Variation & Quality Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                {review.variation && (
                  <span className="bg-black/60 px-2.5 py-1 rounded-md border border-brand-border">
                    Variação: <strong className="text-gray-200">{review.variation.color}</strong>, <strong className="text-gray-200">{review.variation.size}</strong>
                  </span>
                )}

                {review.qualityTag && (
                  <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-gray-300">
                    Qualidade: <strong className="text-brand-rose-light">{review.qualityTag}</strong>
                  </span>
                )}

                {review.fitTag && (
                  <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-gray-300">
                    Caimento: <strong className="text-white">{review.fitTag}</strong>
                  </span>
                )}
              </div>

              {/* Review Comment Text */}
              {review.comment && (
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* Review Photos Gallery (Shopee Style) */}
              {review.images && review.images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2.5">
                    {review.images.map((imgUrl, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => handleOpenLightbox(review.images, imgIdx)}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-brand-border hover:border-brand-rose transition-all group bg-black/60 shrink-0"
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto enviada por ${review.userName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-1.5 bg-black/70 rounded-full text-white text-[10px]">
                            🔍
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    Clique na foto para ampliar
                  </span>
                </div>
              )}

              {/* Seller Response / Resposta do Vendedor (Shopee Style) */}
              {review.sellerReply && (
                <div className="bg-black/60 border border-brand-rose/30 rounded-xl p-3.5 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-rose-light">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-rose" />
                      <span>Resposta do Vendedor:</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      {review.sellerReply.date}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{review.sellerReply.text}"
                  </p>
                </div>
              )}

              {/* Bottom Helpful Button (Shopee Style) */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-xs text-gray-400">
                <button
                  onClick={() => handleToggleLike(review.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    review.userLiked
                      ? 'bg-brand-rose/20 text-brand-rose border-brand-rose/40 font-bold'
                      : 'bg-black/40 hover:bg-black text-gray-400 hover:text-white border-brand-border'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Esta avaliação foi útil? ({review.likes || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Photo Lightbox Modal */}
      <ReviewLightbox
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        currentIndex={lightboxState.currentIndex}
        onNavigate={(newIdx) => setLightboxState((prev) => ({ ...prev, currentIndex: newIdx }))}
        onClose={() => setLightboxState({ isOpen: false, images: [], currentIndex: 0 })}
      />

      {/* Review Submission Modal */}
      {product && (
        <ReviewFormModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={product}
          onSubmitReview={handleAddReview}
        />
      )}
    </div>
  );
}
