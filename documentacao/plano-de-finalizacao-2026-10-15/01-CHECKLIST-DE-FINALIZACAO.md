# Checklist de finalização do Planner Comercial

Revisão de 15/10/2026. Pasta do código atual: `C:/Avanade-main`. Publicação suspensa enquanto esta revisão é consolidada.

## Resultado da análise

O projeto possui núcleo demonstrativo persistente, web integrado e cliente Android implementado. Ainda não está integralmente concluído. Existem funcionalidades ausentes, funcionalidades implementadas sem homologação completa e documentos com informações de épocas diferentes. Não confundir essas três situações.

Foram inventariados 238 arquivos de código/configuração/documentação, excluídos dependências, builds, banco local e segredos. As três listas principais somam **516 critérios: 297 FE, 152 BE e 67 BD**. Foram extraídas também **565 marcações de checklist** em todas as pastas; há repetições e listas históricas, portanto esse número não representa funcionalidades únicas.

A matriz CSV preserva todos os IDs e redações originais. Sua coluna de estado é histórica, não uma nova aprovação. Esta revisão confrontou os fluxos centrais e as divergências conhecidas com o código; não certifica semanticamente cada linha dos 238 arquivos nem encerra individualmente os 516 critérios. Os testes anteriores são evidência histórica. Nenhuma suíte foi reexecutada nesta etapa de planejamento.

Referências: documentação V2 e entrega parcial fornecidas, fontes extraídas da revisão documental de 14/10, decisão do grupo sobre tendências/crédito/cancelamento, checklists do repositório, código atual e relatórios de validação. Não houve nova comparação visual completa com o Figma nesta etapa. V1 é histórico; diferenças de V1 não entram automaticamente no escopo atual.

## Regras de encerramento

- [ ] FIN-001 — Cada tarefa abaixo precisa de evidência de código, teste ou aceite. Registrar versão, ambiente e resultado; marcar somente após verificar.
- [ ] FIN-002 — Revisar individualmente os 516 critérios da matriz, substituir estados históricos por estado atual e vincular cada pendência à tarefa correspondente. Preservar IDs; não converter ausência de teste em ausência de implementação.
- [ ] FIN-003 — Distinguir: implementado e testado; implementado sem homologação; parcial; ausente; condicional; fora do MVP. Uma tarefa condicional não vira requisito obrigatório apenas por aparecer numa lista.
- [ ] FIN-004 — Consolidar rastreabilidade V2 → requisito → tela/rota → serviço → teste. Registrar divergências aprovadas, especialmente representação monetária, sessão e modelo de loja.

## 1. Cadastro, loja e permissões — primeira entrega funcional

**Constatação:** `AuthController.java` oferece login/logout. `TelaEstadosAcesso.tsx` é explicitamente uma prévia sem criação de conta; `TelaConfiguracoes.tsx` apenas exibe dados. Não existe cadastro completo conectado. Referências: FE-042, FE-052, BE-027 a BE-040, V2 §5.1.

- [ ] FIN-005 — Definir contrato mínimo de criação de comerciante: dados da pessoa responsável, estabelecimento, e-mail e senha; distinguir nova loja de usuário vinculado a loja existente. Não permitir escolher arbitrariamente papel ou loja alheia.
- [ ] FIN-006 — Implementar criação atômica da loja e primeiro responsável, validações de campos e duplicidade, hash de senha e tratamento seguro de erro. Evitar loja órfã se houver falha.
- [ ] FIN-007 — Criar tela de cadastro real, confirmação, estados de envio e retorno ao login; remover a dependência de contas seed para iniciar uma loja vazia.
- [ ] FIN-008 — Implementar consulta e atualização autorizada dos dados básicos do estabelecimento; limitar campos alteráveis e preservar histórico das operações.
- [ ] FIN-009 — Testar cadastro → login → loja vazia → primeira venda → despesa → caixa; testar e-mail repetido, validação, concorrência e isolamento entre duas lojas.
- [ ] FIN-010 — Classificar recuperação de senha, convite, troca de senha e gestão de usuários do protótipo. Se incluídos, entregar contrato e fluxo completo; se não incluídos, registrar o limite e não apresentar botões como funcionais. Envio de e-mail depende de infraestrutura própria.

## 2. Venda, split e regras — fechar diferenças de comportamento

**Já existe:** pagamento e split separados, regra histórica, parcelas, idempotência e retomada parcial. `SaleService` usa `MockAdapters` concreto; ausência de regra grava `failure_code` e retorna venda sem operação. `TaxEngine.rule` filtra apenas `valid_from`; não há término de vigência. V2 prevê falha rastreável e tratamento de regra vigente.

