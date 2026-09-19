'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Eye, Users } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

function Card({t}: {t:any}) {
  const pct = Math.round((t.joined / t.max_players) * 100)
  return (
    <article className="rounded-[24px] bg-[#f3f3f3] p-5 text-black">
      <div className="flex justify-between items-center">
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-50">{t.name} TOURNAMENT</p>
        <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-bold">🔴 {t.status.toUpperCase()}</span>
      </div>
      <h3 className="mt-3 text-[28px] font-bold">Win <Coins>{t.prize.toLocaleString()}</Coins></h3>
      <div className="mt-5 flex justify-between text-sm">
        <div><p className="opacity-50">Entry</p><p className="flex items-center gap-1 font-bold text-[18px]"><CircleDollarSign className="size-4"/>{t.entry}</p></div>
        <div className="text-right"><p className="flex items-center justify-end gap-1 opacity-60"><Users className="size-4"/>{t.joined}/{t.max_players}</p><div className="mt-2 h-2 w-24 rounded-full bg-black/10"><div className="h-2 rounded-full bg-black" style={{width:`${pct}%`}}></div></div></div>
      </div>
      <div className="mt-5 flex gap-2">
        <Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-semibold text-white">Join now <ArrowRight className="size-4"/></Link>
        <Link href="/play/demo-match" className="grid size-12 place-items-center rounded-xl bg-black/10"><Eye className="size-5"/></Link>
      </div>
    </article>
  )
}

export default function TournamentsPage(){
  const [tours,setTours]=useState<any[]>([
    { name: 'Bronze', entry: 300, prize: 3000, joined: 32, max_players: 32, status: 'in_progress' },
    { name: 'Silver', entry: 700, prize: 5000, joined: 32, max_players: 32, status: 'in_progress' },
    { name: 'Gold', entry: 1000, prize: 15000, joined: 32, max_players: 32, status: 'in_progress' },
  ])

  useEffect(()=>{
    async function load(){
      const { data } = await supabase.from('tournaments').select('*')
      if(!data) return
      const withCounts = await Promise.all(data.map(async (tt:any)=>{
        const { count } = await supabase.from('tournament_entries').select('*', {count:'exact', head:true}).eq('tournament_id', tt.id)
        return { name: tt.name, entry: tt.entry_coins, prize: tt.prize_naira, joined: count||32, max_players: tt.max_players, status: tt.status }
      }))
      setTours(withCounts.sort((a,b)=>a.entry-b.entry))
    }
    load()
  },[])

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-6">
        <h1 className="text-[32px] font-bold leading-none">Choose your table</h1>
        <p className="mt-2 text-zinc-400">🔴 LIVE NOW - {tours.reduce((s,t)=>s+t.joined,0)} bots playing</p>
        <div className="mt-6 grid gap-4">
          {tours.map(t=><Card key={t.name} t={t}/>)}
        </div>
      </div>
    </main>
  )
}
