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
    const now = new Date().toISOString()

    // 1. Find or CREATE tournament - 24/7 mode, no 19:00 wait
    let { data: tournaments } = await supabase.from('tournaments').select('id').eq('date', today).limit(1)

    if (!tournaments || tournaments.length === 0) {
      const { data: newT, error } = await supabase.from('tournaments').insert({
        date: today,
        start_time: now, // START NOW, not 19:00
        status: 'live',
        name: `Daily ${today}`
      }).select('id').single()
      if (error) throw error
      if (newT) tournaments = [newT]
    } else {
      // force existing tournament to live NOW
      await supabase.from('tournaments').update({ status: 'live', start_time: now }).eq('id', tournaments[0].id)
    }

    if (!tournaments || tournaments.length === 0) {
      return NextResponse.json({ error: 'No tournament' }, { status: 500 })
    }

    const tournament = tournaments[0]

    // 2. Fill bots up to 32
    const { data: existing } = await supabase.from('tournament_players').select('id, username').eq('tournament_id', tournament.id)
    const need = 32 - (existing?.length || 0)

    if (need > 0) {
      const shuffled = [...BOT_NAMES_96].sort(() => Math.random() - 0.5)
      const existingNames = new Set(existing?.map(p => p.username))
      const available = shuffled.filter(n =>!existingNames.has(n))
      const toAdd = available.slice(0, need)
      const bots = toAdd.map(username => ({ tournament_id: tournament.id, username, is_bot: true, is_human: false }))
      if (bots.length > 0) await supabase.from('tournament_players').insert(bots)
    }

    // 3. Create matches INSTANTLY if none
    const { count: matchCount } = await supabase.from('tournament_matches').select('*', { count: 'exact', head: true }).eq('tournament_id', tournament.id)

    if ((matchCount || 0) === 0) {
      const { data: allPlayers } = await supabase.from('tournament_players').select('id, username').eq('tournament_id', tournament.id)
      if (allPlayers && allPlayers.length >= 2) {
        const playersShuffled = [...allPlayers].sort(() => Math.random() - 0.5)
        const matchesToInsert = []
        for (let table = 0; table < 8; table++) {
          const tablePlayers = playersShuffled.slice(table * 4, (table + 1) * 4)
          if (tablePlayers.length < 2) continue
          for (let a = 0; a < tablePlayers.length; a++) {
            for (let b = a + 1; b < tablePlayers.length; b++) {
              matchesToInsert.push({
                tournament_id: tournament.id,
                player1_username: tablePlayers[a].username,
                player2_username: tablePlayers[b].username,
                player1_id: tablePlayers[a].id,
                player2_id: tablePlayers[b].id,
                table_number: table + 1,
                round: `Table ${table+1}`,
                status: 'live',
                current_turn: 'player1',
                board_fen: 'startpos'
              })
            }
          }
        }
        if (matchesToInsert.length > 0) await supabase.from('tournament_matches').insert(matchesToInsert)
      }
    }

    return NextResponse.json({ success: true, tournament_id: tournament.id, mode: "24/7 LIVE NOW" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
