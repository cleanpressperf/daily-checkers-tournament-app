'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Eye, Trophy, Users } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

function TournamentCard({ t }: { name: string; entry: number; prize: number; joined: number; tone: string }) {
  function handleJoin(){
    let name = localStorage.getItem('boardroom_name')
    if(!name){
      name = prompt('Enter your first name to join:') || ''
      if(!name) return
      localStorage.setItem('boardroom_name', name)
      if(!localStorage.getItem('boardroom_coins')){
        localStorage.setItem('boardroom_coins', '100')
      }
    }
    let myCoins = Number(localStorage.getItem('boardroom_coins') || '100')
    if(myCoins < t.entry){
      alert(`You need ${t.entry} coins to join ${t.name}. You have ${myCoins}. Buy more.`)
      window.location.href='/buy'
      return
    }
    localStorage.setItem('boardroom_coins', String(myCoins - t.entry))
    window.location.href='/play/demo-match'
  }

  function handleWatch(e: any){
    e.preventDefault()
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit' }).formatToParts(new Date())
    const h = Number(parts.find(p => p.type==='hour')?.value || 0)
    if(h >= 19 && h < 20){
      window.location.href='/play/demo-match'
    } else {
      const el = document.getElementById('watch-popup') as any
      if(el) el.style.display='flex'
    }
  }

  return (
    <article className={`${t.tone} rounded-[24px] p-5 text-black`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">{t.name} tournament</p>
          <h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize.toLocaleString()}</Coins></h3>
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">Daily 7PM WAT</span>
      </div>

      <div className="mt-6 flex items-end justify-between text-sm text-black/55">
        <div>
          <p>Entry</p>
          <p className="mt-1 text-base font-semibold text-black"><Coins>{t.entry}</Coins></p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1"><Users className="size-3" />{t.joined}/32 joined</p>
          <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-black" style={{ width: `${(t.joined/32)*100}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={handleJoin} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">Join now <ArrowRight className="size-4" /></button>
        <button onClick={handleWatch} className="grid size-11 place-items-center rounded-xl bg-black/10"><Eye className="size-4" /></button>
      </div>
    </article>
  )
}

export default function TournamentsPage(){
  const [coins, setCoins] = useState(100)
  const [name, setName] = useState('')
  const [seconds, setSeconds] = useState(0)

  useEffect(()=>{
    const c = Number(localStorage.getItem('boardroom_coins') || '100')
    const n = localStorage.getItem('boardroom_name') || ''
    setCoins(c)
    setName(n)
    const getSeconds = () => {
      const now = new Date()
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
      const cur = Number(parts.find(p=>p.type==='hour')?.value||0)*3600 + Number(parts.find(p=>p.type==='minute')?.value||0)*60 + Number(parts.find(p=>p.type==='second')?.value||0)
      return (19*3600 - cur + 24*3600) % (24*3600)
    }
    const update=()=>setSeconds(getSeconds())
    update()
    const id=setInterval(update,1000)
    return ()=>clearInterval(id)
  },[])

  const hours = String(Math.floor(seconds/3600)).padStart(2,'0')
  const mins = String(Math.floor((seconds%3600)/60)).padStart(2,'0')
  const secs = String(seconds%60).padStart(2,'0')

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5" /></span>BOARDROOM</Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm">
          <CircleDollarSign className="size-4 text-[#ffd700]" />{name? `${name}: ` : ''}{coins}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-10">
        <h1 className="text-3xl font-semibold">Choose your table</h1>
        <p className="mt-2 text-zinc-400">100 free coins for new players. Enter first name only.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tournaments.map(t => <TournamentCard key={t.name} t={t} />)}
        </div>

        <div className="mt-12 rounded-[24px] border border-white/10 bg-zinc-900 p-6">
          <h3 className="text-lg font-semibold">Watch a live match</h3>
          <p className="mt-1 text-sm text-zinc-400">Spectate any ongoing game. Live is 7PM - 8PM WAT daily.</p>
          <button onClick={()=>{
            const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit' }).formatToParts(new Date())
            const h = Number(parts.find(p=>p.type==='hour')?.value||0)
            if(h>=19 && h<20) window.location.href='/play/demo-match'
            else { const el=document.getElementById('watch-popup') as any; if(el) el.style.display='flex' }
          }} className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black">Watch live</button>
        </div>
      </section>

      <div id="watch-popup" style={{display:'none'}} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5">
        <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffd700]">Live not started</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Live match starts 7:00 PM WAT</h3>
          <p className="mt-2 text-sm text-zinc-400">Countdown: <span className="font-semibold text-white">{hours}:{mins}:{secs}</span></p>
          <button onClick={()=>{ const el=document.getElementById('watch-popup') as any; if(el) el.style.display='none' }} className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black">Okay</button>
        </div>
      </div>
    </main>
  )
}
