'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Clock3, Eye, Trophy, Users } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, tone: 'bg-[#e9e5d5]' },
]

export function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

export function Nav() {
  return <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10"><Link href="/" className="flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5" /></span>BOARDROOM</Link><nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex"><Link href="/tournaments">Tournaments</Link><Link href="/practice">Practice</Link><Link href="/buy">Buy coins</Link></nav><Link href="/buy" className="rounded-full border border-white/15 px-4 py-2 text-sm"><Coins>100</Coins></Link></header>
}

function Countdown() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => { const update = () => { const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date()); const now = Number(p.find(x => x.type === 'hour')?.value || 0) * 3600 + Number(p.find(x => x.type === 'minute')?.value || 0) * 60 + Number(p.find(x => x.type === 'second')?.value || 0); setSeconds((19 * 3600 - now + 86400) % 86400) }; update(); const id = setInterval(update, 1000); return () => clearInterval(id) }, [])
  return <>{String(Math.floor(seconds / 3600)).padStart(2, '0')}:{String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</>
}

function TournamentCard({ tournament }: { tournament: typeof tournaments[number] }) {
  return <article className={`${tournament.tone} rounded-[24px] p-5 text-black`}><p className="flex justify-between text-xs uppercase tracking-[0.2em] opacity-50">{tournament.name}<span className="flex items-center gap-1"><Users className="size-3" />32/32</span></p><h2 className="mt-3 text-2xl font-semibold">Win <Coins>{tournament.prize.toLocaleString()}</Coins></h2><p className="mt-2 text-xs opacity-60">Bots auto-filled · Live now</p><div className="mt-5 flex gap-2"><Link href="/tournaments" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">Join now <ArrowRight className="size-4" /></Link><Link href="/play/demo-match" aria-label={`Watch ${tournament.name}`} className="grid size-11 place-items-center rounded-xl bg-black/10"><Eye className="size-4" /></Link></div></article>
}

export default function Page() {
  return <main className="min-h-screen bg-black text-white"><Nav /><section className="mx-auto max-w-7xl px-5 py-16 lg:px-10"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4a900]">Daily International Draughts</p><h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">The board is set.<br /><span className="text-zinc-500">Make your move.</span></h1><p className="mt-6 max-w-xl text-lg text-zinc-400">Skill only. No luck. Enter the nightly cash tournaments and play on a real 10×10 board.</p></div><div className="mt-12 rounded-[28px] border border-white/10 bg-zinc-950 p-6"><div className="flex justify-between text-sm text-zinc-400"><span>Live match begins at 7:00 PM WAT</span><Clock3 className="size-4" /></div><div className="mt-4 text-6xl tabular-nums"><Countdown /></div></div><div className="mt-10 grid gap-4 md:grid-cols-3">{tournaments.map(t => <TournamentCard key={t.name} tournament={t} />)}</div></section></main>
}

export { tournaments as tournamentData }
