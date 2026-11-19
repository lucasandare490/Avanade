# Capital de giro: especificação e integração com parceiro de crédito

Responsável: Thayná Batista da Silva · Planner Comercial (Squad 19, GrowUp/Senac com Avanade)

## 1. Por que isso é central

Com o split payment, o imposto sai **no momento da venda**. Antes, esse dinheiro ficava no caixa até a data de recolhimento e ajudava a pagar as contas do mês. Sem ele, o pequeno comerciante se **descapitaliza**. O módulo de capital de giro fecha o ciclo da solução:

1. o Planner **mostra o problema**: quanto imposto saiu, por quantos dias o caixa cobre as despesas e quanto vai faltar;
2. **recomenda** quanto pegar e em quantas parcelas, de forma responsável;
3. **compara ofertas** de bancos e fintechs parceiras;
4. o comerciante **contrata dentro do app**, sem ir ao banco;
5. o crédito **entra na projeção do caixa**, e o contrato é **gerido até o fim**: pagamento, quitação antecipada ou desistência.

Hoje os parceiros são **simulados**: nenhum dinheiro é movimentado. Para ligar um banco ou fintech de verdade, basta implementar uma classe. Telas, regras, banco de dados e testes continuam iguais (seção 7).

## 2. Jornada do comerciante (tela Capital de giro)

| Etapa | O que o comerciante vê e faz |
|---|---|
| 1. Diagnóstico | Situação do caixa (*saudável*, *no limite* ou *falta capital de giro*), imposto retido por mês, saldo atual, falta prevista em 30 dias, cobertura em dias e recomendação de valor e parcelas |
| 2. Parceiros | Tabela com o limite disponível, a taxa mensal e o CET de cada parceiro |
| 3. Compartilhamento de dados | Autoriza, ou revoga, o envio só de totais dos últimos 90 dias |
| 4. Comparar ofertas | Uma simulação gera as ofertas de todos os parceiros, ordenadas pelo CET, com o selo *Menor CET*. Cada oferta mostra parcela, total, juros, taxa, CET e quanto compromete das entradas |
| 5. Antes e depois | Tabela e barras com o caixa estimado nas próximas 12 semanas, sem e com a oferta escolhida |
| 6. Contratar | Marca *Li e concordo* (valor total, taxa e CET) e contrata |
| 7. Gerir o contrato | Próxima parcela (destaca atraso), pagar parcela, quitar antecipadamente com desconto, desistir em até 7 dias, resumo do contrato para imprimir e cronograma |
| 8. Histórico | Trilha com tudo o que aconteceu, que não pode ser alterada |

A projeção de caixa (Fluxo de Caixa) soma o crédito e desconta as parcelas. Quando a projeção indica déficit, aparece o botão *Ver opções de capital de giro*.

## 3. Regras de negócio

| Regra | Como funciona |
|---|---|
| Quem pode | Pessoa **gerente**: autoriza, contrata, paga, quita e desiste. Perfil **financeiro**: consulta e simula. **Operador**: sem acesso |
| Consentimento | Obrigatório para simular e contratar. Escopo `VENDAS_E_CAIXA_90_DIAS` (entradas líquidas, despesas e número de vendas). Fica registrado com data e pessoa e pode ser revogado. Revogar impede novas propostas e contratações |
| Valores | De R$ 500,00 até o limite do parceiro (máximo de R$ 50.000,00); de 1 a 12 parcelas mensais |
| Limite (simulado) | Fintech: 50% das entradas líquidas de 90 dias. Banco: 30%. Múltiplos de R$ 100,00 |
| Taxas (simuladas) | Fintech: 2,49% ao mês (`CREDIT_SIMULATED_MONTHLY_RATE_BP`). Banco: 1,89% ao mês (`CREDIT_SIMULATED_BANK_MONTHLY_RATE_BP`) |
| Parcela | Tabela Price, arredondada para cima ao centavo |
| CET | Estimado como (1 + taxa mensal)^12 − 1, sem tarifas. Um parceiro real informa o CET oficial dele |
| Crédito responsável | Comprometimento = parcela ÷ entradas líquidas mensais. Até 20%: *saudável*; até 30%: *atenção*; até 50%: *alto*; acima de 50%: *excessivo* e **a contratação é recusada** |
| Validade da proposta | 24 horas, sempre da própria loja |
| Contratação | Aceitar de novo a mesma proposta devolve o mesmo contrato (sem contratar em dobro) |
| Pagamento | Em ordem. A última parcela paga quita o contrato. No simulado, a pessoa registra; com parceiro real, a confirmação chega pelo webhook |
| Quitação antecipada | Valor presente das parcelas futuras, pela taxa do contrato, com prazo em meses inteiros mais dias restantes ÷ 30. Quitar no dia da contratação devolve o valor emprestado |
| Desistência | Em até 7 dias e sem parcela paga, devolve só o valor recebido, sem juros |
| Projeção de caixa | Crédito líquido (recebido − pago − quitações) mais as parcelas que vencem até a data. O caixa **realizado** não muda, porque o dinheiro é simulado |

