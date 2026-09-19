'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Clock3, Eye, Menu, Play, Shield, Sparkles, Trophy, Users, X } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

// --- UNIFIED COIN SYSTEM - fixes 100 coins bug forever ---
function getUnifiedCoins() {
  if (typeof window === 'undefined') return 100
  const keys = ['user_coins', 'boardroom_coins', 'coins', 'coinBalance', 'balance', 'user_balance', 'userCoins'];
  let max = 0;
  for (const k of keys) {
    const v = localStorage.getItem(k);
    const n = Number(v);
    if (!isNaN(n) && n > max) max = n;
  }
  return max || 100;
}
function setUnifiedCoins(amount: number) {
  const keys = ['user_coins', 'boardroom_coins', 'coins', 'coinBalance', 'balance', 'user_balance', 'userCoins'];
  keys.forEach(k => localStorage.setItem(k, String(amount)));
  window.dispatchEvent(new Event('coins-updated'));
}

function JoinedSuccessModal({ onClose, name }: { onClose: () => void, name: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1A1A1A] p-6 text-center">
        <div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-[#ffd700]">YOU'RE IN ✅</div>
        <h2 className="text-[22px] font-bold leading-tight text-white">You joined {name} TOURNAMENT</h2>
        <p className="mt-3 text-[14px] leading-[1.5] text-zinc-300">Live match starts <span className="font-bold text-white">7:00 PM WAT</span> today.</p>
        <p className="mt-2 text-[14px] leading-[1.5] text-zinc-300">You must come back <span className="font-bold text-[#ffd700]">before 7:00 PM</span> to play.</p>
        <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-[12px] leading-[1.4] font-medium text-red-300">
          ⚠️ Grace period is 5 minutes. After <b>7:05 PM</b> you will be automatically <b>disqualified</b> and you cannot join this tournament again.
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-full bg-white py-3.5 text-[15px] font-bold text-black">Okay, I will be back before 7:00</button>
      </div>
    </div>
  )
}

function Nav({ onBalanceChange }: { onBalanceChange?: number }) {
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState(100)

  useEffect(() => {
    setBalance(getUnifiedCoins())
    const sync = () => setBalance(getUnifiedCoins())
    window.addEventListener('storage', sync)
    window.addEventListener('coins-updated', sync as any)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('coins-updated', sync as any)
    }
  }, [onBalanceChange])

  return (
    <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
        <span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5" /></span>
        BOARDROOM
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
        <Link className="text-white" href="/">Home</Link>
        <Link href="/tournaments">Tournaments</Link>
        <Link href="/practice">Practice</Link>
        <Link href="/buy">Buy coins</Link>
      </nav>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm md:px-4">
          <CircleDollarSign className="size-4 text-[#ffd700]" />
          {balance}
        </div>
        <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black md:px-5 md:text-sm">CLEANpress</button>
        <button onClick={() => setOpen(!open)} className="grid size-9 place-items-center rounded-full border border-white/10 md:hidden">
          {open? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div className="absolute left-5 right-5 top-20 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm shadow-2xl md:hidden">
          <Link href="/tournaments" onClick={() => setOpen(false)}>Tournaments</Link>
          <Link href="/practice" onClick={() => setOpen(false)}>Practice</Link>
          <Link href="/buy" onClick={() => setOpen(false)}>Buy coins</Link>
        </div>
      )}
    </header>
  )
}

