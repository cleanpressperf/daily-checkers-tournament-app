'use client'

import Script from 'next/script'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { addCoins } from '@/lib/wallet'

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

type PaystackBuyButtonProps = { amount: number; coins: number }

export function PaystackBuyButton({ amount, coins }: PaystackBuyButtonProps) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  async function startPayment() {
    if (!publicKey || !window.PaystackPop) {
      setStatus('Payment checkout is unavailable until Paystack is configured.')
      return
    }
    setBusy(true)
    setStatus('Opening secure checkout…')
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email
    if (!email) {
      setBusy(false)
      setStatus('Please sign in before buying coins.')
      return
    }

    const reference = `coins_${Date.now()}_${amount}`
    window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: amount * 100,
      currency: 'NGN',
      ref: reference,
      callback: async ({ reference: paymentReference }) => {
        try {
          const { data: sessionData } = await supabase.auth.getSession()
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
          if (!verification.ok) throw new Error('verification failed')
          addCoins(coins)
          window.location.assign(`/buy-coins/success?coins=${coins}`)
        } catch {
          setBusy(false)
          setStatus('Payment verification failed. No coins were credited.')
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
      <button
        type="button"
        onClick={startPayment}
        disabled={busy}
        className="w-full rounded-2xl border border-white/10 bg-[#111] p-6 text-left transition hover:border-[#d6ff38] disabled:cursor-wait disabled:opacity-60"
      >
        <strong className="text-2xl">{coins.toLocaleString()}</strong>
        <span className="mt-2 block text-xs uppercase tracking-widest text-[#d6ff38]">
          coins · Paystack · ₦{amount.toLocaleString()}
        </span>
      </button>
      {status && <p role="status" className="mt-2 text-sm text-white/60">{status}</p>}
    </>
  )
}
