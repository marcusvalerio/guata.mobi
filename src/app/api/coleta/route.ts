// MÓDULO WAZE (complementar): coleta periódica do histórico de trânsito.
// Chamado pelo agendamento do GitHub Actions a cada 10 minutos. Só lê dados
// públicos e respeita um intervalo mínimo entre coletas, então não precisa de chave.
import { connection } from "next/server";
import { coletar } from "@/waze/historico";

export async function GET() {
  await connection();
  try {
    return Response.json(await coletar());
  } catch (e) {
    return Response.json({ erro: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
