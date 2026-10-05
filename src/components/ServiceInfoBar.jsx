import React from 'react';
import { SERVICE_ITEMS } from '../data/banners';

export default function ServiceInfoBar() {
  return (
    <section className="bg-brand-dark py-8 border-y border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {SERVICE_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-brand-rose/40 transition-all hover:bg-brand-card/50"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-rose/10 flex items-center justify-center p-2 border border-brand-rose/20">
                <img
                  src={item.iconUrl}
                  alt={item.title}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-gold">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
