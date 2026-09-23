"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PlayInner(){
  const p = useSearchParams();
  const router = useRouter();
  const tier = (p.get("t")||"bronze").toLowerCase();
  const me = p.get("me")||"You";
  const vs = p.get("vs")||"Bot";
  const entry = tier==="gold"?200:tier==="silver"?100:50;
  const [round, setRound] = useState("R32");
  const [timer, setTimer] = useState(4);
  const [warning, setWarning] = useState(false);
  const [turn, setTurn] = useState("bot");
  const [msg, setMsg] = useState(`Bot ${vs} plays first - ${round} Easy`);

  useEffect(()=>{
    if(turn==="bot"){
      const t = setTimeout(()=>{
        if(round==="R8"){
          setMsg(`🏆 ${vs} WINS - R8 UNBEATABLE BOT. Human ${me} must lose. Coin lost.`);
          const q = JSON.parse(localStorage.getItem(`queue_${tier}`)||"[]");
          const newQ = q.filter((x:any)=>x.nickname!==me);
          localStorage.setItem(`queue_${tier}`, JSON.stringify(newQ));
          setTimeout(()=> router.push(`/?t=${tier}`), 3000);
          return;
        }
        setTurn("human"); setTimer(4); setWarning(false);
        setMsg(`Your turn ${me} - 4s`);
      }, 1000);
      return ()=> clearTimeout(t);
    }
  },[turn, round]);

  useEffect(()=>{
    if(turn!=="human") return;
    const iv = setInterval(()=>{
      setTimer(t=>{
        if(t>1) return t-1;
        if(!warning){ setWarning(true); setMsg("⚠️ 4 SEC WARNING - Move or DQ + coin lost"); return 4; }
        else {
          setMsg(`❌ DQ - No move 4+4s. ${me} loses ${entry} coins. NEXT player up.`);
          const q = JSON.parse(localStorage.getItem(`queue_${tier}`)||"[]");
          const newQ = q.filter((x:any)=>x.nickname!==me);
          localStorage.setItem(`queue_${tier}`, JSON.stringify(newQ));
          clearInterval(iv);
          setTimeout(()=> router.push(`/?t=${tier}`), 2000);
          return 0;
        }
      });
    },1000);
    return ()=> clearInterval(iv);
  },[turn, warning]);

  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", padding:12, color:"#fff"}}>
      <div style={{background: warning?"#ff0000":"#1a1a1a", padding:12, borderRadius:12, textAlign:"center"}}>
        <div style={{fontSize:11}}>{turn==="human"?"YOUR TIME":"BOT TIME"} • {round} {round==="R32"?"Easy":round==="R16"?"Medium":"UNBEATABLE"}</div>
        <div style={{fontSize:28, fontWeight:900}}>{turn==="human"?`${timer}s`:"●●●"}</div>
        <div style={{fontSize:11}}>{msg}</div>
      </div>
      <div style={{background:"#fff", color:"#000", borderRadius:12, padding:12, marginTop:12, display:"flex", justifyContent:"space-between"}}>
        <div><b>{vs}</b><div style={{fontSize:11}}>BLACK - Bot First</div></div>
        <div>VS</div>
        <div style={{textAlign:"right"}}><b>{me}</b><div style={{fontSize:11}}>WHITE - You</div></div>
      </div>
      <button onClick={()=>{
        if(turn!=="human") return;
        if(round==="R32"){ setRound("R16"); setTurn("bot"); setMsg(`R16 - Medium bots - ${vs} plays first`); }
        else if(round==="R16"){ setRound("R8"); setTurn("bot"); setMsg(`R8 - UNBEATABLE - ${vs} plays first, you must lose`); }
        else { setTurn("bot"); }
      }} style={{width:"100%", marginTop:14, padding:16, background:turn==="human"?"#22c55e":"#333", borderRadius:12, fontWeight:900}}>
        {turn==="human"?`MAKE MOVE (${timer}s)`:"Bot Playing First..."}
      </button>
    </div>
  );
}
export default function PlayPage(){ return <Suspense fallback={<div style={{background:"#000", color:"#fff", minHeight:"100vh", padding:20}}>Loading play...</div>}><PlayInner/></Suspense> }
