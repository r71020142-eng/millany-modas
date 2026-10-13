-- Migração Supabase para Millany Modas
-- Tabela para armazenamento do catálogo mestre, status da loja, produtos, cupons e estoque

CREATE TABLE IF NOT EXISTS public.store_catalog (
  id text PRIMARY KEY DEFAULT 'master',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.store_catalog ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (visitantes e clientes)
CREATE POLICY "Permitir leitura pública" ON public.store_catalog
  FOR SELECT USING (true);

-- Permitir escrita pública (salvar catálogo e status da loja)
CREATE POLICY "Permitir escrita pública" ON public.store_catalog
  FOR ALL USING (true) WITH CHECK (true);

-- Habilitar replicação em tempo real (Realtime via WebSocket)
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_catalog;
