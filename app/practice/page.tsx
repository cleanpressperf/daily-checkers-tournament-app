'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { applyMove, getLegalMoves, initialBoard, indexAt, botMove, type Move, type Piece, type Side } from '../../lib/draughts'

const levels = ['Easy','Medium','Hard'] as const
type Level = typeof levels[number]

export default function PracticePage(){
  const [level,setLevel]=useState<Level>('Medium')
  const [started,setStarted]=useState(false)
  const [board,setBoard]=useState<Piece[]>(()=>initialBoard())
  const [selected,setSelected]=useState<number|null>(null)
  const [turn,setTurn]=useState<Side>('white')
  const [locked,setLocked]=useState<number|null>(null)
  const [status,setStatus]=useState('Select difficulty and start')

  const isDark = (r:number,c:number)=> (r+c)%2===1

  const reset=()=>{
    setBoard(initialBoard()); setSelected(null); setLocked(null); setTurn('white'); setStarted(true); setStatus('Your turn - white')
  }

  const finishAndContinue=(next: Piece[], move: Move)=>{
    const continuations = getLegalMoves(next, 'white').filter(m=> m.from!==undefined && m.captures.length>0 && indexAt(next, Math.floor(move.to/10), move.to%10) >=0)
    // check multi capture
    const row=Math.floor(move.to/10); const col=move.to%10
    const idx=indexAt(next,row,col)
    const more = idx>=0? getLegalMoves(next,'white', idx).filter(m=> m.captures.length>0) : []
    if(move.captures.length>0 && more.length>0){
      setBoard(next); setSelected(move.to); setLocked(move.to); setStatus('Continue capture!')
    }else{
      setBoard(next); setSelected(null); setLocked(null); setTurn('black'); setStatus('Bot thinking...')
    }
  }

      useEffect(()=>{
    if(!started || turn!=='black') return
    if(board.filter(p=>p.side==='white').length===0){ setStatus('You lost'); return }
    if(board.filter(p=>p.side==='black').length===0){ setStatus('You win!'); return }

    const startTime = Date.now()
    setStatus(`Bot thinking... (${level})`)

    const timer = setTimeout(()=>{
      const mv = botMove(board, level)
      const elapsed = Date.now() - startTime
      const minWait = 2000 // minimum 2 seconds
      const remaining = Math.max(0, minWait - elapsed)

      setTimeout(()=>{
        if(!mv || getLegalMoves(board,'black').length===0){ setStatus('You win! - black has no moves'); return }
        const nxt = applyMove(board, mv)
        setBoard(nxt)
        if(nxt.filter(p=>p.side==='white').length===0) setStatus('You lost')
        else { setTurn('white'); setStatus('Your turn') }
      }, remaining)

    }, 100)

    const maxTimer = setTimeout(()=>{
      if(turn==='black'){
        const mv = getLegalMoves(board,'black')[0]
        if(mv){ const nxt=applyMove(board,mv); setBoard(nxt); setTurn('white'); setStatus('Your turn') }
      }
    }, 29000)

    return ()=>{ clearTimeout(timer); clearTimeout(maxTimer) }
  },[started, turn, board, level])

  const handle=(to:number)=>{
    if(!started || turn!=='white') return
    const r=Math.floor(to/10), c=to%10
    if(!isDark(r,c)) return
    const selIdx = selected!==null? indexAt(board, Math.floor(selected/10), selected%10) : -1
    const moves = selIdx>=0? getLegalMoves(board,'white',selIdx) : []
    const mv = moves.find(m=> m.to===to)
    if(mv){ finishAndContinue(applyMove(board,mv), mv); return }
    const idx=indexAt(board,r,c)
    if(idx>=0 && board[idx].side==='white' && (locked===null || locked===to)){ setSelected(to) }
  }

  const dest=useMemo(()=>{
    if(selected===null) return new Set<number>()
    const i=indexAt(board, Math.floor(selected/10), selected%10)
    return new Set(getLegalMoves(board,'white',i).map(m=> m.to))
  },[board,selected])

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <Link href="/" className="text-sm text-zinc-300">← Back home</Link>
      <div className="mx-auto mt-4 max-w-5xl grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div className="aspect-square w-full bg-[#F5DEB3] border-8 border-[#8B5A2B] grid grid-cols-10 grid-rows-10">
            {Array.from({length:100}).map((_,i)=>{
              const r=Math.floor(i/10), c=i%10, dark=isDark(r,c)
              const sq=r*10+c, idx=indexAt(board,r,c), pc= idx>=0? board[idx]:null
              const isSel=selected===sq, isTar=dest.has(sq)
              return (
                <div key={i} onClick={()=> dark && handle(sq)} className={`relative flex items-center justify-center ${dark?'bg-[#8B5A2B]':'bg-[#F5DEB3]'} ${isSel?'ring-4 ring-inset ring-yellow-400':''} ${isTar?'ring-4 ring-inset ring-green-400':''}`}>
                  {pc && <span className={`flex h-[70%] w-[70%] items-center justify-center rounded-full border-2 ${pc.side==='white'?'bg-white text-black border-zinc-400':'bg-zinc-950 text-white'} ${pc.king?'ring-2 ring-yellow-400':''}`}>{pc.king?'K':''}</span>}
                  {isTar &&!pc && <div className="h-3 w-3 rounded-full bg-green-500/80"></div>}
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-center text-sm text-zinc-400">{status}</p>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <h2 className="font-bold">Practice vs Bot</h2>
            <p className="text-xs text-zinc-400 mt-1">Dark squares only - unallowed moves blocked</p>
            <select value={level} onChange={e=> setLevel(e.target.value as any)} className="mt-4 w-full bg-black border border-white/10 rounded p-2 text-sm">
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
            <button onClick={reset} className="mt-3 w-full bg-white text-black py-2 rounded font-bold">Start / Restart</button>
            <p className="mt-3 text-xs text-green-400">✓ Fixed: Only brown squares playable</p>
            <p className="text-xs text-zinc-500">✓ Light squares blocked</p>
          </div>
        </div>
      </div>
    </main>
  )
}
