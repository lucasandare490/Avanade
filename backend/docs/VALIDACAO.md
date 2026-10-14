# Validação dos incrementos 0.1 e 0.2

Ambiente: Linux x86_64, Java21.0.12.1, Maven3.9.11, Spring Boot3.5.16, PostgreSQL17.11 real (binários Zonky2.2.2 / BOM17.11.0). Validação inicial:12/10/2026; atualização:13/10/2026. Mudanças locais sobre main/e45ffda, sem commit/push criado.

## Testes automatizados

Comandos finais: `./mvnw clean verify` (rebuild completo) e `./scripts/check.sh` → `./mvnw -B verify` e inventário de dependências. Último rebuild completo em 13/10/2026: `./mvnw clean verify`. Suítes `TaxEngineTest`, `BackendIntegrationTest`, `QueryAndCashIntegrationTest` e `CrashRecoveryTest`; resultados individuais em `target/surefire-reports`. Resultado consolidado exportado em `test-results.json`.

28 testes aprovados, sem falhas, erros ou testes ignorados: 4 de cálculo, 16 de integração original, 7 de consultas/caixa e 1 de queda/recuperação HTTP. As novas evidências estão no [incremento 0.2](INCREMENTO-02.md). Os testes originais cobrem conservação de centavos/limites/resíduos; HTTP/MockMvc; validação/401/403/revogação/expiração; CORS e limite de corpo/login; runtime sem DDL; venda confirmada/recusada/pendente/sem regra; replay/conflito/recuperação; duas vendas concorrentes com mesma chave; duas retomadas com chaves distintas; snapshot histórico; rollback antes do commit; trilha de hashes; isolamento em IDs/listas/ledger/despesas; caixa de despesa única; simulação sem escrita e fallback de explicação.

Falhas iniciais revelaram a necessidade de usar a instância gerenciada retornada pelo JPA e de selecionar explicitamente a fonte CORS. Corrigidas antes da entrega. Não se conta execução antiga com falhas como evidência de aprovação.

## HTTP e banco persistente

Com API local: `DEMO_PASSWORD=... python3 scripts/smoke.py`. Resultado:201 na criação,200 com resposta idêntica na repetição, recuperação por chave igual, detalhe com15000/1500/300/13200. [Exemplo real sintético](examples/sale-confirmed.json) e [OpenAPI exportado](openapi.json). SQL após primeiro smoke:1 venda,1 operação,3 parcelas,6 eventos,1 intenção,1 movimento de caixa.

Reinício: encerramento do processo LocalDemo por SIGTERM, preservação de `.local/postgres`, novo processo; `python3 scripts/smoke.py --recover` confere resposta original integral. Evidência em `restart-evidence.json` após execução.

## Backup/restore

Executado `pg_dump17.11` formato custom e `pg_restore17.11 --single-transaction` para banco vazio `split_restore_acceptance`, sem apagar o banco de origem. Ferramentas extraídas localmente dos pacotes oficiais PGDG, SHA256 conferido com índice de pacotes; nenhuma instalação global foi necessária.

Comparação entre origem/destino: count e fingerprint determinístico de **todos os campos de todas as linhas** de12 tabelas. Todas iguais: lojas, usuários, vendas, pagamentos, operações, parcelas, eventos, caixa, intenções, despesas, catálogo, regras. [Resultado sem dados sensíveis](restore-evidence.json). Arquivo de backup permaneceu em `.local` ignorada pelo Git. Base do smoke possui uma venda; restauração em volume representativo continua pendente.

## Limites da evidência

- Testes usam PostgreSQL real; não H2. MockMvc valida servidor sem navegador; smoke usa HTTP real.
- Adapter financeiro é mock síncrono: prova atomicidade local, não garantias de PSP externo. A exceção antes do commit testa rollback; reinício posterior testa durabilidade. O incremento 0.2 encerra abruptamente uma JVM após commit e antes de enviar o corpo HTTP; outra JVM recupera a mesma intenção e sessão, sem duplicar efeitos. Ver [evidência](crash-recovery.json).
- Sem Docker instalado: Dockerfile/Compose fornecidos, execução não comprovada.
- Frontend e Android não foram alterados. Auditoria anterior já tinha73 testes web aprovados; não se apresenta esse número como teste da integração atual.
- Tendências/projeção não implementadas por orientação do usuário. Explicação de um período não encerra esses requisitos.
- EXPLAIN com massa sintética foi executado; não constitui ensaio de carga sustentada. Faltam carga sustentada, aceite web/POS, HTTPS, varredura de vulnerabilidades, upgrade estrutural com dados e política operacional de retenção.
