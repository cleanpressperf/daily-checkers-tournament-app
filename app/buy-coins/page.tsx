'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { BuyCoinCard } from '@/components/BuyCoinCard'
import { supabase } from '@/lib/supabaseClient'
import { setBalance } from '@/lib/wallet'

const packs = [100, 500, 1000, 2500, 5000, 10000, 20000]

function PaymentStatus() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('trxRef') || searchParams.get('TrxRef')
  if (!reference) console.warn('[v0] Paystack callback did not include a payment reference')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!reference) return
    let cancelled = false
    async function verifyPayment() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Please sign in to verify this payment')
        const { data: sessionData } = await supabase.auth.getSession()
        const response = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
          },
          body: JSON.stringify({ reference }),
        })
        const data = await response.json()
        if (!response.ok || !data.success) throw new Error(data.error || 'Payment verification failed')
        setBalance(Number(data.coins))
        if (!cancelled) window.location.assign(`/buy-coins/success?coins=${data.coins}`)
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Payment verification failed')
      }
    }
    verifyPayment()
    return () => { cancelled = true }
  }, [reference])

  if (!reference) return null
  return <div className="mt-6 rounded-xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-4 text-sm text-[#d6ff38]">{message || 'Verifying your payment...'}</div>
}

function BuyCoinsContent() {
  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/arena" className="text-sm text-white/50">Back to Arena</Link>
        <h1 className="mt-10 text-4xl font-black">Buy coins</h1>
        <p className="mt-3 text-white/50">Secure Paystack checkout. Coins are credited after verification.</p>
        <PaymentStatus />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((amount) => <BuyCoinCard key={amount} amount={amount} coins={amount} />)}
        </div>
      </div>
    </main>
  )
}

export default function BuyCoinsPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#080808] text-white">Loading checkout...</main>}>
      <BuyCoinsContent />
    </Suspense>
  )
}
