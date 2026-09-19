'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Clock3, Eye, Menu, Trophy, Users, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}
function getCoins(){ if(typeof window==='undefined') return 100; let m=0; ['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>{const n=Number(localStorage.getItem(k)); if(!isNaN(n)&&n>m) m=n}); return m||100 }
function setCoins(n:number){ ['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>localStorage.setItem(k,String(n))); window.dispatchEvent(new Event('coins-updated')) }

function JoinedModal({name,close}:{name:string,close:()=>void}){
 return (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"><div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1A1A1A] p-6 text-center"><div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-[#ffd700]">YOU'RE IN ✅</div><h2 className="text-[22px] font-bold text-white">You joined {name}</h2><p className="mt-3 text-[14px] text-zinc-300">Live is <b className="text-white">NOW LIVE</b></p><div className="mt-4 rounded-xl bg-green-500/10 p-3 text-[12px] text-green-300">✅ Click eye icon to watch bots playing</div><button onClick={close} className="mt-5 w-full rounded-full bg-white py-3.5 font-bold text-black">Watch Live Now</button></div></div>)
}


 const [open,setOpen]=useState(false); const [bal,setBal]=useState(100)
 useEffect(()=>{setBal(getCoins()); const s=()=>setBal(getCoins()); window.addEventListener('coins-updated',s as any); return()=>window.removeEventListener('coins-updated',s as any)},[tick])
 return (<header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10"><Link href="/" className="flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5"/></span>BOARDROOM</Link><div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"><CircleDollarSign className="size-4 text-[#ffd700]"/>{bal}</div><button onClick={()=>setOpen(!open)} className="grid size-9 place-items-center rounded-full border border-white/10 md:hidden">{open?<X className="size-4"/>:<Menu className="size-4"/>}</button></div>{open&&<div className="absolute left-5 right-5 top-20 z-20 rounded-2xl bg-zinc-950 p-5 md:hidden"><Link href="/tournaments">Tournaments</Link></div>}</header>)
}

function Card({t,onJoined,onWatch}:{t:any,onJoined:(n:string)=>void,onWatch:()=>void}){
 function join(e:any){
  e.preventDefault();
  const b=getCoins(); if(b<t.entry){ alert(`Need ${t.entry}, you have ${b}`); return }
  const j=JSON.parse(localStorage.getItem('joined_tournaments')||'[]'); if(j.includes(t.name)){ onJoined(t.name); return }
  setCoins(b-t.entry); localStorage.setItem('joined_tournaments',JSON.stringify([...j,t.name])); onJoined(t.name)
 }
 function watch(e:any){ e.preventDefault(); window.location.href='/play/demo-match' }
 return (<article className={`${t.tone} rounded-[24px] p-5 text-black`}><p className="text-xs uppercase tracking-[0.2em] opacity-50 flex justify-between">{t.name} <span className="flex items-center gap-1"><Users className="size-3"/>{t.joined}/{t.max_players}</span></p><h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize}</Coins></h3><p className="mt-2 text-xs opacity-60">{t.status} • {t.joined} players joined</p><div className="mt-5 flex gap-2"><button onClick={join} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">Join now <ArrowRight className="size-4"/></button><button onClick={watch} className="grid size-11 place-items-center rounded-xl bg-black/10"><Eye className="size-4"/></button></div></article>)
}

export default function Page(){
 const [sec,setSec]=useState(0); const [sj,setSj]=useState(false); const [tournamentsList, setTournamentsList] = useState<any[]>([
  { name: 'Bronze', entry: 300, prize: 3000, joined: 32, max_players:32, status:'in_progress', tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 32, max_players:32, status:'in_progress', tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 32, max_players:32, status:'in_progress', tone: 'bg-[#e9e5d5]' },
 ]); const [sn,setSn]=useState(false); const [jn,setJn]=useState(''); const [tick,setTick]=useState(0)

 useEffect(()=>{
  async function load(){
    const { data: tours } = await supabase.from('tournaments').select('*');
    if(tours){
      const withCounts = await Promise.all(tours.map(async (tt:any)=>{
        const { count } = await supabase.from('tournament_entries').select('*', {count:'exact', head:true}).eq('tournament_id', tt.id)
        return { name: tt.name, entry: tt.entry_coins, prize: tt.prize_naira, joined: count||0, max_players: tt.max_players, status: tt.status, tone: tt.name==='Bronze'?'bg-[#f3f3f3]': tt.name==='Silver'?'bg-[#ececec]':'bg-[#e9e5d5]' }
      }))
      if(withCounts.length) setTournamentsList(withCounts)
    }
  }
  load();
  const gs=()=>{ const n=new Date(); const p=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(n); const cur=Number(p.find(x=>x.type==='hour')?.value||0)*3600+Number(p.find(x=>x.type==='minute')?.value||0)*60+Number(p.find(x=>x.type==='second')?.value||0); return (19*3600-cur+86400)%86400 }; const u=()=>setSec(gs()); u(); const id=setInterval(u,1000); return()=>clearInterval(id)
 },[])

 const h=String(Math.floor(sec/3600)).padStart(2,'0'); const m=String(Math.floor((sec%3600)/60)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0')
  tick={tick}/><section className="mx-auto max-w-7xl px-5 py-16 lg:px-10"><div className="rounded-[28px] border border-white/10 bg-zinc-950 p-6"><div className="flex justify-between text-sm text-zinc-400"><span>🔴 LIVE NOW - Bots playing</span><Clock3 className="size-4"/></div><div className="mt-5 text-6xl tabular-nums">{h}:{m}:{s}</div><p className="mt-2 text-sm text-zinc-400">32/32 bots auto-filled • Click eye to watch</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{tournamentsList.map(t=><Card key={t.name} t={t} onJoined={(n)=>{setJn(n);setSj(true);setTick(x=>x+1)}} onWatch={()=>setSn(true)}/>)}</div></section>{sn&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5"><div className="w-full max-w-sm rounded-[24px] bg-zinc-900 p-6 text-center"><p className="text-xs tracking-[0.2em] text-[#ffd700]">🔴 LIVE NOW</p><h3 className="mt-3 text-xl font-semibold">Bots are playing!</h3><p className="mt-2 text-sm text-zinc-400">{tournamentsList.map(tt=>`${tt.name}: ${tt.joined}/${tt.max_players}`).join(' • ')}</p><button onClick={()=>{setSn(false); window.location.href='/play/demo-match'}} className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-black">Watch Live</button><button onClick={()=>setSn(false)} className="mt-3 w-full rounded-xl bg-zinc-800 py-3 font-semibold text-white">Close</button></div></div>}{sj&&<JoinedModal name={jn} close={()=>{setSj(false); window.location.href='/play/demo-match'}}/>}</main>)
}
export const tournaments = [{name:'Bronze'},{name:'Silver'},{name:'Gold'}]
