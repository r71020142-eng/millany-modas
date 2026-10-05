import React, { useState } from 'react';
import AdminProductList from './AdminProductList';
import AdminProductModal from './AdminProductModal';
import AdminBannerManager from './AdminBannerManager';
import AdminSettings from './AdminSettings';
import AdminCRM from './AdminCRM';
import AdminReviewsManager from './AdminReviewsManager';
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
  Star
} from 'lucide-react';

export default function AdminDashboard({
  products,
  onSaveProducts,
  onResetProducts,
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
  onSeedDemoOrders
}) {
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'produtos' | 'banners' | 'config'
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

          {/* Action: Ver Loja */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCloseAdmin}
              className="px-4 py-2 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">Ver Loja Virtual</span>
            </button>
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
            onAddProduct={handleOpenAddProduct}
            onEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onDuplicateProduct={handleDuplicateProduct}
          />
        )}

        {activeTab === 'banners' && (
          <AdminBannerManager
            banners={banners}
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

        {activeTab === 'config' && (
          <AdminSettings
            storeInfo={storeInfo}
            onSaveStoreInfo={(updated) => {
              onSaveStoreInfo(updated);
              showToast('Configurações salvas!');
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
      />
    </div>
  );
}
