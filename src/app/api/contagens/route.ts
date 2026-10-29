import { cookies } from "next/headers";
import { COOKIE, papelValido } from "@/lib/auth";
import { adicionarContagem } from "@/lib/store";

const FONTES = ["manual", "sensor", "camera", "bilhetagem"] as const;

/** Ponto de entrada único para fluxo: contagem manual hoje, sensor/câmera/bilhetagem depois. */
export async function POST(req: Request) {
  const chave = req.headers.get("x-guata-chave");
  const papel = (await cookies()).get(COOKIE)?.value;
  if (!papelValido(papel) && !(chave && chave === process.env.GUATA_CHAVE_INTEGRACAO)) {
    return Response.json({ erro: "Sem sessão ou chave de integração." }, { status: 401 });
  }
  const b = await req.json().catch(() => null);
  const n = Number(b?.passageiros), janela = Number(b?.janelaMin ?? 60);
  if (!FONTES.includes(b?.fonte) || !Number.isFinite(n) || n < 0 || !(janela > 0 && janela <= 240)) {
    return Response.json({ erro: "Contagem inválida." }, { status: 400 });
  }
  return Response.json(adicionarContagem({ fonte: b.fonte, local: String(b.local ?? "Entrada principal").slice(0, 60), passageiros: Math.round(n), janelaMin: janela }), { status: 201 });
}
