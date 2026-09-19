'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function FixPage() {
  const [bal, setBal] = useState(0)
  useEffect(()=>{
    setBal(Number(localStorage.getItem('user_coins')||100))
  },[])
  function add(amount: number) {
    const current = Number(localStorage.getItem('user_coins')||100)
    const newBal = current + amount
    localStorage.setItem('user_coins', String(newBal))
    setBal(newBal)
    window.dispatchEvent(new Event('coins-updated'))
    alert(`Added ${amount}! New balance: ${newBal}`)
  }
  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-950 p-6 text-center">
        <h1 className="text-xl font-bold">Fix Coins</h1>
        <p className="mt-2 text-sm text-zinc-400">Current on this phone: {bal} coins</p>
        <div className="mt-6 grid gap-3">
          <button onClick={()=>add(1200)} className="w-full rounded-xl bg-[#ffd700] py-3 text-sm font-bold text-black">Add 1200 coins (for ₦1000)</button>
          <button onClick={()=>add(550)} className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black">Add 550 coins</button>
          <button onClick={()=>add(300)} className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-bold text-white">Add 300</button>
          <button onClick={()=>add(100)} className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-bold text-white">Add 100</button>
          <button onClick={()=>add(50)} className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-bold text-white">Add 50</button>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-zinc-500 underline">Go home</Link>
      </div>
    </main>
  )
}
