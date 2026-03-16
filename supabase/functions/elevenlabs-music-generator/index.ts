import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTILO_MAP: Record<string, string> = {
  classico:
    "orchestral, classical, instrumental only, no vocals, piano and strings, 60 BPM",
  ninar: "lullaby, soft female vocals, gentle guitar, 50 BPM, sleepy and warm",
  folk: "folk, acoustic guitar, warm vocals, 70 BPM, intimate feeling",
  pop: "children's pop, upbeat, playful, 80 BPM, bright and cheerful",
  natureza:
    "ambient, nature sounds, ethereal, no percussion, flowing, 55 BPM",
  mpb: "MPB, Brazilian acoustic, warm vocals, bossa nova influenced, 65 BPM",
};

const TEMA_MAP: Record<string, string> = {
  fe: "faith and God",
  natureza: "nature",
  familia: "family",
  infancia: "childhood",
  brincar: "play",
  amor: "love",
  sonhos: "dreams",
  leveza: "lightness",
  transformacao: "transformation",
  lar: "home and protection",
  esperanca: "hope",
  aconchego: "warmth and comfort",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!ELEVENLABS_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  if (!LOVABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { record_id } = await req.json();

    // Get record
    const { data: record, error: fetchErr } = await supabase
      .from("musica_bebe")
      .select("*")
      .eq("id", record_id)
      .single();

    if (fetchErr || !record) {
      throw new Error("Record not found");
    }

    // Update status to generating
    await supabase
      .from("musica_bebe")
      .update({ status: "generating" })
      .eq("id", record_id);

    const { estilo, idioma, temas, nome_bebe } = record;
    const temasArr = Array.isArray(temas) ? temas : [];
    const idiomaLabel = idioma === "pt" ? "Português Brasileiro" : "Inglês";
    const idiomaEn = idioma === "pt" ? "sung in Brazilian Portuguese" : "sung in English";
    const temasEn = temasArr.map((t: string) => TEMA_MAP[t] || t).join(", ");

    // Step 1: Generate lyrics via Lovable AI
    const systemPrompt = `Você é um compositor especializado em músicas infantis e de gestação.
Crie uma letra de música original para um bebê.
REGRAS ABSOLUTAS E INEGOCIÁVEIS:
- Linguagem 100% pura, poética e afetuosa
- PROIBIDO: qualquer palavra de baixo calão, conotação sexual, violência, medo, morte, doença, tristeza intensa, conflito ou tema adulto
- PROIBIDO: referências religiosas de denominações específicas (use apenas 'Deus', 'luz divina', 'bênção' se o tema Fé for selecionado)
- Tom: amoroso, esperançoso, gentil, celebrativo
- A letra deve ter entre 3 e 5 estrofes curtas
- Incluir o nome do bebê ao menos 2 vezes na letra
- Duração alvo: 35 a 40 segundos quando cantada em ritmo ${ESTILO_MAP[estilo] || estilo}
Se QUALQUER um desses critérios não puder ser atendido com os inputs fornecidos, retorne apenas: BLOCKED`;

    const userPrompt = `Crie uma letra de música no estilo ${estilo}, em ${idiomaLabel}, com os temas: ${temasArr.join(", ")}. O nome do bebê é ${nome_bebe}. A música será cantada/tocada por IA. Retorne APENAS a letra, sem explicações.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI gateway error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    const lyrics = aiData.choices?.[0]?.message?.content?.trim() || "";

    if (lyrics === "BLOCKED" || !lyrics) {
      await supabase
        .from("musica_bebe")
        .update({ status: "error", prompt_gerado: lyrics || "BLOCKED" })
        .eq("id", record_id);
      return new Response(
        JSON.stringify({ error: "Content blocked" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Build ElevenLabs prompt
    const estiloEn = ESTILO_MAP[estilo] || estilo;
    const musicPrompt = `${estiloEn}, gentle children's lullaby, warm and loving tone, ${idiomaEn}, themes of ${temasEn}, soft instrumentation, no dark or adult content, no explicit language, baby's name is ${nome_bebe}, duration 40 seconds.\n\nLyrics:\n${lyrics}`;

    // Save prompt
    await supabase
      .from("musica_bebe")
      .update({ prompt_gerado: musicPrompt })
      .eq("id", record_id);

    // Step 3: Call ElevenLabs Music API
    const musicResponse = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: musicPrompt,
        duration_seconds: 40,
      }),
    });

    if (!musicResponse.ok) {
      const errBody = await musicResponse.text();
      console.error("ElevenLabs error:", musicResponse.status, errBody);
      await supabase
        .from("musica_bebe")
        .update({ status: "error" })
        .eq("id", record_id);
      return new Response(
        JSON.stringify({ error: `ElevenLabs error: ${musicResponse.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await musicResponse.arrayBuffer();

    // Step 4: Upload to storage
    const filePath = `${record.user_id}/musica-${record_id}.mp3`;
    const { error: uploadErr } = await supabase.storage
      .from("musicas-bebe")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      await supabase
        .from("musica_bebe")
        .update({ status: "error" })
        .eq("id", record_id);
      return new Response(
        JSON.stringify({ error: "Upload failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: urlData } = supabase.storage
      .from("musicas-bebe")
      .getPublicUrl(filePath);

    // Step 5: Update record as done
    await supabase
      .from("musica_bebe")
      .update({
        status: "done",
        audio_url: urlData.publicUrl,
      })
      .eq("id", record_id);

    return new Response(
      JSON.stringify({ success: true, audio_url: urlData.publicUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Music generator error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
