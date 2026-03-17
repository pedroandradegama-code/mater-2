import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'pedroandradegama@gmail.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // GET: list afiliadas performance
    if (req.method === 'GET' && action === 'list') {
      const { data, error } = await supabase.from('afiliadas_performance').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET: vendas de uma afiliada
    if (req.method === 'GET' && action === 'vendas') {
      const afiliada_id = url.searchParams.get('afiliada_id')
      const { data, error } = await supabase.from('afiliadas_vendas').select('*').eq('afiliada_id', afiliada_id).order('data_venda', { ascending: false })
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST: criar afiliada
    if (req.method === 'POST' && action === 'create') {
      const body = await req.json()
      const codigo = `ENF-${body.nome.split(' ')[0].toUpperCase()}`
      const { data, error } = await supabase.from('afiliadas').insert({
        nome: body.nome,
        email: body.email,
        whatsapp: body.whatsapp || null,
        profissao: body.profissao || 'enfermeira',
        indicada_por: body.indicada_por || null,
        codigo_afiliada: codigo,
      }).select().single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // PATCH: update afiliada (ex: link_kiwify, status)
    if (req.method === 'PATCH' && action === 'update') {
      const body = await req.json()
      const { id, ...updates } = body
      const { data, error } = await supabase.from('afiliadas').update(updates).eq('id', id).select().single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Ação não encontrada' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
