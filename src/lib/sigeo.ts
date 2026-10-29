/**
 * Camadas abertas do SIGeo / Prefeitura de Niterói (ArcGIS Online, acesso público).
 * Buscadas direto do navegador em GeoJSON; nada é copiado para o nosso banco.
 */
const BASE = "https://services8.arcgis.com/TpaOLI1HCh5AcRQB/arcgis/rest/services";

export const CAMADAS = {
  /** Traçados oficiais do MOBNIT, com número, nome e sentido de cada linha. */
  rotasMobnit: "https://sig.niteroi.rj.gov.br/server/rest/services/Hosted/RotasMobNit/FeatureServer/0",
  linhasTransnit: `${BASE}/Grouplayer_SMU_UDU_AGOL/FeatureServer/70`,
  linhasTransoceanica: `${BASE}/Grouplayer_SMU_UDU_AGOL/FeatureServer/80`,
  abrigos: `${BASE}/Grouplayer_SMU_UDU_AGOL/FeatureServer/60`,
  cameras: `${BASE}/Cameras_Nittrans/FeatureServer/0`,
  barcas: `${BASE}/Grouplayer_SMU_PLANODIRETOR_AGOL/FeatureServer/600`,
};

export const FONTE_SIGEO = "Dados: SIGeo · Prefeitura de Niterói";

/** Feições a até `raio` metros do ponto (ou todas, sem ponto). */
export async function geojson(camada: string, perto?: { lat: number; lng: number; raio: number }) {
  const p = new URLSearchParams({ where: "1=1", outFields: "*", outSR: "4326", f: "geojson" });
  if (perto) {
    p.set("geometry", `${perto.lng},${perto.lat}`);
    p.set("geometryType", "esriGeometryPoint");
    p.set("inSR", "4326");
    p.set("spatialRel", "esriSpatialRelIntersects");
    p.set("distance", String(perto.raio));
    p.set("units", "esriSRUnit_Meter");
  }
  const r = await fetch(`${camada}/query?${p}`);
  if (!r.ok) throw new Error(`SIGeo ${r.status}`);
  return (await r.json()) as GeoJSON.FeatureCollection;
}
