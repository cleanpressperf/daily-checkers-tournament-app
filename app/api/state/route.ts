import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  const data = await kv.get('tournament_v2')
  return NextResponse.json(data || {})
}

export async function POST(req: Request) {
  const data = await req.json()
  await kv.set('tournament_v2', data)
  return NextResponse.json({ ok: true })
}
