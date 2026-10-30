"use client";

import { useEffect, useState } from "react";
import { usePainel } from "@/lib/usePainel";
import s from "./telao.module.css";

const ESTADO = { ok: "Normal", atencao: "Lento", critico: "Atrasos" } as const;

export function Telao({ plataforma }: { plataforma: string | null }) {
  const { dados } = usePainel(10000);
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const chuva = dados?.previsao.periodos.some((p) => p.probChuva >= 50);
  // Só linhas com plataforma cadastrada ou relato recente — o resto não tem o que mostrar.
  const linhas = dados?.tempoViagem
    .filter((t) => (plataforma ? t.linha.plataforma === plataforma : t.linha.plataforma || t.amostras > 0))
    .slice(0, 8) ?? [];

  return (
    <main className={s.tela}>
      <header className={s.top}>
        <div>
          <p className={s.k}>Terminal Presidente João Goulart</p>
          <h1>{plataforma ? `Plataforma ${plataforma}` : "Tempo estimado de viagem"}</h1>
        </div>
        <span className={s.clock}>{agora?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }) ?? "--:--"}</span>
      </header>

      <div className={s.board}>
        <div className={`${s.row} ${s.th}`}><span>Linha</span><span>Destino</span><span>Plat.</span><span>Viagem</span><span>Situação</span></div>
        {dados && linhas.length === 0 && (
          <p className={s.vazio}>
            {plataforma
              ? "Nenhuma linha cadastrada nesta plataforma ainda. Avalie sua viagem pelo QR Code."
              : "Aguardando os primeiros relatos dos passageiros. Avalie sua viagem pelo QR Code."}
          </p>
        )}
        {linhas.map((t) => (
          <div key={t.linha.id} className={s.row}>
            <span className={s.code}>{t.linha.codigo}</span>
            <span className={s.dest}>{t.linha.nome}</span>
            <span className={s.plat}>{t.linha.plataforma ?? "·"}</span>
            <span className={s.min}>{t.observado ?? t.esperado ?? "·"}{(t.observado ?? t.esperado) !== null && <small>min</small>}</span>
            <span className={s.st} data-s={t.amostras ? t.status : "atencao"}><i />{t.amostras ? ESTADO[t.status] : "Sem relatos"}</span>
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
          <img src={plataforma ? `/api/qrcode?p=${plataforma}` : "/api/qrcode"} alt="" width={112} height={112} />
          <div><strong>Avalie sua viagem</strong><span>Aponte a câmera. Anônimo, 1 minuto.</span></div>
        </div>
      </footer>
    </main>
  );
}
