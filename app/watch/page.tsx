"use client";
import { useEffect, useState, useRef } from "react";
const ROUND_NAMES=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
function playSound(type:'move'|'capture'|'chain'|'win'|'round'){ try{ const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); if(type==='move'){ o.frequency.value=420; g.gain.value=0.2; o.start(); setTimeout(()=>{o.frequency.value=680;},80); o.stop(ctx.currentTime+0.18); } else if(type==='capture'){ o.frequency.value=200; g.gain.value=0.4; o.start(); o.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+0.15); o.stop(ctx.currentTime+0.25); } else if(type==='chain'){ o.frequency.value=800; g.gain.value=0.3; o.start(); o.stop(ctx.currentTime+0.12); } else if(type==='round'){ o.frequency.value=500; g.gain.value=0.5; o.start(); o.frequency.linearRampToValueAtTime(1000,ctx.currentTime+0.5); o.stop(ctx.currentTime+0.6); } else { o.frequency.value=300; g.gain.value=0.6; o.start(); o.frequency.linearRampToValueAtTime(1200,ctx.currentTime+0.8); o.stop(ctx.currentTime+1); } }catch{} }
function speak(t:string){ try{ if('speechSynthesis' in window){ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.rate=0.9; speechSynthesis.speak(u);} }catch{} }

export default function Watch(){
  const [s,setS]=useState<any>(null);
  const [announce,setAnnounce]=useState<any>(null);
  const prevBoardRef=useRef<string>("");
  const countdownRef=useRef<any>(null);

  useEffect(()=>{
    let mounted=true;
    let lastP1="", lastP2="";
    const fetchState=async()=>{
      try{
        const d=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
        if(!mounted||!d?.bracket?.length) return;

        // sound on change
        const boardStr=JSON.stringify(d.board);
        if(prevBoardRef.current && prevBoardRef.current!==boardStr){
          if(d.chain) playSound('chain');
          else {
            // detect capture vs move by piece count
            const prevCount=(prevBoardRef.current.match(/1|2/g)||[]).length;
            const curCount=boardStr.split(/[12]/).length;
            playSound(prevCount>curCount? 'capture':'move');
          }
        }
        prevBoardRef.current=boardStr;

        if(d.p1!==lastP1 || d.p2!==lastP2){
          if(lastP1) { playSound('win'); }
          lastP1=d.p1; lastP2=d.p2;
        }

        if(d.roundWinners && d.roundWinners.length>0 && s && d.roundWinners.length> s.roundWinners.length){
          // new winner added handled by server, no client logic
        }

        setS(d);
      }catch{}
    };
    fetchState();
    const iv=setInterval(()=>{ if(document.visibilityState==='visible') fetchState(); }, 1000);
    const onVisible=async()=>{
      if(document.visibilityState==='visible'){
        // INSTANT SNAP - no queue, no drag
        const d=await fetch('/api/state?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
        if(d?.bracket?.length && mounted) { prevBoardRef.current=JSON.stringify(d.board); setS(d); }
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return()=>{ mounted=false; clearInterval(iv); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', onVisible); };
  },[]);

  useEffect(()=>{
    if(!announce) return;
    countdownRef.current=setInterval(()=>{ setAnnounce((a:any)=>{ if(!a) return null; if(a.countdown<=1){ clearInterval(countdownRef.current); return null; } return {...a,countdown:a.countdown-1}; }); },1000);
    return()=>clearInterval(countdownRef.current);
  },[announce?.type]);

  if(!s) return <div style={{background:"#000",color:"#fff",padding:30, minHeight:"100vh"}}>Loading 24/7 LIVE...</div>;

  return <div style={{background:"#000",color:"#fff",minHeight:"100vh",padding:12,position:"relative"}}>
    {announce && <div style={{position:"fixed",inset:0,zIndex:9999,background:announce.type==='champion'?"radial-gradient(circle,#ffcc00,#ff6600)":"radial-gradient(circle,#222,#000)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20}}>
      <div style={{fontSize:42,fontWeight:900}}>{announce.names.join(", ")}</div>
    </div>}

    <div style={{color:"#ff3b3b",fontSize:11}}>◎ 24/7 INTL LIVE · {ROUND_NAMES[s.roundIdx]||"FINISHED"} · Game {s.matchInRound+1}/{Math.ceil(s.bracket.length/2)} · SERVER ONLY 🔊</div>
    <h2 style={{margin:"8px 0",fontSize:18,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.p1} <span style={{color:"#888"}}>VS</span> {s.p2} <span style={{fontSize:11,color:s.turn===1?"#fff":"#f44"}}> {s.turn===1?s.p1:s.p2} to move</span></h2>

    <div style={{width:"100%",maxWidth:400,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(10, minmax(0,1fr))",gridTemplateRows:"repeat(10, minmax(0,1fr))"}}>
      {s.board?.map((row:any,r:number)=>row.map((cell:any,c:number)=>{
        const isLight=(r+c)%2===0;
        return <div key={r+"-"+c} style={{background:isLight?"#f5deb3":"#8b5a2b",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          {cell!==0&&<div style={{width:"72%",height:"72%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#c00",border:cell===11||cell===22?"2px solid gold":"1px solid rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"9px",color:"gold",fontWeight:900}}>{cell===11||cell===22?"♔":""}</span>
          </div>}
        </div>;
      }))}
    </div>

    <div style={{marginTop:10,background:"#111",border:"1px solid #333",borderRadius:8,padding:8}}>
      <div style={{fontSize:10,opacity:0.5}}>PROCEEDING TO {ROUND_NAMES[s.roundIdx+1]||"NEXT"} ({s.roundWinners?.length||0}/{Math.ceil((s.bracket?.length||32)/2)})</div>
      <div style={{fontSize:11,marginTop:4}}>{s.roundWinners?.length? s.roundWinners.map((n:string,i:number)=><span key={i} style={{background:"#222",padding:"2px 6px",borderRadius:4,margin:"2px",display:"inline-block"}}>{n}</span>): <span style={{opacity:0.3}}>—</span>}</div>
    </div>
    <div style={{fontSize:9,opacity:0.25,marginTop:8,textAlign:"center"}}>Server moves only • 1 step per 4s • worldwide same • no drag • sound 🔊 • king locked</div>
  </div>;
}
