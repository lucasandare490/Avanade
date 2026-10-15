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

Commits publicados: `36c84ef` e `9cc6d99`. [CI 38800015378](https://github.com/lucasandare490/Avanade/actions/runs/38800015378): web, backend, Android e Docker aprovados. Essa execução precede o caixa semanal e a revisão individual da matriz; estes precisam de nova publicação/verificação.

## Limites de entrega

Não há homologação de carga sustentada, banco em nuvem, Android por HTTPS em aparelho nem uso financeiro real. IA externa é opcional. Crédito, cancelamento e integração real com adquirente permanecem evolução futura. Responsáveis e prazos operacionais dependem da equipe; não foram presumidos.
