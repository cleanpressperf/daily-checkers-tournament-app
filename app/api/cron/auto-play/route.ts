import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Clean dummy matches that have no players (from our tests)
    await supabase.from('matches').is('player1_id', null).delete()

    const { data: tournaments } = await supabase.from('tournaments').select('*').in('status',['registering','in_progress'])
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const botUsers = usersData.users.filter(u => u.email?.includes('@cleanpress.local'))
    const botIds = botUsers.map(u => u.id)

    const log:any[] = []

    for (const tour of tournaments || []) {
      const { data: entries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const count = entries?.length || 0

      // Fill if registering
      if (tour.status === 'registering' && count < tour.max_players) {
        const existing = new Set(entries?.map(e=>e.user_id))
        const avail = botIds.filter(id=>!existing.has(id)).slice(0, tour.max_players - count)
        if (avail.length) await supabase.from('tournament_entries').insert(avail.map(user_id=>({ tournament_id: tour.id, user_id })) as any)
      }

      // Ensure matches exist if full
      const { data: freshEntries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const { data: matches } = await supabase.from('matches').select('*').eq('tournament_id', tour.id).eq('round',1)

      if ((freshEntries?.length||0) >= tour.max_players && (!matches || matches.length === 0)) {
        const players = freshEntries!.map(e=>e.user_id)
        // shuffle
        for (let i=players.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [players[i],players[j]]=[players[j],players[i]] }
        for (let i=0;i<players.length;i+=2){
          if(players[i+1]){
            await supabase.from('matches').insert({ tournament_id: tour.id, round: 1, player1_id: players[i], player2_id: players[i+1], status: 'pending' } as any)
          }
        }
        await supabase.from('tournaments').update({ status: 'in_progress' }).eq('id', tour.id)
        log.push({ tournament: tour.name, action: 'created matches' })
      }

      // Auto-play pending matches
      const { data: pending } = await supabase.from('matches').select('*').eq('tournament_id', tour.id).eq('round',1).eq('status','pending').limit(5)
      for (const m of pending||[]){
        const winner = Math.random() > 0.5? (m as any).player1_id : (m as any).player2_id
        await supabase.from('matches').update({ winner_id: winner, status: 'completed', winner: winner } as any).eq('id', m.id)
        log.push({ tournament: tour.name, played: m.id, winner })
      }
    }

    return NextResponse.json({ ok: true, bots: botIds.length, log })
  } catch (e:any){
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
