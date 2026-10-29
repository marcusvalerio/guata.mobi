import { cookies } from "next/headers";
import { COOKIE } from "@/lib/auth";
import { reiniciarSimulacao, removerSimulados } from "@/lib/store";

export async function POST(req: Request) {
  if ((await cookies()).get(COOKIE)?.value !== "central") return Response.json({ erro: "Apenas Admin Central." }, { status: 403 });
  const { acao } = await req.json().catch(() => ({}));
  if (acao === "reiniciar") await reiniciarSimulacao();
  else if (acao === "limpar") await removerSimulados();
  else return Response.json({ erro: "Ação desconhecida." }, { status: 400 });
  return Response.json({ ok: true });
}
