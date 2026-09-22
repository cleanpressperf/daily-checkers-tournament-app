"use client";
import { useEffect, useState, useRef } from "react";

const PLAYERS_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

type Piece = 0|1|2|11|22;
type Pos = {r:number,c:number};
const ROUND_NAMES = ["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];

function getRandom32(){
  const arr=[...PLAYERS_96].sort(()=>0.5-Math.random());
  return arr.slice(0,32);
}

export default function WatchPage(){
  const [tournamentNum,setTournamentNum]=useState(1);
  const [roundIdx,setRoundIdx]=useState(0);
  const [matchInRound,setMatchInRound]=useState(0);
  const [bracket,setBracket]=useState<string[]>(()=>getRandom32());
  const [nextRoundPlayers,setNextRoundPlayers]=useState<string[]>([]);
  const [p1,setP1]=useState("");
  const [p2,setP2]=useState("");
  const [board,setBoard]=useState<Piece[][]>([]);
  const [turn,setTurn]=useState<1|2>(1);
  const [move,setMove]=useState(0);
  const [last,setLast]=useState("");
  const [winner,setWinner]=useState<string|null>(null);
  const [champion,setChampion]=useState<string|null>(null);
  const [chainPos,setChainPos]=useState<Pos|null>(null);
  const [soundOn,setSoundOn]=useState(false);
  const audioRef=useRef<AudioContext|null>(null);
  const chainCountRef=useRef(0);

  const initAudio=()=>{
    if(!audioRef.current) audioRef.current = new (window.AudioContext||(window as any).webkitAudioContext)();
    setSoundOn(true);
  };
  const playTone=(freq:number,dur:number,type:OscillatorType="sine",vol=0.3)=>{
    if(!audioRef.current||!soundOn) return;
    const ctx=audioRef.current; const o=ctx.createOscillator(); const g=ctx.createGain();
    o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(vol,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur);
  };
  const sounds={
    move:()=>{ playTone(400,0.15,"sine",0.25); setTimeout(()=>playTone(600,0.1,"sine",0.15),80); },
    capture:()=>{ playTone(180,0.25,"square",0.4); setTimeout(()=>playTone(900,0.2,"sawtooth",0.35),120); },
    doubleCapture:()=>{ chainCountRef.current++; playTone(300+chainCountRef.current*120,0.2,"triangle",0.4); setTimeout(()=>playTone(800+chainCountRef.current*100,0.25,"square",0.4),100); },
    king:()=>{ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>playTone(f,0.3,"triangle",0.3),i*90)); },
    win:()=>{ [261,329,392,523].forEach((f,i)=>setTimeout(()=>playTone(f,0.5,"sine",0.4),i*150)); setTimeout(()=>{ [659,783,1046].forEach((f,i)=>setTimeout(()=>playTone(f,0.6,"triangle",0.5),i*120)); },600); },
    champ:()=>{ [261,329,392,523,659,784,1046].forEach((f,i)=>setTimeout(()=>playTone(f,0.6,"triangle",0.5),i*180)); },
    start:()=>{ playTone(200,0.3,"sine",0.2); setTimeout(()=>playTone(400,0.4,"sine",0.3),200); }
  };

  const speak=(text:string)=>{
    if(!soundOn||!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.rate=0.9; u.pitch=1.1; window.speechSynthesis.speak(u);
  };

  const startMatch=(a:string,b:string)=>{
    setP1(a); setP2(b);
    const b2:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]);
    for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b2[r][c]=1;
    for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b2[r][c]=2;
    setBoard(b2); setTurn(1); setMove(0); setLast("Game Start"); setWinner(null); setChainPos(null); chainCountRef.current=0;
    if(soundOn) sounds.start();
  };

  const startTournament=(num:number)=>{
    const random32=getRandom32();
    setBracket(random32); setNextRoundPlayers([]); setRoundIdx(0); setMatchInRound(0); setTournamentNum(num); setChampion(null);
    startMatch(random32[0],random32[1]);
  };

  useEffect(()=>{ startTournament(1); },[]);

  // Handle match winner -> advance tournament
  useEffect(()=>{
    if(!winner) return;
    sounds.win(); speak(`Winner! ${winner} advances!`);

    const isFinal = roundIdx===4;
    if(isFinal){
      setChampion(winner); speak(`Tournament Champion! ${winner}!`);
      sounds.champ();
      return;
    }

    // Add winner to next round
    const updatedNext=[...nextRoundPlayers, winner];
    setNextRoundPlayers(updatedNext);

    const matchesInThisRound = bracket.length/2;
    const nextMatchIdx = matchInRound+1;

    setTimeout(()=>{
      if(nextMatchIdx < matchesInThisRound){
        // Next match same round
        const a=bracket[nextMatchIdx*2]; const b=bracket[nextMatchIdx*2+1];
        setMatchInRound(nextMatchIdx);
        startMatch(a,b);
      } else {
        // Round finished, move to next round
        const nextRound = roundIdx+1;
        setBracket(updatedNext); setNextRoundPlayers([]); setRoundIdx(nextRound); setMatchInRound(0);
        startMatch(updatedNext[0], updatedNext[1]);
      }
    }, 4000); // 4 sec between matches

  },[winner]);

  // Champion 5 min display then new tournament
  useEffect(()=>{
    if(!champion) return;
    const t=setTimeout(()=> startTournament(tournamentNum+1), 300000); // 5 minutes
    return()=>clearTimeout(t);
  },[champion]);

  const countPieces=(bd:Piece[][])=>{ let b1=0,b2=0; bd.forEach(row=>row.forEach(p=>{ if(p===1||p===11) b1++; if(p===2||p===22) b2++; })); return {b1,b2}; };

  const getCaptures=(bd:Piece[][],r:number,c:number):any[]=>{
    const piece=bd[r][c]; if(piece===0) return [];
    const isBlack=piece===1||piece===11; const isKing=piece===11||piece===22;
    const res:any[]=[]; const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]] as const;
    if(isKing){
      for(const [dr,dc] of dirs){
        let found:Pos|null=null;
        for(let k=1;k<10;k++){
          const mr=r+dr*k, mc=c+dc*k;
          if(mr<0||mr>=10||mc<0||mc>=10) break;
          const mid=bd[mr][mc];
          if(mid===0){ if(found) res.push({r,c,nr:mr,nc:mc,capture:found}); continue; }
          const midBlack=mid===1||mid===11;
          if(isBlack===midBlack) break;
          if(found) break;
          found={r:mr,c:mc};
        }
      }
    } else {
      for(const [dr,dc] of dirs){
        const mr=r+dr, mc=c+dc, jr=r+dr*2, jc=c+dc*2;
        if(jr<0||jr>=10||jc<0||jc>=10) continue;
        if(bd[jr][jc]!==0) continue;
        const mid=bd[mr][mc]; if(mid===0) continue;
        if(isBlack!==(mid===1||mid===11)) res.push({r,c,nr:jr,nc:jc,capture:{r:mr,c:mc}});
      }
    }
    return res;
  };

  useEffect(()=>{
    if(winner||champion) return;
    const delay = chainPos? 1000 : 4000; // 4s normal, 1s chain
    const id=setTimeout(()=>{
      setBoard(prev=>{
        const bd=prev.map(r=>[...r] as Piece[]);
        const {b1,b2}=countPieces(bd);
        if(b1===0){ setWinner(p2); return bd; }
        if(b2===0){ setWinner(p1); return bd; }

        let moves:any[]=[];
        if(chainPos){
          moves=getCaptures(bd,chainPos.r,chainPos.c);
        } else {
          let allCaps:any[]=[];
          for(let r=0;r<10;r++) for(let c=0;c<10;c++){
            const pc=bd[r][c]; if(pc===0) continue;
            if(turn===1 &&!(pc===1||pc===11)) continue;
            if(turn===2 &&!(pc===2||pc===22)) continue;
            allCaps.push(...getCaptures(bd,r,c));
          }
          if(allCaps.length>0) moves=allCaps;
          else {
            for(let r=0;r<10;r++) for(let c=0;c<10;c++){
              const pc=bd[r][c]; if(pc===0) continue;
              if(turn===1 &&!(pc===1||pc===11)) continue;
              if(turn===2 &&!(pc===2||pc===22)) continue;
              const isKing=pc===11||pc===22; const isBlack=pc===1||pc===11;
              const dirs = isKing? [[1,1],[1,-1],[-1,1],[-1,-1]] : (isBlack? [[1,1],[1,-1]] : [[-1,1],[-1,-1]]) as any;
              if(isKing){
                for(const [dr,dc] of dirs){ for(let k=1;k<10;k++){ const nr=r+dr*k,nc=c+dc*k; if(nr<0||nr>=10||nc<0||nc>=10) break; if(bd[nr][nc]!==0) break; moves.push({r,c,nr,nc,capture:null}); } }
              } else {
                for(const [dr,dc] of dirs){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<10&&nc>=0&&nc<10&&bd[nr][nc]===0) moves.push({r,c,nr,nc,capture:null}); }
              }
            }
          }
        }

        if(moves.length===0){ setWinner(turn===1?p2:p1); return bd; }
        const caps=moves.filter((m:any)=>m.capture);
        const chosen=(caps.length>0?caps:moves)[Math.floor(Math.random()*(caps.length>0?caps.length:moves.length))];
        const moving=bd[chosen.r][chosen.c];
        const wasKing=moving===11||moving===22;

        bd[chosen.nr][chosen.nc]=moving; bd[chosen.r][chosen.c]=0;
        if(chosen.capture){
          bd[chosen.capture.r][chosen.capture.c]=0;
          if(chainPos) { sounds.doubleCapture(); setLast(`CHAIN x${chainCountRef.current+1} → ${String.fromCharCode(97+chosen.nc)}${10-chosen.nr}!!`); }
          else { sounds.capture(); chainCountRef.current=0; setLast(`CAPTURE x ${String.fromCharCode(97+chosen.nc)}${10-chosen.nr}`); }
          const more=getCaptures(bd,chosen.nr,chosen.nc);
          if(more.length>0){ setChainPos({r:chosen.nr,c:chosen.nc}); }
          else { setChainPos(null); setTurn(t=>t===1?2:1); chainCountRef.current=0; }
        } else {
          sounds.move(); setLast(`→ ${String.fromCharCode(97+chosen.nc)}${10-chosen.nr}`); setChainPos(null); setTurn(t=>t===1?2:1);
        }
        if(moving===1 && chosen.nr===9){ bd[chosen.nr][chosen.nc]=11; if(!wasKing) sounds.king(); }
        if(moving===2 && chosen.nr===0){ bd[chosen.nr][chosen.nc]=22; if(!wasKing) sounds.king(); }
        setMove(m=>m+1);
        return bd;
      });
    },delay);
    return()=>clearTimeout(id);
  },[board,turn,chainPos,winner,champion,soundOn]);

  return(
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:11}}>
          <span style={{color:"#ff5555"}}>◎ TOURNAMENT {tournamentNum}</span> · <span style={{color:"gold"}}>{ROUND_NAMES[roundIdx]}</span> · Match {matchInRound+1}/{bracket.length/2} · {bracket.length} players left
        </div>
        {!soundOn && <button onClick={initAudio} style={{background:"#ff0",color:"#000",border:0,padding:"6px 14px",borderRadius:20,fontWeight:800,fontSize:12}}>🔊 TAP FOR SOUND + VOICE</button>}
        {soundOn && <div style={{fontSize:11,background:"#0a0",padding:"4px 10px",borderRadius:20}}>🔊 SOUND ON</div>}
      </div>

      <h1 style={{fontSize:18,fontWeight:800,margin:"10px 0"}}>{p1} <span style={{color:"#666"}}>VS</span> {p2}</h1>
      <div style={{fontSize:12,opacity:0.7,marginBottom:8}}>{champion?`🏆 CHAMPION: ${champion}`: chainPos? <span style={{color:"yellow",fontWeight:800}}>⚡ CHAIN x{chainCountRef.current+1}! continues in 1s!</span> : winner? `Winner: ${winner} → Next round`: `${turn===1?p1:p2} to play`} · Move {move} · {last}</div>

      <div style={{position:"relative",maxWidth:380}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isDark=(r+c)%2===1; const isChain=chainPos && chainPos.r===r && chainPos.c===c;
            return <div key={`${r}-${c}`} style={{background:isDark?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center",outline:isChain?"3px solid yellow":undefined}}>
              {cell!==0 && <div style={{width:"70%",height:"70%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#cc0000",border:cell===11||cell===22?"2px solid gold":"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center",transform:isChain?"scale(1.2)":"scale(1)",transition:"transform 0.2s"}}>{(cell===11||cell===22)&&<span style={{fontSize:10,color:"gold"}}>♔</span>}</div>}
            </div>
          }))}
        </div>

        {winner &&!champion && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:12}}>
            <div style={{fontSize:12,opacity:0.6}}>{ROUND_NAMES[roundIdx]} Winner</div>
            <div style={{fontSize:22,fontWeight:900,color:"#0f0",margin:"6px 0",textAlign:"center"}}>{winner}</div>
            <div style={{fontSize:11}}>Advances → {nextRoundPlayers.length} qualified for next round</div>
          </div>
        )}

        {champion && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:12}}>
            <div style={{fontSize:14,opacity:0.6}}>🏆 TOURNAMENT {tournamentNum} CHAMPION</div>
            <div style={{fontSize:32,fontWeight:900,color:"gold",margin:"10px 0",textAlign:"center"}}>{champion}</div>
            <div style={{fontSize:20}}>👑🎉🎉</div>
            <div style={{fontSize:11,marginTop:10,background:"#222",padding:"6px 12px",borderRadius:20}}>Next tournament in 5 mins · 32 new random players from 96</div>
            <div style={{fontSize:10,opacity:0.4,marginTop:8}}>{bracket.join(" · ")}</div>
          </div>
        )}
      </div>

      <div style={{marginTop:12,maxWidth:380,fontSize:10,opacity:0.5}}>
        Tournament logic: No repeat player in same tournament. {ROUND_NAMES[roundIdx]} ({bracket.length/2} matches). Qualified: {nextRoundPlayers.join(", ")||"none yet"}.<br/>
        Moves: 4s normal, 1s chain capture. Sounds: pop / punch / chain / king / win + voice.
      </div>
    </div>
  )
}
