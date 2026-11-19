# Reforma no caixa: os outros efeitos do split payment

Autoria: Thayná Batista da Silva · 19/11/2026

O problema central do Planner Comercial é a **descapitalização**: com o split payment, o imposto sai na hora da venda e deixa de funcionar como capital de giro. O capital de giro dentro do app ([INTEGRACAO-PARCEIRO-CREDITO.md](INTEGRACAO-PARCEIRO-CREDITO.md)) cobre essa falta com crédito.

A tela **Reforma no caixa** cuida dos outros efeitos que a Reforma Tributária traz para o caixa do comerciante. Ela fica no menu **Financeiro**, funciona na demonstração e na versão com servidor, nos três idiomas e nos dois temas, e cada informação tem o seu ícone **i**.

> **Simulado.** As alíquotas e as taxas são as que a pessoa informa. O sistema não tem as alíquotas oficiais de IBS e CBS, não apura imposto e não substitui o contador. Nada movimenta dinheiro.

## 1. Créditos de IBS/CBS das compras

**Problema:** na Reforma, o IBS e a CBS pagos nas compras viram crédito e abatem o imposto das vendas. Quem não acompanha esses créditos deixa dinheiro na mesa.

**O que o sistema faz:**

- O formulário de despesa ganhou o campo **Crédito de IBS/CBS da nota (R$)**, que é opcional. O servidor guarda esse valor em `expense.tax_credit_cents` (migration `V11`) e recusa crédito negativo ou maior que o valor da compra, tanto na API (`422 INVALID_TAX_CREDIT`) quanto no banco (`CHECK`).
- A tela mostra, para o período escolhido (até 366 dias):
  - o imposto retido nas vendas pelo split;
  - os créditos das compras;
  - o imposto líquido, que é o imposto retido menos os créditos;
  - o crédito acumulado, que é o crédito que passou do imposto do período e fica para os próximos.
- Também mostra a lista de compras com o crédito de cada uma.

**Regra de compensação** (a mesma no servidor e no navegador):

```
crédito usado     = mínimo(imposto retido, créditos)
crédito acumulado = máximo(0, créditos − imposto retido)
imposto líquido   = máximo(0, imposto retido − créditos)
```

## 2. Leitura do XML da NF-e de compra

**Problema:** digitar cada nota toma tempo e gera erro.

**O que o sistema faz:** no formulário de despesa, **Importar XML da NF-e** lê o arquivo no próprio navegador e preenche os campos para a pessoa conferir antes de salvar:

- **descrição:** `NF-e <número> · <fornecedor>`;
- **valor:** `vNF`;
- **data:** `dhEmi`;
- **categoria:** Estoque;
- **crédito:** soma de `IBSCBSTot/gIBS/vIBS` e `IBSCBSTot/gCBS/vCBS`, que são os grupos do layout da Reforma.

Uma nota sem o grupo de IBS/CBS é lida com crédito zero, e o sistema avisa.

**Segurança:**

- O arquivo não sai do navegador.
- Arquivos com mais de 1 MB são recusados.
- Também são recusados `<!DOCTYPE>` e `<!ENTITY>`, para evitar expansão de entidades.
- Os valores são validados por expressão regular.
- O nome do fornecedor perde os caracteres de controle e fica com no máximo 60 caracteres.
- Tudo é exibido como texto, nunca como HTML.

## 3. Preço de venda com a nova tributação

**Problema:** com o IBS/CBS "por fora" e o crédito da compra, o preço antigo pode deixar de dar lucro.

**Entradas:** custo, crédito de IBS/CBS da compra, alíquota de IBS/CBS (%), taxa da maquininha (%), margem desejada (%) e, se quiser, o preço atual.

**Fórmula:** o IBS/CBS é calculado sobre o preço sem o imposto. A taxa da maquininha incide sobre o total cobrado. O crédito reduz o custo.

```
custo líquido = custo − crédito
base          = arredondar para cima( custo líquido / (1 − taxa × (1 + alíquota) − margem) )
imposto       = base × alíquota
preço final   = base + imposto
lucro         = preço final − imposto − taxa × preço final − custo líquido
```

**Exemplo testado:**

- **Entradas:** custo R$ 100,00, crédito R$ 10,00, alíquota 26,5%, taxa 2% e margem 20%.
- **Resultado:** preço R$ 146,97, imposto R$ 30,79, taxa R$ 2,94 e lucro R$ 23,24.
- **Comparação com o preço atual de R$ 130,00:** a margem cai para 9,89% e o preço precisa subir R$ 16,97.

## 4. Prazo com fornecedores

