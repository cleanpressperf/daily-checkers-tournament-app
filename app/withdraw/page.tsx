'use client'

import Link from 'next/link'
import { useState } from 'react'
import { deductBalance, getBalance } from '@/lib/wallet'

export default function WithdrawPage() {
  const [balance, setBalance] = useState(getBalance)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  function requestWithdrawal() {
    const value = Number(amount)
    if (!Number.isInteger(value) || value <= 0 || value > balance) {
      setMessage('Enter a valid amount within your balance.')
      return
    }
    deductBalance(value)
    setBalance(getBalance())
    setAmount('')
    setMessage(`Withdrawal requested for N${value.toLocaleString()}.`)
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-lg">
        <Link href="/arena" className="text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white">
          Back to Arena
        </Link>

        <h1 className="mt-12 text-4xl font-black">Withdraw coins</h1>

        <div className="mt-6 rounded-2xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d6ff38]">Available balance</p>
          <p className="mt-2 text-4xl font-black text-[#d6ff38]">N{balance.toLocaleString()}</p>
        </div>

        <label className="mt-8 block text-sm font-bold" htmlFor="withdraw-amount">
          Amount
        </label>
        <input
          id="withdraw-amount"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#d6ff38]"
          placeholder="Enter amount"
        />

        <button
          onClick={requestWithdrawal}
          className="mt-4 w-full rounded-xl bg-[#d6ff38] px-5 py-3 text-sm font-black text-black"
        >
          Request Withdrawal
        </button>

        {message && <p className="mt-4 text-center text-sm text-white/70">{message}</p>}
      </div>
    </main>
  )
}
