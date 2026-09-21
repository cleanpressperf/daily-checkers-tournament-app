import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96 } from '@/lib/bots/names'
import { initialBoard } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

const definitions = [
  { name: 'Bronze', entry_coins: 20 },
  { name: 'Silver', entry_coins: 50 },
  { name: 'Gold', entry_coins: 100 },
]

const db = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgjgukagbpojidvuwwqz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '********',
)

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing, error } = await db.from('tournaments').select('*').eq('date', today).order('entry_coins')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let tournaments = existing ?? []
  if (!tournaments.length) {
    return NextResponse.json({ error: 'No tournaments found for today; refusing to invent prize amounts.' }, { status: 409 })
  }

  const results: { tournament: string; filled: number; champion_name: string | null }[] = []
  for (const tournament of tournaments.slice(0, 3)) {
    const { data: entries, error: entriesError } = await db.from('tournament_entries').select('id,user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id')
    if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 500 })
    const current = entries ?? []
    const botCount = current.filter((entry) => entry.is_bot).length
    const offset = definitions.findIndex((item) => item.name === tournament.name) * 32
    const missing = Math.max(0, 32 - current.length)
    if (missing) {
      const additions = BOT_NAMES_96.slice(offset, offset + 32).filter((name) => !current.some((entry) => entry.bot_name === name)).slice(0, missing).map((bot_name) => ({ tournament_id: tournament.id, user_id: null, is_bot: true, bot_name, status: 'registered' }))
      if (additions.length) await db.from('tournament_entries').insert(additions)
    }
    const { data: allEntries } = await db.from('tournament_entries').select('user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id')
    const all = (allEntries ?? []).slice(0, 32)
    await db.from('matches').delete().eq('tournament_id', tournament.id)
    const matches = []
    for (let index = 0; index < 32; index += 2) {
      const first = all[index], second = all[index + 1]
      if (!first || !second) continue
      matches.push({ tournament_id: tournament.id, round: 'Round 1', player1: first.user_id, player2: second.user_id, player1_name: first.bot_name ?? 'You', player2_name: second.bot_name ?? 'You', table_number: index / 2 + 1, board: initialBoard(), move_number: 0, last_move_at: new Date().toISOString(), status: 'playing' })
    }
    if (matches.length) await db.from('matches').insert(matches)

    const champion_name = all[0]?.bot_name ?? null
    const { error: championError } = await db.from('tournaments').update({ champion_name, status: champion_name ? 'completed' : tournament.status }).eq('id', tournament.id)
    if (championError) return NextResponse.json({ error: championError.message }, { status: 500 })
    results.push({ tournament: tournament.name, filled: all.length, champion_name })
  }
  return NextResponse.json({ ok: true, results })
}
