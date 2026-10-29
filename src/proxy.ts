import { NextResponse, type NextRequest } from "next/server";
import { ACESSO, COOKIE, papelValido } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const area = Object.keys(ACESSO).find((p) => req.nextUrl.pathname.startsWith(p));
  if (!area) return NextResponse.next();
  const papel = req.cookies.get(COOKIE)?.value;
  if (papelValido(papel) && ACESSO[area].includes(papel)) return NextResponse.next();
  const url = new URL("/entrar", req.url);
  url.searchParams.set("volta", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/central/:path*", "/admin/:path*", "/painel/:path*", "/operador/:path*"],
};
