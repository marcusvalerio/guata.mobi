import { Suspense } from "react";
import { LINHAS } from "@/lib/store";
import { Pesquisa } from "./Pesquisa";

export const metadata = { title: "Avalie sua viagem · Guatá" };

async function ComPlataforma({ searchParams }: { searchParams: PageProps<"/r">["searchParams"] }) {
  const { p } = await searchParams;
  return <Pesquisa linhas={LINHAS} plataforma={typeof p === "string" ? p : null} />;
}

export default function Page({ searchParams }: PageProps<"/r">) {
  return (
    <Suspense fallback={<Pesquisa linhas={LINHAS} plataforma={null} />}>
      <ComPlataforma searchParams={searchParams} />
    </Suspense>
  );
}
