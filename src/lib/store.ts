import type { Clima, Contagem, Linha, Ocorrencia, Resposta, Transito, Usuario } from "./types";
import { local, periodoDe } from "./tempo";

/**
 * Armazenamento em memória para o protótipo. A interface (listar/adicionar)
 * é a mesma que o adaptador de banco (Supabase/Postgres) vai implementar,
 * então as telas não mudam quando o banco real for ligado.
 */

// Linhas de exemplo — substituir pelo GTFS do MOBNIT quando disponível.
export const LINHAS: Linha[] = [
  { id: "l1", codigo: "38", nome: "Centro – Alcântara", plataforma: "A", tipo: "intermunicipal", tempoBaseMin: 34, headwayMin: 10, frota: 8 },
  { id: "l2", codigo: "33", nome: "Centro – Icaraí", plataforma: "B", tipo: "municipal", tempoBaseMin: 10, headwayMin: 6, frota: 5 },
  { id: "l3", codigo: "47", nome: "Centro – Charitas", plataforma: "B", tipo: "municipal", tempoBaseMin: 18, headwayMin: 12, frota: 4 },
  { id: "l4", codigo: "39", nome: "Centro – Itaipu", plataforma: "C", tipo: "municipal", tempoBaseMin: 42, headwayMin: 15, frota: 7 },
  { id: "l5", codigo: "110", nome: "Niterói – Rio (Ponte)", plataforma: "D", tipo: "intermunicipal", tempoBaseMin: 28, headwayMin: 8, frota: 9 },
  { id: "l6", codigo: "425", nome: "Niterói – Manilha (BR-101)", plataforma: "E", tipo: "intermunicipal", tempoBaseMin: 46, headwayMin: 20, frota: 6 },
];

export const PLATAFORMAS = ["A", "B", "C", "D", "E"];

export const USUARIOS_DEMO: Usuario[] = [
  { id: "u1", nome: "Equipe Guatá", email: "central@guata.mobi", papel: "central" },
  { id: "u2", nome: "Administração do Terminal", email: "admin@terminal.exemplo", papel: "admin" },
  { id: "u3", nome: "Gestão Operacional", email: "gestor@terminal.exemplo", papel: "gestor" },
  { id: "u4", nome: "Operador de Plataforma", email: "operador@terminal.exemplo", papel: "operador" },
];

interface Banco {
  respostas: Resposta[];
  ocorrencias: Ocorrencia[];
  contagens: Contagem[];
  iniciadoEm: string;
  erros: { em: string; msg: string }[];
}

const g = globalThis as unknown as { __guata?: Banco };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** Fator multiplicativo sobre o tempo base — o mesmo que o modelo tenta reaprender. */
export function fatorCondicao(d: Date, clima: Clima, transito: Transito) {
  const { fds } = local(d);
  const p = periodoDe(d);
  let f = 1;
  if (clima === "chuva") f *= 1.45;
  if (transito === "moderado") f *= 1.2;
  if (transito === "congestionado") f *= 1.65;
  if (fds) f *= 0.8;
  if (p === "madrugada") f *= 0.42;
  return f;
}

