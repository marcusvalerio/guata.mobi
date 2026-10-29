// MÓDULO WAZE (complementar): histórico próprio do trânsito e previsão por linha.
// Guarda, a cada coleta, o atraso de trânsito no traçado de cada linha e se chovia.
import { neon } from "@neondatabase/serverless";
import type { PrevisaoClima } from "@/lib/kpis";
import type { Periodo } from "@/lib/types";
import { trafegoWaze } from "./dados";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const INTERVALO_MIN = 8;
const ENTORNO = "_entorno";

async function chovendoAgora() {
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-22.8912&longitude=-43.1254&current=precipitation,weather_code", { signal: AbortSignal.timeout(4000), cache: "no-store" });
    const c = ((await r.json()) as { current: { precipitation: number; weather_code: number } }).current;
    return c.precipitation > 0 || c.weather_code >= 51;
  } catch {
    return null;
  }
}

/** Grava uma amostra se a última tiver mais de INTERVALO_MIN minutos. */
export async function coletar() {
  if (!sql) return { gravado: false, motivo: "sem banco" };
  const [ult] = await sql`select max(em) as em from waze_amostras`;
  if (ult?.em && Date.now() - new Date(ult.em).getTime() < INTERVALO_MIN * 60_000) return { gravado: false, motivo: "intervalo" };
  const [w, chuva] = await Promise.all([trafegoWaze(), chovendoAgora()]);
  const em = new Date().toISOString();
  const linhas = [
    { linha: ENTORNO, atraso_seg: w.indicadores.atrasoMin * 60, trechos: w.indicadores.trechosLentos },
    ...w.linhasAfetadas.map((l) => ({ linha: l.codigo, atraso_seg: l.atrasoMin * 60, trechos: l.trechos })),
  ].map((l) => ({ em, chuva, ...l }));
  // A checagem do intervalo vai junto do insert para duas telas abertas não gravarem em dobro.
  const ins = await sql`insert into waze_amostras
    select * from json_populate_recordset(null::waze_amostras, ${JSON.stringify(linhas)}::json)
    where not exists (select 1 from waze_amostras where em > now() - make_interval(mins => ${INTERVALO_MIN}))
    returning 1`;
  return { gravado: ins.length > 0, em, linhas: ins.length, chuva };
}

const FAIXA: Record<Periodo, [number, number]> = { madrugada: [0, 4], manha: [5, 11], tarde: [12, 17], noite: [18, 23] };

/**
 * Atraso típico de trânsito amanhã, por período: mediana das amostras com o mesmo
 * tipo de dia (útil ou fim de semana) e a mesma condição de chuva prevista.
 * Linhas sem amostra numa coleta contam como atraso zero naquela coleta.
 */
export async function previsaoTransito(previsao: PrevisaoClima[], amanhaFds: boolean) {
  if (!sql) return null;
  const [info] = await sql`select min(em) as desde, count(distinct em)::int as coletas from waze_amostras`;
  const periodos = await Promise.all(previsao.map(async (p) => {
    const [h0, h1] = FAIXA[p.periodo];
    const chuva = p.probChuva >= 50;
    const rows = await sql`
      with coletas as (
        select distinct em, chuva from waze_amostras
        where extract(hour from em at time zone 'America/Sao_Paulo') between ${h0} and ${h1}
          and (extract(isodow from em at time zone 'America/Sao_Paulo') >= 6) = ${amanhaFds}
      ),
      escolhidas as (
        select em from coletas where chuva = ${chuva}
        union all
        select em from coletas where (select count(*) from coletas where chuva = ${chuva}) < 6
      ),
      grade as (
        select e.em, l.linha from (select distinct em from escolhidas) e
        cross join (select distinct linha from waze_amostras) l
      )
      select g.linha, count(*)::int as n,
        percentile_cont(0.5) within group (order by coalesce(a.atraso_seg, 0)) / 60 as mediana_min
      from grade g left join waze_amostras a on a.em = g.em and a.linha = g.linha
      group by g.linha`;
    const n = rows[0]?.n ?? 0;
    const entorno = rows.find((r) => r.linha === ENTORNO);
    const linhas = rows.filter((r) => r.linha !== ENTORNO && r.mediana_min > 0)
      .sort((a, b) => b.mediana_min - a.mediana_min).slice(0, 6)
      .map((r) => ({ codigo: r.linha as string, atrasoMin: Math.round(r.mediana_min) }));
    return { periodo: p.periodo, chuva, coletas: n, suficiente: n >= 6, entornoMin: entorno ? Math.round(entorno.mediana_min) : null, linhas };
  }));
  return { desde: info?.desde ? new Date(info.desde).toISOString() : null, coletas: info?.coletas ?? 0, periodos };
}
