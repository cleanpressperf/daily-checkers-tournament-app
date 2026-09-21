import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initialBoard, getLegalMoves, applyMove, type Piece, type Side } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: matches, error } = await db.from('matches').select('*').eq('status', 'playing').order('last_move_at', { ascending: true }).limit(12)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  let advanced = 0
  for (const match of matches ?? []) {
    const board = (Array.isArray(match.board) && match.board.length ? match.board : initialBoard()) as Piece[]
    const player = (match.move_number % 2 === 0 ? 'white' : 'black') as Side
    const moves = getLegalMoves(board, player)
    if (!moves.length) {
      await db.from('matches').update({ board, status: 'completed', winner_name: player === 'white' ? match.player2_name : match.player1_name, last_move_at: new Date().toISOString() }).eq('id', match.id)
      advanced++
      continue
    }
    const next = applyMove(board, moves[0])
    await db.from('matches').update({ board: next, move_number: (match.move_number ?? 0) + 1, last_move_at: new Date().toISOString(), status: 'playing' }).eq('id', match.id)
    advanced++
  }
  return NextResponse.json({ ok: true, advanced })
}
