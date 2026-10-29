import { connection } from "next/server";
import { previsaoAmanha } from "@/lib/clima";
import { banco } from "@/lib/store";

export async function GET() {
  await connection();
  const b = banco();
  const agora = Date.now();
  const ultimaHora = b.respostas.filter((r) => agora - Date.parse(r.criadoEm) < 3600_000).length;
  const ultimaReal = b.respostas.filter((r) => !r.simulado).at(-1)?.criadoEm ?? null;
  const t0 = performance.now();
  const clima = await previsaoAmanha();
  const latClima = Math.round(performance.now() - t0);
  return Response.json({
    em: new Date(agora).toISOString(),
    iniciadoEm: b.iniciadoEm,
    banco: { modo: process.env.DATABASE_URL ? "postgres" : "memoria", respostas: b.respostas.length, ocorrencias: b.ocorrencias.length, contagens: b.contagens.length },
    coleta: { ultimaHora, ultimaReal },
    integracoes: [
      { nome: "Previsão do tempo (Open-Meteo)", estado: clima.fonte === "open-meteo" ? "ok" : "falha", detalhe: clima.erro ?? `${latClima} ms` },
      { nome: "MOBNIT · GTFS de itinerários", estado: "pendente", detalhe: "Aguardando liberação do arquivo GTFS" },
      { nome: "NitTrans · contagens volumétricas", estado: "pendente", detalhe: "Aguardando convênio" },
      { nome: "Gêmeo Digital · camadas ArcGIS", estado: "pendente", detalhe: "Aguardando endpoints do SIGeo" },
      { nome: "Bilhetagem (validadores dos ônibus)", estado: "pendente", detalhe: "Depende de acordo com consórcios" },
      { nome: "Sensores de contagem do terminal", estado: process.env.GUATA_CHAVE_INTEGRACAO ? "ok" : "pendente", detalhe: "POST /api/contagens com x-guata-chave" },
    ],
    erros: b.erros.slice(-20).reverse(),
  });
}
