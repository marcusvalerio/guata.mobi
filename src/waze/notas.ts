/** MÓDULO WAZE: notas dos indicadores complementares. Sem travessões. */
export const NOTAS_WAZE: Record<string, { titulo: string; texto: string[] }> = {
  lentidao: {
    titulo: "Lentidão no entorno",
    texto: [
      "Trechos de via com trânsito lento ou parado a até 1,5 km do terminal, informados pelos motoristas do Waze e publicados pela NitTrans no SIGeo.",
      "Atraso somado: tempo extra que o Waze estima para percorrer todos esses trechos, em relação ao trânsito livre.",
      "Velocidade média: média das velocidades dos trechos lentos, ponderada pelo comprimento de cada um.",
    ],
  },
  parados: {
    titulo: "Trechos parados",
    texto: [
      "Trechos com nível 4 ou 5 na escala do Waze (0 livre, 5 bloqueado).",
      "É o sinal mais direto de que ônibus saindo ou chegando ao terminal vão atrasar.",
    ],
  },
  linhas: {
    titulo: "Linhas afetadas",
    texto: [
      "Cruza o traçado oficial de cada linha municipal (MOBNIT) com os trechos lentos: uma linha é afetada quando passa a menos de cerca de 40 m de um trecho congestionado.",
      "O atraso por linha soma o atraso dos trechos que ela atravessa. É uma estimativa do impacto do trânsito, não o atraso medido do ônibus.",
    ],
  },
  alertas: {
    titulo: "Alertas",
    texto: [
      "Alertas ativos a até 1,5 km do terminal: acidentes, buracos, obras, alagamentos, veículos parados e trânsito intenso.",
      "Cada alerta vem com um índice de confiabilidade do próprio Waze, baseado na confirmação de outros usuários.",
    ],
  },
  previsao: {
    titulo: "Previsão de trânsito para amanhã",
    texto: [
      "A cada 10 minutos o PIRN grava o atraso de trânsito no traçado de cada linha (Waze sobre o traçado do MOBNIT) e se estava chovendo no terminal (Open-Meteo). Esse histórico é próprio: a prefeitura não publica o histórico do Waze.",
      "Para amanhã, cada período (madrugada, manhã, tarde, noite) usa a mediana das coletas do mesmo tipo de dia (útil ou fim de semana) e da mesma condição de chuva prevista. Com menos de 6 coletas nessa condição, usa todas as coletas do período.",
      "A mediana foi escolhida porque é robusta a dias atípicos, como acidentes ou eventos.",
      "A estimativa só aparece com pelo menos 6 coletas no período. Com poucos dias de histórico ela ainda é frágil; ganha precisão a cada semana.",
    ],
  },
  geral: {
    titulo: "Sobre este módulo",
    texto: [
      "Estes indicadores são complementares e não fazem parte das seis dimensões da pesquisa (Tabela 1). Não entram no cálculo dos indicadores acadêmicos, da confiabilidade nem da previsão.",
      "Servem para contextualizar a operação: quando o índice de tempo de viagem de uma linha piora, o gestor vê se há congestionamento no caminho.",
      "Limitação: o Waze mede quem usa o aplicativo, com mais cobertura em vias principais e horários de maior uso.",
    ],
  },
};
