import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!)

const BOT_NAMES_96 = ["Marlo Stanfield","Thomas Shelby","Arthur Shelby","John Shelby","Finn","Michael Gray","Polly Gray","Ada Shelby","Isaiah","Jeremiah","Jimmy MC Cavin","Aberama Gold","Mrs. Changretta","Alfie Solomons","Luca Changretta","Shank","Michael Corleone","Vito Corleone","Sonny Corleone","Fredo Corleone","Tom Hagen","Don Barzini","Carlo Rizzi","Omar Little","Stringer Bell","Avon Barksdale","Jimmy McNulty","Lester Freamon","Proposition Joe","Franklin Saint","Leon Simmons","Jerome Saints","Louie Saints","Teddy McDonald","Manboy","Gustavo","Esme Shelby","Lizzie Stark","Freddie Thornes","Grace Burgess","May Carleton","Billy Kimber","Darby Sabini","Oswald Mosley","Winston Churchill","Johnny Dogs","Curly","Jack Nelson","Bodie Broadus","Slim","Snoop","Michael","D'Angelo","Fat Rick","Chris","Spider","Wee-bey Brice","Brother Mouzone","Bubble","Dukie","Namond Brice","Clay Davis","Bunk","Kima","Cheese","Hungry Man","Cutty","Skully","Ray-Ray","Connie Corleone","Kay Adams","Apollonia","Luca Brasi","Salvatore Tessio","Peter Clemenza","Moe Greene","Hyman Roth","Rothschild","Rocco Lampone","Don Fanucci","Vincent Mancini","Carmine Cuneo","Emilio Barzini","Johnny Fontane","Khadija","Wanda","Irene Abe","Matt McDonald","Cissy Saints","Kane Hamilton","Rob Volpe","Soledad","Parissa","Andre Wright","Claudia came","Kevin Hamilton"]

export async function GET() {
  const now = new Date()
  const { data: tournaments } = await supabase.from('tournaments').select('*').order('created_at',{ascending:false}).limit(1)
  let tournament = tournaments?.[0]
  if(!tournament){
    const { data } = await supabase.from('tournaments').insert({ status: 'in_progress' }).select().single()
    tournament = data
  }
  if(tournament.status === 'completed'){
    const endedAt = new Date(tournament.completed_at || tournament.updated_at)
    const diffMins = (now.getTime() - endedAt.getTime()) / 60000
    if(diffMins < 30){
      return Response.json({ ok:true, mode:'winner_display', winner: tournament.winner_name, remaining: Math.ceil(30-diffMins) })
    } else {
      const { data: newT } = await supabase.from('tournaments').insert({ status: 'in_progress' }).select().single()
      await supabase.from('tournament_matches').delete().gt('id',0)
      const shuffled = [...BOT_NAMES_96].sort(()=>0.5-Math.random()).slice(0,32)
      const matches = []
      for(let i=0;i<32;i+=2){
        matches.push({ tournament_id: newT.id, table_number: (i/2)+1, round: 1, player1_id: shuffled[i], player2_id: shuffled[i+1], status: 'playing' })
      }
      await supabase.from('tournament_matches').insert(matches)
      return Response.json({ ok:true, mode:'new_tournament_started', id: newT.id })
    }
  }
  const startedAt = new Date(tournament.created_at)
  const runMins = (now.getTime() - startedAt.getTime()) / 60000
  if(runMins > 55){
    const winner = BOT_NAMES_96[Math.floor(Math.random()*BOT_NAMES_96.length)]
    await supabase.from('tournaments').update({ status: 'completed', winner_name: winner, completed_at: now.toISOString() }).eq('id', tournament.id)
    return Response.json({ ok:true, mode:'tournament_ended', winner })
  }
  return Response.json({ ok:true, mode:'playing', runMins: Math.ceil(runMins) })
}
