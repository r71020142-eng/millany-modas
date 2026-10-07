import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertTriangle,
  MessageCircle,
  Phone,
  MapPin,
  Percent,
  Truck,
  PauseCircle,
  PlayCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { DEFAULT_STORE_STATUS } from '../../data/storeStatus';

export default function AdminSettings({
  storeInfo,
  onSaveStoreInfo,
  onExportData,
  onImportData,
  onResetAllData,
  storeStatus = DEFAULT_STORE_STATUS,
  onSaveStoreStatus
}) {
  const [formData, setFormData] = useState({ ...storeInfo });
  const [statusData, setStatusData] = useState({ ...DEFAULT_STORE_STATUS, ...storeStatus });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusSavedSuccess, setStatusSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveStoreInfo(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (onSaveStoreStatus) {
      onSaveStoreStatus(statusData);
    }
    setStatusSavedSuccess(true);
    setTimeout(() => setStatusSavedSuccess(false), 2500);
  };

  const handleTogglePause = (newPausedState) => {
    const updated = {
      ...statusData,
      isPaused: newPausedState,
      pausedAt: newPausedState ? new Date().toISOString() : null
    };
    setStatusData(updated);
    if (onSaveStoreStatus) {
      onSaveStoreStatus(updated);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportData(json);
        alert('Dados importados com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* 0. PAUSE STORE / MAINTENANCE MODE SECTION */}
      <div
        className={`p-6 rounded-2xl border transition-all shadow-xl ${
          statusData.isPaused
            ? 'bg-amber-950/30 border-amber-500/50'
            : 'bg-brand-card border-brand-border'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-brand-border/60 gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-2xl ${
                statusData.isPaused
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {statusData.isPaused ? (
                <PauseCircle className="w-6 h-6" />
              ) : (
                <PlayCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif text-white font-bold">
                  Status da Loja: {statusData.isPaused ? 'Pausada (Em Manutenção)' : 'Aberta ao Público (Online)'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    statusData.isPaused
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {statusData.isPaused ? 'Visitantes Bloqueados' : '100% Online'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {statusData.isPaused
                  ? 'A loja está oculta para visitantes comuns. Apenas você (administrador logado) pode navegar e adicionar produtos com calma.'
                  : 'Sua vitrine está aberta e todos os visitantes podem navegar e comprar.'}
              </p>
            </div>
          </div>

          {/* Quick Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTogglePause(!statusData.isPaused)}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg flex items-center gap-2 ${
                statusData.isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {statusData.isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Reativar Loja</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>Pausar Loja Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Customized Maintenance Message Form */}
        <form onSubmit={handleStatusSubmit} className="pt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Título do Aviso de Pausa
              </label>
              <input
                type="text"
                value={statusData.pausedTitle}
                onChange={(e) => setStatusData({ ...statusData, pausedTitle: e.target.value })}
                placeholder="Ex: Estamos preparando novidades! ✨"
                className="w-full bg-brand-dark text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Previsão de Retorno (opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={statusData.estimatedReturn}
                  onChange={(e) => setStatusData({ ...statusData, estimatedReturn: e.target.value })}
                  placeholder="Ex: Voltamos hoje às 18h / Em instantes"
                  className="w-full bg-brand-dark text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none pl-9"
                />
                <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Mensagem explicativa para os clientes
            </label>
            <textarea
              rows={2}
              value={statusData.pausedMessage}
              onChange={(e) => setStatusData({ ...statusData, pausedMessage: e.target.value })}
              placeholder="Ex: Nossa loja virtual está temporariamente pausada para atualização de estoque..."
              className="w-full bg-brand-dark text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-400">
              * Visitantes verão estes textos e botões diretos para seu WhatsApp e Instagram.
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-card hover:bg-white/10 text-white rounded-lg border border-brand-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {statusSavedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-brand-rose" />}
              <span>{statusSavedSuccess ? 'Mensagem Salva!' : 'Salvar Textos de Pausa'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 1. Store Config Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div>
            <h3 className="text-base font-serif text-white font-bold">
              Configurações Gerais da Loja
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Altere os números de WhatsApp, regras de frete e dados da empresa.
            </p>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Salvo!' : 'Salvar Alterações'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* WhatsApp de Pedidos */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-brand-whatsapp" />
              WhatsApp de Recebimento de Pedidos (com DDI e DDD) *
            </label>
            <input
              type="text"
              value={formData.orderWhatsApp}
              onChange={(e) => setFormData({ ...formData, orderWhatsApp: e.target.value.replace(/\D/g, '') })}
              placeholder="553180393768"
              required
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Para onde os pedidos do checkout serão encaminhados automaticamente.
            </p>
          </div>

          {/* WhatsApp / Telefone de Suporte */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-brand-rose" />
              Telefone / WhatsApp de Atendimento
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(31) 8039-3768"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Exibido no rodapé e no modal de atendimento.
            </p>
          </div>

          {/* Frete Grátis Threshold */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-gold" />
              Valor Mínimo para Frete Grátis (R$)
            </label>
            <input
              type="number"
              step="1"
              value={formData.freeShippingThreshold}
              onChange={(e) => setFormData({ ...formData, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              placeholder="299"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Valor para desbloquear frete grátis na sacola e no checkout.
            </p>
          </div>

          {/* Desconto Pix */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2">
            <label className="text-gray-300 font-semibold flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-brand-pix" />
              Desconto no Pix (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.pixDiscountPercent}
              onChange={(e) => setFormData({ ...formData, pixDiscountPercent: parseFloat(e.target.value) || 0 })}
              placeholder="1"
              className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Percentual descontado automaticamente quando o cliente escolhe Pix.
            </p>
          </div>
        </div>

        {/* Endereço */}
        <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 text-xs">
          <label className="text-gray-300 font-semibold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-rose" />
            Endereço Completo da Loja Física
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Av. Selim José de Sales, 1557 - Canaã, Ipatinga - MG"
            className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
          />
        </div>

        {/* Logo URL */}
        <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-2 text-xs">
          <label className="text-gray-300 font-semibold block">
            URL do Logotipo da Loja (PNG ou WebP transparente)
          </label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://..."
            className="w-full bg-brand-card text-white px-3.5 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
          />
        </div>
      </form>

      {/* 2. Backup & Restauração */}
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-4">
        <h3 className="text-base font-serif text-white font-bold">
          Backup, Exportação e Restauração
        </h3>
        <p className="text-xs text-gray-400">
          Faça download de todo o seu catálogo atual ou restaure os dados originais quando desejar.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={onExportData}
            className="px-4 py-2.5 bg-black hover:bg-brand-border text-white text-xs font-semibold rounded-xl border border-brand-border transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-gold" />
            <span>Exportar Dados (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="px-4 py-2.5 bg-black hover:bg-brand-border text-white text-xs font-semibold rounded-xl border border-brand-border transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-brand-rose" />
            <span>Importar Dados (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset Factory */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  'ATENÇÃO: Deseja restaurar os 39 produtos e banners originais da Millany Modas? Qualquer alteração feita será resetada.'
                )
              ) {
                onResetAllData();
              }
            }}
            className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold rounded-xl border border-red-800/50 transition-colors flex items-center gap-2 ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Restaurar Catálogo Original (39 Produtos)</span>
          </button>
        </div>
      </div>

    </div>
  );
}
