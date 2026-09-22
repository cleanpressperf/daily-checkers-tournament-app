"use client";
import { useEffect, useState } from "react";

const PLAYERS_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

export default function WatchPage(){
  const [p1,setP1]=useState(PLAYERS_96[0]);
  const [p2,setP2]=useState(PLAYERS_96[1]);
  const [move,setMove]=useState(0);
  const [board,setBoard]=useState<number[][]>([]);

  useEffect(()=>{
    const sh=[...PLAYERS_96].sort(()=>0.5-Math.random());
    setP1(sh[0]); setP2(sh[1]);
    const b=Array(10).fill(0).map(()=>Array(10).fill(0));
    for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1;
    for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2;
    setBoard(b);
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>{
      setMove(m=>m+1);
      setBoard(prev=>{
        const nb=prev.map(row=>[...row]);
        const movers=[];
        for(let r=0;r<10;r++) for(let c=0;c<10;c++) if(nb[r][c]!==0) movers.push([r,c]);
        if(movers.length===0) return nb;
        const [r,c]=movers[Math.floor(Math.random()*movers.length)];
        const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]] as const;
        const [dr,dc]=dirs[Math.floor(Math.random()*dirs.length)];
        const nr=r+dr, nc=c+dc;
        if(nr>=0&&nr<10&&nc>=0&&nc<10&&nb[nr][nc]===0){
          nb[nr][nc]=nb[r][c]; nb[r][c]=0;
        }
        return nb;
      });
    },2000);
    return()=>clearInterval(id);
  },[]);

  return(
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:16}}>
      <div style={{color:"#ff5555",fontSize:12}}>◎ LIVE VIEWER · POLLING EVERY 2S</div>
      <h1 style={{fontSize:20,fontWeight:800,margin:"12px 0"}}>{p1} VS {p2}</h1>
      <div style={{opacity:0.6,marginBottom:12}}>Table 1 · Round 1 · Live · Move {move}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",width:"100%",maxWidth:380,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:16,overflow:"hidden"}}>
        {board.map((row,r)=>row.map((cell,c)=>{
          const isDark=(r+c)%2===1;
          return <div key={`${r}-${c}`} style={{background:isDark?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {cell===1 && <div style={{width:"70%",height:"70%",borderRadius:"50%",background:"#111"}}/>}
            {cell===2 && <div style={{width:"70%",height:"70%",borderRadius:"50%",background:"#cc0000"}}/>}
          </div>
        }))}
      </div>
      <div style={{marginTop:10,fontSize:11,opacity:0.4}}>Watching live — pieces move every 2s</div>
    </div>
  )
}
