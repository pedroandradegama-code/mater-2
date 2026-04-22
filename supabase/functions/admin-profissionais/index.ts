import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "pedroandradegama@gmail.com";

function gerarCodigo(nome: string): string {
  const primeiroNome = nome.trim().split(" ")[0].toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
  const sufixo = Math.floor(100 + Math.random() * 900);
  return `ENF-${primeiroNome}-${sufixo}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verifica admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET list — todas as profissionais com métricas
    if (req.method === "GET" && action === "list") {
      const { data, error } = await supabase
        .from("profissionais_admin_view")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET convites — todos os convites (usados ou não)
    if (req.method === "GET" && action === "convites") {
      const { data, error } = await supabase
        .from("profissionais_convites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST gerar-convite
    if (req.method === "POST" && action === "gerar-convite") {
      const body = await req.json();
      const { nome, email_destino, dias_validade } = body;
      if (!nome) {
        return new Response(JSON.stringify({ error: "Nome obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Gera código único (até 5 tentativas)
      let codigo = gerarCodigo(nome);
      for (let i = 0; i < 5; i++) {
        const { data: existe } = await supabase
          .from("profissionais_convites")
          .select("id")
          .eq("codigo", codigo)
          .maybeSingle();
        if (!existe) break;
        codigo = gerarCodigo(nome);
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (dias_validade || 30));

      const { data, error } = await supabase
        .from("profissionais_convites")
        .insert({
          codigo,
          email_destino: email_destino || null,
          expires_at: expiresAt.toISOString(),
          criado_por: user.id,
          usado: false,
        })
        .select()
        .single();
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PATCH update profissional (status, link_kiwify, nome)
    if (req.method === "PATCH" && action === "update") {
      const body = await req.json();
      const { id, ...updates } = body;
      const { data, error } = await supabase
        .from("profissionais")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE convite (apenas se não usado)
    if (req.method === "DELETE" && action === "convite") {
      const conviteId = url.searchParams.get("id");
      if (!conviteId) {
        return new Response(JSON.stringify({ error: "ID obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("profissionais_convites")
        .delete()
        .eq("id", conviteId)
        .eq("usado", false);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação não encontrada" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
