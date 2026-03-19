
CREATE TABLE public.peso_gestacional (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  semana INTEGER NOT NULL,
  peso NUMERIC(5,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, semana)
);

-- Validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_peso_gestacional()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.semana < 4 OR NEW.semana > 42 THEN
    RAISE EXCEPTION 'semana must be between 4 and 42';
  END IF;
  IF NEW.peso <= 0 THEN
    RAISE EXCEPTION 'peso must be greater than 0';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_peso_gestacional
  BEFORE INSERT OR UPDATE ON public.peso_gestacional
  FOR EACH ROW EXECUTE FUNCTION public.validate_peso_gestacional();

ALTER TABLE public.peso_gestacional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own peso" ON public.peso_gestacional
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own peso" ON public.peso_gestacional
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peso" ON public.peso_gestacional
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own peso" ON public.peso_gestacional
  FOR DELETE USING (auth.uid() = user_id);
