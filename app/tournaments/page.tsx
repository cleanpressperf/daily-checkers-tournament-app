'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, Radio, Users } from 'lucide-react'
import { Nav, TournamentCard } from '../page'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const fallback = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>(fallback)
  const [message, setMessage] = useState('')
  useEffect(() => {
    supabase.from('tournaments').select('id,name,entry_coins,prize_naira,max_players,status').order('entry_coins').then(({ data }) => {
      if (data?.length) setTournaments(data.map(t => ({ ...t, entry: t.entry_coins, prize: t.prize_naira, joined: 0, tone: t.name === 'Gold' ? 'bg-[#e9e5d5]' : t.name === 'Silver' ? 'bg-[#ececec]' : 'bg-[#f3f3f3]' })))
    })
  }, [])
  async function join(tournament: any) {
    setMessage('Joining table...')
    const { error } = await supabase.rpc('join_tournament', { p_tournament_id: tournament.id, p_phone: null })
    setMessage(error ? (error.message.includes('insufficient') ? 'Not enough coins in your wallet.' : 'Sign in to join this tournament.') : `You joined ${tournament.name}.`)
  }
  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Live lobby</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Tonight&apos;s tournaments</h1><p className="mt-4 text-zinc-400">Registration closes at 6:30 PM WAT. Games begin at 7:00 PM sharp.</p></div><div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"><Radio className="size-4 text-[#ffd700]"/>Live lobby open</div></div>{message&&<p className="mt-6 rounded-xl border border-[#ffd700]/30 bg-[#ffd700]/10 p-4 text-sm text-[#ffd700]">{message}</p>}<div className="mt-12 grid gap-4 md:grid-cols-3">{tournaments.map(t => <div key={t.name} onClick={() => join(t)} className="cursor-pointer"><TournamentCard t={t}/></div>)}</div><div className="mt-12 rounded-[24px] border border-white/10 bg-zinc-950 p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Watch a live match</p><p className="mt-1 text-sm text-zinc-500">Spectate any ongoing game without joining.</p></div><Link href="/play/demo-match" className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"><Eye className="size-4"/>Watch live</Link></div></div></div></main>
}
