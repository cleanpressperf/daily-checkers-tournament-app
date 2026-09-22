"use client";
import { useEffect, useState, useRef } from "react";
const PLAYERS_96 = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"];
type Piece = 0|1|2|11|22; type Pos = {r:number,c:number};
const ROUND_NAMES = ["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"];
function getRandom32(){ return [...PLAYERS_96].sort(()=>0.5-Math.random()).slice(0,32); }
function newBoard():Piece[][]{ const b:Piece[][]=Array(10).fill(0).map(()=>Array(10).fill(0) as Piece[]); for(let r=0;r<4;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=1; for(let r=6;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===1) b[r][c]=2; return b; }

export default function WatchPage(){
  const [loaded,setLoaded]=useState(false); const [bracket,setBracket]=useState<string[]>([]); const [p1,setP1]=useState(""); const [p2,setP2]=useState(""); const [board,setBoard]=useState<Piece[][]>([]); const [turn,setTurn]=useState<1|2>(1); const [roundWinners,setRoundWinners]=useState<string[]>([]); const [roundIdx,setRoundIdx]=useState(0); const [matchInRound,setMatchInRound]=useState(0); const [champion,setChampion]=useState<string|null>(null);

  useEffect(()=>{
    const load = async()=>{
      const s = await fetch('/api/state').then(r=>r.json()).catch(()=>({})) as any;
      if(s && s.bracket?.length){
        setBracket(s.bracket); setP1(s.p1); setP2(s.p2); setBoard(s.board); setTurn(s.turn||1); setRoundIdx(s.roundIdx||0); setMatchInRound(s.matchInRound||0); setRoundWinners(s.roundWinners||[]); setChampion(s.champion||null); setLoaded(true); return;
      }
      // ONLY if KV is empty, create once
      const r32=getRandom32(); const nb=newBoard();
      const ns={bracket:r32,p1:r32[0],p2:r32[1],board:nb,turn:1,roundIdx:0,matchInRound:0,roundWinners:[],champion:null,time:Date.now()};
      await fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ns)});
      setBracket(r32); setP1(r32[0]); setP2(r32[1]); setBoard(nb); setLoaded(true);
    };
    load();
    // LIVE SYNC every 2 sec
    const poll=setInterval(async()=>{ const s=await fetch('/api/state').then(r=>r.json()).catch(()=>null) as any; if(s?.bracket?.length){ setBoard(s.board); setTurn(s.turn); setP1(s.p1); setP2(s.p2); setBracket(s.bracket); setRoundIdx(s.roundIdx||0); setMatchInRound(s.matchInRound||0); setRoundWinners(s.roundWinners||[]); setChampion(s.champion||null); } },2000);
    return()=>clearInterval(poll);
  },[]);

  if(!loaded) return <div style={{background:"#000",color:"#fff",padding:20}}>Loading live tournament...</div>;
  return <div style={{background:"#000",minHeight:"100vh",color:"#fff",padding:16}}><div style={{color:"#ff5555",fontSize:12}}>◎ LIVE · {ROUND_NAMES[roundIdx]} · Game {matchInRound+1}/{bracket.length/2} {champion?`· CHAMPION ${champion}`:''}</div><h1 style={{fontWeight:800}}>{p1} VS {p2}</h1><div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",width:360,aspectRatio:"1/1",border:"3px solid #5a3e2b",borderRadius:12,overflow:"hidden"}}>{board.map((row,r)=>row.map((cell,c)=><div key={`${r}-${c}`} style={{background:(r+c)%2===1?"#8b5a2b":"#f5deb3",display:"flex",alignItems:"center",justifyContent:"center"}}>{cell!==0&&<div style={{width:"70%",height:"70%",borderRadius:"50%",background:cell===1||cell===11?"#111":"#c00"}}/>}</div>))}</div><div style={{marginTop:10,fontSize:12}}>Winners: {roundWinners.join(", ")||"none yet"}</div><div style={{fontSize:10,opacity:0.5,marginTop:10}}>Same on all phones via KV</div></div>
}
