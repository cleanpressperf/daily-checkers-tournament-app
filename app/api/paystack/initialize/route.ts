import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const amount = Number(body.amount)
    const coins = Number(body.coins)
    const secret = process.env.PAYSTACK_SECRET_KEY

    if (!email || !email.includes('@') || !Number.isInteger(amount) || amount <= 0 || !Number.isInteger(coins) || coins <= 0) {
      return NextResponse.json({ message: 'Invalid payment details' }, { status: 400 })
    }
    if (!secret) return NextResponse.json({ message: 'Payment service unavailable' }, { status: 500 })

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: 'NGN',
        callback_url: 'https://cleanpressperf.name.ng/buy-coins?verify=true',
        metadata: { coins },
      }),
      cache: 'no-store',
    })
    const data = await response.json()

    if (!response.ok || !data.status || !data.data?.authorization_url || !data.data?.reference) {
      return NextResponse.json({ message: data.message || 'Could not initialize payment' }, { status: 400 })
    }

    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference })
  } catch (error) {
    console.error('[v0] Paystack initialize error:', error)
    return NextResponse.json({ message: 'Could not initialize payment' }, { status: 400 })
  }
}
