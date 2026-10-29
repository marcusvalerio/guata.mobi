// MÓDULO WAZE (complementar): ver src/waze/dados.ts.
import { after, connection } from "next/server";
import { previsaoAmanha } from "@/lib/clima";
import { local } from "@/lib/tempo";
import { trafegoWaze } from "@/waze/dados";
import { coletar, previsaoTransito } from "@/waze/historico";

export async function GET() {
  await connection();
  after(() => coletar().catch(() => {}));
  try {
    const amanha = new Date(Date.now() + 86400_000);
    const [w, clima] = await Promise.all([trafegoWaze(), previsaoAmanha()]);
    const previsao = await previsaoTransito(clima.periodos, local(amanha).fds).catch(() => null);
    return Response.json({ ...w, previsao });
  } catch (e) {
    return Response.json({ erro: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
