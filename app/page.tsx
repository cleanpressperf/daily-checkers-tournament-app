'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Clock, Eye, Menu, Play, Shield, Users, X, CircleDollarSign } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 26, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e5e5e5]' },
]

function Nav(){
  const [open,setOpen]=useState(false)
  return(
    <header className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
      <Link href="/" className="font-bold">Daily Checkers</Link>
      <button onClick={()=>setOpen(!open)} className="md:hidden">{open?<X/>:<Menu/>}</button>
    </header>
  )
}

export default function Page(){
  const [seconds,setSeconds]=useState(0)
  const [showPopup,setShowPopup]=useState(false)

  useEffect(()=>{
    function getSeconds(){
      const now=new Date()
      const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(now)
      const cur=Number(parts.find(p=>p.type==='hour')?.value)*3600+Number(parts.find(p=>p.type==='minute')?.value)*60+Number(parts.find(p=>p.type==='second')?.value)
      return (19*3600)-cur+(cur>19*3600?24*3600:0)
    }
    const u=()=>setSeconds(getSeconds())
    u(); const t=setInterval(u,1000)
    return()=>clearInterval(t)
  },[])

  const hours=String(Math.floor(seconds/3600)).padStart(2,'0')
  const mins=String(Math.floor((seconds%3600)/60)).padStart(2,'0')
  const secs=String(seconds%60).padStart(2,'0')
    const handleWatchLive=()=>{
    if(seconds>60){ setShowPopup(true) }
    else{ window.location.href='/live' }
  }

  return(
    <main className="min-h-screen bg-black text-white">
      <Nav />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="rounded-[28px] bg-white p-6 text-black">
          <div className="flex items-center gap-2 text-sm"><span className="size-2 bg-red-500 rounded-full animate-pulse" />Live lobby</div>
          <h2 className="mt-3 text-3xl font-black">Live match begins at 7:00 PM WAT sharp</h2>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white"><Clock className="size-4" />{hours}:{mins}:{secs}</div>
            <button onClick={handleWatchLive} className="rounded-full bg-zinc-100 px-5 py-2 text-sm font-bold text-black"><Eye className="size-4 inline mr-1" />Watch Live</button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tournaments.map(t=>(
            <div key={t.name} className={`rounded-[20px] p-5 text-black ${t.tone}`}>
              <h3 className="font-bold">{t.name}</h3>
              <p className="text-sm"><CircleDollarSign className="size-4 inline" /> {t.entry} - Prize {t.prize}</p>
              <p className="mt-2 text-xs flex items-center gap-1"><Users className="size-4" />{t.joined} joined</p>
            </div>
          ))}
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center text-black">
            <h3 className="text-xl font-bold">Live not started</h3>
            <p className="text-sm text-zinc-500 mt-1">Live begins at 7:00 PM WAT sharp</p>
            <div className="mt-5 bg-zinc-100 py-4 rounded-xl">
              <div className="text-xs">LIVE BEGINS IN</div>
              <div className="mt-1 font-mono text-3xl font-black">{hours}:{mins}:{secs}</div>
            </div>
            <button onClick={()=>setShowPopup(false)} className="mt-5 w-full bg-black text-white py-3 rounded-full font-bold">Got it</button>
          </div>
        </div>
      )}
    </main>
  )
}
