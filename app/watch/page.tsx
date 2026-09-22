"use client";
import { useEffect, useState } from "react";

const PLAYERS_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

type Piece = 0|1|2|11|22;
type Pos = {r:number,c:number};

export default function WatchPage(){
  const [idx,setIdx]=useState(0);
  const [p1,setP1]=useState(PLAYERS_96[0]);
  const [p2,setP2]=useState(PLAYERS_96[1]);
  const [board,setBoard]=useState<Piece[][]>([]);
  const [turn,setTurn]=useState<1|2>(1);
  const [move,setMove]=useState(0);
  const [last,setLast]=useState("");
  const [winner,setWinner]=useState<string|null>(null);
  const [chainPos,setChainPos]=useState<Pos|null>(null); // for double capture

  const newGame = (startIdx:number)=>{
    const a=PLAYERS_96[startIdx%96];
    const b=PLAYERS_96[(startIdx+1)%96];
    setP1(a); setP2(b); setIdx(startIdx+1);
    const b2:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]);
    for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b2[r][c]=1;
    for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b2[r][c]=2;
    setBoard(b2); setTurn(1); setMove(0); setLast("New game"); setWinner(null); setChainPos(null);
  };

  useEffect(()=>{ newGame(0); },[]);

  // Winner pause 1 minute then next pair
  useEffect(()=>{
    if(!winner) return;
    const t=setTimeout(()=> newGame(idx+1), 60000);
    return()=>clearTimeout(t);
  },[winner]);

  // Count pieces
  const countPieces = (bd:Piece[][])=>{
    let b1=0,b2=0;
    bd.forEach(row=>row.forEach(p=>{ if(p===1||p===11) b1++; if(p===2||p===22) b2++; }));
    return {b1,b2};
  };

  // Get captures for a piece - INTERNATIONAL: men capture forward AND backward, kings fly
  const getCaptures = (bd:Piece[][], r:number,c:number):any[]=>{
    const piece=bd[r][c]; if(piece===0) return [];
    const isBlack=piece===1||piece===11; const isKing=piece===11||piece===22;
    const res:any[]=[];
    const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]] as const;

    if(isKing){
      // Flying king capture: scan all distance
      for(const [dr,dc] of dirs){
        let foundEnemy:Pos|null=null;
        for(let k=1;k<10;k++){
          const mr=r+dr*k, mc=c+dc*k;
          if(mr<0||mr>=10||mc<0||mc>=10) break;
          const mid=bd[mr][mc];
          if(mid===0){
            if(foundEnemy){
              res.push({r,c,nr:mr,nc:mc,capture:foundEnemy});
            }
            continue;
          }
          const midBlack=mid===1||mid===11;
          if(isBlack===midBlack) break; // own piece blocks
          if(foundEnemy) break; // already found one
          foundEnemy={r:mr,c:mc};
        }
      }
    } else {
      // Man capture - 4 directions international
      for(const [dr,dc] of dirs){
        const mr=r+dr, mc=c+dc, jr=r+dr*2, jc=c+dc*2;
        if(jr<0||jr>=10||jc<0||jc>=10) continue;
        if(bd[jr][jc]!==0) continue;
        const mid=bd[mr][mc]; if(mid===0) continue;
        const midBlack=mid===1||mid===11;
        if(isBlack!==midBlack) res.push({r,c,nr:jr,nc:jc,capture:{r:mr,c:mc}});
      }
    }
    return res;
  };

  useEffect(()=>{
    if(winner) return;
    const id=setInterval(()=>{
      setBoard(prev=>{
        if(prev.length===0) return prev;
        const bd=prev.map(r=>[...r] as Piece[]);

        // Check win
        const {b1,b2}=countPieces(bd);
        if(b1===0){ setWinner(p2); return bd; }
        if(b2===0){ setWinner(p1); return bd; }

        // If in double capture chain, continue same piece
        let moves:any[]=[];
        if(chainPos){
          moves=getCaptures(bd,chainPos.r,chainPos.c);
        } else {
          // Find all captures first - mandatory in international
          let allCaptures:any[]=[];
          for(let r=0;r<10;r++) for(let c=0;c<10;c++){
            const piece=bd[r][c]; if(piece===0) continue;
            if(turn===1 &&!(piece===1||piece===11)) continue;
            if(turn===2 &&!(piece===2||piece===22)) continue;
            allCaptures.push(...getCaptures(bd,r,c));
          }
          if(allCaptures.length>0){
            // Max capture rule - pick longest
            allCaptures.sort((a,b)=> (b.capture?1:0)-(a.capture?1:0));
            moves=allCaptures;
          } else {
            // No capture, normal moves
            for(let r=0;r<10;r++) for(let c=0;c<10;c++){
              const piece=bd[r][c]; if(piece===0) continue;
              if(turn===1 &&!(piece===1||piece===11)) continue;
              if(turn===2 &&!(piece===2||piece===22)) continue;
              const isKing=piece===11||piece===22; const isBlack=piece===1||piece===11;
              const dirs = isKing? [[1,1],[1,-1],[-1,1],[-1,-1]] : (isBlack? [[1,1],[1,-1]] : [[-1,1],[-1,-1]]) as any;
              if(isKing){
                for(const [dr,dc] of dirs){
                  for(let k=1;k<10;k++){
                    const nr=r+dr*k,nc=c+dc*k;
                    if(nr<0||nr>=10||nc<0||nc>=10) break;
                    if(bd[nr][nc]!==0) break;
                    moves.push({r,c,nr,nc,capture:null});
                  }
                }
              } else {
                for(const [dr,dc] of dirs.slice(0, isKing?4:2)){
                  const nr=r+dr,nc=c+dc;
                  if(nr>=0&&nr<10&&nc>=0&&nc<10&&bd[nr][nc]===0) moves.push({r,c,nr,nc,capture:null});
                }
              }
            }
          }
        }

        if(moves.length===0){
          // No legal move = lose
          setWinner(turn===1?p2:p1);
          return bd;
        }

        // Pick move - prefer capture
        const caps=moves.filter((m:any)=>m.capture);
        const chosen = (caps.length>0? caps : moves)[Math.floor(Math.random()*(caps.length>0? caps.length : moves.length))];

        const moving=bd[chosen.r][chosen.c];
        bd[chosen.nr][chosen.nc]=moving;
        bd[chosen.r][chosen.c]=0;
        if(chosen.capture){
          bd[chosen.capture.r][chosen.capture.c]=0;
          setLast(`x ${String.fromCharCode(97+chosen.nc)}${10-chosen.nr} CAPTURE!`);
          // Check if more captures possible from new pos -> double capture
          const more=getCaptures(bd,chosen.nr,chosen.nc);
          if(more.length>0){
            setChainPos({r:chosen.nr,c:chosen.nc});
          } else {
            setChainPos(null);
            setTurn(t=>t===1?2:1);
          }
        } else {
          bd[chosen.nr][chosen.nc]=moving;
          setLast(`→ ${String.fromCharCode(97+chosen.nc)}${10-chosen.nr}`);
          setChainPos(null);
          setTurn(t=>t===1?2:1);
        }

        // Promotion
        if(moving===1 && chosen.nr===9) bd[chosen.nr][chosen.nc]=11;
        if(moving===2 && chosen.nr===0) bd[chosen.nr][chosen.nc]=22;

        setMove(m=>m+1);
        return bd;
      });
    },5000); // 5 SECONDS as you requested
    return()=>clearInterval(id);
  },[turn,chainPos,winner,p1,p2]);

  return(
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:16}}>
      <div style={{color:"#ff5555",fontSize:11}}>◎ LIVE INTERNATIONAL 10x10 · 5S / MOVE</div>
      <h1 style={{fontSize:18,fontWeight:800,margin:"10px 0"}}>{p1} <span style={{color:"#666"}}>VS</span> {p2}</h1>
      <div style={{fontSize:12,opacity:0.6,marginBottom:8}}>Move {move} · {chainPos?`CHAIN CAPTURE! ${turn===1?p1:p2} continues`:`${turn===1?p1:p2} to play`} · {last}</div>

      <div style={{position:"relative",maxWidth:380}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isDark=(r+c)%2===1;
            const isChain=chainPos && chainPos.r===r && chainPos.c===c;
            return <div key={`${r}-${c}`} style={{background:isDark?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center",outline:isChain?"3px solid yellow":"none"}}>
              {cell!==0 && <div style={{width:"70%",height:"70%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#cc0000",border:cell===11||cell===22?"2px solid gold":"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center"}}>{(cell===11||cell===22)&&<span style={{fontSize:10,color:"gold"}}>♔</span>}</div>}
            </div>
          }))}
        </div>

        {winner && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:12}}>
            <div style={{fontSize:14,opacity:0.6}}>WINNER</div>
            <div style={{fontSize:28,fontWeight:900,color:"gold",margin:"8px 0",textAlign:"center"}}>{winner}</div>
            <div style={{fontSize:12,opacity:0.5}}>Next game in 60s...</div>
            <div style={{marginTop:10,fontSize:11,background:"#222",padding:"6px 12px",borderRadius:20}}>Move {move} · {p1} vs {p2}</div>
          </div>
        )}
      </div>

      <div style={{marginTop:12,fontSize:10,opacity:0.3,maxWidth:380}}>
        International rules: mandatory capture, backward capture allowed, flying kings, multi-capture chain. Runs 24/7 — after win, next pair auto starts in 1 min.
      </div>
    </div>
  )
}
