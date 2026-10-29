import { connection } from "next/server";
import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { NOME_PAPEL } from "@/lib/auth";
import FROTA from "@/lib/frota-vistoria-2024.json";
import { banco, FONTE_LINHAS, PLATAFORMAS, USUARIOS_DEMO } from "@/lib/store";
import { Linhas } from "./Linhas";
import s from "../painel/painel.module.css";
import a from "./admin.module.css";

export const metadata = { title: "Administração · Guatá" };

const PERMISSOES = [
  ["Ver painel das 6 dimensões", true, true, true, false],
  ["Ver alertas e registrar ocorrências", true, true, true, true],
  ["Registrar contagem de fluxo", true, true, true, true],
  ["Gerenciar linhas, plataformas e QR Codes", true, true, false, false],
  ["Gerenciar usuários e cargos do terminal", true, true, false, false],
  ["Saúde do sistema e integrações", true, false, false, false],
  ["Cadastrar terminais e organizações", true, false, false, false],
] as const;

async function TabelaLinhas() {
  await connection();
  const b = await banco();
  return <Linhas linhas={b.linhas} plataformas={PLATAFORMAS} />;
}

export default function Page() {
  return (
    <Shell atual="/admin">
      <div className={s.grid}>
        <div className={s.head}>
          <div>
            <p className="eyebrow">Terminal Presidente João Goulart</p>
            <h1 className={s.h1}>Administração</h1>
          </div>
        </div>

        <section className={`card ${s.block} ${s.wide}`}>
          <div className={s.blockH}>
            <div><p className="eyebrow">Coleta</p><h2>QR Codes por plataforma</h2></div>
            <span className={s.muted}>Imprima e fixe na altura dos olhos, perto da fila de embarque.</span>
          </div>
          <div className={a.qrs}>
            {PLATAFORMAS.map((p) => (
              <figure key={p} className={a.qr}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/qrcode?p=${p}`} alt={`QR Code da plataforma ${p}`} width={160} height={160} />
                <figcaption>
                  <strong>Plataforma {p}</strong>
                  <a href={`/r?p=${p}`} target="_blank" className={s.muted}>/r?p={p}</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={`card ${s.block}`}>
          <div className={s.blockH}><div><p className="eyebrow">Equipe</p><h2>Usuários e cargos</h2></div></div>
          <table>
            <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th></tr></thead>
            <tbody>
              {USUARIOS_DEMO.map((u) => (
                <tr key={u.id}><td>{u.nome}</td><td className="num" style={{ fontSize: 13 }}>{u.email}</td><td><span className="tag">{NOME_PAPEL[u.papel]}</span></td></tr>
              ))}
            </tbody>
          </table>
          <p className={s.muted}>Convites por e-mail entram junto com o banco de dados (Supabase Auth).</p>
        </section>

        <section className={`card ${s.block}`}>
          <div className={s.blockH}><div><p className="eyebrow">Controle de acesso</p><h2>O que cada cargo pode fazer</h2></div></div>
          <div className="scroll-x">
            <table>
              <thead><tr><th>Permissão</th><th>Central</th><th>Admin</th><th>Gestor</th><th>Operador</th></tr></thead>
              <tbody>
                {PERMISSOES.map(([p, ...v]) => (
                  <tr key={p}><td>{p}</td>{v.map((x, i) => <td key={i} className="num">{x ? "●" : <span className={s.muted}>·</span>}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`card ${s.block} ${s.wide}`}>
          <div className={s.blockH}>
            <div><p className="eyebrow">Rede</p><h2>Linhas que passam pelo terminal</h2></div>
            <span className={s.muted}>Fonte: {FONTE_LINHAS.fonte} · coletado em {FONTE_LINHAS.coletadoEm.split("-").reverse().join("/")}</span>
          </div>
          <p className={s.muted}>Plataforma, intervalo e frota não são públicos: cadastre o que a operação confirmar. Sem cadastro, o painel mostra “não informado” e não calcula recomendação para a linha.</p>
          <Suspense fallback={<p className={s.muted}>Carregando linhas…</p>}>
            <TabelaLinhas />
          </Suspense>
        </section>

        <section className={`card ${s.block} ${s.wide}`}>
          <div className={s.blockH}>
            <div><p className="eyebrow">Frota municipal</p><h2>Veículos vistoriados por empresa</h2></div>
            <span className={s.muted}>{FROTA.fonte}</span>
          </div>
          <div className="scroll-x">
            <table>
              <thead><tr><th>Consórcio</th><th>Empresa</th><th>Veículos</th><th>Ar-condicionado</th><th>Acessibilidade</th><th>GPS</th><th>Câmera</th><th>Lugares sentados</th></tr></thead>
              <tbody>
                {FROTA.empresas.map((e) => (
                  <tr key={e.empresa}>
                    <td className={s.muted}>{e.consorcio}</td><td>{e.empresa}</td><td className="num"><strong>{e.veiculos}</strong></td>
                    <td className="num">{e.arCondicionado}</td><td className="num">{e.acessibilidade}</td><td className="num">{e.gps}</td><td className="num">{e.camera}</td><td className="num">{e.lugaresSentados.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
                <tr>
                  <td /><td><strong>Total</strong></td>
                  {(["veiculos", "arCondicionado", "acessibilidade", "gps", "camera", "lugaresSentados"] as const).map((k) => (
                    <td key={k} className="num"><strong>{FROTA.empresas.reduce((a, e) => a + e[k], 0).toLocaleString("pt-BR")}</strong></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}
