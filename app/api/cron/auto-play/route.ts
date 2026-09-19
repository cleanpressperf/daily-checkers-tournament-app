import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!)

import { BOT_NAMES_96 } from '@/lib/bots' // if your file is elsewhere, change path

export async function GET() {
  const now = new Date()

  // 1. Get active tournament
  const { data: tournaments } = await supabase.from('tournaments').select('*').order('created_at',{ascending:false}).limit(1)
  let tournament = tournaments?.[0]

  if(!tournament){
    // Create first tournament ever
    const { data } = await supabase.from('tournaments').insert({ status: 'in_progress', current_round: 1 }).select().single()
    tournament = data
  }

  // 2. If tournament completed, check 30 min window
  if(tournament.status === 'completed'){
    const endedAt = new Date(tournament.completed_at || tournament.updated_at)
    const diffMins = (now.getTime() - endedAt.getTime()) / 60000

    if(diffMins < 30){
      // STILL IN 30 MIN WINNER DISPLAY MODE - Eye page will show winner
      return Response.json({ ok:true, mode:'winner_display', winner: tournament.winner_name, remaining: Math.ceil(30-diffMins) })
    } else {
      // 30 MINS OVER - START NEW TOURNAMENT
      const { data: newT } = await supabase.from('tournaments').insert({ status: 'in_progress', current_round: 1 }).select().single()
      // Clear old matches
      await supabase.from('tournament_matches').delete().neq('id',0)
      // Fill 32 random bots from 96
      const shuffled = [...BOT_NAMES_96].sort(()=>0.5-Math.random()).slice(0,32)
      const matches = shuffled.map((_,i)=> i%2===0? {
        tournament_id: newT.id,
        table_number: i/2+1,
        round: 1,
        player1_id: shuffled[i],
        player2_id: shuffled[i+1],
        status: 'playing'
      } : null).filter(Boolean)
      await supabase.from('tournament_matches').insert(matches as any)
      return Response.json({ ok:true, mode:'new_tournament_started', id: newT.id })
    }
  }

  // 3. Tournament in_progress - simulate it ending randomly (e.g., after ~50 mins)
  const startedAt = new Date(tournament.created_at)
  const runMins = (now.getTime() - startedAt.getTime()) / 60000

  if(runMins > 55){ // End tournament after ~55 mins of playing
    const winner = BOT_NAMES_96[Math.floor(Math.random()*BOT_NAMES_96.length)]
    await supabase.from('tournaments').update({
      status: 'completed',
      winner_name: winner,
      completed_at: now.toISOString()
    }).eq('id', tournament.id)

    return Response.json({ ok:true, mode:'tournament_ended', winner })
  }

  // 4. Still playing - update live matches
  const { data: liveMatches } = await supabase.from('tournament_matches').select('*').eq('tournament_id', tournament.id)
  if(liveMatches){
    for(const m of liveMatches){
      if(Math.random()>0.7){
        await supabase.from('tournament_matches').update({
          winner_id: Math.random()>0.5? m.player1_id : m.player2_id,
          status: 'completed'
        }).eq('id', m.id)
      }
    }
  }

  return Response.json({ ok:true, mode:'playing', runMins: Math.ceil(runMins) })
}
