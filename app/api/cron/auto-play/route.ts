import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  const r:any = {}
  const { data: t } = await supabase.from('tournaments').select('id').eq('name','Bronze').single()
  const tid = t?.id

  // Find next required for tournament_entries
  const fakeUser = '00000000-0000-0000-0000-000000000000'
  const { error: e1 } = await supabase.from('tournament_entries').insert({ tournament_id: tid, user_id: fakeUser } as any)
  r.tournament_entries_next = e1?.message

  // Find next required for matches
  const { error: e2 } = await supabase.from('matches').insert({ tournament_id: tid, round: 1 } as any)
  r.matches_next = e2?.message

  return NextResponse.json(r)
}
