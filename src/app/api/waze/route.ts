// MÓDULO WAZE (complementar): ver src/waze/dados.ts.
import { connection } from "next/server";
import { trafegoWaze } from "@/waze/dados";

export async function GET() {
  await connection();
  try {
    return Response.json(await trafegoWaze());
  } catch (e) {
    return Response.json({ erro: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
