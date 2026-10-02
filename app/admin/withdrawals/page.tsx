'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Withdrawal = { id: string; email: string; bank_name: string; account_number: string; account_name: string; coins_requested: number; fee_coins: number; amount_naira: number; status: string; created_at: string }

export default function AdminWithdrawalsPage() {
  const router = useRouter(); const [rows, setRows] = useState<Withdrawal[]>([]); const [loading, setLoading] = useState(true)
  async function load() { const { data: { user } } = await supabase.auth.getUser(); if (user?.email !== 'rneg0519@gmail.com') return router.replace('/'); const { data } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false }); setRows((data || []) as Withdrawal[]); setLoading(false) }
  useEffect(() => { load() }, [])
  async function act(id: string, action: string) { const { data: { user } } = await supabase.auth.getUser(); if (!user?.email) return; const response = await fetch('/api/withdraw/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action, admin_email: user.email }) }); if (!response.ok) { const data = await response.json(); alert(data.error || 'Action failed'); return } load() }
  if (loading) return <main className="min-h-screen bg-[#080808] p-8 text-white">Loading withdrawals…</main>
  return <main className="min-h-screen overflow-x-auto bg-[#080808] p-8 text-white"><h1 className="text-3xl font-black">Withdrawals</h1><div className="mt-6 min-w-[1100px] overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/10"><tr>{['Email','Bank','Account Number','Account Name','Coins','Fee (30%)','Pay ₦','Status','Date','Action'].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-white/10"><td className="p-3">{row.email}</td><td className="p-3">{row.bank_name}</td><td className="p-3">{row.account_number}</td><td className="p-3">{row.account_name}</td><td className="p-3">{Number(row.coins_requested).toLocaleString()}</td><td className="p-3">{Number(row.fee_coins).toLocaleString()}</td><td className="p-3">₦{Number(row.amount_naira).toLocaleString()}</td><td className="p-3">{row.status}</td><td className="p-3">{new Date(row.created_at).toLocaleString()}</td><td className="p-3">{row.status === 'pending' && <div className="flex gap-2"><button onClick={()=>act(row.id,'paid')} className="rounded bg-green-500 px-2 py-1 font-bold text-black">Mark Paid</button><button onClick={()=>act(row.id,'rejected')} className="rounded bg-red-500 px-2 py-1 font-bold text-white">Reject</button></div>}</td></tr>)}</tbody></table></div></main>
}
