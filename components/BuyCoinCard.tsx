'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type BuyCoinCardProps = { amount: number; coins: number }

const GUEST_ID_KEY = 'daily-checkers-guest-id'

function getGuestId() {
  const stored = window.localStorage.getItem(GUEST_ID_KEY)
  if (stored) return stored

  const match = document.cookie.match(/(?:^|; )guest_id=([^;]+)/)
  const id = match?.[1] ? decodeURIComponent(match[1]) : crypto.randomUUID()
  window.localStorage.setItem(GUEST_ID_KEY, id)
  document.cookie = `guest_id=${encodeURIComponent(id)}; Max-Age=31536000; Path=/; SameSite=Lax`
  return id
}

export function BuyCoinCard({ amount, coins }: BuyCoinCardProps) {
  const [status, setStatus] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleBuy() {
    setProcessing(true)
    setStatus('')
    try {
      const guestId = getGuestId()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please sign in before buying coins')
      const email = user.email || `player-${guestId}@cleanpressperf.name.ng`
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, guestId, amount, coins }),
      })
      const data = await response.json()
      if (!response.ok || !data.authorization_url) throw new Error(data.message || 'Could not initialize payment')
      window.location.assign(data.authorization_url)
    } catch (error) {
      setProcessing(false)
      setStatus(error instanceof Error ? error.message : 'Could not initialize payment')
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-6 transition hover:border-[#d6ff38]/50">
      <div className="text-center">
        <strong className="text-4xl font-black text-white">{coins.toLocaleString()}</strong>
        <p className="mt-2 text-sm text-white/45">N{amount.toLocaleString()}</p>
        <button type="button" onClick={handleBuy} disabled={processing} className="mt-4 w-full rounded-xl bg-[#d6ff38] py-3 text-sm font-black text-black disabled:cursor-wait disabled:opacity-60">
          {processing ? 'Redirecting...' : 'Buy Now'}
        </button>
        {status && <p role="alert" className="mt-3 text-xs text-red-300">{status}</p>}
      </div>
    </div>
  )
}
