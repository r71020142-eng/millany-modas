import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { formatBRL } from '../utils/masks';
import { isVideoMedia } from '../utils/media';
import { STORE_INFO } from '../data/banners';
import confetti from 'canvas-confetti';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  paymentSettings
}) {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price_number || 0) * (item.quantity || 1),
    0
  );

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'fixed'
      ? Math.min(subtotal, appliedCoupon.value)
      : subtotal * ((appliedCoupon.value || 0) / 100 || (appliedCoupon.discount || 0))
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const availableCoupons = paymentSettings?.coupons || [];
    const found = availableCoupons.find((c) => c.code.toUpperCase() === code && c.active);

    if (found) {
      if (found.minOrder > 0 && subtotal < found.minOrder) {
        setCouponError(`Este cupom requer pedido mínimo de ${formatBRL(found.minOrder)}`);
        return;
      }
      onApplyCoupon({
        code: found.code,
        type: found.type,
        value: found.value,
        name: found.description || `${found.value}${found.type === 'percent' ? '%' : ' R$'} OFF`
      });
      setCouponCode('');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else if (code === 'BEMVINDA10' || code === 'PRIMEIRACOMPRA') {
      onApplyCoupon({ code, type: 'percent', value: 10, name: '10% de Boas-Vindas' });
      setCouponCode('');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-dark border-l border-brand-border flex flex-col justify-between shadow-2xl text-left">
          
          {/* 1. Header */}
          <div className="p-5 border-b border-brand-border flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-rose" />
              <h2 className="text-base font-serif text-white uppercase tracking-wider">
                Sua Sacola ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Benefit Bar */}
          <div className="p-3 bg-brand-card/90 border-b border-brand-border text-center flex items-center justify-center gap-1.5 text-xs text-brand-rose-light">
            <Sparkles className="w-3.5 h-3.5 text-brand-rose" />
            <span>Peças Exclusivas • Finalização Direta no WhatsApp</span>
          </div>

          {/* 3. Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400 space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-brand-border" />
                <p className="text-sm">Sua sacola está vazia.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-brand-rose text-white text-xs uppercase font-bold tracking-wider rounded-lg"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}-${idx}`}
                  className="flex gap-4 p-3 rounded-xl bg-black/40 border border-brand-border/60 hover:border-brand-rose/40 transition-colors"
                >
                  {isVideoMedia(item.images?.[0]) ? (
                    <video
                      src={item.images[0]}
                      muted
                      playsInline
                      className="w-20 h-24 object-cover rounded-lg border border-brand-border/60 flex-shrink-0"
                    />
                  ) : (
                    <img
                      src={item.images?.[0] || 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp'}
                      alt={item.title}
                      className="w-20 h-24 object-cover rounded-lg border border-brand-border/60 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-serif text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                          title="Remover produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Cor: <span className="text-gray-200">{item.color}</span> | Tam: <span className="text-gray-200">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-brand-border rounded bg-black/60">
                        <button
                          onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 text-gray-400 hover:text-white text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-400 hover:text-white text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <span className="text-xs font-bold text-white">
                        {formatBRL((item.price_number || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Footer & Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-brand-border bg-black/70 space-y-3">
              
              {/* Cupom Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Cupom (ex: BEMVINDA10)"
                    className="w-full bg-brand-card text-white text-xs uppercase px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-border hover:bg-brand-rose text-white text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Aplicar
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/50">
                  <div className="flex items-center gap-1.5">
                    <span>Cupom: <strong>{appliedCoupon.code}</strong> ({appliedCoupon.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-{formatBRL(discountAmount)}</span>
                    <button
                      type="button"
                      onClick={() => onApplyCoupon(null)}
                      className="text-gray-400 hover:text-red-400 font-bold px-1"
                      title="Remover cupom"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-400">{couponError}</p>
              )}

              {/* Financial Lines */}
              <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto ({appliedCoupon.code})</span>
                    <span>-{formatBRL(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-brand-rose-light">{formatBRL(total)}</span>
                </div>
                {paymentSettings?.pix?.enabled !== false && (paymentSettings?.pix?.discountPercent || 0) > 0 && (
                  <div className="flex justify-between text-xs text-brand-pix font-medium pt-1">
                    <span>No Pix ({paymentSettings.pix.discountPercent}% OFF)</span>
                    <span>{formatBRL(total * (1 - (paymentSettings.pix.discountPercent || 0) / 100))}</span>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-brand-rose/40 flex items-center justify-center gap-2"
              >
                <span>Finalizar Compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compra 100% Segura & Criptografada</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
