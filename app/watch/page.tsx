"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const BOT_NAMES_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints",
  "Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima",
  "Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

export default function WatchPage(){
  const sp = useSearchParams();
  const t = (sp.get("t") || "bronze").toLowerCase();

  // FIXED SPLIT - NO REPEAT
  const bronzePlayers = BOT_NAMES_96.slice(0,32);
  const silverPlayers = BOT_NAMES_96.slice(32,64);
  const goldPlayers = BOT_NAMES_96.slice(64,96);

  const players = t==="silver"? silverPlayers : t==="gold"? goldPlayers : bronzePlayers;
  const config = t==="silver"? {name:"SILVER", entry:100, prize:1000, color:"#9ca3af"} : t==="gold"? {name:"GOLD", entry:200, prize:2500, color:"#facc15"} : {name:"BRONZE", entry:50, prize:500, color:"#cd7f32"};

  useEffect(()=>{
    const play = () => {
      try{
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 440; g.gain.setValueAtTime(0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+1.1);
        o.start(); o.stop(ctx.currentTime+1.1);
      }catch{}
    };
    window.addEventListener("click", play, {once:true});
    return ()=> window.removeEventListener("click", play);
  },[t]);

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"#fff", padding:12}}>
      <div style={{maxWidth:900, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <a href="/" style={{color:"#fff", textDecoration:"none", fontSize:12}}>← Home</a>
          <div style={{fontSize:11, fontWeight:900, border:`2px solid ${config.color}`, padding:"4px 10px", borderRadius:20}}>{config.name} • 32 UNIQUE • ₦{config.prize}</div>
          <a href="/boardroom" style={{background:"#fff", color:"#000", padding:"6px 12px", borderRadius:20, fontSize:11, fontWeight:800, textDecoration:"none"}}>Boardroom</a>
        </div>

        <h2 style={{textAlign:"center", marginTop:14, fontWeight:900}}>{config.name} LIVE • Entry {config.entry} coins • Win ₦{config.prize}</h2>

        {/* Immaculate white board */}
        <div style={{background:"#fff", borderRadius:14, padding:8, marginTop:12, display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:2, maxWidth:380, margin:"12px auto"}}>
          {Array.from({length:64}).map((_,i)=><div key={i} style={{aspectRatio:"1", background:(Math.floor(i/8)+i)%2===0?"#f3f3f3":"#111", borderRadius:3}}/>)}
        </div>

        <div style={{background:"#111", borderRadius:12, padding:10, marginTop:12}}>
          <div style={{fontSize:11, opacity:0.6, marginBottom:8, fontWeight:800}}>THIS TOURNAMENT ONLY - {players.length} PLAYERS (will never appear in other 2):</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
            {players.map((p,i)=><div key={i} style={{background:"#1c1c1c", padding:"7px 8px", borderRadius:8, fontSize:12}}>{i+1}. {p}</div>)}
          </div>
        </div>

        <div style={{textAlign:"center", fontSize:10, opacity:0.4, marginTop:10}}>Bronze = 1-32 (Marlo to Jerome) • Silver = 33-64 (Louie to Kima) • Gold = 65-96 (Cheese to Kevin) • No repeat • Tap to hear fade</div>
      </div>
    </div>
  );
}
