"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
const SIZE=10;
type Cell=0|1|2|3|4;

function createBoard(): Cell[][]{
  const b: Cell[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));
  for(let r=0;r<4;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=1;
  for(let r=6;r<10;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=2;
  return b;
}

// Get captures - men can capture backward in international
function getCaps(board:Cell[][], r:number,c:number, player:1|2){
  const caps:{toR:number,toC:number,capR:number,capC:number}[]=[];
  const isKing=board[r][c]===3||board[r][c]===4;
  const enemy=player===1?[2,4]:[1,3];
  const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]]; // ALL dirs for capture, even for men

  for(const [dr,dc] of dirs){
    if(isKing){
      // king flying capture
      let mr=r+dr, mc=c+dc;
      while(mr>=0&&mr<SIZE&&mc>=0&&mc<SIZE){
        if(board[mr][mc]!==0){
          if(enemy.includes(board[mr][mc] as any)){
            // empty beyond
            let tr=mr+dr, tc=mc+dc;
            while(tr>=0&&tr<SIZE&&tc>=0&&tc<SIZE&&board[tr][tc]===0){
              caps.push({toR:tr,toC:tc,capR:mr,capC:mc});
              tr+=dr; tc+=dc; // king can land further
            }
          }
          break;
        }
        mr+=dr; mc+=dc;
      }
    }else{
      const mr=r+dr,mc=c+dc,tr=r+dr*2,tc=c+dc*2;
      if(mr>=0&&mr<SIZE&&mc>=0&&mc<SIZE&&tr>=0&&tr<SIZE&&tc>=0&&tc<SIZE){
        if(enemy.includes(board[mr][mc] as any) && board[tr][tc]===0){
          caps.push({toR:tr,toC:tc,capR:mr,capC:mc});
        }
      }
    }
  }
  return caps;
}
function getSimples(board:Cell[][], r:number,c:number, player:1|2){
  const moves:{toR:number,toC:number}[]=[];
  const isKing=board[r][c]===3||board[r][c]===4;
  if(isKing){
    const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]];
    for(const [dr,dc] of dirs){
      let nr=r+dr,nc=c+dc;
      while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===0){
        moves.push({toR:nr,toC:nc}); nr+=dr; nc+=dc;
      }
    }
  }else{
    const dirs=player===1?[[1,1],[1,-1]]:[[-1,1],[-1,-1]];
    for(const [dr,dc] of dirs){
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===0) moves.push({toR:nr,toC:nc});
    }
  }
  return moves;
}

