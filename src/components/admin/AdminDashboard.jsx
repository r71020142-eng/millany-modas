import React, { useState } from 'react';
import AdminProductList from './AdminProductList';
import AdminProductModal from './AdminProductModal';
import AdminBannerManager from './AdminBannerManager';
import AdminSettings from './AdminSettings';
import AdminPaymentSettings from './AdminPaymentSettings';
import AdminCRM from './AdminCRM';
import AdminReviewsManager from './AdminReviewsManager';
import AdminCategoriesManager from './AdminCategoriesManager';
import { STORE_INFO } from '../../data/banners';
import {
  ShoppingBag,
  Image,
  Settings,
  Eye,
  LogOut,
  Sparkles,
  ShieldCheck,
  Check,
  Users,
  Star,
  CreditCard,
  Layers,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard({
  products,
  onSaveProducts,
  onResetProducts,
  categories = [],
  onSaveCategories,
  onRenameCategory,
  onDeleteCategory,
  banners,
  onSaveBanners,
  onResetBanners,
  storeInfo,
  onSaveStoreInfo,
  onResetAllData,
  onCloseAdmin,
  orders = [],
  onUpdateOrderStatus,
  onUpdateOrderNotes,
  onDeleteOrder,
  onClearAllOrders,
  onSeedDemoOrders,
  paymentSettings,
  onSavePaymentSettings,
  storeStatus,
  onSaveStoreStatus,
  cloudSyncState,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'produtos' | 'categorias' | 'banners' | 'reviews' | 'pagamentos' | 'config'
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (savedProduct) => {
    const existingIndex = products.findIndex((p) => p.id === savedProduct.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...products];
      updated[existingIndex] = savedProduct;
      showToast('Produto atualizado com sucesso!');
    } else {
      updated = [savedProduct, ...products];
      showToast('Novo produto cadastrado com sucesso!');
    }
    onSaveProducts(updated);
  };

  const handleDeleteProduct = (productId) => {
    const updated = products.filter((p) => p.id !== productId);
    onSaveProducts(updated);
    showToast('Produto removido do catálogo!');
  };

  const handleDuplicateProduct = (product) => {
    const copy = {
      ...product,
      id: `${product.slug || 'prod'}-copy-${Date.now().toString().slice(-4)}`,
      title: `${product.title} (Cópia)`
    };
    onSaveProducts([copy, ...products]);
    showToast('Produto duplicado com sucesso!');
  };

  const handleUpdateProductStock = (productId, newStock) => {
    const stockNum = isNaN(parseInt(newStock, 10)) ? 0 : Math.max(0, parseInt(newStock, 10));
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock: stockNum } : p
    );
    onSaveProducts(updated);
    showToast(stockNum === 0 ? 'Estoque zerado! Produto marcado como esgotado.' : 'Estoque atualizado!');
  };

  const handleToggleProductStatus = (productId) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isActive: p.isActive === false ? true : false } : p
    );
    onSaveProducts(updated);
    const target = updated.find((p) => p.id === productId);
    showToast(target?.isActive !== false ? 'Produto ativado no site!' : 'Produto desativado (oculto para visitantes)!');
  };

  // Export / Import
  const handleExportData = () => {
    const exportObject = {
      storeInfo,
      banners,
      products,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `millany_modas_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup exportado com sucesso!');
  };

  const handleImportData = (importedData) => {
    if (importedData.products && Array.isArray(importedData.products)) {
      onSaveProducts(importedData.products);
    }
    if (importedData.banners && Array.isArray(importedData.banners)) {
      onSaveBanners(importedData.banners);
    }
    if (importedData.storeInfo) {
      onSaveStoreInfo(importedData.storeInfo);
    }
    showToast('Dados restaurados a partir do backup!');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col text-left">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-brand-dark border-b border-brand-border px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <img
              src={storeInfo.logoUrl || STORE_INFO.logoUrl}
              alt="Millany Modas"
              className="h-8 sm:h-10 w-auto"
            />
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-brand-border">
              <span className="bg-brand-rose/20 text-brand-rose-light text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-brand-rose/40">
                Painel Administrativo
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 p-1.5 rounded-xl border border-brand-border">
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'crm'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CRM Clientes</span> ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('produtos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'produtos'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Produtos</span> ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('categorias')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'categorias'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Categorias</span> ({categories ? Math.max(0, categories.length - 1) : 0})
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'banners'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Banners Hero</span> ({banners.length})
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="hidden sm:inline">Avaliações</span>
            </button>

            <button
              onClick={() => setActiveTab('pagamentos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'pagamentos'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pagamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Configurações</span>
            </button>
          </div>

          {/* Actions: Status da Loja, Ver Loja, Logout */}
          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Indicator */}
            {cloudSyncState && (() => {
              const status = typeof cloudSyncState === 'string' ? cloudSyncState : (cloudSyncState.status || 'synced');
              return (
                <div
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    status === 'saving'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : status === 'error'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}
                  title={
                    status === 'saving'
                      ? 'Salvando alterações na nuvem...'
                      : status === 'error'
                      ? 'Erro ao conectar à nuvem. Os dados estão salvos localmente.'
                      : 'Sincronizado na Nuvem: Suas alterações estão ativas para todos os aparelhos e visitantes em tempo real!'
                  }
                >
                  {status === 'saving' ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                      <span className="hidden xl:inline text-[11px]">Sincronizando...</span>
                    </>
                  ) : status === 'error' ? (
                    <>
                      <CloudOff className="w-3 h-3 text-rose-400" />
                      <span className="hidden xl:inline text-[11px]">Nuvem Offline</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span className="hidden xl:inline text-[11px]">Nuvem Ativa</span>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Quick Pause / Active Toggle */}
            <button
              type="button"
              onClick={() => {
                const newPaused = !storeStatus?.isPaused;
                const updated = {
                  ...storeStatus,
                  isPaused: newPaused,
                  pausedAt: newPaused ? new Date().toISOString() : null
                };
                if (onSaveStoreStatus) {
                  onSaveStoreStatus(updated);
                }
                showToast(newPaused ? 'Loja PAUSADA para visitantes!' : 'Loja REATIVADA para o público!');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                storeStatus?.isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={
                storeStatus?.isPaused
                  ? 'Loja Pausada para visitantes. Clique para reativar.'
                  : 'Loja aberta ao público. Clique para pausar.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  storeStatus?.isPaused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="hidden sm:inline">
                {storeStatus?.isPaused ? 'Pausada' : 'No Ar'}
              </span>
            </button>

            {/* Ver Loja */}
            <button
              onClick={onCloseAdmin}
              className="px-3.5 py-1.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
              title="Visualizar loja virtual"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ver Loja</span>
            </button>

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-1 text-xs"
                title="Sair do Painel Admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline text-xs">Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'crm' && (
          <AdminCRM
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onUpdateOrderNotes={onUpdateOrderNotes}
            onDeleteOrder={onDeleteOrder}
            onClearAllOrders={onClearAllOrders}
            onSeedDemoOrders={onSeedDemoOrders}
          />
        )}

        {activeTab === 'produtos' && (
          <AdminProductList
            products={products}
            categories={categories}
            onOpenCategories={() => setActiveTab('categorias')}
            onAddProduct={handleOpenAddProduct}
            onEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onDuplicateProduct={handleDuplicateProduct}
            onUpdateStock={handleUpdateProductStock}
            onToggleProductStatus={handleToggleProductStatus}
          />
        )}

        {activeTab === 'categorias' && (
          <AdminCategoriesManager
            categories={categories}
            products={products}
            onSaveCategories={(updated) => {
              if (onSaveCategories) onSaveCategories(updated);
              showToast('Categorias salvas com sucesso!');
            }}
            onRenameCategory={(oldName, newName) => {
              if (onRenameCategory) onRenameCategory(oldName, newName);
              showToast(`Categoria "${oldName}" renomeada para "${newName}"!`);
            }}
            onDeleteCategory={(catToDelete, fallbackCat) => {
              if (onDeleteCategory) onDeleteCategory(catToDelete, fallbackCat);
              showToast(`Categoria "${catToDelete}" removida com sucesso!`);
            }}
          />
        )}

        {activeTab === 'banners' && (
          <AdminBannerManager
            banners={banners}
            categories={categories}
            onSaveBanners={(updated) => {
              onSaveBanners(updated);
              showToast('Banners do carrossel atualizados com sucesso!');
            }}
            onResetBanners={() => {
              onResetBanners();
              showToast('Banners originais restaurados!');
            }}
          />
        )}

        {activeTab === 'reviews' && (
          <AdminReviewsManager products={products} />
        )}

        {activeTab === 'pagamentos' && (
          <AdminPaymentSettings
            paymentSettings={paymentSettings}
            onSavePaymentSettings={(updated) => {
              onSavePaymentSettings(updated);
              showToast('Formas de pagamento e descontos atualizados!');
            }}
          />
        )}

        {activeTab === 'config' && (
          <AdminSettings
            storeInfo={storeInfo}
            onSaveStoreInfo={(updated) => {
              onSaveStoreInfo(updated);
              showToast('Configurações salvas!');
            }}
            storeStatus={storeStatus}
            onSaveStoreStatus={(updated) => {
              if (onSaveStoreStatus) onSaveStoreStatus(updated);
              showToast('Status da loja atualizado!');
            }}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetAllData={() => {
              onResetAllData();
              showToast('Catálogo e configurações restaurados para o padrão original!');
            }}
          />
        )}
      </main>

      {/* Product Edit / Add Modal */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        categories={categories}
      />
    </div>
  );
}
