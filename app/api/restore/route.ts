import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const guestId = typeof body.guestId === 'string' ? body.guestId.trim() : ''

    if (!guestId) {
      return NextResponse.json({ success: false, error: 'Guest ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('coins, created_at')
      .eq('guest_id', guestId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'No transaction found' }, { status: 404 })
    }

    const totalCoins = data.reduce((sum, transaction) => sum + (transaction.coins || 0), 0)
    const { error: walletError } = await supabaseAdmin
      .from('guest_wallets')
      .upsert({ id: guestId, coins: totalCoins, updated_at: new Date().toISOString() })

    if (walletError) throw walletError

    return NextResponse.json({ success: true, coins: totalCoins })
  } catch (error) {
    console.error('[restore] failed', error)
    return NextResponse.json({ success: false, error: 'Could not restore coins' }, { status: 500 })
  }
}
