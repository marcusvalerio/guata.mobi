"use client";

import { useState } from "react";
import type { Linha } from "@/lib/types";
import s from "../painel/painel.module.css";

/** Linhas oficiais (SIGeo) com plataforma, intervalo e frota editáveis pela administração. */
export function Linhas({ linhas, plataformas }: { linhas: Linha[]; plataformas: string[] }) {
  const [estado, setEstado] = useState<Record<string, "salvando" | "ok" | "erro">>({});

  async function salvar(id: string, form: HTMLFormElement) {
    const d = new FormData(form);
    setEstado((e) => ({ ...e, [id]: "salvando" }));
    const r = await fetch("/api/linhas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, plataforma: d.get("plataforma") || null, headwayMin: d.get("headwayMin") || null, frota: d.get("frota") || null }),
    }).catch(() => null);
    setEstado((e) => ({ ...e, [id]: r?.ok ? "ok" : "erro" }));
  }

  return (
    <div className="scroll-x">
      <table>
        <thead><tr><th>Linha</th><th>Consórcio</th><th>Extensão</th><th>Plataforma</th><th>Intervalo (min)</th><th>Frota</th><th /></tr></thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id}>
              <td><strong className="num">{l.codigo}</strong> <span className={s.muted}>{l.nome.startsWith("Linha ") ? "" : l.nome}</span></td>
              <td className={s.muted}>{l.consorcio}</td>
              <td className="num">{l.extensaoKm ? `${l.extensaoKm} km` : "·"}</td>
              <td colSpan={4}>
                <form onSubmit={(e) => { e.preventDefault(); salvar(l.id, e.currentTarget); }} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select name="plataforma" defaultValue={l.plataforma ?? ""} className="input" style={{ width: 90, height: 36 }}>
                    <option value="">·</option>
                    {plataformas.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <input name="headwayMin" defaultValue={l.headwayMin ?? ""} inputMode="numeric" placeholder="não inf." className="input" style={{ width: 90, height: 36 }} />
                  <input name="frota" defaultValue={l.frota ?? ""} inputMode="numeric" placeholder="não inf." className="input" style={{ width: 90, height: 36 }} />
                  <button className="btn ghost" style={{ height: 36 }} disabled={estado[l.id] === "salvando"}>
                    {estado[l.id] === "ok" ? "Salvo" : estado[l.id] === "erro" ? "Erro" : "Salvar"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
