import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { reference, amount, coins } = await request.json()
    if (typeof reference !== 'string' || !Number.isInteger(amount) || amount <= 0 || !Number.isInteger(coins) || coins <= 0) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 400 })
    }
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 500 })
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
    })
    const data = await response.json()
    if (!response.ok || !data.status || data.data?.status !== 'success' || data.data?.amount !== amount * 100) {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 })
    }
    return NextResponse.json({ ok: true, amount, coins })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
