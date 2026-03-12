import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sexo, estilos, nomeMae, nomePai, homenagem, letraInicial, significados, sobrenome, mode, nomeConsulta } = await req.json()

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured")

    let systemPrompt = ""
    let userPrompt = ""

    if (mode === "search") {
      systemPrompt = "Você é um especialista em onomástica (estudo de nomes). Responda em português brasileiro."
      userPrompt = `Analise o nome "${nomeConsulta}" e retorne um JSON com:
{
  "nome": "${nomeConsulta}",
  "origem": "origem do nome",
  "significado": "significado completo",
  "personalidade": "traços de personalidade associados (sem pseudociência)",
  "variacoes": ["variações em outros idiomas"],
  "curiosidades": "curiosidades históricas ou culturais",
  "sonoridade": "análise de sonoridade${sobrenome ? ` com o sobrenome ${sobrenome}` : ''}"
}
Retorne APENAS o JSON, sem markdown.`
    } else {
      systemPrompt = "Você é um especialista em nomes de bebê brasileiro. Sugira nomes criativos e significativos. Responda em português brasileiro."
      userPrompt = `Sugira 6 nomes de bebê com base nos seguintes critérios:
- Sexo: ${sexo}
- Estilos preferidos: ${estilos?.join(', ') || 'qualquer'}
- Nome da mãe: ${nomeMae || 'não informado'}
- Nome do pai: ${nomePai || 'não informado'}
- Homenagear: ${homenagem || 'ninguém específico'}
- Letra inicial desejada: ${letraInicial || 'qualquer'}
- Significados que importam: ${significados || 'qualquer'}
- Sobrenome: ${sobrenome || 'não informado'}

Retorne APENAS um JSON array com 6 objetos no formato:
[{
  "nome": "Nome",
  "origem": "Origem (ex: Hebraico, Latim, Tupi)",
  "significado": "Significado do nome",
  "por_que_combina": "Explicação personalizada conectando com os inputs",
  "variacoes": ["Var1", "Var2"],
  "famosos_com_esse_nome": ["Pessoa famosa 1", "Pessoa famosa 2"]
}]
Sem markdown, apenas JSON.`
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const status = response.status
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
      throw new Error(`AI gateway error: ${status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    // Clean markdown fences if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return new Response(JSON.stringify({ result: JSON.parse(cleaned) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("suggest-names error:", err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
