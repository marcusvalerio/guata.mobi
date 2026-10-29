export type Clima = "sol" | "nublado" | "chuva";
export type Transito = "livre" | "moderado" | "congestionado";
export type Periodo = "madrugada" | "manha" | "tarde" | "noite";

/** Resposta enviada pelo passageiro via QR Code. Anônima por desenho (LGPD). */
export interface Resposta {
  id: string;
  criadoEm: string; // ISO
  linhaId: string;
  plataforma: string;
  tempoViagemMin: number;
  esperaMin: number;
  saiuNoHorario: boolean;
  integracao: "nenhuma" | "barcas" | "municipal";
  tempoIntegracaoMin: number | null;
  lotacaoPlataforma: 1 | 2 | 3 | 4 | 5;
  satisfacao: 1 | 2 | 3 | 4 | 5;
  reclamacao: string | null;
  presenciouOcorrencia: boolean;
  clima: Clima;
  transito: Transito;
  simulado: boolean;
}

/** Ocorrência registrada pela equipe de operação do terminal. */
export interface Ocorrencia {
  id: string;
  criadoEm: string;
  tipo: "seguranca" | "lotacao" | "acessibilidade" | "manutencao" | "outro";
  local: string;
  descricao: string;
  autor: string;
  simulado: boolean;
}

/** Contagem de fluxo (pass/hora). Fonte plugável: manual, sensor, câmera, bilhetagem. */
export interface Contagem {
  id: string;
  criadoEm: string;
  fonte: "manual" | "sensor" | "camera" | "bilhetagem";
  local: string;
  passageiros: number;
  janelaMin: number;
  simulado: boolean;
}

export interface Linha {
  id: string;
  codigo: string;
  nome: string;
  plataforma: string;
  tipo: "municipal" | "intermunicipal";
  /** Tempo de referência em fluxo livre (min) e capacidade de plataforma. */
  tempoBaseMin: number;
  headwayMin: number;
  frota: number;
}

export type Papel = "central" | "admin" | "gestor" | "operador";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}
