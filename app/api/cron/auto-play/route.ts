import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()

    // Stop after 7:40pm WAT (18:40 UTC) - tournament over
    if (hour === 19 && minute > 40) {
      return NextResponse.json({ message: 'Tournament finished, showing winner till 8pm' })
    }
    if (hour >= 20) {
      return NextResponse.json({ message: 'Day over, back to normal' })
    }

    const { data: matches } = await supabase
      .from('tournament_matches')
      .select('*, tournaments!inner(status)')
      .eq('status', 'live')
      .neq('tournaments.status', 'finished')
      .limit(10)

    for (let m of matches || []) {
      const isFinal = m.round?.toLowerCase() === 'final'
      
      // YOUR 2 SEC MINIMUM RULE
      const delay = isFinal 
        ? 4000 + Math.random() * 6000 // Final: 4-10 sec
        : 2000 + Math.random() * 3000 // Normal: 2-5 sec
      
      await new Promise(r => setTimeout(r, delay))

      // --- YOUR REAL GAME ENGINE CALL HERE ---
      // const winner = yourEngine.playMove(m.id)
      // For now simulating:
      const isMatchOver = Math.random() > 0.7 // simulate match ending
      const winnerUsername = m.player1_username // replace with real winner

      if (isMatchOver) {
        await supabase.from('tournament_matches').update({
          status: 'finished',
          winner: winnerUsername,
          last_move_at: new Date().toISOString()
        }).eq('id', m.id)

        // IF THIS WAS FINAL - MARK TOURNAMENT FINISHED
        if (isFinal) {
          await supabase.from('tournaments').update({
            status: 'finished',
            winner_name: winnerUsername,
            winner_username: winnerUsername,
            finished_at: new Date().toISOString()
          }).eq('id', m.tournament_id)
        }
      } else {
        await supabase.from('tournament_matches').update({
          last_move_at: new Date().toISOString()
        }).eq('id', m.id)
      }
    }

    return NextResponse.json({ 
      ok: true, 
      processed: matches?.length || 0,
      time: now.toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
