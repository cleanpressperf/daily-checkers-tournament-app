'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 26, tone: 'bg-[#f3f3f3]', color: 'bg-[#c0843a]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]', color: 'bg-[#8a8a8a]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e5e5e5]', color: 'bg-[#d4af37]' },
]

export function Coins({children}:any){ return <span className="font-bold">{children}</span> }

export function Nav(){
  const [open,setOpen]=useState(false)
  return(
    <header className="mx-auto max-w-7xl flex items-center justify-between px-6 py-6 relative">
      <Link href="/" className="font-black text-xl tracking-tight">Daily Checkers</Link>
      <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
        <Link href="/tournaments" className="hover:text-white">Tournaments</Link>
        <Link href="/practice" className="hover:text-white">Practice</Link>
        <Link href="/coins" className="hover:text-white">Buy Coins</Link>
      </nav>
      <div className="hidden md:flex items-center gap-3">
        <Link href="/signin" className="text-sm px-4 py-2 rounded-full border border-white/20">Sign in</Link>
        <Link href="/signin" className="text-sm px-4 py-2 rounded-full bg-white text-black font-bold">Sign up</Link>
      </div>
      <button onClick={()=>setOpen(!open)} className="md:hidden border border-white/20 px-4 py-2 rounded-full text-sm">{open? 'Close' : 'Menu'}</button>
      {open && (
        <div className="absolute top-[70px] right-6 z-50 w-48 bg-zinc-900 border border-white/10 rounded-2xl p-2 flex flex-col gap-1 md:hidden">
          <Link href="/tournaments" className="px-4 py-2 rounded-xl hover:bg-white/10">Tournaments</Link>
          <Link href="/practice" className="px-4 py-2 rounded-xl hover:bg-white/10">Practice</Link>
          <Link href="/coins" className="px-4 py-2 rounded-xl hover:bg-white/10">Buy Coins</Link>
          <Link href="/signin" className="px-4 py-2 rounded-xl bg-white text-black font-bold text-center mt-2">Sign up / Sign in</Link>
        </div>
      )}
    </header>
  )
}

export function TournamentCard({t
