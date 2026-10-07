import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { STORE_INFO } from '../../data/banners';

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  isPageMode = false,
  onBackToStore
}) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123@') {
      setError('');
      onLoginSuccess();
      if (onClose) onClose();
    } else {
      setError('Senha incorreta. Por favor, tente novamente.');
    }
  };

  const cardContent = (
    <div className="relative bg-brand-dark border border-brand-border rounded-2xl w-full max-w-md p-6 sm:p-8 z-10 shadow-2xl text-left">
      {!isPageMode && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-brand-card transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {isPageMode && onBackToStore && (
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-4 pb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a Loja</span>
        </button>
      )}

      <div className="text-center pb-6 border-b border-brand-border">
        <div className="w-14 h-14 bg-brand-rose/20 text-brand-rose rounded-full flex items-center justify-center mx-auto mb-3 border border-brand-rose/40">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif text-white uppercase tracking-wider">
          Acesso Administrativo
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Área restrita de gestão da Millany Modas
        </p>
      </div>

      <form onSubmit={handleLogin} className="py-6 space-y-4 text-xs">
        <div>
          <label className="text-gray-300 font-semibold block mb-1">
            Senha do Painel
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Digite sua senha de acesso"
              autoFocus
              className="w-full bg-brand-card text-white text-xs pl-9 pr-10 py-3 rounded-lg border border-brand-border focus:border-brand-rose focus:outline-none"
            />
            <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-white absolute right-3 top-2.5 transition-colors"
              title={showPassword ? 'Ocultar senha' : 'Ver senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-[11px] text-red-400 font-medium mt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-brand-rose hover:bg-brand-rose-dark text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>Entrar no Painel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5 border-t border-brand-border/40">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Ambiente seguro e protegido</span>
      </div>
    </div>
  );

  if (isPageMode) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative selection:bg-brand-rose selection:text-white">
        <div className="absolute top-10 flex items-center justify-center">
          <img src={STORE_INFO.logoUrl} alt="Millany Modas" className="h-10 w-auto opacity-90" />
        </div>
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      {cardContent}
    </div>
  );
}