function PlayInner(){
  const p=useSearchParams();
  const me=p.get("me")||"You"; const vs=p.get("vs")||"Bot";
  const [board,setBoard]=useState<Cell[][]>(createBoard());
  const [turn,setTurn]=useState<"bot"|"you">("bot");
  const [sel,setSel]=useState<{r:number,c:number,caps:any[],moves:any[]}|null>(null);
  const [timeLeft,setTimeLeft]=useState(8);
  const [warn,setWarn]=useState(false);
  const [mustCap,setMustCap]=useState<string[]>([]);
  const [chainPos,setChainPos]=useState<{r:number,c:number}|null>(null); // multi-capture chain

  const refreshMust=(b:Cell[][])=>{
    const caps:string[]=[];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(b[r][c]===2||b[r][c]===4){
      if(getCaps(b,r,c,2).length>0) caps.push(`${r}-${c}`);
    }
    setMustCap(caps);
  };
  useEffect(()=>{ if(!chainPos) refreshMust(board); },[board,chainPos]);

  useEffect(()=>{
    if(turn!=="you") return;
    const id=setInterval(()=>setTimeLeft(t=>{
      if(t<=1){ if(!warn){ setWarn(true); return 4; } else { alert("DQ - Time! Coin lost"); window.location.href="/"; return 0; } }
      return t-1;
    }),1000); return ()=>clearInterval(id);
  },[turn,warn]);

  // Bot with multi-capture
  useEffect(()=>{
    if(turn!=="bot") return;
    const tm=setTimeout(()=>{
      let nb=board.map(r=>[...r]) as Cell[][];
      const doBotMove=()=>{
        let allCaps:{r:number,c:number,toR:number,toC:number,capR:number,capC:number}[]=[];
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(nb[r][c]===1||nb[r][c]===3){
          getCaps(nb,r,c,1).forEach(m=> allCaps.push({r,c,...m}));
        }
        if(allCaps.length>0){
          const ch=allCaps[Math.floor(Math.random()*allCaps.length)];
          nb[ch.toR][ch.toC]=nb[ch.r][ch.c]>=3?3:1; nb[ch.r][ch.c]=0; nb[ch.capR][ch.capC]=0;
          if(ch.toR===SIZE-1 && nb[ch.toR][ch.toC]===1) nb[ch.toR][ch.toC]=3;
          // continue chain for same piece
          const more=getCaps(nb,ch.toR,ch.toC,1);
          if(more.length>0){ // continue capture
            nb=chainContinue(nb,ch.toR,ch.toC,1);
          }
        }else{
          let simples:{r:number,c:number,toR:number,toC:number}[]=[];
          for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(nb[r][c]===1||nb[r][c]===3){
            getSimples(nb,r,c,1).forEach(m=> simples.push({r,c,...m}));
          }
          if(simples.length>0){
            const ch=simples[Math.floor(Math.random()*simples.length)];
            nb[ch.toR][ch.toC]=nb[ch.r][ch.c]>=3?3:1; nb[ch.r][ch.c]=0;
            if(ch.toR===SIZE-1 && nb[ch.toR][ch.toC]===1) nb[ch.toR][ch.toC]=3;
          }
        }
      };
      const chainContinue=(b:Cell[][],r:number,c:number,player:1|2):Cell[][]=>{
        let curB=b; let curR=r,curC=c;
        while(true){
          const caps=getCaps(curB,curR,curC,player);
          if(caps.length===0) break;
          const ch=caps[0];
          curB[ch.toR][ch.toC]=curB[curR][curC]>=3?3:1; curB[curR][curC]=0; curB[ch.capR][ch.capC]=0;
          if(player===1&&ch.toR===SIZE-1&&curB[ch.toR][ch.toC]===1) curB[ch.toR][ch.toC]=3;
          if(player===2&&ch.toR===0&&curB[ch.toR][ch.toC]===2) curB[ch.toR][ch.toC]=4;
          curR=ch.toR; curC=ch.toC;
        }
        return curB;
      };
      doBotMove();
      setBoard(nb); setTurn("you"); setTimeLeft(8); setWarn(false);
    },900);
    return ()=>clearTimeout(tm);
  },[turn,board]);

  const clickCell=(r:number,c:number)=>{
    if(turn!=="you") return;
    const cell=board[r][c];
    // chain - must continue with same piece
    if(chainPos){
      if(r===chainPos.r&&c===chainPos.c) return;
      if(sel && board[r][c]===0){
        const valid=sel.caps.find(m=>m.toR===r&&m.toC===c);
        if(!valid) return;
        const nb=board.map(row=>[...row]) as Cell[][];
        nb[r][c]=nb[sel.r][sel.c]; nb[sel.r][sel.c]=0; nb[valid.capR][valid.capC]=0;
        if(r===0&&nb[r][c]===2) nb[r][c]=4;
        const more=getCaps(nb,r,c,2);
        if(more.length>0){
          setBoard(nb); setSel({r,c,caps:more,moves:[]}); setChainPos({r,c});
          alert(`Good capture! You have another capture - continue with same piece!`);
        }else{
          setBoard(nb); setSel(null); setChainPos(null); setTurn("bot"); setTimeLeft(8);
        }
      }
      return;
    }
    if(cell===2||cell===4){
      if(mustCap.length>0&&!mustCap.includes(`${r}-${c}`)){ alert("MUST capture! Yellow border piece only"); return; }
      const caps=getCaps(board,r,c,2); const simples=caps.length>0?[]:getSimples(board,r,c,2);
      setSel({r,c,caps,moves:simples});
      return;
    }
    if(sel && board[r][c]===0){
      const cap=sel.caps.find(m=>m.toR===r&&m.toC===c);
      const sim=sel.moves.find(m=>m.toR===r&&m.toC===c);
      if(!cap&&!sim) return;
      const nb=board.map(row=>[...row]) as Cell[][];
      nb[r][c]=nb[sel.r][sel.c]; nb[sel.r][sel.c]=0;
      if(cap){ nb[cap.capR][cap.capC]=0; if(r===0&&nb[r][c]===2) nb[r][c]=4;
        const more=getCaps(nb,r,c,2);
        if(more.length>0){ setBoard(nb); setSel({r,c,caps:more,moves:[]}); setChainPos({r,c}); return; }
      }else{
        if(r===0&&nb[r][c]===2) nb[r][c]=4;
      }
      setBoard(nb); setSel(null); setTurn("bot"); setTimeLeft(8);
    }
  };

  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", color:"#fff", padding:10}}>
      <div style={{maxWidth:440, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6}}><div>{me} vs {vs}</div><div style={{color:warn?"#ff0000":"#22c55e", fontWeight:800}}>{turn==="you"?`${timeLeft}s ${warn?"FINAL 4s":chainPos?"CAPTURE AGAIN!":""}`:"Bot..."}</div></div>
        {mustCap.length>0&&<div style={{background:"#FFD700", color:"#000", padding:5, borderRadius:6, fontSize:11, fontWeight:800, textAlign:"center", marginBottom:5}}>{chainPos?"MULTIPLE CAPTURE - Continue!":"BACKWARD CAPTURE ALLOWED - Must capture yellow"}</div>}
        <div style={{display:"grid", gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:1, background:"#222", border:"3px solid #FFD700", borderRadius:8, overflow:"hidden", aspectRatio:"1/1"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isBlack=(r+c)%2===1; const isSel=sel&&sel.r===r&&sel.c===c; const isCap=sel?.caps.some(m=>m.toR===r&&m.toC===c); const isMov=sel?.moves.some(m=>m.toR===r&&m.toC===c); const isMust=mustCap.includes(`${r}-${c}`);
            return (<div key={`${r}-${c}`} onClick={()=>clickCell(r,c)} style={{background:isSel?"#FFD700":isCap?"#ff0000":isMov?"#22c55e":isBlack?"#3a3a3a":"#e5e5e5", display:"flex", alignItems:"center", justifyContent:"center", aspectRatio:"1/1", border:isMust?"2px solid #FFD700":chainPos&&chainPos.r===r&&chainPos.c===c?"2px solid #ff0000":"none", position:"relative"}}>
              {cell===1&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#000", border:"2px solid #fff"}}></div>}
              {cell===3&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#000", border:"2px solid #FFD700", display:"flex", alignItems:"center", justifyContent:"center", color:"#FFD700", fontSize:10}}>♔</div>}
              {cell===2&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000"}}></div>}
              {cell===4&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontSize:10}}>♔</div>}
              {isCap&&<div style={{position:"absolute", width:14, height:14, background:"#ff0000", borderRadius:"50%"}}></div>}
              {isMov&&<div style={{position:"absolute", width:12, height:12, background:"#22c55e", borderRadius:"50%"}}></div>}
            </div>);
          }))}
        </div>
        <div style={{marginTop:6, fontSize:10, color:"#aaa", textAlign:"center"}}>RED dot = capture (backward allowed) • GREEN dot = simple move • Yellow border = must capture • Chain captures continue automatically</div>
      </div>
    </div>
  );
}
export default function PlayPage(){ return <Suspense fallback={<div style={{background:"#000", minHeight:"100vh"}}>Loading...</div>}><PlayInner/></Suspense> }
