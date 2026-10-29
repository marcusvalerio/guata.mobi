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
      "Cruza o traçado oficial de cada linha municipal (SIGeo) com os trechos lentos: uma linha é afetada quando passa a menos de cerca de 40 m de um trecho congestionado.",
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
  geral: {
    titulo: "Sobre este módulo",
    texto: [
      "Estes indicadores são complementares e não fazem parte das seis dimensões da pesquisa (Tabela 1). Não entram no cálculo dos indicadores acadêmicos, da confiabilidade nem da previsão.",
      "Servem para contextualizar a operação: quando o índice de tempo de viagem de uma linha piora, o gestor vê se há congestionamento no caminho.",
      "Limitação: o Waze mede quem usa o aplicativo, com mais cobertura em vias principais e horários de maior uso.",
    ],
  },
};
