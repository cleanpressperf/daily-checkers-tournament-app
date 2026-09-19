import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const r:any = {}

  const { data: t1, error: e1 } = await supabase.from('tournaments').select('*').limit(1)
  r.tournaments_one_row = e1? e1.message : t1
  r.tournaments_columns = t1 && t1[0]? Object.keys(t1[0]) : 'no rows - trying insert test'

  const { data: m1, error: e2 } = await supabase.from('matches').select('*').limit(1)
  r.matches_one_row = e2? e2.message : m1
  r.matches_columns = m1 && m1[0]? Object.keys(m1[0]) : 'empty but table exists - good'

  const tryPlayerTables = ['players','tournament_players','participants']
  for (const tbl of tryPlayerTables) {
    const { error } = await supabase.from(tbl).select('id').limit(1)
    r[`table_${tbl}`] = error? 'MISSING' : 'FOUND'
  }

  return NextResponse.json(r)
}
