export const DEFAULT_STORE_STATUS = {
  isPaused: false, // false = loja aberta; true = loja pausada para visitantes
  pausedTitle: 'Estamos atualizando nossa loja! ✨',
  pausedMessage: 'Nossa loja virtual está temporariamente pausada para atualização de estoque, fotos e lançamentos exclusivos. Voltamos em instantes!',
  estimatedReturn: 'Previsão: Em breve',
  pausedAt: null
};

export const getStoredStoreStatus = () => {
  try {
    const saved = localStorage.getItem('millany_store_status_v1');
    if (saved) {
      return { ...DEFAULT_STORE_STATUS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Erro ao carregar store status:', e);
  }
  return DEFAULT_STORE_STATUS;
};
