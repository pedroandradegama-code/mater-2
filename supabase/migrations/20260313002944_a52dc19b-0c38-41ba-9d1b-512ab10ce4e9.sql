CREATE TABLE public.plano_parto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plano_parto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plano_parto" ON public.plano_parto FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plano_parto" ON public.plano_parto FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plano_parto" ON public.plano_parto FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plano_parto" ON public.plano_parto FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_plano_parto_updated_at BEFORE UPDATE ON public.plano_parto FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();