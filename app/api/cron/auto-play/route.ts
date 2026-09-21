import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initialBoard, getLegalMoves, applyMove, type Piece, type Side } from '@/lib/draughts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Supabase service role environment is not configured' }, { status: 500 })
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { data: matches, error } = await db.from('matches').select('*').eq('status', 'playing').order('last_move_at', { ascending: true }).limit(32)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  let advanced = 0
  for (const match of matches ?? []) {
    const board = (Array.isArray(match.board_state) && match.board_state.length ? match.board_state : match.board) as Piece[] || initialBoard()
    const side = (match.move_number % 2 === 0 ? 'white' : 'black') as Side
    const moves = getLegalMoves(board, side)
    if (!moves.length || board.filter((piece) => piece.side === side).length === 0) {
      const winnerName = side === 'white' ? match.player2_name : match.player1_name
      await db.from('matches').update({ board, board_state: board, status: 'completed', winner_name: winnerName, last_move_at: new Date().toISOString() }).eq('id', match.id)
      advanced++
      continue
    }
    const next = applyMove(board, moves[0])
    await db.from('matches').update({ board: next, board_state: next, move_number: (match.move_number ?? 0) + 1, last_move_at: new Date().toISOString(), status: 'playing' }).eq('id', match.id)
    advanced++
  }
  return NextResponse.json({ ok: true, advanced, playing: matches?.length ?? 0 })
}
