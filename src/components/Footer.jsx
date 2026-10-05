import React, { useState } from 'react';
import { STORE_INFO, PAYMENT_METHODS } from '../data/banners';
import { Phone, Mail, MapPin, Send, Check } from 'lucide-react';

export default function Footer({
  onSelectCategory,
  onOpenContact,
  onOpenAdmin,
  storeInfo = STORE_INFO,
  paymentSettings
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSent(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSent(false);
    }, 3000);
  };

  return (
    <footer className="bg-black border-t border-brand-border text-gray-300 text-xs">
      
      {/* 1. Newsletter Bar */}
      <div className="border-b border-brand-border bg-brand-dark/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">
                Assine nossa newsletter
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Receba novidades exclusivas, lançamentos e cupons de desconto especiais.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 min-w-[240px] bg-brand-card text-white placeholder-gray-500 text-xs px-4 py-3 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
              <button
                type="submit"
                disabled={newsletterSent}
                className="px-6 py-3 bg-brand-rose hover:bg-brand-rose-dark text-white font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
              >
                {newsletterSent ? (
                  <>
                    <Check className="w-4 h-4 text-white" /> Inscrito!
                  </>
                ) : (
                  <>
                    <span>Enviar</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <img
              src={STORE_INFO.logoUrl}
              alt={STORE_INFO.name}
              className="h-10 w-auto"
            />
            <p className="text-xs text-gray-400 leading-relaxed">
              {STORE_INFO.tagline}. Roupas femininas com elegância, qualidade e caimento impecável.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/_millanymodas"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-brand-card hover:bg-brand-rose text-white transition-colors border border-brand-border"
                aria-label="Instagram da Millany Modas"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Departamentos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">
              Departamentos
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => onSelectCategory('Todos')} className="hover:text-white transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Vestidos')} className="hover:text-white transition-colors">
                  Vestidos
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Conjuntos')} className="hover:text-white transition-colors">
                  Conjuntos
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Macacão')} className="hover:text-white transition-colors">
                  Macacão
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Body')} className="hover:text-white transition-colors">
                  Body
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Promoção')} className="hover:text-brand-rose text-brand-rose-light font-bold transition-colors">
                  Promoções
                </button>
              </li>
            </ul>
          </div>

          {/* Entre em Contato */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">
              Entre em Contato
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-rose flex-shrink-0 mt-0.5" />
                <div>
                  <a href={`https://wa.me/${STORE_INFO.supportWhatsApp}`} target="_blank" rel="noopener noreferrer" className="hover:text-white block">
                    (31) 98810-9869 (WhatsApp)
                  </a>
                  <a href="tel:31988109869" className="text-[11px] text-gray-500 hover:text-gray-300">
                    Telefone: 31 98810-9869
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-rose flex-shrink-0" />
                <a href="mailto:millanymodas@gmail.com" className="hover:text-white">
                  millanymodas@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-rose flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Av. Selim José de Sales, 1557 - Canaã, Ipatinga - MG
                </span>
              </li>
            </ul>
          </div>

          {/* Meios de Envio & Selos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-4">
              Envio & Segurança
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="https://d26lpennugtm8s.cloudfront.net/assets/common/img/logos/shipping/api/4190@2x.png"
                  alt="Melhor Envio"
                  className="h-6 w-auto bg-white/90 p-1 rounded"
                />
                <img
                  src="https://d26lpennugtm8s.cloudfront.net/assets/common/img/logos/shipping/api/8257@2x.png"
                  alt="Correios"
                  className="h-6 w-auto bg-white/90 p-1 rounded"
                />
              </div>

              <div className="pt-2">
                <img
                  src="https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/rio/img-5153883486201418421-1772823060-1344eb69aefffe07b4aacffe2af21fe91772823060.png?3985396074516041665"
                  alt="Selo Millany Modas"
                  className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment Methods Grid */}
        <div className="pt-10 mt-8 border-t border-brand-border/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PAYMENT_METHODS.filter((method) => {
              if (method.name === 'Pix' && paymentSettings?.pix?.enabled === false) return false;
              if (method.name === 'Boleto' && paymentSettings?.boleto?.enabled === false) return false;
              if (['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex'].includes(method.name)) {
                if (paymentSettings?.creditCard?.enabled === false) return false;
                if (paymentSettings?.creditCard?.acceptedBrands && !paymentSettings.creditCard.acceptedBrands.includes(method.name)) {
                  return false;
                }
              }
              return true;
            }).map((method, i) => (
              <img
                key={i}
                src={method.icon}
                alt={method.name}
                className="h-6 w-auto object-contain bg-white/5 p-1 rounded border border-white/10"
              />
            ))}
          </div>

          {/* Copyright */}
          <div className="text-[11px] text-gray-500 text-center md:text-right flex items-center justify-center md:justify-end gap-2 flex-wrap">
            <p>Copyright Millany Modas - 2026. Todos os direitos reservados.</p>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="text-gray-500 hover:text-brand-gold transition-colors underline"
            >
              Painel Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
