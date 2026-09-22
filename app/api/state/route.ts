import { NextResponse } from "next/server";
let MEMORY:any=null;
export async function GET(){ return NextResponse.json(MEMORY||{}, {headers:{'Cache-Control':'no-store'}}); }
export async function POST(req:Request){ MEMORY=await req.json(); return NextResponse.json({ok:true}); }
