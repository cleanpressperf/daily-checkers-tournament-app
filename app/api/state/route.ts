import { kv } from "@vercel/kv";
export const dynamic = 'force-dynamic';
export async function GET(){
  const state = await kv.get("checkers_tournament_v2");
  return Response.json(state || null);
}
export async function POST(req:Request){
  const body = await req.json();
  await kv.set("checkers_tournament_v2", body);
  return Response.json({ok:true});
}
