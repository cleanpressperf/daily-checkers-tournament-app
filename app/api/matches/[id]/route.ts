import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BOT_NAMES_96 } from '@/lib/bots/names'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await db.from('matches').select('id,tournament_id,round,board,move_number,last_move_at,status,table_number,player1_name,player2_name,winner_name').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  let player1Name = data.player1_name
  let player2Name = data.player2_name
  const { data: entries } = await db.from('tournament_entries').select('bot_name,is_bot,user_id').eq('tournament_id', data.tournament_id).eq('is_bot', true).order('id').limit(2)
  player1Name ||= entries?.[0]?.bot_name || BOT_NAMES_96[0]
  player2Name ||= entries?.[1]?.bot_name || BOT_NAMES_96[1]
  if (data.player1_name !== player1Name || data.player2_name !== player2Name) {
    await db.from('matches').update({ player1_name: player1Name, player2_name: player2Name }).eq('id', id)
  }
  return NextResponse.json({ match: { ...data, player1_name: player1Name, player2_name: player2Name, board_state: data.board } })
}
