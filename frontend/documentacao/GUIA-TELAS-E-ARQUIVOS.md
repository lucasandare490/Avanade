# Guia de telas e arquivos

Use o README de cada cliente para instalação. As telas web são separadas por finalidade em src/telas; componentes compartilhados em src/componentes e comunicação em src/servicos.

| Experiência | Demonstração web | Integração preparada |
|---|---|---|
| Entrada | TelaLogin; TelaEstadosAcesso para prévia de cadastro | Autenticação injetada e estados de falha/expiração |
| Dashboard | TelaDashboard, período e operações consistentes | TelaResumoIntegrado, indicadores recebidos do servidor |
| Operações | TelaOperacoes, detalhe e filtros locais | TelaOperacoesRemotas, lista paginada e consulta por ID |
| Venda | TelaVendaDemonstrativa, tentativa preservada e cenários | Serviço injetado, resposta autoritativa e rótulos compatíveis |
| Despesas | TelaDespesas, cadastro pago e caixa | TelaDespesasIntegrada, categorias/lista remotas e envio protegido |
| Caixa | TelaFluxoCaixa, realizado e premissas demo | TelaResumoIntegrado, sem projeção inventada pelo cliente |
| Simulação | TelaSimulacao, sem mutação do caixa | TelaSimulacaoIntegrada, cancelamento/atualização de resultado |
| Explicação | TelaAnalise, texto determinístico | TelaAnaliseIntegrada, texto escapado e vinculado ao período |
| Configuração | Informações e capacidades disponíveis | Persistência depende de contrato aprovado |

Botao, Indicador, TabelaOperacoes e DialogoConfirmacao concentram padrões reutilizáveis. Aplicacao coordena sessão/rotas; não contém endpoints financeiros definidos arbitrariamente. Fontes são locais. Moeda é formatada para pt-BR a partir de centavos inteiros.

Android usa TelaPrincipalActivity para telas, EstadoTelaPos para estado, ClientePos para interface de dados, ClientePosDemonstrativo para cenários e ClientePosApi/ServicoPosIntegrado para adaptação futura. O histórico e o detalhe passam pela mesma interface assíncrona da venda. Veja ../../android-pos/README.md.

Evidências por ambiente: RELATORIO-VALIDACAO-ATUAL.md. Recursos que precisam de decisão/servidor/aparelho: PENDENCIAS-OBJETIVAS.md.
