"use client";

import { useState } from "react";
import { Sparkline } from "@/components/Sparkline";
import { NOME_PERIODO } from "@/lib/tempo";
import { usePainel } from "@/lib/usePainel";
import s from "./painel.module.css";

const COR = { ok: "var(--go)", atencao: "var(--warn)", critico: "var(--stop)" } as const;
const ROTULO = { ok: "Normal", atencao: "Atenção", critico: "Crítico" } as const;
const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export function Painel() {
  const { dados, erro } = usePainel();
  const [linhaSel, setLinhaSel] = useState(0);

  if (!dados) return <p className={s.loading}>{erro ? "Sem conexão com o servidor." : "Carregando indicadores…"}</p>;
  const { kpis, tempoViagem, cenarios, previsao, ultimas, totais } = dados;
  const alertas = tempoViagem.filter((t) => t.status === "critico" || t.alerta);

  return (
    <div className={s.grid}>
      <div className={s.head}>
        <div>
          <p className="eyebrow">Terminal Presidente João Goulart</p>
          <h1 className={s.h1}>Painel operacional</h1>
        </div>
        <div className={s.live}>
          <span className={`${s.pulse} ${erro ? s.off : ""}`} />
          <span>{erro ? "Reconectando" : "Ao vivo"} · atualizado {hora(dados.geradoEm)}</span>
          <span className="tag">{totais.respostas.toLocaleString("pt-BR")} respostas · {totais.reais} reais</span>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className={s.alert} role="status">
          <strong>Atenção no tempo de viagem</strong>
          {alertas.map((a) => (
            <span key={a.linha.id}>Linha {a.linha.codigo}: {a.alerta ?? `${a.observado} min observado vs ${a.esperado} min esperado`}</span>
          ))}
        </div>
      )}

      <section className={s.kpis} aria-label="Indicadores-chave">
        {kpis.map((k) => (
          <article key={k.dimensao} className={`card ${s.kpi}`} data-status={k.status}>
            <div className={s.kpiTop}>
              <span className="eyebrow">{k.dimensao}</span>
              <span className={s.status} style={{ color: COR[k.status] }}><span className={`dot ${k.status}`} />{ROTULO[k.status]}</span>
            </div>
            <h2 className={s.kpiI}>{k.indicador}</h2>
            <p className={s.kpiV}>
              <span className="num">{k.valor ?? "–"}</span>
              <small>{k.unidade}</small>
            </p>
            <Sparkline dados={k.serie} cor={COR[k.status]} />
            <p className={s.kpiD}>{k.detalhe}</p>
            <p className={s.kpiO}>{k.objetivo}</p>
          </article>
        ))}
      </section>

      <section className={`card ${s.block} ${s.wide}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Índice de tempo de viagem · últimas 2h</p>
            <h2>Observado pelos passageiros vs. esperado para a condição atual</h2>
          </div>
        </div>
        <div className="scroll-x">
          <table>
            <thead><tr><th>Linha</th><th>Plat.</th><th>Esperado</th><th>Observado</th><th style={{ width: "34%" }}>Índice</th><th>Relatos</th></tr></thead>
            <tbody>
              {tempoViagem.map((t) => (
                <tr key={t.linha.id}>
                  <td><strong className="num">{t.linha.codigo}</strong> <span className={s.muted}>{t.linha.nome}</span></td>
                  <td className="num">{t.linha.plataforma}</td>
                  <td className="num">{t.esperado} min</td>
                  <td className="num">{t.observado ? `${t.observado} min` : "–"}</td>
                  <td>
                    <div className={s.bar}>
                      <span style={{ width: `${Math.min(100, ((t.indice ?? 0) / 2) * 100)}%`, background: COR[t.status] }} />
                      <i style={{ left: "50%" }} />
                    </div>
                    <span className="num" style={{ fontSize: 12, color: COR[t.status] }}>{t.indice ? `${t.indice.toFixed(2)}×` : "sem dados"}</span>
                  </td>
                  <td className="num">{t.amostras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Estimativa por condição</p>
            <h2>Quanto leva cada trajeto</h2>
          </div>
          <select className="input" style={{ width: "auto" }} value={linhaSel} onChange={(e) => setLinhaSel(Number(e.target.value))}>
            {cenarios.map((c, i) => <option key={c.linha.id} value={i}>{c.linha.codigo} · {c.linha.nome}</option>)}
          </select>
        </div>
        <div className={s.scen}>
          {cenarios[linhaSel].cenarios.map((c) => (
            <div key={c.rotulo}>
              <span className="eyebrow">{c.rotulo}</span>
              <span className={`num ${s.scenN}`}>{c.min}<small>min</small></span>
              <span className={s.muted}>{c.amostras ? `mediana de ${c.amostras} relatos` : "tempo de referência"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`card ${s.block}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Previsão para amanhã</p>
            <h2>Chuva por período</h2>
          </div>
          <span className="tag">{previsao.fonte === "open-meteo" ? "Open-Meteo" : "Sem previsão · assumindo tempo seco"}</span>
        </div>
        <div className={s.rain}>
          {previsao.periodos.map((p) => (
            <div key={p.periodo}>
              <div className={s.rainBar}><span style={{ height: `${p.probChuva}%`, background: p.probChuva >= 50 ? "var(--ink)" : "var(--line)" }} /></div>
              <span className="num">{p.probChuva}%</span>
              <span className={s.muted}>{NOME_PERIODO[p.periodo]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`card ${s.block} ${s.wide}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Recomendação para amanhã</p>
            <h2>Intervalo e frota sugeridos por período</h2>
          </div>
          <span className={s.muted}>Ciclo = ida + volta estimadas + 10 min de terminal</span>
        </div>
        <div className="scroll-x">
          <table>
            <thead>
              <tr><th>Linha</th><th>Frota atual</th>{previsao.periodos.map((p) => <th key={p.periodo}>{NOME_PERIODO[p.periodo]}</th>)}</tr>
            </thead>
            <tbody>
              {previsao.recomendacoes.map((r) => (
                <tr key={r.linha.id}>
                  <td><strong className="num">{r.linha.codigo}</strong> <span className={s.muted}>{r.linha.nome}</span></td>
                  <td className="num">{r.linha.frota} · {r.linha.headwayMin} min</td>
                  {r.porPeriodo.map((p) => (
                    <td key={p.periodo} className="num">
                      <div>{p.tempoMin} min de viagem</div>
                      <div className={s.muted}>a cada {p.headway} min · {p.frota} ônibus</div>
                      {p.delta > 0 && <span className={s.delta}>+{p.delta}</span>}
                      {p.delta < 0 && <span className={s.deltaNeg}>{p.delta}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`card ${s.block} ${s.wide}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Chegando agora</p>
            <h2>Últimas respostas</h2>
          </div>
        </div>
        <ul className={s.feed}>
          {ultimas.map((r) => {
            const l = cenarios.find((c) => c.linha.id === r.linhaId)?.linha;
            return (
              <li key={r.id}>
                <span className="num">{hora(r.criadoEm)}</span>
                <span><strong className="num">{l?.codigo}</strong> {r.tempoViagemMin} min · espera {r.esperaMin} min · {r.clima} · {r.transito}</span>
                <span className="num">nota {r.satisfacao}</span>
                {!r.simulado ? <span className="tag" style={{ borderColor: "var(--go)", color: "var(--go)" }}>real</span> : <span className="tag">simulada</span>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
