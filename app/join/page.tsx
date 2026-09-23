"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

const BOTS = {
  bronze: ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess"],
  silver: ["May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim Charles","Snoop Pearson","Bunk Moreland","Kima Greggs","Connie Corleone","Kay Adams","Apollonia Vitelli","Moe Greene","Hyman Roth","Cissy Saint","Kane Hamilton","Rob Volpe","Andre Wright","Walter White","Jesse Pinkman","Saul Goodman","Hank Schrader","Mike Ehrmantraut","Pablo Escobar","Javier Pena","Steve Murphy","Tommy Shelby Jr","John Watson"],
  gold: ["Sherlock Holmes","James Moriarty","Tony Soprano","Paulie Gualtieri","Silvio Dante","Christopher Moltisanti","Tony Montana","Manny Ribera","Nucky Thompson","Al Capone","Lucky Luciano","Bugsy Siegel","Meyer Lansky","Dutch Schultz","Arnold Rothstein","Frank Costello","Vito Genovese","Carlo Gambino","John Gotti","Sammy Gravano","Whitey Bulger","Ray Donovan","Mickey Donovan","Terry Donovan","Daryl Donovan","Bunchy Donovan","Sully Sullivan","James Donovan","Fitzgerald","Devereaux","Cousin Mickey","Zion"]
};

function JoinInner(){
  const p = useSearchParams();
  const router = useRouter();
  const tier = (p.get("t")||"bronze").toLowerCase() as "bronze"|"silver"|"gold";
  const entry = tier==="gold"?200:tier==="silver"?100:50;
  const prize = tier==="gold"?2500:tier==="silver"?1000:500;
  const [nick, setNick] = useState("");
  const [coins, setCoins] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(()=>{
    const c = parseInt(localStorage.getItem("user_coins")||"0");
    setCoins(c);
    if(c===0){ localStorage.setItem("user_coins","100"); setCoins(100); }
  },[]);

  const handleJoin = () => {
    if(!nick.trim()){ setMsg("Enter nickname"); return; }
    if(coins < entry){
      setMsg(`Insufficient coins - you need ${entry} coins for ${tier.toUpperCase()} (you have ${coins}).`);
      return;
    }
    const newCoins = coins - entry;
    localStorage.setItem("user_coins", newCoins.toString());
    const q = JSON.parse(localStorage.getItem(`queue_${tier}`)||"[]");
    if(q.length>=32){ setMsg("Tournament full 32/32 - watch live, slot opens soon"); return; }
    q.push({nickname: nick.trim(), time: Date.now(), entry});
    localStorage.setItem(`queue_${tier}`, JSON.stringify(q));
    const botList = BOTS[tier];
    const vs = botList[Math.floor(Math.random()*botList.length)];
    router.push(`/play?t=${tier}&me=${encodeURIComponent(nick.trim())}&vs=${encodeURIComponent(vs)}`);
  };

  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", padding:16, color:"#fff"}}>
      <div style={{maxWidth:400, margin:"0 auto"}}>
        <button onClick={()=>router.push("/")} style={{color:"#aaa", marginBottom:12, background:"none", border:"none"}}>← Back</button>
        <h1 style={{fontWeight:900, fontSize:22}}>Join {tier.toUpperCase()} <span style={{color:"#FFD700"}}>₦{prize}</span></h1>
        <div style={{background:"#1a1a1a", borderRadius:12, padding:12, marginTop:12, fontSize:13}}>
          <div>Entry: {entry} coins ≈ ₦{entry}</div>
          <div>Prize: ₦{prize}</div>
          <div>Your coins: {coins}</div>
        </div>
        <input value={nick} onChange={e=>setNick(e.target.value)} placeholder="Your nickname" style={{width:"100%", padding:14, borderRadius:12, marginTop:14, background:"#fff", color:"#000", border:"none"}} />
        {msg && <div style={{background: msg.includes("Insufficient")?"#ff0000":"#222", padding:10, borderRadius:10, marginTop:10, fontSize:13}}>{msg} {msg.includes("Insufficient") && <a href="/buy" style={{color:"#FFD700", textDecoration:"underline"}}>Buy Coins</a>}</div>}
        <button onClick={handleJoin} style={{width:"100%", marginTop:12, padding:16, background:"#fff", color:"#000", borderRadius:12, fontWeight:900}}>Join with {entry} coins → Play Now</button>
        <div style={{marginTop:10, textAlign:"center"}}><a href={`/watch?t=${tier}`} style={{color:"#aaa", fontSize:12, textDecoration:"none"}}>👁️ Watch Live instead</a></div>
      </div>
    </div>
  );
}
export default function JoinPage(){ return <Suspense fallback={<div style={{background:"#000", color:"#fff", minHeight:"100vh", padding:20}}>Loading...</div>}><JoinInner/></Suspense> }
