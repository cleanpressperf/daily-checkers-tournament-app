import { NextResponse } from "next/server";
// @ts-ignore
globalThis._tourney = globalThis._tourney || {};
// @ts-ignore
const G = globalThis._tourney;
// @ts-ignore
globalThis._liveStore = globalThis._liveStore || {};
// @ts-ignore
const LIVE = globalThis._liveStore;

const ALL_96=["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn Shelby","Michael Gray","Polly Gray","Ada Shelby","Isaiah Jesus","Jeremiah Jesus","Jimmy McCavern","Aberama Gold","Alfie Solomons","Luca Changretta","Michael Corleone","Vito Corleone","Sonny Corleone","Tom Hagen","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Franklin Saint","Leon Simmons","Jerome Saint","Teddy McDonald","Manboy","Gustavo Fring","Esme Shelby","Lizzie Stark","Freddie Thorne","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim Charles","Snoop Pearson","Bunk Moreland","Kima Greggs","Connie Corleone","Kay Adams","Apollonia Vitelli","Moe Greene","Hyman Roth","Cissy Saint","Kane Hamilton","Rob Volpe","Andre Wright","Walter White","Jesse Pinkman","Saul Goodman","Hank Schrader","Mike Ehrmantraut","Pablo Escobar","Javier Pena","Steve Murphy","Tommy Shelby Jr","John Watson","Sherlock Holmes","James Moriarty","Tony Soprano","Paulie Gualtieri","Silvio Dante","Christopher Moltisanti","Tony Montana","Manny Ribera","Nucky Thompson","Al Capone","Lucky Luciano","Bugsy Siegel","Meyer Lansky","Dutch Schultz","Arnold Rothstein","Frank Costello","Vito Genovese","Carlo Gambino","John Gotti","Sammy Gravano","Whitey Bulger","Ray Donovan","Mickey Donovan","Terry Donovan","Daryl Donovan","Bunchy Donovan","Sully Sullivan","James Donovan","Fitzgerald","Devereaux","Cousin Mickey","Zion"];
const BRONZE_32 = ALL_96.slice(0,32);
const SILVER_32 = ALL_96.slice(32,64);
const GOLD_32 = ALL_96.slice(64,96);

function genBracket(tier:string){
  tier= tier.toLowerCase();
  let pool = BRONZE_32;
  if(tier.includes("silver")) pool = SILVER_32;
  else if(tier.includes("gold")) pool = GOLD_32;
  return [...pool].sort(()=>0.5-Math.random());
}

function getTourney(tier:string){
  tier= tier.toLowerCase();
  if(!G[tier]){
    G[tier]={ bracket: genBracket(tier), roundIdx:0, matchInRound:0, roundWinners:[], status:"Round of 32", currentMatch:"Starting...", lastUpdate:Date.now() };
  }
  const s=G[tier];
  const now=Date.now();
  if(now - s.lastUpdate > 15000){
    // @ts-ignore
    const live=LIVE[tier];
    const humanLive=live && (Date.now()-live.time < 35000) && live.status!=="WON";
    if(!humanLive){
      const idx = s.matchInRound*2;
      const a = s.bracket[idx] || "Bot";
      const b = s.bracket[idx+1] || "Bot2";
      const winner = Math.random()>0.5? a : b;
      s.currentMatch = `${a} vs ${b} → ${winner} wins`;
      const totalMatches = Math.floor(s.bracket.length/2);
      if(totalMatches - s.matchInRound <= 2) s.currentMatch += " (DQ - no show)";
      s.roundWinners.push(winner);
      s.matchInRound++;
      if(s.matchInRound*2 >= s.bracket.length){
        if(s.roundIdx>=4){
          G[tier]={ bracket: genBracket(tier), roundIdx:0, matchInRound:0, roundWinners:[], status:"Round of 32", currentMatch:"New Tournament", lastUpdate:Date.now() };
        }else{
          s.bracket=[...s.roundWinners]; s.roundWinners=[]; s.roundIdx++; s.matchInRound=0;
          s.status=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"][s.roundIdx];
        }
      }
      s.lastUpdate=now;
    }
  }
  return s;
}

export async function GET(req:Request){
  const {searchParams}=new URL(req.url);
  const tier=(searchParams.get("t")||"bronze").toLowerCase();
  return NextResponse.json(getTourney(tier));
}

export async function POST(req:Request){
  const body=await req.json();
  const tier=(body.tier||"bronze").toLowerCase();
  const s=getTourney(tier);
  if(body.winner &&!s.roundWinners.includes(body.winner)){
    s.roundWinners.push(body.winner);
    s.matchInRound++;
    if(s.matchInRound*2 >= s.bracket.length && s.roundIdx<4){
      s.bracket=[...s.roundWinners]; s.roundWinners=[]; s.roundIdx++; s.matchInRound=0;
      s.status=["Round of 32","Round of 16","Quarterfinal","Semifinal","FINAL"][s.roundIdx];
    }
    s.lastUpdate=Date.now();
  }
  if(body.checkJoin){
    const me=body.checkJoin;
    const inBracket = s.bracket.includes(me);
    const allowed = inBracket || s.roundIdx===0;
    let opponent = null;
    if(inBracket){
      const idx = s.bracket.indexOf(me);
      opponent = s.bracket[idx%2===0? idx+1 : idx-1];
    }
    return NextResponse.json({ allowed, inCurrentRound: inBracket, opponent, state:s });
  }
  return NextResponse.json({ok:true, state:s});
}
