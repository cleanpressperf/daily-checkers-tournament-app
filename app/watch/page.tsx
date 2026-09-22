"use client";
import { useEffect, useState, useRef } from "react";
const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
const DIRS=[{r:-1,c:-1},{r:-1,c:1},{r:1,c:-1},{r:1,c:1}];
type Piece = 0|1|2|11|22;
function newBoard():Piece[][]{const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]); for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1; for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2; return b;}
function inside(r:number,c:number){return r>=0&&r<10&&c>=0&&c<10;}
function isOpponent(p:Piece,t:Piece){ if(t===0) return false; const isP1=p===1||p===11; const isT1=t===1||t===11; return isP1!==isT1; }
function clone(b:Piece[][]){return b.map(r=>[...r]);}
function findCaptures(board:Piece[][], r:number,c:number, piece:Piece, visited:Set<string>): any[] {
  const results:any[]=[]; const isKing=piece===11||piece===22;
  if(!isKing){ for(let d of DIRS){ const mr=r+d.r, mc=c+d.c, lr=r+d.r*2, lc=c+d.c*2; if(!inside(lr,lc)||!inside(mr,mc)) continue; if(!isOpponent(piece, board[mr][mc])) continue; if(board[lr][lc]!==0) continue; const key=`${mr},${mc}`; if(visited.has(key)) continue; const nb=clone(board); nb[mr][mc]=0; nb[r][c]=0; nb[lr][lc]=piece; if(lr===9&&piece===1) nb[lr][lc]=11; if(lr===0&&piece===2) nb[lr][nc]=22; const nVisited=new Set(visited); nVisited.add(key); const further=findCaptures(nb,lr,lc,nb[lr][lc],nVisited); if(further.length){ further.forEach((f:any)=> results.push({path:[{r,c},...f.path], caps:[{r:mr,c:mc},...f.caps], finalBoard:f.finalBoard})); } else { results.push({path:[{r,c},{r:lr,c:lc}], caps:[{r:mr,c:mc}], finalBoard:nb}); } } } else { for(let d of DIRS){ let rr=r+d.r, cc=c+d.c; while(inside(rr,cc) && board[rr][cc]===0){ rr+=d.r; cc+=d.c; } if(!inside(rr,cc)) continue; if(!isOpponent(piece, board[rr][cc])) continue; const cap={r:rr,c:cc}; const key=`${rr},${cc}`; if(visited.has(key)) continue; let lr=rr+d.r, lc=cc+d.c; while(inside(lr,lc) && board[lr][lc]===0){ const nb=clone(board); nb[rr][cc]=0; nb[r][c]=0; nb[lr][lc]=piece; const nVisited=new Set(visited); nVisited.add(key); const further=findCaptures(nb,lr,lc,piece,nVisited); if(further.length){ further.forEach((f:any)=> results.push({path:[{r,c},{r:lr,c:lc},...f.path.slice(1)], caps:[cap,...f.caps], finalBoard:f.finalBoard})); } else { results.push({path:[{r,c},{r:lr,c:lc}], caps:[cap], finalBoard:nb}); } lr+=d.r; lc+=d.c; } } } return results;
}
function getAllMoves(board:Piece[][], turn:1|2){ let allCaps:any[]=[]; for(let r=0;r<10;r++) for(let c=0;c<10;c++){ const p=board[r][c]; if(p===0) continue; const isP1=p===1||p===11; if((turn===1&&!isP1)||(turn===2&&isP1)) continue; const caps=findCaptures(board,r,c,p,new Set()); caps.forEach(cap=> allCaps.push({...cap,from:{r,c}})); } if(allCaps.length){ const max=Math.max(...allCaps.map((x:any)=>x.caps.length)); allCaps=allCaps.filter((x:any)=>x.caps.length===max); return {caps:allCaps, moves:[]}; } const moves:any[]=[]; for(let r=0;r<10;r++) for(let c=0;c<10;c++){ const p=board[r][c]; if(p===0) continue; const isP1=p===1||p===11; if((turn===1&&!isP1)||(turn===2&&isP1)) continue; const isKing=p===11||p===22; if(!isKing){ const dirs=p===1?[{r:1,c:-1},{r:1,c:1}]:[{r:-1,c:-1},{r:-1,c:1}]; dirs.forEach(d=>{ const nr=r+d.r,nc=c+d.c; if(inside(nr,nc)&&board[nr][nc]===0) moves.push({from:{r,c},to:{r:nr,c:nc},board:(()=>{const nb=clone(board); nb[r][c]=0; nb[nr][nc]=p; if(nr===9&&p===1) nb[nr][nc]=11; if(nr===0&&p===2) nb[nr][nc]=22; return nb;})()}); }); } else { DIRS.forEach(d=>{ let nr=r+d.r,nc=c+d.c; while(inside(nr,nc)&&board[nr][nc]===0){ const nb=clone(board); nb[r][c]=0; nb[nr][nc]=p; moves.push({from:{r,c},to:{r:nr,c:nc},board:nb}); nr+=d.r; nc+=d.c; } }); } } return {caps:[], moves};}
function playSound(type:'move'|'capture'|'chain'|'win'|'round'){ try{ const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); if(type==='move'){ o.frequency.value=420; g.gain.value=0.2; o.start(); setTimeout(()=>{o.frequency.value=680;},80); o.stop(ctx.currentTime+0.18); } else if(type==='capture'){ o.frequency.value=200; g.gain.value=0.4; o.start(); o.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+0.15); o.stop(ctx.currentTime+0.25); } else if(type==='chain'){ o.frequency.value=800; g.gain.value=0.3; o.start(); o.frequency.value=1200; o.stop(ctx.currentTime+0.12); } else if(type==='round'){ o.frequency.value=500; g.gain.value=0.5; o.start(); o.frequency.linearRampToValueAtTime(1000,ctx.currentTime+0.5); o.stop(ctx.currentTime+0.6); } else { o.frequency.value=300; g.gain.value=0.6; o.start(); o.frequency.linearRampToValueAtTime(1200,ctx.currentTime+0.8); o.stop(ctx.currentTime+1); } }catch{} }
function speak(text:string){ try{ if('speechSynthesis' in window){ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.rate=0.9; u.pitch=1.1; u.volume=0.9; speechSynthesis.speak(u);} }catch{} }

