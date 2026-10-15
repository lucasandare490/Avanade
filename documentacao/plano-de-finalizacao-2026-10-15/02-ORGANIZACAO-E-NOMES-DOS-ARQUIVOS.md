# Como encontrar cada parte e melhorar os nomes

Plano de 15/10/2026. **Nenhuma pasta de código foi renomeada nesta revisão.** Os caminhos atuais continuam válidos. Aplicar em pequenos lotes, com testes e atualização de referências.

## Comece aqui: estrutura atual explicada

| Pasta/arquivo atual | Para que serve | Onde procurar primeiro |
|---|---|---|
| frontend | Site aberto no navegador | src/telas para telas; src/estilos.css para visual |
| frontend/src/componentes | Peças reutilizadas nas telas | Botões, cartões, tabelas, diálogos |
| frontend/src/servicos | Comunicação com servidor e demonstração | integracaoConfigurada.ts, adapterApi.ts, transporteApi.ts |
| frontend/src/Aplicacao.tsx | Escolha de páginas, sessão e composição do site | Navegação e troca entre demo/API |
| frontend/src/tipos.ts | Formato dos dados usados no site | Operação, venda e interfaces de serviços |
| frontend/e2e | Testes do site no navegador | integracao.spec.ts e responsividade.spec.ts |
| backend | Servidor: regras, segurança e acesso ao banco | src/main/java/br/com/avanade/split |
| backend/.../auth | Login e contexto do usuário | AuthController.java, Actor.java |
| backend/.../core | Venda, pagamento, parcelas e histórico | SaleService.java, TaxEngine.java, Ledger.java |
| backend/.../finance | Despesas, caixa, comparação e explicações | FinanceService.java, AnalyticsService.java, AnalysisService.java |
| backend/.../config | Configurações de segurança e inicialização | SecurityConfig.java, DemoSeed.java |
| backend/.../shared | Erros, idempotência e períodos | ApiErrors.java, Idempotency.java, Period.java |
| backend/src/main/resources/db/migration | Evolução da estrutura do banco | V1, V2 e V3; próximas mudanças exigem novas versões |
| backend/src/test | Testes do servidor e banco | Classes de integração, concorrência e upgrade |
| android-pos | Aplicativo nativo da venda | app/src/main/java/br/com/planner/pos |
| android-pos/.../TelaPrincipalActivity.kt | Entrada demonstrativa do aplicativo | Fluxo local |
| android-pos/.../TelaServidorActivity.kt | Fluxo conectado ao servidor | Login, venda, histórico, detalhe e recuperação |
| android-pos/.../ContratoBackendPos.kt | Tradução e validação dos dados recebidos | Compatibilidade do aplicativo com a API |
| scripts | Comandos para iniciar o projeto | iniciar-backend-local.ps1 e dev.sh |
| entrega-para-backend | Especificação original de entrega | Critérios BE/BD, contratos e devolutiva |
| documentacao/revisao-2026-10-14 | Relatórios históricos de revisão e incrementos | Ler datas; não usar um relatório antigo como status atual |
| .github/workflows | Verificações executadas pelo GitHub | validacao.yml |

`...` nas linhas acima representa o prefixo já indicado, não uma pasta literal.

## Nomes propostos para as pastas principais

| Atual | Proposta | Dependências que precisam mudar junto |
|---|---|---|
| frontend | painel-web | scripts npm da raiz, CI, caminhos de testes, guias e scripts de execução |
| backend | servidor-api | iniciador PowerShell, CI, Docker, caminhos de teste e instruções |
| android-pos | aplicativo-android-pos | CI, guias, scripts Gradle e localização de SDK apenas no ambiente local |
| entrega-para-backend | requisitos-backend-e-banco | Links e referências; manter IDs BE/BD |
| documentacao | documentacao | Manter; separar guias atuais, requisitos e histórico internamente |
| scripts | comandos-do-projeto | Atualizar npm/scripts/CI; nomes de comandos devem descrever sua ação |

Não basta mover diretórios. A renomeação só termina quando os comandos funcionarem a partir de uma cópia limpa, sem depender de caminhos absolutos do computador de Lucas.

## Arquivos que mais precisam de clareza

