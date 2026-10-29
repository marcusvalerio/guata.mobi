"use client";

import { useEffect, useState } from "react";
import { usePainel } from "@/lib/usePainel";
import type { Ocorrencia } from "@/lib/types";
import s from "../painel/painel.module.css";

const TIPOS: { v: Ocorrencia["tipo"]; t: string }[] = [
  { v: "seguranca", t: "Segurança" },
  { v: "lotacao", t: "Lotação" },
  { v: "acessibilidade", t: "Acessibilidade" },
  { v: "manutencao", t: "Manutenção" },
  { v: "outro", t: "Outro" },
];
const hora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export function Operacao({ plataformas }: { plataformas: string[] }) {
  const { dados } = usePainel(8000);
  const [lista, setLista] = useState<Ocorrencia[]>([]);
  const [tipo, setTipo] = useState<Ocorrencia["tipo"]>("seguranca");
  const [local, setLocal] = useState(`Plataforma ${plataformas[0]}`);
  const [descricao, setDesc] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const carregar = () => fetch("/api/ocorrencias").then((r) => r.json()).then(setLista).catch(() => {});
  useEffect(() => { carregar(); }, []);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/ocorrencias", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tipo, local, descricao }) });
    setMsg(r.ok ? "Ocorrência registrada." : "Falha ao registrar.");
    if (r.ok) { setDesc(""); carregar(); }
  }
  async function contar(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/contagens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fonte: "manual", local: "Entrada principal", passageiros: Number(pass) * 4, janelaMin: 60 }) });
    setMsg(r.ok ? "Contagem enviada para o indicador de Demanda." : "Contagem inválida.");
    if (r.ok) setPass("");
  }

  const alertas = dados?.tempoViagem.filter((t) => t.status !== "ok") ?? [];
  const criticos = dados?.kpis.filter((k) => k.status === "critico") ?? [];

  return (
    <div className={s.grid}>
      <div className={s.head}>
        <div>
          <p className="eyebrow">Turno atual</p>
          <h1 className={s.h1}>Operação</h1>
        </div>
        {msg && <span className="tag" role="status">{msg}</span>}
      </div>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}><div><p className="eyebrow">Alertas</p><h2>O que precisa de atenção agora</h2></div></div>
        {!dados && <p className={s.muted}>Carregando…</p>}
        {dados && alertas.length === 0 && criticos.length === 0 && <p className={s.muted}>Nenhum alerta. Operação dentro do esperado.</p>}
        <ul className={s.feed}>
          {criticos.map((k) => (
            <li key={k.dimensao} style={{ gridTemplateColumns: "auto 1fr" }}><span className="dot critico" /><span><strong>{k.dimensao}:</strong> {k.indicador} em {k.valor} {k.unidade}. {k.detalhe}.</span></li>
          ))}
          {alertas.map((t) => (
            <li key={t.linha.id} style={{ gridTemplateColumns: "auto 1fr" }}>
              <span className={`dot ${t.status}`} />
              <span><strong className="num">Linha {t.linha.codigo}</strong> (plat. {t.linha.plataforma}): {t.alerta ?? `${t.observado} min observado, ${t.esperado} min esperado`}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}><div><p className="eyebrow">Segurança · Infraestrutura</p><h2>Registrar ocorrência</h2></div></div>
        <form onSubmit={registrar} style={{ display: "grid", gap: 14 }}>
          <div className="chips">
            {TIPOS.map((t) => <button type="button" key={t.v} className="chip" aria-pressed={tipo === t.v} onClick={() => setTipo(t.v)}>{t.t}</button>)}
          </div>
          <label className="field"><span>Local</span>
            <select className="input" value={local} onChange={(e) => setLocal(e.target.value)}>
              {plataformas.map((p) => <option key={p}>Plataforma {p}</option>)}
              <option>Entrada principal</option><option>Passarela das barcas</option><option>Banheiros</option>
            </select>
          </label>
          <label className="field"><span>Descrição</span>
            <textarea className="input" maxLength={280} value={descricao} onChange={(e) => setDesc(e.target.value)} />
          </label>
          <button className="btn">Registrar</button>
        </form>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}><div><p className="eyebrow">Demanda</p><h2>Contagem manual de fluxo</h2></div></div>
        <p className={s.muted}>Conte quem passa pela entrada principal durante 15 minutos. O sistema converte para passageiros por hora. Quando houver sensor ou bilhetagem, a contagem passa a ser automática.</p>
        <form onSubmit={contar} style={{ display: "flex", gap: 10 }}>
          <input className="input" inputMode="numeric" placeholder="Pessoas em 15 min" value={pass} onChange={(e) => setPass(e.target.value.replace(/\D/g, ""))} />
          <button className="btn" disabled={!pass}>Enviar</button>
        </form>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}><div><p className="eyebrow">Histórico</p><h2>Ocorrências recentes</h2></div></div>
        <ul className={s.feed}>
          {lista.slice(0, 10).map((o) => (
            <li key={o.id} style={{ gridTemplateColumns: "92px 1fr auto" }}>
              <span className="num" style={{ fontSize: 12 }}>{hora(o.criadoEm)}</span>
              <span><strong>{TIPOS.find((t) => t.v === o.tipo)?.t}</strong> · {o.local}{o.descricao && ` · ${o.descricao}`}</span>
              <span className="tag">{o.simulado ? "simulada" : o.autor}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
