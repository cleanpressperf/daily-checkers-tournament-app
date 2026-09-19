import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // TEST MODE - NO TIME CHECK, ALWAYS RUNS
    const { data: matches, error } = await supabase
    .from('tournament_matches')
    .select('id, tournament_id, round, status, current_turn, player1_username, player2_username, board_fen')
    .eq('status', 'live')
    .limit(20)

    if (error) throw error

    if (!matches || matches.length === 0) {
      return NextResponse.json({ ok: true, message: 'No live matches found - need to run fill-brackets first', processed: 0 })
    }

    let processed = 0
    for (const m of matches) {
      const nextTurn = m.current_turn === 'player1' ? 'player2' : 'player1'
      
      await supabase.from('tournament_matches').update({
        current_turn: nextTurn,
        last_move_at: new Date().toISOString(),
      }).eq('id', m.id)
      processed++
    }

    return NextResponse.json({ ok: true, processed, message: `Moved ${processed} boards - check your site now!` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
