import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  const tables = ['profiles','users','tournament_entries','tournament_participants','game_moves']
  const result:any = {}
  for (const t of tables) {
    const { error, data } = await supabase.from(t).select('*').limit(1)
    result[t] = error? 'MISSING' : (data?.[0]? Object.keys(data[0]) : 'FOUND EMPTY')
  }
  const { error } = await supabase.from('matches').insert({} as any)
  result['MATCHES_ERROR_MESSAGE'] = error?.message
  return NextResponse.json(result)
}
