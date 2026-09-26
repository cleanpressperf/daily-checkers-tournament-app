'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { applyMove, Board, chooseMove, createBoard, getMoves, logCounts, Side, winner } from '@/lib/checkers'

const levels = { Easy: { depth: 2, mistake: 0.5 }, Medium: { depth: 3, mistake: 0 }, Hard: { depth: 2, mistake: 0 } }
export default function FreePage() {
  const [level, setLevel] = useState<keyof typeof levels>('Easy')
  const [board, setBoard] = useState<Board>(() => createBoard())
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [turn, setTurn] = useState<Side>('red')
  const [message, setMessage] = useState('Your turn')
  const moves = useMemo(() => getMoves(board, turn), [board, turn])
  const reset = () => { setBoard(createBoard()); setTurn('red'); setSelected(null); setMessage('Your turn') }
  const click = (r: number, c: number) => {
    if (turn !== 'red') return
    const chosen = moves.find(move => move.path[0][0] === selected?.[0] && move.path[0][1] === selected?.[1] && move.path.at(-1)?.[0] === r && move.path.at(-1)?.[1] === c)
    if (chosen) {
      const next = applyMove(board, chosen); setBoard(next); setSelected(null); logCounts(next, 'black')
      const botMove = chooseMove(next, 'black', levels[level].depth, levels[level].mistake)
      if (!botMove) { setMessage('You win.'); return }
      window.setTimeout(() => { const after = applyMove(next, botMove); setBoard(after); setTurn('red'); logCounts(after, 'red'); setMessage(winner(after, 'red') === 'red' ? 'You win.' : 'Your turn') }, 280)
      return
    }
    if (board[r][c]?.side === 'red') setSelected([r, c])
  }
  return <main className="min-h-screen bg-[#080808] px-4 py-8 text-white"><div className="mx-auto max-w-3xl"><div className="flex justify-between"><Link href="/arena" className="text-sm text-white/50">Back to Arena</Link><button onClick={reset} className="text-sm text-[#d6ff38]">New game</button></div><h1 className="mt-8 text-4xl font-black">Free Practice</h1><p className="mt-2 text-white/50">International 10×10 rules. Captures are mandatory.</p><div className="mt-6 flex gap-2">{(Object.keys(levels) as (keyof typeof levels)[]).map(item => <button key={item} onClick={() => { setLevel(item); reset() }} className={`rounded-lg px-4 py-2 text-sm font-bold ${level === item ? 'bg-[#d6ff38] text-black' : 'bg-white/10'}`}>{item}</button>)}</div><p className="mt-5 font-bold text-[#d6ff38]">{message}</p><div className="mx-auto mt-5 grid aspect-square max-w-[560px] grid-cols-10 overflow-hidden rounded-xl border border-white/10">{board.map((row, r) => row.map((cell, c) => { const dark = (r+c)%2===1; const selectedSquare = selected?.[0]===r && selected?.[1]===c; return <button key={`${r}-${c}`} onClick={() => click(r,c)} className={`grid place-items-center ${dark ? 'bg-[#9b9864]' : 'bg-[#e7dfb7]'} ${selectedSquare ? 'ring-4 ring-inset ring-[#d6ff38]' : ''}`}>{cell && <span className={`size-[62%] rounded-full border-4 ${cell.side === 'red' ? 'border-red-300 bg-red-600' : 'border-zinc-500 bg-zinc-900'} ${cell.king ? 'ring-4 ring-yellow-300' : ''}`} />}</button> }))}</div></div></main>
}
