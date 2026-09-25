"use client";
import { useEffect, useState } from "react";
import { BOTS_7 } from "@/lib/bots";
import { getBalance, deductBalance } from "@/lib/wallet";
import Link from "next/link";

export default function ArenaPage() {
  const [balance, setBalance] = useState(0);
  useEffect(() => setBalance(getBalance()), []);

  const play = (bot: any) => {
    if (!deductBalance(bot.entry)) {
      window.location.href = `/buy-coins?need=${bot.entry}&bot=${bot.id}`;
      return;
    }
    window.location.href = `/play?bot=${bot.id}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-zinc-900 p-4 rounded-2xl">
          <h1 className="text-2xl font-black">1 vs 1 CHALLENGE</h1>
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold">N{balance}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOTS_7.map((bot) => (
            <div key={bot.id} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="text-5xl mb-3">{bot.avatar}</div>
              <h3 className="font-bold text-lg">{bot.name}</h3>
              <p className="text-zinc-400 text-sm mb-3">{bot.title}</p>
              <div className="flex justify-between text-sm mb-4">
                <span>Entry: N{bot.entry}</span>
                <span className="text-green-400">Win N{bot.reward}</span>
              </div>
              <button onClick={() => play(bot)} className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl">PLAY</button>
            </div>
          ))}
        </div>
        <Link href="/buy-coins" className="block text-center mt-6 text-zinc-400">Buy Coins →</Link>
      </div>
    </div>
  );
}
