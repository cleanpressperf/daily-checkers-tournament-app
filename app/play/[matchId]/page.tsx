'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'

export default function LiveMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [match, setMatch] = useState<any>(null)
  const [updatedAt, setUpdatedAt] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const response = await fetch(`/api/matches/${params.then ? (await params).matchId : ''}`, { cache: 'no-store' })
      if (!response.ok || !active) return
      const data = await response.json()
      setMatch(data.match)
      setUpdatedAt(new Date().toLocaleTimeString())
    }
    void load()
    const timer = window.setInterval(() => void load(), 2000)
    return () => { active = false; window.clearInterval(timer) }
  }, [params])

  return <main className="min-h-screen bg-black p-5 text-white">
    <Link href="/tournaments" className="inline-flex items-center gap-2 text-zinc-400"><ArrowLeft className="size-4" />Back</Link>
    <div className="mx-auto max-w-5xl py-10">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400"><Eye className="size-4" />Live viewer · polling every 2s</div>
      <h1 className="mt-3 text-3xl font-bold">{match?.player1_name || 'Player 1'} vs {match?.player2_name || 'Player 2'}</h1>
      <p className="mt-2 text-zinc-400">Table {match?.table_number || '—'} · Round {match?.round || '—'} · {match?.status || 'connecting'}</p>
      <div className="mt-8 grid aspect-square max-w-[620px] grid-cols-10 overflow-hidden rounded-2xl border border-white/10 bg-[#d8b46a] shadow-2xl">
        {Array.from({ length: 100 }, (_, index) => <div key={index} className={`grid place-items-center ${(Math.floor(index / 10) + index) % 2 === 0 ? 'bg-[#f1d89d]' : 'bg-[#6b482f]'}`}><span className="text-lg">{String(match?.board?.[index] || '')}</span></div>)}
      </div>
      <p className="mt-4 text-xs text-zinc-500">Last update: {updatedAt || 'waiting'} · Move {match?.move_number || 0}</p>
    </div>
  </main>
}
