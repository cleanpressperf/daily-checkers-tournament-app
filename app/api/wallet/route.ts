import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  const accessToken = authorization?.replace(/^Bearer\s+/i, '')
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!accessToken || !url || !serviceRoleKey) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: authData, error: authError } = await admin.auth.getUser(accessToken)
  const email = authData.user?.email
  if (authError || !email) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const { data: profile, error } = await admin.from('profiles').select('coins').eq('email', email).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coins: Number(profile?.coins || 0) })
}
