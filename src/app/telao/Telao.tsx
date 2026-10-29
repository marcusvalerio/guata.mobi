"use client";

import { useEffect, useState } from "react";
import { usePainel } from "@/lib/usePainel";
import s from "./telao.module.css";

const ESTADO = { ok: "Normal", atencao: "Lento", critico: "Atrasos" } as const;

export function Telao() {
  const { dados } = usePainel(10000);
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const chuva = dados?.previsao.periodos.some((p) => p.probChuva >= 50);

  return (
    <main className={s.tela}>
      <header className={s.top}>
        <div>
          <p className={s.k}>Terminal Presidente João Goulart</p>
          <h1>Tempo estimado de viagem</h1>
        </div>
        <span className={s.clock}>{agora?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }) ?? "--:--"}</span>
      </header>

      <div className={s.board}>
        <div className={`${s.row} ${s.th}`}><span>Linha</span><span>Destino</span><span>Plat.</span><span>Viagem</span><span>Situação</span></div>
        {dados?.tempoViagem.map((t) => (
          <div key={t.linha.id} className={s.row}>
            <span className={s.code}>{t.linha.codigo}</span>
            <span className={s.dest}>{t.linha.nome}</span>
            <span className={s.plat}>{t.linha.plataforma}</span>
            <span className={s.min}>{t.observado ?? t.esperado}<small>min</small></span>
            <span className={s.st} data-s={t.status}><i />{ESTADO[t.status]}</span>
          </div>
        ))}
      </div>

      <footer className={s.foot}>
        <div className={s.ticker}>
          <span>
            {chuva ? "Previsão de chuva para amanhã: saia com antecedência. " : "Amanhã sem previsão de chuva. "}
            Integração com as barcas pela passarela principal. · Tempos calculados a partir dos relatos dos passageiros. ·{" "}
          </span>
        </div>
        <div className={s.qr}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/qrcode" alt="" width={112} height={112} />
          <div><strong>Avalie sua viagem</strong><span>Aponte a câmera. Anônimo, 1 minuto.</span></div>
        </div>
      </footer>
    </main>
  );
}
