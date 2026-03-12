import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    const body = await req.json()
    console.log('Payload recebido:', JSON.stringify(body))

    const email =
      body?.Customer?.email ||
      body?.customer?.email ||
      body?.data?.customer?.email ||
      body?.data?.Customer?.email ||
      null

    console.log('Email extraído:', email)

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email não encontrado no payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('profiles')
      .update({ plano: 'pago' })
      .eq('email', email.toLowerCase())

    if (error) {
      console.log('Erro Supabase:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Plano atualizado com sucesso para:', email)
    return new Response(
      JSON.stringify({ success: true, email }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.log('Erro geral:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// URL do webhook para configurar na Kiwify:
// https://eozhtxplgwzwytulxlhz.supabase.co/functions/v1/kiwify-webhook
