'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, CircleDollarSign, Clock3, Eye, Menu, Play, Shield, Sparkles, Trophy, Users, X } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5" /></span>BOARDROOM</Link>
      <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
        <Link className="text-white" href="/">Home</Link>
        <Link href="/tournaments">Tournaments</Link>
        <Link href="/practice">Practice</Link>
        <Link href="/buy">Buy coins</Link>
        <Link href="/login" className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black">Sign In</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Sign In</Link>
        <button aria-label="Open menu" onClick={() => setOpen(!open)} className="grid size-9 place-items-center rounded-full border border-white/10 md:hidden">{open? <X className="size-4" /> : <Menu className="size-4" />}</button>
      </div>
      {open && (
        <div className="absolute left-5 right-5 top-20 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm shadow-2xl md:hidden">
          <Link href="/tournaments" onClick={() => setOpen(false)}>Tournaments</Link>
          <Link href="/practice" onClick={() => setOpen(false)}>Practice</Link>
          <Link href="/buy" onClick={() => setOpen(false)}>Buy coins</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-black">Sign In</Link>
        </div>
      )}
    </header>
  )
}

function TournamentCard({ t }: { t: any }) {
  if (t.status === 'finished' && t.winner_name) {
    const hour = new Date().getHours()
    if (hour >= 19 && hour < 20) {
      return (
        <article className={t.tone + ' rounded-[24px] p-5 text-black'}>
          <div className="text-center py-4">
            <h1 className="text-sm font-bold uppercase tracking-widest">Today&apos;s Winner</h1>
            <h2 className="text-3xl font-black mt-3">{t.winner_name}</h2>
            <p className="text-xs mt-2 opacity-60">Ended at {t.finished_at}</p>
            <p className="text-xs mt-1 font-semibold">Next tournament tomorrow 7pm WAT</p>
          </div>
        </article>
      )
    }
  }

  function handleWatch(e: any) {
    e.preventDefault()
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit' }).formatToParts(new Date())
    const h = Number(parts.find((p) => p.type === 'hour')?.value || 0)
    const isLive = h >= 19 && h < 20
    if (isLive) {
      window.location.href = '/play/demo-match'
    } else {
      const el = document.getElementById('watch-popup') as any
      if (el) el.style.display = 'flex'
    }
  }

  const widthPercent = (t.joined / 32) * 100 + '%'

  return (
    <article className={t.tone + ' rounded-[24px] p-5 text-black'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">{t.name} tournament</p>
          <h3 className="mt-2 text-2xl font-semibold">Win
