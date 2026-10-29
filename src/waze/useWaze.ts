"use client";
// MÓDULO WAZE (complementar).
import { useEffect, useState } from "react";
import type { trafegoWaze } from "./dados";

export type DadosWaze = Awaited<ReturnType<typeof trafegoWaze>>;

export function useWaze(ativo = true) {
  const [dados, setDados] = useState<DadosWaze | null>(null);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    const tick = async () => {
      const r = await fetch("/api/waze", { cache: "no-store" }).catch(() => null);
      if (!vivo) return;
      if (r?.ok) { setDados(await r.json()); setErro(false); } else setErro(true);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => { vivo = false; clearInterval(id); };
  }, [ativo]);
  return { dados, erro };
}
