# Estado verificado — 15/10/2026

## Funcionamento implementado

Cadastro de loja e gerente, edição do nome da loja, simulação com percentual hipotético, vigência final da regra, recuperação de venda paga sem regra, projeção manual, sugestão revisável de categoria, explicação de cada split, interpretação de tendências e relatórios de vendas/despesas/tributos. Dez módulos receberam nomes mais claros.

O caixa agora inclui semanas de segunda a domingo, recortadas ao período, inclusive semanas vazias. Cada abertura e saldo concilia com o total. A projeção é um cenário informado pelo usuário, não uma previsão estatística. Caixa e comparação para explicação são lidos no mesmo snapshot antes de chamar o provedor. Pagamento e interpretação permanecem demonstrativos, com persistência PostgreSQL real.

## Evidências

| Área | Resultado | Evidência |
|---|---|---|
| Web atual | 98 testes aprovados; build concluído | evidencias/web-caixa-semanal.log.txt; build-caixa-semanal.log.txt |
| Backend antes do caixa semanal | 54 testes aprovados no GitHub | evidencias/backend-github.json |
| Backend após caixa semanal | 35 testes selecionados aprovados, incluindo novo caso semanal | evidencias/backend-caixa-semanal.log.txt |
| Android | testes JVM/Robolectric, APK e lint aprovados; job remoto aprovado | evidencias/validacao-android.log.txt; CI abaixo |
| Navegador/API local | 13 cenários anteriores aprovados; novo cenário semanal aprovado | evidencias/validacao-navegador.log.txt; navegador-caixa-semanal.log.txt |
| Layout | nove telas em cinco larguras; tabela semanal em quatro larguras | frontend/e2e/responsividade.spec.ts; caixa-semanal.spec.ts |
| Acessibilidade automática | nove telas; contraste corrigido; tabela semanal aprovada | evidencias/reteste-contraste.log.txt; navegador-caixa-semanal.log.txt |
| Consultas simultâneas | 120 solicitações, oito simultâneas, sem falhas; p95 local 17,13 ms | evidencias/consultas-concorrentes.json |
| Docker/PostgreSQL | banco vazio, reinício e restauração de 15 tabelas com conteúdo idêntico | evidencias/docker-restauracao-github.json |

Os 35 testes selecionados incluem testes já presentes nos 54 anteriores: não somar as contagens como testes únicos. A verificação Docker foi feita no GitHub, não neste Windows. A primeira execução remota comparava apenas uma tabela por um problema no loop; a correção foi executada novamente e comprovou as 15 tabelas. A evidência citada é a execução corrigida.

## Revisão dos 516 critérios

A [matriz individual](05-REVISAO-DOS-516-CRITERIOS.csv) preserva 297 IDs de frontend, 152 de backend e 67 de banco. Cada linha contém situação, referência e limitação. Evidências compartilhadas não significam um teste isolado por requisito. Inspeção de código, execução automatizada e aceite humano são níveis distintos.

Revisão completa da lista não equivale a aceite completo do produto. Permanecem verificações manuais de Figma, zoom, leitor de tela/TalkBack e aparelho Android; exemplos contratuais de todos os estados; revisão integral dos documentos históricos; definições operacionais de retenção, monitoramento e hospedagem. A matriz identifica também itens condicionais a integrações futuras.

## Publicação conferida

