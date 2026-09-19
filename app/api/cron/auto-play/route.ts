import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  const r:any = {}
  const { data: tours } = await supabase.from('tournaments').select('*')
  r.all_tournaments = tours

  const { data: usersList, error } = await supabase.auth.admin.listUsers()
  r.users_count = usersList?.users?.length
  r.first_users = usersList?.users?.slice(0,3).map(u => ({ id: u.id, email: u.email }))
  r.users_error = error?.message

  const { data: entries } = await supabase.from('tournament_entries').select('*').limit(5)
  r.entries_sample = entries

  return NextResponse.json(r)
}
