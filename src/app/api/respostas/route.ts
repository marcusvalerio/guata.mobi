import { adicionarResposta, LINHAS } from "@/lib/store";
import type { Resposta } from "@/lib/types";

const um = <T extends string>(v: unknown, ops: readonly T[]) => (ops.includes(v as T) ? (v as T) : null);
const nota = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? (v as 1 | 2 | 3 | 4 | 5) : null);
const minutos = (v: unknown, max: number) => (typeof v === "number" && v >= 0 && v <= max ? Math.round(v) : null);

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const linha = LINHAS.find((l) => l.id === b?.linhaId);
  const tempo = minutos(b?.tempoViagemMin, 300);
  const espera = minutos(b?.esperaMin, 180);
  const clima = um(b?.clima, ["sol", "nublado", "chuva"] as const);
  const transito = um(b?.transito, ["livre", "moderado", "congestionado"] as const);
  const integracao = um(b?.integracao, ["nenhuma", "barcas", "municipal"] as const);
  const lot = nota(b?.lotacaoPlataforma), sat = nota(b?.satisfacao);
  if (!linha || tempo === null || espera === null || !clima || !transito || !integracao || !lot || !sat) {
    return Response.json({ erro: "Resposta incompleta ou fora da faixa." }, { status: 400 });
  }
  const r: Omit<Resposta, "id" | "criadoEm" | "simulado"> = {
    linhaId: linha.id, plataforma: linha.plataforma, tempoViagemMin: tempo, esperaMin: espera,
    saiuNoHorario: Boolean(b.saiuNoHorario), integracao,
    tempoIntegracaoMin: integracao === "nenhuma" ? null : minutos(b.tempoIntegracaoMin, 120),
    lotacaoPlataforma: lot, satisfacao: sat,
    reclamacao: typeof b.reclamacao === "string" && b.reclamacao.trim() ? b.reclamacao.trim().slice(0, 280) : null,
    presenciouOcorrencia: Boolean(b.presenciouOcorrencia), clima, transito,
  };
  return Response.json(await adicionarResposta(r), { status: 201 });
}
