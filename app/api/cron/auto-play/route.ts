import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const utcHour = now.getUTCHours()

    // Stop after 7:40pm WAT = 18:40 UTC
    if (utcHour === 18 && now.getUTCMinutes() > 40) {
      return NextResponse.json({ message: 'Tournament finished phase' })
    }
    if (utcHour >= 19) {
      return NextResponse.json({ message: 'Day over' })
    }

    const { data: matches } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, round, status, board_fen, player1_username, player2_username, current_turn')
      .eq('status', 'live')
      .limit(20)

    if (!matches || matches.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    let processed = 0

    for (const m of matches) {
      // DO NOT SLEEP HERE - 2 sec rule is for FRONTEND animation, not cron
      // Cron should move instantly, frontend shows 2 sec delay

      // === PLUG YOUR REAL ENGINE HERE ===
      // Example if your engine file is @/lib/checkers/engine
      // import { getBestMove } from '@/lib/checkers/engine'
      // const result = getBestMove(m.board_fen)

      // TEMPORARY - Replace with real move:
      // For now we just flip turn and update timestamp so board re-renders
      // You need to replace this with: const { newFen, isGameOver, winner } = yourEngine.makeMove(m.board_fen)

      const nextTurn = m.current_turn === 'white' || m.current_turn === 'player1' ? 'black' : 'white'
      const isGameOver = false // Replace with real check: result.isGameOver

      if (isGameOver) {
        // Mark match finished
        await supabase.from('tournament_matches').update({
          status: 'finished',
          winner: m.player1_username, // replace with real winner
          last_move_at: new Date().toISOString()
        }).eq('id', m.id)

        if (m.round?.toLowerCase() === 'final') {
          await supabase.from('tournaments').update({
            status: 'finished',
            winner_name: m.player1_username,
            winner_username: m.player1_username,
            finished_at: new Date().toISOString()
          }).eq('id', m.tournament_id)
        }
      } else {
        // Just make a move
        await supabase.from('tournament_matches').update({
          // board_fen: newFen, // UNCOMMENT WHEN YOU PLUG ENGINE
          current_turn: nextTurn,
          last_move_at: new Date().toISOString()
        }).eq('id', m.id)
      }

      processed++
    }

    return NextResponse.json({ ok: true, processed, time: now.toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
