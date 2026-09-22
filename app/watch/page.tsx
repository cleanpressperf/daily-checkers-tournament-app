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
  if(s.finalCelebration){ const elapsed=Math.floor((Date.now()-s.finalTime)/1000); if(elapsed>=300){ const sh2=shuffleFisher(ALL_96,RNG); return {bracket:sh2.slice(0,32),p1:sh2[0],p2:sh2[1],board:newBoard(),turn:RNG()>0.5?1:2,roundIdx:0,matchInRound:0,roundWinners:[],chain:null,finalCelebration:false, lastWinner:null, nextRoundLabel:null}; } return s; }
  if(s.chain){const cur=s.chain;if(!cur||cur.step>=cur.path.length-1){return{...s,board:cur.finalBoard,chain:null,turn:s.turn===1?2:1};}const nb=clone(s.board);const from=cur.path[cur.step];const to=cur.path[cur.step+1];const cap=cur.caps[cur.step];const piece=nb[from.r][from.c];nb[from.r][from.c]=0;if(cap)nb[cap.r][cap.c]=0;nb[to.r][to.c]=piece;if(to.r===9&&piece===1)nb[to.r][to.c]=11;if(to.r===0&&piece===2)nb[to.r][to.c]=22;return{...s,board:nb,chain:{...cur,step:cur.step+1}};}
  const {caps,moves}=getMoves(s.board,s.turn);let next:any={...s, lastWinner:null, nextRoundLabel:null};
  if(caps.length===0&&moves.length===0){
    const winner=s.turn===1?s.p2:s.p1; next.lastWinner=winner;
    const newWinners=[...s.roundWinners,winner];
    if(newWinners.length>=s.bracket.length/2){
      if(s.roundIdx===4 && newWinners.length===1){ return {...s, bracket:[], p1:winner, p2:"", board:newBoard(), roundIdx:4, matchInRound:0, roundWinners:[winner], lastWinner:winner, nextRoundLabel:"TOURNAMENT CHAMPION", finalCelebration:true, finalWinner:winner, finalTime:Date.now()}; }
      else{ const proceedingTo = ROUND_NAMES[s.roundIdx+1] || "FINAL"; next.bracket=[...newWinners]; next.roundIdx=s.roundIdx+1; next.matchInRound=0; next.roundWinners=[]; next.p1=next.bracket[0]; next.p2=next.bracket[1]; next.board=newBoard(); next.turn=(RNG()>0.5?1:2) as 1|2; next.nextRoundLabel=proceedingTo; return next; }
    }else{ const proceedingTo = ROUND_NAMES[s.roundIdx+1] || "FINAL"; next.matchInRound=s.matchInRound+1; next.roundWinners=newWinners; next.p1=s.bracket[next.matchInRound*2]; next.p2=s.bracket[next.matchInRound*2+1]; next.board=newBoard(); next.turn=(RNG()>0.5?1:2) as 1|2; next.nextRoundLabel=proceedingTo; }
  }
  else if(caps.length){const best=caps[Math.floor(RNG()*caps.length)];if(best.path.length>2){const from=best.path[0];const firstTo=best.path[1];const cap=best.caps[0];const nb=clone(s.board);const piece=nb[from.r][from.c];nb[from.r][from.c]=0;nb[cap.r][cap.c]=0;nb[firstTo.r][firstTo.c]=piece;if(firstTo.r===9&&piece===1)nb[firstTo.r][firstTo.c]=11;if(firstTo.r===0&&piece===2)nb[firstTo.r][firstTo.c]=22;next.board=nb;next.chain={path:best.path,caps:best.caps,finalBoard:best.finalBoard,step:1};}else{next.board=best.finalBoard;next.turn=s.turn===1?2:1;}}
  else{const chosen=moves[Math.floor(RNG()*moves.length)];if(chosen){next.board=chosen.board;next.turn=s.turn===1?2:1;}}
  return next;
}

