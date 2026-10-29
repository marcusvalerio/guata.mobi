import { connection } from "next/server";

/** Tempo agora no terminal (Open-Meteo), para pré-preencher a pesquisa. */
export async function GET() {
  await connection();
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-22.8918&longitude=-43.1238&current=precipitation,rain,weather_code,cloud_cover&timezone=America%2FSao_Paulo", { signal: AbortSignal.timeout(4000), cache: "no-store" });
    const j = (await r.json()) as { current: { precipitation: number; weather_code: number; cloud_cover: number } };
    const c = j.current;
    // Códigos WMO: 51+ é garoa/chuva/tempestade.
    const clima = c.precipitation > 0 || c.weather_code >= 51 ? "chuva" : c.cloud_cover >= 70 ? "nublado" : "sol";
    return Response.json({ clima, fonte: "open-meteo" });
  } catch {
    return Response.json({ clima: null });
  }
}
