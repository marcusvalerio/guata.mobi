/**
 * Nota metodológica de cada indicador, escrita a partir de Gaze et al. (2026),
 * Tabela 1 e arquitetura em cinco camadas. Regra editorial: nenhum travessão
 * nos textos exibidos.
 */

export interface Nota {
  dimensao: string;
  pergunta: string;
  coleta: string[];
  calculo: string[];
  semaforo: string;
  limitacoes: string[];
  camadas: string;
  referencias: string[];
}

const SORIANO = "SORIANO-GONZALEZ, R. et al. Analyzing key performance indicators for mobility logistics in smart and sustainable cities: a case study centered on Barcelona. Logistics, v. 7, n. 4, 2023.";

const ARTIGO = "GAZE, R. et al. Ciência de Dados e Indicadores Operacionais: painel inteligente para o Terminal Rodoviário de Niterói (RJ). 23ª RDT, 2026. Tabela 1.";

export const NOTAS: Record<string, Nota> = {
  Demanda: {
    dimensao: "Demanda",
    pergunta: "Quantas pessoas embarcam e desembarcam no terminal por hora, e quando acontecem os picos?",
    coleta: [
      "Contagem de fluxo registrada pela equipe de operação: uma pessoa conta quem passa pela entrada principal durante 15 minutos e o sistema projeta para uma hora.",
      "A mesma entrada aceita contagens automáticas de sensores, câmeras com contagem anônima ou bilhetagem, quando houver convênio. Cada registro guarda a fonte.",
    ],
    calculo: [
      "Fluxo da hora = passageiros contados × (60 ÷ minutos da janela de contagem).",
      "Valor exibido: média das contagens da última hora. A curva mostra as últimas 24 horas, uma posição por hora.",
      "Pico: hora com maior fluxo nas últimas 24 horas.",
    ],
    semaforo: "Normal até 3.200 pass/h, crítico a partir de 4.600 pass/h. Limiares provisórios, a calibrar com a capacidade real das plataformas informada pela concessionária.",
    limitacoes: [
      "Contagem manual é amostral: depende de turnos de contagem e cobre só a entrada principal.",
      "Sem bilhetagem, não há separação por linha nem por sentido.",
    ],
    camadas: "Camada (i) coleta: contagem de passageiros. Camada (iii) processamento: projeção horária e detecção de pico.",
    referencias: [ARTIGO, SORIANO, "CHARALAMPIDOU, G.; KOPSACHEILIS, A.; POLITIS, I. Assessing the operation of a multimodal hub. Infrastructures, 2024."],
  },
  Operação: {
    dimensao: "Operação",
    pergunta: "Os ônibus estão saindo no horário e com regularidade?",
    coleta: [
      "Pesquisa por QR Code, pergunta 4: “O ônibus saiu no horário?” (sim ou não).",
      "Pesquisa por QR Code, pergunta 3: tempo de espera na plataforma, em faixas de 0 a 45 minutos.",
    ],
    calculo: [
      "Índice de pontualidade = respostas “sim” ÷ total de respostas das últimas 24 horas × 100.",
      "Regularidade: espera média informada pelos passageiros no mesmo período.",
    ],
    semaforo: "Normal a partir de 85%, crítico abaixo de 70%.",
    limitacoes: [
      "É pontualidade percebida pelo passageiro, não medida contra o quadro horário oficial.",
      "A comparação com o programado depende do GTFS do MOBNIT ou dos dados de GPS da frota.",
    ],
    camadas: "Camada (i) coleta: pesquisa de satisfação. Camada (iii): agregação por janela de 24 horas.",
    referencias: [ARTIGO, SORIANO, "FIORE, S. et al. An integrated big and fast data analytics platform for smart urban transportation management. IEEE Access, 2019."],
  },
  Infraestrutura: {
    dimensao: "Infraestrutura",
    pergunta: "Quão ocupadas estão as plataformas de embarque?",
    coleta: [
      "Pesquisa por QR Code, pergunta 6: lotação da plataforma em escala de 1 (vazia) a 5 (lotada).",
      "O QR Code de cada plataforma identifica onde a resposta foi dada.",
    ],
    calculo: [
      "Cada resposta é convertida em porcentagem: (nota menos 1) ÷ 4 × 100.",
      "Valor exibido: média das últimas 3 horas no terminal. O semáforo usa a plataforma mais cheia.",
    ],
    semaforo: "Normal até 55%, crítico a partir de 75% na plataforma mais cheia.",
    limitacoes: [
      "Mede a percepção de lotação, não a taxa física de ocupação das baias.",
      "A taxa física exige registro de chegada e saída dos veículos por baia.",
    ],
    camadas: "Camada (i) coleta: pesquisa de satisfação por plataforma. Camada (iv) visualização: mapa por plataforma.",
    referencias: [ARTIGO, "CHARALAMPIDOU, G.; KOPSACHEILIS, A.; POLITIS, I. Assessing the operation of a multimodal hub. Infrastructures, 2024."],
  },
  Acessibilidade: {
    dimensao: "Acessibilidade",
    pergunta: "Quanto tempo o passageiro leva para trocar de modal, das barcas ou das linhas municipais?",
    coleta: [
      "Pesquisa por QR Code, pergunta 5: se fez integração e com qual modal (barcas ou ônibus municipal), e quanto tempo levou.",
    ],
    calculo: [
      "Tempo médio de integração = média dos tempos informados nas últimas 24 horas, só entre quem fez integração.",
      "Valor separado para quem veio ou vai para as barcas.",
    ],
    semaforo: "Normal até 10 minutos, crítico a partir de 16 minutos.",
    limitacoes: [
      "Tempo informado pelo passageiro, sujeito a arredondamento.",
      "Não mede acessibilidade física (rampas, elevadores, piso tátil), que exige vistoria.",
    ],
    camadas: "Camada (i) coleta: pesquisa de satisfação. Camada (iii): agregação por modal.",
    referencias: [ARTIGO, "BRASIL. Lei nº 12.587, de 3 de janeiro de 2012. Política Nacional de Mobilidade Urbana."],
  },
  Satisfação: {
    dimensao: "Satisfação",
    pergunta: "Como o passageiro avalia a viagem e o que ele reclama?",
    coleta: [
      "Pesquisa por QR Code, pergunta 9: nota geral em escala Likert de 1 (muito ruim) a 5 (muito boa).",
      "Campo opcional de reclamação ou sugestão, com aviso para não escrever dados pessoais.",
    ],
    calculo: [
      "Escore médio = média das notas das últimas 24 horas.",
      "Volume de reclamações = respostas com texto no campo de reclamação no mesmo período.",
    ],
    semaforo: "Normal a partir de 3,8, crítico até 3,0.",
    limitacoes: [
      "Amostra por conveniência: responde quem escolhe escanear o QR Code.",
      "Notas extremas tendem a ser mais frequentes do que na população de usuários.",
    ],
    camadas: "Camada (i) coleta: pesquisa de satisfação (escore Likert). Camada (v) governança: anonimização conforme a LGPD.",
    referencias: [ARTIGO, SORIANO, "BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD)."],
  },
  Segurança: {
    dimensao: "Segurança",
    pergunta: "Onde e quando acontecem ocorrências no terminal?",
    coleta: [
      "Registro da equipe de operação: tipo (segurança, lotação, acessibilidade, manutenção), local e descrição.",
      "Pesquisa por QR Code, pergunta opcional: se o passageiro presenciou alguma ocorrência.",
    ],
    calculo: [
      "Número de ocorrências registradas pela operação nos últimos 7 dias, por local.",
      "Relatos de passageiros aparecem à parte, como sinal complementar.",
    ],
    semaforo: "Normal até 6 ocorrências na semana, crítico a partir de 14.",
    limitacoes: [
      "Depende da disciplina de registro da equipe.",
      "Não integra boletins policiais nem registros da guarda municipal.",
    ],
    camadas: "Camada (i) coleta: registros de ocorrências. Camada (iv): concentração por local no mapa.",
    referencias: [ARTIGO],
  },
};

