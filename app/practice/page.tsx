'use client'

import Link from 'next/link'
import { ArrowLeft, Bot, Check, CircleDollarSign, Crown } from 'lucide-react'
import { useState } from 'react'
import { Nav } from '../page'
import { applyMove, botMove, getLegalMoves, indexAt, initialBoard, playable, type Move, type Piece } from '@/lib/draughts'

const levels = [['Easy', 'Random legal moves'], ['Medium', 'Capture priority'], ['Hard', 'Position-aware bot']] as const

export default function PracticePage() {
  const [level, setLevel] = useState('Medium')
  const [started, setStarted] = useState(false)
  const [board, setBoard] = useState<Piece[]>(initialBoard)
  const [selected, setSelected] = useState<number | null>(null)
  const [turn, setTurn] = useState<'black' | 'white'>('black')
  const [forcedPiece, setForcedPiece] = useState<number | null>(null)
  const [status, setStatus] = useState('Black to move · captures are compulsory')

  function reset() { setBoard(initialBoard()); setSelected(null); setForcedPiece(null); setTurn('black'); setStarted(true); setStatus('Black to move · captures are compulsory') }
  function finishBot(next: Piece[]) {
    window.setTimeout(() => {
      const move = botMove(next, level)
      if (!move) { setTurn('black'); setStatus('You win.'); return }
      const botBoard = applyMove(next, move)
      setBoard(botBoard); setTurn('black'); setStatus('Black to move · captures are compulsory')
    }, 800)
  }
  function handleSquare(row: number, col: number) {
    if (!started || turn !== 'black') return
    const target = row * 10 + col
    const at = indexAt(board, row, col)
    if (selected !== null) {
      const move = getLegalMoves(board, 'black', selected).find((candidate) => candidate.to === target)
      if (move) {
        const next = applyMove(board, move); setBoard(next)
        const movedIndex = indexAt(next, row, col)
        const continuation = move.captures.length > 0 && movedIndex >= 0 ? getLegalMoves(next, 'black', movedIndex) : []
        if (continuation.length) { setSelected(movedIndex); setForcedPiece(movedIndex); setStatus('Continue your capture'); return }
        setSelected(null); setForcedPiece(null); setTurn('white'); setStatus('White (Bot) thinking…'); finishBot(next); return
      }
    }
    if (at >= 0 && board[at].side === 'black' && (forcedPiece === null || forcedPiece === at) && getLegalMoves(board, 'black', at).length) setSelected(at)
    else if (forcedPiece === null) setSelected(null)
  }
  const legalMoves: Move[] = selected === null ? [] : getLegalMoves(board, 'black', selected)
  const destinations = new Set(legalMoves.map((move) => move.to))

  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><section><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Free forever</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Sharpen your game.</h1><p className="mt-5 max-w-md leading-7 text-zinc-400">International Draughts on a true 10×10 board. No entry fee, no limits.</p><div className="mt-8 flex items-center gap-2 text-sm text-zinc-400"><CircleDollarSign className="size-4 text-[#ffd700]"/>Costs 0 coins to play</div><div className="mt-10 flex flex-col gap-3">{levels.map(([name, copy]) => <button key={name} onClick={() => setLevel(name)} className={`flex items-center justify-between rounded-2xl border p-4 text-left ${level === name ? 'border-white bg-white text-black' : 'border-white/10 bg-zinc-950'}`}><span className="flex items-center gap-3"><Bot className="size-5"/><span><strong className="block text-sm">{name} Bot</strong><small className={level === name ? 'text-black/55' : 'text-zinc-500'}>{copy}</small></span></span>{level === name && <Check className="size-4"/>}</button>)}</div><button onClick={reset} className="mt-6 w-full rounded-xl bg-white py-4 text-sm font-semibold text-black">{started ? 'Restart practice' : 'Start practice'}</button></section><section><p className="mb-3 text-center text-sm text-zinc-500">{status}</p><div className="mx-auto grid aspect-square w-full max-w-[560px] grid-cols-10 overflow-hidden rounded-2xl border-8 border-zinc-800 bg-[#eee4ce]">{Array.from({ length: 100 }, (_, square) => { const row = Math.floor(square / 10), col = square % 10, at = indexAt(board, row, col), piece = at >= 0 ? board[at] : null, target = destinations.has(square); return <button key={square} aria-label={`Square ${row + 1}, ${col + 1}`} onClick={() => handleSquare(row, col)} className={`relative aspect-square ${playable(row, col) ? 'bg-[#78634b]' : 'bg-[#eee4ce]'} ${target ? 'ring-4 ring-inset ring-[#ffd700]' : ''}`}>{target && <span className="absolute inset-0 m-auto size-3 rounded-full bg-[#ffd700]"/>}{piece && <span className={`absolute inset-[13%] grid place-items-center rounded-full border-2 shadow-lg ${piece.side === 'black' ? 'border-zinc-700 bg-black' : 'border-zinc-400 bg-white'} ${selected === at ? 'ring-4 ring-[#ffd700] ring-offset-2 ring-offset-[#78634b]' : ''}`}>{piece.king && <Crown className={`size-1/2 ${piece.side === 'black' ? 'text-[#ffd700]' : 'text-[#9b7800]'}`}/>}</span>}</button> })}</div><p className="mt-4 text-center text-xs text-zinc-600">Black pieces move first · 20 pieces per side · compulsory captures</p></section></div></div></main>
}
