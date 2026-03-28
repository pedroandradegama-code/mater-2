import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a IA assistente do Mater, app para gestantes. Analise o input da usuária e responda APENAS com JSON válido, sem markdown.

Features disponíveis no app:
- registro_peso: registrar peso na curva de peso (rota: /curva-peso)
- diario_foto: adicionar foto ao diário emocional (rota: /diario)
- exame: adicionar exame em Meus Exames (rota: /meus-exames)
- nomes: sugestão de nomes do bebê (rota: /nomes)
- jornada_saude: jornada de saúde / exames por semana (rota: /jornada-saude)
- musica: criar música do bebê (rota: /musica-bebe)
- calculadoras: calculadoras clínicas (rota: /calculadoras)
- agenda: agenda de consultas (rota: /agenda)
- plano_parto: plano de parto (rota: /plano-parto)
- mala: mala da maternidade (rota: /mala)
- diario_texto: entrada de texto no diário (rota: /diario)
- playlists: playlists de música por mood (rota: /playlists)
- passaporte: passaporte da mamãe (rota: /passaporte)
- explorar: explorar conteúdos (rota: /explorar)
- outro: não identificado

Responda SEMPRE com este JSON:
{
  "intent": "string com um dos valores acima",
  "route": "rota correspondente ou null",
  "message": "mensagem curta e calorosa em português para a usuária (máx 2 frases)",
  "extracted": { "dados extraídos como peso_kg, categoria_exame, nome_exame, etc." },
  "confirmLabel": "texto do botão de ação (ex: 'Registrar peso', 'Adicionar ao diário')"
}

Para IMAGEM de balança: extraia o peso visível na foto em extracted.peso_kg (número).
Para IMAGEM de exame/resultado: identifique a categoria em extracted.categoria (Sangue/Imagem/Urina/Infecciosos/Outros) e nome em extracted.nome_exame.
Para IMAGEM casual/família/natureza: intent = diario_foto.
Para ÁUDIO ou TEXTO sobre nomes: intent = nomes.
Para ÁUDIO ou TEXTO sobre exames da semana X: intent = jornada_saude.
Para ÁUDIO ou TEXTO sobre peso: intent = registro_peso.
Para qualquer dúvida de saúde/sintoma: intent = calculadoras ou faq conforme contexto.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userContent, currentWeek } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build messages - support text and image content
    const messages: any[] = [];
    
    if (Array.isArray(userContent)) {
      // Image input with base64
      const parts: any[] = [];
      for (const item of userContent) {
        if (item.type === "image_base64") {
          parts.push({
            type: "image_url",
            image_url: { url: `data:${item.media_type};base64,${item.data}` },
          });
        } else if (item.type === "text") {
          parts.push({ type: "text", text: item.text });
        }
      }
      // Add week context
      parts.push({ type: "text", text: `Semana gestacional atual: ${currentWeek || 0}.` });
      messages.push({ role: "user", content: parts });
    } else {
      // Simple text input
      messages.push({
        role: "user",
        content: `Semana gestacional: ${currentWeek || 0}. A usuária digitou: "${userContent}"`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON from response
    const clean = text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = { intent: "outro", message: text };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Central IA error:", error);
    return new Response(
      JSON.stringify({ intent: "outro", message: "Desculpe, não consegui processar. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
