import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96 } from '@/lib/bots/names'
import { initialBoard } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

const db = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgjgukagbpojidvuwwqz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '********',
)

function winnerName(entries: { bot_name: string | null }[]) {
  let round = entries.map((entry) => entry.bot_name ?? 'You')
  while (round.length > 1) {
    round = round.filter((_, index) => index % 2 === 0)
  }
  return round[0] ?? null
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: tournaments, error } = await db
    .from('tournaments')
    .select('id,name,status,prize_amount')
    .eq('date', today)
    .order('entry_coins')
    .limit(3)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!tournaments || tournaments.length !== 3) {
    return NextResponse.json({ error: 'Expected exactly 3 tournaments for today.' }, { status: 409 })
  }

  const results: { tournament: string; filled: number; champion_name: string | null }[] = []

  for (const [tournamentIndex, tournament] of tournaments.entries()) {
    const { data: currentEntries, error: entriesError } = await db
      .from('tournament_entries')
      .select('id,user_id,is_bot,bot_name')
      .eq('tournament_id', tournament.id)
      .order('id')

    if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 500 })

    const current = currentEntries ?? []
    const names = BOT_NAMES_96.slice(tournamentIndex * 32, tournamentIndex * 32 + 32)
    const missing = Math.max(0, 32 - current.length)
    const additions = names
      .filter((name) => !current.some((entry) => entry.bot_name === name))
      .slice(0, missing)
      .map((bot_name) => ({
        tournament_id: tournament.id,
        user_id: null,
        is_bot: true,
        bot_name,
        status: 'registered',
      }))

    if (additions.length) {
      const { error: insertError } = await db.from('tournament_entries').insert(additions)
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const { data: allEntries, error: refreshedError } = await db
      .from('tournament_entries')
      .select('user_id,is_bot,bot_name')
      .eq('tournament_id', tournament.id)
      .order('id')
      .limit(32)

    if (refreshedError) return NextResponse.json({ error: refreshedError.message }, { status: 500 })
    const all = allEntries ?? []
    if (all.length !== 32) return NextResponse.json({ error: `Tournament ${tournament.name} has ${all.length}/32 entries.` }, { status: 409 })

    const { error: deleteError } = await db.from('matches').delete().eq('tournament_id', tournament.id)
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    const matches = []
    for (let index = 0; index < all.length; index += 2) {
      const first = all[index]
      const second = all[index + 1]
      matches.push({
        tournament_id: tournament.id,
        round: 'Round 1',
        player1: first.user_id,
        player2: second.user_id,
        player1_name: first.bot_name ?? 'You',
        player2_name: second.bot_name ?? 'You',
        table_number: index / 2 + 1,
        board: initialBoard(),
        move_number: 0,
        last_move_at: new Date().toISOString(),
        status: 'completed',
      })
    }

    const { error: matchError } = await db.from('matches').insert(matches)
    if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 })

    const champion_name = winnerName(all)
    const { error: updateError } = await db
      .from('tournaments')
      .update({ champion_name, status: 'completed' })
      .eq('id', tournament.id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    results.push({ tournament: tournament.name, filled: all.length, champion_name })
  }

  return NextResponse.json({ ok: true, total_filled: results.reduce((sum, item) => sum + item.filled, 0), results })
}
