> Atualização vigente: [capacidades de 15/10](INCREMENTO-FUNCIONAL-2026-10-15.md), incluindo cadastro, relatórios, recuperação, explicações e caixa semanal.

> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Contrato HTTP v1 — backend demonstrativo

Base `/api/v1`. JSON UTF-8. Exceto login e cadastro (`POST /auth/register`), todas as rotas exigem `Authorization: Bearer <accessToken>`. Corpo não admite propriedades desconhecidas, valores monetários fracionários ou tenant fornecido pelo cliente. Schemas de entrada e rotas no [OpenAPI](openapi.json); os schemas de resposta são publicados junto deste documento e dos [exemplos executados](examples/sale-confirmed.json).

| Método/rota | Permissão | Entrada / resultado |
|---|---|---|
| POST auth/login | Pública | email/password → sessionId, user{id,name}, merchant{id,name,timeZone}, permissions, expiresAt ISO, accessToken, tokenType |
| POST auth/logout | Sessão | 204; repetição com token revogado retorna401 |
| POST sales | vender | Idempotency-Key + SaleInput →201 nova /200 replay; venda com pagamento e operation completa ou null |
| GET sales | consultar | Lista paginada, inclusive pagamentos sem split |
| GET sales/{id} | consultar | Venda e estado atual da operação |
| GET split-operations | consultar | Lista paginada de operações calculadas |
| GET split-operations/{id} | consultar | Composição, pagamento, regra congelada, parcelas, eventos |
| POST split-operations/{id}/reprocess | retomar | Idempotency-Key, sem corpo →200 operação JSON; preserva parcelas confirmadas |
| GET requests/{action}/{key} | Ação correspondente | SALE, EXPENSE ou REPROCESS:{UUID}; snapshot original da intenção |
| GET ledger?saleId={UUID} | consultar | Eventos em sequência crescente; venda sem operação retorna lista vazia |
| GET expense-categories | despesa | Array de {id,name}; STOCK/Estoque, SERVICES/Serviços, OPERATING/Operacional |
| POST expenses | despesa | Idempotency-Key + descrição/valor/categoria/data →201/200, despesa com ID |
| GET expenses | financeiro | Lista paginada de despesas pagas |
| GET expenses/{id} | financeiro | Despesa autorizada |
| GET cash-flow?from=&to= | financeiro | Caixa realizado, saldo inicial, entradas, despesas, saldo final |
| GET dashboard?from=&to= | financeiro | Mesmo contrato de caixa; sem séries gráficas inventadas |
| POST split-payment/simulate | consultar | Cálculo sem escrita financeira |
| POST ai/cash-analysis | financeiro | from/to → period,text,origin,provider,status,facts; sem tendências/projeção |

## Entradas

```json
{"amountCents":15000,"currency":"BRL","paymentMethod":"PIX","taxCategory":"GENERAL"}
```

`posDeviceId` opcional até100 caracteres é referência descritiva, não credencial de dispositivo. Meios PIX/DEBIT/CREDIT. GENERAL é a categoria demonstrativa disponível. Nenhum `cenario`, taxa, imposto, estado, loja ou composição enviados pelo cliente são aceitos.

```json
{"description":"Reposição de estoque","amountCents":10000,"categoryId":"STOCK","paidOn":"2026-10-12"}
```

Data paga não pode ser futura no fuso da loja. Descrição1–240; valor1–100.000.000 centavos. Retorno: id, description, amountCents, categoryId, categoryName, paidOn, createdAt. Para recuperar após timeout, reutilizar chave ou consultar `requests/EXPENSE/{key}`.

```json
{"amountCents":15000,"includeFee":true,"taxCategory":"GENERAL"}
```

Simulação responde `simulation:true, mode:SIMULADO, currency:BRL, rule, includeFee, amounts:{grossCents,taxCents,feeCents,netCents}`.

```json
{"from":"2026-10-01","to":"2026-10-12"}
```

Explicação consulta dados no banco. `origin:demonstrativa`, `provider:MOCK`, `status:OK|FALLBACK`; `facts` usa o retorno de caixa. Nenhuma IA externa está configurada. Resultado com FALLBACK continua HTTP200 com indicadores.

## Identidade, dinheiro e estados

IDs UUID; moeda BRL; todos `*Cents` inteiros. Taxas `*Bps` pontos-base. Datas civis YYYY-MM-DD; instantes ISO UTC. Regra é demonstrativa combinada, não cálculo fiscal real.

Pagamento: CONFIRMED/PENDING/DECLINED. Apenas CONFIRMED permite split. Sale contém `failureCode` nullable e `operation` nullable; consumidor deve tratar ausência explícita de operação.

Operação: CRIADA → SEPARADA → ROTEADA → CONCLUIDA ou FALHA. FALHA → ROTEADA na retomada. CONCLUIDA é final. Adapter síncrono entrega estado final/erro conhecido na resposta; fases intermediárias são eventos da mesma transação e não commits separados.

Parcelas: TAX/FEE/NET com amountCents, destination público, status PENDENTE/ENVIADA/CONFIRMADA/FALHA e confirmedAt nullable. Adapter atual não deixa ENVIADA durável. Zero é permitido em tributo/taxa arredondados; três parcelas sempre somam bruto.

