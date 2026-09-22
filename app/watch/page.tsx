"use client";
import { useEffect, useState, useRef } from "react";

const PLAYERS = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Bunk","Kima","Connie Corleone","Kay Adams","Apollonia","Moe Greene","Hyman Roth","Cissy Saints","Kane Hamilton","Rob Volpe","Andre Wright"];
type Piece = 0|1|2|11|22;
type P={r:number,c:number};
const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
const DIRS=[{r:-1,c:-1},{r:-1,c:1},{r:1,c:-1},{r:1,c:1}];

function getRandom32(){return [...PLAYERS].sort(()=>0.5-Math.random()).slice(0,32);}
function newBoard():Piece[][]{const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]); for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1; for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2; return b;}
function inside(r:number,c:number){return r>=0&&r<10&&c>=0&&c<10;}
function isOpponent(p:Piece,t:Piece){ if(t===0) return false; const isP1=p===1||p===11; const isT1=t===1||t===11; return isP1!==isT1; }
function clone(b:Piece[][]){return b.map(r=>[...r]);}

// INTERNATIONAL CAPTURE SEQUENCES
function findCaptures(board:Piece[][], r:number,c:number, piece:Piece, visited:Set<string>): {path:P[], caps:P[], finalBoard:Piece[][]}[] {
  const results: any[] = [];
  const isKing = piece===11||piece===22;

  if(!isKing){
    // man captures backward too (international)
    for(let d of DIRS){
      const mr=r+d.r, mc=c+d.c, lr=r+d.r*2, lc=c+d.c*2;
      if(!inside(lr,lc)||!inside(mr,mc)) continue;
      if(!isOpponent(piece, board[mr][mc])) continue;
      if(board[lr][lc]!==0) continue;
      const key=`${mr},${mc}`; if(visited.has(key)) continue;
      const nb=clone(board); nb[mr][mc]=0; nb[r][c]=0; nb[lr][lc]=piece;
      if(lr===9&&piece===1) nb[lr][lc]=11; if(lr===0&&piece===2) nb[lr][lc]=22;
      const nVisited=new Set(visited); nVisited.add(key);
      const further=findCaptures(nb,lr,lc,nb[lr][lc],nVisited);
      if(further.length){ further.forEach(f=> results.push({path:[{r,c},...f.path], caps:[{r:mr,c:mc},...f.caps], finalBoard:f.finalBoard})); }
      else { results.push({path:[{r,c},{r:lr,c:lc}], caps:[{r:mr,c:mc}], finalBoard:nb}); }
    }
  } else {
    // flying king
    for(let d of DIRS){
      let rr=r+d.r, cc=c+d.c;
      while(inside(rr,cc) && board[rr][cc]===0){ rr+=d.r; cc+=d.c; }
      if(!inside(rr,cc)) continue;
      if(!isOpponent(piece, board[rr][cc])) continue;
      const cap={r:rr,c:cc}; const key=`${rr},${cc}`; if(visited.has(key)) continue;
      // landing squares beyond
      let lr=rr+d.r, lc=cc+d.c;
      while(inside(lr,lc) && board[lr][lc]===0){
        const nb=clone(board); nb[rr][cc]=0; nb[r][c]=0; nb[lr][lc]=piece;
        const nVisited=new Set(visited); nVisited.add(key);
        const further=findCaptures(nb,lr,lc,piece,nVisited);
        if(further.length){ further.forEach(f=> results.push({path:[{r,c},{r:lr,c:lc},...f.path.slice(1)], caps:[cap,...f.caps], finalBoard:f.finalBoard})); }
        else { results.push({path:[{r,c},{r:lr,c:lc}], caps:[cap], finalBoard:nb}); }
        lr+=d.r; lc+=d.c;
      }
    }
  }
  return results;
}

