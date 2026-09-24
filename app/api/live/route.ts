import { NextResponse } from "next/server";
// @ts-ignore
globalThis._liveStore = globalThis._liveStore || {};
// @ts-ignore
const LIVE = globalThis._liveStore;

export async function GET(req:Request){
  const {searchParams}=new URL(req.url);
  const tier=(searchParams.get("t")||"bronze").toLowerCase();
  const data=LIVE[tier]||null;
  if(data && Date.now()-data.time > 35000 && data.status!=="WON"){
    delete LIVE[tier];
    return NextResponse.json(null);
  }
  return NextResponse.json(data||null);
}

export async function POST(req:Request){
  const body=await req.json();
  const tier=(body.tier||"bronze").toLowerCase();
  const now=Date.now();
  const existing=LIVE[tier];
  if(existing && existing.me!== body.me && now-existing.time < 30000 && existing.status!=="WON" && body.status!=="WON"){
    return NextResponse.json({ok:false, error:"ANOTHER_HUMAN_PLAYING", current: existing.me});
  }
  LIVE[tier]={
    me: body.me,
    vs: body.vs,
    board: body.board,
    turn: body.turn,
    status: body.status,
    winner: body.winner||null,
    timer: body.timer||30,
    time: now
  };
  return NextResponse.json({ok:true});
}
