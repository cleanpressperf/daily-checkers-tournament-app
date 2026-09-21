import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { shuffledBots } from '@/lib/bots/names'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: tournaments, error } = await db.from('tournaments').select('id,name,max_players,status').in('status', ['registering', 'open', 'upcoming']).order('start_time', { ascending: true }).limit(3)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const results = []
  for (const tournament of tournaments ?? []) {
    const { data: entries } = await db.from('tournament_entries').select('id,user_id,is_bot,bot_name').eq('tournament_id', tournament.id)
    const current = entries ?? []
    const missing = Math.max(0, (tournament.max_players ?? 32) - current.length)
    if (missing) {
      await db.from('tournament_entries').insert(shuffledBots(missing).map(bot_name => ({ tournament_id: tournament.id, user_id: null, is_bot: true, bot_name, status: 'registered' })))
    }
    const all = [...current, ...shuffledBots(missing).map(bot_name => ({ user_id: null, is_bot: true, bot_name }))]
    const pairs = []
    for (let i = 0; i < all.length; i += 2) {
      const a = all[i], b = all[i + 1]
      if (!a || !b) continue
      pairs.push({ tournament_id: tournament.id, round: 'Round 1', player1: a.user_id, player2: b.user_id, player1_name: a.is_bot ? a.bot_name : 'Player', player2_name: b.is_bot ? b.bot_name : 'Player', table_number: i / 2 + 1, board: {}, status: 'playing' })
    }
    const { count } = await db.from('matches').select('id', { count: 'exact', head: true }).eq('tournament_id', tournament.id)
    if (!count && pairs.length) await db.from('matches').insert(pairs)
    results.push({ tournament_id: tournament.id, entries: all.length, matches: pairs.length })
  }
  return NextResponse.json({ ok: true, results })
}
