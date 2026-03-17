
-- Tabela de afiliadas
CREATE TABLE public.afiliadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  whatsapp text,
  profissao text DEFAULT 'enfermeira',
  indicada_por text,
  codigo_afiliada text UNIQUE,
  link_kiwify text,
  status text DEFAULT 'ativa',
  created_at timestamptz DEFAULT now()
);

-- Tabela de vendas por afiliada
CREATE TABLE public.afiliadas_vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliada_id uuid REFERENCES public.afiliadas(id),
  email_compradora text,
  valor_venda numeric DEFAULT 19.00,
  comissao numeric DEFAULT 9.50,
  status_pagamento text DEFAULT 'pendente',
  data_venda timestamptz DEFAULT now(),
  kiwify_order_id text
);

-- View de performance
CREATE VIEW public.afiliadas_performance AS
SELECT
  a.id,
  a.nome,
  a.email,
  a.whatsapp,
  a.codigo_afiliada,
  a.link_kiwify,
  a.status,
  a.profissao,
  a.indicada_por,
  a.created_at,
  COUNT(v.id) AS total_vendas,
  COALESCE(SUM(v.comissao) FILTER (WHERE v.status_pagamento = 'pago'), 0) AS comissao_paga,
  COALESCE(SUM(v.comissao) FILTER (WHERE v.status_pagamento = 'pendente'), 0) AS comissao_pendente
FROM public.afiliadas a
LEFT JOIN public.afiliadas_vendas v ON v.afiliada_id = a.id
GROUP BY a.id;

-- RLS - desabilitado pois é admin-only via service role
ALTER TABLE public.afiliadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiliadas_vendas ENABLE ROW LEVEL SECURITY;

-- Policies: apenas service role (edge functions) acessa essas tabelas
-- Para o admin dashboard, usaremos uma edge function com service role
