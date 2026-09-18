'use client'
import Link from 'next/link'
import { ArrowLeft, Bot, Check, CircleDollarSign, Crown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Nav } from '../_components/Nav'
import { applyMove, getLegalMoves, initialBoard, indexAt, playable, botMove, type Move, type Piece, type Side } from '../../lib/draughts'

const levels = ['Easy', 'Random legal moves', 'Medium', 'Capture priority', 'Hard', 'Longest capture chain'] as const
type Level = typeof levels[number]
const square = (r: number, c: number) => r * 10 + c

export default function PracticePage(){
  const [level,setLevel]=useState<Level>('Medium')
  const [started,setStarted]=useState(false)
  const [board,setBoard]=useState<Piece[]>(()=>initialBoard())
  const [selected,setSelected]=useState<number|null>(null)
  const [turn,setTurn]=useState<Side>('white')
  const [locked,setLocked]=useState<number|null>(null)
  const [status,setStatus]=useState('Select difficulty and start')

  const legal = useMemo(()=> getLegalMoves(board, turn), [board, turn])

  // FIX: Dark square is (r+c)%2==1 - International standard
  const isDark = (r:number,c:number)=> (r+c)%2===1
  const isPlayable = (r:number,c:number)=> isDark(r,c)

  const reset=()=>{
    setBoard(initialBoard()); setSelected(null); setLocked(null); setTurn('white'); setStarted(true); setStatus('Your turn - white to move - captures are compulsory')
  }
  const finishAndContinue=(next: Piece[], move: Move)=>{
    const row=Math.floor(move.to / 10), col=move.to % 10, pieceIndex=indexAt(next, row, col)
    const continuations = pieceIndex>=0? getLegalMoves(next, 'white').filter(m=> m.from===pieceIndex && m.captures.length>0) : []
    if(move.captures.length>0 && continuations.length>0){ setBoard(next); setSelected(move.to); setLocked(move.to); setStatus(`Continue capture! ${continuations.length} moves`)}
    else{ setBoard(next); setSelected(null); setLocked(null); setTurn('black'); setStatus('Black Bot thinking...')}
  }
  useEffect(()=>{
    if(!started || turn!=='black') return
    const timer=window.setTimeout(()=>{
      const move=botMove(board, level)
      if(!move){ setStatus('You win!'); return }
      const next=applyMove(board, move); setBoard(next); setTurn('white'); setStatus('Your turn - white to move - captures are compulsory')
    }, 700)
    return ()=> window.clearTimeout(timer)
  }, [started, turn, board, level])

  const handle=(to: number)=>{
    if(!started || turn!=='white') return
    const r=Math.floor(to/10), c=to%10
    if(!isDark(r,c)) return // BLOCK light squares
    const selectedIndex= selected!==null? indexAt(board, Math.floor(selected/10), selected % 10) : -1
    const move= selectedIndex>=0? getLegalMoves(board, 'white', selectedIndex).find((candidate)=> candidate.to===to) : undefined
    if(move){ finishAndContinue(applyMove(board, move), move); return }
    if((to>=0 && to<100) && board[indexAt(board, r, c)]?.side==='white' && (locked===null || locked===to)){ setSelected(to) } else if(locked===null){ setSelected(null) }
  }
  const destinations=useMemo(()=>{ if(selected===null) return new Set<number>(); const i=indexAt(board, Math.floor(selected/10), selected%10); return new Set(getLegalMoves(board, 'white', i).map(m=> m.to)) }, [board, selected])

  return <main className="min-h-screen bg-black text-white"><Nav/><div className="mx-auto max-w-7xl px-5 pb-24 pt-12 lg:px-6"><Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"><ArrowLeft className="h-4 w-4"/>Back home</Link><div className="grid grid-cols-12 grid-rows-12 gap-2 lg:gap-3 mt-4"><div className="col-span-12 lg:col-span-8"><div className="relative aspect-square w-full bg-[#F5DEB3] border-8 border-[#8B5A2B]"><div className="grid grid-cols-10 grid-rows-10 h-full w-full">{Array.from({length:100}).map((_,i)=>{ const r=Math.floor(i/10), c=i%10, dark=isDark(r,c), playable=isPlayable(r,c), index=indexAt(board, r, c), piece= index>=0? board[index] : null, isTarget=destinations.has(i), selectedHere= selected===square(r,c); return <div key={i} onClick={()=>{ if(playable) handle(square(r,c)) }} className={`relative flex items-center justify-center ${dark? 'bg-[#8B5A2B]': 'bg-[#F5DEB3]'} ${selectedHere? 'ring-4 ring-inset ring-[#FFD700]': ''} ${isTarget? 'ring-4 ring-inset ring-[#00FF00]': ''}`}><div className="absolute inset-0 flex items-center justify-center">{piece && (<span className={`relative flex h-[72%] w-[72%] items-center justify-center rounded-full border-2 ${piece.side==='white'? 'bg-white text-black border-zinc-400': 'bg-zinc-950 text-white border-zinc-950'} ${piece.king? 'ring-2 ring-yellow-400':''} shadow-lg`}>{piece.king? 'K':''}</span>)}</div>{isTarget &&!piece && <div className="h-4 w-4 rounded-full bg-green-500/70"></div>}</div>})}</div></div><p className="mt-3 text-center text-sm text-zinc-400">{status}</p></div><div className="col-span-12 lg:col-span-4"><div className="rounded-xl border border-white/10 bg-zinc-950 p-4"><h2 className="font-bold flex items-center gap-2"><Bot/>Practice vs Bot</h2><p className="text-xs text-zinc-400 mt-1">Official 10x10 International Draughts - No mandatory capture fix</p><div className="mt-4 flex gap-2"><div className="flex-1 rounded-lg border border-white/10 bg-black p-3 text-center"><CircleDollarSign className="mx-auto h-4 w-4 text-yellow-400"/><p className="text-[10px] text-zinc-400 mt-1">COINS TO PLAY</p><p className="font-bold text-sm">0</p></div><div className="flex-1 rounded-lg border border-white/10 bg-black p-3 text-center"><Crown className="mx-auto h-4 w-4 text-yellow-400"/><p className="text-[10px] text-zinc-400 mt-1">WINS</p><p className="font-bold text-sm">0</p></div></div><div className="mt-4"><p className="text-xs mb-1">Level: {level}</p><select value={level} onChange={e=>setLevel(e.target.value as Level)} className="w-full bg-black border border-white/10 rounded px-2 py-2 text-sm"><option>Easy</option><option>Random legal moves</option><option>Medium</option><option>Capture priority</option><option>Hard</option><option>Longest capture chain</option></select></div><button onClick={reset} className="mt-4 w-full bg-white text-black py-2 rounded font-bold">Start / Restart</button><p className="mt-4 text-[11px] text-green-400">✓ Fixed: Pieces only on dark squares (brown)</p><p className="text-[11px] text-zinc-500">✓ Light squares (cream) never have pieces</p></div></div></div></div></main>
}
