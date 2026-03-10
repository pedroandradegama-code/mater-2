
-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  dum DATE,
  sexo_bebe TEXT CHECK (sexo_bebe IN ('menina', 'menino', 'surpresa')),
  nome_bebe TEXT,
  plano TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free', 'pago')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Consultas table
CREATE TABLE public.consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'pre-natal',
  medico TEXT,
  local TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultas" ON public.consultas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consultas" ON public.consultas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consultas" ON public.consultas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own consultas" ON public.consultas FOR DELETE USING (auth.uid() = user_id);

-- Diario table
CREATE TABLE public.diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semana INTEGER,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  texto_livre TEXT,
  humor TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diario" ON public.diario FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diario" ON public.diario FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diario" ON public.diario FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diario" ON public.diario FOR DELETE USING (auth.uid() = user_id);

-- Cartas table
CREATE TABLE public.cartas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semana INTEGER,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cartas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cartas" ON public.cartas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cartas" ON public.cartas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cartas" ON public.cartas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cartas" ON public.cartas FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for diary photos
INSERT INTO storage.buckets (id, name, public) VALUES ('diario-fotos', 'diario-fotos', true);

CREATE POLICY "Users can upload diary photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'diario-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Diary photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'diario-fotos');
CREATE POLICY "Users can delete own diary photos" ON storage.objects FOR DELETE USING (bucket_id = 'diario-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
