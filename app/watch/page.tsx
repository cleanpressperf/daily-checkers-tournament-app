"use client";
import { useEffect, useState } from "react";

export default function Watch(){
  const [s,setS]=useState<any>(null);
  const [announce,setAnnounce]=useState<any>(null);

  // PURE VIEWER - no local moves, only server moves
  useEffect(()=>{
    let mounted=true;
    const fetchState=async()=>{
      try{
        const d=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
        if(!mounted||!d?.bracket?.length) return;
        
        // handle announcements locally
        if(d.champion && !announce){
          setAnnounce({type:'champion', name:d.champion});
          setTimeout(()=>setAnnounce(null), 5000);
        } else if(d._showRoundWinners){
          setAnnounce({type:'round', names:d._showRoundWinners, roundName:d._nextRoundName});
          setTimeout(()=>setAnnounce(null), 5000);
        }
        
        setS(d);
      }catch{}
    };
    fetchState();
    const iv=setInterval(fetchState, 1000); // poll server every 1s - server is doing fast forward
    const onFocus=()=>fetchState();
    document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') fetchState(); });
    window.addEventListener('focus', onFocus);
    return()=>{ mounted=false; clearInterval(iv); window.removeEventListener('focus', onFocus); };
  },[]);

  if(!s) return <div style={{background:"#000",color:"#fff",padding:30, minHeight:"100vh"}}>Loading 24/7 LIVE...</div>;
  
  const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
  
  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:12,position:"relative"}}>
    {announce && <div style={{position:"fixed",inset:0,zIndex:9999,background:announce.type==='champion'?"radial-gradient(circle,#ffcc00,#ff6600)":"radial-gradient(circle,#222,#000)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20, animation:"fade 0.3s"}}>
      <div style={{fontSize:14,letterSpacing:3,opacity:0.7}}>{announce.type==='champion'?"🏆 CHAMPION 🏆":`✅ ROUND COMPLETE`}</div>
      <div style={{fontSize:announce.type==='champion'?42:28,fontWeight:900,margin:"20px 0"}}>{Array.isArray(announce.names)?announce.names.join(", "):announce.name}</div>
      <div style={{fontSize:16,opacity:0.8}}>{announce.type==='champion'?"New tournament starting":"Next: "+announce.roundName}</div>
    </div>}

    <div style={{color:"#ff3b3b",fontSize:11}}>◎ 24/7 INTL LIVE · {ROUND_NAMES[s.roundIdx]||"FINISHED"} · Game {s.matchInRound+1}/{Math.ceil(s.bracket.length/2)} · Server Driven</div>
    <h2 style={{margin:"8px 0",fontSize:17,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.p1} <span style={{color:"#888"}}>VS</span> {s.p2} <span style={{fontSize:11,color:s.turn===1?"#fff":"#f44"}}> {s.turn===1?s.p1:s.p2} to move</span></h2>

    <div style={{width:"100%",maxWidth:400,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(10, minmax(0,1fr))",gridTemplateRows:"repeat(10, minmax(0,1fr))"}}>
      {s.board?.map((row:any,r:number)=>row.map((cell:any,c:number)=>{
        const isLight=(r+c)%2===0;
        return <div key={r+"-"+c} style={{background:isLight?"#f5deb3":"#8b5a2b",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          {cell!==0&&<div style={{width:"72%",height:"72%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#c00",border:cell===11||cell===22?"2px solid gold":"1px solid rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"9px",color:"gold",fontWeight:900,lineHeight:1}}>{cell===11||cell===22?"♔":""}</span>
          </div>}
        </div>;
      }))}
    </div>

    <div style={{marginTop:10,background:"#111",border:"1px solid #333",borderRadius:8,padding:8}}>
      <div style={{fontSize:10,opacity:0.5}}>PROCEEDING TO {ROUND_NAMES[s.roundIdx+1]||"NEXT"} ({s.roundWinners?.length||0}/{Math.ceil((s.bracket?.length||32)/2)})</div>
      <div style={{fontSize:11,marginTop:4}}>{s.roundWinners?.length? s.roundWinners.map((n:string,i:number)=><span key={i} style={{background:"#222",padding:"2px 6px",borderRadius:4,margin:"2px",display:"inline-block"}}>{n}</span>): <span style={{opacity:0.3}}>—</span>}</div>
    </div>
    <div style={{fontSize:9,opacity:0.25,marginTop:8,textAlign:"center"}}>Pure viewer • no local moves • server fast-forwards 24/7 • king locked • no drag</div>
  </div>;
}
