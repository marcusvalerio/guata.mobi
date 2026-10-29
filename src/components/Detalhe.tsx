"use client";

import { useEffect, useRef } from "react";
import s from "./detalhe.module.css";

/** Painel lateral de nota metodológica. Fecha com Esc, clique fora ou no botão. */
export function Detalhe({ aberto, fechar, titulo, sobre, children }: {
  aberto: boolean; fechar: () => void; titulo: string; sobre: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  return (
    <dialog ref={ref} className={s.dialogo} onClose={fechar} onClick={(e) => e.target === ref.current && fechar()}>
      <div className={s.corpo}>
        <header className={s.topo}>
          <div>
            <p className="eyebrow">{sobre}</p>
            <h2>{titulo}</h2>
          </div>
          <button type="button" className={s.fechar} onClick={fechar} aria-label="Fechar">×</button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className={s.secao}>
      <h3>{titulo}</h3>
      {children}
    </section>
  );
}
