# Exemplos executados do contrato

Gerados em 15/10/2026 pelo teste `BackendIntegrationTest.exportSyntheticContractExamplesWithVerifiedStates`, com PostgreSQL descartável e respostas HTTP da aplicação. UUIDs, datas e correlações são sintéticos; não podem ser consultados na sua instalação. Não há tokens nem senhas nestes arquivos.

| Arquivo | HTTP | Situação |
|---|---|---|
| sale-confirmed.json | 201 | Pagamento confirmado e split concluído |
| sale-declined.json | 201 | Tentativa registrada, pagamento recusado, operação ausente |
| sale-pending.json | 201 | Tentativa registrada, pagamento pendente, operação ausente |
| sale-partial-failure.json | 201 | Pagamento confirmado; split falhou parcialmente |
| operations-empty.json | 200 | Lista autorizada sem resultados |
| idempotency-conflict.json | 409 | Mesma chave com entrada divergente |

HTTP 201 significa criação do registro, não confirmação de todas as etapas financeiras. Confira `payment.status` e `operation.status` separadamente.

Para regenerar, dentro de backend, com Java 21: `./mvnw -Dtest=BackendIntegrationTest#exportSyntheticContractExamplesWithVerifiedStates test`. No Windows, use `mvnw.cmd`. Saída em `target/contract-examples`; copiar para esta pasta somente após o teste passar. O teste controla os cenários no servidor, não abre seletores financeiros no cliente.

Respostas propositalmente inválidas pertencem aos testes dos clientes; não são exemplos válidos produzidos pelo servidor. Exemplos adicionais de cada erro/capacidade ainda podem ser acrescentados conforme o contrato evoluir.
