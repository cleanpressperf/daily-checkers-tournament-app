import { STARTING_BALANCE } from './bots'

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
export function addBalance(amount: number) { const next = getBalance() + amount; setBalance(next); return next }
export const addCoins = addBalance
export function deductBalance(amount: number) {
  if (getBalance() < amount) return false
  setBalance(getBalance() - amount)
  return true
}
export function canAfford(amount: number) { return getBalance() >= amount }
