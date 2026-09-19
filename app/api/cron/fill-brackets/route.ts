import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const BOT_NAMES = Array.from({length:96},(_,i)=>`Bot_${i+1}`)
export async function GET(){
 try{
  const today=new Date().toISOString().split('T')[0]
  let {data:t}=await supabase.from('tournaments').select('id').eq('date',today).limit(1)
  let tid:string
  if(!t||!t.length){
   const {data:n,[STRIPPED] supabase.from('tournaments').insert({date:today,status:'live',name:`Daily ${today}`}).select('id').single()
   if(!n) throw new Error(e?.message); tid=n.id
  }else{ tid=t[0].id; await supabase.from('tournaments').update({status:'live'}).eq('id',tid) }
  const {data:ex}=await supabase.from('tournament_players').select('id,username').eq('tournament_id',tid)
  const need=32-(ex?.length||0)
  if(need>0){
   const set=new Set(ex?.map(p=>p.username)); const add=BOT_NAMES.filter(n=>!set.has(n)).slice(0,need)
   const bots=add.map(username=>({tournament_id:tid,username,is_bot:true,is_human:false}))
   if(bots.length) await supabase.from('tournament_players').insert(bots)
  }
  return NextResponse.json({success:true,tournament_id:tid})
 }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
