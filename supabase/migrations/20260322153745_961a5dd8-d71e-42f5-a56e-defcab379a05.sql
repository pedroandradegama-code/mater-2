
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo_evento TEXT NOT NULL,
  template_id TEXT NOT NULL,
  titulo_evento TEXT NOT NULL,
  nome_familia TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  local TEXT NOT NULL,
  mensagem TEXT,
  rsvp TEXT,
  nome_bebe TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  templated_render_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eventos" ON public.eventos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own eventos" ON public.eventos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own eventos" ON public.eventos
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own eventos" ON public.eventos
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.validate_evento()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.tipo_evento NOT IN ('cha_revelacao', 'cha_fraldas', 'aniversario', 'outro') THEN
    RAISE EXCEPTION 'Invalid tipo_evento';
  END IF;
  IF NEW.template_id NOT IN ('floral', 'natureza', 'aurora') THEN
    RAISE EXCEPTION 'Invalid template_id';
  END IF;
  IF NEW.status NOT IN ('pending', 'generating', 'done', 'error') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_evento
  BEFORE INSERT OR UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.validate_evento();

CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