| Atual | Proposta | Motivo |
|---|---|---|
| frontend/src/servicos/integracaoConfigurada.ts | contratoBackendPlanner.ts | Explicita o mapeamento do contrato, não apenas configuração |
| frontend/src/servicos/adapterApi.ts | adaptarEValidarRespostasApi.ts | Explicita tradução e validação |
| frontend/src/telas/TelaResumoIntegrado.tsx | TelaResumoFinanceiroApi.tsx | Evita confusão com resumo de qualquer módulo |
| frontend/src/telas/TelaOperacoesRemotas.tsx | TelaOperacoesApi.tsx | Nome consistente com demais telas conectadas |
| frontend/src/telas/TelaEstadosAcesso.tsx | TelaPreviaAcessoDemonstrativo.tsx | Evita que a prévia seja confundida com cadastro funcional |
| frontend/src/telas/TelaVendaDemonstrativa.tsx | TelaRegistroVenda.tsx | A tela também é usada no fluxo com servidor; o pagamento continua simulado |
| backend/.../core/Views.java | ConsultaDetalhesOperacoes.java | Evita confundir projeção de resposta com tela web; confirmar todas as responsabilidades antes de dividir |
| backend/.../core/SaleService.java | ServicoRegistroVenda.java | Nome descritivo para equipe; migrar imports e testes juntos |
| backend/.../core/TaxEngine.java | CalculadoraSplitDemonstrativo.java | Deixar explícito que não é apuração fiscal oficial |
| backend/.../finance/AnalyticsService.java | ServicoIndicadoresETendencias.java | Distingue cálculo histórico de explicação textual |
| backend/.../finance/AnalysisService.java | ServicoExplicacaoFinanceira.java | Distingue interpretação de cálculo |
| backend/.../finance/FinanceService.java | Separar ServicoDespesas e ServicoFluxoCaixa | Clareza por responsabilidade; divisão exige refatoração e testes |
| android-pos/.../TelaServidorActivity.kt | TelaPosIntegradoActivity.kt, depois componentes por fluxo | Nome mais claro e menor concentração de responsabilidades |

As propostas ainda não são nomes aplicados. Evitar renomear cada variável indiscriminadamente ou traduzir bibliotecas. Manter uma convenção consistente; não adicionar prefixo “arquivo” a tudo. Classes Java públicas devem ter o mesmo nome do arquivo. Atualizar Manifest ao renomear Activities.

## Nomes técnicos que devem ser preservados

`package.json`, `package-lock.json`, `pom.xml`, `mvnw`, `mvnw.cmd`, `build.gradle.kts`, `settings.gradle.kts`, `gradlew`, `gradlew.bat`, `AndroidManifest.xml`, `.gitignore`, `.gitattributes`, `Dockerfile`, `README.md`, `.env.example`, diretórios `src/main` e `src/test`.

Preservar migrations já aplicadas e identificadores públicos como rotas HTTP, campos JSON e applicationId Android durante reorganização. Uma mudança de nome interna não deve quebrar consumidores ou apagar o banco. Não versionar `.local`, senha demo, node_modules, caches ou dados pessoais para tornar a estrutura “completa”.

## Checklist da reorganização

- [ ] ORG-01 — Criar mapa de navegação da documentação com “executar”, “entender”, “desenvolver” e “ver pendências”.
- [ ] ORG-02 — Separar relatórios datados do estado atual; uma página atual deve apontar para evidências históricas sem contradições.
- [ ] ORG-03 — Renomear pastas principais uma de cada vez; atualizar comandos e CI no mesmo lote.
- [ ] ORG-04 — Aplicar nomes claros em telas e serviços; manter inventário antes/depois para a equipe.
- [ ] ORG-05 — Dividir arquivos com múltiplas responsabilidades somente depois de fixar testes dos comportamentos existentes.
- [ ] ORG-06 — Verificar imports, links locais, caminhos em scripts, Android Manifest, build e testes após cada lote.
- [ ] ORG-07 — Validar instalação e execução em cópia limpa; nenhum caminho obrigatório pode depender de C:/avanade/ferramentas.
- [ ] ORG-08 — Atualizar orientação para iniciantes com exemplos reais de “onde alterar uma tela”, “onde mudar regra” e “onde testar”.

Essas tarefas detalham FIN-055 a FIN-059, não são funcionalidades adicionais do produto.
