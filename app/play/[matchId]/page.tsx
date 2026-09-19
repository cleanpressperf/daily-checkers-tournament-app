'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
 const [matches,setMatches]=useState<any[]>([])
 useEffect(()=>{ 
  async function load(){
   const { data } = await supabase.from('tournament_matches').select('*').order('created_at', {ascending:false}).limit(20)
   setMatches(data||[])
  }
  load()
 },[])

 return (
  <main className="min-h-screen bg-black text-white p-5">
   <Link href="/" className="inline-flex items-center gap-2 text-zinc-400"><ArrowLeft className="size-4"/>Back</Link>
   <h1 className="mt-8 text-2xl font-bold">🔴 LIVE NOW - Real Bot Matches</h1>
   <p className="mt-2 text-zinc-400">{matches.length} matches today • 32/32 bots</p>
   <div className="mt-6 grid gap-3">
     {matches.length===0 && <p className="text-zinc-500">No matches yet - bots will auto-play at 7PM WAT</p>}
     {matches.map(m=>(
       <div key={m.id} className="flex justify-between rounded-xl bg-zinc-900 p-4 text-sm">
         <span>Table {m.table_number || 1} • R{m.round || 1}</span>
         <span className="text-[#ffd700]">{m.winner_id ? `Winner: ${String(m.winner_id).slice(0,8)}` : 'Playing...'}</span>
         <span className="capitalize">{m.status || 'in_progress'}</span>
       </div>
     ))}
   </div>
  </main>
 )
}
