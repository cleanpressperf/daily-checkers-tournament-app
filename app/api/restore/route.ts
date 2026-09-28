import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = typeof body.input === 'string' ? body.input.trim() : ''
    const guestId = typeof body.guestId === 'string' ? body.guestId.trim() : ''

    let query = supabaseAdmin.from('transactions').select('coins, created_at').eq('status', 'success')
    if (input.includes('@')) {
      query = query.ilike('email', `%${input}%`)
    } else if (input.length > 5) {
      query = query.eq('reference', input)
    } else if (guestId) {
      query = query.eq('guest_id', guestId)
    } else {
      return NextResponse.json({ success: false, error: 'Enter an email, reference, or try again.' }, { status: 400 })
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    console.log('[restore] search', { input, guestId, count: data?.length ?? 0, error })
    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'No successful payment found for this device or email.' }, { status: 404 })
    }

    const restored = data.reduce((sum, transaction) => sum + (Number(transaction.coins) || 0), 0)
    if (guestId) {
      const { error: walletError } = await supabaseAdmin
        .from('guest_wallets')
        .upsert({ id: guestId, coins: restored, updated_at: new Date().toISOString() })
      if (walletError) throw walletError
    }

    return NextResponse.json({ success: true, coins: restored, restored })
  } catch (error) {
    console.error('[restore] failed', error)
    return NextResponse.json({ success: false, error: 'Could not restore coins' }, { status: 500 })
  }
}
