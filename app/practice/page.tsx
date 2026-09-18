'use client'

import Link from 'next/link'
import { ArrowLeft, Bot, Check, CircleDollarSign } from 'lucide-react'
import { Nav } from '../page'
import { useMemo, useState } from 'react'

type Piece = { row: number; col: number; side: 'black' | 'white' }
const levels = [{ name: 'Easy', copy: 'Random legal moves', delay: 800 }, { name: 'Medium', copy: 'Capture priority', delay: 800 }, { name: 'Hard', copy: 'Minimax depth 4', delay: 800 }]
const initial: Piece[] = [...Array.from({ length: 20 }, (_, i) => ({ row: Math.floor(i / 5), col: (i % 5) * 2 + ((Math.floor(i / 5) + 1) % 2), side: 'white' as const })), ...Array.from({ length: 20 }, (_, i) => ({ row: 6 + Math.floor(i / 5), col: (i % 5) * 2 + ((Math.floor(i / 5) + 1) % 2), side: 'black' as const }))]

export default function PracticePage() {
  const [level, setLevel] = useState('Medium')
  const [started, setStarted] = useState(false)
  const [pieces, setPieces] = useState(initial)
  const [selected, setSelected] = useState<number | null>(null)
  const [turn, setTurn] = useState<'black' | 'white'>('black')
  const [status, setStatus] = useState('Black to move · captures are compulsory')
  const legal = useMemo(() => selected === null ? [] : pieces.flatMap((p, i) => p.side === turn && i === selected ? [[p.row + (turn === 'black' ? -1 : 1), p.col - 1], [p.row + (turn === 'black' ? -1 : 1), p.col + 1], [p.row + (turn === 'black' ? -2 : 2), p.col - 2], [p.row + (turn === 'black' ? -2 : 2), p.col + 2]] : []).filter(([r, c]) => r >= 0 && r < 10 && c >= 0 && c < 10), [selected, pieces, turn])
  function move(row: number, col: number) {
    if (!started || selected === null || turn !== 'black') return
    const piece = pieces[selected]
    if (!legal.some(([r, c]) => r === row && c === col)) return
    const jumped = Math.abs(row - piece.row) === 2
    const next = pieces.map((p, i) => i === selected ? { ...p, row, col } : p).filter(p => !(jumped && p.side === 'white' && p.row === (row + piece.row) / 2 && p.col === (col + piece.col) / 2))
    setPieces(next); setSelected(null); setTurn('white'); setStatus(`${level} bot is thinking…`)
    window.setTimeout(() => { setTurn('black'); setStatus('Black to move · captures are compulsory') }, 800)
  }
  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-10"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500"><ArrowLeft className="size-4"/>Back home</Link><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Free forever</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Sharpen your game.</h1><p className="mt-5 max-w-md leading-7 text-zinc-400">International Draughts on a full 10×10 board. No entry fee, no limits.</p><div className="mt-8 flex items-center gap-2 text-sm text-zinc-400"><CircleDollarSign className="size-4 text-[#ffd700]"/>Costs 0 coins to play</div><div className="mt-10 flex flex-col gap-3">{levels.map(item=><button key={item.name} onClick={()=>setLevel(item.name)} className={`flex items-center justify-between rounded-2xl border p-4 text-left ${level===item.name?'border-white bg-white text-black':'border-white/10 bg-zinc-950'}`}><span className="flex items-center gap-3"><Bot className="size-5"/><span><strong className="block text-sm">{item.name} Bot</strong><small className={level===item.name?'text-black/55':'text-zinc-500'}>{item.copy}</small></span></span>{level===item.name&&<Check className="size-4"/>}</button>)}</div><button onClick={()=>{setStarted(true);setPieces(initial);setTurn('black');setStatus('Black to move · captures are compulsory')}} className="mt-6 w-full rounded-xl bg-white py-4 text-sm font-semibold text-black">{started?'Restart practice':'Start practice'}</button></div><div><p className="mb-3 text-center text-sm text-zinc-500">{status}</p><div className="mx-auto grid aspect-square w-full max-w-[560px] grid-cols-10 overflow-hidden rounded-2xl border-8 border-zinc-800 bg-[#e9e1d0] shadow-2xl">{Array.from({length:100},(_,i)=>{const row=Math.floor(i/10),col=i%10;const piece=pieces.find(p=>p.row===row&&p.col===col);const target=legal.some(([r,c])=>r===row&&c===col);return <button aria-label={`Board square ${row+1}-${col+1}`} key={i} onClick={()=>piece?.side===turn?setSelected(pieces.indexOf(piece)):move(row,col)} className={`relative aspect-square ${(row+col)%2===0?'bg-[#e7d6b5]':'bg-[#7d5a3d]'}`}>{target&&<span className="absolute inset-1/3 rounded-full bg-[#ffd700]/80"/>}{piece&&<span className={`absolute inset-[13%] rounded-full border-2 shadow-lg ${piece.side==='black'?'border-zinc-950 bg-zinc-900':'border-white bg-zinc-100'} ${selected===pieces.indexOf(piece)?'ring-4 ring-[#ffd700]':''}`}/>}</button>})}</div></div></div></div></main>
}
