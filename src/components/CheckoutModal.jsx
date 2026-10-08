import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  QrCode,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { STORE_INFO, PAYMENT_METHODS } from '../data/banners';
import {
  formatBRL,
  maskPhone,
  maskCEP,
  maskCPF,
  fetchAddressByCEP,
  formatWhatsAppOrderMessage
} from '../utils/masks';
import { isVideoMedia } from '../utils/media';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  onClearCart,
  onSaveOrderToCRM,
  paymentSettings
}) {
  if (!isOpen) return null;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentSettings?.pix?.enabled !== false ? 'pix' : 'creditCard'
  );
  const [copiedPixKey, setCopiedPixKey] = useState(false);

  // Countdown timer for urgency (15 mins)
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Customer Form State
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: ''
  });

  // Address Form State
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    reference: ''
  });

  const [loadingCEP, setLoadingCEP] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState(null);

  // Auto fetch address when CEP has 8 digits
  const handleCEPChange = async (val) => {
    const masked = maskCEP(val);
    setAddress((prev) => ({ ...prev, cep: masked }));

    const clean = val.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCEP(true);
      const res = await fetchAddressByCEP(clean);
      setLoadingCEP(false);
      if (res) {
        setAddress((prev) => ({
          ...prev,
          street: res.logradouro || prev.street,
          neighborhood: res.bairro || prev.neighborhood,
          city: res.cidade || prev.city,
          state: res.estado || prev.state
        }));
        setErrors((prev) => ({ ...prev, cep: null }));
      } else {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }));
      }
    }
  };

  // Financial calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price_number || 0) * (item.quantity || 1),
    0
  );

  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.type === 'fixed'
      ? Math.min(subtotal, appliedCoupon.value)
      : subtotal * ((appliedCoupon.value || 0) / 100 || (appliedCoupon.discount || 0))
    : 0;

  const pixDiscountPercent =
    selectedPaymentMethod === 'pix' && paymentSettings?.pix?.enabled !== false
      ? paymentSettings?.pix?.discountPercent || 0
      : 0;

  const pixDiscountAmount = ((subtotal - couponDiscountAmount) * pixDiscountPercent) / 100;
  const discountAmount = couponDiscountAmount + pixDiscountAmount;
  const total = Math.max(0, subtotal - discountAmount);

  // Validation
  const validate = () => {
    const errs = {};
    if (!customer.name.trim()) errs.name = 'Por favor, informe seu nome completo';
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Informe um WhatsApp válido com DDD';
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      errs.email = 'Informe um e-mail válido';
    }
    if (!address.cep.trim() || address.cep.replace(/\D/g, '').length !== 8) {
      errs.cep = 'Informe um CEP válido';
    }
    if (!address.street.trim()) errs.street = 'Informe o logradouro / rua';
    if (!address.number.trim()) errs.number = 'Informe o número';
    if (!address.neighborhood.trim()) errs.neighborhood = 'Informe o bairro';
    if (!address.city.trim()) errs.city = 'Informe a cidade';
    if (!address.state.trim()) errs.state = 'UF';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Order -> Redirect to WhatsApp 5531986570126
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    const orderNumber = `MIL-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'Novo Pedido',
      customer,
      address,
      items: cartItems,
      financial: {
        subtotal,
        discount: discountAmount,
        shipping: 0,
        total,
        paymentMethod:
          selectedPaymentMethod === 'pix'
            ? `Pix (${pixDiscountPercent > 0 ? `${pixDiscountPercent}% OFF` : 'Sem desconto'})`
            : selectedPaymentMethod === 'creditCard'
            ? `Cartão de Crédito (até ${paymentSettings?.creditCard?.maxInstallments || 12}x)`
            : 'A combinar no WhatsApp'
      },
      notes: ''
    };

    // Save automatically to Admin CRM
    if (onSaveOrderToCRM) {
      try {
        onSaveOrderToCRM(orderData);
      } catch (err) {
        console.error('Erro ao registrar pedido no CRM:', err);
      }
    }

    setCompletedOrderData(orderData);
    setOrderCompleted(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Format WhatsApp message URL
    const encodedMsg = formatWhatsAppOrderMessage(orderData);
    const targetWhatsApp = STORE_INFO.orderWhatsApp || '553180393768';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetWhatsApp}&text=${encodedMsg}`;

    // Open WhatsApp in new tab / app
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 600);

    // Clear cart
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-5xl max-h-[96vh] overflow-y-auto z-10 shadow-2xl text-left">
        
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 bg-black/95 border-b border-brand-border px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={STORE_INFO.logoUrl}
              alt={STORE_INFO.name}
              className="h-7 sm:h-9 w-auto"
            />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pl-3 border-l border-brand-border">
              <Lock className="w-3.5 h-3.5" /> Checkout Transparente Seguro
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Urgency Timer */}
            <div className="flex items-center gap-1.5 text-xs bg-brand-rose/20 text-brand-rose-light px-3 py-1.5 rounded-full border border-brand-rose/40 font-mono">
              <Clock className="w-3.5 h-3.5 text-brand-rose" />
              <span>Reserva expira em: <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong></span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full bg-brand-card hover:bg-brand-card/80 transition-colors"
              aria-label="Fechar checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {orderCompleted && completedOrderData ? (
          <div className="p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-white">
                Pedido Gerado com Sucesso!
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Número do Pedido: <strong className="text-brand-rose-light font-mono font-bold">#{completedOrderData.orderNumber}</strong>
              </p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-brand-border text-left space-y-3 text-xs text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Cliente:</span>
                <strong className="text-white">{completedOrderData.customer.name}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>WhatsApp:</span>
                <strong className="text-white">{completedOrderData.customer.phone}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Entrega:</span>
                <strong className="text-white">{completedOrderData.address.street}, {completedOrderData.address.number} - {completedOrderData.address.city}/{completedOrderData.address.state}</strong>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 text-white">
                <span>Total a Pagar:</span>
                <span className="text-brand-gold">{formatBRL(completedOrderData.financial.total)}</span>
              </div>
            </div>

            {/* Direct WhatsApp Fallback CTA */}
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-4">
              <p className="text-xs sm:text-sm text-gray-200">
                Se a janela do WhatsApp não abriu automaticamente, clique no botão abaixo para enviar os detalhes do seu pedido para o atendimento oficial:
              </p>

              <a
                href={`https://api.whatsapp.com/send?phone=${STORE_INFO.orderWhatsApp}&text=${formatWhatsAppOrderMessage(completedOrderData)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-brand-whatsapp hover:bg-emerald-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirmar Pedido no WhatsApp (55 31 8039-3768)</span>
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-brand-border text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-brand-rose-light font-bold text-xs uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 text-brand-whatsapp" /> Atendimento Exclusivo no WhatsApp
              </div>
              <p className="text-xs text-gray-300">
                Seus dados foram salvos com sucesso no sistema. Você combinará a forma de pagamento (Pix ou Cartão) e o envio diretamente com nossa atendente.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-white uppercase tracking-wider underline pt-2"
            >
              Voltar para a Página Principal da Loja
            </button>
          </div>
        ) : (
          /* MAIN CHECKOUT FORM */
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              
              {/* Left Column: Form Fields (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. DADOS PESSOAIS */}
                <div className="p-5 rounded-2xl bg-black/40 border border-brand-border/80">
                  <div className="flex items-center gap-2 mb-4 text-brand-rose font-bold text-sm uppercase tracking-wider">
                    <User className="w-4 h-4" /> 1. Dados Pessoais
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-300 font-medium block mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Ex: Maria Silva Oliveira"
                        className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                          errors.name ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                        }`}
                      />
                      {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          WhatsApp / Telefone com DDD *
                        </label>
                        <input
                          type="text"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: maskPhone(e.target.value) })}
                          placeholder="(31) 98888-8888"
                          maxLength={15}
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.phone ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          E-mail para Confirmação *
                        </label>
                        <input
                          type="email"
                          value={customer.email}
                          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                          placeholder="maria@email.com"
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.email ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 font-medium block mb-1">
                        CPF (Opcional - para Nota Fiscal)
                      </label>
                      <input
                        type="text"
                        value={customer.cpf}
                        onChange={(e) => setCustomer({ ...customer, cpf: maskCPF(e.target.value) })}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ENDEREÇO DE ENTREGA */}
                <div className="p-5 rounded-2xl bg-black/40 border border-brand-border/80">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-brand-rose font-bold text-sm uppercase tracking-wider">
                      <MapPin className="w-4 h-4" /> 2. Endereço de Entrega
                    </div>
                    {loadingCEP && (
                      <span className="text-xs text-brand-gold animate-pulse">Buscando CEP...</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          CEP *
                        </label>
                        <input
                          type="text"
                          value={address.cep}
                          onChange={(e) => handleCEPChange(e.target.value)}
                          placeholder="35160-000"
                          maxLength={9}
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.cep ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.cep && <p className="text-[11px] text-red-400 mt-1">{errors.cep}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          Rua / Avenida *
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Ex: Av. Selim José de Sales"
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.street ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.street && <p className="text-[11px] text-red-400 mt-1">{errors.street}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                          placeholder="1557"
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.number ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.number && <p className="text-[11px] text-red-400 mt-1">{errors.number}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          Complemento (Apto, Bloco, etc.)
                        </label>
                        <input
                          type="text"
                          value={address.complement}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Apto 201"
                          className="w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          value={address.neighborhood}
                          onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                          placeholder="Canaã"
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.neighborhood ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.neighborhood && <p className="text-[11px] text-red-400 mt-1">{errors.neighborhood}</p>}
                      </div>

                      <div>
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="Ipatinga"
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none ${
                            errors.city ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.city && <p className="text-[11px] text-red-400 mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="text-xs text-gray-300 font-medium block mb-1">
                          Estado (UF) *
                        </label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                          placeholder="MG"
                          maxLength={2}
                          className={`w-full bg-brand-card text-white text-xs px-3.5 py-2.5 rounded-lg border focus:outline-none uppercase ${
                            errors.state ? 'border-red-500' : 'border-brand-border focus:border-brand-rose'
                          }`}
                        />
                        {errors.state && <p className="text-[11px] text-red-400 mt-1">{errors.state}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. FORMA DE PAGAMENTO & FINALIZAÇÃO */}
                <div className="p-5 rounded-2xl bg-black/40 border border-brand-border/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand-rose font-bold text-sm uppercase tracking-wider">
                      <CreditCard className="w-4 h-4 text-brand-rose" /> 3. Forma de Pagamento
                    </div>
                    <span className="text-[11px] text-gray-400">Escolha como prefere pagar</span>
                  </div>

                  {/* Payment Methods Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Opção Pix */}
                    {paymentSettings?.pix?.enabled !== false && (
                      <div
                        onClick={() => setSelectedPaymentMethod('pix')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === 'pix'
                            ? 'bg-brand-pix/10 border-brand-pix text-white ring-1 ring-brand-pix/40'
                            : 'bg-black/40 border-brand-border hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <QrCode className="w-4 h-4 text-brand-pix" />
                            <span>Pix Instantâneo</span>
                          </div>
                          {(paymentSettings?.pix?.discountPercent || 0) > 0 && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                              {paymentSettings.pix.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {(paymentSettings?.pix?.discountPercent || 0) > 0
                            ? `Aprovação imediata e desconto de ${paymentSettings.pix.discountPercent}% aplicado no pedido.`
                            : 'Aprovação e liberação imediata do seu pedido.'}
                        </p>
                      </div>
                    )}

                    {/* Opção Cartão de Crédito */}
                    {paymentSettings?.creditCard?.enabled !== false && (
                      <div
                        onClick={() => setSelectedPaymentMethod('creditCard')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === 'creditCard'
                            ? 'bg-blue-500/10 border-blue-500 text-white ring-1 ring-blue-500/40'
                            : 'bg-black/40 border-brand-border hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <CreditCard className="w-4 h-4 text-blue-400" />
                            <span>Cartão de Crédito</span>
                          </div>
                          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                            Até {paymentSettings?.creditCard?.maxInstallments || 12}x
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {Number(paymentSettings?.creditCard?.interestFreeInstallments) > 1
                            ? `Parcelamento em até ${paymentSettings?.creditCard?.maxInstallments || 12}x (${paymentSettings?.creditCard?.interestFreeInstallments}x sem juros).`
                            : `Parcelamento em até ${paymentSettings?.creditCard?.maxInstallments || 12}x (1x com juros).`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Informações detalhadas do Pix */}
                  {selectedPaymentMethod === 'pix' && paymentSettings?.pix?.enabled !== false && (
                    <div className="p-4 rounded-xl bg-brand-pix/10 border border-brand-pix/30 space-y-3 animate-fadeIn text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-pix flex items-center gap-1.5">
                          <QrCode className="w-4 h-4" /> Dados para Pagamento via Pix:
                        </span>
                        {pixDiscountPercent > 0 && (
                          <span className="text-emerald-400 font-bold">
                            Economia de {formatBRL(pixDiscountAmount)}
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-black/60 rounded-lg border border-brand-border space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-gray-300">
                          <span>Tipo: <strong className="text-white font-sans">{paymentSettings?.pix?.keyType || 'Telefone'}</strong></span>
                          <span>Banco: <strong className="text-white font-sans">{paymentSettings?.pix?.bank || 'Nubank'}</strong></span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <span className="text-white font-bold text-xs break-all">
                            {paymentSettings?.pix?.key || '3180393768'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(paymentSettings?.pix?.key || '3180393768');
                              setCopiedPixKey(true);
                              setTimeout(() => setCopiedPixKey(false), 2000);
                            }}
                            className="px-2.5 py-1 bg-brand-pix hover:bg-brand-pix/80 text-black text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1 shrink-0 ml-2"
                          >
                            {copiedPixKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedPixKey ? 'Copiado!' : 'Copiar Chave'}</span>
                          </button>
                        </div>
                        {paymentSettings?.pix?.recipient && (
                          <p className="text-[10px] text-gray-400 pt-0.5">
                            Titular: {paymentSettings.pix.recipient}
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-300">
                        {paymentSettings?.pix?.instructions ||
                          'Ao concluir, enviaremos os dados confirmados com comprovante direto no WhatsApp da loja.'}
                      </p>
                    </div>
                  )}

                  {/* Informações detalhadas do Cartão */}
                  {selectedPaymentMethod === 'creditCard' && paymentSettings?.creditCard?.enabled !== false && (
                    <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3 animate-fadeIn text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-300 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-blue-400" /> Pagamento com Cartão de Crédito
                        </span>
                        <span className="text-gray-300 text-[11px]">
                          {Number(paymentSettings?.creditCard?.interestFreeInstallments) > 1
                            ? `Até ${paymentSettings.creditCard.interestFreeInstallments}x sem juros`
                            : '1x com juros'}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-300">
                        {paymentSettings?.creditCard?.instructions ||
                          'O link de pagamento seguro ou máquina de cartão será disponibilizado no atendimento no WhatsApp.'}
                      </p>

                      <div className="flex items-center gap-2 pt-1 border-t border-white/5 flex-wrap">
                        <span className="text-[10px] text-gray-400">Bandeiras:</span>
                        {(paymentSettings?.creditCard?.acceptedBrands || ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex']).map((b) => (
                          <span key={b} className="px-2 py-0.5 bg-black/60 rounded text-[10px] text-gray-300 border border-white/10">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 text-sm">✓</span>
                    <span>Ao clicar em <strong>"CONCLUIR E ENVIAR NO WHATSAPP"</strong>, o pedido com todos os itens, endereço e a forma de pagamento selecionada será enviado diretamente para a nossa equipe.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="p-5 rounded-2xl bg-black/60 border border-brand-border sticky top-20 shadow-xl space-y-4">
                  <h3 className="text-sm font-serif text-white uppercase tracking-wider pb-3 border-b border-brand-border">
                    Resumo do Pedido ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} itens)
                  </h3>

                  {/* Products Mini-list */}
                  <div className="max-h-56 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-xs py-1 border-b border-white/5 last:border-none">
                        {isVideoMedia(item.images?.[0]) ? (
                          <video
                            src={item.images[0]}
                            muted
                            playsInline
                            className="w-12 h-14 object-cover rounded-md border border-brand-border flex-shrink-0"
                          />
                        ) : (
                          <img
                            src={item.images?.[0] || 'https://dcdn-us.mitiendanube.com/stores/007/383/278/themes/common/logo-5750615331560322054-1772765030-b58e30fa0945ba0392e06afb0e2901951772765030-480-0.webp'}
                            alt={item.title}
                            className="w-12 h-14 object-cover rounded-md border border-brand-border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-serif text-white line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-gray-400">
                            {item.quantity}x | {item.color} | {item.size}
                          </p>
                          <p className="font-bold text-gray-200 mt-0.5">
                            {formatBRL((item.price_number || 0) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 text-xs text-gray-300 pt-3 border-t border-brand-border">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatBRL(subtotal)}</span>
                    </div>

                    {couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Cupom ({appliedCoupon?.code})</span>
                        <span>-{formatBRL(couponDiscountAmount)}</span>
                      </div>
                    )}

                    {pixDiscountAmount > 0 && (
                      <div className="flex justify-between text-brand-pix">
                        <span>Desconto no Pix ({pixDiscountPercent}% OFF)</span>
                        <span>-{formatBRL(pixDiscountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                      <span>Total Geral</span>
                      <span className="text-brand-rose-light">{formatBRL(total)}</span>
                    </div>
                  </div>

                  {/* BIG HIGH-CONVERTING CTA BUTTON */}
                  <div className="pt-2">
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-4 px-6 bg-brand-whatsapp hover:bg-emerald-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl hover:shadow-brand-whatsapp/30 flex items-center justify-center gap-2.5 text-xs sm:text-sm group"
                    >
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>CONCLUIR E ENVIAR NO WHATSAPP</span>
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2">
                      Seus dados serão salvos e você será direcionada para o WhatsApp oficial com o pedido pronto!
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-4 border-t border-white/5 space-y-2 text-[11px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Garantia de 7 dias para troca ou devolução sem burocracia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-brand-rose flex-shrink-0" />
                      <span>Envio com código de rastreamento pelos Correios</span>
                    </div>
                  </div>

                  {/* Payment Icons */}
                  <div className="pt-3 flex items-center justify-center gap-2 flex-wrap opacity-75">
                    {PAYMENT_METHODS.map((p, i) => (
                      <img key={i} src={p.icon} alt={p.name} className="h-5 w-auto object-contain" />
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
