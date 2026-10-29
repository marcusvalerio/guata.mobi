import { connection } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, NOME_PAPEL, papelValido } from "@/lib/auth";
import { adicionarOcorrencia, banco } from "@/lib/store";
import type { Ocorrencia } from "@/lib/types";

const TIPOS: Ocorrencia["tipo"][] = ["seguranca", "lotacao", "acessibilidade", "manutencao", "outro"];

export async function GET() {
  await connection();
  return Response.json(banco().ocorrencias.slice(-30).reverse());
}

export async function POST(req: Request) {
  const papel = (await cookies()).get(COOKIE)?.value;
  if (!papelValido(papel)) return Response.json({ erro: "Sem sessão." }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!TIPOS.includes(b?.tipo) || typeof b?.local !== "string" || !b.local.trim()) {
    return Response.json({ erro: "Informe tipo e local." }, { status: 400 });
  }
  const o = adicionarOcorrencia({
    tipo: b.tipo, local: b.local.trim().slice(0, 60),
    descricao: String(b.descricao ?? "").trim().slice(0, 280), autor: NOME_PAPEL[papel],
  });
  return Response.json(o, { status: 201 });
}
