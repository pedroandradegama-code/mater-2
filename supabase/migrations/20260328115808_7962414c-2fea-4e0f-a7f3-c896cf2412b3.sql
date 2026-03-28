
-- 1) Tabela exames
CREATE TABLE IF NOT EXISTS public.exames (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome_exame text NOT NULL,
  categoria text NOT NULL DEFAULT 'outros',
  semana_gestacional integer,
  data_coleta date,
  arquivo_url text,
  arquivo_nome text,
  arquivo_tipo text,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exames" ON public.exames FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exames" ON public.exames FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exames" ON public.exames FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exames" ON public.exames FOR DELETE USING (auth.uid() = user_id);

-- 2) Tabela eventos_assistenciais_agendados
CREATE TABLE IF NOT EXISTS public.eventos_assistenciais_agendados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tipo text NOT NULL DEFAULT 'consulta',
  nome text NOT NULL,
  semana_prevista integer,
  data_agendada date,
  realizado boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos_assistenciais_agendados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eventos_assist" ON public.eventos_assistenciais_agendados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own eventos_assist" ON public.eventos_assistenciais_agendados FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own eventos_assist" ON public.eventos_assistenciais_agendados FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own eventos_assist" ON public.eventos_assistenciais_agendados FOR DELETE USING (auth.uid() = user_id);

-- 3) Tabela passaporte
CREATE TABLE IF NOT EXISTS public.passaporte (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  frase_gerada text,
  card_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.passaporte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passaporte" ON public.passaporte FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own passaporte" ON public.passaporte FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own passaporte" ON public.passaporte FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own passaporte" ON public.passaporte FOR DELETE USING (auth.uid() = user_id);

-- 4) Novos campos em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primeira_gestacao boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS usg_1t_date text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_reference text DEFAULT 'dum';

-- 5) Storage bucket para exames
INSERT INTO storage.buckets (id, name, public) VALUES ('exames-gestantes', 'exames-gestantes', false) ON CONFLICT (id) DO NOTHING;

-- 6) Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- 7) RLS para storage exames
CREATE POLICY "Users can upload own exames" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'exames-gestantes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own exames files" ON storage.objects FOR SELECT USING (bucket_id = 'exames-gestantes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own exames files" ON storage.objects FOR DELETE USING (bucket_id = 'exames-gestantes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 8) RLS para storage avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 9) RLS para diario-fotos (caso não exista)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload own diary photos' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload own diary photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'diario-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view diary photos' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can view diary photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'diario-fotos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own diary photos' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own diary photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'diario-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
