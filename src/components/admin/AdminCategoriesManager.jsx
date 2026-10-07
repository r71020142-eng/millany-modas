import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Tag,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  Check,
  AlertTriangle,
  X,
  Search,
  Sparkles,
  Layers
} from 'lucide-react';

export default function AdminCategoriesManager({
  categories,
  products = [],
  onSaveCategories,
  onRenameCategory,
  onDeleteCategory
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addError, setAddError] = useState('');

  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editError, setEditError] = useState('');

  const [deletingCategory, setDeletingCategory] = useState(null);
  const [fallbackCategory, setFallbackCategory] = useState('Geral');

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Count products per category
  const getProductCount = (catName) => {
    if (catName === 'Todos') return products.length;
    if (catName === 'Promoção') {
      return products.filter(
        (p) => (p.compare_price && p.compare_price !== 'R$0,00') || (p.badges && p.badges.includes('Promoção'))
      ).length;
    }
    return products.filter((p) => p.category?.toLowerCase() === catName.toLowerCase()).length;
  };

  // Filtered categories (excluding 'Todos' from delete/edit, but showing in list)
  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reorder
  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    // Do not move 'Todos' from index 0
    if (categories[index] === 'Todos' || categories[targetIndex] === 'Todos') return;

    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    onSaveCategories(updated);
    showToast('Ordem das categorias atualizada!');
  };

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    setAddError('');
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddError('Digite o nome da categoria.');
      return;
    }

    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setAddError('Esta categoria já existe.');
      return;
    }

    const updated = [...categories, trimmed];
    onSaveCategories(updated);
    setNewCategoryName('');
    setIsAddModalOpen(false);
    showToast(`Categoria "${trimmed}" criada com sucesso!`);
  };

  // Edit Category
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setEditedName(cat);
    setEditError('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEditError('');
    const trimmed = editedName.trim();
    if (!trimmed) {
      setEditError('O nome da categoria não pode ficar vazio.');
      return;
    }

    if (trimmed.toLowerCase() !== editingCategory.toLowerCase()) {
      const exists = categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== editingCategory.toLowerCase()
      );
      if (exists) {
        setEditError('Já existe uma categoria com este nome.');
        return;
      }
    }

    onRenameCategory(editingCategory, trimmed);
    const affectedCount = getProductCount(editingCategory);
    setEditingCategory(null);
    showToast(
      affectedCount > 0
        ? `Categoria renomeada para "${trimmed}" e ${affectedCount} produto(s) atualizado(s)!`
        : `Categoria renomeada para "${trimmed}"!`
    );
  };

  // Delete Category
  const handleOpenDelete = (cat) => {
    const count = getProductCount(cat);
    // Find a valid fallback that isn't the one being deleted
    const validFallback = categories.find((c) => c !== cat && c !== 'Todos' && c !== 'Promoção') || 'Geral';
    setFallbackCategory(validFallback);
    setDeletingCategory(cat);
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    const cat = deletingCategory;
    const count = getProductCount(cat);

    onDeleteCategory(cat, fallbackCategory);
    setDeletingCategory(null);
    showToast(
      count > 0
        ? `Categoria "${cat}" removida e ${count} produto(s) migrado(s) para "${fallbackCategory}"!`
        : `Categoria "${cat}" removida!`
    );
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-rose/20 text-brand-rose flex items-center justify-center border border-brand-rose/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">Total de Categorias</span>
            <span className="text-2xl font-serif text-white font-bold">
              {categories.length - 1} <span className="text-xs text-gray-500 font-sans font-normal">(+ Todos)</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">Produtos Catalogados</span>
            <span className="text-2xl font-serif text-brand-gold font-bold">{products.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">Sincronização</span>
            <span className="text-xs text-emerald-400 font-bold block mt-1">
              Menu, Header e Filtros 100% integrados em tempo real
            </span>
          </div>
        </div>
      </div>

      {/* Top Actions & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-brand-card border border-brand-border shadow-xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoria..."
            className="w-full bg-black/60 text-white text-xs pl-9 pr-4 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
        </div>

        <button
          onClick={() => {
            setNewCategoryName('');
            setAddError('');
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Categories Table / List */}
      <div className="rounded-2xl border border-brand-border overflow-hidden bg-brand-dark shadow-2xl">
        <div className="p-4 bg-black/60 border-b border-brand-border flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Lista de Categorias da Loja ({filteredCategories.length})
          </span>
          <span className="text-[11px] text-gray-500">
            Use as setas para reordenar a exibição no menu
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <Tag className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p className="text-sm">Nenhuma categoria encontrada com o termo pesquisado.</p>
            </div>
          ) : (
            filteredCategories.map((cat, idx) => {
              const count = getProductCount(cat);
              const isSystemFixed = cat === 'Todos';
              const isPromo = cat === 'Promoção';

              return (
                <div
                  key={cat}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-brand-card/40 transition-colors"
                >
                  {/* Left: Drag / Order Controls & Name */}
                  <div className="flex items-center gap-3">
                    {/* Reorder Buttons (disabled for 'Todos') */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={isSystemFixed || idx <= 1}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Subir na ordem do menu"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isSystemFixed || idx === categories.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Descer na ordem do menu"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-white font-bold text-sm">
                          {cat}
                        </span>
                        {isSystemFixed && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                            Geral (Ver Tudo)
                          </span>
                        )}
                        {isPromo && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                            Filtro Ofertas
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {count} {count === 1 ? 'produto associado' : 'produtos associados'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {!isSystemFixed ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="px-3 py-1.5 bg-brand-card hover:bg-brand-rose text-gray-300 hover:text-white rounded-lg transition-colors border border-brand-border flex items-center gap-1.5 text-xs font-semibold"
                          title="Editar nome da categoria"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(cat)}
                          className="p-1.5 bg-brand-card hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-colors border border-brand-border"
                          title="Remover categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic pr-2">
                        Fixo do sistema
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Adicionar Nova Categoria */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-md p-6 z-10 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-white font-bold text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-rose" /> Nova Categoria
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full bg-brand-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Alfaiataria, Moda Praia, Acessórios..."
                  required
                  autoFocus
                  className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Aparecerá automaticamente na barra de categorias e no menu de navegação.
                </p>
              </div>

              {addError && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-brand-card hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-brand-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Categoria */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setEditingCategory(null)} />
          <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-md p-6 z-10 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-white font-bold text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-gold" /> Editar Categoria
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full bg-brand-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Novo Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Nome atualizado..."
                  required
                  autoFocus
                  className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              {getProductCount(editingCategory) > 0 && (
                <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200">
                  ℹ️ Existem <strong>{getProductCount(editingCategory)} produtos</strong> nesta categoria. Ao salvar, todos eles serão atualizados automaticamente para o novo nome!
                </div>
              )}

              {editError && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-2.5 bg-brand-card hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-brand-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Categoria */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setDeletingCategory(null)} />
          <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-md p-6 z-10 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-white font-bold text-base flex items-center gap-2 text-red-400">
                <Trash2 className="w-4 h-4 text-red-400" /> Excluir Categoria
              </h3>
              <button
                onClick={() => setDeletingCategory(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full bg-brand-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <p>
                Tem certeza que deseja remover a categoria <strong className="text-white">"{deletingCategory}"</strong>?
              </p>

              {getProductCount(deletingCategory) > 0 ? (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Atenção: {getProductCount(deletingCategory)} produtos vinculados!</span>
                  </div>
                  <p>
                    Para não deixar esses produtos sem categoria, selecione para onde deseja movê-los:
                  </p>
                  <select
                    value={fallbackCategory}
                    onChange={(e) => setFallbackCategory(e.target.value)}
                    className="w-full bg-black/80 text-white text-xs px-3 py-2 rounded-lg border border-amber-500/40 focus:outline-none"
                  >
                    {categories
                      .filter((c) => c !== deletingCategory && c !== 'Todos')
                      .map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    <option value="Geral">Geral (Criar se não existir)</option>
                  </select>
                </div>
              ) : (
                <p className="text-gray-400">
                  Não há produtos vinculados a esta categoria. Ela será removida com segurança.
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="flex-1 py-2.5 bg-brand-card hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-brand-border"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
