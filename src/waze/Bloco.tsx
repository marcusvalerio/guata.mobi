"use client";
// MÓDULO WAZE (complementar): bloco separado dos indicadores da pesquisa.
import { useState } from "react";
import { Detalhe, Secao } from "@/components/Detalhe";
import s from "@/app/painel/painel.module.css";
import { NOME_PERIODO } from "@/lib/tempo";
import { NOTAS_WAZE } from "./notas";
import { useWaze } from "./useWaze";

const br = (n: number | null) => (n === null ? "sem" : n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }));
const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }) : "sem horário");

export function BlocoWaze() {
  const { dados, erro } = useWaze();
  const [aberto, setAberto] = useState<string | null>(null);
  const i = dados?.indicadores;

  const cards = i ? [
    { id: "lentidao", rotulo: "Lentidão no entorno", valor: `${i.atrasoMin}`, unidade: "min de atraso", sub: `${i.trechosLentos} trechos lentos · ${br(i.extensaoKm)} km · ${br(i.velocidadeKmh)} km/h em média` },
    { id: "parados", rotulo: "Trechos parados", valor: `${i.trechosParados}`, unidade: "trechos", sub: "nível 4 ou 5 na escala do Waze" },
    { id: "linhas", rotulo: "Linhas com lentidão no traçado", valor: `${dados!.linhasAfetadas.length}`, unidade: `de ${dados!.totalLinhas} linhas`, sub: dados!.linhasAfetadas.slice(0, 3).map((l) => `${l.codigo} (${l.atrasoMin} min)`).join(" · ") || "nenhuma agora" },
    { id: "alertas", rotulo: "Alertas", valor: `${i.alertas}`, unidade: "ativos", sub: dados!.tiposAlerta.slice(0, 3).map((t) => `${t.tipo} ${t.n}`).join(" · ") || "nenhum agora" },
  ] : [];

  return (
    <section className={`card ${s.block} ${s.wide}`} style={{ borderStyle: "dashed" }}>
      <div className={s.blockH}>
        <div>
          <p className="eyebrow">Complementar · fora dos indicadores da pesquisa</p>
          <h2>Trânsito no entorno do terminal (Waze)</h2>
        </div>
        <button type="button" className={s.confBtn} data-nivel="alta" onClick={() => setAberto("geral")}>Sobre este módulo</button>
      </div>
      {!dados && <p className={s.muted}>{erro ? "Serviço do Waze indisponível agora." : "Carregando trânsito…"}</p>}
      {dados && (
        <>
          <div className={s.kpis}>
            {cards.map((c) => (
              <article key={c.id} className={`card ${s.kpi} ${s.clicavel}`} role="button" tabIndex={0} onClick={() => setAberto(c.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAberto(c.id)}>
                <span className="eyebrow">{c.rotulo}</span>
                <p className={s.kpiV}><span className="num">{c.valor}</span><small>{c.unidade}</small></p>
                <p className={s.kpiD}>{c.sub}</p>
                <p className={s.kpiO}>Raio de {br(dados.raioM / 1000)} km · <span className={s.ver}>Como é medido</span></p>
              </article>
            ))}
          </div>
          {dados.linhasAfetadas.length > 0 && (
            <div className="scroll-x">
              <table>
                <thead><tr><th>Linha</th><th>Trechos lentos no traçado</th><th>Atraso somado</th></tr></thead>
                <tbody>
                  {dados.linhasAfetadas.slice(0, 10).map((l) => (
                    <tr key={l.codigo}><td className="num"><strong>{l.codigo}</strong></td><td className="num">{l.trechos}</td><td className="num">{l.atrasoMin} min</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {dados.previsao && (
            <div style={{ display: "grid", gap: 10 }}>
              <div className={s.blockH}>
                <div>
                  <p className="eyebrow">Previsão de trânsito para amanhã · histórico próprio</p>
                  <h2 style={{ fontSize: 16 }}>Atraso típico por período, com a chuva prevista</h2>
                </div>
                <button type="button" className={s.confBtn} data-nivel="alta" onClick={() => setAberto("previsao")}>Como é estimado</button>
              </div>
              <div className="scroll-x">
                <table>
                  <thead><tr><th>Período</th><th>Chuva prevista</th><th>Entorno do terminal</th><th>Linhas com mais atraso</th><th>Coletas usadas</th></tr></thead>
                  <tbody>
                    {dados.previsao.periodos.map((p) => (
                      <tr key={p.periodo}>
                        <td>{NOME_PERIODO[p.periodo]}</td>
                        <td>{p.chuva ? "Sim" : "Não"}</td>
                        <td className="num">{p.suficiente && p.entornoMin !== null ? `${p.entornoMin} min` : <span className={s.muted}>coletando</span>}</td>
                        <td>{p.suficiente ? (p.linhas.map((l) => `${l.codigo} (${l.atrasoMin} min)`).join(" · ") || "sem atraso relevante") : <span className={s.muted}>mínimo de 6 coletas no período</span>}</td>
                        <td className="num">{p.coletas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={s.muted}>
                {dados.previsao.coletas
                  ? `Histórico desde ${new Date(dados.previsao.desde!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}, ${dados.previsao.coletas} coletas a cada 10 minutos.`
                  : "Histórico começando agora: a primeira coleta entra em até 10 minutos."}
              </p>
            </div>
          )}
          <p className={s.muted}>Fonte: {dados.fonte}. Atualizado às {hora(dados.atualizadoEm)}.</p>
        </>
      )}
      {Object.entries(NOTAS_WAZE).map(([id, n]) => (
        <Detalhe key={id} aberto={aberto === id} fechar={() => setAberto(null)} titulo={n.titulo} sobre="Módulo complementar · Waze">
          <Secao titulo="Como é medido"><ul>{n.texto.map((t) => <li key={t}>{t}</li>)}</ul></Secao>
          {id !== "geral" && <Secao titulo="Separação da pesquisa"><p>{NOTAS_WAZE.geral.texto[0]}</p></Secao>}
          <Secao titulo="Fonte"><p>{dados?.fonte ?? "Waze via NitTrans · SIGeo"}</p></Secao>
        </Detalhe>
      ))}
    </section>
  );
}