- [ ] FIN-011 — Resolver o estado de venda com pagamento confirmado e regra ausente: exibir motivo, manter rastreabilidade e definir recuperação autorizada sem gerar outra venda ou presumir tributo zero.
- [ ] FIN-012 — Implementar término de vigência e validação de intervalo por nova migration; preservar V1–V3 aplicadas e snapshots históricos. Cobrir fronteira temporal, ausência de regra e sobreposição/precedência explícita.
- [ ] FIN-013 — Separar interfaces de pagamento e roteamento dos mocks concretos conforme arquitetura documentada. Manter comportamento demonstrativo e testes existentes.
- [ ] FIN-014 — Formalizar estados e transições de pagamento, operação e parcela; verificar todos os estados nas duas interfaces, inclusive venda sem operação e pagamento pendente.
- [ ] FIN-015 — Reexecutar recuperação de resposta perdida e retomada concorrente nos clientes; comprovar no banco efeito único e preservação de parcelas confirmadas.
- [ ] FIN-016 — Revisar trilha de eventos de recusas e erros anteriores à criação do split. A tela deve explicar a tentativa sem chamar pagamento recusado de split concluído.
- [ ] FIN-017 — Conferir comprovante demonstrativo, impressão e exposição de destinos em web/Android. Não emitir aparência de documento fiscal ou recolhimento efetivo.

## 3. Simulação, despesas, caixa e relatórios

**Constatação:** simulação usa regra do banco e opção de taxa, mas não aceita percentual hipotético editável. Caixa realizado e comparação histórica estão implementados; projeção futura não. Exportação integrada cobre operações, não todos os relatórios do mapa visual.

- [ ] FIN-018 — Adicionar percentual hipotético à simulação com unidade explícita e validação no servidor. Separar parâmetro de simulação da regra aplicada a vendas. Manter zero gravações financeiras.
- [ ] FIN-019 — Testar exemplos 150/15/135 sem taxa e 150/15/3/132 com taxa, limites, arredondamento, valores inválidos e atualização do resultado ao editar entradas.
- [ ] FIN-020 — Definir e implementar projeção simples: período de base, horizonte, entradas/despesas previstas, saldo projetado, premissas e indicação de dados insuficientes. Cálculo determinístico no backend; proposta numérica deve ser explícita para ratificação da equipe.
- [ ] FIN-021 — Exibir realizado e projetado separadamente, com datas e origem. Não somar previsão ao saldo disponível nem confundir comparação histórica com previsão.
- [ ] FIN-022 — Implementar sugestão revisável de categoria de despesa com mock; usuário confirma antes da gravação. Tratar dúvida, ausência de sugestão e indisponibilidade.
- [ ] FIN-023 — Implementar alerta determinístico de pressão no caixa com limiar/premissa identificados e explicação simples. Definir atualização, resolução e ausência de dados; não inventar benchmark comercial.
- [ ] FIN-024 — Ratificar despesas pendentes, vencidas, recorrência, edição e exclusão mostradas no protótipo. O contrato atual trabalha com despesas pagas; não deduzir novos estados apenas pela data.
- [ ] FIN-025 — Conferir relatórios de vendas, despesas e tributos do mapa de navegação. Entregar os aprovados com filtro completo, autorização e identificação demonstrativa; distinguir do CSV de operações já existente.
- [ ] FIN-026 — Conferir reconciliação entre painel, caixa, histórico, detalhe e exportação, inclusive saldo negativo, mudança de dia/fuso, base vazia, filtros e paginação.

## 4. IA demonstrativa — parte do MVP, sem obrigação de serviço pago

**Constatação:** `MockAIProvider.explain` explica apenas um período de caixa. `AnalysisService` valida texto nulo/vazio/tamanho, registra interação e faz fallback; não estabelece deadline do provedor nem saída estruturada completa. A comparação é produzida por `AnalyticsService`, mas não é entrada da explicação atual. V2 §§17, 21–25 permite mock padrão e exige controles de saída e Prompt Ops.