### Diagnóstico (fórmulas)

- Entradas mensais = entradas líquidas de 90 dias ÷ 3; despesas mensais = despesas de 90 dias ÷ 3.
- Imposto retido por mês = imposto das operações concluídas em 90 dias ÷ 3.
- Disponível em 30 dias = saldo atual + entradas mensais.
- **Falta em 30 dias** = máx(0, despesas mensais − disponível).
- Cobertura = saldo × 30 ÷ despesas mensais (em dias).
- Situação: *falta capital de giro* se houver falta; *no limite* se a cobertura for menor que 15 dias; senão, *saudável*.
- Recomendação: a falta arredondada para cima em R$ 100,00 (mínimo de R$ 500,00, até o maior limite), no menor número de parcelas cuja parcela fique em até 30% das entradas mensais. Sem falta, a recomendação é **não contratar**.

## 4. Base regulatória considerada

O Planner **não concede crédito**. Quem concede, aprova, libera e cobra é a instituição autorizada pelo Banco Central. As regras acima seguem as normas a que o parceiro está sujeito:

| Tema | Referência |
|---|---|
| Fintechs de crédito (SCD e SEP) | Resolução CMN nº 4.656/2018 |
| Plataforma como correspondente ou parceira de instituição autorizada | Resolução CMN nº 4.935/2021 (correspondentes no País) |
| Informar o CET antes da contratação | Resolução CMN nº 3.517/2007 |
| Informação prévia e clara (valor, juros, total, parcelas) | Código de Defesa do Consumidor, art. 52 |
| Liquidação antecipada com redução proporcional dos juros | CDC, art. 52, § 2º; Resolução CMN nº 3.516/2007 (veda tarifa de liquidação antecipada) |
| Desistência em 7 dias | Inspirada no CDC, art. 49, e adotada como boa prática também para a loja (pessoa jurídica) |
| Consentimento e minimização de dados | LGPD (Lei nº 13.709/2018) |
| Compartilhamento de dados entre instituições | Open Finance Brasil (Resolução Conjunta nº 1/2020), caminho natural para o consentimento real |
| Crédito responsável | Inspirado na Lei nº 14.181/2021 (superendividamento) e nas regras de relacionamento com clientes do CMN/BCB |

Ao fechar uma parceria real, a área jurídica do parceiro deve validar os textos de contratação, o contrato (por exemplo, a CCB), a política de crédito e o enquadramento (correspondente ou outro modelo).

## 5. API (`/api/v1/credit`)

| Método e rota | Permissão | Função |
|---|---|---|
| GET `/credit` | financeiro | Parceiros com limite, taxa e CET; fatos; **diagnóstico**; consentimento; contratos; regras; `canContract` |
| POST `/credit/consent` | gerente | Autoriza o compartilhamento (201) |
| DELETE `/credit/consent` | gerente | Revoga (204) |
| POST `/credit/offers` | financeiro | `{amountCents, installments}` → `{offers[], declinedBy[]}`, ordenado pelo CET; cada oferta traz `commitmentBp`, `commitmentLevel` e `canContract` |
| POST `/credit/offers/{id}/accept` | gerente | Contrata (idempotente). Recusa `OFFER_EXPIRED`, `CONSENT_REQUIRED` e `AFFORDABILITY_LIMIT` |
| POST `/credit/contracts/{id}/installments/{n}/pay` | gerente | Registra o pagamento da parcela `n`, só em ordem (`OUT_OF_ORDER`) e só no simulado |
| GET `/credit/contracts/{id}/payoff` | financeiro | `{remainingCents, payoffCents, discountCents}` |
| POST `/credit/contracts/{id}/payoff` | gerente | Quita antecipadamente |
| POST `/credit/contracts/{id}/cancel` | gerente | Desistência (`WITHDRAWAL_EXPIRED`, `WITHDRAWAL_NOT_ALLOWED`) |
| GET `/credit/events` | financeiro | Últimos 50 eventos da loja |
| POST `/credit/webhook/{parceiroId}` | assinatura HMAC | Avisos do parceiro real (seção 6) |

