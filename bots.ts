export type Bot = {
  id: string
  name: string
  buyIn: number
  payout: number
  tier: string
}

export const bots: Bot[] = [
  { id: 'finn', name: 'Finn', buyIn: 200, payout: 350, tier: 'Rookie' },
  { id: 'john', name: 'John', buyIn: 500, payout: 900, tier: 'Contender' },
  { id: 'arthur', name: 'Arthur', buyIn: 1000, payout: 1800, tier: 'Contender' },
  { id: 'stringer', name: 'Stringer', buyIn: 2000, payout: 3800, tier: 'Pro' },
  { id: 'avon', name: 'Avon', buyIn: 5000, payout: 9500, tier: 'Pro' },
  { id: 'thomas', name: 'Thomas', buyIn: 10000, payout: 18000, tier: 'Elite' },
  { id: 'marlo', name: 'Marlo', buyIn: 20000, payout: 38000, tier: 'Elite' },
]

export function getBot(id: string) {
  return bots.find((bot) => bot.id === id)
}

export function formatCoins(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount)
}

export const PLAYER_WIN_RATE = 20
export const STARTING_BALANCE = 1000
