import { neon } from "@neondatabase/serverless";
import SIGEO from "./linhas-sigeo.json";
import type { Contagem, Linha, Ocorrencia, Resposta, Usuario } from "./types";

/**
 * Dados do terminal. Em produção ficam no Neon (Postgres); sem DATABASE_URL,
 * em memória (vazio) — útil para rodar localmente sem banco. Nada é simulado:
 * o painel mostra só o que passageiros, operação e fontes oficiais registram.
 */

export const PLATAFORMAS = ["A", "B", "C", "D", "E"];
export const FONTE_LINHAS = { fonte: SIGEO.fonte, coletadoEm: SIGEO.coletadoEm };

export const USUARIOS_DEMO: Usuario[] = [
  { id: "u1", nome: "Equipe PIRN", email: "central@pirn.exemplo", papel: "central" },
  { id: "u2", nome: "Administração do Terminal", email: "admin@terminal.exemplo", papel: "admin" },
  { id: "u3", nome: "Gestão Operacional", email: "gestor@terminal.exemplo", papel: "gestor" },
  { id: "u4", nome: "Operador de Plataforma", email: "operador@terminal.exemplo", papel: "operador" },
];

export type ConfigLinha = Pick<Linha, "plataforma" | "headwayMin" | "frota">;

export interface Banco {
  linhas: Linha[];
  respostas: Resposta[];
  ocorrencias: Ocorrencia[];
  contagens: Contagem[];
  iniciadoEm: string;
  erros: { em: string; msg: string }[];
}

/** Linhas oficiais (SIGeo) com o que a Administração cadastrou por cima. */
function montarLinhas(config: Map<string, ConfigLinha>): Linha[] {
  return SIGEO.linhas.map((l) => ({
    id: l.id, codigo: l.codigo, nome: l.nome, consorcio: l.consorcio,
    extensaoKm: l.extensaoKm || null,
    plataforma: null, headwayMin: null, frota: null,
    ...config.get(l.id),
  }));
}

export const linhaValida = (id: unknown) => SIGEO.linhas.some((l) => l.id === id);

const uid = () => Math.random().toString(36).slice(2, 10);

const URL_BANCO = process.env.DATABASE_URL;
export const MODO_BANCO = URL_BANCO ? "postgres" : "memoria";
const sql = URL_BANCO ? neon(URL_BANCO) : null;
const JANELA_DIAS = 35;

const g = globalThis as unknown as { __guata?: Banco & { config: Map<string, ConfigLinha> } };
function memoria() {
  if (!g.__guata) {
    const config = new Map<string, ConfigLinha>();
    g.__guata = { config, linhas: montarLinhas(config), respostas: [], ocorrencias: [], contagens: [], erros: [], iniciadoEm: new Date().toISOString() };
  }
  return g.__guata;
}

const iso = <T>(rows: Record<string, unknown>[]) =>
  rows.map((r) => ({ ...r, criadoEm: new Date(r.criadoEm as string).toISOString() })) as unknown as T[];

async function inserir(tabela: "respostas" | "ocorrencias" | "contagens", linha: object) {
  const json = JSON.stringify([linha]);
  if (tabela === "respostas") await sql!`insert into respostas select * from json_populate_recordset(null::respostas, ${json}::json)`;
  if (tabela === "ocorrencias") await sql!`insert into ocorrencias select * from json_populate_recordset(null::ocorrencias, ${json}::json)`;
  if (tabela === "contagens") await sql!`insert into contagens select * from json_populate_recordset(null::contagens, ${json}::json)`;
}

export async function banco(): Promise<Banco> {
  if (!sql) {
    const m = memoria();
    m.linhas = montarLinhas(m.config);
    return m;
  }
  const desde = new Date(Date.now() - JANELA_DIAS * 86400_000).toISOString();
  const [respostas, ocorrencias, contagens, erros, cfg] = await Promise.all([
    sql`select * from respostas where "criadoEm" > ${desde} and not simulado order by "criadoEm"`,
    sql`select * from ocorrencias where "criadoEm" > ${desde} and not simulado order by "criadoEm"`,
    sql`select * from contagens where "criadoEm" > ${desde} and not simulado order by "criadoEm"`,
    sql`select em, msg from erros order by id desc limit 20`,
    sql`select * from linhas_config`,
  ]);
  const config = new Map(cfg.map((c) => [c.id as string, { plataforma: c.plataforma, headwayMin: c.headwayMin, frota: c.frota } as ConfigLinha]));
  return {
    linhas: montarLinhas(config),
    respostas: iso<Resposta>(respostas),
    ocorrencias: iso<Ocorrencia>(ocorrencias),
    contagens: iso<Contagem>(contagens),
    erros: erros.map((e) => ({ em: new Date(e.em).toISOString(), msg: e.msg })).reverse(),
    iniciadoEm: new Date().toISOString(),
  };
}

export async function salvarLinha(id: string, c: ConfigLinha) {
  if (!sql) { memoria().config.set(id, c); return; }
  await sql`insert into linhas_config (id, plataforma, "headwayMin", frota) values (${id}, ${c.plataforma}, ${c.headwayMin}, ${c.frota})
    on conflict (id) do update set plataforma = excluded.plataforma, "headwayMin" = excluded."headwayMin", frota = excluded.frota`;
}

export async function adicionarResposta(r: Omit<Resposta, "id" | "criadoEm" | "simulado">) {
  const nova: Resposta = { ...r, id: uid(), criadoEm: new Date().toISOString(), simulado: false };
  if (sql) await inserir("respostas", nova); else memoria().respostas.push(nova);
  return nova;
}

export async function adicionarOcorrencia(o: Omit<Ocorrencia, "id" | "criadoEm" | "simulado">) {
  const nova: Ocorrencia = { ...o, id: uid(), criadoEm: new Date().toISOString(), simulado: false };
  if (sql) await inserir("ocorrencias", nova); else memoria().ocorrencias.push(nova);
  return nova;
}

export async function adicionarContagem(c: Omit<Contagem, "id" | "criadoEm" | "simulado">) {
  const nova: Contagem = { ...c, id: uid(), criadoEm: new Date().toISOString(), simulado: false };
  if (sql) await inserir("contagens", nova); else memoria().contagens.push(nova);
  return nova;
}

export async function registrarErro(msg: string) {
  if (sql) await sql`insert into erros (msg) values (${msg.slice(0, 500)})`.catch(() => {});
  else memoria().erros.push({ em: new Date().toISOString(), msg });
}
