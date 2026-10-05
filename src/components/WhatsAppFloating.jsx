import React from 'react';
import { MessageCircle } from 'lucide-react';
import { STORE_INFO } from '../data/banners';

export default function WhatsAppFloating() {
  const whatsappUrl = `https://wa.me/${STORE_INFO.orderWhatsApp}?text=${encodeURIComponent(
    'Olá Millany Modas! Gostaria de tirar uma dúvida sobre os produtos da loja.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-brand-whatsapp hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all group border border-emerald-400/40"
      aria-label="Atendimento via WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
      <span className="text-xs font-bold tracking-wide hidden sm:inline">
        Atendimento WhatsApp
      </span>
    </a>
  );
}
