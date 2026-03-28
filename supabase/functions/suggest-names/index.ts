const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type SuggestRequest = {
  sexo?: string;
  estilos?: string[];
  nomeMae?: string;
  nomePai?: string;
  homenagem?: string;
  letraInicial?: string;
  significados?: string;
  sobrenome?: string;
};

type SearchRequest = {
  nomeConsulta?: string;
  sobrenome?: string;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const extractJson = (content: string) => {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] || trimmed;
  return JSON.parse(candidate);
};

async function askLovableAI(prompt: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em nomes de bebês do Brasil. Responda sempre em português e retorne apenas JSON válido, sem markdown, sem comentários e sem texto fora do JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI gateway error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Resposta vazia do modelo');
  }

  return extractJson(content);
}

function buildSuggestPrompt(payload: SuggestRequest) {
  return `Crie exatamente 6 sugestões de nomes para bebê em JSON no formato {"result":[...]}.\nCada item deve ter as chaves: nome, origem, significado, por_que_combina, variacoes, famosos_com_esse_nome.\nvariacoes e famosos_com_esse_nome devem ser arrays de strings.\nRegras:\n- Não repetir nomes.\n- Considerar o contexto brasileiro.\n- Se sexo for "Surpresa", misture opções masculinas e femininas, mas nunca use rótulo de nome neutro.\n- Se houver sobrenome, considere boa sonoridade com ele.\n- Se houver letra inicial, respeite-a em todas as sugestões.\n- Se houver homenagem, reflita isso em parte das sugestões sem usar nomes idênticos em todas.\n- por_que_combina deve ser curto e personalizado.\n\nContexto da família: ${JSON.stringify(payload)}.`;
}

function buildSearchPrompt(payload: SearchRequest) {
  return `Analise um nome de bebê e retorne JSON no formato {"result": {...}}.\nAs chaves obrigatórias do objeto são: nome, origem, significado, personalidade, variacoes, curiosidades, sonoridade.\nvariacoes deve ser um array de strings.\nsonoridade deve comentar brevemente como o nome combina com o sobrenome informado, se houver.\nSe o nome for raro, responda de modo útil e plausível, sem dizer que não sabe.\n\nDados para análise: ${JSON.stringify(payload)}.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode = body?.mode;

    if (mode === 'suggest') {
      const result = await askLovableAI(buildSuggestPrompt(body));
      return jsonResponse(result);
    }

    if (mode === 'search') {
      if (!body?.nomeConsulta?.trim()) {
        return jsonResponse({ error: 'Informe um nome para buscar.' }, 400);
      }

      const result = await askLovableAI(buildSearchPrompt(body));
      return jsonResponse(result);
    }

    return jsonResponse({ error: 'Modo inválido.' }, 400);
  } catch (error) {
    console.error('suggest-names error:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Erro ao gerar nomes.' },
      500,
    );
  }
});