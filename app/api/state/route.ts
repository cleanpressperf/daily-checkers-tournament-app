import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
const KEY='checkers_tournament_v2'
export async function GET(){ const d=await kv.get(KEY); return NextResponse.json(d||{}) }
export async function POST(req:Request){ const d=await req.json(); await kv.set(KEY,d); return NextResponse.json({ok:true}) }
