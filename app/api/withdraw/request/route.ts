import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const bankName = String(body.bank_name || '').trim()
    const accountNumber = String(body.account_number || '').trim()
    const accountName = String(body.account_name || '').trim()
    const coins = Number(body.coins)
    if (!email.includes('@') || !bankName || !accountNumber || !accountName || !Number.isInteger(coins) || coins < 5000) return NextResponse.json({ error: 'Min withdraw 5000 coins' }, { status: 400 })
    const supabase = admin()
    const { data: profile } = await supabase.from('profiles').select('coins').eq('email', email).maybeSingle()
    const { data: guest } = profile ? { data: null } : await supabase.from('guest_wallets').select('coins').eq('email', email).maybeSingle()
    const table = profile ? 'profiles' : guest ? 'guest_wallets' : null
    const current = Number(profile?.coins ?? guest?.coins ?? 0)
    if (!table) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    if (current < coins) return NextResponse.json({ error: 'Insufficient coin balance' }, { status: 400 })
    const feeCoins = Math.floor(coins * 0.3)
    const amountNaira = Math.floor(coins * 0.7)
    const { data: deducted, error: deductError } = await supabase.from(table).update({ coins: current - coins }).eq('email', email).select('email,coins').single()
    if (deductError || !deducted) throw new Error('Could not deduct wallet balance')
    const { error: insertError } = await supabase.from('withdrawals').insert({ email, bank_name: bankName, account_number: accountNumber, account_name: accountName, coins_requested: coins, fee_coins: feeCoins, amount_naira: amountNaira, status: 'pending' })
    if (insertError) {
      await supabase.from(table).update({ coins: current }).eq('email', email)
      throw insertError
    }
    return NextResponse.json({ success: true, amount_naira: amountNaira, fee_coins: feeCoins, coins: deducted.coins })
  } catch (error) {
    console.error('[v0] withdrawal request failed', error)
    return NextResponse.json({ error: 'Could not submit withdrawal request' }, { status: 500 })
  }
}

export async function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }) }
