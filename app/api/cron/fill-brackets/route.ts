import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
 
const BOT_NAMES = Array.from({length:96},(_,i)=>`Bot_${i+1}`)

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    let { data: tournaments } = await supabase.from('tournaments').select('id').eq('date', today).limit(1)
    let tournamentId: string
    if (!tournaments || tournaments.length === 0) {
      const attempts = [
        { date: today, status: 'live', name: `Daily ${today}`, start_time: new Date().toISOString() },
        { date: today, status: 'live', name: `Daily ${today}` },
        { date: today, status: 'active', name: `Daily ${today}` },
        { date: today },
      ]
      let newT:any = null; let lastErr:any=null
      for (const payload of attempts) {
        const { data, error } = await supabase.from('tournaments').insert(payload).select('id').single()
        if (data) { newT = data; break }
        lastErr = error
      }
      if (!newT) throw new Error(`Failed create: ${lastErr?.message}`)
      tournamentId = newT.id
    } else {
      tournamentId = tournaments[0].id
      await supabase.from('tournaments').update({ status: 'live' }).eq('id', tournamentId)
    }
    const { data: existing } = await supabase.from('tournament_players').select('id, username').eq('tournament_id', tournamentId)
    const need = 32 - (existing?.length || 0)
    if (need > 0) {
      const names = new Set(existing?.map(p=>p.username))
      const toAdd = BOT_NAMES.filter(n=>!names.has(n)).slice(0, need)
      const bots = toAdd.map(username => ({ tournament_id: tournamentId, username, is_bot: true, is_human: false }))
      if (bots.length) await supabase.from('tournament_players').insert(bots)
    }
    const { count } = await supabase.from('tournament_matches').select('*', { count: 'exact', head: true }).eq('tournament_id', tournamentId)
    if ((count || 0) === 0) {
      const { data: allPlayers } = await supabase.from('tournament_players').select('id, username').eq('tournament_id', tournamentId)
      if (allPlayers && allPlayers.length >= 2) {
        const shuf = [...allPlayers].sort(()=>Math.random()-0.5)
        const matches:any[]=[]
        for(let table=0; table<8; table++){
          const tp = shuf.slice(table*4, (table+1)*4)
          for(let a=0;a<tp.length;a++) for(let b=a+1;b<tp.length;b++){
            matches.push({ tournament_id: tournamentId, player1_username: tp[a].username, player2_username: tp[b].username, player1_id: tp[a].id, player2_id: tp[b].id, table_number: table+1, round: `Table ${table+1}`, status: 'live', current_turn: 'player1', board_fen: 'startpos' })
          }
        }
        if (matches.length) await supabase.from('tournament_matches').insert(matches)
      }
    }
    return NextResponse.json({ success: true, tournament_id: tournamentId, mode: "24/7 LIVE" })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
