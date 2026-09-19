import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const tryTables = ['tournament_matches','matches','games','tournament_games']
  const results:any = {}

  for (const tbl of tryTables) {
    const { data, error } = await supabase.from(tbl).select('id').limit(1)
    results[tbl] = error? `MISSING: ${error.message}` : `FOUND: ${data?.length} rows`
  }

  // also check tournaments table
  const { data: tours, error: tourErr } = await supabase.from('tournaments').select('id,date').order('date',{ascending:false}).limit(3)
  results['tournaments_check'] = tourErr? tourErr.message : tours

  return NextResponse.json(results)
}
