import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Phone, Heart, ChevronDown, MessageCircle, Shield } from 'lucide-react';
import { STORE_INFO } from '../data/banners';
import { CATEGORIES } from '../data/products';

export default function Header({
  cartCount,
  onOpenCart,
  onSelectCategory,
  activeCategory,
  onSearch,
  searchQuery,
  onOpenContact,
  onOpenAdmin,
  storeInfo = STORE_INFO,
  paymentSettings
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [vestidosDropdown, setVestidosDropdown] = useState(false);

  const handleCategoryClick = (cat) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    setVestidosDropdown(false);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const pixText =
    paymentSettings?.pix?.enabled !== false && (paymentSettings?.pix?.discountPercent || 0) > 0
      ? ` • ${paymentSettings.pix.discountPercent}% OFF no Pix`
      : '';

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-brand-border/60">
      {/* 1. Ticker / Announcement Bar */}
      <div className="bg-brand-rose text-white text-xs font-semibold py-2 overflow-hidden border-b border-white/10 tracking-widest uppercase">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {Array(8).fill(`✨ Enviamos para todo Brasil • Atendimento e Pedidos Direto no WhatsApp${pixText} • Novidades Toda Semana ✨`).map((text, i) => (
            <span key={i} className="inline-block px-4">{text}</span>
          ))}
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Mobile Menu Button & Search Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-brand-gold hover:text-white transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-brand-gold hover:text-white transition-colors flex items-center gap-2 group"
              aria-label="Pesquisar"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline-block text-xs uppercase tracking-wider text-gray-400 group-hover:text-white">
                Buscar
              </span>
            </button>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 flex justify-center">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryClick('Todos'); }} className="block">
              <img
                src={storeInfo?.logoUrl || STORE_INFO.logoUrl}
                alt={storeInfo?.name || STORE_INFO.name}
                className="h-10 sm:h-12 w-auto object-contain hover:opacity-95 transition-opacity"
              />
            </a>
          </div>

          {/* Right: WhatsApp & Cart */}
          <div className="flex items-center gap-2 sm:gap-4">

            <a
              href={`https://wa.me/${storeInfo?.orderWhatsApp || STORE_INFO.orderWhatsApp}?text=${encodeURIComponent('Olá Millany Modas! Gostaria de tirar uma dúvida.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-brand-gold hover:text-brand-whatsapp transition-colors hidden sm:flex items-center gap-1 text-xs uppercase tracking-wider"
              title="Atendimento WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-brand-whatsapp" />
              <span className="hidden lg:inline text-gray-300">Suporte</span>
            </a>

            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-brand-card hover:bg-brand-rose/20 text-white rounded-full transition-all border border-brand-border/60 hover:border-brand-rose flex items-center gap-2"
              aria-label="Carrinho de Compras"
            >
              <ShoppingBag className="w-5 h-5 text-brand-rose-light" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-rose text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-brand-gold">
                Carrinho
              </span>
            </button>
          </div>
        </div>

        {/* 3. Search Bar Accordion (if open) */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-brand-border/60 bg-black/95 animate-fadeIn">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Buscar vestidos, conjuntos, macacões, cropped..."
                className="w-full bg-brand-card text-white placeholder-gray-500 text-sm rounded-full pl-10 pr-10 py-2.5 border border-brand-border focus:border-brand-rose focus:outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Desktop Navigation Categories Bar */}
        <nav className="hidden lg:flex items-center justify-center space-x-6 py-2.5 border-t border-white/5 text-xs uppercase tracking-widest font-medium">
          <button
            onClick={() => handleCategoryClick('Todos')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Todos' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Início
          </button>

          <button
            onClick={() => handleCategoryClick('Vestidos')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Vestidos' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Vestidos
          </button>

          <button
            onClick={() => handleCategoryClick('Conjuntos')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Conjuntos' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Conjuntos
          </button>

          <button
            onClick={() => handleCategoryClick('Macacão')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Macacão' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Macacão
          </button>

          <button
            onClick={() => handleCategoryClick('Body')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Body' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Body
          </button>

          <button
            onClick={() => handleCategoryClick('Cropped')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Cropped' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Cropped
          </button>

          <button
            onClick={() => handleCategoryClick('Short/Saia')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Short/Saia' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Short / Saia
          </button>

          <button
            onClick={() => handleCategoryClick('Calça')}
            className={`transition-colors pb-1 border-b-2 ${
              activeCategory === 'Calça' ? 'text-brand-rose border-brand-rose' : 'text-gray-300 border-transparent hover:text-brand-gold'
            }`}
          >
            Calça
          </button>

          <button
            onClick={() => handleCategoryClick('Promoção')}
            className={`transition-colors pb-1 border-b-2 font-bold ${
              activeCategory === 'Promoção' ? 'text-brand-rose border-brand-rose' : 'text-brand-rose-light border-transparent hover:text-white'
            }`}
          >
            🔥 Promoção
          </button>

          <button
            onClick={onOpenContact}
            className="text-gray-400 hover:text-brand-gold transition-colors pb-1 border-b-2 border-transparent"
          >
            Contato
          </button>
        </nav>
      </div>

      {/* 5. Mobile Navigation Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-brand-dark border-r border-brand-border h-full flex flex-col justify-between p-6 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-border">
                <img src={storeInfo?.logoUrl || STORE_INFO.logoUrl} alt={storeInfo?.name || STORE_INFO.name} className="h-8 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col space-y-4 text-sm uppercase tracking-wider font-medium">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`text-left py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      activeCategory === cat ? 'bg-brand-rose/20 text-brand-rose font-bold' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{cat}</span>
                    {cat === 'Promoção' && <span className="text-xs bg-brand-rose text-white px-2 py-0.5 rounded-full">OFF</span>}
                  </button>
                ))}
                
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
                  className="text-left py-2 px-3 text-gray-400 hover:bg-white/5 rounded-lg"
                >
                  Contato & Loja Física
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-border text-xs text-gray-400 space-y-2">
              <p className="flex items-center gap-2 text-brand-rose">
                <Phone className="w-4 h-4" /> {STORE_INFO.phone}
              </p>
              <p className="text-[11px] leading-relaxed text-gray-500">
                {STORE_INFO.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
