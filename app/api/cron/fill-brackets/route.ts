import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96 } from '@/lib/bots/names'
import { initialBoard } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

const definitions = [
  { name: 'Bronze', entry_coins: 20, prize_naira: 500 },
  { name: 'Silver', entry_coins: 50, prize_naira: 1500 },
  { name: 'Gold', entry_coins: 100, prize_naira: 5000 },
]

export async function GET() {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing, error } = await db.from('tournaments').select('*').eq('date', today).order('entry_coins')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let tournaments = existing ?? []
  if (!tournaments.length) {
    const { data, error: insertError } = await db.from('tournaments').insert(definitions.map((tournament) => ({ ...tournament, max_players: 32, status: 'registering', date: today, starts_at: new Date(Date.now() + 3600000).toISOString() }))).select('*')
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    tournaments = data ?? []
  }

  const results: { tournament: string; filled: number }[] = []
  for (const tournament of tournaments.slice(0, 3)) {
    const { data: entries, error: entriesError } = await db.from('tournament_entries').select('id,user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id')
    if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 500 })
    const current = entries ?? []
    const botCount = current.filter((entry) => entry.is_bot).length
    const names = [...BOT_NAMES_96].sort(() => Math.random() - 0.5)
    const offset = definitions.findIndex((item) => item.name === tournament.name) * 32
    const missing = Math.max(0, Math.min(32, tournament.max_players ?? 32) - current.length)
    if (missing) {
      const additions = names.slice(offset, offset + 32).filter((name) => !current.some((entry) => entry.bot_name === name)).slice(0, missing).map((bot_name) => ({ tournament_id: tournament.id, user_id: null, is_bot: true, bot_name, status: 'registered' }))
      if (additions.length) await db.from('tournament_entries').insert(additions)
    }
    const { data: allEntries } = await db.from('tournament_entries').select('user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id')
    const all = allEntries ?? []
    await db.from('matches').delete().eq('tournament_id', tournament.id)
    const matches = []
    for (let index = 0; index < Math.min(32, all.length); index += 2) {
      const first = all[index], second = all[index + 1]
      if (!first || !second) continue
      matches.push({ tournament_id: tournament.id, round: 'Round 1', player1: first.user_id, player2: second.user_id, player1_name: first.bot_name ?? 'You', player2_name: second.bot_name ?? 'You', table_number: index / 2 + 1, board: initialBoard(), move_number: 0, last_move_at: new Date().toISOString(), status: 'playing' })
    }
    if (matches.length) await db.from('matches').insert(matches)
    results.push({ tournament: tournament.name, filled: Math.min(32, botCount + missing) })
  }
  return NextResponse.json({ ok: true, results })
}
