import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Copy, Filter, Eye, CheckCircle2, Film } from 'lucide-react';
import { formatBRL } from '../../utils/masks';
import { isVideoMedia } from '../../utils/media';
import { CATEGORIES } from '../../data/products';

export default function AdminProductList({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onUpdateStock
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Todos' ||
      p.category.toLowerCase() === categoryFilter.toLowerCase();
    const stockNum = typeof p.stock === 'number' ? p.stock : 10;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'out_of_stock' ? stockNum <= 0 : stockNum > 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalValue = products.reduce((acc, p) => acc + (p.price_number || 0), 0);
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  const promoCount = products.filter((p) => p.compare_price && p.compare_price !== 'R$0,00').length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) <= 0).length;

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
          <span className="text-xs text-gray-400 block">Total de Produtos</span>
          <span className="text-2xl font-serif text-white font-bold">{products.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
          <span className="text-xs text-gray-400 block">Em Promoção</span>
          <span className="text-2xl font-serif text-brand-rose-light font-bold">{promoCount}</span>
        </div>
        <div className={`p-4 rounded-xl border transition-colors ${
          outOfStockCount > 0 ? 'bg-red-950/30 border-red-500/40' : 'bg-brand-card border-brand-border'
        }`}>
          <span className="text-xs text-gray-400 block">Sem Estoque</span>
          <span className={`text-2xl font-serif font-bold ${
            outOfStockCount > 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {outOfStockCount}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
          <span className="text-xs text-gray-400 block">Categorias</span>
          <span className="text-2xl font-serif text-brand-gold font-bold">{CATEGORIES.length - 1}</span>
        </div>
        <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
          <span className="text-xs text-gray-400 block">Preço Médio</span>
          <span className="text-2xl font-serif text-emerald-400 font-bold">{formatBRL(avgPrice)}</span>
        </div>
      </div>

      {/* 2. Top Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-brand-card border border-brand-border">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
            className="w-full bg-black/60 text-white text-xs pl-9 pr-4 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-black/60 text-white text-xs px-3 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none cursor-pointer"
          >
            <option value="all">Todos Estoques</option>
            <option value="in_stock">Em Estoque (&gt; 0)</option>
            <option value="out_of_stock">Sem Estoque (0)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/60 text-white text-xs px-3 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Add Product Button */}
          <button
            onClick={onAddProduct}
            className="px-4 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* 3. Products Table */}
      <div className="rounded-xl border border-brand-border overflow-hidden bg-brand-dark shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/60 text-gray-400 uppercase text-[11px] tracking-wider border-b border-brand-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Preço</th>
                <th className="py-3.5 px-4">Estoque</th>
                <th className="py-3.5 px-4">Variações</th>
                <th className="py-3.5 px-4">Selos</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-card/40 transition-colors">
                    
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {isVideoMedia(product.images?.[0]) ? (
                          <div className="relative w-12 h-14 rounded-md overflow-hidden border border-brand-border flex-shrink-0 bg-black">
                            <video
                              src={product.images[0]}
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0.5 right-0.5 bg-purple-900/90 p-0.5 rounded text-[8px] text-white">
                              <Film className="w-2.5 h-2.5 text-purple-200" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={product.images?.[0] || 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp'}
                            alt={product.title}
                            className="w-12 h-14 object-cover rounded-md border border-brand-border flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-serif text-white font-medium block text-sm">
                            {product.title}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            ID: {product.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-brand-card border border-brand-border text-[11px] text-gray-300">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">
                        {product.price || formatBRL(product.price_number)}
                      </div>
                      {product.compare_price && product.compare_price !== 'R$0,00' && (
                        <div className="text-[10px] text-gray-500 line-through">
                          {product.compare_price}
                        </div>
                      )}
                      <div className="text-[10px] text-brand-pix">
                        Pix: {product.pix_price}
                      </div>
                    </td>

                    {/* Stock Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-brand-border rounded-lg bg-black/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateStock && onUpdateStock(product.id, Math.max(0, (product.stock || 0) - 1))}
                            className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
                            title="Diminuir estoque (-1)"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={typeof product.stock === 'number' ? product.stock : 10}
                            onChange={(e) => onUpdateStock && onUpdateStock(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                            className={`w-12 bg-transparent text-center text-xs font-mono font-bold py-1 focus:outline-none focus:bg-white/5 ${
                              (product.stock || 0) <= 0 ? 'text-red-400' : 'text-white'
                            }`}
                            title="Editar quantidade"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateStock && onUpdateStock(product.id, (product.stock || 0) + 1)}
                            className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
                            title="Aumentar estoque (+1)"
                          >
                            +
                          </button>
                        </div>
                        {(product.stock || 0) <= 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 whitespace-nowrap">
                            Sem Estoque
                          </span>
                        ) : (product.stock || 0) <= 3 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 whitespace-nowrap">
                            Baixo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 whitespace-nowrap">
                            OK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Variations */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 mb-1">
                        {product.colors?.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            title={c.name}
                            className="w-3.5 h-3.5 rounded-full border border-white/40"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        {product.colors?.length > 4 && (
                          <span className="text-[10px] text-gray-500">+{product.colors.length - 4}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {product.sizes?.join(', ')}
                      </div>
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.badges?.slice(0, 2).map((b, i) => (
                          <span key={i} className="text-[9px] bg-brand-rose/20 text-brand-rose-light px-1.5 py-0.5 rounded border border-brand-rose/30">
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-1.5 bg-brand-card hover:bg-brand-rose text-gray-300 hover:text-white rounded-lg transition-colors border border-brand-border"
                          title="Editar informações"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDuplicateProduct(product)}
                          className="p-1.5 bg-brand-card hover:bg-brand-gold text-gray-300 hover:text-black rounded-lg transition-colors border border-brand-border"
                          title="Duplicar produto"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o produto "${product.title}"?`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 bg-brand-card hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors border border-brand-border"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
