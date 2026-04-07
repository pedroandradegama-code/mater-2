import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-upload-token",
};

const SYSTEM_PROMPT = `Você é um extrator clínico especializado no Cartão da Gestante do Ministério da Saúde do Brasil (modelo ANS/SUS).

Analise o documento PDF fornecido (prontuário eletrônico) e extraia TODOS os dados que correspondam aos campos do Cartão da Gestante do MS.

REGRAS CRÍTICAS:
- Retorne APENAS JSON válido, sem texto adicional, sem markdown, sem explicações
- Use null para qualquer campo não encontrado no documento
- Nunca invente ou infira dados que não estejam explícitos no documento
- Datas sempre no formato YYYY-MM-DD
- Valores booleanos: true/false (não strings)
- Números sem unidade (ex: 65.3 para peso, não "65.3 kg")

Retorne exatamente este JSON:
{
  "dum": null,
  "dpp_clinico": null,
  "dpp_usg": null,
  "tipo_gravidez": null,
  "risco": null,
  "gravidez_planejada": null,
  "grupo_sanguineo": null,
  "antecedentes_familiares": { "hipertensao": null, "diabetes": null, "gemelar": null },
  "antecedentes_clinicos": { "cardiopatia": null, "inf_urinaria": null, "hipertensao": null, "diabetes": null, "tromboembolismo": null, "cir_pelv_uterina": null, "infertilidade": null },
  "gestas_previas": { "gestas": null, "partos_vaginais": null, "cesareas": null, "abortos": null, "nascidos_vivos": null, "nascidos_mortos": null, "rn_menor_2500g": null, "rn_maior_4500g": null, "pre_eclampsia": null, "eclampsia": null, "ectopica": null },
  "gestacao_atual": { "fumo": null, "alcool": null, "outras_drogas": null, "violencia_domestica": null, "anemia": null, "hipertensao": null, "pre_eclampsia": null, "diabetes_gestacional": null, "inf_urinaria": null, "ciur": null, "oligo_polidramnio": null, "uso_insulina": null, "sifilis": null, "toxoplasmose": null, "hiv": null },
  "exames": [],
  "ultrassonografias": [],
  "sulfato_ferroso": { "prescrito": null },
  "acido_folico": { "prescrito": null },
  "vacinas": {},
  "consultas_cartao": [],
  "confianca": 0.0
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pdfBase64, userId, pdfUrl } = await req.json();

    if (!pdfBase64 || !userId) {
      return new Response(
        JSON.stringify({ error: "pdfBase64 e userId são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
              },
              { type: "text", text: "Extraia todos os dados do Cartão da Gestante deste prontuário." },
            ],
          },
        ],
      }),
    });

    const aiResult = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Erro na API de IA", details: aiResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawText = aiResult.content?.[0]?.text ?? "";

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      return new Response(
        JSON.stringify({ error: "Resposta da IA em formato inválido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { confianca, ...dadosCartao } = extracted;

    const { error: dbError } = await supabase
      .from("cartao_gestante")
      .upsert(
        {
          user_id: userId,
          ...dadosCartao,
          ultimo_pdf_url: pdfUrl ?? null,
          ultimo_pdf_processado_em: new Date().toISOString(),
          confianca_extracao: typeof confianca === "number" ? confianca : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Erro ao salvar no banco", details: dbError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uploadToken = req.headers.get("x-upload-token");
    if (uploadToken) {
      await supabase
        .from("upload_tokens")
        .update({ usado: true })
        .eq("token", uploadToken);
    }

    return new Response(
      JSON.stringify({ ok: true, confianca: confianca ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
