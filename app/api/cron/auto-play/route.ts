import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  // Full reset
  await supabase.from('matches').delete().neq('id','00000000-0000-0000-0000-000000000000')
  await supabase.from('tournament_entries').delete().neq('tournament_id','00000000-0000-0000-0000-000000000000')
  await supabase.from('tournaments').update({ status: 'registering' }).neq('id','00000000-0000-0000-0000-000000000000')
  const { data: t } = await supabase.from('tournaments').select('*')
  return NextResponse.json({ reset: 'done', tournaments: t })
}
