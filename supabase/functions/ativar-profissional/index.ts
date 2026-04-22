import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cliente com o JWT do usuário (para validar quem está chamando)
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Usuário inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { codigo_convite, nome } = await req.json();
    if (!codigo_convite) {
      return new Response(
        JSON.stringify({ ok: false, error: "Código de convite ausente" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cliente service role — bypassa RLS
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Busca convite
    const { data: convite, error: conviteError } = await admin
      .from("profissionais_convites")
      .select("*")
      .eq("codigo", codigo_convite)
      .eq("usado", false)
      .maybeSingle();

    if (conviteError) {
      console.error("Erro ao buscar convite:", conviteError);
      return new Response(
        JSON.stringify({ ok: false, error: "Erro ao validar convite" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!convite) {
      return new Response(
        JSON.stringify({ ok: false, error: "Convite inválido ou já utilizado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Valida expiração
    if (convite.expires_at && new Date(convite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Convite expirado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verifica se já existe profissional para esse user_id (idempotência)
    const { data: existente } = await admin
      .from("profissionais")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existente) {
      return new Response(
        JSON.stringify({ ok: true, profissional_id: existente.id, already_active: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Insere profissional
    const { data: prof, error: profError } = await admin
      .from("profissionais")
      .insert({
        user_id: user.id,
        email: user.email!,
        nome: nome ?? user.user_metadata?.nome ?? null,
        codigo_afiliada: convite.codigo,
        codigo_convite: convite.codigo,
        profissao: "enfermeira",
        status: "ativo",
      })
      .select()
      .single();

    if (profError || !prof) {
      console.error("Erro ao inserir profissional:", profError);
      return new Response(
        JSON.stringify({ ok: false, error: "Erro ao ativar perfil profissional", details: profError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Marca convite como usado
    await admin
      .from("profissionais_convites")
      .update({ usado: true, profissional_id: prof.id })
      .eq("id", convite.id);

    return new Response(
      JSON.stringify({ ok: true, profissional_id: prof.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro geral:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Erro interno", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
