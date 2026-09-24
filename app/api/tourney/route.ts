import { NextRequest, NextResponse } from "next/server";

const ALL_96 = ["Lester Freamon","Jimmy McNulty","Vito Corleone","Tom Hagen","Michael Corleone","Luca Changretta","Omar Little","Marlo Stanfield","Jimmy McCavern","Thomas Shelby","Isaiah Jesus","Alfie Solomons","Lizzie Stark","Finn Shelby","Teddy McDonald","Ada Shelby","John Shelby","Aberama Gold","Arthur Shelby","Polly Gray","Stringer Bell","Avon Barksdale","Bunk Moreland","Kima Greggs","Bodie Broadus","Prop Joe","Slim Charles","Wee Bey","D'Angelo Barksdale","Snoop Pearson","Chris Partlow","Luca Brasi","Sonny Corleone","Fredo Corleone","Clemenza","Tessio","Kay Adams","Connie Corleone","Carlo Rizzi","Moe Greene","Barzini","Philip Tattaglia","Jack Woltz","Enzo Aguello","Al Neri","Rocco Lampone","Willi Cicci","Fabrizio","Calo","Osvaldo Altobello","Joey Zasa","Vincent Mancini","Mary Corleone","Anthony Corleone","Deanna Dunn","Mama Corleone","Bobby Corleone","Johnny Fontane","Lucy Mancini","Apollonia Vitelli","Kayla Corleone","Freddy Corleone","Salvatore Tessio","Peter Clemenza","Willie Cicci","Frank Pentangeli","Hyman Roth","Johnny Ola","Fred Corleone","Nick Geraci","Domenico","Fausto","Mosca","Joe Zaluchi","Renaldo","Victor","Emilio Barzini","Tattaglia Jr","Bruno Tattaglia","Paulie Gatto","Rocco","Altobello Jr","Lou","Frankie","Joey","Mikey","Tony","Vinnie","Sal","Gino","Frank","Nino","Carlo"];

const g: any = globalThis as any;
if (!g.BRACKETS) {
  g.BRACKETS = {
    bronze: { players: ALL_96.slice(0,32), winners: [] as string[], round: "Round of 32", last: "" },
    silver: { players: ALL_96.slice(32,64), winners: [] as string[], round: "Round of 32", last: "" },
    gold: { players: ALL_96.slice(64,96), winners: [] as string[], round: "Round of 32", last: "" },
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const t = url.searchParams.get('t') || 'bronze';
  if (url.searchParams.get('reset')) { g.BRACKETS[t].winners = []; g.BRACKETS[t].round = "Round of 32"; return NextResponse.json({ok:true}); }

  const b = g.BRACKETS[t];
  if (!b) return NextResponse.json({error:"invalid tier"},{status:400});

  // FIX: only pick from THIS tier's players
  if (b.winners.length < 16) {
    const left = b.players.filter((p:string) =>!b.winners.includes(p));
    if (left.length >= 2) {
      const a = left[Math.floor(Math.random()*left.length)];
      let c = left[Math.floor(Math.random()*left.length)];
      while(c===a) c = left[Math.floor(Math.random()*left.length)];
      const win = Math.random()>0.5? a : c;
      b.winners.push(win);
      b.last = `${a} vs ${c} → ${win} wins`;
    }
  }

  return NextResponse.json({
    tier: t,
    round: b.round,
    serverMsg: b.last,
    winners: b.winners,
  });
}
