"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const SIZE=10;
type Cell=0|1|2|3|4;
const BOTS = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill"];

function createBoard(): Cell[][]{
  const b: Cell[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));
  for(let r=0;r<4;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=1;
  for(let r=6;r<10;r++) for(let c=0;c<SIZE;c++) if((r+c)%2===1) b[r][c]=2;
  return b;
}

function getCaps(board:Cell[][], r:number,c:number, player:1|2){
  const caps:{toR:number,toC:number,capR:number,capC:number}[]=[];
  const isKing=board[r][c]===3||board[r][c]===4;
  const enemy=player===1?[2,4]:[1,3];
  const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]];
  for(const [dr,dc] of dirs){
    if(isKing){
      let mr=r+dr,mc=c+dc;
      while(mr>=0&&mr<SIZE&&mc>=0&&mc<SIZE){
        if(board[mr][mc]!==0){
          if(enemy.includes(board[mr][mc] as any)){
            let tr=mr+dr,tc=mc+dc;
            while(tr>=0&&tr<SIZE&&tc>=0&&tc<SIZE&&board[tr][tc]===0){
              caps.push({toR:tr,toC:tc,capR:mr,capC:mc});
              tr+=dr; tc+=dc;
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
      while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===0){ moves.push({toR:nr,toC:nc}); nr+=dr; nc+=dc; }
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

function WatchInner(){
  const p=useSearchParams();
  const tier=(p.get("t")||"bronze").toUpperCase();
  const [board,setBoard]=useState<Cell[][]>(createBoard());
  const [turn,setTurn]=useState<1|2>(1);
  const [p1,setP1]=useState(BOTS[0]);
  const [p2,setP2]=useState(BOTS[1]);
  const [round,setRound]=useState("R32");

  useEffect(()=>{
    setP1(BOTS[Math.floor(Math.random()*BOTS.length)]);
    setP2(BOTS[Math.floor(Math.random()*BOTS.length)]);
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>{
      setBoard(prev=>{
        const nb=prev.map(r=>[...r]) as Cell[][];
        const player=turn;
        let allCaps:{r:number,c:number,toR:number,toC:number,capR:number,capC:number}[]=[];
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if((player===1&&(nb[r][c]===1||nb[r][c]===3))||(player===2&&(nb[r][c]===2||nb[r][c]===4))){
          getCaps(nb,r,c,player).forEach(m=> allCaps.push({r,c,...m}));
        }
        if(allCaps.length>0){
          const ch=allCaps[Math.floor(Math.random()*allCaps.length)];
          nb[ch.toR][ch.toC]=nb[ch.r][ch.c]; nb[ch.r][ch.c]=0; nb[ch.capR][ch.capC]=0;
          if(player===1&&ch.toR===SIZE-1&&nb[ch.toR][ch.toC]===1) nb[ch.toR][ch.toC]=3;
          if(player===2&&ch.toR===0&&nb[ch.toR][ch.toC]===2) nb[ch.toR][ch.toC]=4;
          // chain multi-capture
          let curR=ch.toR,curC=ch.toC;
          while(true){
            const more=getCaps(nb,curR,curC,player);
            if(more.length===0) break;
            const m=more[0];
            nb[m.toR][m.toC]=nb[curR][curC]; nb[curR][curC]=0; nb[m.capR][m.capC]=0;
            curR=m.toR; curC=m.toC;
          }
        }else{
          let simples:{r:number,c:number,toR:number,toC:number}[]=[];
          for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if((player===1&&(nb[r][c]===1||nb[r][c]===3))||(player===2&&(nb[r][c]===2||nb[r][c]===4))){
            getSimples(nb,r,c,player).forEach(m=> simples.push({r,c,...m}));
          }
          if(simples.length>0){
            const ch=simples[Math.floor(Math.random()*simples.length)];
            nb[ch.toR][ch.toC]=nb[ch.r][ch.c]; nb[ch.r][ch.c]=0;
            if(player===1&&ch.toR===SIZE-1&&nb[ch.toR][ch.toC]===1) nb[ch.toR][ch.toC]=3;
            if(player===2&&ch.toR===0&&nb[ch.toR][ch.toC]===2) nb[ch.toR][ch.toC]=4;
          }else{
            // no moves, reset board for new match
            return createBoard();
          }
        }
        setTurn(player===1?2:1);
        return nb;
      });
    },800);
    return ()=>clearInterval(id);
  },[turn]);

  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", color:"#fff", padding:10}}>
      <div style={{maxWidth:440, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:800}}>
          <div>{tier} LIVE</div><div>{round}</div>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12}}>
          <div style={{background:"#000", padding:"6px 10px", borderRadius:8, border:"1px solid #fff"}}>{p1} (BLACK) {turn===1?"●":""}</div>
          <div style={{background:"#FFD700", color:"#000", padding:"6px 10px", borderRadius:8, fontWeight:800}}>{p2} (GOLD) {turn===2?"●":""}</div>
        </div>
        <div style={{marginTop:10, display:"grid", gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:1, background:"#222", border:"3px solid #FFD700", borderRadius:8, overflow:"hidden", aspectRatio:"1/1"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isBlack=(r+c)%2===1;
            return <div key={`${r}-${c}`} style={{background:isBlack?"#3a3a3a":"#e5e5e5", display:"flex", alignItems:"center", justifyContent:"center", aspectRatio:"1/1"}}>
              {cell===1&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#000", border:"2px solid #fff"}}></div>}
              {cell===3&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#000", border:"2px solid #FFD700", display:"flex", alignItems:"center", justifyContent:"center", color:"#FFD700", fontSize:10}}>♔</div>}
              {cell===2&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000"}}></div>}
              {cell===4&&<div style={{width:"70%", height:"70%", borderRadius:"50%", background:"#FFD700", border:"2px solid #000", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontSize:10}}>♔</div>}
            </div>;
          }))}
        </div>
        <div style={{marginTop:8, fontSize:10, color:"#aaa", textAlign:"center"}}>International 10x10 • Backward capture • Multi-capture • Flying kings • Bot vs Bot when no humans</div>
        <a href="/" style={{display:"block", marginTop:10, textAlign:"center", background:"#fff", color:"#000", padding:12, borderRadius:10, fontWeight:800, textDecoration:"none"}}>Join this {tier} Tournament →</a>
      </div>
    </div>
  );
}
export default function WatchPage(){ return <Suspense fallback={<div style={{background:"#000", minHeight:"100vh"}}>Loading live...</div>}><WatchInner/></Suspense> }
