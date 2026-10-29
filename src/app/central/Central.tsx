"use client";

import { useEffect, useState } from "react";
import s from "../painel/painel.module.css";

interface Saude {
  em: string;
  iniciadoEm: string;
  banco: { modo: string; respostas: number; ocorrencias: number; contagens: number };
  coleta: { ultimaHora: number; ultimaReal: string | null };
  integracoes: { nome: string; estado: "ok" | "falha" | "pendente"; detalhe: string }[];
  erros: { em: string; msg: string }[];
}

const quando = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "nenhuma ainda");

export function Central() {
  const [d, setD] = useState<Saude | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [versao, setVersao] = useState(0);
  useEffect(() => {
    let vivo = true;
    const carregar = async () => {
      const t0 = performance.now();
      const r = await fetch("/api/saude", { cache: "no-store" }).catch(() => null);
      const j = r?.ok ? ((await r.json()) as Saude) : null;
      if (!vivo) return;
      setMs(Math.round(performance.now() - t0));
      if (j) setD(j);
    };
    carregar();
    const id = setInterval(carregar, 15000);
    return () => { vivo = false; clearInterval(id); };
  }, [versao]);

  async function simulacao(acao: "reiniciar" | "limpar") {
    if (acao === "limpar" && !confirm("Remover todas as respostas simuladas? Ficam só as reais.")) return;
    const r = await fetch("/api/simulacao", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ acao }) });
    setAviso(r.ok ? (acao === "limpar" ? "Dados simulados removidos." : "Simulação de 28 dias recriada.") : "Ação negada.");
    setVersao((v) => v + 1);
  }

  return (
    <div className={s.grid}>
      <div className={s.head}>
        <div>
          <p className="eyebrow">Admin Central</p>
          <h1 className={s.h1}>Saúde do sistema</h1>
        </div>
        <div className={s.live}>
          <span className={`${s.pulse} ${d ? "" : s.off}`} />
          <span>API {ms !== null ? `${ms} ms` : "…"} · verificado {d ? quando(d.em) : "…"}</span>
          {aviso && <span className="tag">{aviso}</span>}
        </div>
      </div>

      <section className={s.kpis}>
        {[
          ["Banco", d?.banco.modo === "memoria" ? "Memória" : "Postgres", d?.banco.modo === "memoria" ? "Protótipo: reinicia com o servidor" : "Persistente"],
          ["Respostas", d?.banco.respostas.toLocaleString("pt-BR"), `${d?.coleta.ultimaHora ?? "–"} na última hora`],
          ["Última resposta real", d ? quando(d.coleta.ultimaReal) : "–", "Vinda de QR Code"],
          ["Ocorrências", d?.banco.ocorrencias, "Total registrado"],
          ["Contagens de fluxo", d?.banco.contagens, "Manual, sensor ou bilhetagem"],
          ["No ar desde", d ? quando(d.iniciadoEm) : "–", "Instância atual"],
        ].map(([t, v, sub]) => (
          <article key={String(t)} className={`card ${s.kpi}`}>
            <span className="eyebrow">{t}</span>
            <p className={s.kpiV}><span className="num" style={{ fontSize: 26 }}>{v ?? "–"}</span></p>
            <p className={s.muted}>{sub}</p>
          </article>
        ))}
      </section>

      <section className={`card ${s.block} ${s.wide}`}>
        <div className={s.blockH}><div><p className="eyebrow">Camada de coleta</p><h2>Integrações</h2></div></div>
        <table>
          <thead><tr><th>Fonte</th><th>Estado</th><th>Detalhe</th></tr></thead>
          <tbody>
            {d?.integracoes.map((i) => (
              <tr key={i.nome}>
                <td>{i.nome}</td>
                <td><span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span className={`dot ${i.estado}`} />{{ ok: "Operando", falha: "Falha", pendente: "Pendente" }[i.estado]}</span></td>
                <td className={s.muted}>{i.detalhe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}><div><p className="eyebrow">Demonstração</p><h2>Dados simulados</h2></div></div>
        <p className={s.muted}>O protótipo inicia com 28 dias de respostas simuladas, marcadas como tal, para o painel e a previsão terem histórico. Antes da coleta real, limpe os simulados.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn ghost" onClick={() => simulacao("reiniciar")}>Recriar simulação</button>
          <button className="btn" onClick={() => simulacao("limpar")}>Manter só dados reais</button>
        </div>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}><div><p className="eyebrow">Registro</p><h2>Erros recentes</h2></div></div>
        {d?.erros.length ? (
          <ul className={s.feed}>{d.erros.map((e) => <li key={e.em} style={{ gridTemplateColumns: "1fr" }}><span className="num" style={{ fontSize: 12 }}>{quando(e.em)}</span> {e.msg}</li>)}</ul>
        ) : <p className={s.muted}>Nenhum erro registrado.</p>}
      </section>
    </div>
  );
}
