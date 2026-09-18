"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Eye, Menu, X, CircleDollarSign, Trophy } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#F3F3F3]' },
  { name: 'Silver', entry: 700, prize: 7000, joined: 18, tone: 'bg-[#E8E8E8]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#DEDEDE]' },
]

function getSecondsToLagosSeven(){
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US',{ timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
  const h = Number(parts.find((p:any)=>p.type==='hour')!.value)
  const m = Number(parts.find((p:any)=>p.type==='minute')!.value)
  const s = Number(parts.find((p:any)=>p.type==='second')!.value)
  const cur = h*3600 + m*60 + s
  const target = 19*3600
  return cur >= target? 0 : target - cur
}

export default function Page(){
  const [seconds,setSeconds]=useState(0)
  const [showPopup,setShowPopup]=useState(false)
  const [menu,setMenu]=useState(false)

  useEffect(()=>{
    const upd=()=>setSeconds(getSecondsToLagosSeven())
    upd()
    const t=setInterval(upd,1000)
    return ()=>clearInterval(t)
  },[])

  const hh = String(Math.floor(seconds/3600)).padStart(2,'0')
  const mm = String(Math.floor((seconds%3600)/60)).padStart(2,'0')
  const ss = String(seconds%60).padStart(2,'0')
  const isLive = seconds===0

  const handleWatchLive = (e?: any) => {
    if(!isLive){
      if(e) e.preventDefault()
      setShowPopup(true)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold"><span className="grid size-9 place-items-center rounded-lg bg-white text-black">DC</span> Daily Checkers</Link>
        <button onClick={()=>setMenu(!menu)} className="md:hidden grid size-9 place-items-center rounded-full bg-white text-black">{menu?<X className="size-5"/>:<Menu className="size-5"/>}</button>
        {menu && <div className="absolute left-5 right-5 top-20 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm md:hidden"><Link href="/tournaments">Tournaments</Link><Link href="/practice">Practice</Link></div>}
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs"><span className="size-1.5 animate-pulse rounded-full bg-green-500"/> Live daily at 7PM WAT</p>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">The board is set.<br/><span className="text-zinc-500">Make your move.</span></h1>
            <div className="mt-8 flex items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-black"><Clock3 className="size-4"/> {hh}:{mm}:{ss}</div>
              <span className="text-zinc-500">until 7PM WAT</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/practice" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black">Practice free <ArrowRight className="size-4"/></Link>
              {isLive? (
                <Link href="/live" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900 px-6 py-3 text-sm font-bold">Watch Live <Eye className="size-4"/></Link>
              ) : (
                <button onClick={handleWatchLive} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900 px-6 py-3 text-sm font-bold">Watch Live <Eye className="size-4"/></button>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 grid gap-4">
            {tournaments.map(t=>(
              <article key={t.name} className={`${t.tone} rounded-[24px] p-5 text-black`}>
                <div className="flex justify-between"><h3 className="text-2xl font-black">{t.name}</h3><span className="text-xs font-bold px-2 py-1 rounded-full bg-black/10">{t.joined} joined</span></div>
                <div className="mt-3 text-sm inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4"/>{t.entry} entry</div>
                <div className="mt-1 text-sm font-bold flex items-center gap-1"><Trophy className="size-4"/>{t.prize} prize</div>
                {isLive? (
                  <Link href="/live" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black/10 py-3 text-sm font-bold">Watch live <Eye className="size-4"/></Link>
                ) : (
                  <button onClick={handleWatchLive} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black/10 py-3 text-sm font-bold">Watch live <Eye className="size-4"/></button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={()=>setShowPopup(false)}>
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 text-center text-black" onClick={e=>e.stopPropagation()}>
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-black text-white"><Clock3 className="size-6"/></div>
            <h3 className="mt-4 text-xl font-black">Live not started yet</h3>
            <p className="mt-1 text-sm text-zinc-500">Tournament live begins at 7PM WAT sharp. The board opens exactly at 7.</p>
            <div className="mt-4 rounded-xl bg-zinc-100 py-3 font-mono text-2xl font-black tracking-widest">{hh}:{mm}:{ss}</div>
            <p className="mt-3 text-xs text-zinc-400">Africa/Lagos • {isLive? "LIVE NOW" : "Countdown to 7PM"}</p>
            <button onClick={()=>setShowPopup(false)} className="mt-5 w-full rounded-full bg-black py-3 text-sm font-bold text-white">Got it, remind me at 7PM</button>
            <Link href="/practice" className="mt-3 inline-block text-sm font-semibold underline">Practice while you wait</Link>
          </div>
        </div>
      )}
    </main>
  )
}
