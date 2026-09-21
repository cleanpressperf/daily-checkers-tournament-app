'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import type { Piece } from '@/lib/draughts'

export default function LiveMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [match, setMatch] = useState<any>(null)
  const [matchId, setMatchId] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => { void params.then(value => setMatchId(value.matchId)) }, [params])
  useEffect(() => {
    if (!matchId) return
    let active = true
    const load = async () => {
      try {
        const response = await fetch(`/api/matches/${matchId}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('match unavailable')
        const data = await response.json()
        if (active) { setMatch(data.match); setLastUpdate(new Date()); setError(false) }
      } catch { if (active) setError(true) }
    }
    void load()
    const timer = window.setInterval(() => void load(), 2000)
    return () => { active = false; window.clearInterval(timer) }
  }, [matchId])

  const board = (match?.board_state || match?.board || []) as Piece[]
  const pieceAt = (index: number) => board.find(piece => piece.row * 10 + piece.col === index)
  const age = lastUpdate ? Math.max(0, Math.floor((Date.now() - lastUpdate.getTime()) / 1000)) : null

  return <main className="min-h-screen bg-black p-5 text-white">
    <Link href="/tournaments" className="inline-flex items-center gap-2 text-zinc-400"><ArrowLeft className="size-4" />Back</Link>
    <div className="mx-auto max-w-5xl py-10">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400"><Eye className="size-4" />Live viewer · polling every 2s</div>
      <h1 className="mt-3 text-3xl font-bold">{match?.player1_name || '—'} vs {match?.player2_name || '—'}</h1>
      <p className="mt-2 text-zinc-400">Table {match?.table_number || '—'} · {match?.round || '—'} · Live</p>
      <div className="mt-8 grid aspect-square max-w-[620px] grid-cols-10 overflow-hidden rounded-2xl border border-white/10 bg-[#d8b46a] shadow-2xl">
        {Array.from({ length: 100 }, (_, index) => { const piece = pieceAt(index); return <div key={index} className={`grid place-items-center ${(Math.floor(index / 10) + index) % 2 === 0 ? 'bg-[#f1d89d]' : 'bg-[#6b482f]'}`}><span className={`grid size-[70%] place-items-center rounded-full border-2 text-sm font-bold shadow-lg ${piece?.side === 'white' ? 'border-zinc-200 bg-white text-black' : 'border-zinc-950 bg-zinc-900 text-white'}`}>{piece ? piece.king ? 'K' : '' : ''}</span></div> })}
      </div>
      <p className="mt-4 text-xs text-zinc-500">Last update: {age === null ? 'waiting' : `${age}s ago`} · Move {match?.move_number || 0}</p>
    </div>
  </main>
}
