'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { BuyCoinCard } from '@/components/BuyCoinCard'

const packs = [100, 500, 1000, 2500, 5000, 10000, 20000]

function PaymentStatus() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!reference) return
    let cancelled = false
    async function verifyPayment() {
      try {
        const response = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Payment verification failed')
        if (!cancelled) window.location.assign(`/buy-coins/success?coins=${data.coins}`)
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Payment verification failed')
      }
    }
    verifyPayment()
    return () => { cancelled = true }
  }, [reference])

  if (!reference) return null
  return (
    <div className="mt-6 rounded-xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-4 text-sm text-[#d6ff38]">
      {message || 'Verifying your payment...'}
    </div>
  )
}

function BuyCoinsContent() {
  const [restoreInput, setRestoreInput] = useState('')
  const [restoring, setRestoring] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState('')

  async function handleRestore() {
    setRestoring(true)
    setRestoreMessage('')
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )guest_id=([^;]+)/)
      const guestId = localStorage.getItem('guestId') || (cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : '')
      if (!guestId) throw new Error('No guest wallet found on this device')

      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not restore coins')
      localStorage.setItem('coins', String(data.coins))
      setRestoreMessage(`Restored ${Number(data.coins || 0).toLocaleString()} coins.`)
      setRestoreInput('')
    } catch (error) {
      setRestoreMessage(error instanceof Error ? error.message : 'Could not restore coins')
    } finally {
      setRestoring(false)
    }
  }

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
        <div className="mx-auto mt-12 max-w-md border-t border-white/10 pt-8">
          <h3 className="text-lg font-bold">Lost coins? Restore</h3>
          <p className="mb-3 mt-2 text-sm text-white/50">Enter email used to pay or Paystack reference</p>
          <div className="flex gap-2">
            <input
              value={restoreInput}
              onChange={(event) => setRestoreInput(event.target.value)}
              placeholder="email@example.com or ref_xxx"
              aria-label="Email or Paystack reference"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-white outline-none focus:border-[#d6ff38]"
            />
            <button
              type="button"
              onClick={handleRestore}
              disabled={restoring}
              className="rounded-lg bg-white px-4 py-2 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {restoring ? '...' : 'Restore'}
            </button>
          </div>
          {restoreMessage && <p className="mt-3 text-sm text-white/60">{restoreMessage}</p>}
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
