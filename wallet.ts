import { STARTING_BALANCE } from '@/lib/bots'

export const WALLET_KEY = 'daily-checkers-wallet-balance'

export function getBalance(): number {
  if (typeof window === 'undefined') return STARTING_BALANCE
  const stored = window.localStorage.getItem(WALLET_KEY)
  const balance = stored ? Number(stored) : STARTING_BALANCE
  return Number.isFinite(balance) && balance >= 0 ? balance : STARTING_BALANCE
}

export function setBalance(balance: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(WALLET_KEY, String(Math.max(0, Math.floor(balance))))
  window.dispatchEvent(new Event('wallet-change'))
}

export function addCoins(amount: number) {
  setBalance(getBalance() + amount)
}

export const addBalance = addCoins

export function deductBalance(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0 || !canAfford(amount)) return false
  setBalance(getBalance() - amount)
  return true
}

export function canAfford(amount: number) {
  return getBalance() >= amount
}
