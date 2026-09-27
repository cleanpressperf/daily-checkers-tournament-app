import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { reference, amount, coins } = await request.json()
    if (typeof reference !== 'string' || !Number.isInteger(amount) || amount <= 0 || !Number.isInteger(coins) || coins <= 0) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 400 })
    }
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 500 })

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    })
    const data = await response.json()
    if (!response.ok || !data.status || data.data?.status !== 'success' || data.data?.amount !== amount * 100) {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 })
    }

    const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (accessToken && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js')
      const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      const { data: userData } = await admin.auth.getUser(accessToken)
      if (userData.user) {
        const { data: wallet } = await admin.from('wallets').select('balance').eq('user_id', userData.user.id).maybeSingle()
        await admin.from('wallets').upsert(
          { user_id: userData.user.id, balance: Number(wallet?.balance ?? 0) + coins },
          { onConflict: 'user_id' },
        )
      }
    }

    return NextResponse.json({ ok: true, coins, reference })
  } catch (err) {
    console.error('[v0] Paystack verify error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
