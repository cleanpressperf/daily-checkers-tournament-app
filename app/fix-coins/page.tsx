'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function FixPage() {
  const [bal, setBal] = useState(0)
  const [keys, setKeys] = useState<string>('')

  useEffect(()=>{
    const k1 = localStorage.getItem('user_coins')
    const k2 = localStorage.getItem('boardroom_coins')
    const k3 = localStorage.getItem('coins')
    const k4 = localStorage.getItem('coinBalance')
    setBal(Number(k1||k2||k3||k4||100))
    setKeys(`user_coins:${k1} | boardroom_coins:${k2} | coins:${k3} | coinBalance:${k4}`)
  },[])

  function add(amount: number) {
    const current = Number(localStorage.getItem('user_coins')|| localStorage.getItem('boardroom_coins') || localStorage.getItem('coins') || 100)
    const newBal = current + amount

    // Write to ALL possible keys so every page sees it
    localStorage.setItem('user_coins', String(newBal))
    localStorage.setItem('boardroom_coins', String(newBal))
    localStorage.setItem('coins', String(newBal))
    localStorage.setItem('coinBalance', String(newBal))
    localStorage.setItem('balance', String(newBal))

    setBal(newBal)
    window.dispatchEvent(new Event('coins-updated'))
    window.dispatchEvent(new Event('storage'))
    alert(`Added ${amount}! New balance: ${newBal} \n\nNow go home and try join tournament again.`)
  }

  function setExact(amount: number){
    localStorage.setItem('user_coins', String(amount))
    localStorage.setItem('boardroom_coins', String(amount))
    localStorage.setItem('coins', String(amount))
    localStorage.setItem('coinBalance', String(amount))
    localStorage.setItem('balance', String(amount))
    setBal(amount)
    alert(`Set to ${amount}! Now try tournament.`)
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-950 p-6 text-center">
        <h1 className="text-xl font-bold">Fix Coins - V2</h1>
        <p className="mt-2 text-sm text-zinc-400">Current: {bal} coins</p>
        <p className="mt-1 text-[10px] text-zinc-600 break-all">{keys}</p>
        <div className="mt-6 grid gap-3">
          <button onClick={()=>setExact(30100)} className="w-full rounded-xl bg-[#ffd700] py-4 text-sm font-bold text-black">SET TO 30100 & Go Home</button>
          <button onClick={()=>add(1200)} className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black">Add 1200</button>
          <button onClick={()=>add(500)} className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-bold text-white">Add 500</button>
        </div>
        <Link href="/" className="mt-6 inline-block w-full rounded-xl bg-zinc-900 py-3 text-sm text-white">Go to Tournaments & Try Join</Link>
      </div>
    </main>
  )
}