function getAllMoves(board:Piece[][], turn:1|2){
  let allCaps:any[]=[];
  for(let r=0;r<10;r++) for(let c=0;c<10;c++){ const p=board[r][c]; if(p===0) continue; const isP1=p===1||p===11; if((turn===1&&!isP1)||(turn===2&&isP1)) continue; const caps=findCaptures(board,r,c,p,new Set()); caps.forEach(cap=> allCaps.push({...cap,from:{r,c}})); }
  if(allCaps.length){
    const max=Math.max(...allCaps.map((x:any)=>x.caps.length));
    allCaps=allCaps.filter((x:any)=>x.caps.length===max); // international: longest capture mandatory
    return {caps:allCaps, moves:[]};
  }
  // simple moves
  const moves:any[]=[];
  for(let r=0;r<10;r++) for(let c=0;c<10;c++){ const p=board[r][c]; if(p===0) continue; const isP1=p===1||p===11; if((turn===1&&!isP1)||(turn===2&&isP1)) continue; const isKing=p===11||p===22;
    if(!isKing){ const dirs=p===1?[{r:1,c:-1},{r:1,c:1}]:[{r:-1,c:-1},{r:-1,c:1}]; dirs.forEach(d=>{ const nr=r+d.r,nc=c+d.c; if(inside(nr,nc)&&board[nr][nc]===0) moves.push({from:{r,c},to:{r:nr,c:nc},board:(()=>{const nb=clone(board); nb[r][c]=0; nb[nr][nc]=p; if(nr===9&&p===1) nb[nr][nc]=11; if(nr===0&&p===2) nb[nr][nc]=22; return nb;})()}); }); }
    else { DIRS.forEach(d=>{ let nr=r+d.r,nc=c+d.c; while(inside(nr,nc)&&board[nr][nc]===0){ const nb=clone(board); nb[r][c]=0; nb[nr][nc]=p; moves.push({from:{r,c},to:{r:nr,c:nc},board:nb}); nr+=d.r; nc+=d.c; } }); }
  }
  return {caps:[], moves};
}

