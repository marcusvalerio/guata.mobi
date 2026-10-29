import { LINHAS, PLATAFORMAS, type Banco } from "./store";
import { local, periodoDe } from "./tempo";
import type { Clima, Linha, Periodo, Resposta } from "./types";

export type Status = "ok" | "atencao" | "critico";

export interface Kpi {
  dimensao: string;
  indicador: string;
  objetivo: string;
  valor: number | null;
  unidade: string;
  status: Status;
  detalhe: string;
  serie: number[]; // últimas 24h, uma posição por hora
}

const H = 3600_000;
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const desde = <T extends { criadoEm: string }>(xs: T[], ms: number, agora: number) =>
  xs.filter((x) => agora - Date.parse(x.criadoEm) <= ms);

function porHora<T extends { criadoEm: string }>(xs: T[], agora: number, f: (grupo: T[]) => number | null) {
  const out: number[] = [];
  for (let i = 23; i >= 0; i--) {
    const ini = agora - (i + 1) * H, fim = agora - i * H;
    const g = xs.filter((x) => { const t = Date.parse(x.criadoEm); return t > ini && t <= fim; });
    out.push(f(g) ?? 0);
  }
  return out;
}

const faixa = (v: number | null, bom: number, ruim: number): Status => {
  if (v === null) return "atencao";
  const crescente = ruim > bom; // valores maiores são piores
  if (crescente) return v <= bom ? "ok" : v >= ruim ? "critico" : "atencao";
  return v >= bom ? "ok" : v <= ruim ? "critico" : "atencao";
};

/** Seis dimensões da Tabela 1 (Gaze et al., 2026). */
export function calcularKpis(b: Banco, agora = Date.now()): Kpi[] {
  const r24 = desde(b.respostas, 24 * H, agora);
  const r3 = desde(b.respostas, 3 * H, agora);

  // Demanda — passageiros/hora pela fonte de contagem mais recente.
  const c24 = desde(b.contagens, 24 * H, agora);
  const serieDemanda = porHora(c24, agora, (g) => (g.length ? g.reduce((a, c) => a + c.passageiros * (60 / c.janelaMin), 0) / g.length : null));
  const demandaAgora = serieDemanda[23] || serieDemanda[22] || null;
  const picoIdx = serieDemanda.indexOf(Math.max(...serieDemanda));
  const horaPico = local(new Date(agora - (23 - picoIdx) * H)).hora;

  // Operação — partidas no horário segundo o passageiro.
  const pont = r24.length ? (r24.filter((r) => r.saiuNoHorario).length / r24.length) * 100 : null;
  const espera = media(r24.map((r) => r.esperaMin));

  // Infraestrutura — lotação percebida (1–5) convertida em %.
  const ocup = (rs: Resposta[]) => media(rs.map((r) => ((r.lotacaoPlataforma - 1) / 4) * 100));
  const porPlat = PLATAFORMAS.map((p) => ({ p, v: ocup(r3.filter((r) => r.plataforma === p)) }));
  const maisCheia = porPlat.reduce((a, c) => ((c.v ?? 0) > (a.v ?? 0) ? c : a), porPlat[0]);
  const ocupAgora = ocup(r3);

  // Acessibilidade — integração com barcas e linhas municipais.
  const integ = r24.filter((r) => r.tempoIntegracaoMin !== null);
  const tInteg = media(integ.map((r) => r.tempoIntegracaoMin!));
  const tBarcas = media(integ.filter((r) => r.integracao === "barcas").map((r) => r.tempoIntegracaoMin!));

  // Satisfação — Likert e volume de reclamações.
  const sat = media(r24.map((r) => r.satisfacao));
  const recl = r24.filter((r) => r.reclamacao).length;

  // Segurança — ocorrências da operação + relatos dos passageiros (7 dias).
  const o7 = desde(b.ocorrencias, 7 * 24 * H, agora);
  const relatos = desde(b.respostas, 7 * 24 * H, agora).filter((r) => r.presenciouOcorrencia).length;
  const locais = new Map<string, number>();
  o7.forEach((o) => locais.set(o.local, (locais.get(o.local) ?? 0) + 1));
  const pior = [...locais.entries()].sort((a, b) => b[1] - a[1])[0];

  return [
    {
      dimensao: "Demanda", indicador: "Fluxo de embarque e desembarque", objetivo: "Identificar picos de lotação e dimensionar filas.",
      valor: demandaAgora && Math.round(demandaAgora), unidade: "pass/h",
      status: faixa(demandaAgora, 3200, 4600), detalhe: `Pico nas últimas 24h às ${horaPico}h`,
      serie: serieDemanda,
    },
    {
      dimensao: "Operação", indicador: "Índice de pontualidade e regularidade", objetivo: "Monitorar cumprimento de tabelas horárias.",
      valor: pont && Math.round(pont), unidade: "%",
      status: faixa(pont, 85, 70), detalhe: `Espera média ${espera?.toFixed(0) ?? "–"} min`,
      serie: porHora(r24, agora, (g) => (g.length ? (g.filter((r) => r.saiuNoHorario).length / g.length) * 100 : null)),
    },
    {
      dimensao: "Infraestrutura", indicador: "Taxa de ocupação de plataformas", objetivo: "Otimizar alocação de ônibus e tempos de permanência.",
      valor: ocupAgora && Math.round(ocupAgora), unidade: "%",
      status: faixa(maisCheia.v, 55, 75), detalhe: `Plataforma ${maisCheia.p} mais cheia (${Math.round(maisCheia.v ?? 0)}%)`,
      serie: porHora(r24, agora, ocup),
    },
    {
      dimensao: "Acessibilidade", indicador: "Tempo médio de integração intermodal", objetivo: "Avaliar fluidez com barcas e linhas municipais.",
      valor: tInteg && Math.round(tInteg), unidade: "min",
      status: faixa(tInteg, 10, 16), detalhe: `Barcas: ${tBarcas?.toFixed(0) ?? "–"} min`,
      serie: porHora(integ, agora, (g) => media(g.map((r) => r.tempoIntegracaoMin!))),
    },
    {
      dimensao: "Satisfação", indicador: "Volume de reclamações e escore médio", objetivo: "Incorporar a percepção do usuário na gestão.",
      valor: sat && Number(sat.toFixed(1)), unidade: "/ 5",
      status: faixa(sat, 3.8, 3), detalhe: `${recl} reclamações em 24h`,
      serie: porHora(r24, agora, (g) => media(g.map((r) => r.satisfacao))),
    },
    {
      dimensao: "Segurança", indicador: "Nº de ocorrências registradas", objetivo: "Subsidiar ações de segurança e sinalização.",
      valor: o7.length, unidade: "em 7 dias",
      status: faixa(o7.length, 6, 14), detalhe: pior ? `${pior[0]} concentra ${pior[1]} · ${relatos} relatos de passageiros` : `${relatos} relatos de passageiros`,
      serie: porHora(desde(b.ocorrencias, 24 * H, agora), agora, (g) => g.length),
    },
  ];
}

