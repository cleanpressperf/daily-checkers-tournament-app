import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data, error } = await supabase.from('game_state').select('data').eq('id', 1).single()
    if (error) return Response.json({})
    return Response.json(data?.data || {})
  } catch (e) {
    return Response.json({})
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    await supabase.from('game_state').upsert({ id: 1, data: body })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
