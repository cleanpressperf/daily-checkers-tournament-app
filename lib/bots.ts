export type Bot = {
  id: string
  name: string
  title: string
  entry: number
  reward: number
  avatar: string
  level: number
  buyIn: number
  payout: number
  tier: string
}

const definitions = [
  ['finn', 'Finn', 'Rookie Bait', 200, 350, 'Finn', 1],
  ['john', 'John', 'Street Fighter', 500, 900, 'John', 2],
  ['arthur', 'Arthur', 'Mad Dog', 1000, 1800, 'Arthur', 3],
  ['stringer', 'Stringer', 'The Strategist', 2000, 3800, 'Stringer', 4],
  ['avon', 'Avon', 'The King', 5000, 9500, 'Avon', 5],
  ['thomas', 'Thomas', 'The Boss', 10000, 18000, 'Thomas', 6],
  ['marlo', 'Marlo', 'Final Boss', 20000, 38000, 'Marlo', 7],
] as const

export const BOTS_7: Bot[] = definitions.map(([id, name, title, entry, reward, avatar, level]) => ({
  id, name, title, entry, reward, avatar, level, buyIn: entry, payout: reward, tier: title,
}))
export const BOTS = BOTS_7
export const bots = BOTS_7
export const PLAYER_WIN_RATE = 20
export const STARTING_BALANCE = 1000
export function getBot(id: string) { return BOTS_7.find((bot) => bot.id === id) ?? null }
export function formatCoins(amount: number) { return new Intl.NumberFormat('en-US').format(amount) }
