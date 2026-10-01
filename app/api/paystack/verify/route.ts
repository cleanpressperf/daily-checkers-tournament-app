import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { reference } = await req.json()
    if (typeof reference !== 'string' || !reference.trim()) {
      console.warn('[v0] Paystack verify called without a reference')
      return Response.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      console.error('[v0] PAYSTACK_SECRET_KEY is not configured')
      return Response.json({ error: 'Payment verification unavailable' }, { status: 500 })
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
      cache: 'no-store',
    })
    const paystackData = await paystackRes.json()
    const transaction = paystackData?.data
    if (!paystackRes.ok || !transaction || transaction.status !== 'success') {
      return Response.json({ error: 'Payment not verified' }, { status: 400 })
    }

    const email = String(transaction.customer?.email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Verified payment email is missing' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceRoleKey) {
      console.error('[v0] Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing')
      return Response.json({ error: 'Database configuration unavailable' }, { status: 500 })
    }
    const supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const authHeader = req.headers.get('authorization')
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '')
    if (accessToken) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
      const authEmail = authData.user?.email?.trim().toLowerCase()
      if (authError || !authEmail || authEmail !== email) {
        return Response.json({ error: 'Payment email does not match the signed-in account' }, { status: 403 })
      }
    }

    const purchasedCoins = Number(transaction.metadata?.coins || 0)
    if (!Number.isInteger(purchasedCoins) || purchasedCoins <= 0) {
      return Response.json({ error: 'Invalid coin amount in verified transaction' }, { status: 400 })
    }

    const { data: profile, error: profileReadError } = await supabaseAdmin
      .from('profiles')
      .select('coins')
      .eq('email', email)
      .maybeSingle()
    if (profileReadError) return Response.json({ error: profileReadError.message }, { status: 500 })
    if (!profile) return Response.json({ error: `No profiles row found for ${email}` }, { status: 404 })

    const nextCoins = Number(profile.coins || 0) + purchasedCoins
    const { data: updatedProfile, error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ coins: nextCoins })
      .eq('email', email)
      .select('email, coins')
      .single()
    if (profileUpdateError || !updatedProfile) {
      throw new Error(profileUpdateError?.message || 'profiles update affected 0 rows')
    }

    const { data: guestWallet, error: guestReadError } = await supabaseAdmin
      .from('guest_wallets')
      .select('coins')
      .eq('email', email)
      .maybeSingle()
    if (guestReadError) return Response.json({ error: guestReadError.message }, { status: 500 })
    if (!guestWallet) return Response.json({ error: `No guest_wallets row found for ${email}` }, { status: 404 })

    const guestNextCoins = Number(guestWallet.coins || 0) + purchasedCoins
    const { data: updatedGuestWallet, error: guestUpdateError } = await supabaseAdmin
      .from('guest_wallets')
      .update({ coins: guestNextCoins })
      .eq('email', email)
      .select('email, coins')
      .single()
    if (guestUpdateError || !updatedGuestWallet) {
      throw new Error(guestUpdateError?.message || 'guest_wallets update affected 0 rows')
    }

    return Response.json({ success: true, email, coins: updatedProfile.coins, guestCoins: updatedGuestWallet.coins, reference })
  } catch (error) {
    console.error('[v0] Paystack verify error', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 500 })
  }
}
