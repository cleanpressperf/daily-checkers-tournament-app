import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96 } from '@/lib/bots/names'
import { initialBoard } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

const definitions = [
  { name: 'Bronze', entry_coins: 20, prize_naira: 500, prize: '$500' },
  { name: 'Silver', entry_coins: 50, prize_naira: 1000, prize: '$1000' },
  { name: 'Gold', entry_coins: 100, prize_naira: 2000, prize: '$2000' },
]

export async function GET() {
  const url = 'https://dgjgukagbpojidvuwwqz.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) return NextResponse.json({ error: 'Supabase key environment is not configured' }, { status: 500 })
  const db = createClient(url, key, { auth: { persistSession: false } })
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing, error } = await db.from('tournaments').select('*').in('status', ['open', 'upcoming', 'registering']).order('entry_coins')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  console.log('[v0] fill-brackets tournaments count:', existing?.length ?? 0)
  let tournaments = existing ?? []
  if (!tournaments.length) {
    const { data, error: insertError } = await db.from('tournaments').insert(definitions.map((t) => ({ ...t, max_players: 32, status: 'open', date: today, starts_at: new Date().toISOString() }))).select('*')
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    tournaments = data ?? []
  }

  const { data: users, error: usersError } = await db.from('users').select('*').limit(96)
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })
  const realPlayers = (users ?? []).map((user: Record<string, unknown>, index) => ({
    user_id: String(user.id ?? user.user_id ?? ''),
    bot_name: String(user.display_name ?? user.username ?? user.name ?? user.email ?? `Player ${index + 1}`),
  })).filter((player) => player.user_id)
  const players = realPlayers.length >= 96
    ? realPlayers.slice(0, 96)
    : BOT_NAMES_96.map((bot_name, index) => realPlayers[index] ?? { user_id: `bot-${index + 1}`, bot_name })

  const results: { tournament: string; filled: number; matches: number }[] = []
  for (const [tournamentIndex, tournament] of tournaments.slice(0, 3).entries()) {
    const desiredPlayers = players.slice(tournamentIndex * 32, tournamentIndex * 32 + 32)
    const { data: current, error: entriesError } = await db.from('tournament_entries').select('id,user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id')
    if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 500 })
    const entries = current ?? []
    const existingIds = new Set(entries.map((entry) => entry.user_id).filter(Boolean))
    const additions = desiredPlayers.filter((player) => !existingIds.has(player.user_id)).slice(0, Math.max(0, 32 - entries.length)).map((player) => ({ tournament_id: tournament.id, user_id: player.user_id, is_bot: !realPlayers.some((real) => real.user_id === player.user_id), bot_name: player.bot_name, status: 'registered' }))
    if (additions.length) {
      const { error: addError } = await db.from('tournament_entries').insert(additions)
      if (addError) return NextResponse.json({ error: addError.message }, { status: 500 })
    }
    const { data: allEntries, error: allError } = await db.from('tournament_entries').select('user_id,is_bot,bot_name').eq('tournament_id', tournament.id).order('id').limit(32)
    if (allError) return NextResponse.json({ error: allError.message }, { status: 500 })
    const all = allEntries ?? []
    await db.from('matches').delete().eq('tournament_id', tournament.id)
    const matches = []
    for (let index = 0; index < all.length; index += 2) {
      const first = all[index], second = all[index + 1]
      if (!second) continue
      const board = initialBoard()
      matches.push({ tournament_id: tournament.id, round: 'Round 1', player1: first.user_id, player2: second.user_id, player1_name: first.bot_name || 'Player 1', player2_name: second.bot_name || 'Player 2', table_number: index / 2 + 1, board, board_state: board, move_number: 0, last_move_at: new Date().toISOString(), status: 'playing' })
    }
    const { error: matchError } = await db.from('matches').insert(matches)
    if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 })
    await db.from('tournaments').update({ status: 'playing' }).eq('id', tournament.id)
    results.push({ tournament: tournament.name, filled: all.length, matches: matches.length })
  }
  return NextResponse.json({ ok: true, results })
}
