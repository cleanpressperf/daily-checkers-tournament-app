import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getBotMove(board: any) {
  // Your existing grandmaster logic - simple placeholder
  // Replace with your actual bot engine import if you have one
  const moves = board?.validMoves || []
  return moves[Math.floor(Math.random() * moves.length)]
}

export async function GET() {
  try {
    const { data: matches } = await supabase
     .from('tournament_matches')
     .select('*')
     .eq('status', 'live')
     .limit(15)

    for (let m of matches || []) {
      // MINIMUM 2 SECONDS RULE
      const isFinal = m.round === 'FINAL' || m.round === 'Final'
      const delay = isFinal 
        ? 4000 + Math.random() * 6000  // Final: 4-10 sec
        : 2000 + Math.random() * 3000  // Normal: 2-5 sec

      await new Promise(r => setTimeout(r, delay))

      // Here call your real move engine
      // For now just marks move - replace with actual
      await supabase.from('tournament_matches').update({
        last_move_at: new Date().toISOString()
      }).eq('id', m.id)
    }

    return NextResponse.json({ ok: true, processed: matches?.length || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
