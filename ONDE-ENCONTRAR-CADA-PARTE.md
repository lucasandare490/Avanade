# Onde encontrar cada parte

| Preciso mexer em… | Abra… |
|---|---|
| Entrada, cadastro e senha do formulário | frontend/src/telas/TelaLogin.tsx |
| Venda no site | frontend/src/telas/TelaRegistroVenda.tsx |
| Histórico e detalhe do split | frontend/src/telas/TelaOperacoesApi.tsx |
| Caixa e painel conectados | frontend/src/telas/TelaResumoFinanceiroApi.tsx |
| Relatórios e CSV | frontend/src/telas/TelaRelatoriosIntegrados.tsx |
| Explicações e tendências | frontend/src/telas/TelaAnaliseIntegrada.tsx |
| Comunicação do site com o backend | frontend/src/servicos/contratoBackendPlanner.ts |
| Validação de respostas da API | frontend/src/servicos/adaptarEValidarRespostasApi.ts |
| Regra de registro/recuperação da venda | backend/src/main/java/br/com/avanade/split/core/ServicoRegistroVenda.java |
| Cálculo de indicadores históricos | backend/src/main/java/br/com/avanade/split/finance/ServicoIndicadoresETendencias.java |
| Explicação do caixa | backend/src/main/java/br/com/avanade/split/finance/ServicoExplicacaoFinanceira.java |
| Estrutura do banco | backend/src/main/resources/db/migration |
| Aplicativo conectado ao servidor | android-pos/app/src/main/java/br/com/planner/pos/TelaPosIntegradoActivity.kt |
| Comandos para iniciar | scripts/iniciar-backend-local.ps1 e package.json da raiz |

As pastas técnicas frontend, backend e android-pos continuam identificando as três aplicações. Os módulos com nomes ambíguos foram renomeados; o mapa de antes/depois está em documentacao/plano-de-finalizacao-2026-10-15/04-MAPA-DE-NOMES-APLICADOS.md. Documentos antigos podem mencionar nomes históricos.
