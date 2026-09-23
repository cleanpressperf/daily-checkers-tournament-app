import { NextRequest, NextResponse } from "next/server";
let store:any = {}; // in-memory live matches, resets on deploy but ok for demo - use KV later
export async function POST(req:NextRequest){
  try{
    const body=await req.json();
    const tier=(body.tier||"bronze").toLowerCase();
    store[tier]= {...body, time:Date.now()};
    return NextResponse.json({ok:true});
  }catch(e){ return NextResponse.json({ok:false}, {status:500}); }
}
export async function GET(req:NextRequest){
  const { searchParams } = new URL(req.url);
  const tier=(searchParams.get("t")||"bronze").toLowerCase();
  const data=store[tier];
  if(!data) return NextResponse.json({live:false});
  // expire after 60 sec no update
  if(Date.now()-data.time>60000) return NextResponse.json({live:false});
  return NextResponse.json({live:true,...data});
}
