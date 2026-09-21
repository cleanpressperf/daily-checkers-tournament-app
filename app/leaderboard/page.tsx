'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function LeaderboardPage() {
  const [champions, setChampions] = useState<{ name: string; champion_name: string | null; prize_naira: number }[]>([])

  useEffect(() => {
    void supabase.from('tournaments').select('name, champion_name, prize_naira').not('champion_name', 'is', null).order('date', { ascending: false }).then(({ data }) => setChampions(data ?? []))
  }, [])

  return <main className="min-h-screen bg-black px-5 py-16 text-white"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4a900]">Leaderboard</p><h1 className="mt-4 text-5xl font-semibold">Tournament champions</h1><div className="mt-10 space-y-3">{champions.map((champion) => <article key={`${champion.name}-${champion.champion_name}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-5"><div className="flex items-center gap-3"><Trophy className="size-5 text-[#d4a900]" aria-label="Champion" /><div><p className="font-semibold">{champion.champion_name}</p><p className="text-sm text-white/50">{champion.name}</p></div></div><p className="text-sm text-white/60">₦{champion.prize_naira.toLocaleString()}</p></article>)}</div></div></main>
}
