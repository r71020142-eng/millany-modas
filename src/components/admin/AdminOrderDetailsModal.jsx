import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  QrCode,
  Truck,
  Copy,
  Check,
  MessageCircle,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatBRL } from '../../utils/masks';
import { isVideoMedia } from '../../utils/media';
import { STORE_INFO } from '../../data/banners';

const STATUS_OPTIONS = [
  { value: 'Novo Pedido', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  { value: 'Aguardando Pagamento', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  { value: 'Confirmado / Pago', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  { value: 'Em Separação', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  { value: 'Enviado', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
  { value: 'Entregue', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
  { value: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/40' }
];

export default function AdminOrderDetailsModal({
  isOpen,
  onClose,
  order,
  onUpdateOrderStatus,
  onUpdateOrderNotes
}) {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState(order.status || 'Novo Pedido');
  const [internalNotes, setInternalNotes] = useState(order.notes || '');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);

  const customer = order.customer || {};
  const address = order.address || {};
  const financial = order.financial || {};
  const items = order.items || [];

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    onUpdateOrderStatus(order.id, newStatus);
  };

  const handleSaveNotes = () => {
    onUpdateOrderNotes(order.id, internalNotes);
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2000);
  };

  const handleCopyShippingLabel = () => {
    const label = `DESTINATÁRIO: ${customer.name || ''}
ENDEREÇO: ${address.street || ''}, ${address.number || ''} ${address.complement ? '- ' + address.complement : ''}
BAIRRO: ${address.neighborhood || ''}
CIDADE/UF: ${address.city || ''} - ${address.state || ''}
CEP: ${address.cep || ''}
TELEFONE: ${customer.phone || ''}`;
    navigator.clipboard.writeText(label);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const sendWhatsAppQuickMsg = (type) => {
    const rawPhone = (customer.phone || '').replace(/\D/g, '');
    if (!rawPhone) return;

    const phoneFormatted = rawPhone.length <= 11 ? '55' + rawPhone : rawPhone;
    let msg = '';

    if (type === 'confirm') {
      msg = `Olá ${customer.name}! Tudo bem? Sou da Millany Modas. 🌸
Recebemos o seu pedido #${order.orderNumber} em nosso sistema no valor de ${formatBRL(financial.total)}.
Gostaria de confirmar seus dados para envio! ✨`;
    } else if (type === 'pix') {
      msg = `Olá ${customer.name}! Tudo bem? Aqui é da Millany Modas. 🌸
Para confirmar seu pedido #${order.orderNumber}, segue a chave Pix oficial:
*Chave Pix:* 3180393768 (Telefone)
*Valor:* ${formatBRL(financial.total)}

Assim que efetuar o pagamento, nos envie o comprovante por aqui! ✨`;
    } else if (type === 'tracking') {
      msg = `Olá ${customer.name}! Tudo bem? 🛍️
Seu pedido #${order.orderNumber} da Millany Modas foi embalado com muito carinho e já está a caminho! 🚚
Em breve atualizaremos com o código de rastreamento. Muito obrigada pela preferência! ✨`;
    }

    window.open(`https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn text-left">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-4xl max-h-[94vh] overflow-y-auto z-10 shadow-2xl">
        
        {/* Top Header */}
        <div className="sticky top-0 bg-brand-dark/95 border-b border-brand-border px-6 py-4 flex items-center justify-between z-20">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-serif text-white uppercase tracking-wider">
                Pedido #{order.orderNumber}
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Cliente: <strong className="text-white">{customer.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {order.stockDeducted && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1" title="Estoque dos produtos deste pedido foi baixado automaticamente">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Estoque Baixado</span>
              </span>
            )}

            {/* Status Selector */}
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-brand-card text-white text-xs px-3 py-1.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none cursor-pointer font-bold"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full bg-brand-card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick WhatsApp Actions */}
          <div className="p-4 rounded-xl bg-brand-card border border-brand-border space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-brand-whatsapp" />
              Ações Rápidas no WhatsApp do Cliente:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => sendWhatsAppQuickMsg('confirm')}
                className="px-3 py-1.5 bg-brand-whatsapp/20 hover:bg-brand-whatsapp text-white rounded-lg text-xs font-semibold border border-brand-whatsapp/40 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-whatsapp" />
                <span>Confirmar Pedido</span>
              </button>
              <button
                onClick={() => sendWhatsAppQuickMsg('pix')}
                className="px-3 py-1.5 bg-brand-pix/20 hover:bg-brand-pix text-white rounded-lg text-xs font-semibold border border-brand-pix/40 transition-colors flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-brand-pix" />
                <span>Enviar Cobrança Pix</span>
              </button>
              <button
                onClick={() => sendWhatsAppQuickMsg('tracking')}
                className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold border border-cyan-500/40 transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Avisar de Envio</span>
              </button>
            </div>
          </div>

          {/* Grid: Customer Info & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Customer Dossier */}
            <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-brand-rose flex items-center gap-1.5">
                <User className="w-4 h-4" /> Dados Pessoais do Cliente
              </h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Nome:</span>
                  <strong className="text-white">{customer.name}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${(customer.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-whatsapp font-bold hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">E-mail:</span>
                  <span className="text-white">{customer.email}</span>
                </div>
                {customer.cpf && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">CPF:</span>
                    <span className="text-white font-mono">{customer.cpf}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold uppercase tracking-wider text-brand-rose flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Endereço de Entrega
                </h3>
                <button
                  onClick={handleCopyShippingLabel}
                  className="px-2.5 py-1 bg-brand-card hover:bg-brand-rose text-white rounded text-[11px] font-semibold border border-brand-border transition-colors flex items-center gap-1"
                  title="Copiar etiqueta de envio"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAddress ? 'Copiado!' : 'Copiar Etiqueta'}</span>
                </button>
              </div>

              <div className="space-y-1.5 text-gray-300 leading-relaxed">
                <p>
                  <strong className="text-white">{address.street}, {address.number}</strong>
                  {address.complement ? ` (${address.complement})` : ''}
                </p>
                <p>Bairro: <span className="text-white">{address.neighborhood}</span></p>
                <p>Cidade: <span className="text-white">{address.city} - {address.state}</span></p>
                <p>CEP: <span className="text-brand-gold font-mono">{address.cep}</span></p>
                {address.reference && (
                  <p className="text-[11px] text-gray-400 italic">Ref: {address.reference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Products List in this Order */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
              Itens Comprados ({items.reduce((acc, i) => acc + (i.quantity || 1), 0)} itens)
            </h3>

            <div className="divide-y divide-white/5 text-xs">
              {items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <h4 className="font-serif text-white font-medium">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Cor: <span className="text-white">{item.color || 'Padrão'}</span> | Tam: <span className="text-white">{item.size || 'Tamanho Único'}</span>
                      </p>
                      <span className="text-[11px] text-gray-400">
                        {item.quantity}x de {formatBRL(item.price_number)}
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-white text-sm">
                    {formatBRL((item.price_number || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-brand-border space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatBRL(financial.subtotal)}</span>
              </div>
              {financial.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descontos:</span>
                  <span>-{formatBRL(financial.discount)}</span>
                </div>
              )}
              {financial.shipping > 0 && (
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>{formatBRL(financial.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total a Pagar:</span>
                <span className="text-brand-rose-light">{formatBRL(financial.total)}</span>
              </div>
              <div className="text-[11px] text-gray-400 pt-1">
                Forma de Pagamento: <strong className="text-white uppercase">{financial.paymentMethod === 'pix' ? 'Pix (com Desconto)' : financial.paymentMethod === 'credit' || financial.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'A combinar no WhatsApp'}</strong>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="p-4 rounded-xl bg-black/40 border border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-gold" /> Observações Internas (Apenas para Administrador)
              </h3>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-brand-rose hover:bg-brand-rose-dark text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                {savedNotes ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedNotes ? 'Salvo!' : 'Salvar Nota'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Ex: Cliente solicitou entrega rápida; confirmou pagamento Pix por comprovante às 14h..."
              className="w-full bg-brand-card text-white text-xs p-3 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
