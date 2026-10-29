"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Linha } from "@/lib/types";
import s from "./pesquisa.module.css";

type Opcao<T> = { v: T; t: string };

function Chips<T extends string | number | boolean>({ ops, valor, set }: { ops: Opcao<T>[]; valor: T | null; set: (v: T) => void }) {
  return (
    <div className="chips">
      {ops.map((o) => (
        <button type="button" key={String(o.v)} className="chip" aria-pressed={valor === o.v} onClick={() => set(o.v)}>{o.t}</button>
      ))}
    </div>
  );
}

const TEMPOS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function Pesquisa({ linhas, plataforma }: { linhas: Linha[]; plataforma: string | null }) {
  // Se a plataforma do QR Code tem linhas cadastradas, mostra só elas; senão, todas as linhas oficiais.
  const cadastradas = linhas.filter((l) => plataforma && l.plataforma === plataforma);
  const daPlataforma = cadastradas.length ? cadastradas : linhas;
  const consorcios = [...new Set(daPlataforma.map((l) => l.consorcio))];
  const [linhaId, setLinha] = useState<string>(daPlataforma.length === 1 ? daPlataforma[0].id : "");
  const [tempo, setTempo] = useState<number | null>(null);
  const [espera, setEspera] = useState<number | null>(null);
  const [noHorario, setNoHorario] = useState<boolean | null>(null);
  const [integracao, setIntegracao] = useState<"nenhuma" | "barcas" | "municipal" | null>(null);
  const [tInteg, setTInteg] = useState<number | null>(null);
  const [lotacao, setLotacao] = useState<number | null>(null);
  const [clima, setClima] = useState<"sol" | "nublado" | "chuva" | null>(null);
  const [transito, setTransito] = useState<"livre" | "moderado" | "congestionado" | null>(null);
  const [satisfacao, setSat] = useState<number | null>(null);
  const [reclamacao, setRecl] = useState("");
  const [ocorr, setOcorr] = useState<boolean | null>(null);
  const [estado, setEstado] = useState<"editando" | "enviando" | "ok" | "erro">("editando");
  const [climaAuto, setClimaAuto] = useState(false);

  // Tempo real no terminal (Open-Meteo) já vem marcado; o passageiro pode corrigir.
  useEffect(() => {
    fetch("/api/clima").then((r) => r.json()).then((j: { clima: "sol" | "nublado" | "chuva" | null }) => {
      if (j.clima) { setClima((c) => c ?? j.clima); setClimaAuto(true); }
    }).catch(() => {});
  }, []);

  const respondidas: [number, boolean][] = [
    [1, !!linhaId], [2, tempo !== null], [3, espera !== null], [4, noHorario !== null],
    [5, !!integracao], [6, !!lotacao], [7, !!clima && !!transito], [8, !!satisfacao],
  ];
  const faltam = respondidas.filter(([, ok]) => !ok).map(([n]) => n);
  const completo = faltam.length === 0;
  const [mostrarFaltas, setMostrarFaltas] = useState(false);
  const falta = (n: number) => mostrarFaltas && faltam.includes(n);
  const feitas = [linhaId, tempo, espera, noHorario, integracao, lotacao, clima && transito, satisfacao].filter((x) => x !== null && x !== "").length;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) {
      setMostrarFaltas(true);
      document.getElementById(`q${faltam[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setEstado("enviando");
    const res = await fetch("/api/respostas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        linhaId, plataforma, tempoViagemMin: tempo, esperaMin: espera, saiuNoHorario: noHorario, integracao,
        tempoIntegracaoMin: tInteg, lotacaoPlataforma: lotacao, satisfacao, reclamacao,
        presenciouOcorrencia: Boolean(ocorr), clima, transito,
      }),
    }).catch(() => null);
    setEstado(res?.ok ? "ok" : "erro");
  }

  if (estado === "ok") {
    return (
      <main className={s.page}>
        <Logo />
        <div className={s.done}>
          <span className={s.check} aria-hidden>✓</span>
          <h1>Obrigado.</h1>
          <p>Sua resposta já está no painel da gestão do terminal. Ela entra na estimativa de tempo de viagem das próximas viagens.</p>
          <Link href="/telao" className="btn ghost">Ver tempos estimados</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={s.page}>
      <div className={s.head}>
        <Logo />
        <span className="num" style={{ fontSize: 13, color: "var(--muted)" }}>{feitas}/8</span>
      </div>
      <div className={s.progress}><span style={{ width: `${(feitas / 8) * 100}%` }} /></div>
      <h1 className={s.h1}>Como foi sua viagem?</h1>
      <p className={s.sub}>Anônimo, sem cadastro. Leva menos de um minuto.</p>

      <form onSubmit={enviar} className={s.form}>
        <label className={`field ${falta(1) ? s.falta : ""}`} id="q1">
          <span>1. Qual linha?</span>
          <select className="input" value={linhaId} onChange={(e) => setLinha(e.target.value)} required>
            <option value="">Escolha a linha</option>
            {consorcios.map((c) => (
              <optgroup key={c} label={c}>
                {daPlataforma.filter((l) => l.consorcio === c).map((l) => (
                  <option key={l.id} value={l.id}>{l.codigo}{l.nome.startsWith("Linha ") ? "" : ` · ${l.nome}`}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <fieldset className={`field ${falta(2) ? s.falta : ""}`} id="q2">
          <span>2. Quanto tempo durou a viagem?</span>
          <Chips ops={TEMPOS.map((m) => ({ v: m, t: m >= 120 ? "2h ou mais" : `${m} min` }))} valor={tempo} set={setTempo} />
        </fieldset>

        <fieldset className={`field ${falta(3) ? s.falta : ""}`} id="q3">
          <span>3. Quanto tempo esperou o ônibus?</span>
          <Chips ops={[0, 5, 10, 15, 20, 30, 45].map((m) => ({ v: m, t: m === 0 ? "Não esperei" : `${m} min` }))} valor={espera} set={setEspera} />
        </fieldset>

        <fieldset className={`field ${falta(4) ? s.falta : ""}`} id="q4">
          <span>4. O ônibus saiu no horário?</span>
          <Chips ops={[{ v: true, t: "Sim" }, { v: false, t: "Não" }]} valor={noHorario} set={setNoHorario} />
        </fieldset>

        <fieldset className={`field ${falta(5) ? s.falta : ""}`} id="q5">
          <span>5. Vai fazer ou fez integração?</span>
          <Chips ops={[{ v: "nenhuma" as const, t: "Não" }, { v: "barcas" as const, t: "Barcas" }, { v: "municipal" as const, t: "Ônibus municipal" }]} valor={integracao} set={setIntegracao} />
          {integracao && integracao !== "nenhuma" && (
            <Chips ops={[5, 10, 15, 20, 30].map((m) => ({ v: m, t: `${m} min` }))} valor={tInteg} set={setTInteg} />
          )}
        </fieldset>

        <fieldset className={`field ${falta(6) ? s.falta : ""}`} id="q6">
          <span>6. Como estava a plataforma?</span>
          <Chips ops={[1, 2, 3, 4, 5].map((n) => ({ v: n, t: ["Vazia", "Tranquila", "Normal", "Cheia", "Lotada"][n - 1] }))} valor={lotacao} set={setLotacao} />
        </fieldset>

        <fieldset className={`field ${falta(7) ? s.falta : ""}`} id="q7">
          <span>7. Como estava o tempo e o trânsito?</span>
          {climaAuto && <small style={{ color: "var(--muted)" }}>Marcamos o tempo de agora no terminal. Corrija se na sua viagem estava diferente.</small>}
          <Chips ops={[{ v: "sol" as const, t: "Sol" }, { v: "nublado" as const, t: "Nublado" }, { v: "chuva" as const, t: "Chuva" }]} valor={clima} set={setClima} />
          <Chips ops={[{ v: "livre" as const, t: "Livre" }, { v: "moderado" as const, t: "Lento" }, { v: "congestionado" as const, t: "Engarrafado" }]} valor={transito} set={setTransito} />
        </fieldset>

        <fieldset className={`field ${falta(8) ? s.falta : ""}`} id="q8">
          <span>8. Nota geral para a viagem</span>
          <div className={s.likert}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} className="chip" aria-pressed={satisfacao === n} onClick={() => setSat(n)} aria-label={`Nota ${n}`}>{n}</button>
            ))}
          </div>
          <div className={s.likertEnds}><span>Muito ruim</span><span>Muito boa</span></div>
        </fieldset>

        <details className={s.more}>
          <summary>Quer contar mais? (opcional)</summary>
          <div style={{ display: "grid", gap: 16, marginTop: 14 }}>
            <label className="field">
              <span>Reclamação ou sugestão</span>
              <textarea className="input" maxLength={280} value={reclamacao} onChange={(e) => setRecl(e.target.value)} placeholder="Não escreva nome, telefone ou documento." />
            </label>
            <fieldset className="field">
              <span>Presenciou alguma ocorrência de segurança?</span>
              <Chips ops={[{ v: false, t: "Não" }, { v: true, t: "Sim" }]} valor={ocorr} set={setOcorr} />
            </fieldset>
          </div>
        </details>

        <button className="btn signal" style={{ justifyContent: "center", height: 52 }} disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar resposta"}
        </button>
        {mostrarFaltas && !completo && (
          <p role="alert" style={{ color: "var(--stop)" }}>
            Falta responder {faltam.length === 1 ? "a pergunta" : "as perguntas"} {faltam.join(", ")}.
            {faltam.includes(7) && clima && !transito ? " Na 7, marque também como estava o trânsito." : ""}
          </p>
        )}
        {estado === "erro" && <p role="alert" style={{ color: "var(--stop)" }}>Não foi possível enviar. Verifique a internet e tente de novo.</p>}
        <p className={s.lgpd}>Não coletamos dados pessoais. As respostas são usadas de forma agregada para a gestão do terminal (LGPD, Lei 13.709/2018).</p>
      </form>
    </main>
  );
}
