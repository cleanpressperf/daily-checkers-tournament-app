import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initialBoard } from '@/lib/draughts'

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
    const { data: playing } = await db.from('matches').select('id').eq('tournament_id', tournament.id).eq('status', 'playing').limit(1)
    if (playing?.length) continue

    const { data: completed } = await db.from('matches').select('round,winner_name,player1_name,player2_name,player1,player2').eq('tournament_id', tournament.id).eq('status', 'completed').not('winner_name', 'is', null).order('round').order('last_move_at', { ascending: false })
    if (!completed?.length) continue
    const roundNumbers = completed.map((match) => Number(String(match.round).replace(/\\D/g, '')) || 1)
    const currentRound = Math.max(...roundNumbers)
    const finalists = completed.filter((match) => (Number(String(match.round).replace(/\\D/g, '')) || 1) === currentRound).map((match) => match.winner_name).filter(Boolean)
    if (finalists.length > 1) {
      const nextRound = `Round ${currentRound + 1}`
      const { data: existingNext } = await db.from('matches').select('id').eq('tournament_id', tournament.id).eq('round', nextRound).limit(1)
      if (!existingNext?.length) {
        const nextMatches = []
        for (let index = 0; index < finalists.length; index += 2) {
          if (!finalists[index + 1]) continue
          const board = initialBoard()
          nextMatches.push({ tournament_id: tournament.id, round: nextRound, player1_name: finalists[index], player2_name: finalists[index + 1], table_number: index / 2 + 1, board, board_state: board, move_number: 0, last_move_at: new Date().toISOString(), status: 'playing' })
        }
        if (nextMatches.length) await db.from('matches').insert(nextMatches)
      }
      continue
    }
    const winner = finalists[0]
    if (!winner) continue
    const trophy_url = `/trophies/${String(tournament.name).toLowerCase()}.png`
    const update = await db.from('tournaments').update({ champion_name: winner, prize: prizes[tournament.name] ?? '$500', trophy_url, status: 'finished' }).eq('id', tournament.id)
    if (!update.error) champions.push({ tournament: tournament.name, champion_name: winner, prize: prizes[tournament.name] ?? '$500', trophy_url })
  }
  return NextResponse.json({ ok: true, champions })
}