Commits publicados: `36c84ef` e `9cc6d99`. [CI 38800015378](https://github.com/lucasandare490/Avanade/actions/runs/38800015378): web, backend, Android e Docker aprovados. Essa execução precede o caixa semanal. O commit `8c2c9eb` publicou caixa semanal, matriz e PDF; [CI 38807674173](https://github.com/lucasandare490/Avanade/actions/runs/38807674173) concluiu web, backend, Android e Docker com sucesso. O complemento de exemplos foi publicado em `535fa86`; sua execução deve ser consultada separadamente.

## Limites de entrega

Não há homologação de carga sustentada, banco em nuvem, Android por HTTPS em aparelho nem uso financeiro real. IA externa é opcional. Crédito, cancelamento e integração real com adquirente permanecem evolução futura. Responsáveis e prazos operacionais dependem da equipe; não foram presumidos.

## Complemento de exemplos de integração

Seis exemplos HTTP sintéticos foram gerados por teste aprovado em PostgreSQL descartável: sucesso, recusa, pendência, falha parcial, lista vazia e conflito. Consulte `backend/docs/examples/README.md`. O novo teste não altera regras de produção nem cria dados na base de demonstração local.

## Estados de interface e cadastro — continuação de 15/10

Os commits `535fa86` e `8e8374a` passaram nas quatro verificações remotas. [Execução 38808590422](https://github.com/lucasandare490/Avanade/actions/runs/38808590422).

Dois testes adicionais de navegador verificaram operações, despesas e caixa em 320 e 768 px, incluindo carregamento bloqueado, erro HTTP 503, tentativa posterior e recuperação. Operações/despesas usam lista vazia sintética; recuperação de caixa usa API local. Cada etapa recebeu verificação de transbordamento e axe. Não equivalem a teste de indisponibilidade real da infraestrutura nem a leitor de tela.

No cadastro, a divergência de senhas agora associa a mensagem à confirmação e deixa de marcar e-mail como inválido por esse motivo. Os dois testes específicos de cadastro e o build passaram. Evidências: `estados-consulta.log.txt`, `cadastro-acessivel.log.txt` e `build-acessibilidade.log.txt` nesta pasta de evidências. As suítes anteriores não foram repetidas localmente nesta correção pontual.

## Continuação de 16/10 — operação e segurança

- Backend com logs JSON ECS, correlação, rota normalizada, duração e resultado, sem registrar corpo/query/token; métricas Micrometer sem identificação financeira.
- Falhas transitórias do banco retornam 503 e orientam recuperação da intenção; falha de banco na autenticação não vira credencial inválida. Sem retry financeiro automático.
- 59 testes backend passaram após atualização de bibliotecas; depois, um teste adicional do diagnóstico somente leitura passou separadamente. Não somar repetições como testes novos.
- 168 dependências Java/Android consultadas no OSV. Correções reduziram alertas de oito bibliotecas para uma; dois avisos Spring WebMVC permanecem sobre XSLT/SSE não encontrados no código atual. [Análise e limites](07-AUDITORIA-DE-DEPENDENCIAS.md). Os passos OSV do CI são informativos e preservam alertas nos artefatos: pipeline verde não significa zero vulnerabilidades.
- Android: testes, APK e lint passaram após atualizar dependência transitiva de testes.
- Web: 100 testes passaram e build concluído. A consulta descartada pelo StrictMode não inicia requisição; resposta antiga continua sendo descartada e recarregar inicia nova consulta. Não há cache global de dados financeiros.
- Login/cadastro: três testes de navegador passaram em 320/768/1440 px, incluindo erro e ordem de foco. A análise axe foi restrita ao main da aplicação devido a iframe injetado pelo antivírus, sem desabilitar regras.

As verificações não cobrem TalkBack/aparelho físico, zoom nativo de todos os estados, comparação integral com Figma ou infraestrutura em nuvem. O seed inicial ainda contém contas/regras; os demais estados financeiros são cenários de teste e demonstração, não povoamento automático de qualquer base real.


## Cenário de apresentação — 16/10

O cenário persistente opcional está implementado em `ConfiguracaoCenarioCompleto`, acionado com `-PopularCenario` no launcher Windows. Duas lojas, três perfis por loja, pagamentos confirmado/recusado/pendente, split concluído/falha parcial e despesas em dois períodos. Repetição sem duplicação verificada. O horário e os resultados temporários da carga são isolados por thread e restaurados; fontes excluídas do JAR distribuído. Não executado na base pessoal do usuário durante esta revisão.

A execução final `mvnw.cmd -q verify` passou: **61 testes, zero falhas/erros**, PostgreSQL real descartável; pacote gerado. Evidência resumida: `evidencias/cenario-completo-validacao.json`. Este resultado substitui a contagem parcial anterior de 59 mais diagnóstico.

Tentativa adicional de conferir o protótipo pelo conector Figma: acesso negado por ausência da permissão exigida no arquivo. A equivalência integral continua sem aceite; nenhum design foi alterado.

## Teclado, ampliação e preparação de hospedagem — 16/10

- Corrigidos ciclo de foco do diálogo de intenção pendente e transbordamentos de período, paginação, tabela do gráfico e atalhos.
- Três testes adicionais de navegador aprovados: nove rotas em 320/1280 px com texto 2x e espaçamento ampliado, skip-link, foco circular do menu, diálogo, Escape e restauração do foco sem perder a intenção. Não equivale a TalkBack ou zoom nativo.
- 100 testes frontend passaram; build concluído.
- Pacote `scripts/hospedagem` criado com frontend compilado, Caddy, API/banco sem portas públicas, conexão remota opcional e métricas em porta interna separada. Job próprio no CI; implantação pública não realizada.
- Reconsulta do Maven Central: nenhuma versão Spring 6.2 posterior à 6.2.19 disponível. Alertas continuam registrados; sem migração principal improvisada.

A configuração de hospedagem passou no job hospedagem da execução 38871000579: build das imagens, Caddy válido, frontend servido, login pelo proxy, rotas administrativas não públicas, métricas internas e ausência de portas publicadas da API/banco. O healthcheck agora usa readinessState e banco para aguardar a inicialização completa antes do aceite HTTP. Fonte: https://github.com/lucasandare490/Avanade/actions/runs/38871000579 . O teste usa HTTP em loopback; não declara TLS público ou banco remoto homologados.
