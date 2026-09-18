'use client'

import Link from 'next/link'
import { ArrowLeft, CircleDollarSign, ShieldAlert } from 'lucide-react'
import { Nav } from '../page'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Entry = { id: string; user_id: string; tournament_id: string; is_bot: boolean; bot_name: string | null; status: string | null; phone: string | null }

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  useEffect(() => {
    supabase.from('tournament_entries').select('id,user_id,tournament_id,is_bot,bot_name,status,phone').order('id', { ascending: false }).limit(20).then(({ data }) => setEntries(data ?? []))
  }, [])
  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-6xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-red-400">Private admin</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Operations</h1></div><div className="flex items-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-xs text-red-300"><ShieldAlert className="size-4"/>Staff only</div></div><div className="mt-10 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-white p-5 text-black"><p className="text-sm text-black/50">Entries today</p><strong className="mt-3 block text-4xl">{entries.length}</strong></div><div className="rounded-2xl bg-white p-5 text-black"><p className="text-sm text-black/50">Prize liability</p><strong className="mt-3 block text-4xl"><CircleDollarSign className="mr-1 inline size-7 text-[#c39c00]"/>23,000</strong></div><div className="rounded-2xl bg-white p-5 text-black"><p className="text-sm text-black/50">Bots in lobby</p><strong className="mt-3 block text-4xl">{entries.filter(entry => entry.is_bot).length}</strong></div></div><div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"><div className="border-b border-white/10 px-5 py-4 text-sm font-semibold">Tournament entries</div>{entries.length ? entries.map(entry => <div key={entry.id} className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-sm"><span className="truncate">{entry.is_bot ? entry.bot_name ?? 'Practice bot' : entry.user_id} · {entry.status ?? 'registered'}</span>{entry.is_bot ? <span className="shrink-0 rounded-full bg-red-600 px-2 py-1 text-[10px] font-black text-white">BOT - DO NOT PAY</span> : <button className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black">Mark paid</button>}</div>) : <p className="px-5 py-8 text-sm text-zinc-500">No entries yet.</p>}</div></div></main>
}
