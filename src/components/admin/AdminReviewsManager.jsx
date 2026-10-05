import React, { useState, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Trash2,
  Reply,
  CheckCircle2,
  Camera,
  Search,
  Filter,
  Plus,
  Eye,
  ShieldCheck,
  Save,
  X
} from 'lucide-react';
import {
  getAllReviews,
  deleteReviewById,
  setSellerReply,
  addProductReview
} from '../../data/reviews';
import ReviewLightbox from '../reviews/ReviewLightbox';

export default function AdminReviewsManager({ products = [] }) {
  const [reviewsList, setReviewsList] = useState(() => getAllReviews());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('ALL');
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });

  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.productId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchProduct =
        selectedProductFilter === 'ALL' || r.productId === selectedProductFilter;

      const matchRating =
        selectedRatingFilter === 'ALL' || String(Math.round(r.rating)) === selectedRatingFilter;

      return matchSearch && matchProduct && matchRating;
    });
  }, [reviewsList, searchTerm, selectedProductFilter, selectedRatingFilter]);

  const handleDelete = (reviewId) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      const updated = deleteReviewById(reviewId);
      setReviewsList(updated);
    }
  };

  const handleOpenReply = (review) => {
    setReplyingReviewId(review.id);
    setReplyText(review.sellerReply?.text || '');
  };

  const handleSaveReply = (reviewId) => {
    const updated = setSellerReply(reviewId, replyText.trim());
    setReviewsList(updated);
    setReplyingReviewId(null);
    setReplyText('');
  };

  // Find product title by ID
  const getProductTitle = (prodId) => {
    const p = products.find((prod) => prod.id === prodId);
    return p ? p.title : prodId;
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-400" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Gerenciador de Avaliações (Shopee)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Moderação de depoimentos, fotos reais de clientes e respostas oficiais da loja.
          </p>
        </div>

        <div className="text-xs text-gray-400 bg-brand-card px-3.5 py-2 rounded-xl border border-brand-border">
          Total: <strong className="text-white font-mono">{reviewsList.length}</strong> avaliações
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-brand-card/70 border border-brand-border p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, produto ou texto da avaliação..."
            className="w-full pl-10 pr-4 py-2 bg-black/60 border border-brand-border rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-rose"
          />
        </div>

        {/* Product Filter */}
        <select
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          aria-label="Filtrar por produto"
          className="bg-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-rose cursor-pointer"
        >
          <option value="ALL">Todos os Produtos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={selectedRatingFilter}
          onChange={(e) => setSelectedRatingFilter(e.target.value)}
          aria-label="Filtrar por nota"
          className="bg-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-rose cursor-pointer"
        >
          <option value="ALL">Todas as Notas</option>
          <option value="5">5 Estrelas</option>
          <option value="4">4 Estrelas</option>
          <option value="3">3 Estrelas</option>
          <option value="2">2 Estrelas</option>
          <option value="1">1 Estrela</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-brand-card/40 border border-brand-border rounded-2xl p-10 text-center text-gray-400 text-xs">
            Nenhuma avaliação encontrada com esses filtros.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-brand-card/90 border border-brand-border hover:border-brand-rose/40 rounded-2xl p-5 space-y-3 transition-all shadow-md"
            >
              {/* Top Bar: Product Link + Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-brand-rose-light bg-brand-rose/10 px-2 py-0.5 rounded border border-brand-rose/20">
                    {getProductTitle(rev.productId)}
                  </span>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{rev.date}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Verificada
                  </span>
                </div>
              </div>

              {/* Author & Variation */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {rev.userName}
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    ({rev.userHandle})
                  </span>
                </div>

                {rev.variation && (
                  <span className="text-[11px] text-gray-400">
                    Variação: <strong className="text-gray-200">{rev.variation.color}</strong> / <strong className="text-gray-200">{rev.variation.size}</strong>
                  </span>
                )}
              </div>

              {/* Comment */}
              <p className="text-xs text-gray-200 leading-relaxed">
                "{rev.comment}"
              </p>

              {/* Photos Preview */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxState({ isOpen: true, images: rev.images, currentIndex: i })}
                      className="w-14 h-14 rounded-lg overflow-hidden border border-brand-border hover:border-brand-rose bg-black"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Seller Reply Section */}
              {rev.sellerReply && replyingReviewId !== rev.id && (
                <div className="bg-black/50 border border-brand-rose/30 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-brand-rose-light font-bold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Resposta da Loja:
                    </span>
                    <button
                      onClick={() => handleOpenReply(rev)}
                      className="text-[10px] text-gray-400 hover:text-white underline"
                    >
                      Editar resposta
                    </button>
                  </div>
                  <p className="text-gray-300 italic">"{rev.sellerReply.text}"</p>
                </div>
              )}

              {/* Reply Form */}
              {replyingReviewId === rev.id && (
                <div className="bg-black/70 border border-brand-border rounded-xl p-3 space-y-2">
                  <label className="text-[11px] font-bold text-brand-rose-light block">
                    Escrever Resposta do Vendedor (Millany Modas):
                  </label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ex: Muito obrigada pelo feedback, Mariana! Ficamos muito felizes que tenha gostado! ❤️"
                    className="w-full bg-brand-card border border-brand-border rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-rose"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingReviewId(null)}
                      className="px-3 py-1 bg-black text-gray-400 hover:text-white rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveReply(rev.id)}
                      className="px-3 py-1 bg-brand-rose hover:bg-brand-rose-dark text-white font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvar Resposta
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-gray-500" />
                  <span>{rev.likes || 0} acharam útil</span>
                </div>

                <div className="flex items-center gap-2">
                  {replyingReviewId !== rev.id && !rev.sellerReply && (
                    <button
                      onClick={() => handleOpenReply(rev)}
                      className="px-3 py-1 bg-brand-card hover:bg-brand-rose/20 text-brand-rose-light border border-brand-border rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" /> Responder
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Excluir avaliação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      <ReviewLightbox
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        currentIndex={lightboxState.currentIndex}
        onNavigate={(newIdx) => setLightboxState((prev) => ({ ...prev, currentIndex: newIdx }))}
        onClose={() => setLightboxState({ isOpen: false, images: [], currentIndex: 0 })}
      />
    </div>
  );
}
