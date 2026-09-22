"use client";
import { useEffect, useState, useRef } from "react";

const PLAYERS_96 = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"];
type Piece = 0|1|2|11|22; type Pos = {r:number,c:number};
const ROUND_NAMES = ["Round of 32 (16 games)","Round of 16 (8 games)","Quarterfinal (4 games)","Semifinal (2 games)","FINAL"];
const MOVE_DELAY = 4000; const CHAIN_DELAY = 1000; const BETWEEN_GAMES = 4000; const CHAMP_TIME = 300000;

function getRandom32(){ return [...PLAYERS_96].sort(()=>0.5-Math.random()).slice(0,32); }
function newBoard():Piece[][]{ const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]); for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1; for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2; return b; }

export default function WatchPage(){
  const [tournamentNum,setTournamentNum]=useState(1); const [roundIdx,setRoundIdx]=useState(0); const [matchInRound,setMatchInRound]=useState(0);
  const [bracket,setBracket]=useState<string[]>([]); const [nextRoundPlayers,setNextRoundPlayers]=useState<string[]>([]); const [roundWinners,setRoundWinners]=useState<string[]>([]);
  const [p1,setP1]=useState(""); const [p2,setP2]=useState(""); const [board,setBoard]=useState<Piece[][]>([]); const [turn,setTurn]=useState<1|2>(1);
  const [move,setMove]=useState(0); const [winner,setWinner]=useState<string|null>(null); const [champion,setChampion]=useState<string|null>(null);
  const [chainPos,setChainPos]=useState<Pos|null>(null); const [soundOn,setSoundOn]=useState(false); const [loaded,setLoaded]=useState(false);
  const audioRef=useRef<AudioContext|null>(null); const chainCountRef=useRef(0); const creatingRef=useRef(false);

  const initAudio=()=>{ if(!audioRef.current) audioRef.current = new (window.AudioContext||(window as any).webkitAudioContext)(); setSoundOn(true); };
  const playTone=(f:number,d:number,t:OscillatorType="sine",v=0.3)=>{ if(!audioRef.current||!soundOn) return; const ctx=audioRef.current; const o=ctx.createOscillator(); const g=ctx.createGain(); o.type=t; o.frequency.value=f; g.gain.setValueAtTime(v,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+d); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+d); };
  const sounds={ move:()=>{ playTone(400,0.15); setTimeout(()=>playTone(600,0.1),80); }, capture:()=>{ playTone(180,0.25,"square",0.4); setTimeout(()=>playTone(900,0.2,"sawtooth",0.35),120); }, doubleCapture:()=>{ chainCountRef.current++; playTone(300+chainCountRef.current*120,0.2,"triangle",0.4); }, king:()=>{ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>playTone(f,0.3,"triangle",0.3),i*90)); }, win:()=>{ [261,329,392,523].forEach((f,i)=>setTimeout(()=>playTone(f,0.5,"sine",0.4),i*150)); }, champ:()=>{ [261,329,392,523,659,784,1046].forEach((f,i)=>setTimeout(()=>playTone(f,0.6,"triangle",0.5),i*180)); }, start:()=>{ playTone(200,0.3); setTimeout(()=>playTone(400,0.4),200); } };
  const speak=(txt:string)=>{ if(!soundOn||!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(txt); u.rate=0.9; window.speechSynthesis.speak(u); };

  const saveToKV = (data:any)=>{ fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tournamentNum,roundIdx,matchInRound,bracket,nextRoundPlayers,roundWinners,p1,p2,board,turn,move,chainPos,winner,champion,time:Date.now(),...data})}).catch(()=>{}); };
  const getCaptures=(bd:Piece[][],r:number,c:number):any[]=>{ const piece=bd[r][c]; if(piece===0) return []; const isBlack=piece===1||piece===11; const isKing=piece===11||piece===22; const res:any[]=[]; const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]] as const; if(isKing){ for(const [dr,dc] of dirs){ let found:Pos|null=null; for(let k=1;k<10;k++){ const mr=r+dr*k,mc=c+dc*k; if(mr<0||mr>=10||mc<0||mc>=10) break; const mid=bd[mr][mc]; if(mid===0){ if(found) res.push({r,c,nr:mr,nc:mc,capture:found}); continue; } const midBlack=mid===1||mid===11; if(isBlack===midBlack) break; if(found) break; found={r:mr,c:mc}; } } } else { for(const [dr,dc] of dirs){ const mr=r+dr,mc=c+dc,jr=r+dr*2,jc=c+dc*2; if(jr<0||jr>=10||jc<0||jc>=10) continue; if(bd[jr][jc]!==0) continue; const mid=bd[mr][mc]; if(mid===0) continue; if(isBlack!==(mid===1||mid===11)) res.push({r,c,nr:jr,nc:jc,capture:{r:mr,c:mc}}); } } return res; };
  const countPieces=(bd:Piece[][])=>{ let b1=0,b2=0; bd.forEach(r=>r.forEach(p=>{ if(p===1||p===11) b1++; if(p===2||p===22) b2++; })); return {b1,b2}; };
  const startMatch=(a:string,b:string,existing?:Piece[][])=>{ setP1(a); setP2(b); setBoard(existing||newBoard()); if(!existing){ setTurn(1); setMove(0); setChainPos(null); } setWinner(null); if(soundOn) sounds.start(); };

  useEffect(()=>{
    const load = async()=>{
      const s = await fetch('/api/state').then(r=>r.json()).catch(()=>null);
      if(s && s.bracket?.length){
        if(s.champion && Date.now()-(s.time||0) > CHAMP_TIME){ creatingRef.current=true; const r32=getRandom32(); const nb=newBoard(); const ns={tournamentNum:(s.tournamentNum||1)+1,bracket:r32,nextRoundPlayers:[],roundWinners:[],roundIdx:0,matchInRound:0,p1:r32[0],p2:r32[1],board:nb,turn:1,move:0,chainPos:null,champion:null,time:Date.now()}; await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ns)}); setTournamentNum(ns.tournamentNum); setBracket(r32); setNextRoundPlayers([]); setRoundWinners([]); setRoundIdx(0); setMatchInRound(0); setP1(r32[0]); setP2(r32[1]); setBoard(nb); setChampion(null); setLoaded(true); return;
        }
        setTournamentNum(s.tournamentNum||1); setRoundIdx(s.roundIdx||0); setMatchInRound(s.matchInRound||0); setBracket(s.bracket); setNextRoundPlayers(s.nextRoundPlayers||[]); setRoundWinners(s.roundWinners||[]); setP1(s.p1); setP2(s.p2); setBoard(s.board); setTurn(s.turn||1); setMove(s.move||0); setChampion(s.champion||null); setChainPos(s.chainPos||null); setLoaded(true); return;
      }
      if(creatingRef.current) return; creatingRef.current=true;
      const r32=getRandom32(); const nb=newBoard(); const ns={tournamentNum:1,bracket:r32,nextRoundPlayers:[],roundWinners:[],roundIdx:0,matchInRound:0,p1:r32[0],p2:r32[1],board:nb,turn:1,move:0,time:Date.now(),champion:null};
      await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ns)}); setTournamentNum(1); setBracket(r32); setP1(r32[0]); setP2(r32[1]); setBoard(nb); setLoaded(true);
    };
    load();
    const poll=setInterval(async()=>{ const s=await fetch('/api/state').then(r=>r.json()).catch(()=>null); if(s?.board && loaded &&!winner &&!champion){ setBoard(s.board); setTurn(s.turn||1); setP1(s.p1); setP2(s.p2); setBracket(s.bracket||[]); setNextRoundPlayers(s.nextRoundPlayers||[]); setRoundWinners(s.roundWinners||[]); setRoundIdx(s.roundIdx||0); setMatchInRound(s.matchInRound||0); setMove(s.move||0); setChainPos(s.chainPos||null); if(s.champion) setChampion(s.champion); } },2000);
    return()=>clearInterval(poll);
  },[loaded,winner,champion]);

  useEffect(()=>{
    if(!loaded||winner||champion) return;
    const delay = chainPos? CHAIN_DELAY : MOVE_DELAY;
    const id=setTimeout(()=>{
      setBoard(prev=>{
        const bd=prev.map(r=>[...r] as Piece[]); const {b1,b2}=countPieces(bd);
        if(b1===0){ setWinner(p2); return bd; } if(b2===0){ setWinner(p1); return bd; }
        let moves:any[]=[]; if(chainPos){ moves=getCaptures(bd,chainPos.r,chainPos.c); } else { let allCaps:any[]=[]; for(let r=0;r<10;r++) for(let c=0;c<10;c++){ const pc=bd[r][c]; if(pc===0) continue; if(turn===1 &&!(pc===1||pc===11)) continue; if(turn===2 &&!(pc===2||pc===22)) continue; allCaps.push(...getCaptures(bd,r,c)); } if(allCaps.length>0) moves=allCaps; else { for(let r=0;r<10;r++) for(let c=0;c<10;c++){ const pc=bd[r][c]; if(pc===0) continue; if(turn===1 &&!(pc===1||pc===11)) continue; if(turn===2 &&!(pc===2||pc===22)) continue; const isKing=pc===11||pc===22; const isBlack=pc===1||pc===11; const dirs=isKing? [[1,1],[1,-1],[-1,1],[-1,-1]] : (isBlack? [[1,1],[1,-1]] : [[-1,1],[-1,-1]]) as any; if(isKing){ for(const [dr,dc] of dirs){ for(let k=1;k<10;k++){ const nr=r+dr*k,nc=c+dc*k; if(nr<0||nr>=10||nc<0||nc>=10) break; if(bd[nr][nc]!==0) break; moves.push({r,c,nr,nc,capture:null}); } } } else { for(const [dr,dc] of dirs){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<10&&nc>=0&&nc<10&&bd[nr][nc]===0) moves.push({r,c,nr,nc,capture:null}); } } } } }
        if(moves.length===0){ setWinner(turn===1?p2:p1); return bd; }
        const caps=moves.filter((m:any)=>m.capture); const chosen=(caps.length>0?caps:moves)[Math.floor(Math.random()*(caps.length>0?caps.length:moves.length))]; const moving=bd[chosen.r][chosen.c]; const wasKing=moving===11||moving===22;
        bd[chosen.nr][chosen.nc]=moving; bd[chosen.r][chosen.c]=0; if(chosen.capture){ bd[chosen.capture.r][chosen.capture.c]=0; if(chainPos) sounds.doubleCapture(); else sounds.capture(); const more=getCaptures(bd,chosen.nr,chosen.nc); if(more.length>0){ setChainPos({r:chosen.nr,c:chosen.nc}); saveToKV({board:bd,chainPos:{r:chosen.nr,c:chosen.nc},turn,move:move+1}); } else { setChainPos(null); const nt=turn===1?2:1; setTurn(nt); saveToKV({board:bd,chainPos:null,turn:nt,move:move+1}); } } else { sounds.move(); setChainPos(null); const nt=turn===1?2:1; setTurn(nt); saveToKV({board:bd,chainPos:null,turn:nt,move:move+1}); }
        if(moving===1 && chosen.nr===9){ bd[chosen.nr][chosen.nc]=11; if(!wasKing) sounds.king(); } if(moving===2 && chosen.nr===0){ bd[chosen.nr][chosen.nc]=22; if(!wasKing) sounds.king(); }
        setMove(m=>m+1); return bd;
      });
    },delay); return()=>clearTimeout(id);
  },[board,turn,chainPos,winner,champion,loaded,soundOn,p1,p2,move]);

  useEffect(()=>{ if(!winner) return; sounds.win(); speak(`Winner ${winner} advances`); const newWinners=[...roundWinners, winner]; setRoundWinners(newWinners); const newNext=[...nextRoundPlayers, winner]; setNextRoundPlayers(newNext); if(roundIdx===4){ setChampion(winner); speak(`Champion ${winner}`); sounds.champ(); saveToKV({champion:winner,roundWinners:newWinners,nextRoundPlayers:newNext,winner:null}); return; } const matchesInRound=bracket.length/2; const nextMatch=matchInRound+1; setTimeout(()=>{ if(nextMatch < matchesInRound){ setMatchInRound(nextMatch); startMatch(bracket[nextMatch*2], bracket[nextMatch*2+1]); saveToKV({matchInRound:nextMatch,roundWinners:newWinners,nextRoundPlayers:newNext,p1:bracket[nextMatch*2],p2:bracket[nextMatch*2+1],board:newBoard(),turn:1,move:0,chainPos:null,winner:null}); } else { setBracket(newNext); setNextRoundPlayers([]); setRoundWinners([]); setRoundIdx(roundIdx+1); setMatchInRound(0); startMatch(newNext[0], newNext[1]); saveToKV({bracket:newNext,nextRoundPlayers:[],roundWinners:[],roundIdx:roundIdx+1,matchInRound:0,p1:newNext[0],p2:newNext[1],board:newBoard(),turn:1,move:0,chainPos:null,winner:null}); } }, BETWEEN_GAMES); },[winner]);

  useEffect(()=>{ if(!champion) return; const t=setTimeout(async()=>{ const r32=getRandom32(); const nb=newBoard(); const ns={tournamentNum:tournamentNum+1,bracket:r32,nextRoundPlayers:[],roundWinners:[],roundIdx:0,matchInRound:0,p1:r32[0],p2:r32[1],board:nb,turn:1,move:0,chainPos:null,champion:null,time:Date.now()}; await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ns)}); setTournamentNum(ns.tournamentNum); setBracket(r32); setNextRoundPlayers([]); setRoundWinners([]); setRoundIdx(0); setMatchInRound(0); setChampion(null); startMatch(r32[0],r32[1]); }, CHAMP_TIME); return()=>clearTimeout(t); },[champion]);

  if(!loaded) return <div style={{background:"#000",color:"#fff",padding:20}}>Loading live tournament...</div>;
  return(
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:12}}><span style={{color:"#ff5555"}}>◎ TOURNAMENT {tournamentNum} LIVE</span> · <b style={{color:"gold"}}>{ROUND_NAMES[roundIdx]}</b> · Game {matchInRound+1}/{bracket.length/2}</div>{!soundOn && <button onClick={initAudio} style={{background:"#ff0",color:"#000",border:0,padding:"6px 14px",borderRadius:20,fontWeight:800,fontSize:12}}>🔊 SOUND</button>}</div>
      <h1 style={{fontSize:18,fontWeight:800,margin:"10px 0"}}>{p1} <span style={{color:"#666"}}>VS</span> {p2}</h1>
      <div style={{fontSize:11,opacity:0.7,marginBottom:10}}>{champion?`🏆 CHAMPION: ${champion}`: winner?`Winner: ${winner}`: `${turn===1?p1:p2} to play`} · Move {move}</div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <div style={{position:"relative",width:380,maxWidth:"100%"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden"}}>
            {board.map((row,r)=>row.map((cell,c)=>{ const isDark=(r+c)%2===1; const isChain=chainPos&&chainPos.r===r&&chainPos.c===c; return <div key={`${r}-${c}`} style={{background:isDark?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center",outline:isChain?"3px solid yellow":undefined}}>{cell!==0 && <div style={{width:"70%",height:"70%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#cc0000",border:cell===11||cell===22?"2px solid gold":"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center"}}>{(cell===11||cell===22)&&<span style={{fontSize:10,color:"gold"}}>♔</span>}</div>}</div> }))}
          </div>
          {winner&&!champion&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12}}><div style={{fontSize:22,fontWeight:900,color:"#0f0"}}>{winner} wins</div></div>}
          {champion&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:12}}><div style={{fontSize:14}}>🏆 CHAMPION</div><div style={{fontSize:30,fontWeight:900,color:"gold"}}>{champion}</div><div style={{fontSize:11}}>Next in 5 min</div></div>}
        </div>
        <div style={{minWidth:200,background:"#111",borderRadius:12,padding:12,height:"fit-content"}}>
          <div style={{fontSize:12,fontWeight:800,color:"gold",marginBottom:8}}>🏆 Winners of {ROUND_NAMES[roundIdx].split("(")[0]}</div>
          {roundWinners.length===0? <div style={{fontSize:11,opacity:0.4}}>No winners yet...</div> : roundWinners.map((n,i)=><div key={i} style={{fontSize:11,background:"#222",marginBottom:4,padding:"4px 8px",borderRadius:6}}>✅ {i+1}. {n}</div>)}
          <div style={{fontSize:10,opacity:0.4,marginTop:10}}>Synced across all phones via KV</div>
        </div>
      </div>
    </div>
  )
}
