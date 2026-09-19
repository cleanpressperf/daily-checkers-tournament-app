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
    // TEST MODE - CREATE TOURNAMENT FOR NOW IF NOT EXISTS
    const today = new Date().toISOString().split('T')[0]

    let { data: tournaments } = await supabase
   .from('tournaments')
   .select('id')
   .eq('date', today)

    // If no tournament today, create one NOW for testing
    if (!tournaments || tournaments.length === 0) {
      const { data: newT } = await supabase
     .from('tournaments')
     .insert({
        date: today,
        start_time: '19:00',
        status: 'live',
        name: `Test Tournament ${today}`
      })
     .select('id')
     .single()

      if (newT) tournaments = [newT]
    }

    if (!tournaments || tournaments.length === 0) {
      return NextResponse.json({ error: 'Could not create tournament' }, { status: 500 })
    }

    const tournament = tournaments[0]

    // Fill players
    const { data: existing } = await supabase
   .from('tournament_players')
   .select('id, username')
   .eq('tournament_id', tournament.id)

    const need = 32 - (existing?.length || 0)

    if (need > 0) {
      const shuffled = [...BOT_NAMES_96
