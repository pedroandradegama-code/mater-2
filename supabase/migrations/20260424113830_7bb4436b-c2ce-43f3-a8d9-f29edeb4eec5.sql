-- 1. Atualiza handle_new_user para gravar nome, utm_ref e onboarding_completed do metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_nome text;
  v_utm_ref text;
  v_convite text;
  v_onboarding_completed boolean;
BEGIN
  v_nome := NULLIF(NEW.raw_user_meta_data->>'nome', '');
  v_utm_ref := NULLIF(NEW.raw_user_meta_data->>'utm_ref', '');
  v_convite := NULLIF(NEW.raw_user_meta_data->>'convite', '');
  -- Se for profissional (tem convite), marca onboarding como concluído
  v_onboarding_completed := v_convite IS NOT NULL;

  INSERT INTO public.profiles (user_id, email, nome, utm_ref, onboarding_completed)
  VALUES (NEW.id, NEW.email, v_nome, v_utm_ref, COALESCE(v_onboarding_completed, false))
  ON CONFLICT (user_id) DO UPDATE
    SET nome = COALESCE(EXCLUDED.nome, public.profiles.nome),
        utm_ref = COALESCE(EXCLUDED.utm_ref, public.profiles.utm_ref),
        onboarding_completed = public.profiles.onboarding_completed OR EXCLUDED.onboarding_completed;
  RETURN NEW;
END;
$function$;

-- 2. Garante o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Garante constraint de unicidade por user_id (necessário para ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='profiles' AND indexname='profiles_user_id_unique'
  ) THEN
    CREATE UNIQUE INDEX profiles_user_id_unique ON public.profiles(user_id);
  END IF;
END$$;