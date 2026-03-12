
-- Add fotos column to diario
ALTER TABLE public.diario ADD COLUMN IF NOT EXISTS fotos jsonb DEFAULT '[]'::jsonb;

-- Create checklist_mala table
CREATE TABLE IF NOT EXISTS public.checklist_mala (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.checklist_mala ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checklist" ON public.checklist_mala FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist" ON public.checklist_mala FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist" ON public.checklist_mala FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist" ON public.checklist_mala FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create nome_favoritos table
CREATE TABLE IF NOT EXISTS public.nome_favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  origem text,
  significado text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nome_favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favoritos" ON public.nome_favoritos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favoritos" ON public.nome_favoritos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favoritos" ON public.nome_favoritos FOR DELETE TO authenticated USING (auth.uid() = user_id);
