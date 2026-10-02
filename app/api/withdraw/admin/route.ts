import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const ADMIN = 'rneg0519@gmail.com'
const admin = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

export async function POST(request: Request) {
  try {
    const { id, action, admin_email } = await request.json()
    if (admin_email !== ADMIN || !id || !['paid', 'rejected', 'approved'].includes(action)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    const supabase = admin()
    const { data: withdrawal, error } = await supabase.from('withdrawals').select('*').eq('id', id).single()
    if (error || !withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    if (withdrawal.status !== 'pending') return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 })
    if (action === 'rejected') {
      const { data: profile } = await supabase.from('profiles').select('coins').eq('email', withdrawal.email).maybeSingle()
      const table = profile ? 'profiles' : 'guest_wallets'
      const current = Number(profile?.coins ?? 0)
      const { data: guest } = profile ? { data: null } : await supabase.from('guest_wallets').select('coins').eq('email', withdrawal.email).maybeSingle()
      const balance = Number(profile?.coins ?? guest?.coins ?? 0)
      const { data: refunded, error: refundError } = await supabase.from(table).update({ coins: balance + Number(withdrawal.coins_requested) }).eq('email', withdrawal.email).select('email,coins').single()
      if (refundError || !refunded) return NextResponse.json({ error: 'Could not refund coins' }, { status: 500 })
    }
    const { data: updated, error: updateError } = await supabase.from('withdrawals').update({ status: action }).eq('id', id).select().single()
    if (updateError || !updated) return NextResponse.json({ error: 'Could not update withdrawal' }, { status: 500 })
    return NextResponse.json({ success: true, withdrawal: updated })
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
}
