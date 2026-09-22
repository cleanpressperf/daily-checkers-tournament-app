"use client";
import { useEffect, useState, useRef } from "react";

const PLAYERS_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

type Piece = 0 | 1 | 2 | 11 | 22; // 1=black,2=red, 11=black king,22=red king

export default function WatchPage(){
  const [p1,setP1]=useState(PLAYERS_96[0]);
  const [p2,setP2]=useState(PLAYERS_96[1]);
  const [move,setMove]=useState(0);
  const [turn,setTurn]=useState<1|2>(1);
  const [board,setBoard]=useState<Piece[][]>([]);
  const [lastMove,setLastMove]=useState<string>("");
  const [log,setLog]=useState<string[]>([]);

  useEffect(()=>{
    const sh=[...PLAYERS_96].sort(()=>0.5-Math.random());
    setP1(sh[0]); setP2(sh[1]);
    const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]);
    for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1;
    for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2;
    setBoard(b);
  },[]);

  // INTELLIGENT CHECKERS ENGINE
  useEffect(()=>{
    const id=setInterval(()=>{
      setBoard(prev=>{
        if(prev.length===0) return prev;
        const nb = prev.map(r=>[...r] as Piece[]);
        let bestMoves: any[] = [];

        // Find all legal moves for current player
        for(let r=0;r<10;r++){
          for(let c=0;c<10;c++){
            const piece=nb[r][c];
            if(piece===0) continue;
            const isBlack = piece===1 || piece===11;
            const isKing = piece===11 || piece===22;
            if(turn===1 &&!isBlack) continue;
            if(turn===2 && isBlack) continue;

            const dirs = isKing? [[1,1],[1,-1],[-1,1],[-1,-1]] : (isBlack? [[1,1],[1,-1]] : [[-1,1],[-1,-1]]);

            for(const [dr,dc] of dirs){
              const nr=r+dr, nc=c+dc;
              // simple move
              if(nr>=0&&nr<10&&nc>=0&&nc<10&&nb[nr][nc]===0){
                bestMoves.push({r,c,nr,nc,capture:null,score:Math.random()});
              }
              // capture move
              const jr=r+dr*2, jc=c+dc*2;
              const mr=r+dr, mc=c+dc;
              if(jr>=0&&jr<10&&jc>=0&&jc<10&&nb[jr][jc]===0 && nb[mr][mc]!==0){
                const mid=nb[mr][mc];
                const midBlack=mid===1||mid===11;
                if(isBlack!==midBlack){
                  bestMoves.push({r,c,nr:jr,nc:jc,capture:[mr,mc],score:100+Math.random()});
                }
              }
            }
          }
        }

        if(bestMoves.length===0){
          // No moves, switch turn
          setTurn(t=>t===1?2:1);
          return nb;
        }

        // Pick best capture first
        bestMoves.sort((a,b)=>b.score-a.score);
        const mv=bestMoves[0];

        // Execute
        const movingPiece=nb[mv.r][mv.c];
        nb[mv.nr][mv.nc]=movingPiece;
        nb[mv.r][mv.c]=0;
        if(mv.capture){
          nb[mv.capture[0]][mv.capture[1]]=0;
        }
        // King promotion
        if(movingPiece===1 && mv.nr===9) nb[mv.nr][mv.nc]=11;
        if(movingPiece===2 && mv.nr===0) nb[mv.nr][mv.nc]=22;

        const moveText = mv.capture? `x ${String.fromCharCode(97+mv.nc)}${10-mv.nr} (capture)` : `→ ${String.fromCharCode(97+mv.nc)}${10-mv.nr}`;
        setLastMove(moveText);
        setLog(l=>[...l.slice(-3), `${turn===1?p1:p2}: ${moveText}`]);

        setMove(m=>m+1);
        setTurn(t=>t===1?2:1);
        return nb;
      });
    },1800);
    return()=>clearInterval(id);
  },[turn,p1,p2]);

  const turnName = turn===1? p1 : p2;

  return(
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:16}}>
      <div style={{color:"#ff5555",fontSize:11,letterSpacing:1}}>◎ LIVE VIEWER · INTELLIGENT ENGINE · 10x10</div>
      <h1 style={{fontSize:18,fontWeight:800,margin:"10px 0",lineHeight:1.2}}>{p1} <span style={{color:"#666"}}>VS</span> {p2}</h1>
      <div style={{display:"flex",gap:8,marginBottom:10,fontSize:12}}>
        <div style={{background:turn===1?"#fff":"#222",color:turn===1?"#000":"#666",padding:"4px 10px",borderRadius:20,fontWeight:700}}>{p1} {turn===1?"●":""}</div>
        <div style={{background:turn===2?"#c00":"#222",color:turn===2?"#fff":"#666",padding:"4px 10px",borderRadius:20,fontWeight:700}}>{p2} {turn===2?"●":""}</div>
      </div>
      <div style={{opacity:0.6,marginBottom:8,fontSize:12}}>Table 1 · Round 1 · Live · Move {move} · {turnName} to play {lastMove && `· ${lastMove}`}</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",width:"100%",maxWidth:380,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden"}}>
        {board.map((row,r)=>row.map((cell,c)=>{
          const isDark=(r+c)%2===1;
          const isKing=cell===11||cell===22;
          return <div key={`${r}-${c}`} style={{background:isDark?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            {cell!==0 && (
              <div style={{
                width:"72%",height:"72%",borderRadius:"50%",
                background:cell===1||cell===11?"#111":"#cc0000",
                border:isKing?"2px solid gold":"1px solid #333",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 2px 4px rgba(0,0,0,0.5)",
                fontSize:10
              }}>
                {isKing && <span style={{color:"gold"}}>♔</span>}
              </div>
            )}
          </div>
        }))}
      </div>

      <div style={{marginTop:10,maxWidth:380}}>
        <div style={{fontSize:10,opacity:0.4,marginBottom:4}}>LAST MOVES:</div>
        {log.map((l,i)=><div key={i} style={{fontSize:11,opacity:0.7,padding:"2px 0"}}>{l}</div>)}
      </div>
    </div>
  )
}
