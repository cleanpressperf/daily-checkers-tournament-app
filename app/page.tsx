"use client";
import { useState } from "react";

const BOT_NAMES_96 = [
  "Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints",
  "Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima",
  "Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
];

// STRICT SPLIT - NO NAME APPEARS IN MORE THAN ONE TOURNAMENT
const BRONZE_32 = BOT_NAMES_96.slice(0,32);
const SILVER_32 = BOT_NAMES_96.slice(32,64);
const GOLD_32 = BOT_NAMES_96.slice(64,96);

const TOURNAMENTS = [
  {
    id: "bronze",
    name: "BRONZE",
    sub: "Daily Hustle",
    entry: 50,
    prize: 500,
    color: "#cd7f32",
    watch: "/watch?t=bronze",
    players: "32/32",
    desc: "For starters • Quick win"
  },
  {
    id: "silver",
    name: "SILVER",
    sub: "Student Clout",
    entry: 100,
    prize: 1000,
    color: "#9ca3af",
    watch: "/watch?t=silver",
    players: "32/32",
    desc: "Most popular • Campus fav"
  },
  {
    id: "gold",
    name: "GOLD",
    sub: "Campus Boss",
    entry: 200,
    prize: 2500,
    color: "#facc15",
    watch: "/watch?t=gold",
    players: "32/32",
    desc: "Big brag • Status win"
  },
];

export default function Home() {
  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"#fff", padding:16}}>
      {/* HEADER */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
        <h1 style={{fontSize:20, fontWeight:900, letterSpacing:1}}>CHECKERS<span style={{color:"#facc15"}}>ARENA</span></h1>
        <a href="/buy" style={{background:"#fff", color:"#000", padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:800, textDecoration:"none"}}>💰 Buy Coins</a>
      </div>

      <div style={{background:"#111", border:"1px solid #222", borderRadius:12, padding:10, marginBottom:16, fontSize:12, textAlign:"center"}}>
        ◎ <span style={{color:"#22c55e"}}>LIVE NOW</span> • 3 Tournaments running 24/7 • Bots auto-filled • Tap eye to watch
      </div>

      {/* CARDS */}
      <div style={{display:"grid", gap:14, maxWidth:500, margin:"0 auto"}}>
        {TOURNAMENTS.map((t)=>(
          <div key={t.id} style={{background:"#ffffff", color:"#000", borderRadius:18, padding:14, borderLeft:`6px solid ${t.color}`}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:11, fontWeight:800, letterSpacing:1, color:t.color}}>{t.id.toUpperCase()} • {t.players} LIVE</div>
                <div style={{fontSize:18, fontWeight:900}}>{t.name} <span style={{fontSize:12, fontWeight:600, opacity:0.6}}>{t.sub}</span></div>
                <div style={{fontSize:11, opacity:0.6, marginTop:2}}>{t.desc}</div>
              </div>
              <a href={t.watch} style={{background:"#000", width:42, height:42, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:20}}>👁️</a>
            </div>

            <div style={{display:"flex", gap:8, marginTop:12}}>
              <div style={{flex:1, background:"#f5f5f5", borderRadius:10, padding:"8px 10px"}}>
                <div style={{fontSize:10, opacity:0.5}}>ENTRY</div>
                <div style={{fontWeight:900}}>{t.entry} coins</div>
                <div style={{fontSize:10}}>≈ ₦{t.entry}</div>
              </div>
              <div style={{flex:1, background:"#0a0a0a", color:"#fff", borderRadius:10, padding:"8px 10px"}}>
                <div style={{fontSize:10, opacity:0.6}}>WIN</div>
                <div style={{fontWeight:900, color:"#22c55e"}}>₦{t.prize.toLocaleString()}</div>
                <div style={{fontSize:10, color:"#22c55e"}}>Cash prize</div>
              </div>
            </div>

            <div style={{display:"flex", gap:8, marginTop:10}}>
              <a href={t.watch} style={{flex:1, background:"#eee", color:"#000", textAlign:"center", padding:"10px", borderRadius:10, fontSize:12, fontWeight:800, textDecoration:"none"}}>👁️ Watch Live</a>
              <a href="/buy" style={{flex:1.4, background:"#000", color:"#fff", textAlign:"center", padding:"10px", borderRadius:10, fontSize:12, fontWeight:800, textDecoration:"none"}}>Join with {t.entry} coins</a>
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center", fontSize:11, opacity:0.4, marginTop:20}}>
        18+ only • Practice free • Entry 50 = ₦50 • Rebuy allowed
      </div>
    </div>
  );
}