function simular(dias: number): Banco {
  const r = rng(20261029);
  const respostas: Resposta[] = [];
  const ocorrencias: Ocorrencia[] = [];
  const contagens: Contagem[] = [];
  const agora = Date.now();
  for (let i = dias * 24; i >= 0; i--) {
    const d = new Date(agora - i * 3600_000);
    const { hora: h, fds } = local(d);
    const pico = (h >= 6 && h <= 9) || (h >= 17 && h <= 19);
    const chuvoso = Math.floor((agora - i * 3600_000) / 86400_000) % 4 === 1 || r() < 0.08;
    const clima: Clima = chuvoso ? "chuva" : r() < 0.3 ? "nublado" : "sol";
    const base = h < 5 ? 0.15 : pico ? 1 : 0.55;
    const demanda = base * (fds ? 0.6 : 1) * (clima === "chuva" ? 1.1 : 1);
    const n = Math.round(demanda * 9 * (0.6 + r() * 0.8));
    contagens.push({
      id: uid(), criadoEm: d.toISOString(), fonte: "manual", local: "Entrada principal",
      passageiros: Math.round(demanda * 4200 * (0.85 + r() * 0.3)), janelaMin: 60, simulado: true,
    });
    for (let k = 0; k < n; k++) {
      const linha = LINHAS[Math.floor(r() * LINHAS.length)];
      const transito: Transito = pico && !fds
        ? r() < (clima === "chuva" ? 0.7 : 0.45) ? "congestionado" : "moderado"
        : r() < 0.15 ? "moderado" : "livre";
      const t = new Date(d.getTime() - r() * 3600_000);
      const tempo = linha.tempoBaseMin * fatorCondicao(t, clima, transito) * (0.85 + r() * 0.3);
      const espera = linha.headwayMin * (0.3 + r() * (transito === "congestionado" ? 1.6 : 0.9));
      const lot = Math.min(5, Math.max(1, Math.round((pico ? 3.6 : 2) + (r() - 0.5) * 2))) as Resposta["lotacaoPlataforma"];
      const sat = Math.min(5, Math.max(1, Math.round(4.4 - (tempo / linha.tempoBaseMin - 1) * 1.6 - (lot - 2) * 0.35 + (r() - 0.5)))) as Resposta["satisfacao"];
      const integ = r() < 0.25 ? "barcas" : r() < 0.35 ? "municipal" : "nenhuma";
      respostas.push({
        id: uid(), criadoEm: t.toISOString(), linhaId: linha.id, plataforma: linha.plataforma,
        tempoViagemMin: Math.round(tempo), esperaMin: Math.round(espera),
        saiuNoHorario: espera <= linha.headwayMin * 1.15,
        integracao: integ, tempoIntegracaoMin: integ === "nenhuma" ? null : Math.round(6 + r() * 14 * (pico ? 1.4 : 1)),
        lotacaoPlataforma: lot, satisfacao: sat,
        reclamacao: sat <= 2 && r() < 0.5 ? "Demora e plataforma cheia" : null,
        presenciouOcorrencia: r() < 0.03, clima, transito, simulado: true,
      });
    }
    if (r() < 0.06) {
      const tipos: Ocorrencia["tipo"][] = ["seguranca", "lotacao", "acessibilidade", "manutencao"];
      ocorrencias.push({
        id: uid(), criadoEm: d.toISOString(), tipo: tipos[Math.floor(r() * tipos.length)],
        local: `Plataforma ${PLATAFORMAS[Math.floor(r() * PLATAFORMAS.length)]}`,
        descricao: "Registro simulado", autor: "Operador de Plataforma", simulado: true,
      });
    }
  }
  respostas.sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  return { respostas, ocorrencias, contagens, iniciadoEm: new Date().toISOString(), erros: [] };
}

export function banco(): Banco {
  if (!g.__guata) g.__guata = simular(28);
  return g.__guata;
}

export function adicionarResposta(r: Omit<Resposta, "id" | "criadoEm" | "simulado">) {
  const nova: Resposta = { ...r, id: uid(), criadoEm: new Date().toISOString(), simulado: false };
  banco().respostas.push(nova);
  return nova;
}

export function adicionarOcorrencia(o: Omit<Ocorrencia, "id" | "criadoEm" | "simulado">) {
  const nova: Ocorrencia = { ...o, id: uid(), criadoEm: new Date().toISOString(), simulado: false };
  banco().ocorrencias.push(nova);
  return nova;
}

export function adicionarContagem(c: Omit<Contagem, "id" | "criadoEm" | "simulado">) {
  const nova: Contagem = { ...c, id: uid(), criadoEm: new Date().toISOString(), simulado: false };
  banco().contagens.push(nova);
  return nova;
}

export function registrarErro(msg: string) {
  banco().erros.push({ em: new Date().toISOString(), msg });
}

export function reiniciarSimulacao() {
  g.__guata = simular(28);
}

export function removerSimulados() {
  const b = banco();
  b.respostas = b.respostas.filter((x) => !x.simulado);
  b.ocorrencias = b.ocorrencias.filter((x) => !x.simulado);
  b.contagens = b.contagens.filter((x) => !x.simulado);
}
