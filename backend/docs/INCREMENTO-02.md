# Incremento 0.2 — consultas, caixa e recuperação

Validado em 13/10/2026 com `./mvnw clean verify`: **28 testes aprovados**, zero falhas/erros/ignorados. [Resultado por suíte](test-results.json). O número deste incremento documental não altera a versão do artefato (0.1.0-SNAPSHOT) nem o contrato `/api/v1`. Não houve nova migration, alteração de frontend ou Android.

## Consultas em lote e consistência

`Views` carrega vendas, operações, parcelas e eventos em lote, preservando o JSON e a ordem da página, inclusive vendas sem operação. `FinanceService` consulta despesas com sua categoria em JOIN. `CoreController` delega a paginação do ledger a uma transação REPEATABLE_READ, mantendo total e itens no mesmo snapshot.

| Página de 100 itens | SELECTs medidos no serviço | Tempo observado |
|---|---:|---:|
| Operações | 5 | 12 ms |
| Vendas | 6 | 12 ms |
| Despesas | 2 | 2 ms |

Contagens excluem autenticação/HTTP. Testes com páginas de 1 e 100 itens verificam que as consultas não crescem por registro. Tempos são de uma execução local, não SLA, carga sustentada ou comparação de latência com a implementação anterior.

A massa sintética adiciona duas lojas, 4.000 vendas/operações, 12.000 parcelas, 4.000 eventos, 4.000 despesas e 8.000 movimentos em PostgreSQL descartável, mantendo as constraints. Não altera o banco demonstrativo persistente. O relatório contém [EXPLAIN ANALYZE e métricas](query-plans.json): as páginas usam os índices por loja/data; o agregado de caixa escolheu varredura sequencial ao ler aproximadamente metade da tabela (1,751 ms). Esse plano não justifica forçar índice ou criar migration sem outra evidência.

`QueryAndCashIntegrationTest` verifica igualdade dos DTOs, desempate por UUID para datas iguais, pesquisa literal, filtro vazio, página fora do intervalo e isolamento entre lojas. Escritas concorrentes inseridas entre contagem e leitura não alteram o snapshot de operações ou ledger; a consulta seguinte vê o novo estado. Paginação entre requisições distintas continua sem snapshot durável.

## Limites financeiros

Testes usam relógio controlado somente no perfil de testes. Cobrem limites UTC correspondentes à meia-noite em America/Recife, viradas de dia/mês, período vazio e loja sem movimento. O cenário resulta em abertura de 12.200 centavos, entradas de 26.400, despesas de 50.000 e saldo final de -11.400. Split incompleto não gera entrada; paginação não altera saldo e taxa retida não vira uma segunda despesa.

## Processo encerrado após commit

`CrashRecoveryTest` inicia uma JVM de API contra PostgreSQL descartável. Um filtro exclusivo do código de testes retém a resposta e executa `Runtime.halt(86)` após o commit e antes de enviar seu corpo. O cliente recebe IOException. Outra JVM inicia sobre o mesmo banco e recupera a intenção usando a sessão original; repetir a chave retorna HTTP 200, indicação de replay e JSON idêntico.

Antes/depois permanecem 1 venda, 1 operação, 3 parcelas, 6 eventos e 1 movimento de caixa. [Evidência exportada](crash-recovery.json). O filtro não integra o JAR de produção. O ensaio cobre a fronteira após commit; rollback por exceção antes do commit é coberto pela suíte original. Não comprova garantias de PSP externo nem todos os pontos possíveis de interrupção.

## Pendências preservadas

Projeção e tendências seguem pendentes por decisão do usuário. Permanecem carga sustentada, upgrade estrutural com dados, execução Docker/HTTPS/POS, aceite dos clientes, CI remoto, análise de vulnerabilidades e políticas operacionais. [Checklist atualizado](CHECKLIST.md).
