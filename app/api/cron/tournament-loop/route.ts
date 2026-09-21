import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const prizes: Record<string, string> = { Bronze: '$500', Silver: '$1000', Gold: '$2000' }

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Supabase service role environment is not configured' }, { status: 500 })
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { data: tournaments, error } = await db.from('tournaments').select('id,name,status').in('status', ['open', 'upcoming', 'registering', 'playing'])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const champions = []
  for (const tournament of tournaments ?? []) {
    const { data: finished } = await db.from('matches').select('winner_name').eq('tournament_id', tournament.id).eq('status', 'completed').not('winner_name', 'is', null).order('last_move_at', { ascending: false }).limit(1)
    const winner = finished?.[0]?.winner_name
    if (!winner) continue
    const trophy_url = `/trophies/${String(tournament.name).toLowerCase()}.png`
    const update = await db.from('tournaments').update({ champion_name: winner, prize: prizes[tournament.name] ?? '$500', trophy_url, status: 'finished' }).eq('id', tournament.id)
    if (!update.error) champions.push({ tournament: tournament.name, champion_name: winner, prize: prizes[tournament.name] ?? '$500', trophy_url })
  }
  return NextResponse.json({ ok: true, champions })
}
