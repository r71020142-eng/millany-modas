import React from 'react';
import { STORE_INFO } from '../data/banners';
import { Clock, MessageCircle, Shield, Sparkles, Heart } from 'lucide-react';

export default function StoreMaintenanceScreen({
  storeStatus,
  storeInfo = STORE_INFO,
  onOpenAdminLogin
}) {
  const whatsappUrl = `https://wa.me/${storeInfo?.orderWhatsApp || STORE_INFO.orderWhatsApp}?text=${encodeURIComponent(
    'Olá Millany Modas! Vi que o site está em atualização e gostaria de saber sobre as novidades e atendimento.'
  )}`;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-brand-rose selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-rose/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Minimal Info */}
      <header className="py-6 px-4 border-b border-brand-border/40 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img
            src={storeInfo?.logoUrl || STORE_INFO.logoUrl}
            alt={storeInfo?.name || STORE_INFO.name}
            className="h-9 sm:h-11 w-auto object-contain mx-auto sm:mx-0"
          />
          <div className="hidden sm:flex items-center gap-2 text-xs text-brand-gold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">Modo Atualização</span>
          </div>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-lg w-full text-center space-y-6 bg-brand-card/70 border border-brand-border/80 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Loja Temporariamente Pausada</span>
          </div>

          {/* Heading & Subheading */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-tight">
              {storeStatus?.pausedTitle || 'Estamos preparando novidades! ✨'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              {storeStatus?.pausedMessage ||
                'Nossa loja virtual está temporariamente pausada para atualização de estoque, fotos e lançamentos exclusivos. Voltamos em instantes!'}
            </p>
          </div>

          {/* Estimated Return Time Card */}
          {storeStatus?.estimatedReturn && (
            <div className="inline-block px-4 py-2 bg-black/60 rounded-xl border border-brand-border text-xs text-brand-gold font-medium">
              ⏰ {storeStatus.estimatedReturn}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-3 sm:space-y-0 sm:flex sm:gap-3 justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-whatsapp hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chamar no WhatsApp</span>
            </a>

            <a
              href="https://instagram.com/_millanymodas"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-card hover:bg-white/10 text-brand-rose-light hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-brand-border transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current text-brand-rose" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Acompanhar Instagram</span>
            </a>
          </div>

          {/* Small Notice */}
          <p className="text-[11px] text-gray-400 pt-2">
            Precisa de ajuda ou deseja realizar seu pedido pelo atendimento? Clique no botão do WhatsApp acima.
          </p>
        </div>
      </main>

      {/* Footer with Creator Credit and Discreet Admin Login */}
      <footer className="py-6 px-4 border-t border-brand-border/40 text-center text-xs text-gray-500 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px]">
            © {new Date().getFullYear()} Millany Modas. Todos os direitos reservados.
          </p>

          <a
            href="https://instagram.com/ray.pires_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-400 hover:text-brand-rose transition-colors flex items-center gap-1"
          >
            Desenvolvido por: <span className="text-brand-rose">♡</span>{' '}
            <strong className="text-brand-rose-light font-serif">@ray.pires_</strong>
          </a>

          {/* Admin link discreetly at bottom */}
          <button
            onClick={onOpenAdminLogin}
            className="text-[11px] text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1"
            title="Acesso Administrativo"
          >
            <Shield className="w-3 h-3 text-gray-500" />
            <span>Acesso Restrito</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
