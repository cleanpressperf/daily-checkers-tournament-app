'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Cell = null | {isBot: boolean, isKing: boolean}
type Difficulty = 'easy' | 'medium' | 'hard'
type Move = {from:[number,number], steps:{to:[number,number], cap:[number,number]|null}[], captures: [number,number][]}

function playWinSound(){ const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); [523,659,783,1046].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.value=f; g.gain.setValueAtTime(0.35,ctx.currentTime+i*0.2); g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+i*0.2+0.4); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime+i*0.2); o.stop(ctx.currentTime+i*0.2+0.5)}) }
function playLoseSound(){ const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(300,ctx.currentTime); o.frequency.linearRampToValueAtTime(50,ctx.currentTime+1.2); g.gain.setValueAtTime(0.4,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+1.2); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+1.2) }
function initBoard(): Cell[][] { const b:Cell[][]=Array(8).fill(null).map(()=>Array(8).fill(null)); for(let r=0;r<3;r++) for(let c=0;c<8;c++) if((r+c)%2===1) b[r][c]={isBot:true,isKing:false}; for(let r=5;r<8;r++) for(let c=0;c<8;c++) if((r+c)%2===1) b[r][c]={isBot:false,isKing:false}; return b }

function getCaptureSequences(r:number,c:number,b:Cell[][], visited=new Set<string>()): Move[] {
  const piece=b[r][c]; if(!piece) return []; const results:Move[]=[]; const dirs:[number,number][]=piece.isKing? [[1,1],[1,-1],[-1,1],[-1,-1]] : (piece.isBot? [[1,1],[1,-1]] : [[-1,1],[-1,-1]])
  for(const [dr,dc] of dirs){
    if(piece.isKing){
      let cr=r+dr, cc=c+dc, foundCap:[number,number]|null=null
      while(cr>=0&&cr<8&&cc>=0&&cc<8){
        if(b[cr][cc]){ if(b[cr][cc]!.isBot!==piece.isBot &&!foundCap &&!visited.has(`${cr},${cc}`)) foundCap=[cr,cc]; else break }
        else if(foundCap){ const nb=b.map(row=>row.map(p=>p?{...p}:null)); nb[cr][cc]=nb[r][c]; nb[r][c]=null; nb[foundCap[0]][foundCap[1]]=null; const further=getCaptureSequences(cr,cc,nb,new Set([...visited,`${foundCap[0]},${foundCap[1]}`])); if(further.length) further.forEach(f=>results.push({from:[r,c], steps:[{to:[cr,cc], cap:foundCap},...f.steps], captures:[foundCap!,...f.captures]})); else results.push({from:[r,c], steps:[{to:[cr,cc], cap:foundCap}], captures:[foundCap]}); }
        cr+=dr; cc+=dc
      }
    } else {
      const cr=r+dr, cc=c+dc, jr=r+dr*2, jc=c+dc*2
      if(jr>=0&&jr<8&&jc>=0&&jc<8&&!b[jr][jc]&&b[cr][cc]&&b[cr][cc]!.isBot!==piece.isBot&&!visited.has(`${cr},${cc}`)){ const nb=b.map(row=>row.map(p=>p?{...p}:null)); nb[jr][jc]=nb[r][c]; nb[r][c]=null; nb[cr][cc]=null; const further=getCaptureSequences(jr,jc,nb,new Set([...visited,`${cr},${cc}`])); if(further.length) further.forEach(f=>results.push({from:[r,c], steps:[{to:[jr,jc], cap:[cr,cc]},...f.steps], captures:[[cr,cc],...f.captures]})); else results.push({from:[r,c], steps:[{to:[jr,jc], cap:[cr,cc]}], captures:[[cr,cc]]}) }
    }
  }
  return results
}
function getNormalMoves(r:number,c:number,b:Cell[][]){ const piece=b[r][c]; if(!piece) return []; const moves:Move[]=[]; const dirs:[number,number][]=piece.isKing? [[1,1],[1,-1],[-1,1],[-1,-1]] : (piece.isBot? [[1,1],[1,-1]] : [[-1,1],[-1,-1]]); for(const [dr,dc] of dirs){ if(piece.isKing){ let cr=r+dr,cc=c+dc; while(cr>=0&&cr<8&&cc>=0&&cc<8&&!b[cr][cc]){ moves.push({from:[r,c], steps:[{to:[cr,cc], cap:null}], captures:[]}); cr+=dr; cc+=dc } } else { const nr=r+dr,nc=c+dc; if(nr>=0&&nr<8&&nc>=0&&nc<8&&!b[nr][nc]) moves.push({from:[r,c], steps:[{to:[nr,nc], cap:null}], captures:[]}) } } return moves }
function getAllLegalMoves(b:Cell[][], isBot:boolean){ let allCaps:Move[]=[]; for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]?.isBot===isBot) allCaps.push(...getCaptureSequences(r,c,b)); if(allCaps.length){ const maxLen=Math.max(...allCaps.map(m=>m.captures.length)); return allCaps.filter(m=>m.captures.length===maxLen) } let normals:Move[]=[]; for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]?.isBot===isBot) normals.push(...getNormalMoves(r,c,b)); return normals }
function applyMove(b:Cell[][], mv:Move){ const nb=b.map(row=>row.map(p=>p?{...p}:null)); const [fr,fc]=mv.from; const piece=nb[fr][fc]!; nb[fr][fc]=null; const last=mv.steps[mv.steps.length-1].to; nb[last[0]][last[1]]=piece; mv.captures.forEach(([cr,cc])=> nb[cr][cc]=null); if(last[0]===7&&piece.isBot) piece.isKing=true; if(last[0]===0&&!piece.isBot) piece.isKing=true; return nb }
function evaluate(b:Cell[][]){ let s=0; for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=b[r][c]; if(!p) continue; const v=p.isKing?1.8:1; s+= p.isBot? v : -v; s+= p.isBot? r*0.04 : -(7-r)*0.04 } return s }
function minimax(b:Cell[][], depth:number, isBotTurn:boolean, alpha:number, beta:number): {score:number, move:Move|null}{ const moves=getAllLegalMoves(b,isBotTurn); if(depth===0||moves.length===0) return {score:evaluate(b), move:null}; if(isBotTurn){ let best={score:-Infinity, move:null as Move|null}; for(const mv of moves){ const nb=applyMove(b,mv); const res=minimax(nb,depth-1,false,alpha,beta); if(res.score>best.score) best={score:res.score, move:mv}; alpha=Math.max(alpha,best.score); if(beta<=alpha) break } return best } else { let best={score:Infinity, move:null as Move|null}; for(const mv of moves){ const nb=applyMove(b,mv); const res=minimax(nb,depth-1,true,alpha,beta); if(res.score<best.score) best={score:res.score, move:mv}; beta=Math.min(beta,best.score); if(beta<=alpha) break } return best } }

