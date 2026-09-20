import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Find latest tournament that needs filling - NOT just today
  const { data: tournaments, error } = await supabase
   .from("tournaments")
   .select("*")
   .order("created_at", { ascending: false })
   .limit(5);

  if (error ||!tournaments || tournaments.length === 0) {
    return NextResponse.json({ error: "No tournament", details: error }, { status: 404 });
  }

  // Pick the one that is open or upcoming
  let tournament = tournaments.find(t => t.status === 'registration_open' || t.status === 'upcoming' || t.status === 'open') || tournaments[0];

  // 2. Get participants count
  const { count: playerCount } = await supabase
   .from("tournament_participants")
   .select("*", { count: 'exact', head: true })
   .eq("tournament_id", tournament.id);

  // 3. If already has matches, don't refill
  const { count: matchCount } = await supabase
   .from("matches")
   .select("*", { count: 'exact', head: true })
   .eq("tournament_id", tournament.id);

  if (matchCount && matchCount > 0) {
    return NextResponse.json({
      success: true,
      message: `Already has ${matchCount} matches`,
      tournament_id: tournament.id,
      players: playerCount
    });
  }

  // 4. Get participants list and create simple brackets (round-robin pairs)
  const { data: participants } = await supabase
   .from("tournament_participants")
   .select("user_id, id")
   .eq("tournament_id", tournament.id);

  if (!participants || participants.length < 2) {
    return NextResponse.json({
      error: `Not enough players: ${participants?.length || 0}`,
      tournament_id: tournament.id
    }, { status: 400 });
  }

  // Create matches - simple pairing
  const matchesToInsert = [];
  for (let i = 0; i < participants.length; i += 2) {
    if (participants[i+1]) {
      matchesToInsert.push({
        tournament_id: tournament.id,
        player1_id: participants[i].user_id,
        player2_id: participants[i+1].user_id,
        round: 1,
        status: 'pending'
      });
    }
  }

  const { data: inserted, error: insertError } = await supabase
   .from("matches")
   .insert(matchesToInsert)
   .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    tournament_id: tournament.id,
    tournament_date: tournament.tournament_date,
    players: playerCount,
    matches_created: inserted?.length || 0
  });
}
