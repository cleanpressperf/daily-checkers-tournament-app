'use client'
import { useEffect, useState } from 'react'
import { CircleDollarSign, Trophy } from 'lucide-react'
import Link from 'next/link'

const packages = [
  { coins: 500, price: 1000, label: 'Starter' },
  { coins: 1000, price: 1800, label: 'Popular' },
  { coins: 3000, price: 5000, label: 'Pro' },
]

export default function BuyPage() {
  const [balance, setBalance] = useState(100)
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('user_coins')
    if (saved) setBalance(Number(saved))
    else {
      localStorage.setItem('user_coins', '100')
      setBalance(100)
    }
  }, [])

  function handleBuy(pkg: typeof packages[0]) {
    setLoading(pkg.coins)
    // --- PAYSTACK INTEGRATION ---
    // Replace with your Paystack popup if you have it.
    // For now we simulate success — change to your real Paystack callback.

    // Example Paystack flow:
    // const handler = (window as any).PaystackPop.setup({ key: 'pk_xxx', email: 'guest@boardroom.com', amount: pkg.price*100, callback: function(){ doSuccess() } })
    // handler.openIframe()

    // Simulated success (remove when you add real Paystack):
    setTimeout(() => {
      const current = Number(localStorage.getItem('user_coins') || '100')
      const base = current === 0? 100 : current
      const newBalance = base + pkg.coins

      localStorage.setItem('user_coins', String(newBalance))
      window.dispatchEvent(new Event('coins-updated'))
      setBalance(newBalance)
      setLoading(null)
      alert(`Success! +${pkg.coins} coins added. New balance: ${newBalance}`)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5" /></span>BOARDROOM</Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"><CircleDollarSign className="size-4 text-[#ffd700]" />{balance}</div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-4xl font-semibold">Buy Coins</h1>
        <p className="mt-3 text-zinc-400">New users get 100 bonus once. Any purchase adds to your current balance.</p>
        <p className="mt-2 text-sm text-zinc-500">Current balance: <span className="text-white font-semibold">{balance} coins</span></p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.coins} className="rounded-[24px] border border-white/10 bg-zinc-950 p-6">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{pkg.label}</p>
              <h3 className="mt-3 text-3xl font-bold flex items-center justify-center gap-2"><CircleDollarSign className="size-6 text-[#ffd700]" />{pkg.coins}</h3>
              <p className="mt-2 text-zinc-400">₦{pkg.price.toLocaleString()}</p>
              <button
                onClick={() => handleBuy(pkg)}
                disabled={loading!== null}
                className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {loading === pkg.coins? 'Processing...' : `Buy ${pkg.coins}`}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-600">If you buy 1000 while you have 100, you will have 1100. Next buy of 500 = 1600.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-zinc-400 underline">Back home</Link>
      </section>
    </main>
  )
}
