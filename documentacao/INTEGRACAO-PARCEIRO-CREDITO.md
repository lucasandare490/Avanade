# Capital de giro: como ligar um banco ou fintech parceira

O Planner Comercial já tem o fluxo completo de capital de giro **dentro do app**, sem o comerciante ir ao banco:

1. O comerciante vê o limite disponível.
2. Autoriza compartilhar dados agregados da loja com o parceiro (e pode revogar).
3. Simula valor e parcelas e vê parcela, total, juros, taxa mensal e CET antes de decidir.
4. Confirma que leu e contrata.
5. O crédito entra na projeção do caixa, e as parcelas aparecem como compromissos.

Hoje o parceiro é **simulado**: nenhum dinheiro é movimentado. Para virar real, basta implementar uma classe e trocar uma variável de ambiente. Telas, banco de dados, testes e regras de consentimento continuam iguais.

## Quem faz o quê

| Papel | Responsabilidade |
|---|---|
| **Parceiro** (banco, SCD ou fintech autorizada pelo Banco Central) | Analisa o crédito, define limite, taxa e CET, aprova, libera o dinheiro e cobra as parcelas |
| **Planner Comercial** | Mostra a oferta com clareza, coleta o consentimento, registra a contratação e mostra o impacto no caixa |
| **Comerciante** | Decide se compartilha os dados e se contrata |

O Planner **não concede crédito** e não decide sozinho. A análise de IA também não aprova crédito.

## Ponto de integração no código

`backend/src/main/java/br/com/avanade/split/credito/ParceiroCredito.java`

| Método | O parceiro precisa oferecer |
|---|---|
| `limite(FatosLoja)` | Limite disponível para a loja, ou o motivo de não haver limite |
| `cotar(FatosLoja, valor, parcelas, hoje)` | Proposta: taxa mensal, CET anual, valor da parcela, total e primeiro vencimento |
| `contratar(Proposta)` | Confirmação da contratação (no parceiro real, chamada à API dele) |
| `nome()` e `modo()` | Nome exibido e `REAL` (o simulado devolve `SIMULADO`) |

`FatosLoja` tem só dados agregados dos últimos 90 dias: entradas líquidas depois do split, despesas pagas e número de vendas. Nenhum dado de clientes é compartilhado.

### Passo a passo para um parceiro real

1. Crie `ParceiroCreditoNomeDoParceiro implements ParceiroCredito`, com `@ConditionalOnProperty(name = "app.credit.partner", havingValue = "nome-do-parceiro")`.
2. Chame a API do parceiro com `java.net.http.HttpClient`, sempre com timeout, HTTPS e credenciais em variáveis de ambiente (nunca no código).
3. Configure no Render: `CREDIT_PARTNER=nome-do-parceiro` e as credenciais do parceiro.
4. Recomendado: um endpoint de *webhook* para o parceiro avisar a liberação do dinheiro e o pagamento de cada parcela. Ele marcaria as parcelas como `PAGA` e lançaria o dinheiro no caixa realizado. No simulado, o dinheiro aparece só na projeção, porque não é real.
5. Rode `./mvnw test`. Os testes de `CreditoIntegrationTest` mostram o comportamento esperado.

## Regras que já estão no sistema

- **Consentimento explícito e revogável**, registrado com data, pessoa e escopo (`VENDAS_E_CAIXA_90_DIAS`). Sem consentimento ativo, não há simulação nem contratação (LGPD; no futuro, pode vir pelo Open Finance Brasil).
- **Só a pessoa gerente** autoriza e contrata. O perfil financeiro só consulta e simula.
- **Transparência antes do aceite:** parcela, total a pagar, juros, taxa mensal, CET anual, data da primeira parcela e validade da proposta. O botão de contratar só libera depois de a pessoa marcar que leu e concorda.
- **Sem contratação em dobro:** aceitar a mesma proposta de novo devolve o mesmo contrato.
- **Proposta vence em 24 horas** e é sempre da própria loja.
- O parceiro simulado usa regras fictícias: limite de 50% das entradas líquidas de 90 dias (R$ 500,00 a R$ 50.000,00), taxa de 2,49% ao mês (`CREDIT_SIMULATED_MONTHLY_RATE_BP=249`) e de 1 a 12 parcelas pela tabela Price. O CET mostrado é estimado e não inclui tarifas.

## API (`/api/v1/credit`)

| Método e rota | Permissão | Função |
|---|---|---|
| GET `/credit` | financeiro | Parceiro, limite, fatos usados, consentimento, contratos e se a pessoa pode contratar |
| POST `/credit/consent` | gerente | Autoriza o compartilhamento |
| DELETE `/credit/consent` | gerente | Revoga o compartilhamento |
| POST `/credit/offers` | financeiro | `{amountCents, installments}` → proposta (exige consentimento) |
| POST `/credit/offers/{id}/accept` | gerente | Contrata (idempotente) e devolve o contrato com o cronograma |

A projeção (`POST /planning/projection`) passa a trazer `creditCents` (capital de giro ativo) e `installmentsDueCents` (parcelas que vencem até a data), já somados no saldo projetado.

## Banco de dados (migration V9)

`credit_consent`, `credit_offer` (com os fatos usados na oferta, para auditoria), `credit_contract` e `credit_installment`. A API só pode inserir registros e revogar consentimentos.
