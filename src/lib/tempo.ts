import type { Periodo } from "./types";

const TZ = "America/Sao_Paulo";
const fmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23", weekday: "short" });
const DIAS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Hora (0–23) e dia da semana (0 = domingo) no fuso do terminal. */
export function local(d: Date) {
  const parts = fmt.formatToParts(d);
  const hora = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const dia = DIAS.indexOf(parts.find((p) => p.type === "weekday")?.value ?? "Sun");
  return { hora, dia, fds: dia === 0 || dia === 6 };
}

export function periodoDe(d: Date): Periodo {
  const { hora } = local(d);
  if (hora < 5) return "madrugada";
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
}

export const NOME_PERIODO: Record<Periodo, string> = {
  madrugada: "Madrugada",
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};
