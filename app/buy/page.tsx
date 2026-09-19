'use client'
import Link from 'next/link'
import { ArrowLeft, Check, CircleDollarSign, LockKeyhole } from 'lucide-react'
import { Nav } from '../page'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const packs=[
 {coins:50,naira:50},
 {coins:300,naira:300},
 {coins:500,naira:500},
 {coins:1000,naira:1000},
 {coins:3000,naira:3000}
]

export default function BuyPage(){
 const [selected,setSelected]=useState(packs[2])
 const [message,setMessage]=useState('')

 async function handleBuy(pack: typeof packs[number]) {
  const {data:{user}}=await supabase.auth.getUser()
  if(!user){setMessage('Please sign in first');return}
  const key=process.env.NEXT_PUBLIC_PAYSTACK_KEY
  if(!key){setMessage('Checkout is temporarily unavailable.');return}

  const { default: PaystackPop } = await import('@paystack/inline-js')
  const paystack=new PaystackPop()

  paystack.newTransaction({
    key,
    email:user.email!,
    amount:pack.naira*100,
    currency:'NGN',
    onSuccess:async (transaction:any)=>{
      setMessage('Payment successful! Adding coins...')
      try{
        const res=await fetch('/api/paystack/verify',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({reference:transaction.reference,coins:pack.coins})
        }).then(r=>r.json())

        if(res.success){
          setMessage(`${pack.coins.toLocaleString()} coins added to your wallet!`)
          setTimeout(()=>window.location.reload(),1500)
        }else{
          setMessage(`Paid! Ref: ${transaction.reference} - If coins don't show, contact support with this ref.`)
        }
      }catch(e){
        setMessage(`Paid! Ref: ${transaction.reference} - Network glitch, but money is in Paystack. Contact support with ref.`)
      }
    },
    onCancel:()=>setMessage('Payment cancelled')
  })
 }

 return (
  <main className="min-h-screen bg-black text-white">
    <Nav/>
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-12 lg:px-10">
      <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Your wallet · live balance</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">More coins. More tables.</h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">1 coin = ₦1. Choose a pack and get back to the board.</p>
      </div>
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {packs.map(pack=>(
          <button key={pack.coins} onClick={()=>setSelected(pack)} className={`relative rounded-2xl border p-5 text-left ${selected.coins===pack.coins?'border-[#ffd700] bg-white text-black':'border-white/10 bg-zinc-950'}`}>
            {selected.coins===pack.coins&&<span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#ffd700]"><Check className="size-3"/></span>}
            <CircleDollarSign className="size-6 text-[#ffd700]"/>
            <strong className="mt-8 block text-2xl">{pack.coins.toLocaleString()}</strong>
            <span className={selected.coins===pack.coins?'text-black/50':'text-zinc-500'}>₦{pack.naira.toLocaleString()}</span>
          </button>
        ))}
      </div>
      {message&&<p className="mx-auto mt-6 max-w-md rounded-xl border border-white/15 p-4 text-center text-sm text-zinc-300">{message}</p>}
      <div className="mx-auto mt-8 max-w-md">
        <button onClick={()=>handleBuy(selected)} className="w-full rounded-xl bg-black py-4 font-semibold text-white ring-1 ring-white/20">Buy {selected.coins.toLocaleString()} coins</button>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-zinc-500"><LockKeyhole className="size-3"/>Secure payment powered by Paystack</p>
      </div>
    </div>
  </main>
 )
}
