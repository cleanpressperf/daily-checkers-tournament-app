import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 1. Get tournaments
    const { data: tournaments } = await supabase.from('tournaments').select('*').eq('status','registering')
    if (!tournaments?.length) return NextResponse.json({ msg: 'no registering tournaments' })

    // 2. Ensure bot users exist
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let botUsers = existingUsers.users.filter(u => u.email?.includes('@cleanpress.local'))

    // create up to 35 bots if needed
    const needed = 35 - botUsers.length
    for (let i = 0; i < needed; i++) {
      const idx = botUsers.length + i + 1
      const email = `bot${idx}@cleanpress.local`
      const { data } = await supabase.auth.admin.createUser({
        email,
        password: 'botpassword123!',
        email_confirm: true,
        user_metadata: { is_bot: true, name: `Bot ${idx}` }
      })
      if (data?.user) botUsers.push(data.user as any)
    }

    const allBotIds = botUsers.map(u => u.id)
    const results:any[] = []

    for (const tour of tournaments) {
      // 3. Count entries
      const { data: entries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      const currentCount = entries?.length || 0
      const needToFill = tour.max_players - currentCount

      // 4. Fill with bots not already entered
      const existingIds = new Set(entries?.map(e => e.user_id))
      const availableBots = allBotIds.filter(id =>!existingIds.has(id))

      const toInsert = availableBots.slice(0, needToFill).map(user_id => ({
        tournament_id: tour.id,
        user_id
      }))

      if (toInsert.length > 0) {
        await supabase.from('tournament_entries').insert(toInsert as any)
      }

      results.push({ tournament: tour.name, before: currentCount, added: toInsert.length, total: currentCount + toInsert.length })

      // 5. If full, start tournament and create matches if not exist
      const { data: updatedEntries } = await supabase.from('tournament_entries').select('user_id').eq('tournament_id', tour.id)
      if ((updatedEntries?.length || 0) >= tour.max_players) {
        const { data: existingMatches } = await supabase.from('matches').select('id').eq('tournament_id', tour.id).limit(1)
        if (!existingMatches?.length) {
          // create round 1 matches - simple pairing
          const players = updatedEntries!.map(e => e.user_id)
          for (let i = 0; i < players.length; i += 2) {
            if (players[i+1]) {
              // Try with common column names - will succeed with tournament_id+round at least
              await supabase.from('matches').insert({
                tournament_id: tour.id,
                round: 1,
                player1_id: players[i],
                player2_id: players[i+1],
                // try alternate names too if needed
                player_one: players[i],
                player_two: players[i+1],
                status: 'pending'
              } as any)
            }
          }
          // Update status to in_progress
          await supabase.from('tournaments').update({ status: 'in_progress' }).eq('id', tour.id)
          results[results.length-1].started = true
        }
      }
    }

    return NextResponse.json({ ok: true, bots: botUsers.length, results })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
