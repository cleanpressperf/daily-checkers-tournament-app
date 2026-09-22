"use client";
import { useEffect, useState } from "react";
const BOTS = ["Thomas Shelby","Marlo Stanfield","Stringer Bell","Avon Barksdale","Ghost St. Patrick","Tommy Egan","Walter White","Jesse Pinkman"];
export default function WatchPage(){
  const [p1,setP1]=useState("Loading..."); const [p2,setP2]=useState("Loading..."); const [move,setMove]=useState(0);
  const [board,setBoard]=useState<number[][]>([]);
  useEffect(()=>{
    const sh=[...BOTS].sort(()=>0.5-Math.random()); setP1(sh[0]); setP2(sh[1]);
    const b=Array(10).fill(0).map(()=>Array(10).fill(0));
    for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1;
    for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2;
    setBoard(b);
  },[]);
  useEffect(()=>{ const id=setInterval(()=>setMove(m=>m+1),2000); return()=>clearInterval(id)},[]);
  return (
    <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:"16px"}}>
      <div style={{color:"#ff5555",fontSize:12}}>◎ LIVE VIEWER · POLLING EVERY 2S</div>
      <h1 style={{fontSize:26,fontWeight:800,margin:"12px 0"}}>{p1} VS {p2}</h1>
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
    </div>
  )
}
