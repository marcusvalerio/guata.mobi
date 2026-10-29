import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { ACESSO, COOKIE, NOME_PAPEL, papelValido } from "@/lib/auth";
import { Logo } from "./Logo";
import s from "./shell.module.css";

const ROTULO: Record<string, string> = {
  "/painel": "Painel",
  "/operador": "Operação",
  "/admin": "Administração",
  "/central": "Central",
};

async function Navegacao({ atual }: { atual: string }) {
  const papel = (await cookies()).get(COOKIE)?.value;
  const p = papelValido(papel) ? papel : null;
  const areas = Object.keys(ROTULO).filter((a) => p && ACESSO[a].includes(p));
  return (
    <>
      <nav className={s.nav}>
        {areas.map((a) => (
          <Link key={a} href={a} aria-current={a === atual ? "page" : undefined}>{ROTULO[a]}</Link>
        ))}
        <Link href="/telao" target="_blank">Telão ↗</Link>
      </nav>
      <form action="/api/sessao" method="post" className={s.user}>
        {p && <span className="tag">{NOME_PAPEL[p]}</span>}
        <button name="papel" value="sair" className={s.sair}>Sair</button>
      </form>
    </>
  );
}

export function Shell({ atual, children }: { atual: string; children: React.ReactNode }) {
  return (
    <div className={s.app}>
      <header className={s.bar}>
        <div className={s.barIn}>
          <Link href="/" style={{ textDecoration: "none" }}><Logo size={18} /></Link>
          <Suspense fallback={<nav className={s.nav} />}>
            <Navegacao atual={atual} />
          </Suspense>
        </div>
      </header>
      <main className={s.main}>{children}</main>
    </div>
  );
}
