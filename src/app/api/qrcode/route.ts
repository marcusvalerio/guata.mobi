import QRCode from "qrcode";

/** SVG do QR Code que leva ao formulário. ?p=A pré-seleciona a plataforma. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const alvo = new URL("/r", u.origin);
  const p = u.searchParams.get("p");
  if (p && /^[A-Z]$/.test(p)) alvo.searchParams.set("p", p);
  const svg = await QRCode.toString(alvo.toString(), { type: "svg", margin: 1, color: { dark: "#100c08", light: "#00000000" } });
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" } });
}
