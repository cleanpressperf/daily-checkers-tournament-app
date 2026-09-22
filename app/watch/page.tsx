"use client";
import { useEffect, useState, useRef } from "react";
const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
function playSound(t:'move'|'capture'){ try{ const c=new (window.AudioContext||(window as any).webkitAudioContext)(); const o=c.createOscillator(); const g=c.createGain(); o.connect(g); g.connect(c.destination); if(t==='move'){o.frequency.value=400; g.gain.value=0.25; o.start(); o.stop(c.currentTime+0.15);} else {o.frequency.value=250; g.gain.value=0.35; o.start(); o.frequency.exponentialRampToValueAtTime(800,c.currentTime+0.2); o.stop(c.currentTime+0.25);} }catch{} }

export default function Watch(){
  const [s,setS]=useState<any>(null);
  const prevRef=useRef("");
  useEffect(()=>{
    let m=true;
    const load=async()=>{
      try{
        const d=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
        if(!m||!d?.bracket) return;
        const cur=JSON.stringify(d.board)+d.p1;
        if(prevRef.current && prevRef.current!==cur) playSound(cur.length!==prevRef.current.length?'capture':'move');
        prevRef.current=cur;
        setS(d);
      }catch{}
    };
    load();
    const iv=setInterval(()=>{ if(document.visibilityState==='visible') load(); }, 1200);
    const onVis=()=>{ if(document.visibilityState==='visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return()=>{ m=false; clearInterval(iv); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', onVis); };
  },[]);

  if(!s) return <div style={{background:"#000",color:"#fff",padding:40,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading 24/7 LIVE...</div>;

  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:10,display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:560}}>
      <div style={{color:"#ff3b3b",fontSize:12,fontWeight:700}}>◎ 24/7 LIVE · {ROUND_NAMES[s.roundIdx]} · Game {s.matchInRound+1}/{Math.ceil(s.bracket.length/2)} · Move {s.move}</div>
      <h2 style={{margin:"10px 0 12px",fontSize:20,lineHeight:1.2}}>{s.p1} <span style={{color:"#777"}}>vs</span> {s.p2}<br/><span style={{fontSize:12,color:s.turn===1?"#fff":"#ff5555"}}>{s.turn===1?s.p1:s.p2} to move</span></h2>
      <div style={{width:"100%",aspectRatio:"1/1",background:"#3d2814",border:"4px solid #5a3e2b",borderRadius:16,overflow:"hidden",display:"grid",gridTemplateColumns:"repeat(10,1fr)",gridTemplateRows:"repeat(10,1fr)",boxShadow:"0 10px 30px rgba(0,0,0,0.8)"}}>
        {s.board.map((row:any,r:number)=>row.map((cell:any,c:number)=>{
          const isLight=(r+c)%2===0;
          return <div key={r+"-"+c} style={{background:isLight?"#f0d9b5":"#b58863",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {cell!==0&&<div style={{width:"82%",height:"82%",borderRadius:"50%",background:cell===1||cell===11?"radial-gradient(circle at 30% 30%,#333,#000)":"radial-gradient(circle at 30% 30%,#ff4444,#900)",border:cell===11||cell===22?"2.5px solid #ffd700":"1.5px solid #000",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:14,color:"#ffd700",fontWeight:900}}>{cell===11||cell===22?"♔":""}</span>
            </div>}
          </div>;
        }))}
      </div>
      <div style={{marginTop:14,background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:10}}>
        <div style={{fontSize:11,opacity:0.6}}>PROCEEDING TO {ROUND_NAMES[s.roundIdx+1]||"FINAL"} ({s.roundWinners.length}/{Math.ceil(s.bracket.length/2)})</div>
        <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:6}}>{s.roundWinners.length? s.roundWinners.map((n:string,i:number)=><span key={i} style={{background:"#1e1e1e",border:"1px solid #333",padding:"4px 10px",borderRadius:20,fontSize:12}}>{n}</span>): <span style={{opacity:0.3,fontSize:12}}>Winners</span>}</div>
      </div>
      <div style={{textAlign:"center",fontSize:10,opacity:0.3,marginTop:12}}>Fixed worldwide seed • never resets on edit • no drag • perfect size • sound 🔊</div>
    </div>
  </div>;
}
