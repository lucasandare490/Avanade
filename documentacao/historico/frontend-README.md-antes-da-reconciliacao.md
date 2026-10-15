> **Atualização vigente - 15/10/2026:** [funcionalidades e resultados](../documentacao/plano-de-finalizacao-2026-10-15/06-RESULTADOS-DA-VALIDACAO.md) e [mapa dos arquivos](../ONDE-ENCONTRAR-CADA-PARTE.md). Cadastro, projeção manual, relatórios e explicações de tendências/split foram acrescentados. As seções datadas abaixo registram entregas anteriores; não use suas pendências antigas como estado atual.

> **Estado atual:** consulte o [incremento de integração e validação](../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

> **Integração web — 14/10/2026:** modo API ativo por padrão, com backend Spring/PostgreSQL. Execute `../scripts/dev.sh` a partir desta pasta ou `./scripts/dev.sh` na raiz. [Guia atual de integração](documentacao/INTEGRACAO-BACKEND.md).

> **Atualização de implementação:** comparação de tendências demonstrativa e apresentação de comparações remotas implementadas. Tendências/projeções e IA externa continuam pendentes; consultas e explicação mock já usam o backend. Esta atualização substitui os trechos anteriores sobre ausência da interface de comparação. Veja [implementação de tendências](documentacao/TENDENCIAS-IMPLEMENTADAS.md).

# Planner Comercial — frontend web

React 19, TypeScript e Vite; CSS próprio, ícones Lucide e fontes locais DM Sans/Manrope. Revisão de 10/10/2026 com build e testes: [evidências](documentacao/RELATORIO-VALIDACAO-ATUAL.md). Referência de design e pesquisa: Thayná Batista da Silva; requisitos: Thayná e Kleysson.

## Executar

Use Node 22.12 ou superior da série 22 e npm. Abra o terminal nesta pasta, não na raiz da entrega.

```powershell
npm ci
npm run dev
npm run build
npm test
npm run preview
```

Para a porta usada na demonstração: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175`. Abra a URL exibida pelo terminal. A versão compilada fica em dist. Não abra index.html diretamente pelo sistema de arquivos; use um servidor HTTP.

## Uso demonstrativo (VITE_MODO_DADOS=demo)

Escolha o perfil na entrada demonstrativa. Os perfis gestor, financeiro e operador ilustram uma política de acesso; permissões definitivas precisam ser ratificadas. Quando usar o formulário demonstrativo: gestor@exemplo.invalid, financeiro@exemplo.invalid ou operador@exemplo.invalid, senha demo. Não utilize senhas reais.

Rotas no fragmento # permitem atualizar uma tela sem exigir reescrita no servidor estático. A sessão demonstrativa expira após 30 minutos. Sair limpa dados da sessão; recarregar reinicia a massa de demonstração. Não existe armazenamento financeiro definitivo no navegador.

| Tela | Como funciona |
|---|---|
| Dashboard | Período, cartões, composição e gráfico/tabela da mesma massa de operações |
| Operações | Busca, status, datas, paginação, detalhe por ID, parcelas, eventos e retomada elegível |
| Nova venda | Valor, revisão e cenários simulados; proteção contra clique duplo; mesma tentativa após perda de resposta |
| Despesas | Validação, cadastro de despesa paga e atualização da consulta financeira |
| Fluxo de caixa | Saldo inicial, entradas líquidas, despesas pagas e saldo final; ausência de previsão sem regra aprovada |
| Simulação | Comparação com/sem taxa, sem criar venda ou movimentar caixa |
| Explicações | Texto demonstrativo; erro/ausência não altera valores financeiros |
| Configurações e ajuda | Informações do ambiente, limites e proposta de acesso; sem persistência falsa |

Tributo de 10% e taxa de 2% são exclusivamente fictícios. A operação de R$150 resulta em R$15 de tributo, R$3 de taxa e R$132 líquidos no cenário com taxa. Sem taxa, R$135 líquidos. Nenhuma transferência bancária ou arrecadação acontece.

## Organização do código

| Local | Responsabilidade |
|---|---|
| src/Aplicacao.tsx | Sessão, rotas, perfil, composição de dependências e logout |
| src/telas | Telas por finalidade; nomes TelaOperacoes, TelaDespesas, TelaFluxoCaixa etc. |
| src/componentes | Botão, indicador, tabela, estrutura, estados e diálogo reutilizáveis |
| src/servicos/servicoDemonstrativo.ts | Cenários em memória e recuperação simulada |
| src/servicos/adapterApi.ts | Tradução e validação das respostas externas para os tipos internos |
| src/servicos/transporteApi.ts | HTTP, prazo, cancelamento, erros e cabeçalhos centralizados |
| src/servicos/integracaoConfigurada.ts | Contrato /api/v1: autenticação, DTOs, consultas e intenções |
| src/servicos/contratosConsultas.ts | Consultas por capacidade e tipos paginados |
| src/testes e demais *.test.* | Testes de fluxos, serviços, valores e acessibilidade estrutural |
| documentacao | Checklist, guias, evidências e limites da entrega |

## Integração com backend

O modo padrão é `api`, usando a mesma origem do frontend e o proxy `/api` para `http://127.0.0.1:8080`. A configuração está em `.env.example`; `demo` é uma opção explícita para o cenário em memória.

Login, sessão bearer, logout, vendas, despesas, operações, caixa, simulação e explicação mock estão conectados. As respostas são validadas e nunca substituídas por dados fictícios após falha. Categorias vêm da API; totais financeiros vêm dos agregados do servidor. Intenções sem confirmação são preservadas por aba e conta para recuperação idempotente.

Veja [execução, recuperação e testes E2E](documentacao/INTEGRACAO-BACKEND.md).

## Qualidade e limites

Os testes unitários usam fixtures; a suíte `npm run test:e2e` executa os fluxos web contra a API e o PostgreSQL locais, incluindo autorização e recuperação após perda de resposta. Acessibilidade automatizada não substitui leitor de tela real. A publicação e a comparação integral com o Figma ainda exigem os ambientes/aceites indicados em [pendências](documentacao/PENDENCIAS-OBJETIVAS.md). O aplicativo Android está em ../android-pos e tem validação separada.

## Atualização de escopo do MVP

Análise de tendências por IA faz parte do MVP, mas não está concluída pelo resumo textual atual. Crédito simulado e cancelamento de operações/compra ficam na evolução futura. Veja a [decisão e critérios de aceite](documentacao/DECISAO-ESCOPO-MVP.md).
