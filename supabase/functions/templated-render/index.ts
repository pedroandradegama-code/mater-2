import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATE_IDS: Record<string, string> = {
  floral:   "8abdac7d-f112-4a54-833f-981a89b6cba3",
  natureza: "7a91193a-b17a-4264-9ee2-16e948a8e2ff",
  aurora:   "ad23ff14-a9d1-4651-a9b8-588db34d909d",
};

const TIPO_LABEL: Record<string, string> = {
  cha_revelacao: "Chá Revelação",
  cha_fraldas:   "Chá de Fraldas",
  aniversario:   "Aniversário",
  outro:         "Evento Especial",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TEMPLATED_API_KEY         = Deno.env.get("TEMPLATED_API_KEY");

  if (!TEMPLATED_API_KEY) {
    return new Response(
      JSON.stringify({ error: "TEMPLATED_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { evento_id } = await req.json();

    if (!evento_id) {
      return new Response(
        JSON.stringify({ error: "evento_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: evento, error: fetchErr } = await supabase
      .from("eventos")
      .select("*")
      .eq("id", evento_id)
      .single();

    if (fetchErr || !evento) {
      return new Response(
        JSON.stringify({ error: "Evento not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("eventos")
      .update({ status: "generating" })
      .eq("id", evento_id);

    const templateId = TEMPLATE_IDS[evento.template_id];
    if (!templateId) throw new Error(`Unknown template: ${evento.template_id}`);

    const tituloFinal = evento.titulo_evento || TIPO_LABEL[evento.tipo_evento] || "Evento Especial";

    const renderResponse = await fetch("https://api.templated.io/v1/render", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TEMPLATED_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: templateId,
        format: "png",
        layers: {
          titulo_evento: { text: tituloFinal },
          nome_familia:  { text: evento.nome_familia || "" },
          data_hora:     { text: evento.data_hora || "" },
          local:         { text: evento.local || "" },
          mensagem:      { text: evento.mensagem || "" },
          rsvp:          { text: evento.rsvp || "" },
          nome_bebe:     { text: evento.nome_bebe || " " },
        },
      }),
    });

    if (!renderResponse.ok) {
      const errBody = await renderResponse.text();
      console.error("Templated error:", renderResponse.status, errBody);
      await supabase.from("eventos").update({ status: "error" }).eq("id", evento_id);
      return new Response(
        JSON.stringify({ error: `Templated API error: ${renderResponse.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const renderData = await renderResponse.json();
    const imageUrl: string =
      renderData.image_url || renderData.render_url || renderData.url || "";

    if (!imageUrl) {
      console.error("Templated response sem URL:", JSON.stringify(renderData));
      await supabase.from("eventos").update({ status: "error" }).eq("id", evento_id);
      return new Response(
        JSON.stringify({ error: "No image URL in Templated response" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("eventos")
      .update({
        status: "done",
        image_url: imageUrl,
        templated_render_id: renderData.id || null,
      })
      .eq("id", evento_id);

    return new Response(
      JSON.stringify({ success: true, image_url: imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Templated render error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