export default function PracticePage(){
  const [difficulty,setDifficulty]=useState<Difficulty>('easy')
  const [board,setBoard]=useState<Cell[][]>(initBoard())
  const boardRef=useRef(board); boardRef.current=board
  const [selected,setSelected]=useState<[number,number]|null>(null)
  const [turn,setTurn]=useState<'player'|'bot'>('player')
  const [animating,setAnimating]=useState(false)
  const [animPiece,setAnimPiece]=useState<{from:[number,number], to:[number,number], piece:Cell}|null>(null)
  const [message,setMessage]=useState('Your turn - EASY')
  const [gameOver,setGameOver]=useState<null|'win'|'lose'>(null)
  const [legal,setLegal]=useState<Move[]>([])
  const botThinkingRef=useRef(false)

  useEffect(()=>{ if(turn==='player') setLegal(getAllLegalMoves(board,false)) },[board,turn])

  const checkWin=(b:Cell[][])=>{ const p=b.flat().filter(x=>x&&!x.isBot).length; const bot=b.flat().filter(x=>x&&x.isBot).length; if(bot===0){ setGameOver('win'); playWinSound(); setMessage('🎉 YOU WIN!'); return true } if(p===0){ setGameOver('lose'); playLoseSound(); setMessage('💀 BOT WINS'); return true } if(getAllLegalMoves(b,false).length===0){ setGameOver('lose'); playLoseSound(); setMessage('No moves - BOT WINS'); return true } if(getAllLegalMoves(b,true).length===0){ setGameOver('win'); playWinSound(); setMessage('Bot stuck - YOU WIN!'); return true } return false }

  const doBotMove=()=>{
    if(botThinkingRef.current) return
    botThinkingRef.current=true
    const b=boardRef.current
    const moves=getAllLegalMoves(b,true); if(!moves.length){ setGameOver('win'); playWinSound(); botThinkingRef.current=false; return }
    let choice:Move|null=null
    if(difficulty==='easy'){ const nonCaps=moves.filter(m=>m.captures.length===0); if(nonCaps.length&&Math.random()<0.5) choice=nonCaps[Math.floor(Math.random()*nonCaps.length)]; else choice=moves[Math.floor(Math.random()*moves.length)] }
    else if(difficulty==='medium'){ const res=minimax(b,2,true,-Infinity,Infinity); choice=res.move||moves[0]; if(Math.random()<0.2) choice=moves[Math.floor(Math.random()*moves.length)] }
    else { const res=minimax(b,5,true,-Infinity,Infinity); choice=res.move||moves[0] }
    if(!choice){ botThinkingRef.current=false; return }
    let idx=0; let curBoard=b.map(r=>r.map(p=>p?{...p}:null))
    const step=()=>{ if(idx>=choice!.steps.length){ setBoard(curBoard); boardRef.current=curBoard; setAnimating(false); setAnimPiece(null); botThinkingRef.current=false; if(!checkWin(curBoard)){ setTurn('player'); setMessage(`Your turn - ${difficulty.toUpperCase()}`) } return }
      const st=choice!.steps[idx]; const from= idx===0? choice!.from : choice!.steps[idx-1].to
      setAnimPiece({from, to:st.to, piece:curBoard[from[0]][from[1]] || b[from[0]][from[1]]}); setAnimating(true)
      setTimeout(()=>{ curBoard=applyMove(curBoard,{from, steps:[st], captures: st.cap? [st.cap] : []} as Move); setBoard(curBoard); boardRef.current=curBoard; setAnimPiece(null); idx++; setTimeout(step,200) },350)
    }
    step()
  }

  const handleClick=(r:number,c:number)=>{
    if(turn!=='player'||gameOver||animating||botThinkingRef.current) return
    if(selected){
      const [sr,sc]=selected
      const valid=legal.filter(m=>m.from[0]===sr&&m.from[1]===sc&&m.steps[0].to[0]===r&&m.steps[0].to[1]===c)
      if(valid.length){
        const mv=valid.sort((a,b)=>b.captures.length-a.captures.length)[0]
        let cur=board.map(row=>row.map(p=>p?{...p}:null)); let idx=0
        const stepPlayer=()=>{
          if(idx>=mv.steps.length){ setBoard(cur); boardRef.current=cur; setSelected(null); if(!checkWin(cur)){ setTurn('bot'); setMessage(`${difficulty.toUpperCase()} thinking... 2s`); setTimeout(()=>doBotMove(),2000) } return }
          const from= idx===0? mv.from : mv.steps[idx-1].to; const st=mv.steps[idx]
          setAnimPiece({from, to:st.to, piece:cur[from[0]][from[1]]!}); setAnimating(true)
          setTimeout(()=>{ cur=applyMove(cur,{from, steps:[st], captures: st.cap? [st.cap]: []} as Move); setBoard(cur); boardRef.current=cur; setAnimPiece(null); setAnimating(false); idx++; setTimeout(stepPlayer,200) },350)
        }
        stepPlayer()
      } else { if(board[r][c]&&!board[r][c]!.isBot) setSelected([r,c]); else setSelected(null) }
    } else { if(board[r][c]&&!board[r][c]!.isBot) setSelected([r,c]) }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-5 py-4"><Link href="/tournaments" className="font-bold">← Back</Link><h1 className="font-bold text-sm">PRACTICE - FIXED</h1><div className="w-12"/></header>
      <div className="mx-auto max-w-md px-4 pb-24">
        <div className="flex gap-2 rounded-2xl bg-zinc-900 p-2">{(['easy','medium','hard'] as Difficulty[]).map(d=><button key={d} onClick={()=>{setDifficulty(d); const nb=initBoard(); setBoard(nb); boardRef.current=nb; setGameOver(null); setTurn('player'); setSelected(null); botThinkingRef.current=false; setMessage(`Your turn - ${d.toUpperCase()}`)}} className={`flex-1 rounded-xl py-3 text-[12px] font-bold uppercase ${difficulty===d?'bg-[#ffd700] text-black':'bg-white/10 text-white'}`}>{d}</button>)}</div>
        <p className="mt-3 text-center text-[12px] font-bold tracking-widest text-[#ffd700]">{message}</p>
        <div className="relative mt-3 grid grid-cols-8 overflow-hidden rounded-xl border-2 border-white/20">
          {board.map((row,r)=> row.map((cell,c)=>{ const isDark=(r+c)%2===1; const isSel=selected&&selected[0]===r&&selected[1]===c; const isHint=legal.some(m=>selected&&m.from[0]===selected[0]&&m.from[1]===selected[1]&&m.steps[0].to[0]===r&&m.steps[0].to[1]===c); return (<div key={`${r}-${c}`} onClick={()=>handleClick(r,c)} className={`relative flex aspect-square items-center justify-center ${isDark?'bg-[#7a4a2e]':'bg-[#e9d5b5]'} ${isSel?'!bg-yellow-400':''} ${isHint?'!bg-green-400/70':''}`}>{cell &&!(animPiece&&animPiece.from[0]===r&&animPiece.from[1]===c)&&(<div className={`grid size-[76%] place-items-center rounded-full border-2 text-[10px] font-black shadow ${cell.isBot?'bg-black border-white/30 text-white':'bg-[#ffd700] border-black text-black'} ${cell.isKing?'ring-2 ring-white':''}`}>{cell.isKing?'K':''}</div>)}{isHint&&!cell&&<div className="size-3 animate-pulse rounded-full bg-green-600"/>}</div>) }))}
          {animPiece && (<div className="pointer-events-none absolute inset-0"><div className="absolute transition-all duration-[350ms] ease-in-out" style={{ left:`${(animPiece.from[1]*12.5)}%`, top:`${(animPiece.from[0]*12.5)}%`, width:'12.5%', height:'12.5%', transform:`translate(${(animPiece.to[1]-animPiece.from[1])*100}%,${(animPiece.to[0]-animPiece.from[0])*100}%)`}}><div className={`m-[12%] grid size-[76%] place-items-center rounded-full border-2 text-[10px] font-black shadow ${animPiece.piece?.isBot?'bg-black border-white/30 text-white':'bg-[#ffd700] border-black text-black'} ${animPiece.piece?.isKing?'ring-2 ring-white':''}`}>{animPiece.piece?.isKing?'K':''}</div></div></div>)}
        </div>
        {gameOver && <button onClick={()=>{const nb=initBoard(); setBoard(nb); boardRef.current=nb; setGameOver(null); setTurn('player'); setSelected(null); botThinkingRef.current=false}} className="mt-4 w-full rounded-full bg-white py-3.5 font-bold text-black">Play Again</button>}
      </div>
    </main>
  )
}
