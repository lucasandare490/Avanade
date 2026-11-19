---
title: "Planner Comercial — Entrega Final"
subtitle: "GrowUp | Residência em Software & IA · Squad 19 · Avanade"
author: "Thayná Batista da Silva"
date: "18/11/2026"
lang: pt-BR
---

# Planner Comercial

**Planejamento de caixa para o pequeno comerciante diante do Split Payment da Reforma Tributária, com venda no Smart POS Android e painel web.**

> **OBJETIVO PRINCIPAL DO PROJETO**
> Evitar que o pequeno comerciante se descapitalize com o Split Payment. O Planner Comercial mostra, venda a venda, quanto de fato entra no caixa depois que o imposto e a taxa são separados no pagamento, e projeta o caixa para que ele se antecipe à falta de capital de giro.

| Item | Informação |
|---|---|
| Entrega | Final — 18/11/2026 |
| Programa | Residência Tecnológica Grow Up 2026.2 — Porto Digital e Faculdade Senac de Pernambuco (Recife-PE) |
| Turma | GROWUP-SENAC-N2 |
| Squad | 19 — Planner Comercial (Split Tributário) |
| Empresa parceira | Avanade |
| Mentor | Eryson Moreira |
| Versão | MVP acadêmico publicado |
| Site publicado | https://avanade-frontend-xi.vercel.app/ |
| Repositório | https://github.com/lucasandare490/Avanade |
| Documento produzido por | Thayná Batista da Silva — design e prototipação de alta fidelidade ([Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design)), pesquisa e [levantamento de requisitos](https://docs.google.com/document/d/1QoIXru-uVBmSDMy6YKjTAkVvk_0Q2kk5_WnfubFtVPU/edit?usp=sharing), [documentação de requisitos](https://docs.google.com/document/d/13OdFEBoY3y_6TPt6pDJQwXycZW9mGdwy/edit?usp=sharing), README (PT/EN/ES), Scrum Master e testes |
| Organização da equipe, Trello e entrevista com pessoas usuárias | Kleysson Teixeira da Cruz Junior |

### Equipe

| Pessoa | Papel na squad |
|---|---|
| Thayná Batista da Silva | Scrum Master; design e prototipação; pesquisa; documentação de requisitos; README em português, inglês e espanhol; testes; implementação da entrega final (login seguro, tema, idiomas, explicações, capital de giro, Reforma no caixa, correções e auditoria) |
| Kássio Lima de Oliveira | Código do projeto e deploy (Render e Vercel); integração backend–frontend; Supabase |
| Lucas André Cardoso de Lima | Código do front-end (web e Android) |
| Kleysson Teixeira da Cruz Junior | Organização e divisão das demandas da equipe; estruturação e atualização do quadro no Trello; entrevistas com pessoas usuárias e auxílio na pesquisa de campo; auxílio na elaboração da documentação; repositório inicial; suporte nas demandas gerais do projeto |
| Heitor Sette Couto de Melo | Apresentação do pitch deck |
| James Bernardino da Silva Neto | Integrante da squad |

> **LIMITE DE RESPONSABILIDADE**
> O recolhimento oficial de IBS/CBS depende de integração com instituição autorizada e homologação. No MVP, vendas, despesas e usuários ficam salvos de verdade no banco de dados; pagamentos, separação do tributo e roteamento são **simulados** e identificados como tal. Percentuais de exemplo não são legislação.

# 1. O que mudou desde a entrega parcial

| Ponto | Entrega parcial | Entrega final |
|---|---|---|
| Problema central | Confundido com a solução: o foco era *como recolher o imposto de cada venda* | **Descapitalização** do comerciante com o desconto automático do imposto no pagamento (correção pedida pelo mentor) |
| Código | Iniciando; protótipo no Figma | MVP publicado: API Java com PostgreSQL, site React, cliente Android |
| Login | Planejado | Cadastro, login, bloqueio após 5 tentativas, recuperação de conta, lembrar de mim |
| Crédito | Futuro | Capital de giro dentro do app, com parceiro plugável (simulado no MVP) |
| Acessibilidade e idiomas | — | Tema claro/escuro/sistema, português/inglês/espanhol, ícone "i" com explicação em cada informação, contraste WCAG AA |
| Testes | Planejados | Backend, unitários de frontend e testes em navegador real (seção 7) |

# 2. Definição do problema e personas

## 2.1 Problema, solução e oportunidade de IA

### Problema (até 250 caracteres)

Com o split payment, o imposto sai na hora em que a venda é paga. O dinheiro que ficava no caixa até a data de recolher deixa de entrar, e o pequeno comerciante perde capital de giro (descapitalização) sem perceber a tempo.

### O problema em detalhe

A Reforma Tributária do consumo (Emenda Constitucional 132/2023 e Lei Complementar 214/2025) cria o IBS e a CBS e prevê o **split payment**: no momento do pagamento, a parte do imposto é separada automaticamente e o comerciante recebe só o valor líquido.

Hoje, o dinheiro do imposto entra no caixa junto com a venda e só sai semanas depois, na data de recolhimento. Nesse intervalo, ele funciona como **capital de giro**: paga fornecedor, estoque e salários. Com o split payment, esse dinheiro deixa de entrar. O pequeno e médio comerciante perde capital de giro de uma vez e, sem planejamento, pode ficar sem caixa para pagar as contas mesmo vendendo bem.

Portanto, o problema **não é como recolher o imposto de cada venda** — o split payment já faz isso sozinho. É **como manter o caixa saudável quando o imposto sai na hora da venda**.

### Solução (até 250 caracteres)

O Planner Comercial mostra, venda a venda, quanto vai para imposto, taxa e caixa, projeta os próximos dias e, se faltar dinheiro, oferece capital de giro de um parceiro dentro do app.

### Como o produto funciona

Venda paga no Smart POS ou no POS web → pagamento confirmado (simulado) → identificação da regra de tributo vigente → separação em **tributo · taxa · valor líquido** → roteamento simulado de cada parcela → registro auditável (eventos com hash encadeado) → caixa atualizado **pelo valor líquido** → projeção e aviso de déficit → **capital de giro** com banco ou fintech parceira, dentro do app → explicação em linguagem simples.

**Regra fundamental:** cálculos, separação e movimentação são feitos pelo backend com regras determinísticas. A camada de explicação recebe resultados já calculados e não altera valores.

### Onde a IA gera valor (e como está no MVP)

| Categoria | Aplicação | Situação no MVP |
|---|---|---|
| Automação | Sugestão de categoria de despesa por texto | Implementada por regras (palavras-chave), sempre confirmada pela pessoa |
| Predição | Interpretação da projeção de caixa e comparação de tendências entre períodos | Projeção manual com aviso de déficit e comparação de tendências implementadas; interpretação por regras |
| Geração de conteúdo | Explicação simples do split e do caixa | Implementada por regras, com dados do servidor; provedor de IA externo continua opcional |

### Limites da IA

Não calcula nem separa tributo; não roteia parcelas nem autoriza pagamentos; não calcula oficialmente IBS/CBS; não aprova crédito; não altera vendas, despesas ou o registro de eventos. Se a explicação estiver indisponível, o núcleo de split e o Planner continuam funcionando.

## 2.2 Personas

| Persona | Necessidades | Dificuldades |
|---|---|---|
| Carlos, pequeno comerciante | Saber quanto de cada venda realmente fica no caixa; prever se vai faltar capital de giro; acompanhar vendas e despesas | Pouco tempo; conhecimento tributário limitado; dificuldade com dados complexos |
| Mariana, responsável financeira | Conferir cada operação de split; ver o caixa pelo valor líquido; comparar períodos; projetar o caixa | Conciliar bruto e líquido; falta de rastreabilidade |
| João, operador do Smart POS | Registrar a venda rápido; ver a confirmação do split; evitar lançamento duplicado | Pressão de atendimento; risco de erro de digitação |

## 2.3 Cenários de uso e casos de borda

| Cenário | Entrada | Resultado |
|---|---|---|
| Venda paga | Pagamento confirmado | Tributo, taxa e líquido separados; parcelas roteadas; operação registrada |
| Caixa do período | Período | Caixa realizado pelo valor líquido, por dia e por semana |
| Projeção | Entradas e despesas previstas | Saldo projetado e aviso de déficit |
| Simulação | Valor e percentual hipotético | Composição sem criar venda |
| Explicação | Operação ou período | Texto simples a partir dos fatos do servidor |
| Categoria de despesa | Descrição | Sugestão revisável |

| Caso crítico | Comportamento implementado |
|---|---|
| Soma das parcelas diferente do bruto | Operação bloqueada |
| Venda repetida (perda de resposta) | Idempotência: devolve a mesma operação, sem cobrar de novo |
| Regra de tributo ausente para a data | Split não é executado; recuperação posterior com a regra histórica |
| Falha em uma parcela | Parcelas confirmadas preservadas; retomada só do que falta |
| Pagamento não confirmado | Split não é iniciado |
| Valor zero ou negativo | Rejeitado |
| Tentativa de alterar o registro | Bloqueada; registro só recebe novos eventos |
| Senhas erradas seguidas | Bloqueio temporário de 15 minutos após 5 tentativas, igual para e-mail cadastrado ou não |

## 2.4 Entrevistas e validação de hipóteses

### Hipóteses

1. O comerciante não sabe quanto de cada venda ficará disponível depois do split payment. **Confirmada** na entrevista.
2. A perda do dinheiro do imposto no caixa afeta o capital de giro e o planejamento. **Confirmada**: a principal dor foi prever o valor realmente disponível.
3. Ver bruto, tributo, taxa e líquido separados gera confiança. **Confirmada**; virou requisito.
4. Explicações em linguagem simples ajudam a decidir. Atendida com o ícone "i" e as explicações por regras.

### A) Entrevista com pessoa usuária (realizada por Kleysson)

| Campo | Registro |
|---|---|
| Entrevistado | Lucas — empreendedor no ramo de alimentos |
| Data e método | 04/10 — perguntas estruturadas, 20 minutos |
| Principal dor | Prever o valor realmente disponível depois de impostos e taxas, o que prejudica o planejamento do caixa |
| Necessidade | Ver com clareza bruto, impostos, taxas e líquido de cada venda |
| Alteração no projeto | Visualização detalhada da composição de cada venda e caixa calculado pelo valor líquido |

### B) Entrevista com agente inteligente

Conversa com um assistente de IA generativa (ferramenta de chat), em 01/10/2026, a partir da documentação do projeto. Trata-se de uma entrevista simulada, usada para levantar riscos e casos de falha.

| Sugestão | Decisão | Motivo |
|---|---|---|
| Deixar explícito que o recolhimento oficial depende de instituição autorizada | Aceita | Evita prometer o que o projeto não entrega |
| Marcar operações do MVP como simuladas | Aceita | Não confundir demonstração com operação real |
| Regras de tributo em tabela com vigência, sem valores fixos no código | Aceita | As regras mudam com o tempo |
| Idempotência e retomada de falhas | Aceita | Evita duplicidade e perda de parcela |
| Registro com hash encadeado | Aceita, simplificada | Sem blockchain, para caber no prazo |
| IA não calcula nem move valores | Aceita | Reduz risco financeiro |
| Adiar crédito e integrações reais | Aceita | Fora do MVP por prazo e dependência de parceiros |

# 3. Backlog e requisitos

## 3.1 Épicos e situação na entrega final

| ID | Épico | Prioridade | Situação |
|---|---|---|---|
| E01 | Autenticação e conta | P1 | **Concluído**: cadastro, login, perfis, bloqueio após 5 tentativas, recuperação por e-mail, lembrar de mim |
| E02 | Vendas e pagamento | P1 | **Concluído** com pagamento simulado; POS web e cliente Android |
| E03 | Identificação e separação do tributo | P1 | **Concluído** (simulado, regras com vigência) |
| E04 | Roteamento das parcelas | P1 | **Concluído** (simulado), com retomada de falha parcial |
| E05 | Registro auditável | P1 | **Concluído**: eventos em sequência com hash encadeado |
| E06 | Fluxo de caixa pelo valor líquido | P2 | **Concluído**: caixa realizado, composição diária e semanal |
| E07 | Simulação de cenários | P2 | **Concluído** |
| E08 | Explicação dos resultados | P2 | **Parcial**: explicações por regras; provedor de IA externo opcional |
| E09 | Classificação de despesas | P3 | **Concluído** como sugestão por regras, confirmada pela pessoa |
| E10 | Alertas de caixa | P3 | **Concluído** como aviso de déficit na projeção |
| E11 | Capital de giro com parceiros | P1 | **Concluído com parceiros simulados**: diagnóstico da descapitalização, ofertas comparadas pelo CET, crédito responsável, antes e depois do caixa, contratação, pagamento, quitação antecipada, desistência, histórico imutável e webhook assinado. Pronto para ligar um banco ou fintech |
| E13 | Cancelamento de vendas | Futuro | Fora do MVP (decisão do grupo) |
| E12 | Acessibilidade, tema e idiomas | P2 | **Concluído**: tema claro/escuro/sistema, PT/EN/ES, ícone "i", WCAG AA |
| E14 | Reforma no caixa | P1 | **Concluído**: créditos de IBS/CBS das compras com leitura do XML da NF-e, preço de venda, prazo com fornecedores, antecipação de recebíveis e pacote do contador |

## 3.2 Critérios de aceitação verificados por testes

| História | Critério | Teste |
|---|---|---|
| Login | Senha errada mostra tentativas restantes; 5ª bloqueia por 15 min; senha certa não entra durante o bloqueio | `LoginBloqueioIntegrationTest`, `login-integrado.spec.ts` |
| Recuperação | Pedido sem login; link de uso único e com validade; troca de senha revoga sessões e desbloqueia | `RecuperacaoSenhaIntegrationTest`, `RecuperacaoSenhaEmailTest` |
| Venda e split | Soma das parcelas igual ao bruto; mesma tentativa não duplica | `BackendIntegrationTest`, `CrashRecoveryTest` |
| Caixa | Entra o líquido, saem despesas, saldo por período e semana | `QueryAndCashIntegrationTest`, `caixa-semanal.spec.ts` |
| Capital de giro | Diagnóstico, ofertas comparadas pelo CET, parcela acima de 50% bloqueada, contratação com aceite, pagamento de parcela, quitação antecipada com desconto, desistência em 7 dias, histórico imutável e webhook assinado | `CreditoIntegrationTest`, `CreditoWebhookIntegrationTest`, `credito.test.ts`, `credito-integrado.spec.ts` |
| Reforma no caixa | Crédito de IBS/CBS guardado e limitado ao valor da compra; resumo com imposto retido, créditos, imposto líquido e crédito acumulado; NF-e preenche a despesa; XML perigoso recusado; CSV do contador com os mesmos números | `ReformaIntegrationTest`, `reforma.test.ts`, `reforma-integrado.spec.ts`, `entrega-final.spec.ts` |
| Tema e idiomas | Todas as telas nos três idiomas, sem texto sem tradução; tema salvo | `entrega-final.spec.ts`, `verificar-traducoes.mjs` |
| Explicações | Toda informação das telas tem "i" que abre com mouse, teclado e toque | `entrega-final.spec.ts` |

## 3.3 Uso de ferramentas de IA no processo

Ferramentas de IA apoiaram descoberta, revisão de código, sugestão de testes e organização de textos, sempre com revisão humana antes de entrar no repositório. Cálculos financeiros nunca são delegados à IA. A autoria das mudanças é das pessoas da equipe, registrada no histórico de commits.

# 4. Banco de dados e API

## 4.1 Banco de dados (PostgreSQL, migrations Flyway V1–V11)

| Tabela | Função |
|---|---|
| `merchant`, `app_user`, `auth_session` | Loja, pessoas (perfis Gerente, Financeiro, Operador) e sessões revogáveis |
| `login_attempt` | Contagem de senhas erradas e bloqueio (guarda só o hash do e-mail) |
| `password_reset_token` | Links de recuperação (só o hash, validade e uso único) |
| `sale`, `payment` | Venda e pagamento simulado |
| `tax_rule` | Regras de tributo com vigência |
| `split_operation`, `parcel` | Separação em tributo, taxa e líquido, e cada parcela com status |
| `ledger_event` | Registro somente de inserção, com hash anterior e hash do evento |
| `cash_entry` | Entradas e saídas reconhecidas no caixa |
| `expense`, `expense_category` | Despesas pagas e categorias; `tax_credit_cents` guarda o crédito de IBS/CBS da nota (V11) |
| `request_intent` | Idempotência: mesma chave devolve o mesmo resultado |
| `ai_interaction` | Registro das explicações geradas, sem dados sensíveis |
| `credit_consent`, `credit_offer`, `credit_contract`, `credit_installment`, `credit_event`, `credit_webhook_event` | Capital de giro: consentimento revogável, propostas (com os fatos usados e o comprometimento), contratos, parcelas, trilha imutável e avisos do parceiro |

Valores em centavos inteiros; percentuais em pontos-base. A API usa um papel de banco com privilégios mínimos. Migrations V1–V11.

## 4.2 Principais endpoints (`/api/v1`)

| Método e rota | Função |
|---|---|
| POST `auth/register`, `auth/login`, `auth/logout` | Conta e sessão (login informa tentativas restantes e bloqueio) |
| POST `auth/password-reset/request`, `/complete` | Recuperação de conta sem estar logado |
| POST/GET `sales`, GET `sales/{id}` | Venda com split; consulta |
| GET `split-operations`, `split-operations/{id}`; POST `/{id}/reprocess` | Operações, parcelas e retomada |
| GET `ledger?saleId=` | Eventos auditáveis da venda |
| POST/GET `expenses`, GET `expense-categories` | Despesas |
| GET `cash-flow`, `dashboard` | Caixa pelo valor líquido |
| POST `planning/projection` | Projeção manual com aviso de déficit |
| POST `split-payment/simulate` | Simulação sem escrita |
| POST `ai/cash-analysis`, GET `ai/split-explanation/{id}`, POST `ai/expense-category` | Explicações e sugestão revisável |
| GET `reports/{sales,expenses,taxes}` | Relatórios com CSV |
| GET `tax-reform/summary` | Reforma no caixa: imposto retido, créditos das compras, imposto líquido e linhas do pacote do contador |
| GET `credit`; POST/DELETE `credit/consent`; POST `credit/offers`, `credit/offers/{id}/accept`; POST `credit/contracts/{id}/installments/{n}/pay`; GET/POST `credit/contracts/{id}/payoff`; POST `credit/contracts/{id}/cancel`; GET `credit/events`; POST `credit/webhook/{parceiro}` | Capital de giro: diagnóstico, ofertas, contratação, parcelas, quitação, desistência, histórico e webhook |

Erros seguem o formato `{code, message, fieldErrors, correlationId}`. Contrato completo: `backend/docs/API.md` no repositório.

# 5. Capital de giro com parceiros financeiros

O capital de giro é a resposta direta ao problema central. Se o imposto sai na hora da venda e o caixa fica descapitalizado, o comerciante precisa **ver o tamanho do buraco** e **resolver sem sair do app**. O módulo cobre o ciclo inteiro do crédito.

## 5.1 Jornada

| Etapa | O que o comerciante vê e faz |
|---|---|
| Diagnóstico | Situação do caixa (*saudável*, *no limite* ou *falta capital de giro*), **imposto retido por mês pelo split**, saldo atual, falta prevista em 30 dias, cobertura em dias e **recomendação** de valor e parcelas. Sem falta prevista, a recomendação é não contratar |
| Parceiros | Banco e fintech com limite, taxa mensal e CET lado a lado |
| Compartilhamento de dados | Autorização revogável para enviar só totais de 90 dias (entradas líquidas, despesas e número de vendas). Nenhum dado de cliente |
| Comparar ofertas | Uma simulação gera as ofertas de todos os parceiros, ordenadas pelo CET, com o selo *Menor CET* |
| Crédito responsável | Cada oferta mostra quanto a parcela compromete das entradas mensais. Acima de 50%, a contratação é bloqueada |
| Antes e depois | Caixa estimado nas próximas 12 semanas, sem e com a oferta escolhida |
| Contratar | Aceite consciente (valor total, taxa e CET), sem contratar em dobro |
| Gerir o contrato | Próxima parcela e atraso, pagamento em ordem, **quitação antecipada com desconto dos juros futuros**, **desistência em 7 dias sem juros**, resumo para imprimir e cronograma |
| Histórico | Trilha imutável de autorizações, propostas, contratação e pagamentos |
| Caixa | O crédito entra na projeção e as parcelas saem. No déficit, a projeção oferece *Ver opções de capital de giro* |

## 5.2 Regras principais

- Valor de R$ 500,00 até o limite do parceiro (no máximo R$ 50.000,00), em 1 a 12 parcelas pela tabela Price.
- Parceiros simulados: fintech com 2,49% ao mês e limite de 50% das entradas de 90 dias; banco com 1,89% ao mês e limite de 30%.
- CET estimado sem tarifas. Um parceiro real informa o CET oficial.
- Comprometimento: até 20% *saudável*, até 30% *atenção*, até 50% *alto*, acima de 50% *excessivo* (bloqueado).
- Só a pessoa gerente autoriza, contrata, paga, quita e desiste. O perfil financeiro consulta e simula.
- A proposta vale 24 horas. Revogar o consentimento impede novas contratações.

## 5.3 Base regulatória considerada

Quem concede o crédito é a instituição autorizada pelo Banco Central. O Planner mostra, compara, coleta o consentimento e registra. As regras seguem: SCD/SEP (Res. CMN 4.656/2018), correspondentes (Res. CMN 4.935/2021), divulgação do CET (Res. CMN 3.517/2007), informação prévia e liquidação antecipada com redução proporcional dos juros (CDC, art. 52), desistência inspirada no CDC, art. 49, consentimento e minimização de dados (LGPD) e Open Finance Brasil como caminho natural para o consentimento real.

## 5.4 Pronto para parceria

O parceiro é uma peça plugável (`ParceiroCredito`). Para ligar um banco ou fintech real, basta implementar a chamada à API dele e trocar `CREDIT_PARTNER`. Ele confirma os pagamentos por um **webhook assinado com HMAC-SHA256**, idempotente e restrito aos contratos do próprio parceiro. A especificação completa, com fórmulas, API, webhook, dados e testes, está em `documentacao/INTEGRACAO-PARCEIRO-CREDITO.md`.

## 5.5 Reforma no caixa

Além do imposto retido, a Reforma mexe em outras partes do caixa. A tela **Reforma no caixa** cuida delas:

- **Créditos de IBS/CBS das compras:** a despesa ganhou o campo do crédito da nota, que também pode vir do XML da NF-e. A tela mostra o imposto retido, os créditos, o imposto líquido e o crédito acumulado.
- **Preço de venda:** calcula o preço que mantém a margem com o IBS/CBS "por fora", o crédito da compra e a taxa da maquininha.
- **Prazo com fornecedores:** mostra quanto caixa um prazo maior libera, sem juros, e quanto isso cobre da falta prevista.
- **Antecipação de recebíveis:** calcula o desconto e o custo efetivo ao mês e compara com o capital de giro.
- **Pacote do contador:** CSV com o resumo, as vendas e as compras com crédito.

As alíquotas são informadas pela pessoa e nada movimenta dinheiro. As fórmulas e as regras estão em `documentacao/REFORMA-NO-CAIXA.md`.

# 6. Arquitetura e stack

| Camada | Tecnologias |
|---|---|
| Backend | Java 21, Spring Boot 3.5, Spring Security, Bean Validation, Flyway, BCrypt, envio de e-mail por SMTP |
| Banco | PostgreSQL (Supabase em produção; embutido nos testes) |
| Web | React 19, TypeScript, Vite; tema, idiomas e explicações sem dependências externas |
| Android | Kotlin, cliente POS integrado por HTTPS |
| Testes | JUnit, MockMvc, Vitest, Testing Library, Playwright, axe-core |
| Infraestrutura | GitHub e GitHub Actions; API no Render (Docker); site na Vercel |

Smart POS/POS web e painel web → API REST (autenticação, núcleo de split, Planner, explicações) → PostgreSQL. Adaptadores de pagamento e de split são simulados no MVP e podem ser trocados por integrações oficiais sem mudar o núcleo.

**Segurança:** senhas com BCrypt; token opaco, revogável e com validade; autorização por loja e perfil em cada ação; limite de requisições por IP; bloqueio de login no servidor; token de recuperação só como hash e no fragmento da URL; nenhum segredo no repositório; traduções e explicações inseridas como texto, sem HTML.

# 7. Resultados de testes da entrega final

| Bateria | Resultado |
|---|---|
| Backend (`./mvnw test`) | **86 de 86** |
| Frontend unitários (`npm test`) | **154 de 154** |
| Navegador na demonstração (`npm run test:e2e:entrega`) | **25 de 25** — login, recuperação, lembrar de mim, ciclo completo do capital de giro, Reforma no caixa (NF-e, créditos, preço, prazo, antecipação e CSV), tema, idiomas, ícones "i", WCAG A/AA nos dois temas, teclado |
| Navegador contra a API real | **23 de 23**, incluindo o ciclo do capital de giro, a projeção e a NF-e com crédito no resumo da reforma (no `main` antes desta entrega: 0 de 22) |
| CI do GitHub | 12 de 12 verificações |
| Traduções | 1.145 textos em inglês e espanhol; 241 explicações em três idiomas |
| Acessibilidade (axe, 12 telas) | 0 violações nos temas claro e escuro |

Defeitos antigos encontrados e corrigidos: as rotas de recuperação de senha exigiam login, e o banco não permitia à API trocar a senha — a recuperação nunca tinha funcionado.

# 8. Relato do processo

### O que fizemos

- Definição do produto, personas, cenários e backlog; protótipo de alta fidelidade no Figma.
- Implementação do núcleo de split simulado, do Planner (caixa, projeção, simulação, relatórios) e do cliente Android.
- Publicação do site (Vercel) e da API (Render) com banco gerenciado (Supabase).
- Na entrega final: correção do problema central, segurança do login, acessibilidade, idiomas, explicações contextuais, documentação trilíngue e verificações de auditoria.

### Como trabalhamos

Equipe dividida por frentes (produto e design, front-end, código e deploy, entrevistas, pitch), com Trello, Discord e Google Meet; código integrado por Pull Requests no GitHub e validado pelo CI.

### O que aprendemos

- **Problema antes da solução:** o mentor mostrou que descrevíamos o recolhimento do imposto (solução) em vez da dor do comerciante (descapitalização). Separar os dois deixou o produto mais claro.
- Separar o que o MVP entrega do que depende de parceiros e homologação evita promessas que o projeto não cumpre.
- Dinheiro exige idempotência, registro auditável e testes de falha.
- Acessibilidade e idiomas precisam de teste automático; sem isso, textos e contrastes escapam.

### Dificuldades

- Dependência de instituição autorizada para o recolhimento oficial, resolvida com simulação explícita.
- Funcionamento real das maquininhas e do Smart POS; homologação em aparelho físico pendente.
- Comunicação e prazos da equipe na reta final.

# 9. Pendências

| Pendência | Responsável |
|---|---|
| Deploy manual da API no Render com a versão final (aplica as migrations V7 a V11: bloqueio de login, recuperação de senha e capital de giro) | Kássio |
| Configurar o SMTP no Render para o e-mail de recuperação (guia em `documentacao/CONFIGURAR-EMAIL-RECUPERACAO.md`) | Kássio |
| Homologação do aplicativo Android em aparelho físico | Equipe |
| Integração oficial de pagamento e recolhimento (fora do MVP) | Evolução futura |
| Ligar um banco ou fintech parceira ao capital de giro (guia em `documentacao/INTEGRACAO-PARCEIRO-CREDITO.md`) | Parceria futura |
| Cancelamento de vendas | Evolução futura |

---

Planner Comercial · Squad 19 · GrowUp/Senac com Avanade · 2026