export default function Watch(){
  const [s,setS]=useState<any>(null); const chainRef=useRef<any>(null); const timerRef=useRef<any>(null);

  useEffect(()=>{
    const init=async()=>{ let d=await fetch('/api/state').then(r=>r.json()).catch(()=>null); if(!d?.bracket?.length){ const b=getRandom32(); d={bracket:b,p1:b[0],p2:b[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],champion:null,time:Date.now(),chain:null}; await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}); } setS(d); };
    init(); const poll=setInterval(async()=>{ const d=await fetch('/api/state').then(r=>r.json()).catch(()=>null); if(d?.bracket?.length) setS(d); },1500); return()=>clearInterval(poll);
  },[]);

  // INTELLIGENT AUTO ENGINE: 4 sec move, 1 sec chain
  useEffect(()=>{
    if(!s||s.champion) return;
    if(s.chain){ // continue chain after 1 sec
      timerRef.current=setTimeout(async()=>{
        const cur=s.chain; if(!cur||cur.step>=cur.path.length-1){ const next={...s,board:cur.finalBoard,chain:null,time:Date.now()}; const remain=getAllMoves(cur.finalBoard, s.turn); if(remain.caps.length){ // still more captures from new pos - should not happen because we already found longest
        } else { next.turn=s.turn===1?2:1; } setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}); return; }
        const nb=clone(s.board); const from=cur.path[cur.step]; const to=cur.path[cur.step+1]; const cap=cur.caps[cur.step];
        // for man chain we already have intermediate boards but we animate step by step
        const piece=nb[from.r][from.c]; nb[from.r][from.c]=0; if(cap) nb[cap.r][cap.c]=0; nb[to.r][to.c]=piece; if(to.r===9&&piece===1) nb[to.r][to.c]=11; if(to.r===0&&piece===2) nb[to.r][to.c]=22;
        const next={...s,board:nb,chain:{...cur,step:cur.step+1},time:Date.now()}; setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});
      },1000); return()=>clearTimeout(timerRef.current);
    }
    // normal move every 4 sec
    timerRef.current=setTimeout(async()=>{
      const {caps,moves}=getAllMoves(s.board,s.turn);
      let next:any={...s};
      if(caps.length===0&&moves.length===0){ // no moves -> opponent wins
        const winner=s.turn===1? s.p2:s.p1; const newWinners=[...s.roundWinners,winner];
        if(newWinners.length>=s.bracket.length/2){ if(s.roundIdx===4&&newWinners.length===1){ next.champion=winner; } else { next.bracket=[...newWinners]; next.roundIdx=s.roundIdx+1; next.matchInRound=0; next.roundWinners=[]; next.p1=next.bracket[0]; next.p2=next.bracket[1]; next.board=newBoard(); } } else { next.matchInRound=s.matchInRound+1; next.roundWinners=newWinners; next.p1=s.bracket[next.matchInRound*2]; next.p2=s.bracket[next.matchInRound*2+1]; next.board=newBoard(); } next.turn=1;
      } else if(caps.length){
        // pick longest, if tie random -> intelligent
        const best=caps[Math.floor(Math.random()*caps.length)];
        if(best.path.length>2){ // chain capture
          const from=best.path[0]; const firstTo=best.path[1]; const cap=best.caps[0]; const nb=clone(s.board); const piece=nb[from.r][from.c]; nb[from.r][from.c]=0; nb[cap.r][cap.c]=0; nb[firstTo.r][firstTo.c]=piece; if(firstTo.r===9&&piece===1) nb[firstTo.r][firstTo.c]=11; if(firstTo.r===0&&piece===2) nb[firstTo.r][firstTo.c]=22;
          next.board=nb; next.chain={path:best.path,caps:best.caps,finalBoard:best.finalBoard,step:1}; // step 1 done
        } else { next.board=best.finalBoard; next.turn=s.turn===1?2:1; }
      } else {
        // intelligent non-capture: prefer center and advancement
        moves.sort((a,b)=>{ const ac=Math.abs(a.to.c-4.5), bc=Math.abs(b.to.c-4.5); return ac-bc; });
        const chosen=moves[0]; next.board=chosen.board; next.turn=s.turn===1?2:1;
      }
      next.time=Date.now(); setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});
    },4000);
    return()=>clearTimeout(timerRef.current);
  },[s]);

  if(!s) return <div style={{background:"#000",color:"#fff",padding:30}}>Loading International LIVE...</div>;
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:12}}>
    <div style={{color:"#ff3b3b",fontSize:11}}>◎ INTL LIVE · {ROUND_NAMES[s.roundIdx]||"FINISHED"} · Game {s.matchInRound+1}/{Math.ceil(s.bracket.length/2)} {s.chain?`· CHAIN x${s.chain.step}`:''} {s.champion?`· CHAMPION ${s.champion}`:''}</div>
    <h2 style={{margin:"8px 0",fontSize:18}}>{s.p1} <span style={{color:"#888"}}>VS</span> {s.p2} <span style={{fontSize:11,color:s.turn===1?"#fff":"#f44"}}> {s.turn===1?s.p1:s.p2} to move</span></h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",width:"100%",maxWidth:380,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden"}}>
      {s.board.map((row:Piece[],r:number)=>row.map((cell,c)=> <div key={r+"-"+c} style={{background:(r+c)%2===1?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>{cell!==0&&<div style={{width:"70%",height:"70%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#c00",border:cell===11||cell===22?"2px solid gold":"1px solid #000",display:"flex",alignItems:"center",justifyContent:"center",color:"gold",fontSize:10}}>{cell===11||cell===22?"♔":""}</div>}</div>))}
    </div>
    <div style={{fontSize:11,marginTop:8,opacity:0.7}}>Winners: {s.roundWinners.join(", ")||"—"} {s.chain?` | Capturing ${s.chain.caps.length} pieces`:""}</div>
    <div style={{fontSize:9,opacity:0.3,marginTop:4}}>International Rules: backward capture + flying king + longest chain mandatory · 4s move · 1s chain</div>
  </div>
}
