/**
 * MÓDULO WAZE (complementar). Não alimenta os seis indicadores da pesquisa,
 * a confiabilidade nem a pesquisa por QR Code. Para remover: apagar src/waze,
 * src/app/api/waze e as chamadas marcadas com "MÓDULO WAZE".
 *
 * Fonte: camadas WAZE Tráfego LIVE e WAZE Alertas LIVE, publicadas pela
 * NitTrans no SIGeo (ArcGIS, acesso público), atualizadas continuamente.
 */
import { TERMINAL } from "@/lib/geo";
import { CAMADAS, geojson } from "@/lib/sigeo";

const BASE = "https://services8.arcgis.com/TpaOLI1HCh5AcRQB/arcgis/rest/services";
const TRAFEGO = `${BASE}/WAZE_Tr%C3%A1fego_LIVE/FeatureServer/0`;
const ALERTAS = `${BASE}/WAZE_Alertas_LIVE/FeatureServer/0`;
export const RAIO_M = 1500;
export const FONTE_WAZE = "Waze for Cities via NitTrans · SIGeo, Prefeitura de Niterói";

async function consultar(camada: string, campos: string, raio: number, geometria: boolean) {
  const p = new URLSearchParams({
    where: "1=1", outFields: campos, outSR: "4326", f: "geojson", returnGeometry: String(geometria),
    geometry: `${TERMINAL.lng},${TERMINAL.lat}`, geometryType: "esriGeometryPoint", inSR: "4326",
    spatialRel: "esriSpatialRelIntersects", distance: String(raio), units: "esriSRUnit_Meter",
  });
  const r = await fetch(`${camada}/query?${p}`, { signal: AbortSignal.timeout(6000), cache: "no-store" });
  if (!r.ok) throw new Error(`Waze ${r.status}`);
  return (await r.json()) as GeoJSON.FeatureCollection;
}

/** Trechos de rota a menos de ~40 m de um congestionamento contam como afetados. */
function linhasAfetadas(rotas: GeoJSON.FeatureCollection, lentos: GeoJSON.FeatureCollection) {
  const CEL = 0.0004; // ~40 m
  const chave = (x: number, y: number) => `${Math.round(x / CEL)}:${Math.round(y / CEL)}`;
  const grade = new Map<string, Set<number>>();
  lentos.features.forEach((f, i) => {
    const g = f.geometry;
    const linhas = g?.type === "LineString" ? [g.coordinates] : g?.type === "MultiLineString" ? g.coordinates : [];
    linhas.flat().forEach(([x, y]) => {
      for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
        const k = chave(x + dx * CEL, y + dy * CEL);
        grade.set(k, (grade.get(k) ?? new Set()).add(i));
      }
    });
  });
  const porLinha = new Map<string, Set<number>>();
  for (const f of rotas.features) {
    const codigo = String(f.properties?.tx_numerolinha ?? "");
    const g = f.geometry;
    const linhas = g?.type === "LineString" ? [g.coordinates] : g?.type === "MultiLineString" ? g.coordinates : [];
    const acc = porLinha.get(codigo) ?? new Set<number>();
    linhas.flat().forEach(([x, y]) => grade.get(chave(x, y))?.forEach((i) => acc.add(i)));
    porLinha.set(codigo, acc);
  }
  return [...porLinha.entries()]
    .map(([codigo, idx]) => ({
      codigo,
      trechos: idx.size,
      atrasoMin: Math.round([...idx].reduce((a, i) => a + Math.max(0, Number(lentos.features[i].properties?.li_atraso ?? 0)), 0) / 60),
    }))
    .filter((l) => l.trechos > 0)
    .sort((a, b) => b.atrasoMin - a.atrasoMin);
}

let cache: { em: number; dados: Awaited<ReturnType<typeof montar>> } | null = null;

async function montar() {
  const [lentos, alertas, rotas] = await Promise.all([
    consultar(TRAFEGO, "tx_rua,li_nivel,li_atraso,db_velocidade_kmh,li_comprimento,dt_data_hora", RAIO_M, true),
    consultar(ALERTAS, "tx_rua,tx_tipo_alerta,tx_subtipo_alerta,li_confiabilidade,dt_data_hora", RAIO_M, true),
    geojson(CAMADAS.rotasMobnit, { lat: -22.89177, lng: -43.12378, raio: 250 }),
  ]);
  const props = lentos.features.map((f) => f.properties ?? {});
  const comp = props.reduce((a, p) => a + Number(p.li_comprimento ?? 0), 0);
  const atraso = props.reduce((a, p) => a + Math.max(0, Number(p.li_atraso ?? 0)), 0);
  // Velocidade média ponderada pelo comprimento de cada trecho lento.
  const vel = comp ? props.reduce((a, p) => a + Number(p.db_velocidade_kmh ?? 0) * Number(p.li_comprimento ?? 0), 0) / comp : null;
  const parados = props.filter((p) => Number(p.li_nivel) >= 4).length;
  const tipos = new Map<string, number>();
  alertas.features.forEach((f) => {
    const t = String(f.properties?.tx_subtipo_alerta || f.properties?.tx_tipo_alerta || "Outro");
    tipos.set(t, (tipos.get(t) ?? 0) + 1);
  });
  const atualizadoEm = Math.max(0, ...props.map((p) => Number(p.dt_data_hora ?? 0)));
  return {
    fonte: FONTE_WAZE,
    raioM: RAIO_M,
    atualizadoEm: atualizadoEm ? new Date(atualizadoEm).toISOString() : null,
    indicadores: {
      trechosLentos: lentos.features.length,
      extensaoKm: Math.round(comp / 100) / 10,
      atrasoMin: Math.round(atraso / 60),
      velocidadeKmh: vel === null ? null : Math.round(vel * 10) / 10,
      trechosParados: parados,
      alertas: alertas.features.length,
    },
    tiposAlerta: [...tipos.entries()].sort((a, b) => b[1] - a[1]).map(([tipo, n]) => ({ tipo, n })),
    linhasAfetadas: linhasAfetadas(rotas, lentos),
    totalLinhas: new Set(rotas.features.map((f) => String(f.properties?.tx_numerolinha ?? ""))).size,
    lentos,
    alertasGeo: alertas,
  };
}

/** Atualiza no máximo a cada 60 s para não sobrecarregar o serviço da prefeitura. */
export async function trafegoWaze() {
  if (!cache || Date.now() - cache.em > 60_000) cache = { em: Date.now(), dados: await montar() };
  return cache.dados;
}
