import { NextResponse } from "next/server";

const PLAYERS = [
  "Lester Freamon","Jimmy McNulty","Vito Corleone","Tom Hagen",
  "Michael Corleone","Luca Changretta","Omar Little","Marlo Stanfield"
];

let store: any = (globalThis as any).STORE;
if (!store) {
  store = (globalThis as any).STORE = {
    bronze: { winners: [] as string[] },
    silver: { winners: [] as string[] },
    gold: { winners: [] as string[] },
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const t = (searchParams.get('t') || 'bronze').toLowerCase();

    if (searchParams.get('reset')) {
      if (store[t]) store[t].winners = [];
      return NextResponse.json({ ok: true, reset: t });
    }

    const tier = store[t] || store.bronze;

    if (tier.winners.length < 4) {
      const pool = PLAYERS.filter(p =>!tier.winners.includes(p));
      if (pool.length > 0) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        tier.winners.push(pick);
      }
    }

    return NextResponse.json({
      tier: t,
      round: "Round of 32",
      serverMsg: `${PLAYERS.length} players in Round of 32`,
      winners: tier.winners
    });
  } catch (e:any) {
    return NextResponse.json({ tier: "bronze", round: "Round of 32", serverMsg: "ok", winners: [] });
  }
}
