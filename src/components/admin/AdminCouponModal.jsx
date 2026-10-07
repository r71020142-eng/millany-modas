import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles, Check, Percent, DollarSign, AlertCircle } from 'lucide-react';
import { formatBRL } from '../../utils/masks';

export default function AdminCouponModal({
  isOpen,
  onClose,
  couponToEdit,
  existingCoupons = [],
  onSaveCoupon
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(couponToEdit && couponToEdit.id);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percent', // 'percent' | 'fixed'
    value: 10,
    minOrder: 0,
    description: '',
    active: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (couponToEdit) {
      setFormData({
        code: couponToEdit.code || '',
        type: couponToEdit.type || 'percent',
        value: couponToEdit.value ?? 10,
        minOrder: couponToEdit.minOrder ?? 0,
        description: couponToEdit.description || '',
        active: couponToEdit.active !== false
      });
    } else {
      setFormData({
        code: '',
        type: 'percent',
        value: 10,
        minOrder: 0,
        description: '',
        active: true
      });
    }
    setError('');
  }, [couponToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase().replace(/\s+/g, '');

    if (!cleanCode) {
      setError('Por favor, informe um código para o cupom.');
      return;
    }

    // Check duplicate code (excluding current edited coupon)
    const duplicate = existingCoupons.some(
      (c) => c.code.toUpperCase() === cleanCode && (!isEditing || c.id !== couponToEdit.id)
    );

    if (duplicate) {
      setError(`Já existe outro cupom cadastrado com o código "${cleanCode}".`);
      return;
    }

    const val = parseFloat(formData.value) || 0;
    if (val <= 0) {
      setError('O valor do desconto deve ser maior que zero.');
      return;
    }

    if (formData.type === 'percent' && val > 90) {
      setError('O percentual de desconto não pode ser superior a 90%.');
      return;
    }

    const savedCoupon = {
      id: isEditing ? couponToEdit.id : `cp_${Date.now()}`,
      code: cleanCode,
      type: formData.type,
      value: val,
      minOrder: parseFloat(formData.minOrder) || 0,
      description:
        formData.description.trim() ||
        `${val}${formData.type === 'percent' ? '%' : ' R$'} de desconto`,
      active: formData.active
    };

    onSaveCoupon(savedCoupon);
    onClose();
  };

  // Simulation calculation
  const sampleOrder = 150.00;
  const sampleDiscount =
    formData.type === 'fixed'
      ? Math.min(sampleOrder, formData.value || 0)
      : (sampleOrder * (formData.value || 0)) / 100;
  const sampleFinal = Math.max(0, sampleOrder - sampleDiscount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-lg p-6 sm:p-8 z-10 shadow-2xl text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-brand-card transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-brand-border">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif text-white font-bold">
              {isEditing ? `Editar Cupom: ${couponToEdit.code}` : 'Criar Novo Cupom de Desconto'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditing
                ? 'Altere o código, percentual ou regras de uso deste cupom.'
                : 'Defina o código e o valor de desconto para seus clientes.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-5 space-y-4 text-xs">
          {/* Código do Cupom */}
          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Código do Cupom (o que o cliente digita no carrinho) *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                setError('');
              }}
              placeholder="EX: BEMVINDA10, VERAO15, MILLANY20"
              required
              className="w-full bg-brand-card text-white font-mono uppercase text-sm px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Letras e números sem espaços. Exemplo: PRIMEIROAPEDIDO, PROMO10.
            </p>
          </div>

          {/* Tipo e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Tipo de Desconto *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none cursor-pointer"
              >
                <option value="percent">Porcentagem (% OFF)</option>
                <option value="fixed">Valor Fixo em Reais (R$ OFF)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                {formData.type === 'percent' ? 'Valor do Desconto (%) *' : 'Valor do Desconto (R$) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={formData.type === 'percent' ? '1' : '0.5'}
                  min="1"
                  max={formData.type === 'percent' ? '90' : '9999'}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                  }
                  required
                  placeholder={formData.type === 'percent' ? '10' : '20'}
                  className="w-full bg-brand-card text-white font-mono px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none pr-10"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 font-bold">
                  {formData.type === 'percent' ? '%' : 'R$'}
                </span>
              </div>
            </div>
          </div>

          {/* Pedido Mínimo */}
          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Valor Mínimo do Pedido (R$)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.minOrder}
              onChange={(e) =>
                setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })
              }
              placeholder="0 (deixe 0 para não exigir valor mínimo)"
              className="w-full bg-brand-card text-white font-mono px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              O cupom só será aplicado se o total dos produtos for igual ou maior que este valor.
            </p>
          </div>

          {/* Descrição Amigável */}
          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Descrição / Mensagem do Cupom
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: 10% de desconto especial para novas clientes"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>

          {/* Status Ativo / Inativo */}
          <div className="p-3 rounded-xl bg-black/40 border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-gray-300 font-semibold block">Status do Cupom</span>
              <span className="text-[11px] text-gray-400">
                {formData.active
                  ? 'Cupom ativo e pronto para uso no carrinho.'
                  : 'Cupom pausado (clientes não poderão usá-lo).'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, active: !formData.active })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                formData.active
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}
            >
              {formData.active ? '🟢 Ativo' : '🔴 Pausado'}
            </button>
          </div>

          {/* Simulador em tempo real */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulação em Tempo Real</span>
            </div>
            <p className="text-xs text-gray-300">
              Numa compra de <strong className="text-white">{formatBRL(sampleOrder)}</strong>:
            </p>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20">
              <span className="text-gray-400">Desconto aplicado:</span>
              <span className="font-bold text-emerald-400">- {formatBRL(sampleDiscount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white">Total com o cupom:</span>
              <span className="text-white text-sm">{formatBRL(sampleFinal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-brand-card hover:bg-white/10 text-gray-300 rounded-xl border border-brand-border transition-colors font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Cupom' : 'Criar Cupom'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
