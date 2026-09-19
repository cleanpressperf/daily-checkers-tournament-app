import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Clean dummy test matches
    await supabase.from('matches').delete().filter('player1_id','is',null)

    const { data: tournaments } = await supabase.from('tournaments').select('*').in('status',['registering','in_progress'])
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const botUsers = usersData.users.filter(u => u.email?.includes('@cleanpress.local'))
    const botIds = botUsers.map(u => u.id)

    const log:any[] = []

    for (const tour of tournaments || []) {
      const { data: entries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const count = entries?.length || 0

      if (tour.status === 'registering' && count < tour.max_players) {
        const existing = new Set(entries?.map(e=>e.user_id))
        const avail = botIds.filter(id=>!existing.has(id)).slice(0, tour.max_players - count)
        if (avail.length) {
          await supabase.from('tournament_entries').insert(avail.map(user_id=>({ tournament_id: tour.id, user_id })) as any)
        }
      }

      const { data: freshEntries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const { data: matches } = await supabase.from('matches').select('*').eq('tournament_id', tour.id).eq('round',1)

      if ((freshEntries?.length||0) >= tour.max_players && (!matches || matches.length === 0)) {
        const players = freshEntries!.map(e=>e.user_id)
        for (let i=players.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [players[i],players[j]]=[players[j],players[i]] }
        for (let i=0;i<players.length;i+=2){
          if(players[i+1]){
            await supabase.from('matches').
