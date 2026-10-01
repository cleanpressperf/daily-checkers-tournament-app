import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { reference, userId, coins } = await req.json()
    if (typeof reference !== 'string' || !reference.trim()) {
      return Response.json({ error: 'Payment reference is required' }, { status: 400 })
    }
    if (typeof userId !== 'string' || !userId.trim()) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      console.error('[v0] PAYSTACK_SECRET_KEY is not configured')
      return Response.json({ error: 'Payment verification unavailable' }, { status: 500 })
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
      cache: 'no-store',
    })
    const paystackData = await paystackRes.json()
    if (!paystackRes.ok || !paystackData.data || paystackData.data.status !== 'success') {
      return Response.json({ error: 'Payment not verified' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const serviceKey = serviceRoleKey || process.env.SUPABASE_SERVICE_KEY
    if (!url || !serviceKey) {
      console.warn('[v0] Supabase service role key is missing')
      return Response.json({ error: 'Database configuration unavailable' }, { status: 500 })
    }
    const supabaseAdmin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const purchasedCoins = Number(coins || paystackData.data.metadata?.coins || 100)
    if (!Number.isInteger(purchasedCoins) || purchasedCoins <= 0) {
      return Response.json({ error: 'Invalid coin amount' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '')
    if (!accessToken) return Response.json({ error: 'Authenticated session required' }, { status: 401 })
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    if (authError || authData.user?.id !== userId) {
      return Response.json({ error: 'Authenticated user does not match payment account' }, { status: 403 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .maybeSingle()
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Supabase profile lookup error', profileError)
      return Response.json({ error: profileError.message }, { status: 500 })
    }

    const newCoins = Number(profile?.coins || 0) + purchasedCoins
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ coins: newCoins })
      .eq('id', userId)
      .select('coins')
      .single()
    if (updateError || !updatedProfile) {
      console.error('[v0] Supabase profile coin update error', updateError)
      return Response.json({ error: updateError?.message || 'Profile was not found or could not be updated' }, { status: 500 })
    }

    return Response.json({ success: true, newCoins: updatedProfile.coins, coins: updatedProfile.coins, reference })
  } catch (error) {
    console.error('[v0] Paystack verify error', error)
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
