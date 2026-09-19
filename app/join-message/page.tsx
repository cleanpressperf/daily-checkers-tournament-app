'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function JoinedSuccessModal({ onClose, name }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1A1A1A] p-6 text-center">
        <div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-[#ffd700]">YOU'RE IN ✅</div>
        <h2 className="text-[22px] font-bold text-white">You joined {name}</h2>
        <p className="mt-3 text-[14px] text-zinc-300">Live match starts <b className="text-white">7:00 PM WAT</b> today.</p>
        <p className="mt-2 text-[14px] text-zinc-300">You must come back <b className="text-[#ffd700]">before 7:00 PM</b> to play.</p>
        <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-[12px] text-red-300">
          ⚠️ Grace period is 5 minutes. After <b>7:05 PM</b> you will be automatically <b>disqualified</b> and cannot join again.
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-full bg-white py-3.5 text-[15px] font-bold text-black">Okay, I will be back before 7:00</button>
      </div>
    </div>
  )
}

function NotStartedModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1A1A1A] p-6 text-center">
        <div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-[#ffd700]">LIVE NOT STARTED</div>
        <h2 className="text-[20px] font-bold text-white">Live match starts 7:00 PM WAT</h2>
        <p className="mt-2 text-sm text-zinc-400">You can watch live when it starts.</p>
        <button onClick={onClose} className="mt-5 w-full rounded-full bg-white py-3 text-[15px] font-bold text-black">Okay</button>
      </div>
    </div>
  )
}

export default function Page() {
  const [coins, setCoins] = useState(100)
  const [showJoined, setShowJoined] = useState(false)
  const [showNotStarted, setShowNotStarted] = useState(false)
  const [tName] = useState('SILVER TOURNAMENT')

  useEffect(()=>{
    const c = Number(localStorage.getItem('user_coins') || localStorage.getItem('boardroom_coins') || 100)
    setCoins(c)
  },[])

  function handleJoinAsPlayer() {
    const bal = Number(localStorage.getItem('user_coins') || localStorage.getItem('boardroom_coins') || 100)
    if (bal < 700) { alert('Not enough coins - need 700'); return; }

    // Check time for 7:05 disqualify
    const now = new Date()
    const isAfterGrace = now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() > 5)
    if (isAfterGrace) {
      alert('❌ Disqualified! You did not come back before 7:05 PM. Match has started, cannot join again.')
      return
    }

    const newBal = bal - 700
    ;['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>localStorage.setItem(k, String(newBal)))
    setCoins(newBal)
    setShowJoined(true)
  }

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-950 p-6 text-center">
        <h1 className="text-lg font-bold">Join Logic Test - ONE FILE</h1>
        <p className="mt-2 text-sm text-zinc-400">Coins: {coins}</p>

        <div className="mt-6 grid gap-3">
          <button onClick={handleJoinAsPlayer} className="w-full rounded-xl bg-[#ffd700] py-3 font-bold text-black">JOIN AS PLAYER (700 coins)</button>
          <button onClick={()=>setShowNotStarted(true)} className="w-full rounded-xl bg-zinc-800 py-3 font-bold text-white">👁️ VIEW AS WATCHER</button>
          <Link href="/" className="mt-2 text-sm text-zinc-500 underline">Go Home</Link>
        </div>

        <div className="mt-6 text-left text-[11px] text-zinc-500">
          <p>• Player click JOIN before 7PM = Shows YOU'RE IN with 7:00 / 7:05 warning</p>
          <p>• Player click after 7:05 = Disqualified</p>
          <p>• Watcher click eye = Shows LIVE NOT STARTED (your screenshot)</p>
        </div>
      </div>

      {showJoined && <JoinedSuccessModal name={tName} onClose={()=>setShowJoined(false)} />}
      {showNotStarted && <NotStartedModal onClose={()=>setShowNotStarted(false)} />}
    </main>
  )
}
