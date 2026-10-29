import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Road } from "@/components/Road";
import s from "./landing.module.css";

const DIMENSOES = [
  ["Demanda", "Fluxo de embarque e desembarque", "pass/hora", "Identificar picos de lotação e dimensionar filas."],
  ["Operação", "Índice de pontualidade e regularidade", "%", "Monitorar cumprimento de tabelas horárias."],
  ["Infraestrutura", "Taxa de ocupação de plataformas", "%", "Otimizar alocação de ônibus e tempos de permanência."],
  ["Acessibilidade", "Tempo médio de integração intermodal", "min", "Avaliar fluidez com barcas e linhas municipais."],
  ["Satisfação", "Volume de reclamações e escore médio", "Likert", "Incorporar a percepção do usuário na gestão."],
  ["Segurança", "Nº de ocorrências registradas", "período/local", "Subsidiar ações de segurança e sinalização."],
];

const CAMADAS = [
  ["Coleta", "QR Code dos passageiros, registros do operador, contagem de fluxo, clima. Depois: bilhetagem, GPS, sensores."],
  ["Ingestão e armazenamento", "Cada resposta é validada e gravada no banco histórico na hora em que chega."],
  ["Processamento e análise", "Estimativa de tempo por condição (clima, dia, período) e detecção de anomalias."],
  ["Visualização", "Painel ao vivo para gestão, tela de operação e telão público no terminal."],
  ["Governança", "Formulário anônimo, filtro de respostas fora da faixa, perfis de acesso e trilha de conformidade com a LGPD."],
];

const CENARIOS = [
  ["Dia útil, sol", "10", "fluxo livre"],
  ["Dia útil, chuva", "15", "+50% no trajeto"],
  ["Fim de semana", "8", "menos veículos"],
  ["Madrugada", "4", "via vazia"],
];

