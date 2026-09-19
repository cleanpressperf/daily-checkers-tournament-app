import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  try {
    await supabase.from('matches').delete().filter('player1_id','is',null)
    const { data: tournaments } = await supabase.from('tournaments').select('*').in('status',['registering','in_progress'])
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const botUsers = usersData.users.filter(function(u:any){ return u.email && u.email.indexOf('@cleanpress.local')>-1 })
    const botIds = botUsers.map(function(u:any){ return u.id })
    const log:any[] = []
    for (let ti=0; ti<(tournaments||[]).length; ti++) {
      const tour = (tournaments as any)[ti]
      const { data: entries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const count = entries? entries.length : 0
      if (tour.status === 'registering' && count < tour.max_players) {
        const existing = new Set(entries? entries.map(function(e:any){return e.user_id}) : [])
        const avail:any[] = []
        for (let k=0;k<botIds.length;k++){ if (!existing.has(botIds[k])) avail.push(botIds[k]) }
        const need = tour.max_players - count
        const toAdd = avail.slice(0, need)
        if (toAdd.length) {
          const rows = toAdd.map(function(user_id:any){ return { tournament_id: tour.id, user_id: user_id } })
          await supabase.from('tournament_entries').insert(rows as any)
        }
      }
      const { data: freshEntries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const { data: matches } = await supabase.from('matches').select('*').eq('tournament_id', tour.id).eq('round',1)
      if (freshEntries && freshEntries.length >= tour.max_players && (!matches || matches.length === 0)) {
        const players = freshEntries.map(function(e:any){return e.user_id})
        for (let i=players.length-1;i>0;i--){
          const j = Math.floor(Math.random()*(i+1))
          const tmp = players[i]
          players[i]=players[j]
          players[j]=tmp
        }
        for (let i=0;i<players.length;i+=2){
          if (players[i+1]){
            await supabase.from('matches').insert({ tournament_id: tour.id, round: 1, player1_id: players[i], player2_id: players[i+1], status: 'pending' } as any)
          }
        }
        await supabase.from('tournaments').update({ status: 'in_progress' }).eq('id', tour.id)
        log.push({ tournament: tour.name, action: 'created matches' })
      }
      const { data: pending } = await supabase.from('matches').select('*').eq('tournament_id', tour.id).eq('round',1).eq('status','pending').limit(5)
      if (pending){
        for (let pi=0; pi<pending.length; pi++){
          const m = pending[pi] as any
          const winner = Math.random() > 0.5? m.player1_id : m.player2_id
          await supabase.from('matches').update({ winner_id: winner, status: 'completed' } as any).eq('id', m.id)
          log.push({ tournament: tour.name, played: m.id, winner: String(winner).slice(0,8) })
        }
      }
    }
    return NextResponse.json({ ok: true, bots: botIds.length, log: log })
  } catch (e:any){
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