function TournamentCard({ t, onJoined, onWatch }: any) {
  function handleJoin(e: any) {
    e.preventDefault()
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit' }).formatToParts(now)
    const h = Number(parts.find(p => p.type === 'hour')?.value || 0)
    const m = Number(parts.find(p => p.type === 'minute')?.value || 0)
    const isAfterGrace = h > 19 || (h === 19 && m > 5)

    if (isAfterGrace) {
      alert('❌ Disqualified! You did not come back before 7:05 PM. Match has started, you cannot join again.')
      return
    }

    const bal = getUnifiedCoins()
    if (bal < t.entry) {
      alert(`You need ${t.entry} coins. You have ${bal}.`)
      return
    }

    const joined = JSON.parse(localStorage.getItem('joined_tournaments') || '[]')
    if (joined.includes(t.name)) {
      onJoined(t.name)
      return
    }

    setUnifiedCoins(bal - t.entry)
    localStorage.setItem('joined_tournaments', JSON.stringify([...joined, t.name]))
    localStorage.setItem(`joined_at_${t.name}`, String(Date.now()))
    onJoined(t.name)
  }

  function handleWatch(e: any) {
    e.preventDefault()
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit' }).formatToParts(new Date())
    const h = Number(parts.find((p: any) => p.type === 'hour')?.value || 0)
    const isLive = h >= 19 && h < 20
    if (isLive) {
      window.location.href = '/play/demo-match'
    } else {
      onWatch()
    }
  }

  const widthPercent = (t.joined / 32) * 100 + '%'

  return (
    <article className={`${t.tone} rounded-[24px] p-5 text-black`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">{t.name} tournament</p>
          <h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize.toLocaleString()}</Coins></h3>
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">Daily</span>
      </div>
      <div className="mt-8 flex items-end justify-between">
        <div className="text-sm text-black/55">
          <p>Entry</p>
          <p className="mt-1 text-base font-semibold text-black"><Coins>{t.entry}</Coins></p>
        </div>
        <div className="text-right text-sm text-black/55">
          <p className="flex items-center justify-end gap-1"><Users className="size-3" />{t.joined}/32 joined</p>
          <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-black" style={{ width: widthPercent }} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={handleJoin} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">
          Join now <ArrowRight className="size-4" />
        </button>
        <button onClick={handleWatch} className="grid size-11 place-items-center rounded-xl bg-black/10">
          <Eye className="size-4" />
        </button>
      </div>
    </article>
  )
}

export default function Page() {
  const [seconds, setSeconds] = useState(0)
  const [showJoined, setShowJoined] = useState(false)
  const [showNotStarted, setShowNotStarted] = useState(false)
  const [joinedName, setJoinedName] = useState('')
  const [balanceTick, setBalanceTick] = useState(0)

  useEffect(() => {
    const getSeconds = () => {
      const now = new Date()
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
      const cur = Number(parts.find(p => p.type === 'hour')?.value || 0) * 3600 + Number(parts.find(p => p.type === 'minute')?.value || 0) * 60 + Number(parts.find(p => p.type === 'second')?.value || 0)
      return (19 * 3600 - cur + 24 * 3600) % (24 * 3600)
    }
    const update = () => setSeconds(getSeconds())
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  const handleJoined = (name: string) => {
    setJoinedName(name)
    setShowJoined(true)
    setBalanceTick(v => v + 1)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Nav onBalanceChange={balanceTick} />
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-10 lg:pt-24">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-zinc-300"><span className="size-1.5 rounded-full bg-[#ffd700]" />Next tournament starts at 7:00 PM WAT</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[.95] tracking-[-0.06em] sm:text-7xl">The board is set.<br /><span className="text-zinc-500">Make your move.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">Daily cash tournaments for players who know the difference between luck and skill.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/tournaments" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black">Enter a tournament <ArrowRight className="ml-2 inline size-4" /></Link><Link href="/practice" className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold">Practice free</Link></div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-6"><div className="flex items-center justify-between text-sm text-zinc-400"><span>Next tournament in</span><Clock3 className="size-4" /></div><div className="mt-5 text-6xl font-medium tracking-[-0.06em] tabular-nums">{hours}:{mins}:{secs}</div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500"><span>Every day · 7:00 PM WAT</span><span className="text-white">3 prizes live</span></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-10"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Tonights games</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Choose your table</h2></div><Link href="/tournaments" className="hidden items-center gap-2 text-sm text-zinc-400 md:flex">View all <ArrowRight className="size-4" /></Link></div><div className="grid gap-4 md:grid-cols-3">{tournaments.map((t) => <TournamentCard key={t.name} t={t} onJoined={handleJoined} onWatch={()=>setShowNotStarted(true)} />)}</div></section>

      {showNotStarted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5">
          <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#ffd700]">Live not started</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Live match starts 7:00 PM WAT</h3>
            <p className="mt-2 text-sm text-zinc-400">Countdown: <span className="font-semibold text-white">{hours}:{mins}:{secs}</span></p>
            <button onClick={()
