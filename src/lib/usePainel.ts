"use client";

import { useEffect, useState } from "react";
import type { Kpi, Status } from "./kpis";
import type { Linha, Periodo, Resposta } from "./types";

export interface DadosPainel {
  geradoEm: string;
  kpis: Kpi[];
  tempoViagem: { linha: Linha; esperado: number | null; observado: number | null; indice: number | null; amostras: number; status: Status; alerta: string | null }[];
  cenarios: { linha: Linha; cenarios: { rotulo: string; min: number | null; amostras: number }[] }[];
  fonteLinhas: { fonte: string; coletadoEm: string };
  previsao: {
    fonte: "open-meteo" | "padrao";
    periodos: { periodo: Periodo; probChuva: number }[];
    recomendacoes: { linha: Linha; porPeriodo: { periodo: Periodo; clima: string; probChuva: number; tempoMin: number | null; headway: number | null; frota: number | null; delta: number | null }[] }[];
  };
  confiabilidade: { pct: number; nivel: "alta" | "media" | "baixa"; simulados: number; fatores: { nome: string; valor: number; peso: number; detalhe: string }[] };
  plataformas: { plataforma: string; ocupacao: number | null; ocorrencias: number; relatos: number; status: Status; linhas: string[] }[];
  ultimas: Resposta[];
  totais: { respostas: number; reais: number };
}

/** Atualiza a cada `ms`. Com Supabase Realtime, troca-se o intervalo por uma assinatura. */
export function usePainel(ms = 5000) {
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    let vivo = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/painel", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const j = (await r.json()) as DadosPainel;
        if (vivo) { setDados(j); setErro(false); }
      } catch {
        if (vivo) setErro(true);
      }
    };
    tick();
    const id = setInterval(tick, ms);
    return () => { vivo = false; clearInterval(id); };
  }, [ms]);
  return { dados, erro };
}
