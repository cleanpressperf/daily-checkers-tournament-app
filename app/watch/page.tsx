"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";

const BOT_NAMES_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints",
  "Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima",
  "Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

const ROUND_NAMES:Record<number,string> = {32:"Round of 32",16:"Round of 16",8:"Quarter Final",4:"Semi Final",2:"Final"};

type Piece = 0|1|2|3|4; //0 empty,1 b-man,2 w-man,3 b-king,4 w-king

function speak(text:string){
  try{
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate=0.95; u.pitch=1; u.volume=0.9;
    window.speechSynthesis.speak(u);
  }catch{}
}
function playSound(type:"move"|"capture"|"king"|"win"){
  try{
    const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(type==="move"){ o.frequency.value=300; g.gain.setValueAtTime(0.18, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.3); o.start(); o.stop(ctx.currentTime+0.3); }
    if(type==="capture"){ o.frequency.value=600; g.gain.setValueAtTime(0.25, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.4); o.start(); o.stop(ctx.currentTime+0.4); }
    if(type==="king"){ o.frequency.value=880; g.gain.setValueAtTime(0.25, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.6); o.start(); o.stop(ctx.currentTime+0.6); }
    if(type==="win"){ o.frequency.value=523; const o2=ctx.createOscillator(); o2.connect(g); o2.frequency.value=659; g.gain.setValueAtTime(0.25, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+1); o.start(); o2.start(); o.stop(ctx.currentTime+1); o2.stop(ctx.currentTime+1); }
  }catch{}
}

