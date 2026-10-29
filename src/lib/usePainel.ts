"use client";

import { useEffect, useState } from "react";
import type { Kpi, Status } from "./kpis";
import type { Linha, Periodo, Resposta } from "./types";

export interface DadosPainel {
  geradoEm: string;
  kpis: Kpi[];
  tempoViagem: { linha: Linha; esperado: number; observado: number | null; indice: number | null; amostras: number; status: Status; alerta: string | null }[];
  cenarios: { linha: Linha; cenarios: { rotulo: string; min: number; amostras: number }[] }[];
  previsao: {
    fonte: "open-meteo" | "padrao";
    periodos: { periodo: Periodo; probChuva: number }[];
    recomendacoes: { linha: Linha; porPeriodo: { periodo: Periodo; clima: string; probChuva: number; tempoMin: number; headway: number; frota: number; delta: number }[] }[];
  };
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
