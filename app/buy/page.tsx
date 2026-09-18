'use client'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, Check, CircleDollarSign, LockKeyhole } from 'lucide-react'
import { Nav } from '../page'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
const packs=[50,300,500,1000,3000]
declare global { interface Window { PaystackPop?: any } }
export default function BuyPage(){
  const [selected,setSelected]=useState(500)
  const [message,setMessage]=useState('')
  async function pay(){
    setMessage('Opening secure checkout...')
    if (!window.PaystackPop) { setMessage('Paystack is still loading. Try again.'); return }
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY
    if (!paystackKey) { setMessage('Payments are not configured yet.'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setMessage('Sign in with an email before buying coins.'); return }
    const handler = window.PaystackPop.setup({ key: paystackKey, email: user.email, amount: selected * 100, currency: 'NGN', callback: async (response: any) => {
      const { error } = await supabase.rpc('credit_wallet', { p_coins: selected, p_naira: selected, p_paystack_ref: response.reference, p_email: user.email })
      setMessage(error ? 'Payment received, but wallet credit needs support review.' : `${selected.toLocaleString()} coins added to your wallet.`)
    }, onClose: () => setMessage('Checkout cancelled.') })
    handler.openIframe()
  }
  return <main className="min-h-screen bg-black text-white"><Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive"/><Nav/><div className="mx-auto max-w-5xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="text-center"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Your wallet · live balance</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">More coins. More tables.</h1><p className="mx-auto mt-4 max-w-md text-zinc-400">1 coin = ₦1. Choose a pack and get back to the board.</p></div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{packs.map(pack=><button key={pack} onClick={()=>setSelected(pack)} className={`relative rounded-2xl border p-5 text-left ${selected===pack?'border-[#ffd700] bg-white text-black':'border-white/10 bg-zinc-950'}`}>{selected===pack&&<span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#ffd700]"><Check className="size-3"/></span>}<CircleDollarSign className={`size-6 ${selected===pack?'text-[#bb9200]':'text-[#ffd700]'}`}/><strong className="mt-8 block text-2xl">{pack.toLocaleString()}</strong><span className={selected===pack?'text-black/50':'text-zinc-500'}>₦{pack.toLocaleString()}</span></button>)}</div>{message&&<p className="mx-auto mt-6 max-w-md rounded-xl border border-white/15 p-4 text-center text-sm text-zinc-300">{message}</p>}<div className="mx-auto mt-8 max-w-md"><button onClick={pay} className="w-full rounded-xl bg-white py-4 font-semibold text-black">Buy {selected.toLocaleString()} coins</button><p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-zinc-500"><LockKeyhole className="size-3"/>Secure payment powered by Paystack</p></div></div></main>
}
