'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { addBalance } from '@/lib/wallet'
import { getBot, formatCoins } from '@/lib/bots'

function PlayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const bot = useMemo(() => getBot(searchParams.get('bot') ?? ''), [searchParams])
  if (!bot) return <main className="grid min-h-screen place-items-center bg-[#080808] px-6 text-white"><div className="text-center"><h1 className="text-3xl font-black">Bot not found</h1><Link className="mt-5 inline-block text-[#d6ff38] underline" href="/arena">Back to Arena</Link></div></main>
  return <main className="min-h-screen bg-[#080808] px-5 py-8 text-white sm:px-8"><div className="mx-auto max-w-4xl"><Link href="/arena" className="text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white">Back to Arena</Link><div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] p-5"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full bg-[#d6ff38] text-2xl font-black text-black">{bot.name[0]}</div><div><p className="text-xs uppercase tracking-widest text-white/40">You vs</p><h1 className="text-2xl font-black">{bot.name}</h1><p className="text-sm text-white/45">{bot.tier} bot</p></div></div><div className="text-right text-sm"><p className="text-white/40">Entry / Reward</p><p className="font-black">{formatCoins(bot.buyIn)} / <span className="text-[#d6ff38]">{formatCoins(bot.payout)}</span></p></div></div><div className="mt-5 grid h-96 place-items-center rounded-2xl border border-white/10 bg-zinc-900 text-sm font-bold uppercase tracking-widest text-white/35">Board Loading...</div>{result ? <div className="mt-5 rounded-2xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-6 text-center"><h2 className="text-2xl font-black">{result === 'win' ? 'Victory!' : 'Defeat'}</h2><p className="mt-2 text-white/60">{result === 'win' ? `You won ${formatCoins(bot.payout)} coins.` : 'The bot takes this round.'}</p><div className="mt-5 flex justify-center gap-3"><button onClick={() => router.push('/arena')} className="rounded-xl bg-[#d6ff38] px-5 py-3 text-sm font-black text-black">Play Again</button><button onClick={() => router.push('/withdraw')} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-black">Withdraw</button></div></div> : <div className="mt-5 flex justify-center gap-3"><button onClick={() => { addBalance(bot.payout); setResult('win') }} className="rounded-xl bg-[#d6ff38] px-6 py-3 text-sm font-black text-black">WIN</button><button onClick={() => setResult('lose')} className="rounded-xl border border-white/15 px-6 py-3 text-sm font-black">LOSE</button></div>}</div></main>
}

export default function PlayPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#080808] text-white">Loading arena...</main>}><PlayContent /></Suspense>
}
