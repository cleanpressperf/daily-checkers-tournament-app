'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { deductBalance, getBalance } from '@/lib/wallet'
import { supabase } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const sync = () => setBalance(getBalance())
    sync()
    window.addEventListener('wallet-change', sync)
    return () => window.removeEventListener('wallet-change', sync)
  }, [])

  async function requestWithdrawal() {
    const value = Number(amount)
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setMessage('Complete your bank details before submitting.')
      return
    }
    if (!Number.isInteger(value) || value <= 0 || value > balance) {
      setMessage('Enter a valid whole amount within your balance.')
      return
    }
    setSubmitting(true)
    setMessage('')
    const { error } = await supabase.from('withdrawals').insert({
      user_id: 'guest', bank_name: bankName.trim(), account_number: accountNumber.trim(),
      account_name: accountName.trim(), amount: value, status: 'pending',
    })
    if (error) {
      setSubmitting(false)
      setMessage('We could not submit your request. Please try again.')
      return
    }
    if (!deductBalance(value)) {
      setSubmitting(false)
      setMessage('Your balance changed. Refresh and try again.')
      return
    }
    setBalance(getBalance())
    setAmount('')
    setSubmitting(false)
    setMessage('Withdrawal request received. Funds will be deposited within 48 hours.')
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-8 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/arena" className="text-sm text-white/50">Back to Arena</Link>
        <h1 className="mt-10 text-4xl font-black">Withdraw coins</h1>
        <p className="mt-3 text-white/50">Requests remain pending for 24 hours while they are reviewed.</p>
        <div className="mt-6 rounded-2xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d6ff38]">Available balance</p>
          <p className="mt-2 text-4xl font-black text-[#d6ff38]">N{balance.toLocaleString()}</p>
        </div>
        <div className="mt-8 space-y-3">
          <input aria-label="Bank name" value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Bank name" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#d6ff38]" />
          <input aria-label="Account number" inputMode="numeric" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Account number" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#d6ff38]" />
          <input aria-label="Account name" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Account name" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#d6ff38]" />
          <input aria-label="Withdrawal amount" inputMode="numeric" value={amount} onChange={(event) => { setAmount(event.target.value); setMessage('') }} placeholder="Amount" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#d6ff38]" />
        </div>
        <button disabled={submitting} onClick={requestWithdrawal} className="mt-4 w-full rounded-xl bg-[#d6ff38] px-5 py-3 font-black text-black disabled:opacity-50">{submitting ? 'SUBMITTING…' : 'REQUEST WITHDRAWAL'}</button>
        {message && <p role="status" className="mt-4 text-center text-sm text-white/70">{message}</p>}
      </div>
    </main>
  )
}
