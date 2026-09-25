import { STARTING_BALANCE } from '@/lib/bots'

export const WALLET_KEY = 'daily-checkers-wallet-balance'
export function getBalance() {
  if (typeof window === 'undefined') return STARTING_BALANCE
  const value = Number(window.localStorage.getItem(WALLET_KEY))
  return Number.isFinite(value) && value >= 0 ? value : STARTING_BALANCE
}
export function setBalance(balance: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(WALLET_KEY, String(Math.max(0, Math.floor(balance))))
  window.dispatchEvent(new Event('wallet-change'))
}
<<<<<<< HEAD
export function addBalance(amount: number) { const next = getBalance() + amount; setBalance(next); return next }
export const addCoins = addBalance
export function deductBalance(amount: number) {
  if (getBalance() < amount) return false
  setBalance(getBalance() - amount)
  return true
=======

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
>>>>>>> 3319119 (feat: add new components and update layout with Header and WithdrawPage features)
}
export function canAfford(amount: number) { return getBalance() >= amount }
