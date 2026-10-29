# guatá.mobi

Painel inteligente de indicadores operacionais para o Terminal Rodoviário Presidente João Goulart (Niterói, RJ).
Protótipo da pesquisa *Ciência de Dados e Indicadores Operacionais* (PET/COPPE/UFRJ · CEFET/RJ, 23º RDT).

## Áreas

| Rota | Quem acessa | O que faz |
|---|---|---|
| `/` | público | Landing page do estudo |
| `/r` | passageiro (QR Code) | Pesquisa anônima de 9 perguntas; `?p=A` filtra a plataforma |
| `/telao` | público | Tela do terminal: tempo estimado por linha + QR Code |
| `/operador` | operador+ | Alertas, ocorrências, contagem manual de fluxo |
| `/painel` | gestor+ | 6 dimensões ao vivo, índice de tempo de viagem, previsão de amanhã e recomendação de intervalo e frota |
| `/admin` | admin do terminal+ | QR Codes por plataforma, usuários e cargos, linhas |
| `/central` | admin central | Saúde do sistema, integrações, dados simulados |

`/entrar` escolhe o perfil (sessão de demonstração por cookie).

## Dados

- O protótipo guarda tudo em memória e inicia com 28 dias de respostas **simuladas** (marcadas `simulado: true`). A Central remove os simulados.
- A previsão de chuva vem da Open-Meteo, sem chave de API.
- `POST /api/contagens` com o cabeçalho `x-guata-chave: $GUATA_CHAVE_INTEGRACAO` recebe fluxo de sensores, câmera ou bilhetagem.
- As linhas são exemplos e devem ser trocadas pelo GTFS do MOBNIT.

## Rodar

```bash
npm install
npm run dev
```

## Próximos passos

- Banco persistente e login real com Supabase (Postgres + Auth + Realtime).
- Importador GTFS (MOBNIT), camadas ArcGIS (SIGeo / Gêmeo Digital) e contagens NitTrans.
