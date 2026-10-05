import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ArrowUp, ArrowDown, Image, Sparkles, Check, X, RotateCcw } from 'lucide-react';
import { BANNER_SLIDES } from '../../data/banners';
import { CATEGORIES } from '../../data/products';

export default function AdminBannerManager({
  banners,
  onSaveBanners,
  onResetBanners
}) {
  const [editingSlide, setEditingSlide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    desktopImage: '',
    mobileImage: '',
    ctaText: 'Ver Produtos',
    category: 'Vestidos'
  });

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      title: 'Nova Coleção',
      subtitle: 'Peças Exclusivas & Sofisticação',
      desktopImage: 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/rio/2-slide-1773332434880-6821625407-8ee7a2f7a01b739632ef158ff50204d31773332452-1920-1920.webp',
      mobileImage: 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/rio/2-slide-1773332434880-6821625407-8ee7a2f7a01b739632ef158ff50204d31773332452-1024-1024.webp',
      ctaText: 'Comprar Agora',
      category: 'Vestidos'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      id: slide.id,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      desktopImage: slide.desktopImage || '',
      mobileImage: slide.mobileImage || '',
      ctaText: slide.ctaText || 'Ver Produtos',
      category: slide.category || 'Vestidos'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (banners.length <= 1) {
      alert('É necessário manter pelo menos 1 banner no carrossel.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este banner?')) {
      const updated = banners.filter((b) => b.id !== id);
      onSaveBanners(updated);
    }
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= banners.length) return;
    const next = [...banners];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onSaveBanners(next);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.desktopImage.trim()) {
      alert('Por favor, informe a URL da imagem desktop.');
      return;
    }

    if (editingSlide) {
      const updated = banners.map((b) =>
        b.id === editingSlide.id ? { ...b, ...formData } : b
      );
      onSaveBanners(updated);
    } else {
      const newSlide = {
        ...formData,
        id: Date.now(),
        mobileImage: formData.mobileImage.trim() || formData.desktopImage.trim()
      };
      onSaveBanners([...banners, newSlide]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-brand-card border border-brand-border">
        <div>
          <h3 className="text-base font-serif text-white font-bold">
            Carrossel Principal Hero ({banners.length} Banners Ativos)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Adicione, edite imagens de alta definição e reordene os slides em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Deseja restaurar os banners originais da Millany Modas?')) {
                onResetBanners();
              }
            }}
            className="px-3.5 py-2.5 bg-black/60 hover:bg-brand-border text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-brand-border"
            title="Restaurar banners originais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Originais</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Banner</span>
          </button>
        </div>
      </div>

      {/* Banner Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((slide, idx) => (
          <div
            key={slide.id}
            className="p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-rose/60 transition-all space-y-4 shadow-lg group relative"
          >
            {/* Slide Index Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-rose-light bg-brand-rose/20 px-2.5 py-1 rounded-full border border-brand-rose/40">
                Slide #{idx + 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 bg-black/60 hover:bg-brand-rose text-gray-300 hover:text-white rounded disabled:opacity-30 transition-colors"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === banners.length - 1}
                  className="p-1.5 bg-black/60 hover:bg-brand-rose text-gray-300 hover:text-white rounded disabled:opacity-30 transition-colors"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="relative aspect-[16/8] rounded-xl overflow-hidden bg-black border border-brand-border">
              <img
                src={slide.desktopImage}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] uppercase font-bold text-brand-rose-light tracking-wider">
                  {slide.category || 'Geral'}
                </span>
                <h4 className="text-lg font-serif text-white font-bold leading-tight">
                  {slide.title}
                </h4>
                <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                  {slide.subtitle}
                </p>
              </div>
            </div>

            {/* Details & Actions */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                Botão: <strong className="text-white">{slide.ctaText}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(slide)}
                  className="px-3 py-1.5 bg-brand-border hover:bg-brand-rose text-white rounded-lg transition-colors font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 bg-black hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-colors border border-brand-border"
                  title="Excluir slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Adicionar ou Editar Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-xl p-6 sm:p-8 z-10 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
              <h2 className="text-lg font-serif text-white uppercase tracking-wider">
                {editingSlide ? 'Editar Banner do Carrossel' : 'Criar Novo Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-brand-card"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  Título do Banner *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Coleção Verão 2026"
                  required
                  className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  Subtítulo / Chamada
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Vestidos fluidos e conjuntos sofisticados"
                  className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  URL da Imagem Desktop (1920x1920 ou 16:9) *
                </label>
                <input
                  type="url"
                  value={formData.desktopImage}
                  onChange={(e) => setFormData({ ...formData, desktopImage: e.target.value })}
                  placeholder="https://..."
                  required
                  className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  URL da Imagem Mobile (Opcional - usa a desktop se vazio)
                </label>
                <input
                  type="url"
                  value={formData.mobileImage}
                  onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                  placeholder="https://... (formato vertical/quadrado)"
                  className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-medium block mb-1">
                    Texto do Botão (CTA)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="Ex: Comprar Agora"
                    className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-medium block mb-1">
                    Categoria Alvo ao Clicar
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview image */}
              {formData.desktopImage && (
                <div className="mt-3 p-2 bg-black/60 rounded-lg border border-brand-border">
                  <span className="text-[11px] text-gray-400 block mb-1">Pré-visualização:</span>
                  <img
                    src={formData.desktopImage}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-brand-card text-gray-300 rounded-lg font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-rose hover:bg-brand-rose-dark text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
