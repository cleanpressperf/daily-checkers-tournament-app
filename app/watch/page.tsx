"use client";
import { useEffect, useState, useRef } from "react";
const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
const ALL_96=["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim Charles","Snoop Pearson","Bunk Moreland","Kima Greggs","Connie Corleone","Kay Adams","Apollonia Vitelli","Moe Greene","Hyman Roth","Cissy Saint","Kane Hamilton","Rob Volpe","Andre Wright","Walter White","Jesse Pinkman","Saul Goodman","Hank Schrader","Mike Ehrmantraut","Pablo Escobar","Javier Pena","Steve Murphy","Tommy Shelby Jr","John Watson","Sherlock Holmes","James Moriarty","Tony Soprano","Paulie Gualtieri","Silvio Dante","Christopher Moltisanti","Tony Montana","Manny Ribera","Nucky Thompson","Al Capone","Lucky Luciano","Bugsy Siegel","Meyer Lansky","Dutch Schultz","Arnold Rothstein","Frank Costello","Vito Genovese","Carlo Gambino","John Gotti","Sammy Gravano","Whitey Bulger","Ray Donovan","Mickey Donovan","Terry Donovan","Daryl Donovan","Bunchy Donovan","Sully Sullivan","James Donovan","Fitzgerald","Devereaux","Cousin Mickey","Zion"];
type Piece=0|1|2|11|22;
const DIRS=[{r:-1,c:-1},{r:-1,c:1},{r:1,c:-1},{r:1,c:1}];
function newBoard():Piece[][]{const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]);for(let r=0;r<4;r++)for(let c=0;c<10;c++)if((r+c)%2===1)b[r][c]=1;for(let r=6;r<10;r++)for(let c=0;c<10;c++)if((r+c)%2===1)b[r][c]=2;return b;}
function inside(r:number,c:number){return r>=0&&r<10&&c>=0&&c<10;}
function isOpponent(p:Piece,t:Piece){if(t===0)return false;const isP1=p===1||p===11;const isT1=t===1||t===11;return isP1!==isT1;}
function clone(b:Piece[][]){return b.map(r=>[...r]);}
function findCaptures(board:Piece[][],r:number,c:number,piece:Piece,visited:Set<string>):any[]{
  const results:any[]=[];const isKing=piece===11||piece===22;
  if(!isKing){for(let d of DIRS){const mr=r+d.r,mc=c+d.c,lr=r+d.r*2,lc=c+d.c*2;if(!inside(lr,lc)||!inside(mr,mc))continue;if(!isOpponent(piece,board[mr][mc]))continue;if(board[lr][lc]!==0)continue;const key=`${mr},${mc}`;if(visited.has(key))continue;const nb=clone(board);nb[mr][mc]=0;nb[r][c]=0;nb[lr][lc]=piece;if(lr===9&&piece===1)nb[lr][lc]=11;if(lr===0&&piece===2)nb[lr][lc]=22;const nV=new Set(visited);nV.add(key);const further=findCaptures(nb,lr,lc,nb[lr][lc],nV);if(further.length){further.forEach((f:any)=>results.push({path:[{r,c},...f.path],caps:[{r:mr,c:mc},...f.caps],finalBoard:f.finalBoard}));}else{results.push({path:[{r,c},{r:lr,c:lc}],caps:[{r:mr,c:mc}],finalBoard:nb});}}}
  else{for(let d of DIRS){let rr=r+d.r,cc=c+d.c;while(inside(rr,cc)&&board[rr][cc]===0){rr+=d.r;cc+=d.c;}if(!inside(rr,cc))continue;if(!isOpponent(piece,board[rr][cc]))continue;const cap={r:rr,c:cc};const key=`${rr},${cc}`;if(visited.has(key))continue;let lr=rr+d.r,lc=cc+d.c;while(inside(lr,lc)&&board[lr][lc]===0){const nb=clone(board);nb[rr][cc]=0;nb[r][c]=0;nb[lr][lc]=piece;const nV=new Set(visited);nV.add(key);const further=findCaptures(nb,lr,lc,piece,nV);if(further.length){further.forEach((f:any)=>results.push({path:[{r,c},{r:lr,c:lc},...f.path.slice(1)],caps:[cap,...f.caps],finalBoard:f.finalBoard}));}else{results.push({path:[{r,c},{r:lr,c:lc}],caps:[cap],finalBoard:nb});}lr+=d.r;lc+=d.c;}}}
  return results;
}
function getAllMoves(board:Piece[][],turn:1|2){let allCaps:any[]=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const p=board[r][c];if(p===0)continue;const isP1=p===1||p===11;if((turn===1&&!isP1)||(turn===2&&isP1))continue;const caps=findCaptures(board,r,c,p,new Set());caps.forEach(cap=>allCaps.push({...cap,from:{r,c}}));}if(allCaps.length){const max=Math.max(...allCaps.map((x:any)=>x.caps.length));allCaps=allCaps.filter((x:any)=>x.caps.length===max);return{caps:allCaps,moves:[]};}const moves:any[]=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const p=board[r][c];if(p===0)continue;const isP1=p===1||p===11;if((turn===1&&!isP1)||(turn===2&&isP1))continue;const isKing=p===11||p===22;if(!isKing){const dirs=p===1?[{r:1,c:-1},{r:1,c:1}]:[{r:-1,c:-1},{r:-1,c:1}];dirs.forEach(d=>{const nr=r+d.r,nc=c+d.c;if(inside(nr,nc)&&board[nr][nc]===0)moves.push({from:{r,c},to:{r:nr,c:nc},board:(()=>{const nb=clone(board);nb[r][c]=0;nb[nr][nc]=p;if(nr===9&&p===1)nb[nr][nc]=11;if(nr===0&&p===2)nb[nr][nc]=22;return nb;})()});});}else{DIRS.forEach(d=>{let nr=r+d.r,nc=c+d.c;while(inside(nr,nc)&&board[nr][nc]===0){const nb=clone(board);nb[r][c]=0;nb[nr][nc]=p;moves.push({from:{r,c},to:{r:nr,c:nc},board:nb});nr+=d.r;nc+=d.c;}});}}return{caps:[],moves};}
function mulberry32(a:number){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
function simulateOne(s:any,RNG:any){
  if(s.chain){const cur=s.chain;if(!cur||cur.step>=cur.path.length-1){const next={...s,board:cur.finalBoard,chain:null};next.turn=s.turn===1?2:1;return next;}const nb=clone(s.board);const from=cur.path[cur.step];const to=cur.path[cur.step+1];const cap=cur.caps[cur.step];const piece=nb[from.r][from.c];nb[from.r][from.c]=0;if(cap)nb[cap.r][cap.c]=0;nb[to.r][to.c]=piece;if(to.r===9&&piece===1)nb[to.r][to.c]=11;if(to.r===0&&piece===2)nb[to.r][to.c]=22;return{...s,board:nb,chain:{...cur,step:cur.step+1}};}
  const {caps,moves}=getAllMoves(s.board,s.turn);let next:any={...s};
  if(caps.length===0&&moves.length===0){const matchWinner=s.turn===1?s.p2:s.p1;const newWinners=[...s.roundWinners,matchWinner];if(newWinners.length>=s.bracket.length/2){if(s.roundIdx===4&&newWinners.length===1){const shuffled=[...ALL_96].sort(()=>RNG()-0.5);return{bracket:shuffled.slice(0,32),p1:shuffled[0],p2:shuffled[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],champion:null,chain:null};}else{next.bracket=[...newWinners];next.roundIdx=s.roundIdx+1;next.matchInRound=0;next.roundWinners=[];next.p1=next.bracket[0];next.p2=next.bracket[1];next.board=newBoard();next.turn=1;return next;}}else{next.matchInRound=s.matchInRound+1;next.roundWinners=newWinners;next.p1=s.bracket[next.matchInRound*2];next.p2=s.bracket[next.matchInRound*2+1];next.board=newBoard();next.turn=1;}}
  else if(caps.length){const best=caps[Math.floor(RNG()*caps.length)];if(best.path.length>2){const from=best.path[0];const firstTo=best.path[1];const cap=best.caps[0];const nb=clone(s.board);const piece=nb[from.r][from.c];nb[from.r][from.c]=0;nb[cap.r][cap.c]=0;nb[firstTo.r][firstTo.c]=piece;if(firstTo.r===9&&piece===1)nb[firstTo.r][firstTo.c]=11;if(firstTo.r===0&&piece===2)nb[firstTo.r][firstTo.c]=22;next.board=nb;next.chain={path:best.path,caps:best.caps,finalBoard:best.finalBoard,step:1};}else{next.board=best.finalBoard;next.turn=s.turn===1?2:1;}}
  else{const chosen=moves[Math.floor(RNG()*Math.min(3,moves.length))];next.board=chosen.board;next.turn=s.turn===1?2:1;}
  return next;
}
function playSound(t:'move'|'capture'){try{const c=new(window.AudioContext||(window as any).webkitAudioContext)();const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);if(t==='move'){o.frequency.value=500;g.gain.value=0.2;o.start();o.stop(c.currentTime+0.12);}else{o.frequency.value=200;g.gain.value=0.3;o.start();o.frequency.exponentialRampToValueAtTime(900,c.currentTime+0.25);o.stop(c.currentTime+0.3);}}catch{}}

