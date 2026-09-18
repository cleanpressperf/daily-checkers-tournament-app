'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// DATA - needed by other pages
export const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 26, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e5e5e5]' },
]

// COMPONENTS - needed by other pages like /tournaments
export function Coins({children}:{children:any}){ return <span>{children} coins</span> }

export function Nav(){
  const [open,setOpen]=useState(false)
  return(
    <header className="mx-auto max-w-7xl flex items-center justify-between px-6 py-6">
      <Link href="/" className="font-black">Daily Checkers</Link>
      <button onClick={()=>setOpen(!open)} className="md:hidden border px-3 py-1 rounded-full">Menu</button>
      {open && <div className="absolute top-16 right-6 bg-zinc-900 border border-white/10 p-4 rounded-xl"><Link href="/signin">Sign in</Link></div>}
    </header>
  )
}

export function TournamentCard({t}:{t:any}){
  return(
    <div className={`rounded-[20px] p-5 text-black ${t.tone}`}>
      <h3 className="font-bold">{t.name}</h3>
      <p className="text-sm mt-1">Entry {t.entry} - Prize {t.prize}</p>
      <p className="text-xs mt-3">{t.joined} joined</p>
    </div>
  )
}

// MAIN PAGE WITH POPUP
export default function Page(){
  const [seconds,setSeconds]=useState(0)
  const [showPopup,setShowPopup]=useState(false)

  useEffect(()=>{
    const getSec=()=>{
      const now=new Date()
      const fmt=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(now)
      const cur=Number(fmt.find(p=>p.type==='hour')?.value)*3600+Number(fmt.find(p=>p.type==='minute')?.value)*60+Number(fmt.find(p=>p.type==='second')?.value)
      const target=19*3600
      return target-cur+(cur>target?24*3600:0)
    }
    const upd=()=>setSeconds(getSec())
    upd()
    const timer=setInterval(upd,1000)
    return()=>clearInterval(timer)
  },[])

  const h=String(Math.floor(seconds/3600)).padStart(2,'0')
  const m=String(Math.floor((seconds%3600)/60)).padStart(2,'0')
  const s=String(seconds%60).padStart(2,'0')
  const isLive=seconds<=60

  return(
    <main className="min-h-screen bg-black text-white">
      <Nav/>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="rounded-[28px] bg-white p-6 text-black">
          <div className="text-sm flex items-center gap-2"><span className="size-2 bg-red-500 rounded-full animate-pulse inline-block"/>Live lobby</div>
          <h2 className="mt-3 text-3xl font-black">Live match begins at 7:00 PM WAT sharp</h2>
          <div className="mt-6 flex gap-3 items-center">
            <div className="bg-black text-white px-4 py-2 rounded-full text-sm">{h}:{m}:{s}</div>
            <button onClick={()=>{if(isLive){window.location.href='/live'}else{setShowPopup(true)}}} className="bg-zinc-100 text-black px-5 py-2 rounded-full text-sm font-bold">Watch Live</button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tournaments.map(t=> <TournamentCard key={t.name} t={t}/>)}
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center text-black">
            <h3 className="text-xl font-bold">Live not started</h3>
            <p className="text-sm text-zinc-500 mt-1">Live begins at 7:00 PM WAT sharp</p>
            <div className="mt-5 bg-zinc-100 py-4 rounded-xl">
              <div className="text-[10px] tracking-widest">LIVE BEGINS IN</div>
              <div className="font-mono text-3xl font-black mt-1">{h}:{m}:{s}</div>
            </div>
            <button onClick={()=>setShowPopup(false)} className="mt-5 w-full bg-black text-white py-3 rounded-full font-bold">Got it</button>
          </div>
        </div>
      )}
    </main>
  )
}