`POST /planning/projection` traz `creditCents` (crédito líquido) e `installmentsDueCents` (parcelas até a data), já somados no saldo projetado.

## 6. Webhook do parceiro (pronto para o parceiro real)

- Fica **desligado** até configurar `CREDIT_WEBHOOK_SECRET` (pelo menos 32 caracteres) no servidor.
- `POST /api/v1/credit/webhook/{parceiroId}` com o header `X-Planner-Signature: sha256=<HMAC-SHA256 do corpo, em hexadecimal>`. A comparação é feita em tempo constante.
- Corpo: `{"eventId": "...", "type": "INSTALLMENT_PAID", "contractId": "<uuid>", "installmentNumber": 1}`.
- `eventId` é único: reenvios respondem `DUPLICADO` e não são processados de novo.
- Só o parceiro dono do contrato altera esse contrato. Parceiro desconhecido ou contrato de outro parceiro recebe 404.
- Cada aviso processado entra no histórico (`WEBHOOK_INSTALLMENT_PAID`).

## 7. Como ligar um banco ou fintech real

Ponto de integração: `backend/src/main/java/br/com/avanade/split/credito/ParceiroCredito.java`

| Método | O parceiro fornece |
|---|---|
| `id()`, `nome()`, `modo()` | Identificador estável, nome exibido e `REAL` |
| `limite(FatosLoja)` | Limite e motivo quando não houver |
| `cotar(FatosLoja, valor, parcelas, hoje)` | Taxa, CET oficial, parcela, total e primeiro vencimento |
| `contratar(Proposta)` | Confirmação da contratação na API do parceiro |

Passo a passo:

1. Crie `ParceiroCreditoNomeDoParceiro implements ParceiroCredito` como `@Bean`, com `@ConditionalOnProperty(name = "app.credit.partner", havingValue = "nome-do-parceiro")`.
2. Chame a API do parceiro com `java.net.http.HttpClient`: HTTPS, timeout e credenciais em variáveis de ambiente (nunca no código).
3. No Render, configure `CREDIT_PARTNER=nome-do-parceiro`, as credenciais e `CREDIT_WEBHOOK_SECRET`; combine o segredo com o parceiro.
4. Quando o parceiro confirmar a liberação, lance o valor no caixa realizado (evolução prevista: novo tipo de lançamento em `cash_entry`).
5. Rode `./mvnw test`. `CreditoIntegrationTest` e `CreditoWebhookIntegrationTest` descrevem o comportamento esperado.

## 8. Dados (migrations V9 e V10)

| Tabela | Conteúdo |
|---|---|
| `credit_consent` | Consentimento: escopo, pessoa, data de concessão e de revogação |
| `credit_offer` | Propostas com parceiro, valores, taxa, CET, comprometimento, fatos usados (para auditoria) e validade |
| `credit_contract` | Contratos com status (`ATIVO`, `QUITADO`, `CANCELADO`), datas e valor de quitação ou devolução |
| `credit_installment` | Parcelas com vencimento, status e data de pagamento |
| `credit_event` | Trilha de eventos **imutável** (gatilho impede alteração e exclusão, como no ledger) |
| `credit_webhook_event` | Avisos do parceiro já processados (idempotência) |

O papel de banco da API só insere registros e altera as colunas de status e datas estritamente necessárias.

## 9. Testes

| Bateria | O que cobre |
|---|---|
| `CreditoIntegrationTest` (10) | Loja sem vendas, diagnóstico com imposto retido e falta de caixa, dois parceiros ordenados pelo CET, idempotência, projeção, pagamento em ordem e quitação automática, trilha imutável, quitação antecipada com desconto, desistência (no prazo, fora do prazo e com parcela paga), crédito responsável, permissões, proposta vencida, consentimento revogado e outra loja |
| `CreditoWebhookIntegrationTest` | Assinatura ausente ou errada, corpo adulterado, parceiro errado ou inexistente, processamento único e reenvio duplicado |
| `credito.test.ts` (12) | Cálculos (Price, CET, limite, comprometimento, prazo, quitação, diagnóstico, semanas) com valores calculados à parte; ciclo completo na demonstração; validação das respostas da API e proteção da URL |
| `entrega-final.spec.ts` | Navegador: diagnóstico, comparação, contratação, pagamento, quitação, resumo, histórico, desistência e bloqueio, nos três idiomas, com ícones "i" e acessibilidade WCAG A/AA nos dois temas |
| `credito-integrado.spec.ts` | Navegador contra a API real: vendas, consentimento, comparação, contratação, pagamento, cotação de quitação, segundo contrato e projeção de caixa |
