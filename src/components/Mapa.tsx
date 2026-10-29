"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import { DESTINOS, PLATAFORMAS_GEO, PONTOS, TERMINAL } from "@/lib/geo";
import type { DadosPainel } from "@/lib/usePainel";
import s from "./mapa.module.css";

const COR = { ok: "#100c08", atencao: "#ca3f16", critico: "#95122c" } as const;

/** Mapa OpenStreetMap: plataformas do terminal coloridas por situação e, no modo rede, o trajeto de cada linha. */
export function Mapa({ dados }: { dados: DadosPainel }) {
  const el = useRef<HTMLDivElement>(null);
  const mapa = useRef<LMap | null>(null);
  const camada = useRef<LayerGroup | null>(null);
  const [modo, setModo] = useState<"terminal" | "rede">("terminal");
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;
    import("leaflet").then((L) => {
      if (!vivo || !el.current || mapa.current) return;
      const m = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([TERMINAL.lat, TERMINAL.lng], 18);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(m);
      camada.current = L.layerGroup().addTo(m);
      mapa.current = m;
      setPronto(true);
    });
    return () => { vivo = false; mapa.current?.remove(); mapa.current = null; };
  }, []);

  useEffect(() => {
    if (!pronto) return;
    import("leaflet").then((L) => {
      const g = camada.current;
      if (!g) return;
      g.clearLayers();

      if (modo === "rede") {
        dados.tempoViagem.forEach((t) => {
          const fim = DESTINOS[t.linha.id];
          const ini = PLATAFORMAS_GEO[t.linha.plataforma];
          if (!fim || !ini) return;
          L.polyline([ini, fim], { color: COR[t.status], weight: t.status === "ok" ? 2.5 : 4, opacity: .85, dashArray: t.status === "ok" ? undefined : "8 6" })
            .bindTooltip(`<b>${t.linha.codigo}</b> ${t.linha.nome}<br>${t.observado ?? t.esperado} min · índice ${t.indice ? t.indice.toFixed(2) + "×" : "sem dados"}`, { sticky: true })
            .addTo(g);
          L.circleMarker(fim, { radius: 5, color: "#100c08", weight: 1.5, fillColor: "#f3f4f5", fillOpacity: 1 })
            .bindTooltip(t.linha.nome.split("–").pop()!.trim(), { permanent: true, direction: "right", className: s.rotulo })
            .addTo(g);
        });
      }

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
          .bindTooltip(`<b>Plataforma ${p.plataforma}</b><br>Lotação percebida: ${p.ocupacao ?? "–"}%<br>Ocorrências (7 dias): ${p.ocorrencias}<br>Linhas: ${p.linhas.join(", ")}<br><small>${p.relatos} relatos nas últimas 3h</small>`, { direction: "top", offset: [0, -18] })
          .addTo(g);
      });
    });
  }, [dados, modo, pronto]);

  // Enquadramento só muda quando o modo muda — a atualização a cada 5s não mexe no zoom do usuário.
  useEffect(() => {
    if (!pronto) return;
    import("leaflet").then((L) => {
      const m = mapa.current;
      if (!m) return;
      if (modo === "rede") m.fitBounds(L.latLngBounds([...Object.values(DESTINOS), [TERMINAL.lat, TERMINAL.lng]]), { padding: [30, 30] });
      else m.setView([TERMINAL.lat, TERMINAL.lng], 18);
    });
  }, [modo, pronto]);

  return (
    <div className={s.wrap}>
      <div className={s.barra}>
        <div className="chips">
          <button type="button" className="chip" aria-pressed={modo === "terminal"} onClick={() => setModo("terminal")}>Terminal</button>
          <button type="button" className="chip" aria-pressed={modo === "rede"} onClick={() => setModo("rede")}>Linhas que saem daqui</button>
        </div>
        <span className={s.legenda}>
          <i style={{ background: COR.ok }} />Normal <i style={{ background: COR.atencao }} />Atenção <i style={{ background: COR.critico }} />Crítico
        </span>
      </div>
      <div ref={el} className={s.mapa} />
      <p className={s.nota}>Posição das plataformas aproximada. Ajustar com a planta do terminal.</p>
    </div>
  );
}
