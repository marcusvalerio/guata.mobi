import { Shell } from "@/components/Shell";
import { NOME_PAPEL } from "@/lib/auth";
import { LINHAS, PLATAFORMAS, USUARIOS_DEMO } from "@/lib/store";
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
                  <tr key={p}><td>{p}</td>{v.map((x, i) => <td key={i} className="num">{x ? "●" : <span className={s.muted}>–</span>}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`card ${s.block} ${s.wide}`}>
          <div className={s.blockH}>
            <div><p className="eyebrow">Rede</p><h2>Linhas cadastradas</h2></div>
            <span className="tag">Exemplos · substituir pelo GTFS do MOBNIT</span>
          </div>
          <div className="scroll-x">
            <table>
              <thead><tr><th>Código</th><th>Linha</th><th>Tipo</th><th>Plataforma</th><th>Tempo base</th><th>Intervalo</th><th>Frota</th></tr></thead>
              <tbody>
                {LINHAS.map((l) => (
                  <tr key={l.id}><td className="num"><strong>{l.codigo}</strong></td><td>{l.nome}</td><td>{l.tipo}</td><td className="num">{l.plataforma}</td><td className="num">{l.tempoBaseMin} min</td><td className="num">{l.headwayMin} min</td><td className="num">{l.frota}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}