## Listas e períodos

Listas `{items,total,page,size}`. `page` default1, máximo1.000.000; `size` default20, máximo100. `from/to` inclusivos e fornecidos juntos, até366 dias, datas entre2000 e2100. Query de timestamp usa início civil inclusivo e dia seguinte exclusivo no fuso da loja. Operações/vendas: `search` busca literal no UUID; `paymentMethod`; `status` somente operações; `PENDENTE` agrupa CRIADA/SEPARADA/ROTEADA antes da paginação. Despesas: `search` literal na descrição. Detalhe inexistente ou de outra loja retorna404.

Caixa: `{period:{from,to},timeZone,updatedAt,openingCents,inflowCents,expenseCents,closingCents,recognition}`. `closing=opening+inflow-expense`; saldo pode ser negativo. Inclui todos os movimentos no filtro, independente de páginas. Taxa já abatida não gera outra despesa.

## Idempotência e erros

`Idempotency-Key`: 8–128 caracteres ASCII `[A-Za-z0-9_-]`; gerar antes de enviar e preservar após timeout. Escopo loja/ação, sem expurgo nesta versão. `Idempotency-Replayed: true|false`. Recovery devolve snapshot original; detalhe devolve estado atual. Enquanto transação inicial está em andamento, consulta pode retornar404 por ainda não haver commit: **não criar uma nova chave**. Reenviar mesma chave é seguro e aguarda lock; timeout SQL pode produzir5xx recuperável. Não há HTTP202 nesta versão síncrona.

Erro `{code,message,fieldErrors,correlationId}` e header `X-Correlation-Id`. 400 formato/filtro;401 sessão;403 permissão;404 ausência/tenant;409 chave divergente/estado;413 corpo>16KiB;422 validação;429 limite com Retry-After;500 resultado possivelmente desconhecido, consultar/repetir mesma chave. Não interpretar5xx/rede como recusa de pagamento.

## Mapeamento para clientes existentes

| API | Web interno |
|---|---|
| grossCents/taxCents/feeCents/netCents | bruto/tributo/taxa/liquido |
| createdAt | data |
| PIX/DEBIT/CREDIT | PIX/Débito/Crédito |
| CONCLUIDA/FALHA/demais | concluida/falha/pendente |
| CONFIRMED/PENDING/DECLINED | confirmado/pendente/recusado |
| parcels.kind/destination/amountCents/status | parcelas.titulo/destino/valor/status |
| events.occurredAt/description | eventos.instante/descricao |
| items/total/page/size | itens/total/pagina/tamanho |
| sessionId/expiresAt/user.name/merchant.name | id/expiraEm(ms)/nome/loja |

Web integrado em 14/10/2026: criação extrai `sale.operation`; retomada recebe operação direta. `operation:null` usa resultado de venda sem split e rota própria `#/vendas/{id}`. Bearer, categorias, idempotência e consultas foram conectados; veja [guia web](../../frontend/documentacao/INTEGRACAO-BACKEND.md). O cliente Android continua com integração separada.

## Cenários mock controlados pelo servidor

No launcher local, `APP_MOCK_PAYMENT=DECLINED` ou `PENDING` configura novas vendas sem split. `APP_MOCK_FAIL_PARCEL=TAX|FEE|NET` produz falha inicial nesse destino; retomada confirma as parcelas restantes. Defaults CONFIRMED/NONE. Variáveis são configuração do servidor, nunca campos HTTP. Reiniciar com cenário diferente não modifica vendas existentes. Resposta perdida é reproduzida consultando/repetindo a chave já gravada; a queda do processo após commit e antes do envio do corpo HTTP foi validada em [CrashRecoveryTest](INCREMENTO-02.md), com recuperação e replay sem duplicação.

## Extensão atual: comparação e composição

`GET /api/v1/trends?from=YYYY-MM-DD&to=YYYY-MM-DD` exige `financeiro`, compara o intervalo anterior de mesma duração, com valores centavos ou null quando não há registros.

`GET /api/v1/dashboard/details?from=YYYY-MM-DD&to=YYYY-MM-DD` exige `financeiro`, retorna totais e série diária de operações concluídas no fuso da loja. O reconhecimento é `COMPLETED_AT_IN_MERCHANT_TIME_ZONE`.

`POST /api/v1/ai/cash-analysis` inclui `tendencias`; o cliente também consulta `/trends` separadamente para preservar a comparação quando a explicação falhar. O provedor textual permanece demonstrativo. Consulte o OpenAPI exportado atual para os schemas.

## Exportação de operações (14/10/2026)

GET /api/v1/exports/operations?from=YYYY-MM-DD&to=YYYY-MM-DD

Permissão: financeiro. Filtros opcionais: status, paymentMethod e search, iguais aos da lista de operações. Período obrigatório até 366 dias. Máximo 2.000 resultados, com 422 EXPORT_LIMIT acima disso. Retorno: columns (8 títulos), rows (linhas de 8 strings), total e mode SIMULADO. Valores monetários em centavos BRL e instantes UTC. Snapshot consistente de todas as páginas; isolamento por loja. A interface gera CSV identificado como simulado. Não é documento fiscal.
