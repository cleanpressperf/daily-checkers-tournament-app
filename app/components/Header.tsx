'use client'

import Link from 'next/link'

export default function Header() {
  return <nav aria-label="Main menu" className="border-b border-white/10 bg-[#0c0c0c] px-5 py-3 text-sm text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4"><Link href="/arena" className="font-bold text-[#d6ff38]">Daily Checkers</Link><Link href="/arena" className="text-white/70 hover:text-white">🏆 1vs1 Arena (7 Bots)</Link><Link href="/free" className="text-white/70 hover:text-white">Free Practice</Link><Link href="/buy-coins" className="text-white/70 hover:text-white">Buy Coin</Link><Link href="/withdraw" className="text-white/70 hover:text-white">Withdraw</Link></div></nav>
}
