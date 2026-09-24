import { NextResponse } from "next/server";
// @ts-ignore
globalThis._liveStore = globalThis._liveStore || {};
// @ts-ignore
const LIVE: any = globalThis._liveStore;

function cleanTier(tier:string){
  const now=Date.now();
  if(!LIVE[tier]) LIVE[tier]={};
  for(const k in LIVE[tier]){
    const d=LIVE[tier][k];
    if(now - d.time > 35000 && d.status!=="WON"){
      delete LIVE[tier][k];
    }
  }
}

export async function GET(req:Request){
  const {searchParams}=new URL(req.url);
  const tier=(searchParams.get("t")||"bronze").toLowerCase();
  cleanTier(tier);
  const all = LIVE[tier] || {};
  const list = Object.values(all);
  return NextResponse.json({live: list.length>0, count: list.length, matches: all, list});
}

export async function POST(req:Request){
  const body=await req.json();
  const tier=(body.tier||"bronze").toLowerCase();
  cleanTier(tier);
  if(!LIVE[tier]) LIVE[tier]={};
  const now=Date.now();
  const me = body.me;
  const matchIdx = body.matchIdx?? -1;
  if(matchIdx>=0){
    for(const k in LIVE[tier]){
      const ex = LIVE[tier][k];
      if(ex.matchIdx===matchIdx && ex.me!==me && now-ex.time < 30000 && ex.status!=="WON" && body.status!=="WON"){
        return NextResponse.json({ok:false, error:"PAIR_TAKEN", current: ex.me, matchIdx});
      }
    }
  }
  LIVE[tier][me]={
    me: body.me,
    vs: body.vs,
    board: body.board,
    turn: body.turn,
    status: body.status,
    winner: body.winner||null,
    timer: body.timer||30,
    matchIdx: matchIdx,
    time: now
  };
  return NextResponse.json({ok:true, count: Object.keys(LIVE[tier]).length});
}
