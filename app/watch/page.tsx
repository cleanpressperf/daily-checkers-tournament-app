"use client";
import { useEffect, useRef, useState } from "react";
const ALL_96=["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim Charles","Snoop Pearson","Bunk Moreland","Kima Greggs","Connie Corleone","Kay Adams","Apollonia Vitelli","Moe Greene","Hyman Roth","Cissy Saint","Kane Hamilton","Rob Volpe","Andre Wright","Walter White","Jesse Pinkman","Saul Goodman","Hank Schrader","Mike Ehrmantraut","Pablo Escobar","Javier Pena","Steve Murphy","Tommy Shelby Jr","John Watson","Sherlock Holmes","James Moriarty","Tony Soprano","Paulie Gualtieri","Silvio Dante","Christopher Moltisanti","Tony Montana","Manny Ribera","Nucky Thompson","Al Capone","Lucky Luciano","Bugsy Siegel","Meyer Lansky","Dutch Schultz","Arnold Rothstein","Frank Costello","Vito Genovese","Carlo Gambino","John Gotti","Sammy Gravano","Whitey Bulger","Ray Donovan","Mickey Donovan","Terry Donovan","Daryl Donovan","Bunchy Donovan","Sully Sullivan","James Donovan","Fitzgerald","Devereaux","Cousin Mickey","Zion"];
const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
type Piece=0|1|2|11|22;
const DIRS=[{r:-1,c:-1},{r:-1,c:1},{r:1,c:-1},{r:1,c:1}];
function newBoard():Piece[][]{const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]);for(let r=0;r<4;r++)for(let c=0;c<10;c++)if((r+c)%2===1)b[r][c]=1;for(let r=6;r<10;r++)for(let c=0;c<10;c++)if((r+c)%2===1)b[r][c]=2;return b;}
function inside(r:number,c:number){return r>=0&&r<10&&c>=0&&c<10;}
function isOpp(p:Piece,t:Piece){if(t===0)return false;return (p===1||p===11)!==(t===1||t===11);}
function clone(b:Piece[][]){return b.map(r=>[...r]);}
function findCaps(board:Piece[][],r:number,c:number,piece:Piece,vis:Set<string>):any[]{
  const res:any[]=[];const isKing=piece===11||piece===22;
  if(!isKing){for(let d of DIRS){const mr=r+d.r,mc=c+d.c,lr=r+d.r*2,lc=c+d.c*2;if(!inside(lr,lc)||!inside(mr,mc))continue;if(!isOpp(piece,board[mr][mc]))continue;if(board[lr][lc]!==0)continue;const key=`${mr},${mc}`;if(vis.has(key))continue;const nb=clone(board);nb[mr][mc]=0;nb[r][c]=0;nb[lr][lc]=piece;if(lr===9&&piece===1)nb[lr][lc]=11;if(lr===0&&piece===2)nb[lr][lc]=22;const nV=new Set(vis);nV.add(key);const fur=findCaps(nb,lr,lc,nb[lr][lc],nV);if(fur.length){fur.forEach((f:any)=>res.push({path:[{r,c},...f.path],caps:[{r:mr,c:mc},...f.caps],finalBoard:f.finalBoard}));}else{res.push({path:[{r,c},{r:lr,c:lc}],caps:[{r:mr,c:mc}],finalBoard:nb});}}}
  else{for(let d of DIRS){let rr=r+d.r,cc=c+d.c;while(inside(rr,cc)&&board[rr][cc]===0){rr+=d.r;cc+=d.c;}if(!inside(rr,cc))continue;if(!isOpp(piece,board[rr][cc]))continue;const key=`${rr},${cc}`;if(vis.has(key))continue;let lr=rr+d.r,lc=cc+d.c;while(inside(lr,lc)&&board[lr][lc]===0){const nb=clone(board);nb[rr][cc]=0;nb[r][c]=0;nb[lr][lc]=piece;const nV=new Set(vis);nV.add(key);const fur=findCaps(nb,lr,lc,piece,nV);if(fur.length){fur.forEach((f:any)=>res.push({path:[{r,c},{r:lr,c:lc},...f.path.slice(1)],caps:[{r:rr,c:cc},...f.caps],finalBoard:f.finalBoard}));}else{res.push({path:[{r,c},{r:lr,c:lc}],caps:[{r:rr,c:cc}],finalBoard:nb});}lr+=d.r;lc+=d.c;}}}
  return res;
}
function getMoves(board:Piece[][],turn:1|2){let allCaps:any[]=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const p=board[r][c];if(!p)continue;if((turn===1)!==(p===1||p===11))continue;const caps=findCaps(board,r,c,p,new Set());caps.forEach(x=>allCaps.push({...x}));}if(allCaps.length){const max=Math.max(...allCaps.map((x:any)=>x.caps.length));return{caps:allCaps.filter((x:any)=>x.caps.length===max),moves:[]};}const moves:any[]=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const p=board[r][c];if(!p)continue;if((turn===1)!==(p===1||p===11))continue;const isKing=p===11||p===22;if(!isKing){const dirs=p===1?[{r:1,c:-1},{r:1,c:1}]:[{r:-1,c:-1},{r:-1,c:1}];dirs.forEach(d=>{const nr=r+d.r,nc=c+d.c;if(inside(nr,nc)&&board[nr][nc]===0){const nb=clone(board);nb[r][c]=0;nb[nr][nc]=p;if(nr===9&&p===1)nb[nr][nc]=11;if(nr===0&&p===2)nb[nr][nc]=22;moves.push({board:nb});}});}else{DIRS.forEach(d=>{let nr=r+d.r,nc=c+d.c;while(inside(nr,nc)&&board[nr][nc]===0){const nb=clone(board);nb[r][c]=0;nb[nr][nc]=p;moves.push({board:nb});nr+=d.r;nc+=d.c;}});}}return{caps:[],moves};}
function mulberry32(a:number){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
function shuffleFisher(arr:string[], rng:any){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function simulateOne(s:any,RNG:any){
  if(s.chain){const cur=s.chain;if(!cur||cur.step>=cur.path.length-1){return{...s,board:cur.finalBoard,chain:null,turn:s.turn===1?2:1};}const nb=clone(s.board);const from=cur.path[cur.step];const to=cur.path[cur.step+1];const cap=cur.caps[cur.step];const piece=nb[from.r][from.c];nb[from.r][from.c]=0;if(cap)nb[cap.r][cap.c]=0;nb[to.r][to.c]=piece;if(to.r===9&&piece===1)nb[to.r][to.c]=11;if(to.r===0&&piece===2)nb[to.r][to.c]=22;return{...s,board:nb,chain:{...cur,step:cur.step+1}};}
  const {caps,moves}=getMoves(s.board,s.turn);let next:any={...s};
  if(caps.length===0&&moves.length===0){const winner=s.turn===1?s.p2:s.p1;const newWinners=[...s.roundWinners,winner];if(newWinners.length>=s.bracket.length/2){if(s.roundIdx===4&&newWinners.length===1){const sh=shuffleFisher(ALL_96,RNG);return{bracket:sh.slice(0,32),p1:sh[0],p2:sh[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],chain:null};}else{next.bracket=[...newWinners];next.roundIdx=s.roundIdx+1;next.matchInRound=0;next.roundWinners=[];next.p1=next.bracket[0];next.p2=next.bracket[1];next.board=newBoard();next.turn=1;return next;}}else{next.matchInRound=s.matchInRound+1;next.roundWinners=newWinners;next.p1=s.bracket[next.matchInRound*2];next.p2=s.bracket[next.matchInRound*2+1];next.board=newBoard();next.turn=1;}}
  else if(caps.length){const best=caps[Math.floor(RNG()*caps.length)];if(best.path.length>2){const from=best.path[0];const firstTo=best.path[1];const cap=best.caps[0];const nb=clone(s.board);const piece=nb[from.r][from.c];nb[from.r][from.c]=0;nb[cap.r][cap.c]=0;nb[firstTo.r][firstTo.c]=piece;if(firstTo.r===9&&piece===1)nb[firstTo.r][firstTo.c]=11;if(firstTo.r===0&&piece===2)nb[firstTo.r][firstTo.c]=22;next.board=nb;next.chain={path:best.path,caps:best.caps,finalBoard:best.finalBoard,step:1};}else{next.board=best.finalBoard;next.turn=s.turn===1?2:1;}}
  else{const chosen=moves[Math.floor(RNG()*Math.min(3,moves.length))];if(chosen) {next.board=chosen.board;next.turn=s.turn===1?2:1;}}
  return next;
}

export default function Watch(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [info,setInfo]=useState<any>(null);
  const stateRef=useRef<any>(null);
  const rngRef=useRef<any>(null);

  useEffect(()=>{
    const RNG=mulberry32(123456);
    rngRef.current=RNG;
    const sh=shuffleFisher(ALL_96,RNG);
    let st:any={bracket:sh.slice(0,32),p1:sh[0],p2:sh[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],chain:null};
    // GLOBAL SYNC: same move on all devices, max 400 moves, instant
    const globalMove = Math.floor(Date.now()/4000) % 400;

    for(let i=0;i<globalMove;i++) st=simulateOne(st,RNG);
    stateRef.current=st;

    const draw=(board:Piece[][])=>{
      const c=canvasRef.current; if(!c) return; const ctx=c.getContext("2d"); if(!ctx) return;
      const rect=c.getBoundingClientRect(); const dpr=window.devicePixelRatio||1;
      c.width=rect.width*dpr; c.height=rect.width*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      const size=rect.width; const sq=size/10;
      ctx.clearRect(0,0,size,size);
      for(let r=0;r<10;r++)for(let cc=0;cc<10;cc++){ctx.fillStyle=(r+cc)%2===0?"#f0d9b5":"#b58863";ctx.fillRect(cc*sq,r*sq,sq,sq);}
      for(let r=0;r<10;r++)for(let cc=0;cc<10;cc++){const p=board[r][cc]; if(!p) continue; const x=cc*sq+sq/2,y=r*sq+sq/2; ctx.beginPath(); ctx.arc(x,y,sq*0.38,0,Math.PI*2); ctx.fillStyle=(p===1||p===11)?"#111":"#c1272d"; ctx.fill(); ctx.lineWidth=(p===11||p===22)?3:1; ctx.strokeStyle=(p===11||p===22)?"gold":"#000"; ctx.stroke();}
    };

    const tick=()=>{
      draw(stateRef.current.board);
      setInfo({...stateRef.current,move:globalMove + Math.floor((Date.now()/1000)%4000)});
    };
    tick();
    const iv=setInterval(()=>{
      stateRef.current=simulateOne(stateRef.current,rngRef.current);
      tick();
    },4000);
    const onResize=()=>draw(stateRef.current.board);
    window.addEventListener("resize",onResize);
    return()=>{clearInterval(iv);window.removeEventListener("resize",onResize);};
  },[]);

  if(!info) return <div style={{background:"#000",color:"#fff",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading global...</div>;
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:12,display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:520}}>
      <div style={{color:"#ff3b3b",fontSize:12,fontWeight:700}}>◎ 24/7 LIVE GLOBAL · {ROUND_NAMES[info.roundIdx]} · G{info.matchInRound+1} · M{info.move%400}</div>
      <h2 style={{margin:"8px 0",fontSize:18}}>{info.p1} <span style={{color:"#666"}}>vs</span> {info.p2}</h2>
      <canvas ref={canvasRef} style={{width:"100%",aspectRatio:"1/1",background:"#3d2814",borderRadius:16,border:"4px solid #5a3e2b",display:"block"}} />
      <div style={{marginTop:8,fontSize:11,opacity:0.6}}>Same on all devices · Canvas · No more 7M moves bug</div>
    </div>
  </div>;
}
