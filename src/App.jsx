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
import { PRODUCTS, CATEGORIES } from './data/products';
import { BANNER_SLIDES, STORE_INFO } from './data/banners';
import { INITIAL_DEMO_ORDERS } from './data/demoOrders';
import { Sparkles, Filter, ChevronDown, Shield, Settings } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');

  // Dynamic Products State (persisted in localStorage with v3 isolation)
  const [products, setProducts] = useState(() => {
    try {
      // Clear legacy storages to ensure 100% un-mixed verified photos
      localStorage.removeItem('millany_admin_products');
      localStorage.removeItem('millany_admin_products_v2');
      const saved = localStorage.getItem('millany_admin_products_v3');
      return saved ? JSON.parse(saved) : PRODUCTS;
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
      return saved ? JSON.parse(saved) : STORE_INFO;
    } catch {
      return STORE_INFO;
    }
  });

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

  // Admin Mode States
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
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
    localStorage.removeItem('millany_admin_products');
    localStorage.removeItem('millany_admin_products_v2');
    localStorage.removeItem('millany_admin_banners');
    localStorage.removeItem('millany_admin_banners_v2');
    localStorage.removeItem('millany_admin_store_info');
    localStorage.removeItem('millany_admin_store_info_v2');
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
    setCrmOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
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

  const handleOpenAdminTrigger = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('millany_admin_authenticated', 'true');
    setIsAdminDashboardOpen(true);
  };

  // Cart operations
  const handleAddToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          item.color === productToAdd.color &&
          item.size === productToAdd.size
      );

      if (existingIdx > -1) {
        const next = [...prevItems];
        next[existingIdx].quantity += productToAdd.quantity || 1;
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

  // If Admin Dashboard is active, render full Admin UI!
  if (isAdminDashboardOpen) {
    return (
      <AdminDashboard
        products={products}
        onSaveProducts={handleSaveProducts}
        onResetProducts={handleResetProducts}
        banners={banners}
        onSaveBanners={handleSaveBanners}
        onResetBanners={handleResetBanners}
        storeInfo={storeInfo}
        onSaveStoreInfo={handleSaveStoreInfo}
        onResetAllData={handleResetAllData}
        onCloseAdmin={() => setIsAdminDashboardOpen(false)}
        orders={crmOrders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderNotes={handleUpdateOrderNotes}
        onDeleteOrder={handleDeleteOrder}
        onClearAllOrders={handleClearAllOrders}
        onSeedDemoOrders={handleSeedDemoOrders}
      />
    );
  }

  // Render Customer Storefront
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-brand-rose selection:text-white">
      
      {/* Admin Floating Banner (if user is authenticated) */}
      {isAdminLoggedIn && (
        <div className="bg-brand-gold/10 border-b border-brand-gold/30 px-4 py-1.5 text-xs flex items-center justify-between text-brand-gold z-40">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-semibold">Modo Administrador Ativo</span>
          </div>
          <button
            onClick={() => setIsAdminDashboardOpen(true)}
            className="px-3 py-0.5 bg-brand-rose text-white rounded font-bold uppercase text-[10px] hover:bg-brand-rose-dark transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            <span>Abrir Painel Admin</span>
          </button>
        </div>
      )}

      {/* 1. Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={setActiveCategory}
        activeCategory={activeCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={handleOpenAdminTrigger}
        storeInfo={storeInfo}
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
            {/* Sort Selector */}
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
          {CATEGORIES.map((cat) => (
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
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        appliedCoupon={appliedCoupon}
        onClearCart={handleClearCart}
        onSaveOrderToCRM={handleSaveOrderToCRM}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 6. Floating WhatsApp Button */}
      <WhatsAppFloating />

      {/* 7. Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={handleOpenAdminTrigger}
        storeInfo={storeInfo}
      />
    </div>
  );
}
