import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Percent,
  Tag,
  Plus,
  Trash2,
  Check,
  Save,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { formatBRL } from '../../utils/masks';

const AVAILABLE_BRANDS = ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex', 'Diners'];

export default function AdminPaymentSettings({
  paymentSettings,
  onSavePaymentSettings
}) {
  const [settings, setSettings] = useState(JSON.parse(JSON.stringify(paymentSettings)));
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Coupon Form state
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percent',
    value: 10,
    minOrder: 0,
    description: '',
    active: true
  });

  // Submit main form
  const handleSave = (e) => {
    e.preventDefault();
    onSavePaymentSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Toggle brand
  const handleToggleBrand = (brand) => {
    setSettings((prev) => {
      const current = prev.creditCard.acceptedBrands || [];
      const updated = current.includes(brand)
        ? current.filter((b) => b !== brand)
        : [...current, brand];
      return {
        ...prev,
        creditCard: {
          ...prev.creditCard,
          acceptedBrands: updated
        }
      };
    });
  };

  // Coupon Actions
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    const codeClean = newCoupon.code.trim().toUpperCase().replace(/\s+/g, '');
    const exists = settings.coupons.some((c) => c.code === codeClean);
    if (exists) {
      alert('Já existe um cupom com este código!');
      return;
    }

    const created = {
      id: `cp_${Date.now()}`,
      code: codeClean,
      type: newCoupon.type,
      value: parseFloat(newCoupon.value) || 0,
      minOrder: parseFloat(newCoupon.minOrder) || 0,
      description: newCoupon.description.trim() || `${newCoupon.value}${newCoupon.type === 'percent' ? '%' : ' R$'} de desconto`,
      active: true
    };

    setSettings((prev) => ({
      ...prev,
      coupons: [...prev.coupons, created]
    }));

    setNewCoupon({
      code: '',
      type: 'percent',
      value: 10,
      minOrder: 0,
      description: '',
      active: true
    });
    setIsAddingCoupon(false);
  };

  const handleToggleCoupon = (id) => {
    setSettings((prev) => ({
      ...prev,
      coupons: prev.coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    }));
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm('Tem certeza que deseja remover este cupom?')) {
      setSettings((prev) => ({
        ...prev,
        coupons: prev.coupons.filter((c) => c.id !== id)
      }));
    }
  };

  // Preview simulations
  const previewSamplePrice = 120.00;
  const pixDiscountVal = (previewSamplePrice * (settings.pix.discountPercent || 0)) / 100;
  const pixFinal = Math.max(0, previewSamplePrice - pixDiscountVal);

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-brand-card border border-brand-border shadow-xl">
        <div>
          <h2 className="text-lg font-serif text-white font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-rose" />
            Formas de Pagamento, Parcelamento & Descontos
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Personalize as taxas do Pix, regras de parcelamento do cartão e cupons de desconto ativos na loja virtual.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* 1. SEÇÃO PIX */}
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-pix/20 border border-brand-pix/40 flex items-center justify-center text-brand-pix">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif text-white font-bold flex items-center gap-2">
                1. Pagamento via Pix & Desconto Automático
              </h3>
              <p className="text-xs text-gray-400">
                Configure a chave Pix e o percentual de desconto concedido na compra à vista.
              </p>
            </div>
          </div>

          {/* Toggle Pix */}
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                pix: { ...prev.pix, enabled: !prev.pix.enabled }
              }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              settings.pix.enabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {settings.pix.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{settings.pix.enabled ? 'Pix Ativado' : 'Pix Desativado'}</span>
          </button>
        </div>

        {/* Pix Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Desconto Pix % */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-1">
            <label className="text-gray-300 font-semibold flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-brand-pix" />
              Desconto no Pix (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={settings.pix.discountPercent}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    pix: { ...prev.pix, discountPercent: parseFloat(e.target.value) || 0 }
                  }))
                }
                className="w-full bg-brand-card text-white text-sm font-mono px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-gray-400 font-bold">%</span>
            </div>
            
            {/* Simulation Preview */}
            <div className="p-2.5 rounded-lg bg-brand-pix/10 border border-brand-pix/30 text-[11px] text-gray-300 space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Peça de {formatBRL(previewSamplePrice)}:</span>
                <strong className="text-brand-pix">{formatBRL(pixFinal)}</strong>
              </div>
              <p className="text-[10px] text-gray-400">
                Economia de {formatBRL(pixDiscountVal)} ({settings.pix.discountPercent}% OFF)
              </p>
            </div>
          </div>

          {/* Tipo de Chave */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-1">
            <label className="text-gray-300 font-semibold block">
              Tipo de Chave Pix *
            </label>
            <select
              value={settings.pix.keyType}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, keyType: e.target.value }
                }))
              }
              className="w-full bg-brand-card text-white px-3 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            >
              <option value="Telefone">Telefone / Celular</option>
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="E-mail">E-mail</option>
              <option value="Aleatória">Chave Aleatória (EVP)</option>
            </select>
            <p className="text-[10px] text-gray-400">
              Identificador da chave informada ao cliente.
            </p>
          </div>

          {/* Chave Pix */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-1">
            <label className="text-gray-300 font-semibold block">
              Chave Pix Cadastrada *
            </label>
            <input
              type="text"
              value={settings.pix.key}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, key: e.target.value }
                }))
              }
              placeholder="31986570126"
              className="w-full bg-brand-card text-white font-mono px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
            <p className="text-[10px] text-gray-400">
              Chave para cópia rápida no checkout e WhatsApp.
            </p>
          </div>

          {/* Titular */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-1">
            <label className="text-gray-300 font-semibold block">
              Nome do Titular / Beneficiário *
            </label>
            <input
              type="text"
              value={settings.pix.recipient}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, recipient: e.target.value }
                }))
              }
              placeholder="Millany Modas / Rayane Pires"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>

          {/* Banco / Instituição */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-1">
            <label className="text-gray-300 font-semibold block">
              Instituição Financeira / Banco
            </label>
            <input
              type="text"
              value={settings.pix.bank}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, bank: e.target.value }
                }))
              }
              placeholder="Nubank / Mercado Pago"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>

          {/* Cidade */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-1">
            <label className="text-gray-300 font-semibold block">
              Cidade do Titular
            </label>
            <input
              type="text"
              value={settings.pix.city}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, city: e.target.value }
                }))
              }
              placeholder="Ipatinga - MG"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>

          {/* Instruções do Pix */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-3">
            <label className="text-gray-300 font-semibold block">
              Mensagem / Instruções do Pix para o Cliente
            </label>
            <input
              type="text"
              value={settings.pix.instructions}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, instructions: e.target.value }
                }))
              }
              placeholder="Após realizar a transferência ou envio do comprovante, seu pedido será separado imediatamente."
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO CARTÃO DE CRÉDITO */}
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif text-white font-bold flex items-center gap-2">
                2. Cartão de Crédito, Parcelamento & Juros
              </h3>
              <p className="text-xs text-gray-400">
                Defina o número de parcelas sem juros, parcelamento máximo e bandeiras aceitas.
              </p>
            </div>
          </div>

          {/* Toggle Cartão */}
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                creditCard: { ...prev.creditCard, enabled: !prev.creditCard.enabled }
              }))
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              settings.creditCard.enabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {settings.creditCard.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{settings.creditCard.enabled ? 'Cartão Ativado' : 'Cartão Desativado'}</span>
          </button>
        </div>

        {/* Credit Card Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Parcelamento Máximo */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold block">
              Máximo de Parcelas *
            </label>
            <select
              value={settings.creditCard.maxInstallments}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  creditCard: {
                    ...prev.creditCard,
                    maxInstallments: parseInt(e.target.value) || 12
                  }
                }))
              }
              className="w-full bg-brand-card text-white px-3 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <option key={n} value={n}>
                  Em até {n}x
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400">
              Número máximo de vezes exibido nos cards e na página do produto.
            </p>
          </div>

          {/* Parcelas Sem Juros */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold block">
              Parcelas Sem Juros *
            </label>
            <select
              value={settings.creditCard.interestFreeInstallments}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  creditCard: {
                    ...prev.creditCard,
                    interestFreeInstallments: parseInt(e.target.value) || 1
                  }
                }))
              }
              className="w-full bg-brand-card text-white px-3 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none font-medium text-brand-gold"
            >
              <option value={1}>1x (Somente à vista sem juros)</option>
              <option value={2}>Até 2x sem juros</option>
              <option value={3}>Até 3x sem juros (Recomendado)</option>
              <option value={4}>Até 4x sem juros</option>
              <option value={5}>Até 5x sem juros</option>
              <option value={6}>Até 6x sem juros</option>
              <option value={10}>Até 10x sem juros</option>
              <option value={12}>Até 12x sem juros (Todas sem juros)</option>
            </select>
            <p className="text-[10px] text-gray-400">
              Quantas parcelas o lojista absorve sem cobrar taxa do cliente.
            </p>
          </div>

          {/* Taxa de Juros Mensal (% a.m.) */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold block">
              Juros para Parcelas Excedentes (% a.m.)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                value={settings.creditCard.monthlyInterestRate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    creditCard: {
                      ...prev.creditCard,
                      monthlyInterestRate: parseFloat(e.target.value) || 0
                    }
                  }))
                }
                className="w-full bg-brand-card text-white font-mono px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-gray-400 font-bold">%</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Aplicado a partir da {settings.creditCard.interestFreeInstallments + 1}ª parcela.
            </p>
          </div>

          {/* Bandeiras Aceitas */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-3 sm:col-span-3">
            <label className="text-gray-300 font-semibold block">
              Bandeiras de Cartão Aceitas na Loja:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_BRANDS.map((brand) => {
                const active = settings.creditCard.acceptedBrands?.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleToggleBrand(brand)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${
                      active
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-brand-card border-brand-border text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? 'bg-blue-400' : 'bg-gray-600'}`} />
                    <span>{brand}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instruções do Cartão */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 sm:col-span-3">
            <label className="text-gray-300 font-semibold block">
              Instruções de Pagamento com Cartão
            </label>
            <input
              type="text"
              value={settings.creditCard.instructions}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  creditCard: { ...prev.creditCard, instructions: e.target.value }
                }))
              }
              placeholder="Link de pagamento seguro ou máquina de cartão combinado diretamente no WhatsApp."
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO CUPONS DE DESCONTO */}
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif text-white font-bold flex items-center gap-2">
                3. Cupons Promocionais de Desconto ({settings.coupons.length})
              </h3>
              <p className="text-xs text-gray-400">
                Crie cupons como BEMVINDA10, PRIMEIRACOMPRA ou cupons em valor fixo (R$).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCoupon(!isAddingCoupon)}
            className="px-4 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingCoupon ? 'Fechar' : 'Novo Cupom'}</span>
          </button>
        </div>

        {/* Formulário Novo Cupom */}
        {isAddingCoupon && (
          <form
            onSubmit={handleAddCoupon}
            className="p-5 rounded-xl bg-black/60 border border-emerald-500/40 space-y-4 animate-fadeIn"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Cadastrar Novo Cupom Promocional
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="EX: VERAO15"
                  required
                  className="w-full bg-brand-card text-white font-mono uppercase px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Tipo de Desconto *
                </label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                  className="w-full bg-brand-card text-white px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                >
                  <option value="percent">Porcentagem (% OFF)</option>
                  <option value="fixed">Valor Fixo (R$ OFF)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Valor do Desconto *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                  placeholder={newCoupon.type === 'percent' ? '10' : '20'}
                  required
                  className="w-full bg-brand-card text-white font-mono px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Pedido Mínimo (R$)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={newCoupon.minOrder}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: parseFloat(e.target.value) || 0 })}
                  placeholder="0 (sem mínimo)"
                  className="w-full bg-brand-card text-white font-mono px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-gray-300 font-semibold block mb-1">
                  Descrição Amigável
                </label>
                <input
                  type="text"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="Ex: 15% de desconto especial de verão"
                  className="w-full bg-brand-card text-white px-3 py-2 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tabela de Cupons */}
        <div className="rounded-xl border border-brand-border overflow-hidden bg-black/40">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-brand-border font-semibold">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Desconto</th>
                <th className="py-3 px-4">Pedido Mínimo</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {settings.coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Nenhum cupom cadastrado. Clique em "+ Novo Cupom" acima.
                  </td>
                </tr>
              ) : (
                settings.coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-brand-card/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      <span className="px-2 py-0.5 rounded bg-brand-card border border-brand-border">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">
                      {coupon.type === 'percent' ? `${coupon.value}% OFF` : `${formatBRL(coupon.value)} OFF`}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {coupon.minOrder > 0 ? formatBRL(coupon.minOrder) : <span className="text-gray-500">Sem mínimo</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[11px]">
                      {coupon.description}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(coupon.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          coupon.active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border-red-500/40'
                        }`}
                      >
                        {coupon.active ? 'Ativo' : 'Pausado'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1.5 bg-brand-card hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-colors border border-brand-border"
                        title="Excluir cupom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