export default function Home() {
  return (
    <main>
      <header className={s.top}>
        <div className={`wrap ${s.topIn}`}>
          <Logo />
          <nav className={s.nav}>
            <a href="#estudo">Estudo</a>
            <a href="#dimensoes">Indicadores</a>
            <a href="#como">Como funciona</a>
            <Link href="/telao">Telão</Link>
            <Link href="/entrar" className="btn ghost">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className={`wrap ${s.hero}`}>
        <p className="eyebrow">Terminal Rodoviário Presidente João Goulart · Niterói, RJ</p>
        <h1 className={s.h1}>
          O terminal medido<br />por quem passa por ele.
        </h1>
        <div className={s.heroRow}>
          <p className={s.lead}>
            O Guatá transforma relatos de passageiros, registros da operação e dados da cidade em seis
            indicadores ao vivo e numa previsão de tempo de viagem para o dia seguinte. A gestão ajusta
            horários, intervalos e frota antes da fila se formar, não depois.
          </p>
          <div className={s.ctas}>
            <Link href="/painel" className="btn">Ver painel ao vivo</Link>
            <Link href="/r" className="btn ghost">Responder a pesquisa</Link>
          </div>
        </div>
        <Road />
        <div className={s.board}>
          {CENARIOS.map(([c, m, d]) => (
            <div key={c} className={s.boardCell}>
              <span className="eyebrow">{c}</span>
              <span className={`num ${s.boardNum}`}>{m}<small>min</small></span>
              <span className={s.boardSub}>{d}</span>
            </div>
          ))}
        </div>
        <p className={s.note}>Trajeto de exemplo. Os valores do painel são recalculados com cada resposta registrada.</p>
      </section>

      <section id="estudo" className={s.band}>
        <div className={`wrap ${s.two}`}>
          <div>
            <p className="eyebrow">O problema</p>
            <h2 className={s.h2}>Decisões que chegam depois do problema.</h2>
          </div>
          <div className={s.prose}>
            <p>
              Como muitos terminais brasileiros, o João Goulart ainda é gerido com processos manuais e
              informação fragmentada. Bilhetagem e rastreamento ficam em sistemas separados; a fila só
              vira dado quando já está na plataforma.
            </p>
            <p>
              A pesquisa em andamento no PET/COPPE/UFRJ propõe um painel inteligente fundamentado em
              Ciência de Dados e indicadores operacionais para apoiar o planejamento da mobilidade.
              O Guatá é o protótipo dessa proposta.
            </p>
            <ul className={s.facts}>
              <li><span className="num">6</span> dimensões de análise</li>
              <li><span className="num">5</span> camadas de arquitetura</li>
              <li><span className="num">3</span> modais integrados: ônibus intermunicipal, municipal e barcas</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="dimensoes" className="wrap">
        <div className={s.secHead}>
          <p className="eyebrow">Tabela 1 · Indicadores-chave de desempenho</p>
          <h2 className={s.h2}>Seis dimensões, um painel.</h2>
        </div>
        <ol className={s.dims}>
          {DIMENSOES.map(([d, i, u, o], k) => (
            <li key={d} className={s.dim}>
              <span className={`num ${s.dimN}`}>{String(k + 1).padStart(2, "0")}</span>
              <div>
                <h3>{d}</h3>
                <p className={s.dimI}>{i} <span className="tag">{u}</span></p>
              </div>
              <p className={s.dimO}>{o}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="como" className={s.dark}>
        <div className="wrap">
          <div className={s.secHead}>
            <p className="eyebrow">Arquitetura técnica</p>
            <h2 className={s.h2}>Do relato ao ajuste de frota.</h2>
          </div>
          <ol className={s.layers}>
            {CAMADAS.map(([t, d], k) => (
              <li key={t} className={s.layer}>
                <span className={`num ${s.layerN}`}>{["i", "ii", "iii", "iv", "v"][k]}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
          <div className={s.flow} aria-hidden>
            <span /><span /><span />
          </div>

          <div className={s.steps}>
            <div>
              <span className="num">01</span>
              <h3>Passageiro escaneia</h3>
              <p>QR Code nas plataformas. Oito perguntas, menos de um minuto, sem cadastro e sem dado pessoal.</p>
            </div>
            <div>
              <span className="num">02</span>
              <h3>Painel atualiza</h3>
              <p>Um relato de “demorei 2 horas” derruba o índice de tempo de viagem da linha na mesma hora.</p>
            </div>
            <div>
              <span className="num">03</span>
              <h3>Gestão decide</h3>
              <p>Previsão de chuva para amanhã? O painel sugere novo intervalo e quantos ônibus a mais por período.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={s.secHead}>
          <p className="eyebrow">Fontes de dados</p>
          <h2 className={s.h2}>Começa com o passageiro. Cresce com a cidade.</h2>
        </div>
        <div className={s.sources}>
          {[
            ["Pesquisa por QR Code", "ativo", "Tempo de viagem, espera, lotação, integração, satisfação, ocorrências."],
            ["Registro da operação", "ativo", "Ocorrências e contagem de fluxo feitas pela equipe do terminal."],
            ["Previsão do tempo", "ativo", "Probabilidade de chuva por período, base da previsão do dia seguinte."],
            ["MOBNIT", "pendente", "Itinerários e quadros horários (GTFS) para comparar programado e realizado."],
            ["NitTrans", "pendente", "Contagens volumétricas e estudos de tráfego do entorno."],
            ["Gêmeo Digital", "pendente", "Camadas territoriais para leitura espacial dos fluxos."],
            ["Bilhetagem e sensores", "pendente", "Validações por linha e contagem automática nas entradas."],
          ].map(([n, e, d]) => (
            <div key={n} className={s.source}>
              <div className={s.sourceH}><span className={`dot ${e === "ativo" ? "ok" : "pendente"}`} /> <h3>{n}</h3></div>
              <p>{d}</p>
              <span className="eyebrow">{e === "ativo" ? "Integrado" : "Aguardando convênio"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.band}>
        <div className={`wrap ${s.two}`}>
          <div>
            <p className="eyebrow">A pesquisa</p>
            <h2 className={s.h2}>Ciência de Dados e Indicadores Operacionais.</h2>
            <p className={s.authors}>
              Roberta Gaze, Maicon José de Paula Coelho de Souza, Leonardo da Silva Ribeiro, Glaydston Mattos Ribeiro
              (PET/COPPE/UFRJ) e Cintia Machado de Oliveira (CEFET/RJ). 23º RDT.
            </p>
          </div>
          <div className="scroll-x">
            <table>
              <thead><tr><th>Etapa</th><th>Período</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  ["Revisão bibliográfica e referencial teórico", "fev.–abr. 2026", "Concluída"],
                  ["Problema de pesquisa e objetivos", "mai. 2026", "Concluída"],
                  ["Arquitetura técnica e KPIs; submissão ao 23º RDT", "jun.–set. 2026", "Concluída"],
                  ["Dados institucionais e entrevistas com gestores", "out. 2026–fev. 2027", "Em curso"],
                  ["Protótipo do painel e testes de usabilidade", "mar.–jul. 2027", "Antecipado"],
                  ["Análise dos resultados e redação final", "ago.–out. 2027", "Planejada"],
                ].map(([e, p, st]) => (
                  <tr key={e}><td>{e}</td><td className="num">{p}</td><td><span className="tag">{st}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className={`wrap ${s.foot}`}>
        <Logo size={18} />
        <span>Protótipo acadêmico. Dados de demonstração identificados como simulados.</span>
      </footer>
    </main>
  );
}
