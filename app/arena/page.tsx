<<<<<<< HEAD
"use client";
import { useEffect, useState } from "react";
import { BOTS_7 } from "@/lib/bots";
import { getBalance, deductBalance } from "@/lib/wallet";
import Link from "next/link";

export default function ArenaPage() {
  const [balance, setBalance] = useState(0);
  useEffect(() => setBalance(getBalance()), []);

  const play = (bot: any) => {
    if (!deductBalance(bot.entry)) {
      window.location.href = `/buy-coins?need=${bot.entry}&bot=${bot.id}`;
      return;
    }
    window.location.href = `/play?bot=${bot.id}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-zinc-900 p-4 rounded-2xl">
          <h1 className="text-2xl font-black">1 vs 1 CHALLENGE</h1>
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold">N{balance}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOTS_7.map((bot) => (
            <div key={bot.id} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="text-5xl mb-3">{bot.avatar}</div>
              <h3 className="font-bold text-lg">{bot.name}</h3>
              <p className="text-zinc-400 text-sm mb-3">{bot.title}</p>
              <div className="flex justify-between text-sm mb-4">
                <span>Entry: N{bot.entry}</span>
                <span className="text-green-400">Win N{bot.reward}</span>
              </div>
              <button onClick={() => play(bot)} className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl">PLAY</button>
            </div>
          ))}
        </div>
        <Link href="/buy-coins" className="block text-center mt-6 text-zinc-400">Buy Coins →</Link>
      </div>
    </div>
  );
=======
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Coins, Shield, Trophy, Zap } from 'lucide-react'
import { bots, formatCoins, PLAYER_WIN_RATE } from '@/lib/bots'
import { getBalance } from '@/lib/wallet'

export default function ArenaPage() {
  const [balance, setBalance] = useState(1000)

  useEffect(() => {
    const syncBalance = () => setBalance(getBalance())
    syncBalance()
    window.addEventListener('wallet-change', syncBalance)
    window.addEventListener('storage', syncBalance)
    return () => {
      window.removeEventListener('wallet-change', syncBalance)
      window.removeEventListener('storage', syncBalance)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-[#0c0c0c]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/arena" className="flex items-center gap-3" aria-label="Daily Checkers Arena home">
            <span className="grid size-9 place-items-center rounded-xl bg-[#d6ff38] text-black"><Shield size={18} strokeWidth={2.5} /></span>
            <span className="text-sm font-black uppercase tracking-[0.22em]">Daily Checkers</span>
          </Link>
          <Link href="/buy-coins" className="flex items-center gap-2 rounded-full border border-[#d6ff38]/30 bg-[#d6ff38]/10 px-4 py-2 text-sm font-bold text-[#d6ff38] transition hover:bg-[#d6ff38]/20">
            <Coins size={16} /> {formatCoins(balance)} coins <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#d6ff38]"><Zap size={14} fill="currentColor" /> Live 1v1 arena</p>
          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">Pick your opponent.<br /><span className="text-white/45">Own the board.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/50">Seven bots. One shot. Put your coins on the line and climb from rookie to legend.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-white/45">
            <span className="rounded-full border border-white/10 px-3 py-2">{PLAYER_WIN_RATE}% player win rate</span>
            <span className="rounded-full border border-white/10 px-3 py-2">Instant payouts</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot, index) => {
            const affordable = balance >= bot.buyIn
            return (
              <article key={bot.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:-translate-y-1 hover:border-[#d6ff38]/50">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#d6ff38]/5 blur-2xl transition group-hover:bg-[#d6ff38]/10" />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-full border border-white/10 bg-[#1c1c1c] text-xl font-black text-[#d6ff38]">{bot.name[0]}</div>
                    <div><h2 className="text-lg font-extrabold">{bot.name}</h2><p className="text-xs uppercase tracking-widest text-white/35">{bot.tier} · 0{index + 1}</p></div>
                  </div>
                  <Trophy size={17} className="text-white/25" />
                </div>
                <div className="relative mt-7 grid grid-cols-2 gap-3 rounded-xl bg-black/30 p-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Entry</p><p className="mt-1 text-lg font-black">{formatCoins(bot.buyIn)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Win</p><p className="mt-1 text-lg font-black text-[#d6ff38]">{formatCoins(bot.payout)}</p></div>
                </div>
                <Link href={affordable ? `/play?bot=${bot.id}` : '/buy-coins'} className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${affordable ? 'bg-[#d6ff38] text-black hover:bg-[#e4ff76]' : 'bg-white/10 text-white/45 hover:bg-white/15'}`}>
                  {affordable ? 'Play' : 'Get coins'} <ArrowRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
>>>>>>> e4d80ab (feat: add Arena and Buy Coins pages with wallet integration)
}
