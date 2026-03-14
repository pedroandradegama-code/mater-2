
-- Enquetes table (poll definitions by week range)
CREATE TABLE public.enquetes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semana_min INTEGER NOT NULL,
  semana_max INTEGER NOT NULL,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enquetes responses
CREATE TABLE public.enquetes_respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enquete_id UUID NOT NULL REFERENCES public.enquetes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  opcao_escolhida TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, enquete_id)
);

-- RLS on enquetes (public read)
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read enquetes" ON public.enquetes FOR SELECT TO authenticated USING (true);

-- RLS on enquetes_respostas
ALTER TABLE public.enquetes_respostas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all responses" ON public.enquetes_respostas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own response" ON public.enquetes_respostas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own response" ON public.enquetes_respostas FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for responses
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquetes_respostas;
