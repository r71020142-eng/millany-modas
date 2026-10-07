import React from 'react';
import { X, MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { STORE_INFO } from '../data/banners';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-lg p-6 sm:p-8 z-10 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-brand-card transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-6 border-b border-brand-border">
          <img
            src={STORE_INFO.logoUrl}
            alt={STORE_INFO.name}
            className="h-10 w-auto mx-auto mb-3"
          />
          <h2 className="text-xl font-serif text-white uppercase tracking-wider">
            Entre em Contato Conosco
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Estamos prontas para atender você com carinho e agilidade!
          </p>
        </div>

        <div className="py-6 space-y-4 text-xs text-gray-300">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <MessageCircle className="w-5 h-5 text-brand-whatsapp flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">WhatsApp de Pedidos</strong>
              <p className="text-gray-400 mt-0.5">(31) 8039-3768</p>
              <a
                href={`https://wa.me/${STORE_INFO.orderWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-whatsapp font-bold hover:underline inline-flex items-center gap-1 mt-1"
              >
                Abrir conversa <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <Phone className="w-5 h-5 text-brand-rose flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Telefone da Loja</strong>
              <p className="text-gray-400 mt-0.5">{STORE_INFO.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <MapPin className="w-5 h-5 text-brand-rose flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Loja Física</strong>
              <p className="text-gray-400 mt-0.5">{STORE_INFO.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <Clock className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Horário de Atendimento</strong>
              <p className="text-gray-400 mt-0.5">Segunda a Sexta: 09:00 às 18:00 | Sábado: 09:00 às 13:00</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-brand-rose hover:bg-brand-rose-dark text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
