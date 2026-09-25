'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Check, Coins, Shield } from 'lucide-react'
import { addCoins, getBalance } from '@/lib/wallet'
import { formatCoins } from '@/lib/bots'

const packs = [500, 1000, 2500, 5000, 10000, 20000]

export default function BuyCoinsPage() {
  const [balance, setBalance] = useState(getBalance())
  const [added, setAdded] = useState<number | null>(null)

  function buy(amount: number) {
    addCoins(amount)
    setBalance(getBalance())
    setAdded(amount)
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-[#0c0c0c]/95"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8"><Link href="/arena" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#d6ff38] text-black"><Shield size={18} /></span><span className="text-sm font-black uppercase tracking-[0.22em]">Daily Checkers</span></Link><Link href="/arena" className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white"><ArrowLeft size={16} /> Back to arena</Link></div></header>
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20"><div className="mx-auto max-w-xl text-center"><div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#d6ff38] text-black"><Coins size={26} /></div><h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">Top up your wallet.</h1><p className="mt-4 text-white/50">Choose a coin pack and get back in the arena.</p><p className="mt-5 text-sm font-bold text-[#d6ff38]">Current balance: {formatCoins(balance)} coins</p></div><div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">{packs.map((amount) => <button key={amount} onClick={() => buy(amount)} className="group rounded-2xl border border-white/10 bg-[#111] p-6 text-left transition hover:-translate-y-1 hover:border-[#d6ff38]/60"><div className="flex items-center justify-between"><span className="text-2xl font-black">{formatCoins(amount)}</span><Coins size={20} className="text-[#d6ff38]" /></div><p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/35">coins pack</p><div className="mt-6 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#d6ff38]">Add to wallet</span><span className="grid size-8 place-items-center rounded-full bg-white/10 transition group-hover:bg-[#d6ff38] group-hover:text-black"><Check size={15} /></span></div></button>)}</div>{added && <p role="status" className="mx-auto mt-8 text-center text-sm font-bold text-[#d6ff38]">{formatCoins(added)} coins added to your wallet.</p>}</section>
    </main>
  )
}