- [ ] FIN-027 — Completar explicação de split, análise de caixa/projeção, comparação de tendências, sugestão de categoria e explicação de alertas conforme escopo. Dados sempre buscados no servidor por loja autorizada.
- [ ] FIN-028 — Definir saída estruturada com resumo, nível de atenção, recomendações, origem, período e limitações. Validar tipos e relação com fatos; nunca delegar cálculo ou movimentação ao texto gerado.
- [ ] FIN-029 — Implementar limite de tempo, falha controlada, dados insuficientes, resposta inválida e fallback. Manter consulta financeira disponível quando explicação falhar.
- [ ] FIN-030 — Versionar modelos de explicação/prompts com objetivo, entrada, saída, restrições e exemplos de avaliação. O identificador `cash-explanation-v1` no log sozinho não completa Prompt Ops.
- [ ] FIN-031 — Testar números divergentes, texto inseguro, base zero, valores ausentes, falha/timeout e isolamento entre lojas. Sugestão nunca grava categoria sem confirmação.
- [ ] FIN-032 — Documentar provedor externo como extensão opcional. Se adotado posteriormente, guardar segredo só no servidor e validar privacidade, custo e qualidade; não bloquear MVP por falta de chave externa.

## 5. Web: equivalência, responsividade e acessibilidade

**Evidência anterior:** cinco testes em 320/390/768/1024/1440 px passaram em oito telas, com valores longos, simulação e menu móvel; build passou. Isso não comprova todas as interações e estados, zoom, contraste, leitor de tela ou fidelidade integral ao Figma.

- [ ] FIN-033 — Comparar cada tela e estado com referência visual: login/cadastro, painel, vendas, detalhe, despesas, caixa, simulação, análise e configurações. Justificar divergências sem copiar números fictícios como regras reais.
- [ ] FIN-034 — Completar matriz responsiva por rota e estado: vazio, erro, carregando, sem permissão, resultado, paginação, filtro e diálogo; incluir telas pequenas em paisagem e altura reduzida.
- [ ] FIN-035 — Testar zoom 200%/400%, navegação por teclado, foco/restauração, mensagens anunciadas, nomes acessíveis, contraste e textos ampliados. Corrigir problemas encontrados e registrar o que depende de leitor real.
- [ ] FIN-036 — Avaliar tabelas e IDs longos, datas, saldos negativos e valores-limite sem esconder informação; rolagem da tabela não deve arrastar a página inteira.
- [ ] FIN-037 — Garantir que demo e API sejam distinguidas e que recursos apresentados como disponíveis funcionem no modo correspondente. Revisar textos internos antigos sobre Android e integração.
- [ ] FIN-038 — Medir carregamento e resposta em dispositivo mais lento; não tratar tamanho do build como teste de desempenho do usuário.

## 6. Android: integração existe; homologação ainda não

**Constatação:** `TelaServidorActivity`, `ContratoBackendPos` e transporte HTTPS já existem. Manifest impede tráfego HTTP. A tela usa coluna rolável e medidas de padding em pixels; isso merece revisão entre densidades, não apenas larguras. Testes JVM e APK não provam uso em maquineta.

- [ ] FIN-039 — Revisar layout Android usando unidades adequadas, largura em tablet, fontes ampliadas, teclado, barras do sistema e orientação. Exercitar venda, revisão, histórico, detalhe, erros e recuperação.
- [ ] FIN-040 — Separar responsabilidades da Activity sem perder estado da intenção, sessão e recuperação. Testar recriação, retorno do segundo plano e processo encerrado.
- [ ] FIN-041 — Preparar HTTPS válido de homologação e configurar URL no cliente; não desativar segurança global para contornar a falta de ambiente.
- [ ] FIN-042 — Executar fluxo integrado em emulador/aparelho: login, venda, falha parcial, retomada, perda de resposta, expiração e troca de conta; conferir persistência e isolamento no banco.
- [ ] FIN-043 — Validar TalkBack, foco, toque e teclado em dispositivo. Definir aparelho de apresentação; integração SDK de maquineta e impressão física não são presumidas pelo APK.

## 7. Banco, segurança e infraestrutura

**Já existe:** PostgreSQL, migrations, constraints, sessão revogável, idempotência e testes de concorrência. Há teste de upgrade V1→V3; backup histórico de 12 tabelas não comprova restore atual das 14. Compose e CI existem, mas execução integral remota não está comprovada.

