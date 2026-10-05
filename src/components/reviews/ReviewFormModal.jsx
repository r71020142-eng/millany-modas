import React, { useState } from 'react';
import {
  X,
  Star,
  Camera,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isVideoMedia } from '../../utils/media';

const RATING_LABELS = {
  1: 'Péssimo - Muito insatisfeita',
  2: 'Ruim - Abaixo do esperado',
  3: 'Razoável - Produto comum',
  4: 'Bom - Gostei da peça',
  5: 'Excelente - Amei, super recomendo! ❤️'
};

export default function ReviewFormModal({
  isOpen,
  onClose,
  product,
  onSubmitReview
}) {
  if (!isOpen || !product) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [hideName, setHideName] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || 'Padrão'
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || 'Tamanho Único'
  );
  const [qualityTag, setQualityTag] = useState('Excelente acabamento');
  const [fitTag, setFitTag] = useState('Idêntico à foto');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local image file upload (converts to base64 for instant client preview)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      setErrorMsg('Você pode enviar no máximo 5 fotos por avaliação.');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setErrorMsg('');
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (images.length >= 5) {
      setErrorMsg('Limite de 5 fotos atingido.');
      return;
    }
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
    setErrorMsg('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome para a avaliação.');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Por favor, escreva seu comentário sobre o produto.');
      return;
    }

    // Obfuscate username like Shopee if option checked
    let userHandle = name.trim();
    if (hideName && userHandle.length > 2) {
      userHandle = `${userHandle.charAt(0)}*****${userHandle.charAt(userHandle.length - 1)}`;
    }

    const reviewPayload = {
      productId: product.id,
      userName: name.trim(),
      userHandle,
      userAvatar: '',
      rating,
      variation: {
        color: selectedColor,
        size: selectedSize
      },
      qualityTag,
      fitTag,
      comment: comment.trim(),
      images,
      verifiedPurchase: true
    };

    onSubmitReview(reviewPayload);

    // Celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const activeStar = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn text-left">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto z-10 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <div className="flex items-center gap-3">
            {isVideoMedia(product.images?.[0]) ? (
              <video
                src={product.images[0]}
                muted
                playsInline
                className="w-12 h-14 rounded-lg object-cover border border-brand-border flex-shrink-0"
              />
            ) : (
              <img
                src={product.images?.[0]}
                alt={product.title}
                className="w-12 h-14 rounded-lg object-cover border border-brand-border flex-shrink-0"
              />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-rose tracking-wider">
                Avaliar Produto (Estilo Shopee)
              </span>
              <h2 className="text-base font-serif font-bold text-white line-clamp-1">
                {product.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full bg-brand-card hover:bg-brand-card/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Star Rating Selection */}
          <div className="bg-brand-card/60 p-4 rounded-xl border border-brand-border text-center space-y-2">
            <label className="text-xs uppercase font-bold text-gray-300 tracking-wider block">
              Qual é a sua nota para este produto?
            </label>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  type="button"
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(starValue)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      starValue <= activeStar
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-brand-rose-light">
              {RATING_LABELS[activeStar]}
            </p>
          </div>

          {/* 2. Customer Identification */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-1.5">
                Seu Nome: <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Larissa Mendes"
                className="w-full bg-black/60 border border-brand-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-rose transition-colors"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={hideName}
                onChange={(e) => setHideName(e.target.checked)}
                className="rounded border-brand-border text-brand-rose focus:ring-brand-rose accent-brand-rose"
              />
              <span>Ocultar nome de exibição no anúncio (estilo Shopee: L*****s)</span>
            </label>
          </div>

          {/* 3. Bought Variation */}
          <div className="grid grid-cols-2 gap-3">
            {product.colors?.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Cor Comprada:
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-rose cursor-pointer"
                >
                  {product.colors.map((c, i) => (
                    <option key={i} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Tamanho Comprado:
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-rose cursor-pointer"
                >
                  {product.sizes.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 4. Quick Satisfaction Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                Qualidade do Tecido:
              </label>
              <select
                value={qualityTag}
                onChange={(e) => setQualityTag(e.target.value)}
                className="w-full bg-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-rose cursor-pointer"
              >
                <option value="Excelente acabamento">Excelente acabamento</option>
                <option value="Tecido macio e fresco">Tecido macio e fresco</option>
                <option value="Muito confortável">Muito confortável</option>
                <option value="Grossinho, não fica transparente">Grossinho, não transparente</option>
                <option value="Razoável">Razoável</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                Caimento no Corpo:
              </label>
              <select
                value={fitTag}
                onChange={(e) => setFitTag(e.target.value)}
                className="w-full bg-black/60 border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-rose cursor-pointer"
              >
                <option value="Idêntico à foto">Idêntico à foto</option>
                <option value="Caimento perfeito">Caimento perfeito</option>
                <option value="Modela muito bem">Modela muito bem</option>
                <option value="Fiel ao tamanho">Fiel ao tamanho</option>
                <option value="Um pouco folgado">Um pouco folgado</option>
              </select>
            </div>
          </div>

          {/* 5. Detailed Review Comment */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-1.5">
              Sua Opinião sobre o Produto: <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Descreva o caimento da peça, o toque do tecido, o envio e se você recomenda para outras compradoras..."
              className="w-full bg-black/60 border border-brand-border rounded-xl p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-rose transition-colors leading-relaxed"
              required
            />
          </div>

          {/* 6. Image Upload Section (Shopee feature) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-rose" />
                <span>Adicionar Fotos Reais (Até 5 fotos)</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {images.length}/5 fotos
              </span>
            </div>

            {/* Photos Preview Grid */}
            <div className="flex flex-wrap gap-2.5">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-border group bg-black"
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-90 hover:opacity-100"
                    title="Remover foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Button */}
              {images.length < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-rose bg-black/40 hover:bg-brand-rose/10 flex flex-col items-center justify-center cursor-pointer transition-all text-gray-400 hover:text-white group">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-brand-rose mb-1 transition-colors" />
                  <span className="text-[9px] uppercase font-bold text-center px-1">
                    Enviar Foto
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Option to paste image URL */}
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[11px] text-brand-rose-light hover:underline flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Ou colar link direto de imagem</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="flex-1 bg-black/60 border border-brand-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-rose"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold rounded-xl"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-brand-rose hover:bg-brand-rose-dark text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl hover:shadow-brand-rose/40 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publicar Avaliação na Loja</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
