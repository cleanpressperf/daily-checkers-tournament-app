'use client'
import { useEffect, useState } from 'react'
import { CircleDollarSign, Trophy, Flame, Crown } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'

const packs = [
  { price: 50, coins: 50, bonus: 0, label: 'Quick' },
  { price: 100, coins: 100, bonus: 0, label: 'Basic' },
  { price: 300, coins: 300, bonus: 0, label: 'Standard' },
  { price: 500, coins: 550, bonus: 50, label: 'Popular', popular: true },
  { price: 1000, coins: 1200, bonus: 200, label: 'Best Value', best: true },
]

export default function BuyPage() {
  const [balance, setBalance] = useState(100)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('user_coins')
    if (saved) setBalance(Number(saved))
    else {
      localStorage.setItem('user_coins', '100')
      setBalance(100)
    }
    const savedEmail = localStorage.getItem('boardroom_email')
    if (savedEmail) setEmail(savedEmail)
  }, [])

  function payWithPaystack(pack: typeof packs[0]) {
    if (!email ||!email.includes('@')) {
      alert('Enter your email for Paystack receipt')
      return
    }
    localStorage.setItem('boardroom_email', email)

    // @ts-ignore
    const PaystackPop = (window as any).PaystackPop
    if (!PaystackPop) {
      alert('Paystack not loaded, check internet and reload')
      return
    }

    setLoading(pack.price)

    const handler = PaystackPop.setup({
      key: 'pk_live_6960e1a77fb79df45e086a07cd8fa9e45dd3652a',
      email: email,
      amount: pack.price * 100,
      currency: 'NGN',
      ref: 'BR-' + Date.now() + '-' + Math.floor(Math.random()*1000),
      callback: function (response: any) {
        // THIS IS THE FIX — THIS WAS MISSING BEFORE
        try {
          const current = Number(localStorage.getItem('user_coins') || '100')
          const base = current === 0? 100 : current
          const newBalance = base + pack.coins

          localStorage.setItem('user_coins', String(newBalance))
          window.dispatchEvent(new Event('coins-updated'))
          setBalance(newBalance)

          alert(`Payment successful! Ref: ${response.reference}\n+${pack.coins} coins added.\nNew balance: ${newBalance}`)
          window.location.href = '/'
        } catch(e) {
          alert('Payment success but error adding coins. Contact support with ref: ' + response.reference)
        } finally {
          setLoading(null)
        }
      },
      onClose: function () {
        setLoading(null)
      }
    })
    handler.openIframe()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5" /></span>
          BOARDROOM
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950 px-4 py-2 text-sm font-medium">
          <CircleDollarSign className="size-4 text-[#ffd700]" />{balance}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-8 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Buy coins</h1>
          <p className="mt-3 text-zinc-400">Every new player gets <span className="text-white font-semibold">100 free</span>. Your purchases always add up.</p>
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="Your email for Paystack receipt"
            className="mt-6 w-full max-w-sm rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-white/20"
          />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {packs.map((p) => (
            <div key={p.price} className={`relative rounded-[24px] border p-5 flex flex-col ${p.best? 'border-[#ffd700]/50 bg-[#1a1600]' : p.popular? 'border-white/20 bg-zinc-900' : 'border-white/10 bg-zinc-950'}`}>
              {p.popular && <span className="absolute -top-3 left-5 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-widest text-black"><Flame className="size-3" />POPULAR</span>}
              {p.best && <span className="absolute -top-3 left-5 flex items-center gap-1 rounded-full bg-[#ffd700] px-3 py-1 text-[10px] font-bold tracking-widest text-black"><Crown className="size-3" />BEST VALUE</span>}
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{p.label}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{p.coins}</span>
                <CircleDollarSign className="size-4 text-[#ffd700]" />
              </div>
              {p.bonus > 0? <p className="mt-1 text-xs font-semibold text-[#ffd700]">+{p.bonus} bonus</p> : <p className="mt-1 text-xs text-zinc-600">No bonus</p>}
              <div className="mt-6 rounded-xl bg-black/40 px-3 py-2 text-sm"><span className="text-zinc-400">Pay </span><span className="font-semibold text-white">₦{p.price}</span></div>
              <button onClick={()=>payWithPaystack(p)} disabled={loading!==null} className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold ${p.best? 'bg-[#ffd700] text-black' : 'bg-white text-black'} disabled:opacity-50`}>
                {loading===p.price? 'Opening...' : `Buy ${p.coins}`}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/5 bg-zinc-950 p-4 text-xs leading-5 text-zinc-500">
          Example: New user = 100. Buys ₦1000 (1200 coins) = 1300 total. Next buy ₦500 (550 coins) = 1850.
        </div>
      </section>
    </main>
  )
}
