import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BannerSlider from './components/BannerSlider';
import ServiceInfoBar from './components/ServiceInfoBar';
import ProductCard from './components/ProductCard';
import ProductQuickView from './components/ProductQuickView';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';
import WhatsAppFloating from './components/WhatsAppFloating';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLoginModal from './components/admin/AdminLoginModal';
import StoreMaintenanceScreen from './components/StoreMaintenanceScreen';
import { PRODUCTS, CATEGORIES } from './data/products';
import { BANNER_SLIDES, STORE_INFO } from './data/banners';
import { INITIAL_DEMO_ORDERS } from './data/demoOrders';
import { DEFAULT_PAYMENT_SETTINGS } from './data/paymentSettings';
import {
  fetchRemoteStoreStatus,
  saveRemoteStoreStatus,
  getLocalStoreStatus
} from './services/storeStatusSync';
import {
  Sparkles,
  Filter,
  ChevronDown,
  Shield,
  Settings,
  PauseCircle,
  PlayCircle,
  LogOut,
  Eye,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');

  // URL Path Routing for /admin
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase();
    }
    return '/';
  });

  const navigateTo = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path.toLowerCase());
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Dynamic Products State (persisted in localStorage with v3 isolation)
  const [products, setProducts] = useState(() => {
    try {
      localStorage.removeItem('millany_admin_products');
      localStorage.removeItem('millany_admin_products_v2');
      const saved = localStorage.getItem('millany_admin_products_v3');
      const loaded = saved ? JSON.parse(saved) : PRODUCTS;
      return loaded.map((p, idx) => ({
        ...p,
        stock: typeof p.stock === 'number' ? p.stock : (idx === 4 ? 0 : 12)
      }));
    } catch {
      return PRODUCTS;
    }
  });

  // Dynamic Banners State (persisted in localStorage)
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('millany_admin_banners_v2');
      return saved ? JSON.parse(saved) : BANNER_SLIDES;
    } catch {
      return BANNER_SLIDES;
    }
  });

  // Dynamic Store Info State (persisted in localStorage)
  const [storeInfo, setStoreInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('millany_admin_store_info_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.orderWhatsApp === '5531986570126') parsed.orderWhatsApp = '553180393768';
        if (parsed.supportWhatsApp === '5531988109869') parsed.supportWhatsApp = '553180393768';
        if (parsed.phone === '(31) 98810-9869' || parsed.phone === '(31) 98657-0126') parsed.phone = '(31) 8039-3768';
        return parsed;
      }
      return STORE_INFO;
    } catch {
      return STORE_INFO;
    }
  });

  // Dynamic Categories State (persisted in localStorage)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('millany_admin_categories_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes('Todos')) return ['Todos', ...parsed];
          return parsed;
        }
      }
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  const handleSaveCategories = (updatedCategories) => {
    const sanitized = updatedCategories.includes('Todos')
      ? ['Todos', ...updatedCategories.filter((c) => c !== 'Todos')]
      : ['Todos', ...updatedCategories];
    setCategories(sanitized);
    try {
      localStorage.setItem('millany_admin_categories_v1', JSON.stringify(sanitized));
    } catch (e) {
      console.error('Erro ao salvar categorias:', e);
    }
  };

  const handleRenameCategory = (oldName, newName) => {
    if (!oldName || !newName || oldName === newName) return;

    // 1. Update categories list
    const updatedCategories = categories.map((c) =>
      c.toLowerCase() === oldName.toLowerCase() ? newName : c
    );
    handleSaveCategories(updatedCategories);

    // 2. Re-assign products that belong to old category
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((p) => {
        if (p.category?.toLowerCase() === oldName.toLowerCase()) {
          return { ...p, category: newName };
        }
        return p;
      });
      try {
        localStorage.setItem('millany_admin_products_v3', JSON.stringify(updatedProducts));
      } catch (e) {
        console.error('Erro ao atualizar produtos com nova categoria:', e);
      }
      return updatedProducts;
    });

    // 3. Update activeCategory if viewing renamed category
    if (activeCategory.toLowerCase() === oldName.toLowerCase()) {
      setActiveCategory(newName);
    }
  };

  const handleDeleteCategory = (catToDelete, fallbackCat = 'Geral') => {
    if (!catToDelete || catToDelete === 'Todos') return;

    let updatedCategories = categories.filter(
      (c) => c.toLowerCase() !== catToDelete.toLowerCase()
    );
    if (fallbackCat && fallbackCat !== 'Todos' && !updatedCategories.some((c) => c.toLowerCase() === fallbackCat.toLowerCase())) {
      updatedCategories.push(fallbackCat);
    }
    handleSaveCategories(updatedCategories);

    // Re-assign products to fallback category
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((p) => {
        if (p.category?.toLowerCase() === catToDelete.toLowerCase()) {
          return { ...p, category: fallbackCat };
        }
        return p;
      });
      try {
        localStorage.setItem('millany_admin_products_v3', JSON.stringify(updatedProducts));
      } catch (e) {
        console.error('Erro ao reatribuir produtos da categoria excluída:', e);
      }
      return updatedProducts;
    });

    if (activeCategory.toLowerCase() === catToDelete.toLowerCase()) {
      setActiveCategory('Todos');
    }
  };

  // Dynamic Payment Settings State (persisted in localStorage)
  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('millany_admin_payment_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pix?.key === '31986570126') {
          parsed.pix.key = '3180393768';
        }
        return parsed;
      }
      return DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  });

  const handleSavePaymentSettings = (updated) => {
    setPaymentSettings(updated);
    try {
      localStorage.setItem('millany_admin_payment_settings_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao salvar paymentSettings:', e);
    }
  };

  // Dynamic CRM Orders State (persisted in localStorage)
  const [crmOrders, setCrmOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('millany_admin_crm_orders_v1');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ORDERS;
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('millany_admin_crm_orders_v1', JSON.stringify(crmOrders));
    } catch (e) {
      console.error('Erro ao sincronizar CRM com localStorage:', e);
    }
  }, [crmOrders]);

  // Dynamic Store Status State (Pause / Maintenance mode synced globally)
  const [storeStatus, setStoreStatus] = useState(() => getLocalStoreStatus());
  const [isAdminPreviewingStore, setIsAdminPreviewingStore] = useState(false);

  // Synchronize store status across all devices and visitors
  useEffect(() => {
    let isMounted = true;
    const syncStatus = async () => {
      const remote = await fetchRemoteStoreStatus();
      if (isMounted && remote && typeof remote.isPaused === 'boolean') {
        setStoreStatus((prev) => {
          if (
            prev.isPaused !== remote.isPaused ||
            prev.pausedTitle !== remote.pausedTitle ||
            prev.pausedMessage !== remote.pausedMessage ||
            prev.estimatedReturn !== remote.estimatedReturn
          ) {
            return remote;
          }
          return prev;
        });
      }
    };

    syncStatus();
    const interval = setInterval(syncStatus, 4000);
    const onFocus = () => syncStatus();
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleSaveStoreStatus = (updated) => {
    setStoreStatus(updated);
    saveRemoteStoreStatus(updated);
  };

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('millany_admin_authenticated') === 'true';
  });

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('millany_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('millany_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Admin Data Handlers
  const handleSaveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('millany_admin_products_v3', JSON.stringify(newProducts));
  };

  const handleResetProducts = () => {
    setProducts(PRODUCTS);
    localStorage.removeItem('millany_admin_products');
    localStorage.removeItem('millany_admin_products_v2');
    localStorage.removeItem('millany_admin_products_v3');
  };

  const handleSaveBanners = (newBanners) => {
    setBanners(newBanners);
    localStorage.setItem('millany_admin_banners_v2', JSON.stringify(newBanners));
  };

  const handleResetBanners = () => {
    setBanners(BANNER_SLIDES);
    localStorage.removeItem('millany_admin_banners');
    localStorage.removeItem('millany_admin_banners_v2');
  };

  const handleSaveStoreInfo = (newStoreInfo) => {
    setStoreInfo(newStoreInfo);
    localStorage.setItem('millany_admin_store_info_v2', JSON.stringify(newStoreInfo));
  };

  const handleResetAllData = () => {
    setProducts(PRODUCTS);
    setBanners(BANNER_SLIDES);
    setStoreInfo(STORE_INFO);
    setCategories(CATEGORIES);
    localStorage.removeItem('millany_admin_products');
    localStorage.removeItem('millany_admin_products_v2');
    localStorage.removeItem('millany_admin_products_v3');
    localStorage.removeItem('millany_admin_banners');
    localStorage.removeItem('millany_admin_banners_v2');
    localStorage.removeItem('millany_admin_store_info');
    localStorage.removeItem('millany_admin_store_info_v2');
    localStorage.removeItem('millany_admin_categories_v1');
  };

  // CRM Handlers
  const handleSaveOrderToCRM = (newOrder) => {
    setCrmOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('millany_admin_crm_orders_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Erro ao salvar no CRM:', e);
      }
      return updated;
    });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setCrmOrders((prevOrders) => {
      const targetOrder = prevOrders.find((o) => o.id === orderId);
      if (!targetOrder) return prevOrders;

      const isBecomingPaid = newStatus === 'Confirmado / Pago' || newStatus.toLowerCase().includes('pago');
      const wasDeducted = !!targetOrder.stockDeducted;

      // Deduct stock automatically when order is updated to paid (if not already deducted)
      if (isBecomingPaid && !wasDeducted && Array.isArray(targetOrder.items)) {
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.map((prod) => {
            const matchingItem = targetOrder.items.find(
              (item) => item.id === prod.id || item.slug === prod.slug || item.title === prod.title
            );
            if (matchingItem) {
              const currentStock = typeof prod.stock === 'number' ? prod.stock : 10;
              const deductQty = matchingItem.quantity || 1;
              const newStock = Math.max(0, currentStock - deductQty);
              return { ...prod, stock: newStock };
            }
            return prod;
          });

          try {
            localStorage.setItem('millany_admin_products_v3', JSON.stringify(updatedProducts));
          } catch (e) {
            console.error('Erro ao atualizar estoque no localStorage:', e);
          }

          return updatedProducts;
        });
      }

      // Restore stock if order is cancelled after being paid
      if (newStatus === 'Cancelado' && wasDeducted && Array.isArray(targetOrder.items)) {
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.map((prod) => {
            const matchingItem = targetOrder.items.find(
              (item) => item.id === prod.id || item.slug === prod.slug || item.title === prod.title
            );
            if (matchingItem) {
              const currentStock = typeof prod.stock === 'number' ? prod.stock : 0;
              const restoreQty = matchingItem.quantity || 1;
              return { ...prod, stock: currentStock + restoreQty };
            }
            return prod;
          });

          try {
            localStorage.setItem('millany_admin_products_v3', JSON.stringify(updatedProducts));
          } catch (e) {
            console.error('Erro ao restaurar estoque no localStorage:', e);
          }

          return updatedProducts;
        });
      }

      return prevOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            stockDeducted: isBecomingPaid ? true : newStatus === 'Cancelado' ? false : o.stockDeducted
          };
        }
        return o;
      });
    });
  };

  const handleUpdateOrderNotes = (orderId, notes) => {
    setCrmOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, notes } : o))
    );
  };

  const handleDeleteOrder = (orderId) => {
    setCrmOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleClearAllOrders = () => {
    setCrmOrders([]);
    localStorage.removeItem('millany_admin_crm_orders_v1');
  };

  const handleSeedDemoOrders = () => {
    setCrmOrders(INITIAL_DEMO_ORDERS);
    localStorage.setItem('millany_admin_crm_orders_v1', JSON.stringify(INITIAL_DEMO_ORDERS));
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('millany_admin_authenticated', 'true');
    navigateTo('/admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminPreviewingStore(false);
    localStorage.removeItem('millany_admin_authenticated');
    navigateTo('/');
  };

  // Cart operations
  const handleAddToCart = (productToAdd) => {
    if (typeof productToAdd.stock === 'number' && productToAdd.stock <= 0) {
      alert('Este produto está sem estoque no momento.');
      return;
    }

    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          item.color === productToAdd.color &&
          item.size === productToAdd.size
      );

      if (existingIdx > -1) {
        const next = [...prevItems];
        const maxStock = typeof productToAdd.stock === 'number' ? productToAdd.stock : 99;
        const newQty = (next[existingIdx].quantity || 1) + (productToAdd.quantity || 1);
        next[existingIdx].quantity = Math.min(maxStock, newQty);
        return next;
      } else {
        return [...prevItems, { ...productToAdd, quantity: productToAdd.quantity || 1 }];
      }
    });
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    setCartItems((prev) => {
      const next = [...prev];
      if (newQuantity <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQuantity;
      }
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Filtered & Sorted products (uses dynamic products)
  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCategory && activeCategory !== 'Todos') {
      if (activeCategory === 'Promoção') {
        list = products.filter(
          (p) =>
            (p.compare_price && p.compare_price !== 'R$0,00') ||
            (p.badges && p.badges.includes('Promoção'))
        );
      } else {
        list = products.filter(
          (p) =>
            p.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
            activeCategory.toLowerCase().includes(p.category?.toLowerCase() || '')
        );
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    const sorted = [...list];
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => (a.price_number || 0) - (b.price_number || 0));
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => (b.price_number || 0) - (a.price_number || 0));
    } else if (sortOption === 'name-asc') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return sorted;
  }, [products, activeCategory, searchQuery, sortOption]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Check if current route is /admin or #admin
  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath.startsWith('/admin') ||
    (typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#admin');

  // ROUTE 1: If on /admin and NOT logged in, show Password Login Screen
  if (isAdminRoute && !isAdminLoggedIn) {
    return (
      <AdminLoginModal
        isOpen={true}
        isPageMode={true}
        onLoginSuccess={handleLoginSuccess}
        onBackToStore={() => navigateTo('/')}
      />
    );
  }

  // ROUTE 2: If on /admin and authenticated, render full Admin UI!
  if (isAdminRoute && isAdminLoggedIn) {
    return (
      <AdminDashboard
        products={products}
        onSaveProducts={handleSaveProducts}
        onResetProducts={handleResetProducts}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        banners={banners}
        onSaveBanners={handleSaveBanners}
        onResetBanners={handleResetBanners}
        storeInfo={storeInfo}
        onSaveStoreInfo={handleSaveStoreInfo}
        onResetAllData={handleResetAllData}
        onCloseAdmin={() => {
          setIsAdminPreviewingStore(false);
          navigateTo('/');
        }}
        orders={crmOrders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderNotes={handleUpdateOrderNotes}
        onDeleteOrder={handleDeleteOrder}
        onClearAllOrders={handleClearAllOrders}
        onSeedDemoOrders={handleSeedDemoOrders}
        paymentSettings={paymentSettings}
        onSavePaymentSettings={handleSavePaymentSettings}
        storeStatus={storeStatus}
        onSaveStoreStatus={handleSaveStoreStatus}
        onLogout={handleAdminLogout}
      />
    );
  }

  // ROUTE 3: If Store is PAUSED:
  if (storeStatus.isPaused) {
    // If the admin explicitly chose to preview the catalog:
    if (isAdminLoggedIn && isAdminPreviewingStore) {
      // Admin continues down to render the storefront preview with top banner below
    } else {
      // Everyone (visitors AND admin by default) sees the maintenance screen!
      return (
        <StoreMaintenanceScreen
          storeStatus={storeStatus}
          storeInfo={storeInfo}
          isAdmin={isAdminLoggedIn}
          onOpenAdminLogin={() => navigateTo('/admin')}
          onUnpause={() =>
            handleSaveStoreStatus({ ...storeStatus, isPaused: false, pausedAt: null })
          }
          onToggleAdminPreview={() => setIsAdminPreviewingStore(true)}
          onOpenAdmin={() => navigateTo('/admin')}
          onLogout={handleAdminLogout}
        />
      );
    }
  }

  // ROUTE 4: Render Customer Storefront (or Admin Catalog Preview)
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-brand-rose selection:text-white">
      
      {/* Admin Floating Banner (Shown ONLY when Admin is authenticated) */}
      {isAdminLoggedIn && (
        <div
          className={`px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 z-50 transition-colors ${
            storeStatus.isPaused
              ? 'bg-amber-950/95 border-b border-amber-500/60 text-amber-200'
              : 'bg-brand-card/90 border-b border-brand-border text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                storeStatus.isPaused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="font-semibold">
              {storeStatus.isPaused
                ? '👁️ MODO PRÉ-VISUALIZAÇÃO DE ADMINISTRADOR: A loja está PAUSADA para todos os visitantes externos.'
                : 'Modo Administrador Ativo (Loja 100% Aberta ao Público)'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {storeStatus.isPaused && (
              <button
                onClick={() => setIsAdminPreviewingStore(false)}
                className="px-3 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded font-bold uppercase text-[10px] transition-colors"
                title="Voltar para a tela de manutenção vista pelos clientes"
              >
                Voltar à Tela de Pausa
              </button>
            )}

            {storeStatus.isPaused ? (
              <button
                onClick={() =>
                  handleSaveStoreStatus({ ...storeStatus, isPaused: false, pausedAt: null })
                }
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold uppercase text-[10px] transition-colors flex items-center gap-1"
                title="Tornar a loja pública novamente"
              >
                <PlayCircle className="w-3 h-3" />
                <span>Reativar Loja</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  handleSaveStoreStatus({
                    ...storeStatus,
                    isPaused: true,
                    pausedAt: new Date().toISOString()
                  })
                }
                className="px-3 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded font-bold uppercase text-[10px] transition-colors flex items-center gap-1"
                title="Pausar a loja para visitantes"
              >
                <PauseCircle className="w-3 h-3" />
                <span>Pausar Loja</span>
              </button>
            )}

            <button
              onClick={() => navigateTo('/admin')}
              className="px-3 py-1 bg-brand-rose hover:bg-brand-rose-dark text-white rounded font-bold uppercase text-[10px] transition-colors flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Painel Admin</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-2.5 py-1 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded text-[10px] uppercase font-semibold transition-colors flex items-center gap-1"
              title="Desconectar do Admin"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Header (Clean: No Admin button for visitors) */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        categories={categories}
        onSelectCategory={setActiveCategory}
        activeCategory={activeCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onOpenContact={() => setIsContactOpen(true)}
        storeInfo={storeInfo}
        paymentSettings={paymentSettings}
      />

      {/* 2. Banner Carousel (Shown on Home/Todos) */}
      {!searchQuery && activeCategory === 'Todos' && (
        <BannerSlider
          banners={banners}
          onSelectCategory={setActiveCategory}
        />
      )}

      {/* 3. Service Information Bar */}
      {!searchQuery && <ServiceInfoBar />}

      {/* 4. Main Product Catalog Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-brand-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-rose font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{searchQuery ? 'Resultados da Busca' : 'Coleção Oficial'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mt-1">
              {searchQuery
                ? `Buscando por "${searchQuery}"`
                : activeCategory === 'Todos'
                ? 'Destaques & Lançamentos'
                : activeCategory}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Mostrando <strong className="text-brand-rose-light">{filteredProducts.length}</strong> produtos exclusivos
            </p>
          </div>

          {/* Controls: Category Pills & Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-brand-card text-white text-xs px-3.5 py-2 rounded-lg border border-brand-border appearance-none pr-8 focus:border-brand-rose focus:outline-none cursor-pointer"
              >
                <option value="featured">Destaques da Loja</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name-asc">Nome (A - Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="py-4 flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                activeCategory === cat && !searchQuery
                  ? 'bg-brand-rose border-brand-rose text-white shadow-md'
                  : 'bg-brand-card border-brand-border text-gray-300 hover:border-gray-500'
              }`}
            >
              {cat === 'Promoção' ? '🔥 Promoção' : cat}
            </button>
          ))}
        </div>

        {/* Product Grid (4 columns desktop, 2 columns mobile) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-brand-card/30 rounded-2xl border border-brand-border my-8 space-y-4">
            <Filter className="w-12 h-12 text-brand-border mx-auto" />
            <p className="text-base text-gray-300">Nenhum produto encontrado nesta categoria.</p>
            <button
              onClick={() => { setActiveCategory('Todos'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-brand-rose text-white text-xs uppercase font-bold tracking-wider rounded-lg"
            >
              Ver Todos os Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
                onOpenProduct={setQuickViewProduct}
                paymentSettings={paymentSettings}
              />
            ))}
          </div>
        )}

      </main>

      {/* 5. Modals & Overlays */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={() => {
          setQuickViewProduct(null);
          setIsCheckoutOpen(true);
        }}
        paymentSettings={paymentSettings}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        paymentSettings={paymentSettings}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        appliedCoupon={appliedCoupon}
        onClearCart={handleClearCart}
        onSaveOrderToCRM={handleSaveOrderToCRM}
        paymentSettings={paymentSettings}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* 6. Floating WhatsApp Button */}
      <WhatsAppFloating />

      {/* 7. Footer (Clean: Designer credit is @ray.pires_, no admin button) */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenContact={() => setIsContactOpen(true)}
        storeInfo={storeInfo}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}
