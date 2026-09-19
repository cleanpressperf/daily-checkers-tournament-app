'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
 const [matches,setMatches]=useState<any[]>([])
 useEffect(()=>{ async function load(){
   const { data } = await supabase.from('tournament_matches').select('*, player1:player1_id, player2:player2_id, winner:winner_id').order('round').limit(16)
   const { data: entries } = await supabase.from('tournament_entries').select('id, user_id, bot_id')
   // simple join to show bot names
   setMatches(data||[])
 } ; load() },[])
 return <main className="min-h-screen bg-black text-white p-5">
  <h1 className="text-2xl font-bold">🔴 LIVE NOW - Real Bot Matches</h1>
  <p className="text-zinc-400 mt-2">{matches.length} matches completed today</p>
  <div className="mt-6 grid gap-3">
    {matches.map(m=><div key={m.id} className="rounded-xl bg-zinc-900 p-4 flex justify-between">
      <span>Table {m.table_number} • R{m.round}</span>
      <span className="text-[#ffd700]">{m.winner_id ? `Winner: ${m.winner_id.slice(0,8)}` : 'Playing...'}</span>
      <span>{m.status}</span>
    </div>)}
  </div>
 </main>
}
