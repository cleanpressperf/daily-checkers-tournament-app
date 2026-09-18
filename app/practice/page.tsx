'use client'

import Link from 'next/link'
import { ArrowLeft, Bot, Check, CircleDollarSign, Crown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Nav } from '../page'
import { applyMove, getLegalMoves, initialBoard, indexAt, playable, botMove, type Move, type Piece, type Side } from '../../lib/draughts'

const levels = [['Easy', 'Random legal moves'], ['Medium', 'Capture priority'], ['Hard', 'Longest capture chain']] as const
const square = (r: number, c: number) => r * 10 + c
export default function PracticePage() {
  const [level, setLevel] = useState('Medium'), [started, setStarted] = useState(false), [board, setBoard] = useState<Piece[]>(initialBoard), [selected, setSelected] = useState<number | null>(null), [turn, setTurn] = useState<Side>('white'), [locked, setLocked] = useState<number | null>(null), [status, setStatus] = useState('White to move · captures are compulsory')
  const reset = () => { setBoard(initialBoard()); setSelected(null); setLocked(null); setTurn('white'); setStarted(true); setStatus('White to move · captures are compulsory') }
  const finishOrContinue = (next: Piece[], move: Move) => {
    const row = Math.floor(move.to / 10), col = move.to % 10, pieceIndex = indexAt(next, row, col)
    const continuations = pieceIndex >= 0 ? getLegalMoves(next, 'white', pieceIndex).filter((m) => m.captures.length) : []
    if (move.captures.length && continuations.length) { setBoard(next); setSelected(move.to); setLocked(move.to); setStatus(`Continue capture - you must take ${continuations[0].captures.length} more`); return }
    setBoard(next); setSelected(null); setLocked(null); setTurn('black'); setStatus('Black Bot thinking…')
  }
  useEffect(() => {
    if (!started || turn !== 'black') return
    const timer = window.setTimeout(() => { const move = botMove(board, level); if (!move) { setStatus('You win.'); return }; const next = applyMove(board, move); setBoard(next); setTurn('white'); setStatus('White to move · captures are compulsory') }, 700)
    return () => window.clearTimeout(timer)
  }, [started, turn, board, level])
  const handle = (to: number) => {
    if (!started || turn !== 'white') return
    const selectedIndex = selected === null ? -1 : indexAt(board, Math.floor(selected / 10), selected % 10)
    const move = selectedIndex >= 0 ? getLegalMoves(board, 'white', selectedIndex).find((candidate) => candidate.to === to) : undefined
    if (move) { finishOrContinue(applyMove(board, move), move); return }
    const index = indexAt(board, Math.floor(to / 10), to % 10)
    if (index >= 0 && board[index].side === 'white' && (locked === null || locked === to)) setSelected(to); else if (locked === null) setSelected(null)
  }
  const destinations = useMemo(() => { if (selected === null) return new Set<number>(); const i = indexAt(board, Math.floor(selected / 10), selected % 10); return new Set(i >= 0 ? getLegalMoves(board, 'white', i).map((m) => m.to) : []) }, [board, selected])
  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><section><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Free forever</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Sharpen your game.</h1><p className="mt-5 max-w-md leading-7 text-zinc-400">Official FMJD International Draughts on a true 10×10 board. No entry fee, no limits.</p><div className="mt-5 rounded-xl border border-white/10 bg-zinc-950 p-4 text-xs leading-5 text-zinc-400">RULESET: International Draughts 10×10 (FMJD) — 20 pieces, flying kings, men capture forward + backward, mandatory max capture, White moves first.</div><div className="mt-6 flex items-center gap-2 text-sm text-zinc-400"><CircleDollarSign className="size-4 text-[#ffd700]"/>Costs 0 coins to play</div><div className="mt-8 flex flex-col gap-3">{levels.map(([name, copy]) => <button key={name} onClick={() => setLevel(name)} className={`flex items-center justify-between rounded-2xl border p-4 text-left ${level === name ? 'border-white bg-white text-black' : 'border-white/10 bg-zinc-950'}`}><span className="flex items-center gap-3"><Bot className="size-5"/><span><strong className="block text-sm">{name} Bot</strong><small className={level === name ? 'text-black/55' : 'text-zinc-500'}>{copy}</small></span></span>{level === name && <Check className="size-4"/>}</button>)}</div><button onClick={reset} className="mt-6 w-full rounded-xl bg-white py-4 text-sm font-semibold text-black">{started ? 'Restart practice' : 'Start practice'}</button></section><section><p className="mb-3 text-center text-sm text-zinc-500">{status}</p><div className="mx-auto grid aspect-square w-full max-w-[560px] grid-cols-10 overflow-hidden rounded-2xl border-8 border-zinc-800">{Array.from({ length: 100 }, (_, i) => { const r = Math.floor(i / 10), c = i % 10, dark = playable(r, c), index = indexAt(board, r, c), piece = index >= 0 ? board[index] : undefined, target = destinations.has(i); return <button key={i} disabled={!dark} onClick={() => handle(i)} aria-label={`${r + 1},${c + 1}`} className={`relative flex items-center justify-center ${dark ? 'bg-[#464646]' : 'bg-[#e8e8e8]'} ${target ? 'ring-4 ring-inset ring-[#ffd700]' : ''}`}>{piece && <span className={`relative flex size-[62%] items-center justify-center rounded-full border-2 ${piece.side === 'white' ? 'border-zinc-400 bg-white' : 'border-zinc-950 bg-black'} ${selected === i ? 'ring-4 ring-[#ffd700]' : ''}`}>{piece.king && <Crown className={`size-1/2 ${piece.side === 'white' ? 'text-black' : 'text-white'}`}/>}</span>}</button> })}</div></section></div></div></main>
}