export default function Watch(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [info,setInfo]=useState<any>(null);
  const stateRef=useRef<any>(null);
  const rngRef=useRef<any>(null);
  const audioRef=useRef<AudioContext|null>(null);
  const lastWinnerRef=useRef<string>("");

  useEffect(()=>{
    const RNG=mulberry32(123456); rngRef.current=RNG;
    const SAVE_KEY="tourney_continuous_v5";
    const nowTicks=Math.floor(Date.now()/4000);

    // LOAD SAVED + FAST-FORWARD MISSED TIME (fixes your 2-hour bug)
    let st:any=null;
    try{
      const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
      if(saved && saved.ticks){
        st=saved.state;
        const missed=Math.max(0, nowTicks - saved.ticks);
        // Fast-forward instantly - up to 5000 moves in <1 sec
        const toSim=Math.min(missed, 8000);
        for(let i=0;i<toSim;i++){ st=simulateOne(st,RNG); }
      }
    }catch{}

    if(!st){
      const sh=shuffleFisher(ALL_96,RNG);
      st={bracket:sh.slice(0,32),p1:sh[0],p2:sh[1],board:newBoard(),turn:RNG()>0.5?1:2,roundIdx:0,matchInRound:0,roundWinners:[],chain:null,finalCelebration:false};
      // Global sync for first ever load - 5.5 hours cycle, not 40 min
      const globalMove = nowTicks % 5000;
      for(let i=0;i<globalMove;i++) st=simulateOne(st,RNG);
    }
    stateRef.current=st;

    const speak=(text:string)=>{ try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.volume=1.0; u.rate=0.82; u.pitch=1.1; speechSynthesis.speak(u);}catch{} };
    const play=(type:'move'|'capture'|'win')=>{
      try{
        if(!audioRef.current) audioRef.current=new (window.AudioContext||(window as any).webkitAudioContext)();
        const ctx=audioRef.current; ctx.resume();
        const o=ctx.createOscillator(); const g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
        const now=ctx.currentTime;
        if(type==='move'){o.frequency.value=600; o.type='sine'; g.gain.setValueAtTime(0.8, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.8); o.start(now); o.stop(now+0.8);}
        else if(type==='capture'){o.frequency.value=180; o.type='triangle'; g.gain.setValueAtTime(1.0, now); o.frequency.exponentialRampToValueAtTime(1000, now+0.5); g.gain.exponentialRampToValueAtTime(0.001, now+1.0); o.start(now); o.stop(now+1.0);}
        else if(type==='win'){o.frequency.value=300; g.gain.setValueAtTime(1.0, now); o.frequency.linearRampToValueAtTime(800, now+0.8); g.gain.exponentialRampToValueAtTime(0.001, now+1.5); o.start(now); o.stop(now+1.5);}
      }catch{}
    };
    const draw=(board:Piece[][])=>{
      const c=canvasRef.current; if(!c) return; const ctx=c.getContext("2d"); if(!ctx) return;
      const rect=c.getBoundingClientRect(); const dpr=window.devicePixelRatio||1;
      c.width=rect.width*dpr; c.height=rect.width*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      const size=rect.width; const sq=size/10; ctx.clearRect(0,0,size,size);
      for(let r=0;r<10;r++)for(let cc=0;cc<10;cc++){ctx.fillStyle=(r+cc)%2===0?"#f0d9b5":"#b58863";ctx.fillRect(cc*sq,r*sq,sq,sq);}
      for(let r=0;r<10;r++)for(let cc=0;cc<10;cc++){const p=board[r][cc]; if(!p) continue; const x=cc*sq+sq/2,y=r*sq+sq/2; ctx.beginPath(); ctx.arc(x,y,sq*0.38,0,Math.PI*2); ctx.fillStyle=(p===1||p===11)?"#111":"#c1272d"; ctx.fill(); ctx.lineWidth=(p===11||p===22)?3:1; ctx.strokeStyle=(p===11||p===22)?"gold":"#000"; ctx.stroke();}
    };
    const tick=()=>{
      draw(stateRef.current.board); setInfo({...stateRef.current});
      const s=stateRef.current;
      if(s.lastWinner && s.lastWinner!==lastWinnerRef.current){
        lastWinnerRef.current=s.lastWinner;
        if(s.finalCelebration){ play('win'); speak(`Tournament champion! ${s.finalWinner}!`); }
        else{ play('win'); const to = s.nextRoundLabel || ROUND_NAMES[s.roundIdx+1] || "FINAL"; speak(`${s.lastWinner} wins! Proceeds to ${to}`); }
      } else { if(s.chain) play('capture'); else play('move'); }
      try{ localStorage.setItem(SAVE_KEY, JSON.stringify({state:stateRef.current, ticks:Math.floor(Date.now()/4000)})); }catch{}
    };
    tick();
    const iv=setInterval(()=>{ stateRef.current=simulateOne(stateRef.current,rngRef.current); tick(); },4000);
    const enableAudio=()=>{ try{ if(!audioRef.current) audioRef.current=new (window.AudioContext||(window as any).webkitAudioContext)(); audioRef.current.resume(); }catch{} };
    document.addEventListener('click',enableAudio); document.addEventListener('touchstart',enableAudio);
    return()=>{clearInterval(iv); document.removeEventListener('click',enableAudio); document.removeEventListener('touchstart',enableAudio);};
  },[]);

  if(!info) return <div style={{background:"#000",color:"#fff",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading continuous tournament...</div>;
  if(info.finalCelebration){
    const elapsed=Math.floor((Date.now()-info.finalTime)/1000); const remaining=Math.max(0,300-elapsed); const m=Math.floor(remaining/60); const s=remaining%60;
    return <div style={{background:"#000",color:"#fff",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,textAlign:"center"}}>
      <div style={{color:"#ff3b3b"}}>◎ TOURNAMENT FINISHED</div>
      <h1 style={{fontSize:42,margin:"20px 0"}}>🏆 {info.finalWinner} 🏆</h1>
      <div>CHAMPION — New in {m}:{s.toString().padStart(2,'0')}</div>
      <canvas ref={canvasRef} style={{width:300,height:300,borderRadius:16,opacity:0.2,marginTop:20}} />
      <div style={{marginTop:20,fontSize:11,opacity:0.5}}>24/7 continuous — even when you close the tab</div>
    </div>;
  }
  const currentRound = ROUND_NAMES[info.roundIdx] || "FINAL";
  const nextRound = info.nextRoundLabel || ROUND_NAMES[info.roundIdx+1] || "FINAL";
  const blackPlayer = info.p1; const redPlayer = info.p2; const turnName = info.turn===1? blackPlayer : redPlayer;
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:10,display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:560}}>
      <div style={{color:"#ff3b3b",fontSize:12,fontWeight:700}}>◎ LIVE 24/7 CONTINUOUS · {currentRound} · Tap once for 🔊 fade sound</div>
      <h2 style={{margin:"8px 0 4px",fontSize:16}}>{blackPlayer} <span style={{background:"#111",color:"#fff",padding:"2px 6px",borderRadius:4,fontSize:10}}>BLACK</span> vs {redPlayer} <span style={{background:"#c1272d",color:"#fff",padding:"2px 6px",borderRadius:4,fontSize:10}}>RED</span></h2>
      <div style={{fontSize:11,opacity:0.7,marginBottom:6}}>Turn: {turnName} — {info.turn===1?'Black pieces':'Red pieces'} · Continuous even when closed</div>
      <canvas ref={canvasRef} style={{width:"100%",aspectRatio:"1/1",background:"#3d2814",borderRadius:16,border:"4px solid #5a3e2b",display:"block"}} />
      <div style={{marginTop:12,background:"#111",border:"1px solid #222",borderRadius:10,padding:10}}>
        <div style={{fontSize:12,fontWeight:700,color:"#ffcc00"}}>➤ {currentRound} → Winners to {nextRound} (wipes after round)</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {info.roundWinners.length===0? <span style={{fontSize:11,opacity:0.5}}>No winners yet...</span> :
            info.roundWinners.map((n:string,i:number)=><span key={i} style={{background:"#1f1f1f",border:"1px solid #22c55e",borderRadius:12,padding:"5px 9px",fontSize:11}}>✅ {n} → {nextRound}</span>)}
        </div>
      </div>
      {info.lastWinner && <div style={{marginTop:10,background:"#0f2a0f",border:"1px solid #22c55e",borderRadius:8,padding:10,fontSize:13,color:"#22c55e"}}>🔊 {info.lastWinner} wins {currentRound}! Proceeds to {nextRound}</div>}
    </div>
  </div>;
}
