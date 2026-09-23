"use client";
import { useState } from "react";

const T = [
  {id:"bronze", name:"BRONZE", prize:500, entry:50, color:"#CD7F32", watch:"/watch?t=bronze", players:32},
  {id:"silver", name:"SILVER", prize:1000, entry:100, color:"#C0C0C0", watch:"/watch?t=silver", players:32},
  {id:"gold", name:"GOLD", prize:2500, entry:200, color:"#FFD700", watch:"/watch?t=gold", players:32},
];

export default function Home(){
  return (
    <div style={{padding:12, background:"#f2f2f2", minHeight:"100vh"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <h1 style={{fontWeight:900, fontSize:18}}>CHECKERS ARENA</h1>
        <div style={{background:"#000", color:"#fff", padding:"4px 10px", borderRadius:20, fontSize:12}}>Live 32/32</div>
      </div>

      {T.map(t=>(
        <div key={t.id} style={{background:"#fff", borderRadius:14, padding:12, marginBottom:12, borderLeft:`6px solid ${t.color}`}}>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:900, color:t.color}}>{t.name}</div>
              <div style={{fontSize:12, color:"#666"}}>Prize ₦{t.prize} • {t.players}/{t.players} Players</div>
            </div>
            <a href={t.watch} style={{background:"#eee", width:36, height:36, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none"}}>👁️</a>
          </div>
          
          <div style={{display:"flex", gap:8, marginTop:10}}>
            <a href={t.watch} style={{flex:1, background:"#eee", color:"#000", textAlign:"center", padding:"10px", borderRadius:10, fontSize:12, fontWeight:800, textDecoration:"none"}}>👁️ Watch Live</a>
            <a href={`/join?t=${t.id}`} style={{flex:1.4, background:"#000", color:"#fff", textAlign:"center", padding:"10px", borderRadius:10, fontSize:12, fontWeight:800, textDecoration:"none"}}>Join with {t.entry} coins</a>
          </div>
        </div>
      ))}
    </div>
  );
}
