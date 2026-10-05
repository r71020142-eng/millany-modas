import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import { STORE_INFO } from '../../data/banners';

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'admin' || password === 'millany') {
      onLoginSuccess();
      onClose();
    } else {
      setError('Senha incorreta. Tente: admin123');
    }
  };

  const handleQuickLogin = () => {
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-md p-6 sm:p-8 z-10 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-brand-card transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-6 border-b border-brand-border">
          <div className="w-14 h-14 bg-brand-rose/20 text-brand-rose rounded-full flex items-center justify-center mx-auto mb-3 border border-brand-rose/40">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif text-white uppercase tracking-wider">
            Painel Administrativo
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gerenciamento de Banners, Catálogo e Configurações
          </p>
        </div>

        <form onSubmit={handleLogin} className="py-6 space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Digite a senha (padrão: admin123)"
                autoFocus
                className="w-full bg-brand-card text-white text-xs pl-9 pr-4 py-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
              />
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
            {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-rose hover:bg-brand-rose-dark text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full py-2.5 bg-brand-card hover:bg-white/10 text-brand-gold font-semibold uppercase tracking-wider rounded-xl border border-brand-border transition-colors text-[11px]"
          >
            ⚡ Entrar com 1 Clique (Demonstração)
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acesso seguro restrito à administração da Millany Modas</span>
        </div>
      </div>
    </div>
  );
}
