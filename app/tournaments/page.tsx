import Link from 'next/link'
import { ArrowLeft, Eye, Radio, Users } from 'lucide-react'
import { Nav, TournamentCard } from '../page'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

export default function TournamentsPage() {
  return <main className="min-h-screen bg-black text-white"><Nav /><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4" />Back home</Link><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Live lobby</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Tonight&apos;s tournaments</h1><p className="mt-4 text-zinc-400">Registration closes at 6:30 PM WAT. Games begin at 7:00 PM sharp.</p></div><div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"><Radio className="size-4 text-[#ffd700]" />Live lobby open</div></div><div className="mt-12 grid gap-4 md:grid-cols-3">{tournaments.map(t => <TournamentCard key={t.name} t={t} />)}</div><div className="mt-12 rounded-[24px] border border-white/10 bg-zinc-950 p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Watch a live match</p><p className="mt-1 text-sm text-zinc-500">Spectate any ongoing game without joining.</p></div><Link href="/play/demo-match" className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"><Eye className="size-4" />Watch live</Link></div></div></div></main>
}

export { Coins }
