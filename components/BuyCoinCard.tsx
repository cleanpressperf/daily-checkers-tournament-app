'use client'

import Script from 'next/script'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const PAYSTACK_SCRIPT = 'https://js.paystack.co/v1/inline.js'

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        callback: (response: { reference: string }) => void
        onClose: () => void
      }) => { openIframe: () => void }
    }
  }
}

type BuyCoinCardProps = { amount: number; coins: number }

export function BuyCoinCard({ amount, coins }: BuyCoinCardProps) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  async function startPayment() {
    if (!publicKey || !window.PaystackPop) {
      setStatus('Payment checkout is unavailable.')
      return
    }
    setBusy(true)
    setStatus('')
    
    const { data: sessionData } = await supabase.auth.getSession()
    const email = sessionData.session?.user.email ?? 'player@cleanpressperf.name.ng'
    const reference = `checkers_${Date.now()}`

    window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100,
      currency: 'NGN',
      ref: reference,
      callback: async ({ reference: paymentReference }) => {
        try {
          const verification = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(sessionData.session?.access_token
                ? { Authorization: `Bearer ${sessionData.session.access_token}` }
                : {}),
            },
            body: JSON.stringify({ reference: paymentReference, amount, coins }),
          })
          const result = await verification.json()
          if (!verification.ok) throw new Error(result.error || 'Verification failed')
          window.location.assign(`/buy-coins/success?coins=${coins}`)
        } catch (err) {
          setBusy(false)
          setStatus(`Payment verification failed. Reference: ${paymentReference}. Screenshot for support.`)
        }
      },
      onClose: () => {
        setBusy(false)
        setStatus('Checkout closed.')
      },
    }).openIframe()
  }

  return (
    <>
      <Script src={PAYSTACK_SCRIPT} strategy="afterInteractive" />
      <div className="rounded-2xl border border-white/10 bg-[#111] p-6 transition hover:border-[#d6ff38]/50">
        <div className="text-center">
          <strong className="text-4xl font-black text-white">{coins.toLocaleString()}</strong>
          <button
            type="button"
            onClick={startPayment}
            disabled={busy}
            className="mt-4 w-full rounded-xl bg-[#d6ff38] py-3 text-sm font-black text-black disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'Processing...' : 'Buy Now'}
          </button>
          {status && <p className="mt-3 text-xs text-white/50">{status}</p>}
        </div>
      </div>
    </>
  )
}