export default function Watch(){
  const [s,setS]=useState<any>(null); const timerRef=useRef<any>(null); const [isLeader,setIsLeader]=useState(false); const tabId=useRef(Math.random().toString(36).slice(2));
  const [announce,setAnnounce]=useState<any>(null); const countdownRef=useRef<any>(null);

  useEffect(()=>{
    const checkLeader=()=>{
      const leader = localStorage.getItem('checkers_leader');
      const leaderTime = parseInt(localStorage.getItem('checkers_leader_time')||'0');
      const now=Date.now();
      if(!leader || now-leaderTime>7000){
        localStorage.setItem('checkers_leader', tabId.current);
        localStorage.setItem('checkers_leader_time', now.toString());
        setIsLeader(true);
      } else if(leader===tabId.current){
        localStorage.setItem('checkers_leader_time', now.toString());
        setIsLeader(true);
      } else {
        setIsLeader(false);
      }
    };
    checkLeader();
    const iv=setInterval(checkLeader, 3000);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    const init=async()=>{
      let d=await fetch('/api/state').then(r=>r.json()).catch(()=>null);
      if(!d?.bracket?.length){
        const ALL_96 = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim Charles","Snoop Pearson","Bunk Moreland","Kima Greggs","Connie Corleone","Kay Adams","Apollonia Vitelli","Moe Greene","Hyman Roth","Cissy Saint","Kane Hamilton","Rob Volpe","Andre Wright","Walter White","Jesse Pinkman","Saul Goodman","Hank Schrader","Mike Ehrmantraut","Pablo Escobar","Javier Pena","Steve Murphy","Tommy Shelby Jr","John Watson","Sherlock Holmes","James Moriarty","Tony Soprano","Paulie Gualtieri","Silvio Dante","Christopher Moltisanti","Tony Montana","Manny Ribera","Nucky Thompson","Al Capone","Lucky Luciano","Bugsy Siegel","Meyer Lansky","Dutch Schultz","Arnold Rothstein","Frank Costello","Vito Genovese","Carlo Gambino","John Gotti","Sammy Gravano","Whitey Bulger","Ray Donovan","Mickey Donovan","Terry Donovan","Daryl Donovan","Bunchy Donovan","Sully Sullivan","James Donovan","Fitzgerald","Devereaux","Cousin Mickey","Zion"];
        const shuffled=[...ALL_96].sort(()=>0.5-Math.random()); const first32=shuffled.slice(0,32);
        d={bracket:first32,p1:first32[0],p2:first32[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],champion:null,time:Date.now(),chain:null,usedPool:shuffled,poolIndex:32};
        await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
      }
      setS(d);
    };
    init();

    const fastSync=async()=>{
      const d=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
      if(d?.bracket?.length){
        setS((prev:any)=>{
          if(!prev) return d;
          if(isLeader && d.time===prev.time) return prev;
          return d;
        });
      }
    };

    const onVisible=async()=>{
      if(document.visibilityState==='visible'){
        if(timerRef.current) clearTimeout(timerRef.current);
        timerRef.current=null;
        const d=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
        if(d?.bracket?.length) setS(d);
      } else {
        if(timerRef.current) clearTimeout(timerRef.current);
        timerRef.current=null;
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const poll=setInterval(()=>{ if(document.visibilityState==='visible') fastSync(); }, 2000);
    return()=>{ clearInterval(poll); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', onVisible); };
  },[isLeader]);

  useEffect(()=>{ if(!announce) return; countdownRef.current=setInterval(()=>{ setAnnounce((a:any)=>{ if(!a) return null; if(a.countdown<=1){ clearInterval(countdownRef.current); return null; } return {...a,countdown:a.countdown-1}; }); },1000); return()=>clearInterval(countdownRef.current); },[announce?.type]);
  useEffect(()=>{ if(announce) return; if(!s) return; if(s._pendingNext){ const next=s._pendingNext; delete next._pendingNext; setS(next); fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}); } },[announce]);

  useEffect(()=>{
    if(!isLeader) return;
    if(!s||s.champion||announce||s._pendingNext) return;
    if(document.visibilityState!=='visible') return;
    if(s.chain){
      timerRef.current=setTimeout(async()=>{
        const cur=s.chain; if(!cur||cur.step>=cur.path.length-1){ const next={...s,board:cur.finalBoard,chain:null,time:Date.now()}; next.turn=s.turn===1?2:1; setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}); timerRef.current=null; playSound('chain'); return; }
        const nb=clone(s.board); const from=cur.path[cur.step]; const to=cur.path[cur.step+1]; const cap=cur.caps[cur.step]; const piece=nb[from.r][from.c]; nb[from.r][from.c]=0; if(cap) nb[cap.r][cap.c]=0; nb[to.r][to.c]=piece; if(to.r===9&&piece===1) nb[to.r][to.c]=11; if(to.r===0&&piece===2) nb[to.r][to.c]=22;
        const next={...s,board:nb,chain:{...cur,step:cur.step+1},time:Date.now()}; setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}); timerRef.current=null; playSound('chain');
      },1000); return()=>clearTimeout(timerRef.current);
    }
    timerRef.current=setTimeout(async()=>{
      const {caps,moves}=getAllMoves(s.board,s.turn); let next:any={...s};
      if(caps.length===0&&moves.length===0){
        const matchWinner=s.turn===1? s.p2:s.p1;
        const newWinners=[...s.roundWinners,matchWinner];
        if(newWinners.length>=s.bracket.length/2){
          if(s.roundIdx===4 && newWinners.length===1){
            next.champion=matchWinner; next.roundWinners=newWinners; setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}); playSound('win'); speak(`Tournament Champion ${matchWinner}`); setAnnounce({type:'champion', names:[matchWinner], countdown:180});
            let used=s.usedPool||[]; let idx=s.poolIndex||0; const ALL_96 = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim Charles","Snoop Pearson","Bunk Moreland","Kima Greggs","Connie Corleone","Kay Adams","Apollonia Vitelli","Moe Greene","Hyman Roth","Cissy Saint","Kane Hamilton","Rob Volpe","Andre Wright","Walter White","Jesse Pinkman","Saul Goodman","Hank Schrader","Mike Ehrmantraut","Pablo Escobar","Javier Pena","Steve Murphy","Tommy Shelby Jr","John Watson","Sherlock Holmes","James Moriarty","Tony Soprano","Paulie Gualtieri","Silvio Dante","Christopher Moltisanti","Tony Montana","Manny Ribera","Nucky Thompson","Al Capone","Lucky Luciano","Bugsy Siegel","Meyer Lansky","Dutch Schultz","Arnold Rothstein","Frank Costello","Vito Genovese","Carlo Gambino","John Gotti","Sammy Gravano","Whitey Bulger","Ray Donovan","Mickey Donovan","Terry Donovan","Daryl Donovan","Bunchy Donovan","Sully Sullivan","James Donovan","Fitzgerald","Devereaux","Cousin Mickey","Zion"];
            if(idx+32>used.length){ used=[...ALL_96].sort(()=>0.5-Math.random()); idx=0; } const next32=used.slice(idx,idx+32); const fresh={bracket:next32,p1:next32[0],p2:next32[1],board:newBoard(),turn:1,roundIdx:0,matchInRound:0,roundWinners:[],champion:null,time:Date.now(),chain:null,usedPool:used,poolIndex:idx+32}; next._pendingNext=fresh; timerRef.current=null; return;
          } else {
            const winnersToShow=[...newWinners]; next.bracket=[...newWinners]; next.roundIdx=s.roundIdx+1; next.matchInRound=0; next.roundWinners=[]; next.p1=next.bracket[0]; next.p2=next.bracket[1]; next.board=newBoard(); next.turn=1; const pending={...next}; next={...s, roundWinners:newWinners, _pendingNext:pending}; setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending)}); playSound('round'); speak(`Round ${ROUND_NAMES[s.roundIdx]} winners ${winnersToShow.join(', ')} proceeding to ${ROUND_NAMES[s.roundIdx+1]}`); setAnnounce({type:'round', names:winnersToShow, roundName:ROUND_NAMES[s.roundIdx+1], countdown:60}); timerRef.current=null; return;
          }
        } else { next.matchInRound=s.matchInRound+1; next.roundWinners=newWinners; next.p1=s.bracket[next.matchInRound*2]; next.p2=s.bracket[next.matchInRound*2+1]; next.board=newBoard(); next.turn=1; playSound('win'); speak(`${matchWinner} wins`); }
      } else if(caps.length){ const best=caps[Math.floor(Math.random()*caps.length)]; if(best.path.length>2){ const from=best.path[0]; const firstTo=best.path[1]; const cap=best.caps[0]; const nb=clone(s.board); const piece=nb[from.r][from.c]; nb[from.r][from.c]=0; nb[cap.r][cap.c]=0; nb[firstTo.r][firstTo.c]=piece; if(firstTo.r===9&&piece===1) nb[firstTo.r][firstTo.c]=11; if(firstTo.r===0&&piece===2) nb[firstTo.r][firstTo.c]=22; next.board=nb; next.chain={path:best.path,caps:best.caps,finalBoard:best.finalBoard,step:1}; playSound('capture'); } else { next.board=best.finalBoard; next.turn=s.turn===1?2:1; playSound('capture'); } }
      else { moves.sort((a,b)=>{ const ac=Math.abs(a.to.c-4.5), bc=Math.abs(b.to.c-4.5); return ac-bc; }); const chosen=moves[0]; next.board=chosen.board; next.turn=s.turn===1?2:1; playSound('move'); }
      next.time=Date.now(); setS(next); await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}); timerRef.current=null;
    },4000); return()=>clearTimeout(timerRef.current);
  },[s,announce,isLeader]);

  if(!s) return <div style={{background:"#000",color:"#fff",padding:30}}>Loading 24/7 International LIVE...</div>;
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:12,position:"relative"}}>
    {announce && <div style={{position:"fixed",inset:0,zIndex:9999,background:announce.type==='champion'?"radial-gradient(circle,#ffcc00,#ff6600)":"radial-gradient(circle,#222,#000)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20}}><div style={{fontSize:14,letterSpacing:3,opacity:0.7}}>{announce.type==='champion'?"🏆 TOURNAMENT CHAMPION 🏆":`✅ ${ROUND_NAMES[s.roundIdx-1]||'ROUND'} COMPLETE`}</div><div style={{fontSize:announce.type==='champion'?42:28,fontWeight:900,margin:"20px 0",lineHeight:1.1}}>{announce.names.join(", ")}</div><div style={{fontSize:16,opacity:0.8}}>{announce.type==='champion'?`New tournament in`:`Next: ${announce.roundName} starting in`} {announce.countdown}s</div><div style={{marginTop:20,width:"80%",maxWidth:300,height:8,background:"rgba(255,255,255,0.2)",borderRadius:10,overflow:"hidden"}}><div style={{height:"100%",background:"#fff",width:`${announce.type==='champion'?(announce.countdown/180)*100:(announce.countdown/60)*100}%`,transition:"width 1s linear"}}/></div></div>}

    <div style={{color:"#ff3b3b",fontSize:11}}>◎ 24/7 INTL LIVE · {ROUND_NAMES[s.roundIdx]||"FINISHED"} · Game {s.matchInRound+1}/{Math.ceil(s.bracket.length/2)} {isLeader?"[LEADER 🔊]":"[VIEWER]"} </div>
    <h2 style={{margin:"8px 0",fontSize:18,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.p1} <span style={{color:"#888"}}>VS</span> {s.p2} <span style={{fontSize:11,color:s.turn===1?"#fff":"#f44"}}> {s.turn===1?s.p1:s.p2} to move</span></h2>

    <div style={{width:"100%",maxWidth:400,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(10, minmax(0,1fr))",gridTemplateRows:"repeat(10, minmax(0,1fr))"}}>
      {s.board.map((row:any,r:number)=>row.map((cell:any,c:number)=>{
        const isLight=(r+c)%2===0;
        return <div key={r+"-"+c} style={{background:isLight?"#f5deb3":"#8b5a2b",width:"100%",height:"100%",minWidth:0,minHeight:0,display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",overflow:"hidden"}}>
          {cell!==0&&<div style={{width:"72%",height:"72%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#c00",border:cell===11||cell===22?"2px solid gold":"1px solid rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,flexShrink:0,boxSizing:"border-box"}}>
            <span style={{fontSize:"9px",lineHeight:1,color:"gold",fontWeight:900}}>{cell===11||cell===22?"♔":""}</span>
          </div>}
        </div>;
      }))}
    </div>

    <div style={{marginTop:10,background:"#111",border:"1px solid #333",borderRadius:8,padding:8}}>
      <div style={{fontSize:10,opacity:0.5}}>PROCEEDING TO {ROUND_NAMES[s.roundIdx+1]||"NEXT"} ({s.roundWinners.length}/{Math.ceil(s.bracket.length/2)})</div>
      <div style={{fontSize:11,marginTop:4}}>{s.roundWinners.length? s.roundWinners.map((n:string,i:number)=><span key={i} style={{background:"#222",padding:"2px 6px",borderRadius:4,margin:"2px",display:"inline-block"}}>{n}</span>): <span style={{opacity:0.3}}>— winners add here, clears each round —</span>}</div>
    </div>
    <div style={{fontSize:9,opacity:0.25,marginTop:8,textAlign:"center"}}>Instant snap on return • no drag • leader only moves • sound 🔊 restored • king locked</div>
  </div>;
}
