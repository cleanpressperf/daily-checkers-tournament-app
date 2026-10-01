'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppHeader(){
  const [open,setOpen]=useState(false)
  const path=usePathname()
  const isActive=(p:string)=> path===p? 'bg-[#ffd700] text-black' : 'bg-white/10 text-white'

  return (
    <>
      <header className="flex items-center justify-between px-5 py-4 bg-black text-white sticky top-0 z-50 border-b border-white/10">
        <button onClick={()=>setOpen(true)} className="text-2xl">☰</button>
        <h1 className="font-black tracking-widest text-[#ffd700] text-[13px]">CHECKERS 10×10</h1>
        <Link href="/login" className="rounded-lg bg-[#ffd700] px-3 py-2 text-xs font-black text-black">Sign In</Link>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="w-[80%] max-w-[300px] bg-zinc-950 h-full p-6 flex flex-col border-r border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-[#ffd700]">MENU</h2>
              <button onClick={()=>setOpen(false)} className="text-2xl text-white">✕</button>
            </div>
            <nav className="flex flex-col gap-3">
              <Link onClick={()=>setOpen(false)} href="/" className={`rounded-xl px-4 py-4 font-bold flex items-center gap-3 ${isActive('/')}`}>
                <span className="text-xl">Daily</span> Daily Checkers
              </Link>
              <Link onClick={()=>setOpen(false)} href="/arena" className={`rounded-xl px-4 py-4 font-bold flex items-center gap-3 ${isActive('/arena')}`}>
                <span className="text-xl">Arena</span> 1vs1 Arena
              </Link>
              <Link onClick={()=>setOpen(false)} href="/free" className={`rounded-xl px-4 py-4 font-bold flex items-center gap-3 ${isActive('/free')}`}>
                <span className="text-xl">Free</span> Free Practice
              </Link>
              <Link onClick={()=>setOpen(false)} href="/buy-coins" className={`rounded-xl px-4 py-4 font-bold flex items-center gap-3 ${isActive('/buy-coins')}`}>
                <span className="text-xl">Buy</span> Buy Coin
              </Link>
              <Link onClick={()=>setOpen(false)} href="/withdraw" className={`rounded-xl px-4 py-4 font-bold flex items-center gap-3 ${isActive('/withdraw')}`}>
                <span className="text-xl">Cash</span> Withdraw
              </Link>
            </nav>
            <div className="mt-auto rounded-xl bg-zinc-900 p-3">
              <p className="text-[10px] font-bold text-[#ffd700] tracking-widest">10×10 INTL RULES</p>
              <p className="text-[10px] text-zinc-400 mt-1 leading-4">• Backward capture<br/>• Longest capture<br/>• Flying Kings<br/>• 2s bot delay</p>
            </div>
          </div>
          <div onClick={()=>setOpen(false)} className="flex-1 bg-black/60 backdrop-blur-sm"/>
        </div>
      )}
    </>
  )
}
