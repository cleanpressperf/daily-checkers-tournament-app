'use client'

import Link from 'next/link'
import { BuyCoinCard } from '@/components/BuyCoinCard'

const packs = [500, 1000, 2500, 5000, 10000, 20000]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <h1 className="text-5xl font-black">Clean Press Checkers</h1>
            <p className="mt-4 text-xl text-white/60">1vs1 Arena with Elite Bots • Free Practice • Withdrawals</p>
            <Link href="/arena" className="mt-8 inline-block rounded-xl bg-[#d6ff38] px-8 py-3 font-black text-black">
              Play Now
            </Link>
          </div>

          <div className="mb-20">
            <h2 className="mb-8 text-3xl font-black">Buy Coins</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((amount) => <BuyCoinCard key={amount} amount={amount} coins={amount} />)}
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
              <div className="text-3xl">🏆</div>
              <h3 className="mt-4 text-xl font-black">1vs1 Arena</h3>
              <p className="mt-2 text-white/60">Challenge 7 elite bots from Finn to Marlo. Win big or buy more coins.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
              <div className="text-3xl">📚</div>
              <h3 className="mt-4 text-xl font-black">Free Practice</h3>
              <p className="mt-2 text-white/60">Play against AI with difficulty levels: Easy, Medium, Hard.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111] p-8">
              <div className="text-3xl">💳</div>
              <h3 className="mt-4 text-xl font-black">Withdraw</h3>
              <p className="mt-2 text-white/60">Cash out your winnings via bank transfer within 48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
