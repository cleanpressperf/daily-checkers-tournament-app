'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, CircleDollarSign, Clock3, Eye, Menu, Play, Shield, Sparkles, Trophy, Users, X } from 'lucide-react'

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
      <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex"><Link className="text-white" href="/">Home</Link><Link href="/tournaments">Tournaments</Link><Link href="/practice">Practice</Link><Link href="/buy">Buy coins</Link></nav>
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Sign In</Link>
        <button onClick={() => setOpen(!open)} className="grid size-9 place-items-center rounded-full border border-white/10 md:hidden">{open? <X className="size-4" /> : <Menu className="size-4" />}</button>
      </div>
      {open && (
        <div className="absolute left-5 right-5 top-20 z-50 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm shadow-2xl md:hidden">
          <Link href="/" onClick={()=>setOpen(false)}>Home</Link>
          <Link href="/tournaments" onClick={()=>setOpen(false)}>Tournaments</Link>
          <Link href="/practice" onClick={()=>setOpen(false)}>Practice</Link>
          <Link href="/buy" onClick={()=>setOpen(false)}>Buy coins</Link>
          <Link href="/login" onClick={()=>setOpen(false)} className="block rounded-full bg-white py-3 text-center text-sm font-semibold text-black">Sign In / Create Account</Link>
        </div>
      )}
    </header>
  )
}

function TournamentCard({ t }: { t: typeof tournaments[number] & { status?: string, winner_name?: string, finished_at?: string } }) {
  if ((t as any).status === 'finished' && (t as any).winner_name) {
    const hour = new Date().getHours()
    if (hour >= 19 && hour < 20) {
      return (
        <article className={`${t.tone} rounded-[24px] p-5 text-black`}>
          <div className="text-center py-4">
            <h1 className="text-sm font-bold uppercase tracking-widest">🏆 Today's Winner</h1>
            <h2 className="text-3xl font-black mt-3">{(t as any).winner_name}</h2>
            <p className="text-xs mt-2 opacity-60">Ended at {(t as any).finished_at}</p>
            <p className="text-xs mt-1 font-semibold">Next tournament tomorrow 7pm WAT</p>
          </div>
        </article>
      )
    }
  }
  function handleWatch(e: any) {
    e.preventDefault();
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit' }).formatToParts(new Date());
    const h = Number(parts.find(p => p.type === 'hour')?.value || 0);
    const isLive = h >= 19 && h < 20;
    if (isLive) { window.location.href = '/play/demo-match'; }
    else { const el = document.getElementById('watch-popup') as any; if (el) { el.style.display = 'flex'; } }
  }
  return <article className={`${t.tone} rounded-[24px] p-5 text-black`}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">{t.name} tournament</p><h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize.toLocaleString()}</Coins></h3></div><span className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">Daily</span></div><div className="mt-8 flex items-end justify-between"><div className="text-sm text-black/55"><p>Entry</p><p className="mt-1 text-base font-semibold text-black"><Coins>{t.entry}</Coins></p></div><div className="text-right text-sm text-black/55"><p className="flex items-center justify-end gap-1"><Users className="size-3" />{t.joined}/32 joined</p><div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-black" style={{ width: `${(t.joined / 32) * 100}%` }} /></div></div></div></div><div className="mt-5 flex gap-2"><Link href="/tournaments" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">Join now <ArrowRight className="size-4" /></Link><button onClick={handleWatch} className="grid size-11 place-items-center rounded-xl bg-black/10"><Eye className="size-4" /></button></div></article>
}

export default function Page() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const getSecondsToLagosSeven = () => {
      const now = new Date()
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
      const current = Number(parts.find(part => part.type === 'hour')?.value || 0) * 3600 + Number(parts.find(part => part.type === 'minute')?.value || 0) * 60 + Number(parts.find(part => part.type === 'second')?.value || 0)
      return (19 * 3600 - current + 24 * 3600) % (24 * 3600)
    }
    const update = () => setSeconds(getSecondsToLagosSeven())
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0'); const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'); const secs = String(seconds % 60).padStart(2, '0')
  return <main className="min-h-screen bg-black text-white"><Nav /><section className="mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-10 lg:pt-24"><div className="grid gap-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-zinc-300"><span className="size-1.5 rounded-full bg-[#ffd700]" />Next tournament starts at 7:00 PM WAT</div><h1 className="max-w-3xl text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">The board is set.<br /><span className="text-zinc-500">Make your move.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">Daily cash tournaments for players who know the difference between luck and skill.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/tournaments" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black">Enter a tournament <ArrowRight className="ml-2 inline size-4" /></Link><Link href="/practice" className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold">Practice free</Link></div></div><div className="rounded-[28px] border border-white/10 bg-zinc-950 p-6"><div className="flex items-center justify-between text-sm text-zinc-400"><span>Next tournament in</span><Clock3 className="size-4" /></div><div className="mt-5 text-6xl font-medium tracking-[-0.06em] tabular-nums">{hours}:{mins}:{secs}</div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500"><span>Every day · 7:00 PM WAT</span><span className="text-white">3 prizes live</span></div></div></div></section><section className="mx-auto max-w-7xl px-5 pb-24 lg:px-10"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Tonight&apos;s games</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Choose your table</h2></div><Link href="/tournaments" className="hidden items-center gap-2 text-sm text-zinc-400 md:flex">View all <ArrowRight className="size-4" /></Link></div><div className="grid gap-4 md:grid-cols-3">{tournaments.map(t => <TournamentCard key={t.name} t={t} />)}</div></section><section className="border-t border-white/10"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 lg:px-10"><div><Sparkles className="size-5 text-[#ffd700]" /><h3 className="mt-4 text-xl font-semibold">Skill only</h3><p className="mt-2 text-sm leading-6 text-zinc-500">Compulsory captures. Flying kings. No coin flips, no shortcuts.</p></div><div><Shield className="size-5 text-[#ffd700]" /><h3 className="mt-4 text-xl font-semibold">Fair by design</h3><p className="mt-2 text-sm leading-6 text-zinc-500">Independent clocks and strict rounds keep every match moving.</p></div><div><Play className="size-5 text-[#ffd700]" /><h3 className="mt-4 text-xl font-semibold">Play for free</h3><p className="mt-2 text-sm leading-6 text-zinc-500">Warm up against three levels of bot in unlimited practice mode.</p></div></div></section><div id="watch-popup" style={{display:'none'}} className="fixed inset-0 z-[100] items-center justify-center bg-black/80 p-5"><div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 text-center"><p className="text-xs uppercase tracking-[0.2em] text-[#ffd700]">Live not started</p><h3 className="mt-3 text-xl font-semibold text-white">Live match starts 7:00 PM WAT</h3><p className="mt-2 text-sm text-zinc-400">Countdown: <span className="font-semibold text-white">{hours}:{mins}:{secs}</span></p><button onClick={()=>{ const el=document.getElementById('watch-popup') as any; if(el) el.style.display='none' }} className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black">Okay</button></div></div></main>
}

export { tournaments }
export { Coins }
export { Nav }
export { TournamentCard }
