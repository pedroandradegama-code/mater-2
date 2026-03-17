
-- Fix security definer view
ALTER VIEW public.afiliadas_performance SET (security_invoker = on);

-- Add restrictive RLS policies - only service role can access
CREATE POLICY "Service role only" ON public.afiliadas FOR ALL USING (false);
CREATE POLICY "Service role only" ON public.afiliadas_vendas FOR ALL USING (false);
