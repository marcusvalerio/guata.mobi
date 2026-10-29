import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { INICIO, NOME_PAPEL } from "@/lib/auth";
import type { Papel } from "@/lib/types";

const DESCRICAO: Record<Papel, string> = {
  central: "Saúde do sistema, integrações, terminais e dados de demonstração.",
  admin: "Usuários e cargos do terminal, linhas, plataformas e QR Codes.",
  gestor: "Painel das seis dimensões, previsão de amanhã e recomendações.",
  operador: "Alertas da operação, registro de ocorrências e contagem de fluxo.",
};

async function Volta({ searchParams }: { searchParams: PageProps<"/entrar">["searchParams"] }) {
  const { volta } = await searchParams;
  return <input type="hidden" name="volta" value={typeof volta === "string" ? volta : ""} />;
}

export default function Entrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "56px 20px", display: "grid", gap: 28 }}>
      <Link href="/" style={{ textDecoration: "none" }}><Logo /></Link>
      <div>
        <h1 style={{ fontSize: 34 }}>Entrar</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          Ambiente de demonstração: escolha um perfil. Na versão com banco, cada pessoa entra com e-mail e o cargo vem do cadastro.
        </p>
      </div>
      <form action="/api/sessao" method="post" style={{ display: "grid", gap: 10 }}>
        <Suspense><Volta searchParams={searchParams} /></Suspense>
        {(Object.keys(INICIO) as Papel[]).map((p) => (
          <button key={p} name="papel" value={p} className="card" style={{ textAlign: "left", padding: "16px 18px", cursor: "pointer", display: "grid", gap: 4 }}>
            <strong style={{ fontFamily: "var(--font-ui)", fontSize: 17 }}>{NOME_PAPEL[p]}</strong>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>{DESCRICAO[p]}</span>
          </button>
        ))}
      </form>
    </main>
  );
}
