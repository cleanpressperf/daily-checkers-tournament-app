'use client'

import { useState } from 'react'

type BuyCoinCardProps = { amount: number; coins: number }

export function BuyCoinCard({ amount, coins }: BuyCoinCardProps) {
  const [status, setStatus] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleBuy() {
    setProcessing(true)
    setStatus('')
    try {
      const email = `player${Date.now()}@cleanpressperf.name.ng`
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, coins }),
      })
      const data = await response.json()
      if (!response.ok || !data.authorization_url) {
        throw new Error(data.message || 'Could not initialize payment')
      }
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
        <button
          type="button"
          onClick={handleBuy}
          disabled={processing}
          className="mt-4 w-full rounded-xl bg-[#d6ff38] py-3 text-sm font-black text-black disabled:cursor-wait disabled:opacity-60"
        >
          {processing ? 'Redirecting...' : 'Buy Now'}
        </button>
        {status && <p role="alert" className="mt-3 text-xs text-red-300">{status}</p>}
      </div>
    </div>
  )
}
