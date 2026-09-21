import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96, shuffledBots } from '@/lib/bots/names'

console.log(`[v0] Found ${BOT_NAMES_96.length} names in lib/bots/names.ts: ${BOT_NAMES_96.slice(0, 5).join(', ')}`)
import { initialBoard } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: tournaments, error } = await db.from('tournaments').select('id,name,max_players,status').in('status', ['registering', 'open', 'upcoming']).order('start_time', { ascending: true }).limit(3)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const results = []
  for (let tournamentIndex = 0; tournamentIndex < (tournaments ?? []).length; tournamentIndex++) {
    const tournament = tournaments![tournamentIndex]
    const { data: entries } = await db.from('tournament_entries').select('id,user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id')
    const current = entries ?? []
    const availableNames = shuffledBots(32)
    const missing = Math.max(0, (tournament.max_players ?? 32) - current.length)
    let added = [] as any[]
    if (missing) {
      added = availableNames.slice(current.filter(entry => entry.is_bot).length, current.filter(entry => entry.is_bot).length + missing).map(bot_name => ({ tournament_id: tournament.id, user_id: null, is_bot: true, bot_name, status: 'registered' }))
      if (added.length) await db.from('tournament_entries').insert(added)
    }
    const all = [...current, ...added]
    const pairs = []
    for (let i = 0; i < all.length; i += 2) {
      const a = all[i], b = all[i + 1]
      if (!a || !b) continue
      pairs.push({ tournament_id: tournament.id, round: 'Round 1', player1: a.user_id, player2: b.user_id, player1_name: a.is_bot ? a.bot_name : 'Human player', player2_name: b.is_bot ? b.bot_name : 'Human player', table_number: i / 2 + 1, board: initialBoard(), move_number: 0, last_move_at: new Date().toISOString(), status: 'playing' })
    }
    const { count } = await db.from('matches').select('id', { count: 'exact', head: true }).eq('tournament_id', tournament.id)
    if (!count && pairs.length) await db.from('matches').insert(pairs)
    results.push({ tournament_id: tournament.id, entries: all.length, matches: pairs.length })
  }
  return NextResponse.json({ ok: true, results })
}
