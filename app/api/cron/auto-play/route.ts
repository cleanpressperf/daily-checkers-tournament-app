import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initialBoard, getLegalMoves, applyMove, type Piece, type Side } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: matches, error } = await db.from('matches').select('*').eq('status', 'playing').order('last_move_at', { ascending: true }).limit(12)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  let moved = 0
  for (const match of matches ?? []) {
    const board = (match.board && Array.isArray(match.board) && match.board.length ? match.board : initialBoard()) as Piece[]
    const player = (match.move_number % 2 === 0 ? 'white' : 'black') as Side
    const moves = getLegalMoves(board, player)
    if (!moves.length) {
      await db.from('matches').update({ status: 'completed', winner_name: player === 'white' ? match.player2_name : match.player1_name }).eq('id', match.id)
      continue
    }
    const move = moves[0]
    const next = applyMove(board, move)
    await db.from('matches').update({ board: next, move_number: (match.move_number ?? 0) + 1, last_move_at: new Date().toISOString(), status: 'playing' }).eq('id', match.id)
    moved++
  }
  return NextResponse.json({ ok: true, moved })
}
