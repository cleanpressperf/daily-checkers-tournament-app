'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { canAfford, deductBalance, addBalance } from '@/lib/wallet'
import { formatCoins, getBot } from '@/lib/bots'

type Piece = 'red' | 'black' | null

const initialBoard: Piece[][] = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => {
    if ((row + col) % 2 === 0) return null
    if (row < 3) return 'black'
    if (row > 4) return 'red'
    return null
  }),
)

function PlayContent() {
  const params = useSearchParams()
  const router = useRouter()
  const bot = useMemo(() => getBot(params.get('bot') ?? ''), [params])
  const [board, setBoard] = useState<Piece[][]>(initialBoard)
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [error, setError] = useState('')

  if (!bot) return <main className="grid min-h-screen place-items-center bg-[#080808] px-6 text-white"><div className="text-center"><h1 className="text-3xl font-black">Bot not found</h1><Link className="mt-5 inline-block text-[#d6ff38] underline" href="/arena">Back to Arena</Link></div></main>

  function startGame() {
    if (!canAfford(bot.buyIn)) { router.push('/buy-coins'); return }
    if (!deductBalance(bot.buyIn)) return
    setStarted(true)
    setError('')
  }

  function chooseSquare(row: number, col: number) {
    if (!started || result || (row + col) % 2 === 0) return
    const piece = board[row][col]
    if (selected) {
      const [fromRow, fromCol] = selected
      const validMove = !piece && Math.abs(row - fromRow) === 1 && Math.abs(col - fromCol) === 1
      if (validMove) {
        const next = board.map((line) => [...line])
        next[row][col] = next[fromRow][fromCol]
        next[fromRow][fromCol] = null
        setBoard(next)
        setSelected(null)
        window.setTimeout(() => { addBalance(bot.payout); setResult('win') }, 350)
      } else if (piece === 'red') setSelected([row, col])
      else setSelected(null)
      return
    }
    if (piece === 'red') setSelected([row, col])
  }

  return <main className="min-h-screen bg-[#080808] px-4 py-6 text-white sm:px-8"><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between"><Link href="/arena" className="text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white">Back to Arena</Link><span className="text-sm font-bold text-[#d6ff38]">{bot.name} • {formatCoins(bot.buyIn)} entry</span></div><header className="mt-7 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d6ff38]">1vs1 Checkers</p><h1 className="mt-2 text-4xl font-black">You vs {bot.name}</h1></div><p className="text-right text-sm text-white/50">Win {formatCoins(bot.payout)}</p></header><div className="mx-auto mt-7 max-w-[560px] rounded-2xl border border-white/10 bg-[#111] p-3 shadow-2xl"><div className="grid aspect-square grid-cols-8 overflow-hidden rounded-lg border border-white/10">{board.map((row, rowIndex) => row.map((piece, colIndex) => { const dark = (rowIndex + colIndex) % 2 === 1; const isSelected = selected?.[0] === rowIndex && selected?.[1] === colIndex; return <button key={`${rowIndex}-${colIndex}`} type="button" aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`} onClick={() => chooseSquare(rowIndex, colIndex)} className={`grid place-items-center ${dark ? 'bg-[#a3a06b]' : 'bg-[#e7dfb7]'} ${isSelected ? 'ring-4 ring-inset ring-[#d6ff38]' : ''}`}>{piece && <span className={`size-[62%] rounded-full border-4 shadow-lg sm:size-[68%] ${piece === 'red' ? 'border-[#ff8a80] bg-[#d94242]' : 'border-[#777] bg-[#252525]'}`} />}</button> }))}</div></div>{!started && !result && <div className="mt-6 text-center"><button type="button" onClick={startGame} className="rounded-xl bg-[#d6ff38] px-8 py-4 text-sm font-black uppercase tracking-widest text-black">Start Match</button><p className="mt-3 text-sm text-white/45">Entry fee: {formatCoins(bot.buyIn)}. Select a red piece, then an adjacent dark square.</p></div>}{started && !result && <p className="mt-5 text-center text-sm font-bold text-white/60">Your turn — select a red piece to move.</p>}{result && <div className="mt-6 rounded-2xl border border-[#d6ff38]/30 bg-[#d6ff38]/10 p-6 text-center"><h2 className="text-3xl font-black">Victory</h2><p className="mt-2 text-white/65">You won {formatCoins(bot.payout)} coins.</p><button type="button" onClick={() => router.push('/arena')} className="mt-5 rounded-xl bg-[#d6ff38] px-6 py-3 text-sm font-black text-black">Back to Arena</button></div>}{error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}</div></main>
}

export default function PlayPage() { return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#080808] text-white">Loading match...</main>}><PlayContent /></Suspense> }
