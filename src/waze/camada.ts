// MÓDULO WAZE (complementar): camada do mapa com trechos lentos e alertas.
import type * as Leaflet from "leaflet";
import type { DadosWaze } from "./useWaze";

const COR_NIVEL = ["#dbe0e1", "#dbe0e1", "#ff9408", "#ca3f16", "#95122c", "#95122c"];

export function camadaWaze(L: typeof Leaflet, d: DadosWaze) {
  const g = L.layerGroup();
  L.geoJSON(d.lentos, {
    style: (f) => ({ color: COR_NIVEL[Number(f?.properties?.li_nivel ?? 0)] ?? "#ca3f16", weight: 6, opacity: .8, lineCap: "round" }),
    onEachFeature: (f, l) => l.bindTooltip(`<b>${f.properties?.tx_rua ?? "Via"}</b><br>${f.properties?.db_velocidade_kmh} km/h · ${Math.round(Math.max(0, f.properties?.li_atraso ?? 0) / 60)} min de atraso<br>Nível ${f.properties?.li_nivel} de 5 · Waze`, { sticky: true }),
  }).addTo(g);
  L.geoJSON(d.alertasGeo, {
    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 5, color: "#100c08", weight: 1.5, fillColor: "#f3f4f5", fillOpacity: 1 })
      .bindTooltip(`${f.properties?.tx_subtipo_alerta || f.properties?.tx_tipo_alerta} · ${f.properties?.tx_rua ?? ""}<br>Waze`),
  }).addTo(g);
  return g;
}
