import { connection } from "next/server";
import { previsaoAmanha } from "@/lib/clima";
import { calcularKpis, cenarios, indiceTempoViagem, recomendacoes } from "@/lib/kpis";
import { banco, LINHAS } from "@/lib/store";

export async function GET() {
  await connection();
  const agora = Date.now();
  const amanha = new Date(agora + 24 * 3600_000);
  const prev = await previsaoAmanha();
  const b = banco();
  return Response.json({
    geradoEm: new Date(agora).toISOString(),
    kpis: calcularKpis(agora),
    tempoViagem: indiceTempoViagem(agora),
    cenarios: LINHAS.map((l) => ({ linha: l, cenarios: cenarios(l) })),
    previsao: { fonte: prev.fonte, periodos: prev.periodos, recomendacoes: recomendacoes(prev.periodos, amanha) },
    ultimas: b.respostas.slice(-8).reverse(),
    totais: { respostas: b.respostas.length, reais: b.respostas.filter((r) => !r.simulado).length },
  });
}
