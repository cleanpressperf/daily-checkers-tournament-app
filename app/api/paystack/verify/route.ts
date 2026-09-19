import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const reference = body.reference
    const coins = body.coins

    if (!reference || !coins) {
      return Response.json({ success: false, error: 'Missing data' }, { status: 400 })
    }

    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      return Response.json({ success: false, error: 'PAYSTACK_SECRET_KEY not set in Vercel' }, { status: 500 })
    }

    // Verify with Paystack Live - only credit if money really entered
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store'
    })

    const verify = await verifyRes.json()

    if (!verify.status || verify.data?.status !== 'success') {
      return Response.json({ success: false, error: 'Paystack not confirmed' }, { status: 400 })
    }

    const email = verify.data.customer.email
    const naira = verify.data.amount / 100

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Prevent double credit
    const { data: exists } = await supabase.from('payments').select('id').eq('paystack_ref', reference).maybeSingle()
    if (exists) {
      return Response.json({ success: true, already: true })
    }

    await supabase.from('payments').insert({
      email: email,
      paystack_ref: reference,
      coins: coins,
      naira: naira
    })

    // Add coins to profiles
    const { data: prof } = await supabase.from('profiles').select('coins').eq('email', email).maybeSingle()
    if (prof) {
      await supabase.from('profiles').update({ coins: (prof.coins || 0) + coins }).eq('email', email)
      return Response.json({ success: true })
    }

    const { data: usr } = await supabase.from('users').select('coins').eq('email', email).maybeSingle()
    if (usr) {
      await supabase.from('users').update({ coins: (usr.coins || 0) + coins }).eq('email', email)
      return Response.json({ success: true })
    }

    return Response.json({ success: false, error: 'User not found' }, { status: 404 })

  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
