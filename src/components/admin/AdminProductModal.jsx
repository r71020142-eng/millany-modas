import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Image, Palette, Tag, Check, Star, UploadCloud, Video, Film, Play, Loader2 } from 'lucide-react';
import { formatBRL } from '../../utils/masks';
import { isVideoMedia } from '../../utils/media';
import { compressImageFile } from '../../utils/imageCompressor';

const PRESET_CATEGORIES = [
  'Vestidos',
  'Conjuntos',
  'Macacão',
  'Body',
  'Cropped',
  'Short/Saia',
  'Calça',
  'Bata',
  'Geral'
];

const PRESET_BADGES = [
  'Tamanho Único',
  'Promoção',
  'Poliamida premium',
  'Alfaiataria',
  'Lançamento',
  'Mais Vendido'
];

const PRESET_SIZES = ['Tamanho Único', 'P', 'M', 'G', 'GG', '34', '36', '38', '40', '42'];

export default function AdminProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  categories = PRESET_CATEGORIES
}) {
  if (!isOpen) return null;

  const isEditing = !!productToEdit;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Vestidos',
    price_number: 120.00,
    compare_price: '',
    stock: 10,
    description: '',
    images: [],
    colors: [],
    sizes: ['Tamanho Único'],
    badges: ['Tamanho Único']
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#d2888a');
  const [newBadgeText, setNewBadgeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        id: productToEdit.id,
        title: productToEdit.title || '',
        category: productToEdit.category || 'Geral',
        price_number: productToEdit.price_number || 0,
        compare_price: productToEdit.compare_price || '',
        stock: typeof productToEdit.stock === 'number' ? productToEdit.stock : 10,
        description: productToEdit.description || '',
        images: productToEdit.images ? [...productToEdit.images] : [],
        colors: productToEdit.colors ? [...productToEdit.colors] : [],
        sizes: productToEdit.sizes ? [...productToEdit.sizes] : ['Tamanho Único'],
        badges: productToEdit.badges ? [...productToEdit.badges] : []
      });
    } else {
      setFormData({
        title: '',
        category: 'Vestidos',
        price_number: 145.00,
        compare_price: '',
        stock: 10,
        description: '',
        images: ['https://dcdn-us.mitiendanube.com/stores/007/383/278/products/img_9280-b6b9e72ef2fd51ab3617884043933298-1024-1024.webp'],
        colors: [
          { name: 'Rosa', hex: '#E998FF' },
          { name: 'Preto', hex: '#000000' }
        ],
        sizes: ['Tamanho Único'],
        badges: ['Tamanho Único']
      });
    }
  }, [productToEdit]);

  // File Upload Handlers (Images JPG/PNG/WEBP and Video MP4)
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
      return isImg || isVid;
    });

    if (validFiles.length === 0) {
      alert('Por favor, selecione arquivos válidos de imagem (JPG, JPEG, PNG, WEBP) ou vídeo (MP4).');
      return;
    }

    const oversized = validFiles.find((f) => f.size > 20 * 1024 * 1024);
    if (oversized) {
      alert(`O arquivo "${oversized.name}" excede o tamanho recomendado (máx. 20MB).`);
      return;
    }

    setIsUploading(true);
    try {
      const compressedUrls = await Promise.all(
        validFiles.map((file) => compressImageFile(file))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedUrls]
      }));
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Houve um erro ao processar o arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Image / Video actions
  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const imgs = [...prev.images];
      const [chosen] = imgs.splice(index, 1);
      return { ...prev, images: [chosen, ...imgs] };
    });
  };

  // Color actions
  const handleAddColor = (e) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }]
    }));
    setNewColorName('');
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Size actions
  const handleToggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]
      };
    });
  };

  // Badge actions
  const handleToggleBadge = (badge) => {
    setFormData((prev) => {
      const exists = prev.badges.includes(badge);
      return {
        ...prev,
        badges: exists ? prev.badges.filter((b) => b !== badge) : [...prev.badges, badge]
      };
    });
  };

  const handleAddCustomBadge = (e) => {
    e.preventDefault();
    if (!newBadgeText.trim()) return;
    if (!formData.badges.includes(newBadgeText.trim())) {
      setFormData((prev) => ({
        ...prev,
        badges: [...prev.badges, newBadgeText.trim()]
      }));
    }
    setNewBadgeText('');
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor, digite o título do produto');
      return;
    }

    const priceNum = parseFloat(formData.price_number) || 0;
    const slug = formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const finalProduct = {
      id: formData.id || `${slug}-${Date.now().toString().slice(-5)}`,
      slug: slug,
      title: formData.title.trim(),
      category: formData.category,
      price: formatBRL(priceNum),
      price_number: priceNum,
      compare_price: formData.compare_price.trim() ? formData.compare_price.trim() : '',
      pix_price: formatBRL(priceNum * 0.99),
      installments: `12x de ${formatBRL((priceNum * 1.235) / 12)}`,
      stock: Math.max(0, parseInt(formData.stock) || 0),
      description: formData.description.trim(),
      images: formData.images.length > 0
        ? formData.images
        : ['https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp'],
      colors: formData.colors,
      sizes: formData.sizes.length > 0 ? formData.sizes : ['Tamanho Único'],
      badges: formData.badges
    };

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto z-10 shadow-2xl text-left">
        {/* Header */}
        <div className="sticky top-0 bg-brand-dark/95 border-b border-brand-border px-6 py-4 flex items-center justify-between z-20">
          <div>
            <h2 className="text-lg font-serif text-white uppercase tracking-wider">
              {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h2>
            <p className="text-xs text-gray-400">
              {isEditing ? `Modificando: ${productToEdit.title}` : 'Preencha os dados do novo produto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full bg-brand-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* 1. Informações Básicas */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
              1. Informações Principais
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Nome / Título do Produto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Vestido Longo Fenda Estampado"
                required
                className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-brand-card text-white text-xs px-3 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                >
                  {(() => {
                    const list = (categories || PRESET_CATEGORIES).filter((c) => c !== 'Todos');
                    if (formData.category && !list.includes(formData.category)) {
                      list.unshift(formData.category);
                    }
                    return list.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_number}
                  onChange={(e) => setFormData({ ...formData, price_number: e.target.value })}
                  placeholder="145.00"
                  required
                  className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Preço Riscado (R$)
                </label>
                <input
                  type="text"
                  value={formData.compare_price}
                  onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                  placeholder="Ex: R$189,00 (opcional)"
                  className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1 flex items-center justify-between">
                  <span>Qtd. em Estoque *</span>
                  {formData.stock <= 0 && (
                    <span className="text-[10px] text-red-400 font-bold">Sem Estoque</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  placeholder="10"
                  required
                  className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none font-mono ${
                    formData.stock <= 0
                      ? 'border-red-500/80 focus:border-red-400 text-red-300'
                      : 'border-brand-border focus:border-brand-rose'
                  }`}
                />
              </div>
            </div>

            <div className="p-3 bg-black/60 rounded-lg border border-brand-border text-xs text-gray-400 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <span>Pix com 1% OFF: <strong className="text-brand-pix">{formatBRL(formData.price_number * 0.99)}</strong></span>
                <span>Parcelamento: <strong className="text-white">12x de {formatBRL((formData.price_number * 1.235) / 12)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span>Status Estoque:</span>
                {formData.stock <= 0 ? (
                  <span className="text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40 font-bold">
                    🔴 Sem Estoque (Aparecerá Cinza)
                  </span>
                ) : formData.stock <= 3 ? (
                  <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    🟡 Baixo ({formData.stock} un.)
                  </span>
                ) : (
                  <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    🟢 Disponível ({formData.stock} un.)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Descrição do Produto
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre o tecido, caimento, comprimento, ocasiões de uso..."
                className="w-full bg-brand-card text-white text-xs p-3 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Fotos e Vídeos do Produto */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                <Image className="w-4 h-4 text-brand-rose" /> 2. Mídias do Produto ({formData.images.length})
              </h3>
              <span className="text-[11px] text-gray-400">Fotos (JPG, PNG) e Vídeos (MP4)</span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesSelected(e.target.files)}
              accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/*"
              multiple
              className="hidden"
            />

            {/* Upload Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-brand-rose bg-brand-rose/10 scale-[1.01]'
                  : 'border-brand-border hover:border-brand-rose/80 bg-brand-card/40 hover:bg-brand-card/80'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-8 h-8 text-brand-rose animate-spin" />
                  <p className="text-xs font-semibold text-white">Processando arquivos...</p>
                  <p className="text-[10px] text-gray-400">Convertendo imagens e vídeos</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-brand-card flex items-center justify-center text-brand-rose shadow-inner border border-brand-border">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Clique aqui para fazer upload ou arraste seus arquivos
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Suporta Imagens <strong className="text-brand-rose-light">JPG, PNG, WEBP</strong> e Vídeos <strong className="text-brand-gold">MP4</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 bg-black/60 rounded-full border border-brand-border text-[10px] text-gray-300 font-medium">
                      📸 Fotos JPG / PNG
                    </span>
                    <span className="px-2.5 py-1 bg-purple-950/60 rounded-full border border-purple-800/40 text-[10px] text-purple-300 font-medium flex items-center gap-1">
                      <Film className="w-3 h-3 text-purple-400" /> Vídeos MP4
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Existing media preview grid */}
            {formData.images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-300">
                    Mídias adicionadas ({formData.images.length}):
                  </span>
                  <span className="text-[10px] text-gray-400">
                    A 1ª mídia é a capa principal
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.images.map((mediaUrl, idx) => {
                    const isVid = isVideoMedia(mediaUrl);
                    return (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-brand-border aspect-[3/4] bg-black shadow-md"
                      >
                        {isVid ? (
                          <div className="relative w-full h-full">
                            <video
                              src={mediaUrl}
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
                          {idx === 0 && (
                            <span className="bg-brand-rose text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow">
                              ★ Principal
                            </span>
                          )}
                          {isVid ? (
                            <span className="bg-purple-700/95 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" /> MP4
                            </span>
                          ) : (
                            <span className="bg-black/80 text-gray-300 text-[9px] uppercase font-medium px-1.5 py-0.5 rounded shadow">
                              IMG
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="w-full py-1.5 px-2 bg-brand-card hover:bg-brand-rose text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-brand-border"
                              title="Tornar capa principal"
                            >
                              <Star className="w-3.5 h-3.5 text-brand-gold" /> Tornar Capa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="w-full py-1.5 px-2 bg-red-900/80 hover:bg-red-600 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                            title="Excluir mídia"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Media via Direct URL */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <label className="text-[11px] font-medium text-gray-400 block">
                Ou adicione via link direto (URL de imagem ou vídeo .mp4):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg ou https://exemplo.com/video.mp4"
                  className="flex-1 bg-brand-card text-white text-xs px-3.5 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-brand-border hover:bg-brand-rose text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Adicionar Link
                </button>
              </div>
            </div>
          </div>

          {/* 3. Variações: Cores & Tamanhos */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-brand-rose" /> 3. Variações (Cores e Tamanhos)
            </h3>

            {/* Colors */}
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-2">
                Cores Disponíveis ({formData.colors.length}):
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {formData.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-card border border-brand-border text-xs text-white"
                  >
                    <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-gray-500 hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Color Form */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nome da cor (ex: Rosa Pink, Azul Bebê)"
                  className="bg-brand-card text-white text-xs px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none min-w-[200px]"
                />
                <div className="flex items-center gap-1 bg-brand-card px-2 py-1 rounded-lg border border-brand-border">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-gray-400">{newColorHex}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3.5 py-2 bg-brand-border hover:bg-brand-rose text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Cor
                </button>
              </div>
            </div>

            {/* Sizes */}
            <div className="pt-3 border-t border-white/5">
              <label className="text-xs font-medium text-gray-300 block mb-2">
                Tamanhos Disponíveis:
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SIZES.map((size) => {
                  const active = formData.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors border ${
                        active
                          ? 'bg-brand-rose border-brand-rose text-white'
                          : 'bg-brand-card border-brand-border text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Etiquetas / Badges */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-brand-rose" /> 4. Selos e Destaques
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {PRESET_BADGES.map((b) => {
                const active = formData.badges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleToggleBadge(b)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition-colors border ${
                      active
                        ? 'bg-brand-rose/20 border-brand-rose text-brand-rose-light'
                        : 'bg-brand-card border-brand-border text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>

            {/* Custom badge */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newBadgeText}
                onChange={(e) => setNewBadgeText(e.target.value)}
                placeholder="Criar outro selo personalizado..."
                className="bg-brand-card text-white text-xs px-3 py-1.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomBadge}
                className="px-3 py-1.5 bg-brand-border hover:bg-brand-rose text-white text-xs font-semibold rounded-lg"
              >
                + Adicionar Selo
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-brand-card hover:bg-brand-border text-gray-300 text-xs font-bold uppercase rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Criar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