function WatchContent(){
  const sp = useSearchParams();
  const t = (sp.get("t")||"bronze").toLowerCase();
  const bronze = BOT_NAMES_96.slice(0,32);
  const silver = BOT_NAMES_96.slice(32,64);
  const gold = BOT_NAMES_96.slice(64,96);
  const initialPlayers = t==="silver"? silver : t==="gold"? gold : bronze;
  const config = t==="silver"? {name:"SILVER", prize:1000, entry:100, color:"#9ca3af"} : t==="gold"? {name:"GOLD", prize:2500, entry:200, color:"#facc15"} : {name:"BRONZE", prize:500, entry:50, color:"#cd7f32"};

  // Tournament state
  const [roundSize, setRoundSize] = useState(32);
  const [currentPlayers, setCurrentPlayers] = useState<string[]>(initialPlayers);
  const [winnersToNext, setWinnersToNext] = useState<string[]>([]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [p1Name, setP1Name] = useState(initialPlayers[0]);
  const [p2Name, setP2Name] = useState(initialPlayers[1]);
  const [board, setBoard] = useState<Piece[]>([]);
  const [turn, setTurn] = useState<1|2>(1); //1 black,2 white
  const [isThinking, setIsThinking] = useState(false);
  const [countdown, setCountdown] = useState<number|null>(null);
  const [tournamentOver, setTournamentOver] = useState(false);
  const [champion, setChampion] = useState("");
  const matchRef = useRef(0);

  // init board 10x10 international
  const initBoard = ():Piece[]=>{
    const b:Piece[] = Array(100).fill(0);
    for(let i=0;i<100;i++){
      const r=Math.floor(i/10); const c=i%10;
      if((r+c)%2===1){
        if(r<4) b[i]=1;
        if(r>5) b[i]=2;
      }
    }
    return b;
  };

  // International capture logic (simplified but includes backward capture + flying king + multi)
  const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
  const inside = (r:number,c:number)=> r>=0&&r<10&&c>=0&&c<10;

  const getCaptures = (b:Piece[], idx:number):{to:number,captured:number[], path:number[]}[]=>{
    const piece=b[idx]; if(piece===0) return [];
    const isBlack = piece===1||piece===3; const isKing = piece===3||piece===4;
    const r=Math.floor(idx/10), c=idx%10;
    const res:any[]=[];
    if(!isKing){
      // man can capture backward in international
      for(const [dr,dc] of dirs){
        const r1=r+dr,c1=c+dc,r2=r+2*dr,c2=c+2*dc;
        if(!inside(r2,c2)) continue;
        const i1=r1*10+c1,i2=r2*10+c2;
        const target=b[i1];
        if(target!==0 && ((isBlack && (target===2||target===4)) || (!isBlack && (target===1||target===3))) && b[i2]===0){
          res.push({to:i2,captured:[i1], path:[idx,i2]});
        }
      }
    }else{
      // flying king
      for(const [dr,dc] of dirs){
        let rr=r+dr,cc=c+dc, found=-1;
        while(inside(rr,cc)){
          const ii=rr*10+cc;
          if(b[ii]!==0){
            if(found===-1 && ((isBlack && (b[ii]===2||b[ii]===4)) || (!isBlack && (b[ii]===1||b[ii]===3)))){
              found=ii;
            }else break;
          }else{
            if(found!==-1){
              res.push({to:ii,captured:[found], path:[idx,ii]});
            }
          }
          rr+=dr; cc+=dc;
        }
      }
    }
    return res;
  };

  const findBestMove = (b:Piece[], player:1|2):{from:number,to:number,captured:number[]}|null=>{
    const own = player===1?[1,3]:[2,4];
    let allCaps:any[]=[];
    for(let i=0;i<100;i++) if(own.includes(b[i])) {
      const caps=getCaptures(b,i);
      caps.forEach(c=> allCaps.push({from:i,...c}));
    }
    if(allCaps.length>0){
      // mandatory max capture - pick longest
      allCaps.sort((a,b)=> b.captured.length - a.captured.length);
      return allCaps[0];
    }
    // normal moves
    const moves:any[]=[];
    for(let i=0;i<100;i++) if(own.includes(b[i])){
      const isKing=b[i]===3||b[i]===4;
      const r=Math.floor(i/10),c=i%10;
      const moveDirs = isKing? dirs : (player===1? [[1,-1],[1,1]] : [[-1,-1],[-1,1]]);
      if(isKing){
        for(const [dr,dc] of dirs){
          let rr=r+dr,cc=c+dc;
          while(inside(rr,cc)){
            const ii=rr*10+cc;
            if(b[ii]===0) moves.push({from:i,to:ii,captured:[]});
            else break;
            rr+=dr; cc+=dc;
          }
        }
      }else{
        for(const [dr,dc] of moveDirs){
          const rr=r+dr,cc=c+dc;
          if(inside(rr,cc) && b[rr*10+cc]===0) moves.push({from:i,to:rr*10+cc,captured:[]});
        }
      }
    }
    if(moves.length===0) return null;
    return moves[Math.floor(Math.random()*moves.length)];
  };

  // start new match
  const startMatch = (p1:string,p2:string)=>{
    setP1Name(p1); setP2Name(p2);
    setBoard(initBoard()); setTurn(1); setIsThinking(false);
  };

  // init tournament
  useEffect(()=>{
    setCurrentPlayers(initialPlayers);
    setRoundSize(32);
    setWinnersToNext([]);
    setMatchIdx(0);
    setTournamentOver(false);
    setCountdown(null);
    setChampion("");
    startMatch(initialPlayers[0], initialPlayers[1]);
  },[t]);

  // game loop: 4 sec wait before move, 1 sec for multi-capture
  useEffect(()=>{
    if(tournamentOver || board.length===0) return;
    if(isThinking) return;
    setIsThinking(true);
    const timer = setTimeout(()=>{
      const move = findBestMove(board, turn);
      if(!move){
        // no moves = opponent wins
        const winner = turn===1? p2Name : p1Name;
        const loser = turn===1? p1Name : p2Name;
        playSound("win");
        const nextRoundName = ROUND_NAMES[roundSize/2] || "Next Round";
        const msg = `${winner} wins against ${loser}, proceeds to ${nextRoundName}`;
        speak(msg);
        // add to winners list
        setWinnersToNext(prev=>[...prev, winner]);
        // check round end
        const nextIdx = matchIdx+1;
        const matchesInRound = roundSize/2;
        if(nextIdx >= matchesInRound){
          // round finished
          setTimeout(()=>{
            const newPlayers = [...winnersToNext, winner];
            if(newPlayers.length===1){
              setChampion(newPlayers[0]);
              setTournamentOver(true);
              setCountdown(300); // 5 min = 300 sec
              speak(`${newPlayers[0]} is the champion of ${config.name} tournament, winning ${config.prize} naira`);
              playSound("win");
            }else{
              // next round
              setCurrentPlayers(newPlayers);
              setRoundSize(newPlayers.length);
              setWinnersToNext([]);
              setMatchIdx(0);
              startMatch(newPlayers[0], newPlayers[1]);
              speak(`Round of ${newPlayers.length} complete. Starting ${ROUND_NAMES[newPlayers.length] || ""}`);
            }
          }, 2000);
        }else{
          setMatchIdx(nextIdx);
          setTimeout(()=> startMatch(currentPlayers[nextIdx*2], currentPlayers[nextIdx*2+1]), 1500);
        }
        setIsThinking(false);
        return;
      }

      // do move
      const nb = [...board] as Piece[];
      const movingPiece = nb[move.from];
      nb[move.from]=0;
      // capture remove
      move.captured.forEach((ci:number)=> nb[ci]=0);
      // king promotion
      const toR = Math.floor(move.to/10);
      let newPiece = movingPiece;
      if(movingPiece===1 && toR===9) newPiece=3;
      if(movingPiece===2 && toR===0) newPiece=4;
      if(newPiece!==movingPiece) playSound("king"); else if(move.captured.length>0) playSound("capture"); else playSound("move");
      nb[move.to]=newPiece;
      setBoard(nb);

      // check multi-capture: if capture and can capture again from new pos, continue after 1 sec
      if(move.captured.length>0){
        const moreCaps = getCaptures(nb, move.to);
        if(moreCaps.length>0){
          setTimeout(()=>{
            setBoard(prev=>{
              const b2=[...prev];
              // continue will be handled in next loop after 1 sec
              return b2;
            });
            setIsThinking(false);
          }, 1000); // 1 sec for multiple capture
          return;
        }
      }

      setTurn(turn===1?2:1);
      setIsThinking(false);
    }, 4000); // 4 sec wait before move
    return ()=> clearTimeout(timer);
  },[board, turn, isThinking, tournamentOver]);

  // 5 min countdown timer after tournament ends
  useEffect(()=>{
    if(countdown===null) return;
    if(countdown<=0){ setCountdown(null); setTournamentOver(false); setCurrentPlayers(initialPlayers); setRoundSize(32); setWinnersToNext([]); setMatchIdx(0); startMatch(initialPlayers[0], initialPlayers[1]); return; }
    const iv=setInterval(()=> setCountdown(c=> c!==null? c-1 : null),1000);
    return ()=> clearInterval(iv);
  },[countdown]);

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"#fff", padding:10}}>
      <div style={{maxWidth:560, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <a href="/" style={{color:"#fff", textDecoration:"none", fontSize:12}}>← Home</a>
          <div style={{fontSize:11, fontWeight:900, border:`2px solid ${config.color}`, padding:"4px 10px", borderRadius:20}}>{config.name} • {ROUND_NAMES[roundSize]} • ₦{config.prize}</div>
          <a href="/boardroom" style={{background:"#fff", color:"#000", padding:"6px 12px", borderRadius:20, fontSize:11, fontWeight:800, textDecoration:"none"}}>Boardroom</a>
        </div>

        {tournamentOver? (
          <div style={{background:"#111", borderRadius:12, padding:16, marginTop:12, textAlign:"center", border:`2px solid ${config.color}`}}>
            <div style={{fontSize:20, fontWeight:900, color:config.color}}>🏆 CHAMPION: {champion}</div>
            <div style={{fontSize:13, marginTop:6}}>Wins ₦{config.prize} • Tournament ended</div>
            <div style={{fontSize:28, fontWeight:900, marginTop:10, fontVariantNumeric:"tabular-nums"}}>{countdown!==null? `${Math.floor(countdown/60)}:${String(countdown%60).padStart(2,"0")}`:""}</div>
            <div style={{fontSize:11, opacity:0.5, marginTop:4}}>Next tournament starts in 5 minutes</div>
          </div>
        ):(
          <div style={{background:"#111", borderRadius:12, padding:"10px", marginTop:10, borderLeft:`4px solid ${config.color}`}}>
            <div style={{fontSize:10, opacity:0.5}}>{ROUND_NAMES[roundSize]} • Match {matchIdx+1}/{roundSize/2} • {isThinking?"Thinking 4s...":""}</div>
            <div style={{fontWeight:900, fontSize:13, marginTop:4, lineHeight:1.3}}>{p1Name} <span style={{color:config.color}}>VS</span> {p2Name}</div>
            <div style={{fontSize:11, marginTop:2, color: turn===1? "#fff":"#22c55e"}}>{turn===1? p1Name+" (Black) to move": p2Name+" (White) to move"}</div>
          </div>
        )}

        {/* Board - fixed size pieces, king does NOT expand */}
        <div style={{background:"#ffffff", borderRadius:16, padding:8, marginTop:12, boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:2, width:"100%"}}>
            {board.map((cell,i)=>{
              const r=Math.floor(i/10); const isBlack=(r+i)%2===1;
              const isKing=cell===3||cell===4;
              return (
                <div key={i} style={{aspectRatio:"1", width:"100%", background:isBlack?"#111":"#f7f7f5", borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative"}}>
                  {cell!==0 && (
                    <div style={{
                      width:"68%", height:"68%", borderRadius:"50%",
                      background: cell===1||cell===3? "radial-gradient(circle at 30% 30%, #444,#000)" : "radial-gradient(circle at 30% 30%, #fff,#ccc)",
                      border: cell===1||cell===3? "2px solid #222":"2px solid #eee",
                      boxShadow:"0 1px 3px rgba(0,0,0,0.5)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"9px", fontWeight:900, color: cell===1||cell===3? "#facc15":"#111",
                      lineHeight:1
                    }}>
                      {isKing? "K": ""}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Proceeding list - clears each round */}
        <div style={{background:"#111", borderRadius:12, padding:10, marginTop:12}}>
          <div style={{fontSize:11, fontWeight:800, opacity:0.7}}>PROCEEDING TO {ROUND_NAMES[roundSize/2] || "NEXT ROUND"} ({winnersToNext.length}/{roundSize/2}):</div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:8}}>
            {winnersToNext.length===0? <div style={{fontSize:11, opacity:0.4}}>No winners yet in this round...</div> : winnersToNext.map((w,i)=><div key={i} style={{background:"#1c1c1c", border:"1px solid #22c55e", padding:"5px 8px", borderRadius:20, fontSize:11}}>✓ {w}</div>)}
          </div>
          <div style={{fontSize:10, opacity:0.35, marginTop:8}}>List clears automatically at end of {ROUND_NAMES[roundSize]}</div>
        </div>

        <div style={{background:"#0f0f0f", borderRadius:12, padding:10, marginTop:10}}>
          <div style={{fontSize:10, opacity:0.5, fontWeight:800}}>ALL 32 IN {config.name} (never in other tiers):</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginTop:6, maxHeight:120, overflowY:"auto"}}>
            {(t==="silver"? silver : t==="gold"? gold : bronze).map((p,i)=><div key={i} style={{fontSize:10, opacity: currentPlayers.includes(p)||winnersToNext.includes(p)?1:0.3}}>{i+1}. {p}</div>)}
          </div>
        </div>

        <div style={{textAlign:"center", fontSize:9, opacity:0.3, marginTop:8}}>4s wait before move • 1s multi-capture • Backward + flying king • Vocal announcement • Sounds • King K inside same circle</div>
      </div>
    </div>
  );
}

export default function Page(){
  return <Suspense fallback={<div style={{background:"#000", color:"#fff", padding:20, textAlign:"center"}}>Loading tournament...</div>}><WatchContent/></Suspense>;
}
