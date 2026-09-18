'use client'

import Link from 'next/link'
import { ArrowLeft, Bot, Check, CircleDollarSign, Crown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Nav } from '../page'

type Color = 'w' | 'b'
type Piece = { color: Color; king: boolean }
type Board = Array<Piece | null>
type Move = { from: number; to: number; capture?: number }
const N = 10
const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const
const isDark = (r: number, c: number) => (r + c) % 2 === 1
const id = (r: number, c: number) => r * N + c
const inside = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N
const rc = (i: number) => [Math.floor(i / N), i % N] as const

function initialBoard(): Board {
  const board: Board = Array(100).fill(null)
  for (let r = 0; r < 4; r++) for (let c = 0; c < N; c++) if (isDark(r, c)) board[id(r, c)] = { color: 'w', king: false }
  for (let r = 6; r < 10; r++) for (let c = 0; c < N; c++) if (isDark(r, c)) board[id(r, c)] = { color: 'b', king: false }
  return board
}

function movesFor(board: Board, from: number, capturesOnly = false): Move[] {
  const piece = board[from]; if (!piece) return []
  const [r, c] = rc(from), result: Move[] = []
  const enemy = (p: Piece | null) => p !== null && p.color !== piece.color
  const scan = piece.king ? dirs : (piece.color === 'b' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]])
  if (!capturesOnly && piece.king) for (const [dr, dc] of scan) { let rr = r + dr, cc = c + dc; while (inside(rr, cc) && isDark(rr, cc) && !board[id(rr, cc)]) { result.push({ from, to: id(rr, cc) }); rr += dr; cc += dc } }
  if (!capturesOnly && !piece.king) for (const [dr, dc] of scan) { const rr = r + dr, cc = c + dc; if (inside(rr, cc) && isDark(rr, cc) && !board[id(rr, cc)]) result.push({ from, to: id(rr, cc) }) }
  for (const [dr, dc] of dirs) {
    let rr = r + dr, cc = c + dc
    if (!piece.king) { const lr = r + dr * 2, lc = c + dc * 2; if (inside(rr, cc) && enemy(board[id(rr, cc)]) && inside(lr, lc) && isDark(lr, lc) && !board[id(lr, lc)]) result.push({ from, to: id(lr, lc), capture: id(rr, cc) }); continue }
    while (inside(rr, cc) && isDark(rr, cc) && !board[id(rr, cc)]) { rr += dr; cc += dc }
    if (!inside(rr, cc) || !enemy(board[id(rr, cc)])) continue
    rr += dr; cc += dc
    while (inside(rr, cc) && isDark(rr, cc) && !board[id(rr, cc)]) { result.push({ from, to: id(rr, cc), capture: id(rr - dr, cc - dc) }); rr += dr; cc += dc }
  }
  return result
}
function allCaptures(board: Board, color: Color) { return board.flatMap((p, i) => p?.color === color ? movesFor(board, i, true) : []) }
function legalFor(board: Board, color: Color, from: number | null) { const captures = allCaptures(board, color); return captures.length ? (from === null ? captures : captures.filter(m => m.from === from)) : (from === null ? board.flatMap((p, i) => p?.color === color ? movesFor(board, i) : []) : movesFor(board, from)) }
function apply(board: Board, move: Move): Board { const next = [...board], piece = next[move.from]; next[move.from] = null; next[move.to] = piece; if (move.capture !== undefined) next[move.capture] = null; if (piece && ((piece.color === 'b' && Math.floor(move.to / N) === 0) || (piece.color === 'w' && Math.floor(move.to / N) === 9))) next[move.to] = { ...piece, king: true }; return next }