export default function Watch(){
  const [s,setS]=useState<any>(null);
  const stateRef=useRef<any>(null);
  const rngRef=useRef<any>(null);
  const moveRef=useRef(0);
  const startRef=useRef(1758537600000);
  useEffect(()=>{
    let iv:any;
    const init=async()=>{
      try{
        const info=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
        startRef.current=info.start||1758537600000;
        rngRef.current=mulberry32(123456);
        const first32=info.bracket||ALL_96.slice(0,32);
        let state:any={bracket:first32,p1:first32[0],p2:first32[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],champion:null,chain:null};
        const target=Math.floor((Date.now()-startRef.current)/4000);
        for(let i=0;i<target;i++){state=simulateOne(state,rngRef.current); if(i>12000) break;}
        stateRef.current=state; moveRef.current=target; setS({...state,move:target});
        iv=setInterval(()=>{
          const target2=Math.floor((Date.now()-startRef.current)/4000);
          while(moveRef.current<target2){const before=JSON.stringify(stateRef.current.board);stateRef.current=simulateOne(stateRef.current,rngRef.current);moveRef.current++;const after=JSON.stringify(stateRef.current.board);if(before!==after)playSound(before.length!==after.length?'capture':'move');}
          setS({...stateRef.current,move:moveRef.current});
        },1000);
      }catch(e){ console.error(e); setS({bracket:ALL_96.slice(0,32),p1:ALL_96[0],p2:ALL_96[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],move:0}); }
    };
    init();
    const en=()=>{try{new(window.AudioContext||(window as any).webkitAudioContext)().resume();}catch{} document.removeEventListener('click',en);};
    document.addEventListener('click',en);
    return()=>{clearInterval(iv);document.removeEventListener('click',en);};
  },[]);
  if(!s) return <div style={{background:"#000",color:"#fff",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading 24/7 LIVE...</div>;
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:10,display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:560}}>
      <div style={{color:"#ff3b3b",fontSize:12,fontWeight:700}}>◎ 24/7 LIVE · {ROUND_NAMES[s.roundIdx]} · Move {s.move}</div>
      <h2 style={{margin:"10px 0 12px",fontSize:20}}>{s.p1} <span style={{color:"#777"}}>vs</span> {s.p2}<br/><span style={{fontSize:12,color:s.turn===1?"#fff":"#ff5555"}}>{s.turn===1?s.p1:s.p2} to move • tap for 🔊</span></h2>
      <div style={{width:"100%",aspectRatio:"1/1",background:"#3d2814",border:"4px solid #5a3e2b",borderRadius:16,overflow:"hidden",display:"grid",gridTemplateColumns:"repeat(10,1fr)",gridTemplateRows:"repeat(10,1fr)"}}>
        {s.board.map((row:any,r:number)=>row.map((cell:any,c:number)=>{const isLight=(r+c)%2===0;return <div key={r+"-"+c} style={{background:isLight?"#f0d9b5":"#b58863",display:"flex",alignItems:"center",justifyContent:"center"}}>{cell!==0&&<div style={{width:"82%",height:"82%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#cc2222",border:cell===11||cell===22?"3px solid gold":"1px solid #000",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,color:"gold"}}>{cell===11||cell===22?"♔":""}</span></div>}</div>; }))}
      </div>
    </div>
  </div>;
}
