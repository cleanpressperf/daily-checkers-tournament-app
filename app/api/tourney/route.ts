import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    tier: "bronze",
    round: "Round of 32",
    serverMsg: "32 players in Round of 32",
    winners: []
  });
}
