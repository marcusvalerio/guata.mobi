import { Suspense } from "react";
import { PLATAFORMAS } from "@/lib/store";
import { Telao } from "./Telao";

export const metadata = { title: "Telão · PIRN" };

/** /telao?p=B mostra a plataforma B e o QR Code dela; sem p, o telão geral do terminal. */
async function ComPlataforma({ searchParams }: { searchParams: PageProps<"/telao">["searchParams"] }) {
  const { p } = await searchParams;
  return <Telao plataforma={typeof p === "string" && PLATAFORMAS.includes(p) ? p : null} />;
}

export default function Page({ searchParams }: PageProps<"/telao">) {
  return (
    <Suspense fallback={<Telao plataforma={null} />}>
      <ComPlataforma searchParams={searchParams} />
    </Suspense>
  );
}
