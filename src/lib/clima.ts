import type { PrevisaoClima } from "./kpis";
import type { Periodo } from "./types";

// Terminal Presidente João Goulart, Niterói.
const LAT = -22.8945, LON = -43.1239;

let cache: { em: number; dados: Awaited<ReturnType<typeof buscar>> } | null = null;

async function buscar() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=precipitation_probability&timezone=America%2FSao_Paulo&forecast_days=2`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000), cache: "no-store" });
  if (!res.ok) throw new Error(`Open Meteo ${res.status}`);
  const j = (await res.json()) as { hourly: { time: string[]; precipitation_probability: number[] } };
  return j.hourly;
}

/** Probabilidade de chuva de amanhã por período. Sem rede, cai num padrão conservador. */
export async function previsaoAmanha(): Promise<{ fonte: "open-meteo" | "padrao"; erro?: string; periodos: PrevisaoClima[] }> {
  try {
    if (!cache || Date.now() - cache.em > 30 * 60_000) cache = { em: Date.now(), dados: await buscar() };
    const { time, precipitation_probability } = cache.dados;
    const amanha = time[24]?.slice(0, 10);
    const acc = new Map<Periodo, number[]>();
    time.forEach((t, i) => {
      if (!t.startsWith(amanha)) return;
      const hora = Number(t.slice(11, 13));
      const p: Periodo = hora < 5 ? "madrugada" : hora < 12 ? "manha" : hora < 18 ? "tarde" : "noite";
      acc.set(p, [...(acc.get(p) ?? []), precipitation_probability[i] ?? 0]);
    });
    const periodos = (["madrugada", "manha", "tarde", "noite"] as Periodo[]).map((p) => ({
      periodo: p,
      probChuva: Math.max(...(acc.get(p) ?? [0])),
    }));
    return { fonte: "open-meteo", periodos };
  } catch (e) {
    return {
      fonte: "padrao",
      erro: e instanceof Error ? e.message : String(e),
      periodos: (["madrugada", "manha", "tarde", "noite"] as Periodo[]).map((p) => ({ periodo: p, probChuva: 0 })),
    };
  }
}
