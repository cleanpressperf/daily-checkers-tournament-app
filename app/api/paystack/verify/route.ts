import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { reference, amount, coins } = await request.json()
    if (typeof reference !== 'string' || reference.length < 3 || reference.length > 200) {
      return NextResponse.json({ error: 'Invalid payment reference' }, { status: 400 })
    }

    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 500 })

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    })
    const data = await response.json()
    const payment = data.data
    const verifiedAmount = Number(payment?.amount)
    const metadataCoins = Number(payment?.metadata?.coins)
    const metadataGuestId = typeof payment?.metadata?.guestId === 'string' ? payment.metadata.guestId : ''
    const metadataEmail = typeof payment?.customer?.email === 'string' ? payment.customer.email : ''
    const requestedAmount = amount === undefined ? undefined : Number(amount)
    const requestedCoins = coins === undefined ? undefined : Number(coins)

    if (!response.ok || !data.status || payment?.status !== 'success' || !Number.isInteger(verifiedAmount)) {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 })
    }
    if (requestedAmount !== undefined && (!Number.isInteger(requestedAmount) || verifiedAmount !== requestedAmount * 100)) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }
    if (!Number.isInteger(metadataCoins) || metadataCoins <= 0 || (requestedCoins !== undefined && metadataCoins !== requestedCoins)) {
      return NextResponse.json({ error: 'Payment coins mismatch' }, { status: 400 })
    }

    const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (accessToken && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js')
      const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      const { data: userData } = await admin.auth.getUser(accessToken)
      if (userData.user) {
        const { data: wallet } = await admin.from('wallets').select('balance').eq('user_id', userData.user.id).maybeSingle()
        await admin.from('wallets').upsert({ user_id: userData.user.id, balance: Number(wallet?.balance ?? 0) + metadataCoins }, { onConflict: 'user_id' })
      }
    }

    if (!metadataGuestId || !metadataEmail) return NextResponse.json({ error: 'Payment identity missing' }, { status: 400 })
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: existing } = await admin.from('transactions').select('status,coins').eq('reference', reference).maybeSingle()
    if (!existing) {
      const { error: transactionError } = await admin.from('transactions').insert({ reference, guest_id: metadataGuestId, email: metadataEmail, amount: verifiedAmount, coins: metadataCoins, status: 'success' })
      if (transactionError) return NextResponse.json({ error: 'Could not record payment' }, { status: 500 })
      const { data: wallet } = await admin.from('guest_wallets').select('coins').eq('id', metadataGuestId).maybeSingle()
      const { error: walletError } = await admin.from('guest_wallets').upsert({ id: metadataGuestId, email: metadataEmail, coins: Number(wallet?.coins ?? 0) + metadataCoins, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      if (walletError) return NextResponse.json({ error: 'Could not credit wallet' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, coins: metadataCoins, reference })
  } catch (error) {
    console.error('[v0] Paystack verify error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
