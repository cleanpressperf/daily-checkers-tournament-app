import { NextResponse } from 'next/server'
import { createServerSupabaseClient, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { reference, amount, coins, guestId } = await request.json()
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
    const verifiedGuestId = metadataGuestId || (typeof guestId === 'string' ? guestId : '')
    const metadataEmail = typeof payment?.customer?.email === 'string' ? payment.customer.email : ''
    const verifiedEmail = metadataEmail || (verifiedGuestId ? `player-${verifiedGuestId}@cleanpressperf.name.ng` : '')
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

    console.log('ENV CHECK', !!process.env.NEXT_PUBLIC_SUPABASE_URL, !!process.env.SUPABASE_SERVICE_ROLE_KEY, !!process.env.SUPABASE_SERVICE_KEY)

    const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!verifiedGuestId || !verifiedEmail) return NextResponse.json({ success: false, error: 'Payment identity missing' }, { status: 400 })
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[v0] Using Supabase anon fallback for guest wallet credit.', {
        hasUrl: Boolean(SUPABASE_URL),
        hasServiceRole: Boolean(SUPABASE_SERVICE_ROLE_KEY),
        hasAnonFallback: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      })
    }

    const admin = createServerSupabaseClient()
    if (accessToken) {
      const { data: userData } = await admin.auth.getUser(accessToken)
      if (userData.user) {
        const { data: wallet } = await admin.from('wallets').select('balance').eq('user_id', userData.user.id).maybeSingle()
        const { error: userWalletError } = await admin.from('wallets').upsert(
          { user_id: userData.user.id, balance: Number(wallet?.balance ?? 0) + metadataCoins },
          { onConflict: 'user_id' },
        )
        if (userWalletError) return NextResponse.json({ error: 'Could not credit wallet' }, { status: 500 })
      }
    }

    const { data: existing, error: transactionLookupError } = await admin
      .from('transactions')
      .select('status,coins')
      .eq('reference', reference)
      .maybeSingle()
    if (transactionLookupError) return NextResponse.json({ error: 'Could not check payment record' }, { status: 500 })

    if (!existing) {
      const { error: transactionError } = await admin.from('transactions').insert({
        reference,
        guest_id: verifiedGuestId,
        email: verifiedEmail,
        amount: verifiedAmount,
        coins: metadataCoins,
        status: 'success',
      })
      if (transactionError) return NextResponse.json({ error: 'Could not record payment' }, { status: 500 })

      const { data: wallet } = await admin.from('guest_wallets').select('coins').eq('id', verifiedGuestId).maybeSingle()
      const nextBalance = Number(wallet?.coins ?? 0) + metadataCoins
      const { error: walletError } = await admin.from('guest_wallets').upsert(
        { id: verifiedGuestId, email: verifiedEmail, coins: nextBalance, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      )
      if (walletError) return NextResponse.json({ error: 'Could not credit wallet' }, { status: 500 })

      const { data: confirmedWallet, error: confirmationError } = await admin
        .from('guest_wallets')
        .select('coins')
        .eq('id', verifiedGuestId)
        .single()
      if (confirmationError || !confirmedWallet) return NextResponse.json({ error: 'Could not confirm wallet credit' }, { status: 500 })
      return NextResponse.json({ success: true, ok: true, coins: confirmedWallet.coins, reference })
    }

    return NextResponse.json({ success: true, ok: true, coins: metadataCoins, reference })
  } catch (error) {
    console.error('[v0] Paystack verify error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
