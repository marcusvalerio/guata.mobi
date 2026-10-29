import { cookies } from "next/headers";
import { COOKIE } from "@/lib/auth";
import { linhaValida, PLATAFORMAS, salvarLinha } from "@/lib/store";

const inteiro = (v: unknown, max: number) => (v === null || v === "" || v === undefined ? null : Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) <= max ? Number(v) : NaN);

/** Administração cadastra plataforma, intervalo e frota de uma linha oficial. */
export async function POST(req: Request) {
  const papel = (await cookies()).get(COOKIE)?.value;
  if (papel !== "admin" && papel !== "central") return Response.json({ erro: "Apenas administração." }, { status: 403 });
  const b = await req.json().catch(() => null);
  const headwayMin = inteiro(b?.headwayMin, 240), frota = inteiro(b?.frota, 500);
  const plataforma = b?.plataforma ? String(b.plataforma) : null;
  if (!linhaValida(b?.id) || Number.isNaN(headwayMin) || Number.isNaN(frota) || (plataforma && !PLATAFORMAS.includes(plataforma))) {
    return Response.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  await salvarLinha(b.id, { plataforma, headwayMin, frota });
  return Response.json({ ok: true });
}
