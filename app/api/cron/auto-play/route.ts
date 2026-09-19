import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  const r:any = {}
  // 1. Find tournament_entries columns
  const { error: e1 } = await supabase.from('tournament_entries').insert({} as any)
  r.tournament_entries_error = e1?.message

  // 2. Try matches with only tournament_id
  const { data: t } = await supabase.from('tournaments').select('id').eq('name','Bronze').single()
  const { error: e2 } = await supabase.from('matches').insert({ tournament_id: t?.id } as any)
  r.matches_error_with_tournament_id = e2?.message

  // 3. Try tournament_entries with tournament_id
  const { error: e3 } = await supabase.from('tournament_entries').insert({ tournament_id: t?.id } as any)
  r.tournament_entries_error2 = e3?.message

  return NextResponse.json(r)
}
