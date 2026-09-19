import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BOT_NAMES_96 = [
"Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"
]

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

      const { data: existing } = await supabase
     .from('tournament_players')
     .select('id, username')
     .eq('tournament_id', t.id)

      const need = 32 - (existing?.length || 0)

      if (need > 0) {
        const namesToUse = chunks[i] || chunks[0]
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

      const { count: matchCount } = await supabase
     .from('tournament_matches')
     .select('*', { count: 'exact', head: true })
     .eq('tournament_id', t.id)

      if ((matchCount || 0) === 0) {
        const { data: allPlayers } = await supabase
       .from('tournament_players')
       .select('id, username')
       .eq('tournament_id', t.id)

        if (allPlayers && allPlayers.length >= 2) {
          const playersShuffled = [...allPlayers].sort(() => Math.random() - 0.5)
          const matchesToInsert = []

          for (let table = 0; table < 8; table++) {
            const tablePlayers = playersShuffled.slice(table * 4, (table + 1) * 4)
            if (tablePlayers.length < 2) continue

            for (let a = 0; a < tablePlayers.length; a++) {
              for (let b = a + 1; b < tablePlayers.length; b++) {
                matchesToInsert.push({
                  tournament_id: t.id,
                  player1_username: tablePlayers[a].username,
                  player2_username: tablePlayers[b].username,
                  player1_id: tablePlayers[a].id,
                  player2_id: tablePlayers[b].id,
                  table_number: table + 1,
                  round: `Table ${table+1} Group Stage`,
                  status: 'live',
                  current_turn: 'player1',
                  board_fen: 'startpos'
                })
              }
            }
          }

          if (matchesToInsert.length > 0) {
            await supabase.from('tournament_matches').insert(matchesToInsert)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
