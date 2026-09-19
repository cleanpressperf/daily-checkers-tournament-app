import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  const { data } = await supabase.from('matches').select('*').limit(1)
  return NextResponse.json({ sample_match: data?.[0], keys: data?.[0]? Object.keys(data[0]) : [] })
}
