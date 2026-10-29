import { after, connection } from "next/server";
import { coletar } from "@/waze/historico"; // MÓDULO WAZE
import { previsaoAmanha } from "@/lib/clima";
import { calcularKpis, cenarios, indiceTempoViagem, porPlataforma, recomendacoes } from "@/lib/kpis";
import { confiabilidade } from "@/lib/confiabilidade";
import { banco, FONTE_LINHAS } from "@/lib/store";

export async function GET() {
  await connection();
  // MÓDULO WAZE: painel ou telão abertos também alimentam o histórico de trânsito.
  after(() => coletar().catch(() => {}));
  const agora = Date.now();
  const amanha = new Date(agora + 24 * 3600_000);
  const [prev, b] = await Promise.all([previsaoAmanha(), banco()]);
  return Response.json({
    geradoEm: new Date(agora).toISOString(),
    kpis: calcularKpis(b, agora),
    confiabilidade: confiabilidade(b, agora),
    plataformas: porPlataforma(b, agora),
    tempoViagem: indiceTempoViagem(b, agora),
    cenarios: b.linhas.map((l) => ({ linha: l, cenarios: cenarios(b, l) })),
    previsao: { fonte: prev.fonte, periodos: prev.periodos, recomendacoes: recomendacoes(b, prev.periodos, amanha) },
    fonteLinhas: FONTE_LINHAS,
    ultimas: b.respostas.slice(-8).reverse(),
    totais: { respostas: b.respostas.length, reais: b.respostas.filter((r) => !r.simulado).length },
  });
}
