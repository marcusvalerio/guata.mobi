import type { Banco } from "./store";
import { LINHAS } from "./store";

const H = 3600_000;

export interface Fator { nome: string; valor: number; peso: number; detalhe: string }

/**
 * Quanto dá para confiar no que o painel mostra agora (0–100).
 * - Origem: fatia de respostas reais (simuladas não contam como evidência).
 * - Volume: respostas reais nas últimas 24h contra uma meta mínima.
 * - Cobertura: linhas com pelo menos 3 relatos reais em 24h.
 * - Frescor: há quanto tempo chegou o último relato real.
 */
export function confiabilidade(b: Banco, agora = Date.now()) {
  const r24 = b.respostas.filter((r) => agora - Date.parse(r.criadoEm) <= 24 * H);
  const reais = r24.filter((r) => !r.simulado);
  const META_VOLUME = 120;

  const origem = r24.length ? reais.length / r24.length : 0;
  const volume = Math.min(1, reais.length / META_VOLUME);
  const comDados = LINHAS.filter((l) => reais.filter((r) => r.linhaId === l.id).length >= 3).length;
  const cobertura = comDados / LINHAS.length;
  const ultima = reais.at(-1);
  const minutos = ultima ? (agora - Date.parse(ultima.criadoEm)) / 60_000 : Infinity;
  // 100% até 15 min; cai pela metade a cada hora depois disso.
  const frescor = minutos <= 15 ? 1 : Math.pow(0.5, (minutos - 15) / 60);

  const fatores: Fator[] = [
    { nome: "Origem", valor: origem, peso: 0.3, detalhe: `${Math.round(origem * 100)}% das respostas de 24h são reais` },
    { nome: "Volume", valor: volume, peso: 0.3, detalhe: `${reais.length} de ${META_VOLUME} respostas reais esperadas em 24h` },
    { nome: "Cobertura", valor: cobertura, peso: 0.25, detalhe: `${comDados} de ${LINHAS.length} linhas com 3+ relatos reais` },
    { nome: "Frescor", valor: frescor, peso: 0.15, detalhe: ultima ? `último relato real há ${Math.round(minutos)} min` : "nenhum relato real ainda" },
  ];
  const pct = Math.round(fatores.reduce((a, f) => a + f.valor * f.peso, 0) * 100);
  const nivel = pct >= 75 ? "alta" : pct >= 45 ? "media" : "baixa";
  return { pct, nivel, fatores, simulados: r24.length - reais.length };
}