export const NOTA_CONFIABILIDADE = {
  porque: [
    "Um painel ao vivo só apoia a decisão se o gestor souber quanto pode confiar no número que está vendo. A confiabilidade torna explícito o que está por trás de cada valor e evita que um indicador calculado com duas respostas tenha o mesmo peso visual de um calculado com duzentas.",
    "A proposta segue a camada (v) de governança da arquitetura descrita na pesquisa: qualidade da informação, atualização periódica e conformidade com a LGPD.",
  ],
  fatores: [
    { nome: "Origem (30%)", texto: "Só dados registrados por passageiros, pela operação ou por fontes oficiais contam como evidência. Qualquer registro de teste ou demonstração é excluído do cálculo." },
    { nome: "Volume (30%)", texto: "Quantidade de respostas reais nas últimas 24 horas em relação a uma meta de 120. A meta é provisória e corresponde a cerca de cinco respostas por hora; deve ser revista conforme o fluxo real do terminal e o erro amostral aceito pela pesquisa." },
    { nome: "Cobertura (25%)", texto: "Proporção das linhas oficiais com pelo menos 3 relatos reais em 24 horas. Um terminal bem medido em duas linhas e cego nas demais não deve aparecer como confiável." },
    { nome: "Frescor (15%)", texto: "Tempo desde o último relato real. Vale 100% até 15 minutos e cai pela metade a cada hora depois disso. Um painel ao vivo com dados de ontem não está ao vivo." },
  ],
  leitura: "Alta a partir de 75%, média de 45% a 74%, baixa abaixo de 45%. Os pesos privilegiam origem e volume porque são as duas condições sem as quais nenhum indicador tem significado estatístico; cobertura e frescor qualificam o resultado.",
  limitacoes: [
    "É um índice de qualidade da base, não um intervalo de confiança estatístico de cada indicador.",
    "Os pesos e a meta de volume são escolhas de projeto e devem ser validados com os gestores, como prevê a etapa de entrevistas do cronograma.",
  ],
};
