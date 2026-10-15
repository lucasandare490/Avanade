# Capacidades adicionadas em 15/10/2026

Contrato HTTP `/api/v1`, versão OpenAPI 1.1.0. Implementação demonstrativa; números persistem no PostgreSQL, pagamentos não movimentam dinheiro real.

| Método e caminho | Entrada | Retorno e permissão |
|---|---|---|
| POST /auth/register | name, merchantName, email, password | 201 created; público; cria loja e gerente atomicamente |
| GET /merchant | sessão | name, timeZone, canEdit; loja da sessão |
| POST /merchant | name | perfil atualizado; somente gerente |
| POST /sales/{id}/recover-split | Idempotency-Key | mesma venda com operação; exige retomar, pagamento confirmado e falha de regra |
| POST /planning/projection | until, incomeCents, expenseCents | cenário com saldo inicial, projetado, premissa e atenção; financeiro |
| POST /ai/expense-category | description | sugestões e confirmação obrigatória; despesa |
| GET /ai/split-explanation/{id} | ID da operação | texto, regra histórica, parcelas, limitações; consultar |
| GET /reports/{kind}?from=&to= | kind: sales, expenses, taxes | columns, rows, total, mode; financeiro |

A simulação aceita `simulatedTaxBps` opcional (0–10000); o total com taxa não pode superar 100%. Ausência usa a regra demonstrativa vigente. O parâmetro não altera regras de vendas.

A explicação de caixa mantém `text`, `facts`, `tendencias`, `period`, `origin`, `provider`, `status` e acrescenta `structured` (summary, attention, recommendations, limitations, templateVersion). O texto inclui interpretação determinística das comparações: base zero e falta de dados não produzem percentuais inventados. Não infere causas nem prevê resultados.

A recuperação do split não repete pagamento. Usa regra que cubra a data original da venda, bloqueia a venda durante criação e preserva o motivo anterior da falha. `RECOVER_SPLIT:{saleId}` identifica a ação idempotente. Repetição da chave recupera a resposta; chaves diferentes concorrentes consultam a mesma operação.

Relatórios usam o período completo: vendas pela criação; despesas pelo pagamento; tributos pela conclusão do split. Instantes em UTC, limites no fuso da loja, valores em centavos. Máximo de 2.000 registros, com erro explícito acima do limite. A paginação visual não reduz o CSV. O relatório de vendas inclui recusas/pendências como registros, sem tratá-las como caixa realizado.

Migrations V4 e V5 acrescentam término de vigência e privilégio de edição do nome. Regras sobrepostas são resolvidas pela maior data inicial válida; datas iniciais iguais por categoria são proibidas. O fim é exclusivo. Não modificar versões aplicadas.

## Escopo operacional

Sessões bearer opacas duram 60 minutos e podem ser revogadas; não há refresh nem cookies. Cada usuário pertence a uma loja neste MVP. Chaves idempotentes não expiram automaticamente; nenhuma rotina de limpeza foi autorizada. O mock síncrono não necessita fila, outbox ou inbox. Integração financeira externa exigirá projeto próprio.

Backups operacionais, política de retenção, destinatário dos alertas e aceite em aparelho dependem de responsáveis da equipe. Não atribuir pessoas ou prazo sem acordo. Banco local não é ambiente de nuvem.

## Validação

Executar por último, após implementação e organização. Não confundir este contrato com resultado de teste. Relatórios finais e pipeline devem registrar o código efetivamente executado.