- [ ] FIN-044 — Conferir por critério constraints, índices, FKs de loja, imutabilidade, conservação de parcelas e unicidade de efeitos; vincular BD-001 a BD-067 aos arquivos e testes atuais.
- [ ] FIN-045 — Repetir backup/restore atual em banco descartável, comparando conteúdo e relações das 14 tabelas, sessões/eventos/intenção; definir acesso, retenção e responsável operacional.
- [ ] FIN-046 — Revisar seeds e privilégios de bootstrap/migration/runtime. Cadastro novo não deve depender de credenciais ou registros demonstrativos preexistentes.
- [ ] FIN-047 — Testar criação e atualização de banco com dados após as próximas migrations. Nunca modificar migration já aplicada.
- [ ] FIN-048 — Revisar retenção de idempotência, janela de recuperação e comportamento após expiração; impedir duplicação por reaproveitamento de chave.
- [ ] FIN-049 — Verificar timeout de integrações, transações, contenção e retries limitados. Outbox/inbox ficam condicionados à introdução de fila/provedor externo; não são automaticamente falta do mock síncrono.
- [ ] FIN-050 — Executar Docker/Compose com banco vazio, reinício e volume persistente; conferir saúde, configuração e portas. Não expor o banco à internet.
- [ ] FIN-051 — Executar pipeline remoto web/backend/Android; adicionar ou revisar análise de dependências de servidor e aplicativo. Registrar avisos sem prometer segurança absoluta.
- [ ] FIN-052 — Executar carga sustentada com massa sintética, observar consultas, locks e pool; registrar limites práticos e comportamento sob falha.
- [ ] FIN-053 — Consolidar logs estruturados e correlação sem segredos; definir monitoramento, retenção, responsáveis e procedimento de recuperação.
- [ ] FIN-054 — Revalidar autenticação/autorização em todos os endpoints novos e existentes, incluindo exportações/agregados. CSRF de cookie e refresh não são automaticamente exigidos no contrato bearer atual sem cookies/refresh.

## 8. Organização, documentação e entrega

- [ ] FIN-055 — Aplicar plano de nomes do documento 02 em etapas, com mapa de antes/depois; atualizar imports, comandos, testes, CI e referências. Preservar nomes obrigatórios das ferramentas.
- [ ] FIN-056 — Dividir arquivos que misturam muitos assuntos em módulos de responsabilidade clara; priorizar Activity integrada, controllers/serviços financeiros e composição da aplicação web.
- [ ] FIN-057 — Criar entrada única para iniciantes: onde executar, onde ficam telas, API, banco, testes e pendências. Separar documentos atuais de relatórios históricos sem apagar autoria/evidências.
- [ ] FIN-058 — Corrigir contradições nos checklists/README: Android implementado versus não homologado; tendências existentes versus projeção ausente; IA externa opcional; cadastro incompleto; exportação disponível apenas no escopo entregue.
- [ ] FIN-059 — Tornar testes reproduzíveis a partir de clone limpo, com preparação de banco e segredo de teste por configuração. Não publicar arquivo privado `demo-password` para fazer teste passar.
- [ ] FIN-060 — Reexecutar build e testes relevantes após funcionalidades e renomeações; depois roteiro integrado completo web e Android. Não substituir aceite por contagem de testes.
- [ ] FIN-061 — Comparar a cópia atual com o remoto antes do commit; preservar alterações do colega, excluir banco local/segredos/fontes privadas e publicar apenas após esta etapa autorizada de finalização.
- [ ] FIN-062 — Atualizar relatório de entrega com implementado/testado/pendente, versão e ambiente; completar devolutiva e responsáveis. Não afirmar aceite integral dos 516 critérios sem revisão individual.

## Ordem de execução recomendada

1. Cadastro/loja e fluxo de primeira utilização (FIN-005 a 010).
2. Regras, falhas e simulação (FIN-011 a 019).
3. Projeção, sugestões, alertas e explicações (FIN-020 a 032).
4. Equivalência de telas, acessibilidade e Android (FIN-033 a 043).
5. Banco/infraestrutura e validação conjunta (FIN-044 a 054).
6. Organização gradual, documentação coerente e publicação (FIN-055 a 062). A organização pode acompanhar cada módulo, evitando renomeação geral antes de testes.

Nenhum prazo ou integrante foi atribuído sem acordo. HTTPS, aparelho e decisões operacionais dependem da equipe; implementação e testes locais podem avançar antes disso.

## Fora do MVP e diferenças aceitáveis

Crédito simulado e cancelamento permanecem evolução futura por decisão do grupo. Não habilitar pagamento/recolhimento real, emissão fiscal, treinamento de modelo ou SDK bancário. PWA não é obrigação herdada do exemplo de outro projeto. Centavos inteiros em vez de decimal JSON e bearer opaco em vez de JWT são escolhas documentadas, não erros automáticos. Um campo do protótipo exige conciliação de escopo, não implementação financeira inventada.

Design/protótipo e pesquisa: Thayná Batista da Silva. Requisitos: Thayná Batista da Silva e Kleysson Teixeira, conforme fontes fornecidas.
