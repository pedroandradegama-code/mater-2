CREATE TABLE public.musica_bebe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_bebe text,
  prompt_gerado text,
  estilo text NOT NULL,
  idioma text NOT NULL,
  temas jsonb NOT NULL DEFAULT '[]'::jsonb,
  audio_url text,
  status text NOT NULL DEFAULT 'pending',
  elevenlabs_generation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.musica_bebe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own musica" ON public.musica_bebe
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own musica" ON public.musica_bebe
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own musica" ON public.musica_bebe
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('musicas-bebe', 'musicas-bebe', true);

CREATE POLICY "Users can upload own music" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'musicas-bebe' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read music files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'musicas-bebe');