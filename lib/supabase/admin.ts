import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export function validGuestId(value: unknown) {
  return typeof value === 'string' && /^guest_[A-Za-z0-9_-]{8,100}$/.test(value)
}

export function validAmount(value: unknown) {
  const amount = Number(value)
  return Number.isInteger(amount) && amount > 0 && amount <= 1_000_000
}

export function validCoins(value: unknown) {
  const coins = Number(value)
  return Number.isInteger(coins) && coins > 0 && coins <= 1_000_000
}

export function walletError(message = 'Wallet service unavailable') {
  return Response.json({ error: message }, { status: 500 })
}

export function normalizeGuestId(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeLookup(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 200) : ''
}

export function asCoins(value: unknown) {
  const coins = Number(value)
  return Number.isFinite(coins) ? Math.max(0, Math.floor(coins)) : 0
}

export function isEmail(value: string) {
  return value.includes('@') && value.length <= 200
}

export function asReference(value: string) {
  return value.length >= 3 && value.length <= 200
}

export function guestWallet(id: string, coins: number) {
  return { id, coins, updated_at: new Date().toISOString() }
}

export function serviceConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL))
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

export function ok(data: Record<string, unknown>) {
  return Response.json(data, { status: 200 })
}

export function unauthorized() {
  return Response.json({ error: 'Invalid guest id' }, { status: 400 })
}

export function toInt(value: unknown) {
  const number = Number(value)
  return Number.isInteger(number) ? number : 0
}

export function clampCoins(value: unknown) {
  return Math.min(10_000_000, Math.max(0, toInt(value)))
}

export function getGuestId(value: unknown) {
  return validGuestId(value) ? String(value) : ''
}