const levels = [['Easy', 'Random legal moves'], ['Medium', 'Capture priority'], ['Hard', 'Longest capture chain']] as const
export default function PracticePage() {
  const [level, setLevel] = useState('Medium'), [started, setStarted] = useState(false), [board, setBoard] = useState<Board>(initialBoard), [selected, setSelected] = useState<number | null>(null), [turn, setTurn] = useState<Color>('b'), [mustContinue, setMustContinue] = useState<number | null>(null), [status, setStatus] = useState('Black to move · captures are compulsory')
  const reset = () => { setBoard(initialBoard()); setSelected(null); setMustContinue(null); setTurn('b'); setStarted(true); setStatus('Black to move · captures are compulsory') }
  const doBot = (current: Board) => { window.setTimeout(() => { const options = legalFor(current, 'w', null); if (!options.length) { setStatus('You win.'); return }; const move = level === 'Easy' ? options[Math.floor(Math.random() * options.length)] : options.sort((a, b) => Number(Boolean(b.capture)) - Number(Boolean(a.capture)))[0]; const next = apply(current, move); setBoard(next); setTurn('b'); setStatus('Black to move · captures are compulsory') }, 700) }
  const handle = (square: number) => { if (!started || turn !== 'b') return; const piece = board[square]; const move = selected === null ? undefined : legalFor(board, 'b', selected).find(m => m.to === square); if (move) { const next = apply(board, move), continuation = move.capture !== undefined ? movesFor(next, move.to, true) : []; setBoard(next); if (continuation.length) { setSelected(move.to); setMustContinue(move.to); setStatus('Continue your capture'); return }; setSelected(null); setMustContinue(null); setTurn('w'); setStatus('White Bot thinking…'); doBot(next); return } if (piece?.color === 'b' && (mustContinue === null || mustContinue === square) && legalFor(board, 'b', square).length) setSelected(square); else if (mustContinue === null) setSelected(null) }
  const destinations = useMemo(() => new Set(legalFor(board, 'b', selected).map(m => m.to)), [board, selected])
  useEffect(() => { if (started && turn === 'w') doBot(board) }, [])
  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><section><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Free forever</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Sharpen your game.</h1><p className="mt-5 max-w-md leading-7 text-zinc-400">International Draughts on a true 10×10 board. No entry fee, no limits.</p><div className="mt-8 flex items-center gap-2 text-sm text-zinc-400"><CircleDollarSign className="size-4 text-[#ffd700]"/>Costs 0 coins to play</div><div className="mt-10 flex flex-col gap-3">{levels.map(([name, copy]) => <button key={name} onClick={() => setLevel(name)} className={`flex items-center justify-between rounded-2xl border p-4 text-left ${level === name ? 'border-white bg-white text-black' : 'border-white/10 bg-zinc-950'}`}><span className="flex items-center gap-3"><Bot className="size-5"/><span><strong className="block text-sm">{name} Bot</strong><small className={level === name ? 'text-black/55' : 'text-zinc-500'}>{copy}</small></span></span>{level === name && <Check className="size-4"/>}</button>)}</div><button onClick={reset} className="mt-6 w-full rounded-xl bg-white py-4 text-sm font-semibold text-black">{started ? 'Restart practice' : 'Start practice'}</button></section><section><p className="mb-3 text-center text-sm text-zinc-500">{status}</p><div className="mx-auto grid aspect-square w-full max-w-[560px] grid-cols-10 overflow-hidden rounded-2xl border-8 border-zinc-800">{board.map((piece, square) => { const [r, c] = rc(square), dark = isDark(r, c), target = destinations.has(square); return <button key={square} disabled={!dark} onClick={() => handle(square)} aria-label={`${r + 1},${c + 1}`} className={`relative flex items-center justify-center ${dark ? 'bg-[#8B5A2B]' : 'bg-[#F5DEB3]'} ${selected === square ? 'ring-4 ring-inset ring-yellow-300' : ''}`}>{target && !piece && <span className="size-3 rounded-full bg-yellow-300 shadow-[0_0_0_5px_rgba(250,204,21,.25)]"/>}{piece && <span className={`flex size-[68%] items-center justify-center rounded-full border-2 shadow-lg ${piece.color === 'b' ? 'border-zinc-950 bg-zinc-950' : 'border-white bg-zinc-100'} ${piece.color === 'b' && selected === square ? 'ring-4 ring-yellow-300' : ''}`}>{piece.king && <Crown className={`size-1/2 ${piece.color === 'b' ? 'text-yellow-300' : 'text-zinc-800'}`}/>}</span>}</button>})}</div><p className="mt-4 text-center text-xs text-zinc-500">Black moves first. Captures are compulsory. Light squares are disabled.</p></section></div></div></main>
}
