# Mapa de nomes aplicados

Renomeações internas em 15/10/2026. Rotas públicas e migrations preservadas. Web, backend e Android foram compilados/testados após as renomeações; veja o relatório 06.

| Antes | Agora |
|---|---|
| frontend\src\servicos\adapterApi.ts | frontend\src\servicos\adaptarEValidarRespostasApi.ts |
| frontend\src\servicos\integracaoConfigurada.ts | frontend\src\servicos\contratoBackendPlanner.ts |
| frontend\src\telas\TelaEstadosAcesso.tsx | frontend\src\telas\TelaPreviaAcessoDemonstrativo.tsx |
| frontend\src\telas\TelaOperacoesRemotas.tsx | frontend\src\telas\TelaOperacoesApi.tsx |
| frontend\src\telas\TelaResumoIntegrado.tsx | frontend\src\telas\TelaResumoFinanceiroApi.tsx |
| frontend\src\telas\TelaVendaDemonstrativa.tsx | frontend\src\telas\TelaRegistroVenda.tsx |
| backend\src\main\java\br\com\avanade\split\core\SaleService.java | backend\src\main\java\br\com\avanade\split\core\ServicoRegistroVenda.java |
| backend\src\main\java\br\com\avanade\split\finance\AnalysisService.java | backend\src\main\java\br\com\avanade\split\finance\ServicoExplicacaoFinanceira.java |
| backend\src\main\java\br\com\avanade\split\finance\AnalyticsService.java | backend\src\main\java\br\com\avanade\split\finance\ServicoIndicadoresETendencias.java |
| android-pos\app\src\main\java\br\com\planner\pos\TelaServidorActivity.kt | android-pos\app\src\main\java\br\com\planner\pos\TelaPosIntegradoActivity.kt |
