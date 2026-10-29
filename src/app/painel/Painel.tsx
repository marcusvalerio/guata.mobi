"use client";

import { useState } from "react";
import { Detalhe, Secao } from "@/components/Detalhe";
import { Mapa } from "@/components/Mapa";
import { NOTA_CONFIABILIDADE, NOTAS } from "@/lib/metodologia";
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
  const [aberto, setAberto] = useState<string | null>(null);

  if (!dados) return <p className={s.loading}>{erro ? "Sem conexão com o servidor." : "Carregando indicadores…"}</p>;
  const { kpis, tempoViagem, cenarios, previsao, ultimas, totais, confiabilidade: conf } = dados;
  const alertas = tempoViagem.filter((t) => t.amostras > 0 && (t.status === "critico" || t.alerta));
  const comRelato = tempoViagem.filter((t) => t.amostras > 0);

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
          <button type="button" className={s.confBtn} data-nivel={conf.nivel} onClick={() => setAberto("confiabilidade")}>
            <span className={s.confBar}><i style={{ width: `${conf.pct}%` }} /></span>
            Confiabilidade {conf.pct}%
          </button>
          <span className="tag">{totais.respostas.toLocaleString("pt-BR")} respostas · {totais.reais} reais</span>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className={s.alert} role="status">
          <strong>Atenção no tempo de viagem</strong>
          {alertas.map((a) => (
            <span key={a.linha.id}>Linha {a.linha.codigo}: {a.alerta ?? `${a.observado} min observado vs ${a.esperado ?? "sem histórico de"} min esperado`}</span>
          ))}
        </div>
      )}

      <section className={s.kpis} aria-label="Indicadores chave">
        {kpis.map((k) => (
          <article key={k.dimensao} className={`card ${s.kpi} ${s.clicavel}`} data-status={k.n === 0 ? "vazio" : k.status} role="button" tabIndex={0} onClick={() => setAberto(k.dimensao)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAberto(k.dimensao)}>
            <div className={s.kpiTop}>
              <span className="eyebrow">{k.dimensao}</span>
              {k.n === 0
                ? <span className={s.status} style={{ color: "var(--muted)" }}><span className="dot pendente" />Sem dado</span>
                : <span className={s.status} style={{ color: COR[k.status] }}><span className={`dot ${k.status}`} />{ROTULO[k.status]}</span>}
            </div>
            <h2 className={s.kpiI}>{k.indicador}</h2>
            <p className={s.kpiV}>
              {k.valor === null ? <span className={s.semDado}>Aguardando registros</span> : (<><span className="num">{k.valor}</span>
              <small>{k.unidade}</small></>)}
            </p>
            <Sparkline dados={k.serie} cor={COR[k.status]} />
            <p className={s.kpiD}>{k.detalhe}</p>
            <p className={s.kpiO}>{k.objetivo} <span className={s.ver}>Como é medido</span></p>
          </article>
        ))}
      </section>

      <section className={`card ${s.block} ${s.wide}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Mapa · OpenStreetMap</p>
            <h2>Plataformas por situação e linhas que saem do terminal</h2>
          </div>
        </div>
        <Mapa dados={dados} />
      </section>

      <section className={`card ${s.block} ${s.wide}`}>
        <div className={s.blockH}>
          <div>
            <p className="eyebrow">Índice de tempo de viagem · últimas 2h</p>
            <h2>Observado pelos passageiros vs. esperado para a condição atual</h2>
          </div>
          <span className={s.muted}>{comRelato.length} de {tempoViagem.length} linhas com relato nas últimas 2h</span>
        </div>
        {comRelato.length === 0 ? (
          <p className={s.muted}>Nenhum relato real nas últimas 2 horas. Assim que passageiros responderem pelo QR Code, as linhas aparecem aqui.</p>
        ) : (
        <div className="scroll-x">
          <table>
            <thead><tr><th>Linha</th><th>Plat.</th><th>Esperado</th><th>Observado</th><th style={{ width: "34%" }}>Índice</th><th>Relatos</th></tr></thead>
            <tbody>
              {comRelato.map((t) => (
                <tr key={t.linha.id}>
                  <td><strong className="num">{t.linha.codigo}</strong> <span className={s.muted}>{t.linha.nome}</span></td>
                  <td className="num">{t.linha.plataforma ?? "·"}</td>
                  <td className="num">{t.esperado ? `${t.esperado} min` : <span className={s.muted}>sem histórico</span>}</td>
                  <td className="num">{t.observado ? `${t.observado} min` : "·"}</td>
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
        )}
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
              <span className={`num ${s.scenN}`}>{c.min ?? "·"}{c.min !== null && <small>min</small>}</span>
              <span className={s.muted}>{c.amostras ? `mediana de ${c.amostras} relatos` : "menos de 5 relatos reais"}</span>
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
          <span className="tag">{previsao.fonte === "open-meteo" ? "Open Meteo" : "Sem previsão · assumindo tempo seco"}</span>
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
        {previsao.recomendacoes.length === 0 ? (
          <p className={s.muted}>Nenhuma linha tem intervalo e frota cadastrados. Cadastre em Administração → Linhas para o painel calcular a recomendação a partir dos relatos reais.</p>
        ) : (
        <div className="scroll-x">
          <table>
            <thead>
              <tr><th>Linha</th><th>Frota atual</th>{previsao.periodos.map((p) => <th key={p.periodo}>{NOME_PERIODO[p.periodo]}</th>)}</tr>
            </thead>
            <tbody>
              {previsao.recomendacoes.map((r) => (
                <tr key={r.linha.id}>
                  <td><strong className="num">{r.linha.codigo}</strong> <span className={s.muted}>{r.linha.nome}</span></td>
                  <td className="num">{r.linha.frota} · a cada {r.linha.headwayMin} min</td>
                  {r.porPeriodo.map((p) => (
                    <td key={p.periodo} className="num">
                      {p.tempoMin === null ? <span className={s.muted}>sem histórico</span> : (<>
                      <div>{p.tempoMin} min de viagem</div>
                      <div className={s.muted}>a cada {p.headway} min · {p.frota} ônibus</div>
                      {p.delta! > 0 && <span className={s.delta}>{p.delta} a mais</span>}
                      {p.delta! < 0 && <span className={s.deltaNeg}>{Math.abs(p.delta!)} a menos</span>}
                      </>)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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

      {kpis.map((k) => {
        const n = NOTAS[k.dimensao];
        return (
          <Detalhe key={k.dimensao} aberto={aberto === k.dimensao} fechar={() => setAberto(null)} titulo={`${k.dimensao}: ${k.indicador}`} sobre="Nota metodológica">
            <Secao titulo="Agora">
              <p><strong className="num">{k.valor ?? "sem dado"} {k.valor !== null && k.unidade}</strong> · calculado com {k.n} {k.n === 1 ? "registro" : "registros"} · {k.detalhe}</p>
            </Secao>
            <Secao titulo="O que responde"><p>{n.pergunta}</p><small>Objetivo operacional (Tabela 1): {k.objetivo}</small></Secao>
            <Secao titulo="Como é coletado"><ul>{n.coleta.map((t) => <li key={t}>{t}</li>)}</ul></Secao>
            <Secao titulo="Como é calculado"><ul>{n.calculo.map((t) => <li key={t}>{t}</li>)}</ul></Secao>
            <Secao titulo="Leitura do semáforo"><p>{n.semaforo}</p></Secao>
            <Secao titulo="Lugar na arquitetura"><p>{n.camadas}</p></Secao>
            <Secao titulo="Limitações"><ul>{n.limitacoes.map((t) => <li key={t}>{t}</li>)}</ul></Secao>
            <Secao titulo="Referências"><ul>{n.referencias.map((t) => <li key={t}><small>{t}</small></li>)}</ul></Secao>
          </Detalhe>
        );
      })}

      <Detalhe aberto={aberto === "confiabilidade"} fechar={() => setAberto(null)} titulo={`Confiabilidade dos dados: ${conf.pct}%`} sobre="Nota metodológica">
        <Secao titulo="Agora">
          {conf.fatores.map((f) => (
            <div key={f.nome} className={s.confRow}>
              <span>{f.nome} <small className={s.muted}>peso {Math.round(f.peso * 100)}%</small></span>
              <span className="num">{Math.round(f.valor * 100)}%</span>
              <span className={s.confBar}><i style={{ width: `${f.valor * 100}%` }} /></span>
              <small className={s.muted}>{f.detalhe}</small>
            </div>
          ))}
        </Secao>
        <Secao titulo="Por que medir a confiabilidade">{NOTA_CONFIABILIDADE.porque.map((t) => <p key={t}>{t}</p>)}</Secao>
        <Secao titulo="Como é composta"><ul>{NOTA_CONFIABILIDADE.fatores.map((f) => <li key={f.nome}><strong>{f.nome}.</strong> {f.texto}</li>)}</ul></Secao>
        <Secao titulo="Leitura"><p>{NOTA_CONFIABILIDADE.leitura}</p></Secao>
        <Secao titulo="Limitações"><ul>{NOTA_CONFIABILIDADE.limitacoes.map((t) => <li key={t}>{t}</li>)}</ul></Secao>
      </Detalhe>
    </div>
  );
}
