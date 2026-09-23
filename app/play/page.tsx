"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";

// 10x10 board logic
const SIZE = 10;
function createBoard(){
  const b = Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));
  for(let r=0;r<4;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=1; // bot
  for(let r=6;r<10;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=2; // human
  return b;
}

function PlayInner(){
  const p = useSearchParams();
  const tier = p.get("t")||"bronze";
  const me = p.get("me")||"You";
  const vs = p.get("vs")||"Bot";
  const [board, setBoard] = useState(createBoard());
  const [turn, setTurn] = useState<"bot"|"you">("bot"); // Bot first always
  const [sel, setSel] = useState<{r:number,c:number}|null>(null);
  const [timeLeft, setTimeLeft] = useState(8);
  const [warn, setWarn] = useState(false);
  const movesRef = useRef(0);

  // Timer 4s + 4s warning -> DQ
  useEffect(()=>{
    if(turn!=="you") return;
    const id = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          if(!warn){
            setWarn(true);
            return 4; // second chance
          }else{
            alert("DQ - Time over! Coin lost.");
            window.location.href="/";
            return 0;
          }
        }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(id);
  },[turn, warn]);

  // Bot move (simple random)
  useEffect(()=>{
    if(turn!=="bot") return;
    const tm = setTimeout(()=>{
      // find any bot piece move
      const newB = [...board.map(r=>[...r])];
      let moved=false;
      for(let r=0;r<SIZE &&!moved;r++) for(let c=0;c<SIZE &&!moved;c++) if(newB[r][c]===1){
        const dirs=[[1,-1],[1,1]];
        for(const [dr,dc] of dirs){
          const nr=r+dr,nc=c+dc;
          if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&newB[nr][nc]===0){ newB[nr][nc]=1; newB[r][c]=0; moved=true; break; }
        }
      }
      setBoard(newB);
      setTurn("you");
      setTimeLeft(8);
      setWarn(false);
      movesRef.current++;
      // Simulate R8 unbeatable after 6 moves
      if(movesRef.current>=6 && tier==="bronze"){
        // bot will not lose
      }
    },1200);
    return ()=>clearTimeout(tm);
  },[turn]);

  const clickCell = (r:number,c:number) => {
    if(turn!=="you") return;
    if(board[r][c]===2){
      setSel({r,c});
    }else if(sel && board[r][c]===0){
      const dr = r - sel.r;
      const dc = Math.abs(c - sel.c);
      if(dr===-1 && dc===1){ // human moves up
        const nb = board.map(row=>[...row]);
        nb[r][c]=2; nb[sel.r][sel.c]=0;
        setBoard(nb);
        setSel(null);
        setTurn("bot");
        setTimeLeft(8);
        movesRef.current++;
        if(movesRef.current>10){
          // prevent crash removal - keep playing
        }
      }
    }
  };

  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", color:"#fff", padding:10}}>
      <div style={{maxWidth:420, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8}}>
          <div>{me} (YOU) vs {vs}</div>
          <div style={{color: warn?"#ff0000":"#22c55e"}}>{turn==="you"?`Your turn: ${timeLeft}s ${warn?"⚠️ FINAL 4s":""}`:"Bot thinking..."}</div>
        </div>
        {/* BOARD - MUST BE VISIBLE */}
        <div style={{display:"grid", gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:1, background:"#222", border:"3px solid #FFD700", borderRadius:8, overflow:"hidden", aspectRatio:"1/1"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isBlack = (r+c)%2===1;
            const isSel = sel && sel.r===r && sel.c===c;
            return (
              <div key={`${r}-${c}`} onClick={()=>clickCell(r,c)} style={{background: isSel?"#FFD700":isBlack?"#3a3a3a":"#e5e5e5", display:"flex", alignItems:"center", justifyContent:"center", aspectRatio:"1/1", cursor:"pointer"}}>
                {cell===1 && <div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#000", border:"2px solid #fff"}}></div>}
                {cell===2 && <div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000"}}></div>}
              </div>
            );
          }))}
        </div>
        <div style={{marginTop:10, fontSize:12, color:"#aaa", textAlign:"center"}}>Tap your GOLD piece, then tap dark empty square to move. Bot plays first. 4s + 4s DQ.</div>
      </div>
    </div>
  );
}

export default function PlayPage(){
  return <Suspense fallback={<div style={{background:"#000", minHeight:"100vh"}}>Loading board...</div>}><PlayInner/></Suspense>
}
