'use client'

import Link from 'next/link'
import { PaystackBuyButton } from '@/components/PaystackBuyButton'

const packs = [500, 1000, 2500, 5000, 10000, 20000]

export default function BuyCoinsPage() {
  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/arena" className="text-sm text-white/50">Back to Arena</Link>
        <h1 className="mt-10 text-4xl font-black">Buy coins</h1>
        <p className="mt-3 text-white/50">Secure Paystack checkout. Coins are credited only after server verification.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((amount) => <PaystackBuyButton key={amount} amount={amount} coins={amount} />)}
        </div>
      </div>
    </main>
  )
}
