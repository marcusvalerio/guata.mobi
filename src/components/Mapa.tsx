"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import { PLATAFORMAS_GEO, PONTOS, TERMINAL } from "@/lib/geo";
import { CAMADAS, FONTE_SIGEO, geojson } from "@/lib/sigeo";
import type { DadosPainel } from "@/lib/usePainel";
import s from "./mapa.module.css";

/** Textos vindos do SIGeo trazem " - " como separador; a regra editorial do Guatá não usa hífen. */
const semHifen = (t: string) => t.replace(/\s*[-–—]\s*/g, " / ");

const COR = { ok: "#100c08", atencao: "#ca3f16", critico: "#95122c" } as const;

/**
 * Mapa OpenStreetMap: plataformas do terminal coloridas por situação, com camadas
 * oficiais do SIGeo (abrigos, câmera da NitTrans, barcas e traçado real das linhas).
 */
export function Mapa({ dados }: { dados: DadosPainel }) {
  const el = useRef<HTMLDivElement>(null);
  const mapa = useRef<LMap | null>(null);
  const camada = useRef<LayerGroup | null>(null);
  const [modo, setModo] = useState<"terminal" | "rede">("terminal");
  const [pronto, setPronto] = useState(false);
  const oficiais = useRef<{ terminal: LayerGroup; rede: LayerGroup } | null>(null);
  const [sigeo, setSigeo] = useState<"carregando" | "ok" | "falha">("carregando");
  const [nLinhas, setNLinhas] = useState(0);

  useEffect(() => {
    let vivo = true;
    import("leaflet").then((L) => {
      if (!vivo || !el.current || mapa.current) return;
      const m = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([TERMINAL.lat, TERMINAL.lng], 17);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: s.tiles,
      }).addTo(m);
      camada.current = L.layerGroup().addTo(m);
      mapa.current = m;
      setPronto(true);
    });
    return () => { vivo = false; mapa.current?.remove(); mapa.current = null; };
  }, []);

  useEffect(() => {
    if (!pronto) return;
    let vivo = true;
    const perto = (raio: number) => ({ lat: TERMINAL.lat, lng: TERMINAL.lng, raio });
    Promise.all([
      import("leaflet"),
      geojson(CAMADAS.abrigos, perto(700)),
      geojson(CAMADAS.cameras, perto(700)),
      geojson(CAMADAS.barcas),
      geojson(CAMADAS.linhasTransnit, perto(250)),
      geojson(CAMADAS.linhasTransoceanica, perto(250)),
    ]).then(([L, abrigos, cameras, barcas, transnit, transoceanica]) => {
      if (!vivo || !mapa.current) return;
      const terminal = L.layerGroup([
        L.geoJSON(barcas, { style: { color: "#100c08", weight: 2, dashArray: "2 6", opacity: .7 } })
          .bindTooltip("Barcas Praça Araribóia × Praça XV", { sticky: true }),
        L.geoJSON(abrigos, {
          pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 4, color: "#100c08", weight: 1.5, fillColor: "#ff9408", fillOpacity: 1 })
            .bindTooltip(semHifen(`Abrigo ${f.properties?.tx_COD ?? ""} · ${f.properties?.tx_endereco ?? ""}`)),
        }),
        L.geoJSON(cameras, {
          pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, color: "#100c08", weight: 2, fillColor: "#95122c", fillOpacity: 1 })
            .bindTooltip(semHifen(`Câmera NitTrans · ${f.properties?.camera_name ?? ""}`)),
        }),
      ]);
      const linha = (consorcio: string) => ({
        style: { color: "#100c08", weight: 1.6, opacity: .45 },
        onEachFeature: (f: GeoJSON.Feature, l: import("leaflet").Layer) => {
          l.bindTooltip(`<b>${semHifen(String(f.properties?.tx_nome ?? "").replace(/_/g, " "))}</b><br>${consorcio}`, { sticky: true });
          l.on("mouseover", (e) => (e.target as import("leaflet").Path).setStyle({ color: "#ff9408", weight: 4, opacity: 1 }));
          l.on("mouseout", (e) => (e.target as import("leaflet").Path).setStyle({ color: "#100c08", weight: 1.6, opacity: .45 }));
        },
      });
      const rede = L.layerGroup([L.geoJSON(transnit, linha("TransNit")), L.geoJSON(transoceanica, linha("Transoceânico"))]);
      oficiais.current = { terminal, rede };
      setNLinhas(new Set([...transnit.features, ...transoceanica.features].map((f) => String(f.properties?.tx_nome ?? "").split(/[_ ]/)[0])).size);
      setSigeo("ok");
    }).catch(() => vivo && setSigeo("falha"));
    return () => { vivo = false; };
  }, [pronto]);

  // Mostra as camadas oficiais conforme o modo.
  useEffect(() => {
    const m = mapa.current, o = oficiais.current;
    if (!m || !o) return;
    o.terminal.addTo(m);
    if (modo === "rede") o.rede.addTo(m); else o.rede.remove();
  }, [modo, sigeo]);

  useEffect(() => {
    if (!pronto) return;
    import("leaflet").then((L) => {
      const g = camada.current;
      if (!g) return;
      g.clearLayers();

      PONTOS.forEach((p) =>
        L.circleMarker(p.pos, { radius: 7, color: "#100c08", weight: 2, fillColor: p.tipo === "barcas" ? "#dbe0e1" : "#ffffff", fillOpacity: 1 })
          .bindTooltip(p.nome, { direction: "top" }).addTo(g),
      );

      dados.plataformas.forEach((p) => {
        const pos = PLATAFORMAS_GEO[p.plataforma];
        if (!pos) return;
        const icone = L.divIcon({
          className: "",
          html: `<div class="${s.plat}" style="--c:${COR[p.status]}"><b>${p.plataforma}</b>${p.ocupacao !== null ? `<span>${p.ocupacao}%</span>` : ""}</div>`,
          iconSize: [44, 44], iconAnchor: [22, 22],
        });
        L.marker(pos, { icon: icone })
          .bindTooltip(`<b>Plataforma ${p.plataforma}</b><br>Lotação percebida: ${p.ocupacao === null ? "sem dado" : p.ocupacao + "%"}<br>Ocorrências (7 dias): ${p.ocorrencias}<br>Linhas: ${p.linhas.join(", ")}<br><small>${p.relatos} relatos nas últimas 3h</small>`, { direction: "top", offset: [0, -18] })
          .addTo(g);
      });
    });
  }, [dados, modo, pronto]);

  // Enquadramento só muda quando o modo muda — a atualização a cada 5s não mexe no zoom do usuário.
  useEffect(() => {
    if (!pronto) return;
    const m = mapa.current;
    if (!m) return;
    m.setView([TERMINAL.lat, TERMINAL.lng], modo === "rede" ? 14 : 17);
  }, [modo, pronto]);

  return (
    <div className={s.wrap}>
      <div className={s.barra}>
        <div className="chips">
          <button type="button" className="chip" aria-pressed={modo === "terminal"} onClick={() => setModo("terminal")}>Terminal</button>
          <button type="button" className="chip" aria-pressed={modo === "rede"} onClick={() => setModo("rede")}>Linhas que passam aqui{nLinhas ? ` (${nLinhas})` : ""}</button>
        </div>
        <span className={s.legenda}>
          <i style={{ background: COR.ok }} />Normal <i style={{ background: COR.atencao }} />Atenção <i style={{ background: COR.critico }} />Crítico
          <i style={{ background: "#ff9408", width: 8, height: 8 }} />Abrigo <i style={{ background: "#95122c", width: 8, height: 8 }} />Câmera
        </span>
      </div>
      <div ref={el} className={s.mapa} />
      <p className={s.nota}>
        Abrigos, câmera, barcas e traçado das linhas municipais: {FONTE_SIGEO} (dados abertos{sigeo === "falha" ? ", indisponível agora" : sigeo === "carregando" ? ", carregando" : ""}).
        Posição das plataformas aproximada; linhas intermunicipais (estaduais) não estão nessa base.
      </p>
    </div>
  );
}
