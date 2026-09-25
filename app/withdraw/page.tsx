'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { deductBalance, getBalance } from '@/lib/wallet'

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sync = () => setBalance(getBalance())
    sync()
    window.addEventListener('wallet-change', sync)
    return () => window.removeEventListener('wallet-change', sync)
  }, [])

  function requestWithdrawal() {
    const value = Number(amount)
    if (!Number.isInteger(value) || value <= 0) { setMessage('Enter a positive whole number.'); return }
    if (value > balance) { setMessage('That amount is greater than your available balance.'); return }
    if (!deductBalance(value)) { setMessage('Unable to process this withdrawal.'); return }
    setBalance(getBalance())
    setAmount('')
    setMessage(`Withdrawal request submitted for N${value.toLocaleString()}.`)
  }

  return <main className="min-h-screen bg-[#080808] px-5 py-8 text-white sm:px-8"><div className="mx-auto max-w-lg"><Link href="/arena" className="text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white">Back to Arena</Link><h1 className="mt-12 text-4xl font-black">Withdraw coins</h1><p className="mt-3 text-white/50">Move your winnings out of your game balance.</p><section className="mt-6 rounded-2xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-6" aria-label="Available balance"><p className="text-xs font-bold uppercase tracking-widest text-[#d6ff38]">Available balance</p><p className="mt-2 text-4xl font-black text-[#d6ff38]">N{balance.toLocaleString()}</p></section><label className="mt-8 block text-sm font-bold" htmlFor="withdraw-amount">Amount</label><input id="withdraw-amount" inputMode="numeric" min="1" value={amount} onChange={(event) => { setAmount(event.target.value); setMessage('') }} className="mt-2 w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#d6ff38]" placeholder="Enter amount" /><button type="button" onClick={requestWithdrawal} className="mt-4 w-full rounded-xl bg-[#d6ff38] px-5 py-3 text-sm font-black text-black">Request Withdrawal</button>{message && <p role="status" className="mt-4 text-center text-sm text-white/70">{message}</p>}</div></main>
}
