'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Trophy, Menu, X, Clock3 } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

function Coins({ children }: any) { return <span>{children} coins</span> }

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
      <Link href="/" className="font-bold flex gap-2 items-center"><span className="bg-white text-black grid place-items-center size-9 rounded-xl"><Trophy className="size-5" /></span>BOARDROOM</Link>
      <nav className="hidden md:flex gap-6 text-sm text-zinc-400">
        <Link href="/" className="text-white">Home</Link>
        <Link href="/tournaments">Tournaments</Link>
        <Link href="/practice">Practice</Link>
        <Link href="/buy">Buy coins</Link>
        <Link href="/login" className="bg-white text-black px-4 py-1.5 rounded-full">Sign In</Link>
      </nav>
      <div className="flex gap-2 items-center">
        <Link href="/login" className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold">Sign In</Link>
        <button onClick={()=>setOpen(!open)} className="md:hidden grid size-9 place-items-center border border-white/10 rounded-full">{open? <X className="size-4"/> : <Menu className="size-4"/>}</button>
      </div>
      {open && (
        <div className="absolute left-5 right-5 top-20 z-50 bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 md:hidden">
          <Link href="/tournaments" onClick={()=>setOpen(false)}>Tournaments</Link>
          <Link href="/practice" onClick={()=>setOpen(false)}>Practice</Link>
          <Link href="/buy" onClick={()=>setOpen(false)}>Buy coins</Link>
          <Link href="/login" onClick={()=>setOpen(false)} className="bg-white text-black py-3 rounded-full text-center">Sign In</Link>
        </div>
      )}
    </header>
  )
}

function TournamentCard({ t }: any) {
  const w = (t.joined / 32) * 100 + '%'
  return (
    <div className={t.tone + ' rounded-[24px] p-5 text-black'}>
      <p className="text-xs uppercase">{t.name}</p>
      <h3 className="text-2xl font-semibold mt-2">Win {t.prize}</h3>
      <p className="mt-4 text-sm">Entry {t.entry} | {t.joined}/32</p>
      <div className="mt-2 h-1.5 w-28 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-black" style={{width: w}} /></div>
      <Link href="/tournaments" className="mt-4 block bg-black text-white py-3 rounded-xl text-center">Join now</Link>
    </div>
  )
}

export default function Page() {
  const [sec, setSec] = useState(0)
  useEffect(()=>{
    const get = ()=>{
      const now = new Date()
      const p = new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(now)
      const cur = Number(p.find(x=>x.type==='hour')?.value||0)*3600+Number(p.find(x=>x.type==='minute')?.value||0)*60+Number(p.find(x=>x.type==='second')?.value||0)
      return (19*3600 - cur + 24*3600) % (24*3600)
    }
    const up = ()=> setSec(get())
    up()
    const id = setInterval(up,1000)
    return ()=> clearInterval(id)
  },[])
  const h = String(Math.floor(sec/3600)).padStart(2,'0')
  const m = String(Math.floor((sec%3600)/60)).padStart(2,'0')
  const s = String(sec%60).padStart(2,'0')
  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />
      <section className="max-w-7xl mx-auto px-5 py-16">
        <h1 className="text-5xl font-semibold">The board is set.</h1>
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400"><Clock3 className="size-4" /> Next in {h}:{m}:{s}</div>
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {tournaments.map(t=> <TournamentCard key={t.name} t={t} />)}
        </div>
      </section>
    </main>
  )
}

export { tournaments, Coins, Nav, TournamentCard }
