import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96 } from '@/lib/bots/names'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Get 3 tournaments for today
    const { data: tournaments } = await supabase
     .from('tournaments')
     .select('id')
     .eq('date', today)
     .order('start_time')

    if (!tournaments || tournaments.length === 0) {
      return NextResponse.json({ message: 'No tournaments today' })
    }

    // Shuffle 96 names
    let shuffled = [...BOT_NAMES_96].sort(() => Math.random() - 0.5)
    const chunks = [
      shuffled.slice(0, 32),
      shuffled.slice(32, 64),
      shuffled.slice(64, 96)
    ]

    for (let i = 0; i < tournaments.length; i++) {
      const t = tournaments[i]
      const { count } = await supabase
       .from('tournament_players')
       .select('*', { count: 'exact', head: true })
       .eq('tournament_id', t.id)

      const need = 32 - (count || 0)
      if (need > 0) {
        const namesToUse = chunks[i] || chunks[0]
        const bots = namesToUse.slice(0, need).map(username => ({
          tournament_id: t.id,
          username,
          is_bot: true,
          is_human: false
        }))
        await supabase.from('tournament_players').insert(bots)
      }
    }

    return NextResponse.json({ success: true, filled: tournaments.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
