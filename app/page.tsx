'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, CircleDollarSign, Clock3, Eye, Menu, Play, Shield, Sparkles, Trophy, Users, X } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#F3F3F3]' },
  { name: 'Silver', entry: 700, prize: 7000, joined: 18, tone: 'bg-[#E8E8E8]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#DEDEDE]' },
]

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#04a908]" />{children}</span>
}

function Nav(){
  const [open,setOpen]=useState(false)
  return <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
    <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-white text-black font-black">DC</span> Daily Checkers</Link>
    <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
      <Link className="hover:text-white" href="/tournaments">Tournaments</Link>
      <Link className="hover:text-white" href="/practice">Practice</Link>
      <Link className="hover:text-white" href="/buy">Buy</Link>
      <Link className="hover:text-white" href="/how-to-play">How to Play</Link>
    </nav>
    <div className="hidden items-center gap-3 md:flex"><Link href="/signin" className="text-sm text-zinc-400 hover:text-white">Sign in</Link><Link href="/buy" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-zinc-950 px-5 py-2 text-sm text-white">Buy coins</Link></div>
    <button aria-label="Open menu" onClick={()=>setOpen(!open)} className="md:hidden inline-flex size-9 items-center justify-center rounded-full bg-white text-black">{open? <X className="size-5"/> : <Menu className="size-5"/>}</button>
    {open && <div className="absolute left-5 right-5 top-20 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm shadow-2xl md:hidden"><Link href="/tournaments">Tournaments</Link><Link href="/practice">Practice</Link><Link href="/buy">Buy coins</Link><Link href="/how-to-play">How to Play</Link></div>}
  </header>
}

function TournamentCard({ t }: { t: typeof tournaments[number] }){
  return <article className={` ${t.tone} rounded-[24px] p-5 text-black`}>
    <div className="flex items-start justify-between">
      <h3 className="text-2xl font-black tracking-tight">{t.name}</h3>
      <span className="text-xs font-bold px-2 py-1 rounded-full bg-black/10">{t.joined} joined</span>
    </div>
    <div className="mt-3 text-sm"><Coins>{t.entry.toLocaleString()}</Coins><span className="text-zinc-500"> entry</span></div>
    <div className="mt-1 text-sm font-bold flex items-center gap-1"><Trophy className="size-4" />{t.prize.toLocaleString()} prize</div>
    <div className="mt-4 h-2 w-full rounded-full bg-black/10"><div className="h-full rounded-full bg-black" style={{width: `${(t.joined/32)*100}%`}} /></div>
    <div className="mt-3 text-xs text-zinc-600">{32-t.joined} spots left</div>
    <Link href="/tournaments" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black/10 py-3 text-sm font-bold">Watch live <Eye className="size-4"/></Link>
  </article>
}

function getSecondsToLagosSeven(){
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US',{ timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
  const current = Number(parts.find(p=>p.type==='hour')!.value)*3600 + Number(parts.find(p=>p.type==='minute')!.value)*60 + Number(parts.find(p=>p.type==='second')!.value)
  const target = 19*3600
  return current >= target? 0 : target - current
}

export default function Page(){
  const [seconds,setSeconds]=useState(0)
  const [showPopup,setShowPopup]=useState(false)
  useEffect(()=>{
    const update=()=>setSeconds(getSecondsToLagosSeven())
    update()
    const timer=setInterval(update,1000)
    return ()=>clearInterval(timer)
  },[])
  const h = String(Math.floor(seconds/3600)).padStart(2,'0')
  const m = String(Math.floor((seconds%3600)/60)).padStart(2,'0')
  const s = String(seconds%60).padStart(2,'0')
  const isLive = seconds===0

  return <main className="min-h-screen bg-black text-white">
    <Nav/>
    <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-10 lg:px-10 lg:pt-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300"><span className="size-1.5 animate-pulse rounded-full bg-green-500"/> Live daily at 7PM WAT</p>
          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-7xl">The board is set. <br/><span className="text-zinc-500">Make your move.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-400">Daily cash tournaments for players who know the board. No gimmicks. No waiting. Just you, the clock, and the win.</p>

          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-black"><Clock3 className="size-4"/> {h}:{m}:{s}</div>
            <span className="text-zinc-500">until 7PM WAT</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/practice" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black">Practice free <ArrowRight className="size-4"/></Link>

            {isLive? (
              <Link href="/live" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-zinc-900 px-6 py-3 text-sm font-bold">Watch Live <Eye className="size-4"/></Link>
            ) : (
              <button onClick={()=>setShowPopup(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-zinc-900 px-6 py-3 text-sm font-bold">Watch Live <Eye className="size-4"/></button>
            )}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4"><div className="text-2xl font-black">₦50K+</div><div className="text-xs text-zinc-500">Daily prizes</div></div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4"><div className="text-2xl font-black">1.2K+</div><div className="text-xs text-zinc-500">Players</div></div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4"><div className="text-2xl font-black">7PM</div><div className="text-xs text-zinc-500">WAT Daily</div></div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="grid gap-4">
            {tournaments.map(t=><TournamentCard key={t.name} t={t}/>)}
          </div>
        </div>
      </div>
    </section>

    {showPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={()=>setShowPopup(false)}>
        <div className="w-full max-w-sm rounded-[24px] bg-white p-6 text-center text-black" onClick={e=>e.stopPropagation()}>
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-black text-white"><Clock3 className="size-6"/></div>
          <h3 className="mt-4 text-xl font-black">Live not started</h3>
          <p className="mt-1 text-sm text-zinc-500">Live begins at 7PM WAT sharp. Come back when timer hits zero.</p>
          <div className="mt-4 rounded-xl bg-zinc-100 py-3 font-mono text-2xl font-black tracking-widest">{h}:{m}:{s}</div>
          <p className="mt-3 text-xs text-zinc-400">Africa/Lagos timezone</p>
          <button onClick={()=>setShowPopup(false)} className="mt-5 w-full rounded-full bg-black py-3 text-sm font-bold text-white">Got it, remind me at 7PM</button>
          <Link href="/practice" className="mt-3 inline-block text-sm font-semibold underline">Practice while you wait</Link>
        </div>
      </div>
    )}
  </main>
}