/* ---------- Tempo de viagem: estimativa por condição ---------- */

export interface Condicao { clima: Clima; fds: boolean; periodo: Periodo }

/** Média histórica para a linha na condição; afrouxa o filtro se houver poucas amostras. */
export function estimarTempo(b: Banco, linha: Linha, c: Condicao) {
  const rs = b.respostas.filter((r) => r.linhaId === linha.id);
  const climaDe = (r: Resposta) => (r.clima === "chuva" ? "chuva" : "seco");
  const alvo = c.clima === "chuva" ? "chuva" : "seco";
  const tentativas: ((r: Resposta) => boolean)[] = [
    (r) => climaDe(r) === alvo && local(new Date(r.criadoEm)).fds === c.fds && periodoDe(new Date(r.criadoEm)) === c.periodo,
    (r) => climaDe(r) === alvo && periodoDe(new Date(r.criadoEm)) === c.periodo,
    (r) => climaDe(r) === alvo,
  ];
  for (const f of tentativas) {
    const xs = rs.filter(f).map((r) => r.tempoViagemMin).sort((a, b) => a - b);
    if (xs.length >= 8) {
      // Mediana: robusta a respostas exageradas.
      return { min: xs[Math.floor(xs.length / 2)], amostras: xs.length };
    }
  }
  return { min: linha.tempoBaseMin, amostras: 0 };
}

export function cenarios(b: Banco, linha: Linha) {
  return [
    { rotulo: "Dia útil, sol", c: { clima: "sol", fds: false, periodo: "tarde" } as Condicao },
    { rotulo: "Dia útil, chuva", c: { clima: "chuva", fds: false, periodo: "tarde" } as Condicao },
    { rotulo: "Fim de semana", c: { clima: "sol", fds: true, periodo: "tarde" } as Condicao },
    { rotulo: "Madrugada", c: { clima: "sol", fds: false, periodo: "madrugada" } as Condicao },
  ].map((x) => ({ rotulo: x.rotulo, ...estimarTempo(b, linha, x.c) }));
}

/** Índice de tempo de viagem: observado nas últimas 2h ÷ esperado para a condição atual. */
export function indiceTempoViagem(b: Banco, agora = Date.now()) {
  const r2 = desde(b.respostas, 2 * H, agora);
  const ag = new Date(agora);
  return LINHAS.map((l) => {
    const rs = r2.filter((r) => r.linhaId === l.id);
    const climaAtual = rs.at(-1)?.clima ?? "sol";
    const esperado = estimarTempo(b, l, { clima: climaAtual, fds: local(ag).fds, periodo: periodoDe(ag) }).min;
    const observado = media(rs.map((r) => r.tempoViagemMin));
    const indice = observado ? observado / esperado : null;
    const ultimo = rs.at(-1);
    return {
      linha: l, esperado, observado: observado && Math.round(observado), indice,
      amostras: rs.length,
      status: (indice === null ? "atencao" : indice <= 1.15 ? "ok" : indice <= 1.5 ? "atencao" : "critico") as Status,
      alerta: ultimo && ultimo.tempoViagemMin > esperado * 2 ? `Relato recente de ${ultimo.tempoViagemMin} min` : null,
    };
  });
}

/* ---------- Previsão do dia seguinte e recomendações ---------- */

export interface PrevisaoClima { periodo: Periodo; probChuva: number }

export function recomendacoes(b: Banco, previsao: PrevisaoClima[], amanha: Date) {
  const fds = local(amanha).fds;
  return LINHAS.map((l) => {
    const porPeriodo = previsao.map((p) => {
      const clima: Clima = p.probChuva >= 50 ? "chuva" : "sol";
      const est = estimarTempo(b, l, { clima, fds, periodo: p.periodo });
      const ratio = est.min / l.tempoBaseMin;
      // Ciclo = ida + volta + 10 min de terminal; frota para manter o headway.
      const headway = ratio > 1.3 ? Math.max(4, Math.round(l.headwayMin / Math.min(ratio, 1.5))) : l.headwayMin;
      const ciclo = est.min * 2 + 10;
      const frota = Math.ceil(ciclo / headway);
      return { periodo: p.periodo, clima, probChuva: p.probChuva, tempoMin: est.min, headway, frota, delta: frota - l.frota };
    });
    return { linha: l, porPeriodo };
  });
}
