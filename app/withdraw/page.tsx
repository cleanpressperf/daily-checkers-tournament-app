'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getBalance } from '@/lib/wallet'
import { supabase } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0)
  const [coins, setCoins] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const entered = Number(coins) || 0
  const fee = Math.floor(entered * 0.3)
  const receive = Math.floor(entered * 0.7)

  useEffect(() => {
    const sync = () => setBalance(getBalance())
    sync(); window.addEventListener('wallet-change', sync)
    return () => window.removeEventListener('wallet-change', sync)
  }, [])

  async function requestWithdrawal() {
    if (entered < 5000 || entered > balance) return setMessage(entered < 5000 ? 'Min withdraw 5000 coins.' : 'Enter an amount within your balance.')
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) return setMessage('Complete your bank details before submitting.')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return setMessage('Please sign in before withdrawing.')
    setSubmitting(true); setMessage('')
    const response = await fetch('/api/withdraw/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, bank_name: bankName, account_number: accountNumber, account_name: accountName, coins: entered }) })
    const data = await response.json()
    setSubmitting(false)
    if (!response.ok) return setMessage(data.error || 'Could not submit request.')
    setBalance(balance - entered); setCoins(''); setMessage(`Request sent! You will receive ₦${Number(data.amount_naira).toLocaleString()}.`)
  }

  return <main className="min-h-screen bg-[#080808] px-5 py-8 text-white"><div className="mx-auto max-w-lg"><Link href="/arena" className="text-sm text-white/50">Back to Arena</Link><h1 className="mt-10 text-4xl font-black">Withdraw coins</h1><p className="mt-3 text-white/50">Manual requests are reviewed by the admin.</p><div className="mt-6 rounded-2xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#d6ff38]">Available balance</p><p className="mt-2 text-4xl font-black text-[#d6ff38]">{balance.toLocaleString()} coins</p></div><div className="mt-8 space-y-3"><input aria-label="Bank name" value={bankName} onChange={e=>setBankName(e.target.value)} placeholder="Bank name" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3" /><input aria-label="Account number" inputMode="numeric" value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} placeholder="Account number" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3" /><input aria-label="Account name" value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="Account name" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3" /><input aria-label="Coins to withdraw" inputMode="numeric" min={5000} value={coins} onChange={e=>{setCoins(e.target.value);setMessage('')}} placeholder="Coins to withdraw" className="w-full rounded-xl border border-white/15 bg-[#111] px-4 py-3" /></div>{entered > 0 && <p className="mt-4 text-sm text-white/70">You enter {entered.toLocaleString()} coins → 30% fee = {fee.toLocaleString()} coins. You will receive ₦{receive.toLocaleString()} in your bank.</p>}<p className="mt-2 text-xs text-white/45">Min withdraw 5000 coins.</p><button disabled={submitting} onClick={requestWithdrawal} className="mt-4 w-full rounded-xl bg-[#d6ff38] px-5 py-3 font-black text-black disabled:opacity-50">{submitting ? 'SUBMITTING…' : 'REQUEST WITHDRAWAL'}</button>{message && <p role="status" className="mt-4 text-center text-sm text-white/70">{message}</p>}</div></main>
}
