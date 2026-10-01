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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single()
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Supabase profile lookup error', profileError)
      return Response.json({ error: profileError.message }, { status: 500 })
    }

    const newCoins = Number(profile?.coins || 0) + purchasedCoins
    const { error } = await supabaseAdmin.from('profiles').update({ coins: newCoins }).eq('id', userId)
    if (error) {
      console.error('Supabase update error', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, newCoins, coins: newCoins, reference })
  } catch (error) {
    console.error('[v0] Paystack verify error', error)
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
