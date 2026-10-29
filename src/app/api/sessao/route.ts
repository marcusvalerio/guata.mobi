import { cookies } from "next/headers";
import { COOKIE, INICIO, papelValido } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const papel = String(form.get("papel"));
  const volta = String(form.get("volta") ?? "");
  const jar = await cookies();
  if (papel === "sair") {
    jar.delete(COOKIE);
    return Response.redirect(new URL("/", req.url), 303);
  }
  if (!papelValido(papel)) return Response.redirect(new URL("/entrar", req.url), 303);
  jar.set(COOKIE, papel, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  const destino = volta.startsWith("/") && !volta.startsWith("//") ? volta : INICIO[papel];
  return Response.redirect(new URL(destino, req.url), 303);
}
