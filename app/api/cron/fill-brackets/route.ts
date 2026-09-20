import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function GET(){
 try{
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const today = new Date().toISOString().split('T')[0]
  const { data: tours } = await supabase.from('tournaments').select('id').eq('date', today)
  if(!tours || tours.length===0){
    const { data: nt } = await supabase.from('tournaments').insert({ date: today, status: 'live' }).select('id').single()
    if(nt){
      const bots = Array.from({length:32},(_,i)=>({ tournament_id: nt.id, username: `Bot_${i+1}`, is_bot: true }))
      await supabase.from('tournament_players').insert(bots)
    }
  } else {
    for(const t of tours){
      const { data: pls } = await supabase.from('tournament_players').select('id').eq('tournament_id', t.id)
      const need = 32 - (pls?.length||0)
      if(need>0){
        const bots = Array.from({length:need},(_,i)=>({ tournament_id: t.id, username: `Bot_${Date.now()}_${i}`, is_bot: true }))
        await supabase.from('tournament_players').insert(bots)
      }
    }
  }
  return NextResponse.json({success:true, today})
 }catch(e:any){
  return NextResponse.json({error: e.message}, {status: 500})
 }
}