**Problema:** pagar o fornecedor mais tarde é a forma mais barata de recompor o capital de giro, porque não tem juros.

**Fórmula:** caixa liberado = compras por mês × (prazo negociado − prazo atual) / 30.

Se houver diagnóstico do capital de giro, a tela diz quanto da falta de caixa prevista para 30 dias esse prazo cobre. O botão **Usar as compras registradas** preenche o valor mensal a partir das despesas do período.

## 5. Antecipação de recebíveis

**Problema:** antecipar as vendas no cartão é outra forma comum de cobrir o caixa, mas tem custo.

**Fórmula** (prática de mercado):

```
desconto              = valor × taxa ao mês × dias / 30
valor recebido hoje   = valor − desconto
custo efetivo ao mês  = (valor / valor recebido)^(30 / dias) − 1
```

A tela compara esse custo com a menor taxa mensal dos parceiros do capital de giro e diz qual sai mais barato. A antecipação em si é feita com a maquininha ou o banco que recebe as vendas. O Planner só simula e compara.

## 6. Pacote do contador

**Problema:** o contador precisa das vendas, dos impostos retidos e dos créditos para apurar o imposto e conferir as compensações.

**O que o sistema faz:** gera um CSV em UTF-8 com BOM, separado por ponto e vírgula, que abre direto no Excel em português. O nome do arquivo é `pacote-contador-<de>-a-<até>-SIMULADO.csv`.

- **Colunas:** Tipo, Data, Identificação, Descrição, Valor bruto, IBS/CBS retido, Taxa, Líquido e Crédito IBS/CBS.
- **Linhas:** três linhas de resumo (vendas, compras e compensação), uma linha por venda concluída e uma linha por compra.
- **Proteção:** células que começam com `=`, `+`, `-` ou `@` são neutralizadas, para não virar fórmula na planilha.

## 7. Integração com nota fiscal, ERP e contador

O Planner não emite nota fiscal e não substitui o ERP. A integração entra por dois caminhos:

- **XML da NF-e**, que é o formato padrão que todo emissor e ERP gera;
- **CSV do contador**, que qualquer sistema contábil importa.

Uma integração direta com um ERP ou sistema contábil específico usa a mesma API (`GET /api/v1/tax-reform/summary`) e fica para quando houver um parceiro definido.

## API

`GET /api/v1/tax-reform/summary?from=AAAA-MM-DD&to=AAAA-MM-DD`

- Exige permissão `financeiro`. O período vai até 366 dias. A consulta só lê dados e sempre filtra pela loja de quem pergunta.
- Devolve:
  - os totais das vendas: `salesCount`, `grossCents`, `taxWithheldCents`, `feeCents` e `netCents`;
  - os totais das compras: `purchasesCount`, `purchasesCents`, `purchasesWithCreditCount` e `taxCreditCents`;
  - a compensação: `creditUsableCents`, `creditCarryOverCents` e `netTaxCents`;
  - as linhas `sales[]` e `purchases[]`, até 1.000 de cada (`rowLimit`);
  - `mode: "SIMULADO"`.
- O navegador recusa uma resposta cujos números não fecham. Por exemplo, o bruto tem que ser igual a imposto mais taxa mais líquido, e a compensação tem que bater com a regra acima.

`POST /api/v1/expenses` aceita o campo opcional `taxCreditCents`, entre 0 e o valor da compra. As despesas retornadas trazem `taxCreditCents`.

## Testes

- **`ReformaIntegrationTest` (backend):**
  - crédito guardado;
  - crédito acima do valor ou negativo recusado;
  - resumo com imposto retido, créditos e imposto líquido;
  - crédito acumulado;
  - cada loja vê só os seus números;
  - período inválido e token inválido recusados.
- **`MigrationUpgradeTest`:** a V11 preserva os dados antigos, a despesa antiga recebe crédito zero e o banco recusa crédito acima do valor.
- **`reforma.test.ts`:** fórmulas com valores calculados à parte, leitura da NF-e, recusa de XML perigoso, CSV do contador e validação da resposta da API.
- **`entrega-final.spec.ts` (navegador, demonstração):**
  - créditos;
  - preço;
  - prazo;
  - antecipação;
  - download do CSV;
  - importação da NF-e e o crédito entrando no resumo;
  - XML perigoso recusado;
  - acessibilidade WCAG AA, ícones **i** e idiomas na tela nova.
- **`reforma-integrado.spec.ts` (navegador contra a API real):** a NF-e vira despesa com crédito no servidor, o resumo soma o crédito e o CSV sai com os mesmos números.
