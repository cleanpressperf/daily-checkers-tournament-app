"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
const SIZE=10;
type Cell=0|1|2|3|4;
type Move = { toR:number, toC:number, capR:number, capC:number, isCap:boolean };
function createBoard(): Cell[][]{
  const b: Cell[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));
  for(let r=0;r<4;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=1;
  for(let r=6;r<10;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=2;
  return b;
}
function getCaps(board:Cell[][], r:number,c:number, player:1|2){
  const caps:any[]=[]; const isKing=board[r][c]===3||board[r][c]===4;
  const enemy=player===1?[2,4]:[1,3]; const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]];
  for(const [dr,dc] of dirs){
    if(isKing){
      let mr=r+dr,mc=c+dc;
      while(mr>=0&&mr<SIZE&&mc>=0&&mc<SIZE){
        if(board[mr][mc]!==0){
          if(enemy.includes(board[mr][mc])){ let tr=mr+dr,tc=mc+dc;
            while(tr>=0&&tr<SIZE&&tc>=0&&tc<SIZE&&board[tr][tc]===0){ caps.push({toR:tr,toC:tc,capR:mr,capC:mc}); tr+=dr; tc+=dc; } }
          break;
        } mr+=dr; mc+=dc;
      }
    }else{
      const mr=r+dr,mc=c+dc,tr=r+dr*2,tc=c+dc*2;
      if(mr>=0&&mr<SIZE&&mc>=0&&mc<SIZE&&tr>=0&&tr<SIZE&&tc>=0&&tc<SIZE){
        if(enemy.includes(board[mr][mc]) && board[tr][tc]===0) caps.push({toR:tr,toC:tc,capR:mr,capC:mc});
      }
    }
  } return caps;
}
function getSimples(board:Cell[][], r:number,c:number, player:1|2){
  const moves:any[]=[]; const isKing=board[r][c]===3||board[r][c]===4;
  if(isKing){ const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]];
    for(const [dr,dc] of dirs){ let nr=r+dr,nc=c+dc; while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===0){ moves.push({toR:nr,toC:nc}); nr+=dr; nc+=dc; } }
  }else{ const dirs=player===1?[[1,1],[1,-1]]:[[-1,1],[-1,-1]];
    for(const [dr,dc] of dirs){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===0) moves.push({toR:nr,toC:nc}); }
  } return moves;
}
function countPieces(board:Cell[][], player:1|2){
  let cnt=0; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    if(player===1 && (board[r][c]===1||board[r][c]===3)) cnt++;
    if(player===2 && (board[r][c]===2||board[r][c]===4)) cnt++;
  } return cnt;
}
function hasAnyMove(board:Cell[][], player:1|2){
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    if((player===1&&(board[r][c]===1||board[r][c]===3))||(player===2&&(board[r][c]===2||board[r][c]===4))){
      if(getCaps(board,r,c,player).length>0) return true;
      if(getSimples(board,r,c,player).length>0) return true;
    }
  } return false;
}
function PlayInner(){
  const sp=useSearchParams(); const router=useRouter();
  const me=sp.get("me")||"Emani"; const vs=sp.get("vs")||"Isaiah Jesus";
  const tParam=(sp.get("t")||"bronze").toLowerCase(); const tierName=tParam.toUpperCase();
  const SAVE_KEY=`tourney_continuous_v5_${tierName}`;
  const paidKey=`paid_next_R32_${tParam}`;
  const [blocked,setBlocked]=useState(false);
  const [checking,setChecking]=useState(true);
  const [matchIdx,setMatchIdx]=useState<number>(-1);
  useEffect(()=>{
    async function check(){
      try{
        const res=await fetch(`/api/tourney?t=${tParam}`).then(r=>r.json());
        const j=await fetch(`/api/tourney`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tier:tParam,checkJoin:me})}).then(r=>r.json());
        const idx = res.bracket?.indexOf(me);
        if(idx>=0) setMatchIdx(Math.floor(idx/2));
        if(!j.allowed){
          const alreadyPaid=localStorage.getItem(paidKey);
          if(!alreadyPaid) localStorage.setItem(paidKey, JSON.stringify({time:Date.now()}));
          setBlocked(true);
          alert(`⛔ You didn't win previous round. Tournament is in ${res.status}. Coin saved for next Round of 32.`);
          setTimeout(()=>{ window.location.href=`/watch?t=${tParam}`; }, 1200);
          return;
        }
      }catch{}
      setChecking(false);
    }
    check();
  },[]);
  const [board,setBoard]=useState<Cell[][]>(createBoard());
  const [turn,setTurn]=useState<1|2>(2);
  const [sel,setSel]=useState<any>(null);
  const [moves,setMoves]=useState<Move[]>([]);
  const [timer,setTimer]=useState(30);
  const [status,setStatus]=useState("Your turn");
  const [won,setWon]=useState(false);
  const timerRef=useRef<any>(null);
  function pushLive(b:Cell[][], t:1|2, s:string, w?:string){
    try{
      localStorage.setItem(`live_match_${tParam}`, JSON.stringify({me,vs,board:b,turn:t,status:s,time:Date.now()}));
      fetch(`/api/live`,{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tier:tParam, me, vs, board:b, turn:t, status:s, winner:w||null, timer, matchIdx})}).then(async r=>{
        const j=await r.json();
        if(j.error==="PAIR_TAKEN"){
          alert(`⛔ Match ${matchIdx+1} already live by ${j.current}. Go to watch.`);
          window.location.href=`/watch?t=${tParam}`;
        }
      }).catch(()=>{});
    }catch{}
  }
  useEffect(()=>{ if(!blocked &&!checking) pushLive(board, turn, status); },[board,turn]);
  useEffect(()=>{
    if(blocked||checking) return;
    timerRef.current=setInterval(()=>{ setTimer(v=>{ if(v<=1){ if(!won){ alert("Time out! Disqualified."); window.location.href=`/watch?t=${tParam}`; } return 0; } return v-1; }); },1000);
    return ()=>clearInterval(timerRef.current);
  },[won,tParam,blocked,checking]);
  useEffect(()=>{
    if(won||blocked||checking) return;
    const botCount=countPieces(board,1); const humanCount=countPieces(board,2);
    if(botCount===0){ handleWin(); }
    else if(humanCount===0){ alert("You lost!"); window.location.href=`/watch?t=${tParam}`; }
    else if(turn===1 &&!hasAnyMove(board,1)){ handleWin(); }
    else if(turn===2 &&!hasAnyMove(board,2)){ alert("No moves! You lost."); window.location.href=`/watch?t=${tParam}`; }
  },[board,turn]);
  function handleWin(){
    setWon(true); clearInterval(timerRef.current);
    try{
      const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
      if(saved?.state){
        const st=saved.state;
        if(!st.roundWinners.includes(me)){
          st.roundWinners=[...st.roundWinners, me];
          if(st.roundWinners.length>=st.bracket.length/2 && st.roundIdx<4){
            st.bracket=[...st.roundWinners]; st.roundIdx+=1; st.matchInRound=0; st.roundWinners=[];
          }
          localStorage.setItem(SAVE_KEY, JSON.stringify({state:st, ticks:Math.floor(Date.now()/4000)}));
        }
      }
      localStorage.setItem(`qualified_${tParam}`, JSON.stringify({name:me, time:Date.now(), roundIdx:0}));
      fetch(`/api/tourney`,{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tier:tParam, winner:me})}).catch(()=>{});
      pushLive(board, turn, "WON", me);
    }catch{}
    setStatus("🏆 YOU WON! Proceeding...");
    setTimeout(()=>{ alert(`🏆 ${me} WINS!`); router.push(`/watch?t=${tParam}`); },1200);
  }
  function onSelect(r:number,c:number){
    if(won||blocked||turn!==2) return; const piece=board[r][c]; if(piece===2||piece===4){
      setSel({r,c}); const caps=getCaps(board,r,c,2); const simples=getSimples(board,r,c,2);
      let must=false; for(let rr=0;rr<SIZE;rr++) for(let cc=0;cc<SIZE;cc++) if(board[rr][cc]===2||board[rr][cc]===4) if(getCaps(board,rr,cc,2).length>0) must=true;
      if(must) setMoves(caps.map((m:any)=>({...m,isCap:true}))); else setMoves([...caps.map((m:any)=>({...m,isCap:true})),...simples.map((m:any)=>({toR:m.toR,toC:m.toC,capR:-1,capC:-1,isCap:false}))]);
    }
  }
  function onMove(toR:number,toC:number, capR:number,capC:number, isCap:boolean){
    if(!sel||won) return; const nb=board.map(r=>[...r]) as Cell[][]; nb[toR][toC]=nb[sel.r][sel.c]; nb[sel.r][sel.c]=0; if(isCap) nb[capR][capC]=0; if(nb[toR][toC]===2 && toR===0) nb[toR][toC]=4; setBoard(nb); setTimer(30);
    if(isCap){ const more=getCaps(nb,toR,toC,2); if(more.length>0){ setSel({r:toR,c:toC}); setMoves(more.map((m:any)=>({...m,isCap:true}))); setStatus("Continue capture!"); pushLive(nb,2,"Continue capture!"); return; } }
    setSel(null); setMoves([]); setTurn(1); pushLive(nb,1,"Bot thinking..."); setTimeout(()=>botMove(nb),800);
  }
  function botMove(cur:Cell[][]){
    let nb=cur.map(r=>[...r]) as Cell[][]; let allCaps:any[]=[]; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(nb[r][c]===1||nb[r][c]===3) getCaps(nb,r,c,1).forEach((m:any)=> allCaps.push({r,c,...m}));
    if(allCaps.length>0){ const ch=allCaps[Math.floor(Math.random()*allCaps.length)]; nb[ch.toR][ch.toC]=nb[ch.r][ch.c]; nb[ch.r][ch.c]=0; nb[ch.capR][ch.capC]=0; if(ch.toR===SIZE-1 && nb[ch.toR][ch.toC]===1) nb[ch.toR][ch.toC]=3; let cr=ch.toR,cc=ch.toC; while(true){ const more=getCaps(nb,cr,cc,1); if(!more.length) break; const m=more[0]; nb[m.toR][m.toC]=nb[cr][cc]; nb[cr][cc]=0; nb[m.capR][m.capC]=0; cr=m.toR; cc=m.toC; if(cr===SIZE-1 && nb[cr][cc]===1) nb[cr][cc]=3; } setBoard(nb); setTurn(2); pushLive(nb,2,"Your turn"); return; }
    let simples:any[]=[]; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(nb[r][c]===1||nb[r][c]===3) getSimples(nb,r,c,1).forEach((m:any)=> simples.push({r,c,...m}));
    if(simples.length>0){ const ch=simples[Math.floor(Math.random()*simples.length)]; nb[ch.toR][ch.toC]=nb[ch.r][ch.c]; nb[ch.r][ch.c]=0; if(ch.toR===SIZE-1 && nb[ch.toR][ch.toC]===1) nb[ch.toR][ch.toC]=3; setBoard(nb); setTurn(2); pushLive(nb,2,"Your turn"); } else { setBoard(nb); }
  }
  if(checking) return <div style={{background:"#000", minHeight:"100vh", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}}>Checking tournament...</div>;
  if(blocked) return <div style={{background:"#000", minHeight:"100vh", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:20}}>Tournament past your round. Taking you to watch...</div>;
  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", color:"#fff", padding:8}}>
      <div style={{maxWidth:420, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:800}}><span>{me} vs {vs} {matchIdx>=0?`(M${matchIdx+1})`:""}</span><span style={{color:timer<10?"#ff3b3b":"#22c55e"}}>{timer}s</span></div>
        <div style={{marginTop:6, fontSize:11, color:"#FFD700"}}>{status} • 🔴 LIVE</div>
        <div style={{marginTop:8, display:"grid", gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:0, border:"3px solid #FFD700", borderRadius:8, overflow:"hidden", aspectRatio:"1/1"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isBlack=(r+c)%2===1; const isSel=sel?.r===r && sel?.c===c; const mv=moves.find(m=>m.toR===r && m.toC===c);
            return <div key={`${r}-${c}`} onClick={()=>{ if(mv && sel) onMove(mv.toR,mv.toC,mv.capR,mv.capC,mv.isCap); else onSelect(r,c); }} style={{background:isSel?"#FFD700":isBlack?"#2a2a2a":"#e8e8e8", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", aspectRatio:"1/1"}}>
              {mv && <div style={{position:"absolute", width:mv.isCap?"14px":"8px", height:mv.isCap?"14px":"8px", borderRadius:"50%", background:mv.isCap?"#ff0000":"#22c55e"}}/>}
              {cell===1&&<div style={{width:"72%", height:"72%", borderRadius:"50%", background:"#000", border:"2px solid #fff"}}/>}
              {cell===3&&<div style={{width:"72%", height:"72%", borderRadius:"50%", background:"#000", border:"2px solid #FFD700", display:"flex", alignItems:"center", justifyContent:"center", color:"#FFD700", fontSize:10}}>♔</div>}
              {cell===2&&<div style={{width:"72%", height:"72%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000"}}/>}
              {cell===4&&<div style={{width:"72%", height:"72%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontSize:10}}>♔</div>}
            </div>;
          }))}
        </div>
        {won && <div style={{marginTop:10, background:"#22c55e", color:"#000", padding:12, borderRadius:8, textAlign:"center", fontWeight:800}}>🏆 PROCEEDING...</div>}
      </div>
    </div>
  );
}
export default function PlayPage(){ return <Suspense fallback={<div>Loading...</div>}><PlayInner/></Suspense>; }
