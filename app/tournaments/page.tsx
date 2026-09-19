'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Eye, Trophy, Users } from 'lucide-react'

const tournaments=[
  {name:'Bronze',entry:300,prize:3000,joined:24,tone:'bg-[#f3f3f3]'},
  {name:'Silver',entry:700,prize:5000,joined:18,tone:'bg-[#ececec]'},
  {name:'Gold',entry:1000,prize:15000,joined:29,tone:'bg-[#e9e5d5]'}
]

function Coins({children}:{children:React.ReactNode}){
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

// --- FIX 100 COINS BUG FOREVER ---
function getUnifiedCoins(){
  if(typeof window==='undefined') return 100
  let max=0
  ;['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>{
    const v=Number(localStorage.getItem(k))
    if(!isNaN(v) && v>max) max=v
  })
  return max||100
}
function setUnifiedCoins(n:number){
  ['user_coins','boardroom_coins','coins','coinBalance','balance'].forEach(k=>localStorage.setItem(k,String(n)))
  window.dispatchEvent(new Event('coins-updated'))
}

function JoinedModal({name, onClose}:{name:string, onClose:()=>void}){
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1A1A1A] p-6 text-center">
        <div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-[#ffd700]">YOU'RE IN ✅</div>
        <h2 className="text-[22px] font-bold leading-tight text-white">You joined {name} TOURNAMENT</h2>
        <p className="mt-3 text-[14px] leading-[1.5] text-zinc-300">Live match starts <span className="font-bold text-white">7:00 PM WAT</span> today.</p>
        <p className="mt-2 text-[14px] leading-[1.5] text-zinc-300">You must come back <span className="font-bold text-[#ffd700]">before 7:00 PM</span> to play.</p>
        <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-[12px] leading-[1.4] font-medium text-red-300">
          ⚠️ Grace period is 5 minutes. After <b>7:05 PM</b> you will be automatically <b>disqualified</b> and you cannot join this tournament again.
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-full bg-white py-3.5 text-[15px] font-bold text-black">Okay, I will be back before 7:00</button>
      </div>
    </div>
  )
}

export default function TournamentsPage(){
  const [coins,setCoins]=useState(100)
  const [name,setName]=useState('')
  const [seconds,setSeconds]=useState(0)
  const [showJoined,setShowJoined]=useState(false)
  const [joinedName,setJoinedName]=useState('')
  const [showWatch,setShowWatch]=useState(false)

  useEffect(()=>{
    setCoins(getUnifiedCoins())
    setName(localStorage.getItem('boardroom_name')||'')
    const getSec=()=>{
      const now=new Date()
      const p=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(now)
      const cur=Number(p.find(x=>x.type==='hour')?.value||0)*3600+Number(p.find(x=>x.type==='minute')?.value||0)*60+Number(p.find(x=>x.type==='second')?.value||0)
      return (19*3600-cur+24*3600)%(24*3600)
    }
    const u=()=>setSeconds(getSec()); u()
    const id=setInterval(u,1000)
    const sync=()=>setCoins(getUnifiedCoins())
    window.addEventListener('coins-updated', sync as any)
    return ()=>{clearInterval(id); window.removeEventListener('coins-updated', sync as any)}
  },[])

  const join=(t:any)=>{
    // time check for disqualify
    const now=new Date()
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(now)
    const h=Number(parts.find(x=>x.type==='hour')?.value||0)
    const m=Number(parts.find(x=>x.type==='minute')?.value||0)
    if(h>19 || (h===19 && m>5)){
      alert('❌ Disqualified! You did not come back before 7:05 PM. Match has started, you cannot join this tournament again.')
      return
    }

    let n=localStorage.getItem('boardroom_name')
    if(!n){
      let raw=prompt('Enter your first name to join:')||''; if(!raw) return
      raw=raw.trim().split(' ')[0]
      const rid=Math.floor(1000+Math.random()*9000)
      n=`${raw}#${rid}`
      localStorage.setItem('boardroom_name',n)
      setName(n)
      if(getUnifiedCoins()===100 &&!localStorage.getItem('boardroom_coins')){
        // keep 100 for new user, will be unified
        setUnifiedCoins(100)
      }
    }

    const already=JSON.parse(localStorage.getItem('joined_tournaments')||'[]')
    if(already.includes(t.name)){
      setJoinedName(t.name)
      setShowJoined(true)
      return
    }

    let my=getUnifiedCoins()
    if(my<t.entry){ alert(`Need ${t.entry} coins. You have ${my}. Buy more coins.`); window.location.href='/buy'; return }

    setUnifiedCoins(my-t.entry)
    setCoins(my-t.entry)
    localStorage.setItem('joined_tournaments', JSON.stringify([...already, t.name]))
    localStorage.setItem(`joined_at_${t.name}`, String(Date.now()))
    setJoinedName(t.name)
    setShowJoined(true)
  }

  const watch=(e:any)=>{
    e.preventDefault()
    const p=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Lagos',hour12:false,hour:'2-digit'}).formatToParts(new Date())
    const h=Number(p.find(x=>x.type==='hour')?.value||0)
    if(h>=19&&h<20) window.location.href='/play/demo-match'
    else setShowWatch(true)
  }

  const hStr=String(Math.floor(seconds/3600)).padStart(2,'0')
  const mStr=String(Math.floor((seconds%3600)/60)).padStart(2,'0')
  const sStr=String(seconds%60).padStart(2,'0')

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold"><span className="grid size-9 place-items-center rounded-xl bg-white text-black"><Trophy className="size-5"/></span>BOARDROOM</Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm"><CircleDollarSign className="size-4 text-[#ffd700]"/>{name?`${name}: `:''}{coins}</div>
      </header>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-10">
        <h1 className="text-3xl font-semibold">Choose your table</h1>
        <p className="mt-2 text-zinc-400">Daily at 7PM WAT - Grace till 7:05PM then disqualified</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tournaments.map(t=>(
            <article key={t.name} className={`${t.tone} rounded-[24px] p-5 text-black`}>
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">{t.name} tournament</p><h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize.toLocaleString()}</Coins></h3></div>
                <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">Daily 7PM WAT</span>
              </div>
              <div className="mt-6 flex items-end justify-between text-sm text-black/55">
                <div><p>Entry</p><p className="mt-1 text-base font-semibold text-black"><Coins>{t.entry}</Coins></p></div>
                <div className="text-right"><p className="flex items-center justify-end gap-1"><Users className="size-3"/>{t.joined}/32</p><div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-black" style={{width:`${(t.joined/32)*100}%`}}/></div></div>
              </div>
              <div className="mt-5 flex gap-2"><button onClick={()=>join(t)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white">Join now <ArrowRight className="size-4"/></button><button onClick={watch} className="grid size-11 place-items-center rounded-xl bg-black/10"><Eye className="size-4"/></button></div>
            </article>
          ))}
        </div>
      </section>

      {showWatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5">
          <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#ffd700]">Live not started</p><h3 className="mt-3 text-xl font-semibold">Live starts 7:00 PM WAT</h3><p className="mt-2 text-sm text-zinc-400">Countdown: <span className="font-semibold text-white">{hStr}:{mStr}:{sStr}</span></p><button onClick={()=>setShowWatch(false)} className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black">Okay</button>
          </div>
        </div>
      )}

      {showJoined && <JoinedModal name={joinedName} onClose={()=>setShowJoined(false)} />}
    </main>
  )
}
