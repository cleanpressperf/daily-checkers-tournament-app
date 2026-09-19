'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Clock3, Eye, Menu, Trophy, Users, X } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}
function getCoins(){ if(typeof window==='undefined') return 100; let m=0; ['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>{const n=Number(localStorage.getItem(k)); if(!isNaN(n)&&n>m) m=n}); return m||100 }
function setCoins(n:number){ ['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>localStorage.setItem(k,String(n))); window.dispatchEvent(new Event('coins-updated')) }

function JoinedModal({name,close}:{name:string,close:()=>void}){
 return (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"><div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1A1A1A] p-6 text-center"><div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-[#ffd700]">YOU'RE IN ✅</div><h2 className="text-[22px] font-bold text-white">You joined {name}</h2><p className="mt-3 text-[14px] text-zinc-300">Live starts <b className="text-white">7:00 PM WAT</b></p><p className="mt-2 text-[14px] text-zinc-300">Must be back <b className="text-[#ffd700]">before 7:00 PM</b></p><div className="mt-4 rounded-xl bg-red-500/10 p-3 text-[12px] text-red-300">⚠️ Grace 5 mins. After <b>7:05 PM</b> auto <b>disqualified</b>.</div><button onClick={close} className="mt-5 w-full rounded-full bg-white py-3.5 font-bold text-black">Okay, will be back before 7:00</button></div></div>)
}

function Nav({tick}:{tick:number}){
 const [open,setOpen]=useState(false); const [bal,setBal]=useState(100)
 useEffect(()=>{setBal(getCoins()); const s=()=>setBal(getCoins()); window.addEventListener('coins-updated',s as any); return()=>window.removeEventListener('coins-updated',s as any)},[tick])
 return (<header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10"><Link href="/" className="flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5"/></span>BOARDROOM</Link><div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"><CircleDollarSign className="size-4 text-[#ffd700]"/>{bal}</div><button onClick={()=>setOpen(!open)} className="grid size-9 place-items-center rounded-full border border-white/10 md:hidden">{open?<X className="size-4"/>:<Menu className="size-4"/>}</button></div>{open&&<div className="absolute left-5 right-5 top-20 z-20 rounded-2xl bg-zinc-950 p-5 md:hidden"><Link href="/tournaments">Tournaments</Link></div>}</header>)
}

function Card({t,onJoined,onWatch}:{t:any,onJoined:(n:string)=>void,onWatch:()=>void}){
 function join(e:any){
  e.preventDefault(); const now=new Date(); const h=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit'}).formatToParts(now).find(p=>p.type==='hour')?.value||0); const m=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,minute:'2-digit'}).formatToParts(now).find(p=>p.type==='minute')?.value||0)
  if(h>19||(h===19&&m>5)){ alert('❌ Disqualified after 7:05 PM'); return }
  const b=getCoins(); if(b<t.entry){ alert(`Need ${t.entry}, you have ${b}`); return }
  const j=JSON.parse(localStorage.getItem('joined_tournaments')||'[]'); if(j.includes(t.name)){ onJoined(t.name); return }
  setCoins(b-t.entry); localStorage.setItem('joined_tournaments',JSON.stringify([...j,t.name])); onJoined(t.name)
 }
 function watch(e:any){ e.preventDefault(); const h=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit'}).formatToParts(new Date()).find(p=>p.type==='hour')?.value||0); if(h>=19&&h<20){ window.location.href='/play/demo-match' } else onWatch() }
 return (<article className={`${t.tone} rounded-[24px] p-5 text-black`}><p className="text-xs uppercase tracking-[0.2em] opacity-50">{t.name}</p><h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize}</Coins></h3><div className="mt-5 flex gap-2"><button onClick={join} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">Join now <ArrowRight className="size-4"/></button><button onClick={watch} className="grid size-11 place-items-center rounded-xl bg-black/10"><Eye className="size-4"/></button></div></article>)
}

export default function Page(){
 const [sec,setSec]=useState(0); const [sj,setSj]=useState(false); const [sn,setSn]=useState(false); const [jn,setJn]=useState(''); const [tick,setTick]=useState(0)
 useEffect(()=>{ const gs=()=>{ const n=new Date(); const p=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(n); const cur=Number(p.find(x=>x.type==='hour')?.value||0)*3600+Number(p.find(x=>x.type==='minute')?.value||0)*60+Number(p.find(x=>x.type==='second')?.value||0); return (19*3600-cur+86400)%86400 }; const u=()=>setSec(gs()); u(); const id=setInterval(u,1000); return()=>clearInterval(id) },[])
 const h=String(Math.floor(sec/3600)).padStart(2,'0'); const m=String(Math.floor((sec%3600)/60)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0')
 return (<main className="min-h-screen bg-black text-white"><Nav tick={tick}/><section className="mx-auto max-w-7xl px-5 py-16 lg:px-10"><div className="rounded-[28px] border border-white/10 bg-zinc-950 p-6"><div className="flex justify-between text-sm text-zinc-400"><span>Next in</span><Clock3 className="size-4"/></div><div className="mt-5 text-6xl tabular-nums">{h}:{m}:{s}</div></div><div className="mt-10 grid gap-4 md:grid-cols-3">{tournaments.map(t=><Card key={t.name} t={t} onJoined={(n)=>{setJn(n);setSj(true);setTick(x=>x+1)}} onWatch={()=>setSn(true)}/>)}</div></section>{sn&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5"><div className="w-full max-w-sm rounded-[24px] bg-zinc-900 p-6 text-center"><p className="text-xs tracking-[0.2em] text-[#ffd700]">LIVE NOT STARTED</p><h3 className="mt-3 text-xl font-semibold">Live starts 7:00 PM WAT</h3><p className="mt-2 text-sm text-zinc-400">{h}:{m}:{s}</p><button onClick={()=>setSn(false)} className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-black">Okay</button></div></div>}{sj&&<JoinedModal name={jn} close={()=>setSj(false)}/>}</main>)
}
export { tournaments, Coins, Nav }
