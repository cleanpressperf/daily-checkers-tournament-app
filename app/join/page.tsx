"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const TIERS: any = {
  bronze: { name:"BRONZE", entry:50, prize:500, botNames: ["Tunde","Emeka","Chinedu","Musa","Ibrahim","Uche","Obi","Femi","Sola","Dayo","Kunle","Segun","Bayo","Wale","Tope","Lekan","Nnamdi","Chidi","Ojo","Ade","Bola","Tobi","Seyi","Yemi","Kola","Dele","Bimbo","Tayo","Fola","Jide","Akin","Lola"] },
  silver: { name:"SILVER", entry:100, prize:1000, botNames: ["James","David","John","Mike","Chris","Alex","Daniel","Peter","Paul","Mark","Luke","Matt","Steve","Brian","Kevin","Jason","Ryan","Eric","Adam","Frank","Henry","George","Samuel","Victor","Albert","Philip","Thomas","Joseph","Edward","Charles","Robert","Richard"] },
  gold: { name:"GOLD", entry:200, prize:2500, botNames: ["Zain","Amir","Khalid","Omar","Ali","Hassan","Yusuf","Ibrahim","Rashid","Farid","Tariq","Nasir","Jamal","Karim","Bilal","Idris","Hamza","Mustafa","Suleiman","Amin","Zubair","Faisal","Nabil","Hakim","Salim","Rafiq","Aziz","Malik","Qasim","Adil","Latif","Anwar"] }
};

function JoinInner(){
  const params = useSearchParams();
  const router = useRouter();
  const tId = (params.get("t")||"bronze").toLowerCase();
  const tier = TIERS[tId] || TIERS.bronze;

  const [coins, setCoins] = useState(0);
  const [nick, setNick] = useState("");
  const [showNickPopup, setShowNickPopup] = useState(false);
  const [queuePos, setQueuePos] = useState<number|null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(()=>{
    const c = parseInt(localStorage.getItem("coins")||"0");
    setCoins(c);
    const savedNick = localStorage.getItem("playerNickname");
    if(savedNick) setNick(savedNick);
    const round = localStorage.getItem(`round_${tId}`) || "R32";
    let queue: any[] = JSON.parse(localStorage.getItem(`queue_${tId}`)||"[]");
    if(c < tier.entry){
      router.replace(`/buy?t=${tId}&msg=insufficient&need=${tier.entry}`);
      return;
    }
    if(!savedNick){ setShowNickPopup(true); } else { handleJoin(savedNick, queue, round); }
  },[]);

  const handleJoin = (nickname: string, existingQueue?: any[], currentRound?: string) => {
    const queueKey = `queue_${tId}`;
    const round = currentRound || localStorage.getItem(`round_${tId}`) || "R32";
    let queue: any[] = existingQueue || JSON.parse(localStorage.getItem(queueKey)||"[]");
    if(queue.length >= 32){
      const nextKey = `next_queue_${tId}`;
      let nextQ = JSON.parse(localStorage.getItem(nextKey)||"[]");
      if(nextQ.length < 32){
        const newCoins = coins - tier.entry;
        localStorage.setItem("coins", String(newCoins));
        nextQ.push({nickname, time:Date.now(), expires:3});
        localStorage.setItem(nextKey, JSON.stringify(nextQ));
        setStatusMsg(`Tournament full (32/32). You are Player #${nextQ.length} in NEXT tournament. Visit Watch Live to track. Coin deducted.`);
        setQueuePos(nextQ.length);
      } else { setStatusMsg("Both current and next tournament full. Please wait."); }
      return;
    }
    const newCoins = coins - tier.entry;
    localStorage.setItem("coins", String(newCoins));
    setCoins(newCoins);
    localStorage.setItem("playerNickname", nickname);
    queue.push({nickname, time:Date.now(), isHuman:true, roundJoined:round});
    queue.sort((a,b)=>a.time-b.time);
    localStorage.setItem(queueKey, JSON.stringify(queue));
    const pos = queue.findIndex((p:any)=>p.nickname===nickname)+1;
    setQueuePos(pos);
    if(round === "R32"){
      const botName = tier.botNames[Math.floor(Math.random()*tier.botNames.length)];
      setStatusMsg(`You are Player #${pos} of 32. You are NEXT vs ${botName}. Watch Live will auto-start you when current match ends.`);
      setTimeout(()=> router.push(`/watch?t=${tId}&next=1&me=${nickname}&vs=${botName}&r=R32`), 2000);
    } else {
      setStatusMsg(`Coin deducted. Current round is ${round}, not R32. Come back when this tournament ends. You are secured as Player #${pos} for next R32. Visit Watch Live to track. Expires in 3 tournaments.`);
    }
  };

  const submitNick = () => {
    if(!nick.trim() || nick.length < 3){ alert("Enter at least 3 letters"); return; }
    if(tier.botNames.includes(nick.trim())){ alert("Name already taken, choose another"); return; }
    setShowNickPopup(false);
    handleJoin(nick.trim());
  };

  return (
    <div style={{padding:20, background:"#f5f5f5", minHeight:"100vh"}}>
      <h2 style={{fontWeight:900}}>Join {tier.name} - {tier.entry} coins</h2>
      <p>Coins: {coins}</p>
      {queuePos && <div style={{marginTop:12, padding:12, background:"#fff", borderRadius:10, fontWeight:800}}>You are Player #{queuePos} of 32</div>}
      {statusMsg && <div style={{marginTop:12, padding:14, background:"#000", color:"#fff", borderRadius:12, lineHeight:"18px"}}>{statusMsg}</div>}
      {showNickPopup && (
        <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <div style={{background:"#fff", padding:20, borderRadius:14, width:"90%", maxWidth:340}}>
            <div style={{fontWeight:900, fontSize:16}}>Enter Nickname (once)</div>
            <div style={{fontSize:12, color:"#666", marginTop:4}}>Saved for next time</div>
            <input value={nick} onChange={e=>setNick(e.target.value)} placeholder="e.g. Chinedu" style={{width:"100%", marginTop:12, padding:12, borderRadius:10, border:"1px solid #ccc"}}/>
            <button onClick={submitNick} style={{width:"100%", marginTop:10, padding:12, background:"#000", color:"#fff", borderRadius:10, fontWeight:900}}>Confirm & Join</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoinPage(){
  return <Suspense fallback={<div style={{padding:20}}>Loading...</div>}><JoinInner/></Suspense>
}
