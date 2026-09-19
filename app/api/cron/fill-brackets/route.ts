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

    const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id')
    .eq('date', today)
    .order('start_time')

    if (!tournaments || tournaments.length === 0) {
      return NextResponse.json({ message: 'No tournaments today' })
    }

    let shuffledAll = [...BOT_NAMES_96].sort(() => Math.random() - 0.5)
    const chunks = [
      shuffledAll.slice(0, 32),
      shuffledAll.slice(32, 64),
      shuffledAll.slice(64, 96)
    ]

    for (let i = 0; i < tournaments.length; i++) {
      const t = tournaments[i]

      // 1. Count existing players
      const { data: existing } = await supabase
      .from('tournament_players')
      .select('id, username')
      .eq('tournament_id', t.id)

      const need = 32 - (existing?.length || 0)

      if (need > 0) {
        const namesToUse = chunks[i] || chunks[0]
        // Avoid duplicate names
        const existingNames = new Set(existing?.map(p => p.username))
        const available = namesToUse.filter(n =>!existingNames.has(n))
        const toAdd = available.slice(0, need)

        const bots = toAdd.map(username => ({
          tournament_id: t.id,
          username,
          is_bot: true,
          is_human: false
        }))

        if (bots.length > 0) {
          await supabase.from('tournament_players').insert(bots)
        }
      }

      // 2. CREATE GAMES IF NOT EXIST
      const { count: gameCount } = await supabase
      .from('tournament_games')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', t.id)

      if ((gameCount || 0) === 0) {
        const { data: allPlayers } = await supabase
        .from('tournament_players')
        .select('id')
        .eq('tournament_id', t.id)

        if (allPlayers && allPlayers.length >= 2) {
          const playersShuffled = [...allPlayers].sort(() => Math.random() - 0.5)
          const gamesToInsert = []

          // 8 tables of 4 players each
          for (let table = 0; table < 8; table++) {
            const tablePlayers = playersShuffled.slice(table * 4, (table + 1) * 4)
            if (tablePlayers.length < 2) continue

            for (let a = 0; a < tablePlayers.length; a++) {
              for (let b = a + 1; b < tablePlayers.length; b++) {
                gamesToInsert.push({
                  tournament_id: t.id,
                  table_number: table + 1,
                  player_white_id: tablePlayers[a].id,
                  player_black_id: tablePlayers[b].id,
                  status: 'playing',
                  current_turn: 'white',
                  board_state: 'start_10x10' // replace with your actual initial FEN/board
                })
              }
            }
          }

          if (gamesToInsert.length > 0) {
            const { error } = await supabase.from('tournament_games').insert(gamesToInsert)
            if (error) console.log('game insert error', error.message)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
