"use client";

const TIERS = [
  { id:"bronze", label:"BRONZE", sub:"Daily Hustle", desc:"For starters • Quick win", entry:50, prize:500, color:"#C68642", light:"#FFF8F0", tag:"BRONZE • 32/32 LIVE" },
  { id:"silver", label:"SILVER", sub:"Student Clout", desc:"Most popular • Campus fav", entry:100, prize:1000, color:"#9CA3AF", light:"#F9FAFB", tag:"SILVER • 32/32 LIVE" },
  { id:"gold", label:"GOLD", sub:"Ballers Den", desc:"High stakes • Big win", entry:200, prize:2500, color:"#EAB308", light:"#FFFBEB", tag:"GOLD • 32/32 LIVE" },
];

export default function Home() {
  return (
    <div style={{background:"#0f0f0f", minHeight:"100vh", paddingBottom:30}}>
      {/* Top Bar */}
      <div style={{background:"#000", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #222"}}>
        <div style={{fontSize:20}}>☰</div>
        <div style={{color:"#FFD700", fontWeight:900, letterSpacing:2, fontSize:14}}>CHECKERS 10×10</div>
        <div style={{width:20}}></div>
      </div>

      <div style={{padding:16}}>
        {/* Header */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
          <h1 style={{fontWeight:900, fontSize:22, color:"#fff", letterSpacing:0.5}}>CHECKERS<span style={{color:"#FFD700"}}>ARENA</span></h1>
          <a href="/buy" style={{background:"#fff", color:"#000", padding:"8px 16px", borderRadius:20, fontSize:13, fontWeight:800, textDecoration:"none", display:"flex", alignItems:"center", gap:6}}>💰 Buy Coins</a>
        </div>

        {/* Live Banner */}
        <div style={{background:"#1c1c1c", border:"1px solid #2a2a2a", borderRadius:14, padding:"12px 14px", textAlign:"center", color:"#aaa", fontSize:12, marginBottom:16, lineHeight:"18px"}}>
          <span style={{color:"#fff"}}>◉</span> <span style={{color:"#22c55e"}}>LIVE NOW</span> • 3 Tournaments running 24/7 • Bots auto-filled • Tap eye to watch
        </div>

        {TIERS.map(t=>(
          <div key={t.id} style={{background:"#fff", borderRadius:20, padding:14, marginBottom:14, borderLeft:`6px solid ${t.color}`, position:"relative"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:11, fontWeight:800, color:t.color, letterSpacing:1}}>{t.tag}</div>
                <div style={{fontSize:20, fontWeight:900, color:"#000", marginTop:2}}>{t.label} <span style={{fontSize:13, fontWeight:500, color:"#555"}}>{t.sub}</span></div>
                <div style={{fontSize:12, color:"#888", marginTop:2}}>{t.desc}</div>
              </div>
              <a href={`/watch?t=${t.id}`} style={{background:"#000", width:38, height:38, borderRadius:19, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none"}}>👁️</a>
            </div>

            <div style={{display:"flex", gap:10, marginTop:12}}>
              <div style={{flex:1, background:"#f3f3f3", borderRadius:12, padding:"10px 12px"}}>
                <div style={{fontSize:10, color:"#999"}}>ENTRY</div>
                <div style={{fontSize:18, fontWeight:900, color:"#000"}}>{t.entry} coins</div>
                <div style={{fontSize:11, color:"#777"}}>≈ ₦{t.entry}</div>
              </div>
              <div style={{flex:1, background:"#000", borderRadius:12, padding:"10px 12px"}}>
                <div style={{fontSize:10, color:"#aaa"}}>WIN</div>
                <div style={{fontSize:18, fontWeight:900, color:"#22c55e"}}>₦{t.prize.toLocaleString()}</div>
                <div style={{fontSize:11, color:"#22c55e"}}>Cash prize</div>
              </div>
            </div>

            <div style={{display:"flex", gap:10, marginTop:12}}>
              <a href={`/watch?t=${t.id}`} style={{flex:1, background:"#eeeeee", color:"#000", textAlign:"center", padding:"13px", borderRadius:12, fontSize:13, fontWeight:800, textDecoration:"none"}}>👁️ Watch Live</a>
              <a href={`/join?t=${t.id}`} style={{flex:1.2, background:"#000", color:"#fff", textAlign:"center", padding:"13px", borderRadius:12, fontSize:13, fontWeight:800, textDecoration:"none"}}>Join with {t.entry} coins</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
