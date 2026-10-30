import { connection } from "next/server";
import { Suspense } from "react";
import { banco } from "@/lib/store";
import { Pesquisa } from "./Pesquisa";

export const metadata = { title: "Avalie sua viagem · PIRN" };

async function ComLinhas({ searchParams }: { searchParams: PageProps<"/r">["searchParams"] }) {
  await connection();
  const [{ p }, b] = await Promise.all([searchParams, banco()]);
  return <Pesquisa linhas={b.linhas} plataforma={typeof p === "string" ? p : null} />;
}

export default function Page({ searchParams }: PageProps<"/r">) {
  return (
    <Suspense fallback={<p style={{ padding: 24, color: "var(--muted)" }}>Carregando linhas…</p>}>
      <ComLinhas searchParams={searchParams} />
    </Suspense>
  );
}
