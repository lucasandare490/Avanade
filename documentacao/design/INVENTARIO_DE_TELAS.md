# Inventário de Telas · Planner Comercial

> Documento complementar de `DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md`. Medidas renderizadas com raiz de 14px (1rem = 14px). Marcadores: **[C]** confirmado no código, **[O]** observado, **[M]** medido, **[E]** estimado, **[R]** recomendado, **[NV]** não verificável.

## 5. Inventário das telas

### 5.1 Dashboard web

| # | Tela | Valor de `page` | Arquivo | Shell | Largura máx. do conteúdo | Subestados |
|---|---|---|---|---|---|---|
| W1 | Login | `login` | `pages/LoginPage.tsx` | Tela cheia | Formulário 360px | Erro, carregando |
| W2 | Cadastro | `cadastro` | `pages/CadastroPage.tsx` | Tela cheia | 380px | Erros por campo, carregando |
| W3 | Dashboard | `dashboard` | `pages/DashboardPage.tsx` | Layout | `max-w-5xl` (896px) | Carregando 600ms, período Hoje/7d/30d, alerta dispensável |
| W4 | Operações | `vendas` | `pages/VendasPage.tsx` | Layout | `max-w-4xl` (784px) | Vazio, filtros |
| W5 | Detalhe da operação | `vendas` + `detailOpen` | `pages/VendasPage.tsx` | Layout | `max-w-3xl` (672px) | Somente leitura |
| W6 | Registrar venda | `nova-venda` | `pages/NovaVendaPage.tsx` | Layout | `max-w-md` (392px), centralizado | Botão desabilitado, PIX selecionado, carregando, sucesso |
| W7 | Despesas | `despesas` | `pages/DespesasPage.tsx` | Layout | `max-w-4xl` (784px) | Alerta de vencidas, vazio, filtros |
| W8 | Registrar despesa | `nova-despesa` | `pages/NovaDespesaPage.tsx` | Layout | `max-w-md` (392px), centralizado | Erros, IA carregando, sugestão, sucesso |
| W9 | Fluxo de Caixa | `fluxo-de-caixa` | `pages/FluxoDeCaixaPage.tsx` | Layout | `max-w-5xl` (896px) | Abas Completo/Realizado/Projeção |
| W10 | Simulação de Split Payment | `split-payment` | `pages/SplitPaymentPage.tsx` | Layout | `max-w-lg` (448px), centralizado | Prévia, erros, carregando |
| W11 | Resultado da simulação | `split-resultado` | `pages/SplitResultadoPage.tsx` | Layout | `max-w-lg` (448px), centralizado | Sem dados, IA recolhida, IA carregando, IA expandida |
| W12 | Análise inteligente | `ia-analise` | `pages/IAAnalisePage.tsx` | Layout | `max-w-5xl` (896px) | Sucesso, Carregando, Erro de conexão, Timeout, Sem permissão, Vazio, IA digitando |
| W13 | Configurações | `configuracoes` | `pages/ConfiguracoesPage.tsx` | Layout | `max-w-2xl` (588px), centralizado | 4 abas, "Salvo!", confirmação de saída |

### 5.2 Smart POS

| # | Tela interna (`screen`) | Título no header | Barra inferior | Aviso de responsabilidade |
|---|---|---|---|---|
| P1 | `login` | (sem header) | Não | Não |
| P2 | `home` | Início | Sim | Sim |
| P3 | `sale` | Nova venda | Não | Sim |
| P4 | `processing` | Processando pagamento | Não | Não |
| P5 | `result` | Resultado do split | Não | Inline |
| P6 | `failure` | Atenção na operação | Não | Sim |
| P7 | `operations` | Operações | Não | Sim |
| P8 | `ledger` | Registro da operação | Não | Inline |
| P9 | `cash` | Fluxo de caixa | Não | Sim |
| P10 | `projection` | Projeção | Não | Sim |
| P11 | `expenses` | Despesas | Não | Não |
| P12 | `scenario` | Simular cenário | Não | Inline |
| P13 | `ai` | Explicação da IA | Não | Sim |
| P14 | `alerts` | Alertas | Não | Sim |
| P15 | `settings` | Perfil e configurações | Não | Inline |

Fonte: `POSPage.tsx` linhas 100 a 107 (títulos), 317 a 326 (aviso e barra inferior) **[C]**.

## 16. Estrutura individual das telas

Convenções: medidas renderizadas (raiz 14px); "fixo" significa que não rola; no Layout apenas o `main` rola. As capturas de referência estão em `capturas.zip` com o prefixo `desktop_`, `tablet_` ou `mobile_` e o número indicado.

### 16.0 Shell comum (Layout), telas W3 a W13

```
┌──────────────┬───────────────────────────────────────────────────────────┐
│ SIDEBAR 210px│ HEADER 49px  [☰ <1024] data por extenso (≥640)  🔔  [MS] Maria Silva │
│ #0F2544      ├───────────────────────────────────────────────────────────┤
│ Logo 64px    │ MAIN  (overflow-y:auto, padding 14px / 21px ≥1024)        │
│ Card estab.  │   ┌ conteúdo da página (max-w por tela, à esquerda ou     │
│ Grupos/itens │   │ centralizado)                                          │
│   (rola)     │   └                                                        │
│ ── Sair ──   │                                                           │
└──────────────┴───────────────────────────────────────────────────────────┘
Fixos: sidebar, header.  Rola: main.  Fundo do main: #F0F4F8.
```

### 16.1 W1 · Login

| Item | Especificação |
|---|---|
| Finalidade | Autenticação simulada (qualquer e-mail e senha) |
| Arquivo | `src/pages/LoginPage.tsx` |
| Capturas | `01_login`, `02_login_erro`, `03_login_loading` |
| Estrutura | `min-h-screen flex`, fundo `#F0F4F8`. Esquerda: painel de marca 420px (somente ≥1024px). Direita: coluna centralizada de 360px |

```
┌──────────── 420px #0F2544, p 42px ───────────┬─────────── flex-1, centro ───────────┐
│ [logo 35px] Planner Comercial (Inter 15.75/700)│        (mobile: logo 31.5px + nome)  │
│             Gestão financeira… (10.5 #93C5FD)  │  h1 "Entrar na sua conta" 21px       │
│                                                │  p 12.25 #64748B   (mb 28px)         │
│ h2 21px branco: Controle suas vendas. /        │  [erro global, se houver]            │
│   Entenda seu caixa. / Planeje melhor.(#93C5FD)│  E-mail  [✉ campo 37px]              │
│ 01 Fluxo de caixa em tempo real                │  Senha   [🔒 campo 37px 👁]           │
│ 02 Simulação de Split Payment                  │  [☑ Lembrar acesso]  Esqueci minha… │
│ 03 Análise inteligente                         │  [ Entrar  (lg, 35px, largura total)]│
│                                                │  ───────── ou ─────────              │
│ (círculos decorativos 5%)                      │  Não tem conta? Criar conta          │
│ © 2024 Planner Comercial · MVP v1.0 · Dados…   │  [Acesso demonstrativo, azul, mt 28] │
└────────────────────────────────────────────────┴──────────────────────────────────────┘
```

| Detalhe | Valor |
|---|---|
| Marcadores 01, 02, 03 | Quadrado 31.5px, raio 20px, fundo branco 8%. **Texto herda `#0F172A` sobre o fundo escuro, contraste 1.46:1** (quase invisível, ver captura) **[O][C]** |
| Espaço entre tagline e lista | `mb-10` (35px) declarado, **0px renderizado** (regra global de títulos). Na captura, "Planeje melhor." encosta no item 01 **[O][M]** |
| Espaço entre h1 e subtítulo | `mb-1` declarado, 0px renderizado **[M]** |
| Divider "ou" | Encosta no botão Entrar (sem margem superior) **[O]** |
| Checkbox | Nativo, `accent-[#1E54B7]`, 12.25px, marcado por padrão, sem efeito |
| Responsivo | <1024px: painel de marca oculto, logo e nome aparecem acima do formulário. A coluna do formulário mantém 360px e padding lateral 21px |
| Estados | Erro global (W1-e): caixa vermelha acima do formulário. Carregando: spinner no botão por 1000ms |
| Relações | Entrar → Dashboard (W3). Criar conta → Cadastro (W2) |

### 16.2 W2 · Cadastro

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/CadastroPage.tsx` · Capturas `04_cadastro`, `05_cadastro_erros` |
| Estrutura | Página centralizada, coluna de 380px, padding 14px × 42px |
| Ordem | Cabeçalho (botão voltar 31.5px branco com borda + `h1` 17.5px "Criar conta" + "Planner Comercial · MVP demonstrativo" 10.5px) → 5 campos → texto de termos 10.5px `#94A3B8` com links `#1E54B7` → botão "Criar conta" lg → "Já tem conta? Entrar" |
| Campos | Seu nome *, Nome do estabelecimento *, E-mail *, Senha * (dica "Mínimo 8 caracteres."), Confirmar senha *; ícone de olho nos campos de senha, alternando ambos |
| Estados | Erros por campo (borda vermelha + mensagem). Carregando 1200ms |
| Relações | Voltar ou "Entrar" → Login. Sucesso → Dashboard |
| Particularidade | Não há painel de marca; é visualmente distinta do Login |

### 16.3 W3 · Dashboard

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/DashboardPage.tsx` · Capturas `06_dashboard_loading`, `07_dashboard`, `08_dashboard_hoje`, `09_sidebar_mobile_aberta` |
| Largura | `max-w-5xl` (896px), alinhado à esquerda, `space-y-5` |

```
┌ Olá, Maria [DADOS DEMONSTRATIVOS]                         [Hoje|7 dias|30 dias] ┐
│ Acompanhe o split de cada operação e o caixa líquido.                            │
├ Núcleo de Split Payment                                              (SIMULADO) ┤
│ Separação, roteamento e registro das operações                                   │
├ [TOTAL BRUTO primary] [TRIBUTO SEPARADO warning] [TAXAS default] [VALOR LÍQ. success] ┤  grid 2→4 col
├ [Composição do bruto  2/5]                 [Últimas operações  3/5]             ┤  grid 1→5 col
│  barra 14px 10%|2%|88% + legenda + nota      OP-0184 / OP-0183 / OP-0182        │
├ Planner financeiro                                                               ┤
├ [SALDO ATUAL primary] [SALDO PROJETADO] [ENTRADAS success] [DESPESAS default*] ┤  grid 2→4 col
├ [Vendas líquidas por período · gráfico de área 180px · legenda]                  ┤
├ [AlertBanner warning "Atenção ao fluxo de caixa"  ✕]                             ┤  dispensável
├ [AIAnalysisCard: texto + 2 AIInsightCards + "Ver análise completa →"]           ┤
└ AÇÕES RÁPIDAS  [+ Registrar venda][− Registrar despesa][% Simular][↗ Ver fluxo]  ┘  grid 2→4 col
```

| Detalhe | Valor |
|---|---|
| Saudação | `h1` 17.5px + `DemoDataBadge`; subtítulo 12.25px `#64748B`. Coluna no mobile, linha a partir de 640px |
| Selo SIMULADO | Span próprio: `#E0F2FE` + `#075985`, 10px/700, `px-2.5 py-1` (diferente do `Badge info`) |
| KPIs do núcleo | Valores fixos: R$ 52.800,00; R$ 5.280,00; R$ 1.056,00; R$ 46.464,00. Não mudam com o período |
| KPIs do planner | Mudam com o período (`periodData`): 30d = 17.300 / 27.200 / 52.800 / 35.500. Card "Despesas" vira `warning` se despesas/entradas > 0,8. Com os dados atuais nenhum período atinge o limite (Hoje 0,38; 7 dias 0,60; 30 dias 0,67), portanto o card sempre aparece como `default` **[C]** |
| Últimas operações | Linhas em grade `1fr auto auto`, 3 itens fixos; "Bruto" e "Líquido" em `small` `#94A3B8`; status colorido sem badge |
| Gráfico | `AreaChart` com os 14 últimos pontos de `mockCashFlow` (17/09 a 30/09), eixo X a cada 4 rótulos, eixo Y em "k" com 32px. Legenda manual "Saldo", "Entradas", "Projeção" (tracejada), **mas não existe série de projeção nem diferenciação visual dos pontos projetados no gráfico** **[C][O]** |
| Ações rápidas | Quatro botões de cor própria; o quarto (`#F0F4F8`) tem a **mesma cor do fundo da página**, parecendo um texto solto **[O]** |
| Carregando | `LoadingOverlay` por 600ms sempre que a página monta |
| Responsivo | KPIs 2 colunas abaixo de 1024px; composição e últimas operações empilham; ações rápidas 2 colunas abaixo de 640px. Em 375px os valores dos KPIs extrapolam o card **[O]** |
| Relações | Ver todas / linhas → Operações; Ver completo → Fluxo; Ver análise → Análise com IA; ações rápidas → Nova venda, Nova despesa, Simulação, Fluxo |

### 16.4 W4 · Operações

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/VendasPage.tsx` · Capturas `10_operacoes`, `11_operacoes_vazio` |
| Largura | `max-w-4xl` (784px) |
| Ordem | PageHeader ("Operações", "10 registros de split", ações: `Badge info` SIMULADO, DemoDataBadge, Exportar outline sm, Nova operação primary sm com ícone +) → card de filtros (`Card sm`, `flex-wrap gap-3`: busca com lupa `min-w 180px flex-1`, Select período `min-w 160px`, Select pagamento `min-w 160px`, 4 chips de status) → linha "Total bruto confirmado:" com valor verde 14px mono → tabela → nota de responsabilidade |
| Tabela | `Card padding="none"`. Cabeçalho em grade `1fr auto auto auto auto`, `px-4 py-2.5`, borda inferior `#F1F5F9`. Linhas `button` com `px-4 py-3`, divisória `#F8FAFC`, hover `#F8FAFC`. Colunas: descrição (12.25px truncada + cliente 10.5px + Badge sm do pagamento), data 10.5px, bruto 12.25px/600 mono, líquido (bruto × 0,88) verde, status Badge sm |
| Status | Concluída (success), Pendente (warning), Falha (danger; bruto riscado e cinza, líquido R$ 0,00) |
| Filtro de período | Visual apenas; o valor não é aplicado ao filtro **[C]** |
| Vazio | `EmptyState` "Nenhuma venda encontrada" + botão "Registrar venda" |
| Responsivo | Em 375px a grade comprime a descrição a 1 ou 2 letras e o badge "Pendente" ultrapassa a borda direita **[O]** (captura `mobile_10_operacoes`). Não há rolagem horizontal nem layout em cartões |
| Relações | Linha → W5. Nova operação → W6 |

### 16.5 W5 · Detalhe da operação

| Item | Especificação |
|---|---|
| Arquivo | `VendasPage.tsx` linhas 47 a 84 · Captura `12_operacao_detalhe` |
| Largura | `max-w-3xl` (672px) |
| Ordem | PageHeader com voltar ("Detalhe da operação", "Registro auditável · somente leitura", `Badge info` SIMULADO) → aviso azul 10.5px `#1E3A8A` com ID e chave de idempotência → 4 cards `sm` (Bruto, Tributo IBS/CBS laranja, Taxa, Líquido verde; valores 15.75px mono) em grade 2→4 → card "Destinos e status das parcelas" (3 linhas `1fr auto`, "Confirmada" verde) → card "Linha do tempo do registro" (5 eventos com borda esquerda 2px `#BFDBFE`, `pl-4 py-2`, 12.25px) → nota de responsabilidade |
| Particularidade | Títulos `h2` sem cor definida (herdam `#0F172A`) e sem margem até o conteúdo |

### 16.6 W6 · Registrar venda

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/NovaVendaPage.tsx` · Capturas `13`, `14`, `15` |
| Largura | `max-w-md` (392px), centralizado |
| Ordem | PageHeader com voltar → Card "Valor da venda" (`CurrencyInput lg`, 44px) → Card "Forma de pagamento" (grade 2 colunas `gap-2.5`, 5 botões com emoji 21px + rótulo 12.25px; dica PIX) → Button xl "Registrar venda" (desabilitado até preencher) |
| Sucesso | `SuccessScreen` em `max-w-sm` com `pt-8`: "Venda registrada", "R$ {valor digitado}", "Forma de pagamento: X", botões "Nova venda" e "Voltar para vendas" |
| Particularidade | O título do card encosta no campo (margem anulada) **[O]** |

### 16.7 W7 · Despesas

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/DespesasPage.tsx` · Captura `16_despesas` |
| Largura | `max-w-4xl` |
| Ordem | PageHeader ("Despesas", "10 registros", DemoDataBadge, "Nova despesa") → alerta de vencidas (`role="alert"`, `#FEF2F2`/`#FCA5A5`, ícone "!" 28px `#FEE2E2`, título `#991B1B`, total `#DC2626`, botão danger sm "Ver" que aplica o filtro) → filtros (busca, Select categoria, chips Todas/Pagas/Pendentes/Vencidas) → "Total filtrado:" em vermelho → tabela `1fr auto auto auto` (descrição + Badge categoria + Badge info "Recorrente"; data; valor; status Pago/Pendente/Vencido) |
| Diferenças em relação a Operações | Linhas são `div` (não clicáveis); cabeçalho "Data" alinhado à esquerda; sem nota de responsabilidade; sem selo SIMULADO |

### 16.8 W8 · Registrar despesa

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/NovaDespesaPage.tsx` · Capturas `17`, `18`, `19` |
| Largura | `max-w-md`, centralizado, `space-y-4` |
| Ordem | PageHeader com voltar → Card "Dados da despesa": Descrição * (input inline + botão "Sugerir categoria") → [caixa de sugestão da IA] → Valor * (`CurrencyInput md`) → Categoria * (Select, 11 opções incluindo placeholder) → grade 2 colunas: Data (`date`, hoje) + Status ("Já pago", "A pagar") → linha "Despesa recorrente / Repetir mensalmente" + Toggle, com borda superior `#F1F5F9` e `py-3` → Button lg "Registrar despesa" |
| Particularidade | Campo de descrição implementado fora do componente `Input`, com rótulo sem `htmlFor` |

### 16.9 W9 · Fluxo de Caixa

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/FluxoDeCaixaPage.tsx` · Capturas `20_fluxo_caixa`, `21_fluxo_realizado` |
| Largura | `max-w-5xl` |
| Ordem | PageHeader ("Fluxo de Caixa", "Setembro 2024", SIMULADO + DemoDataBadge) → 4 StatCards (Saldo atual primary, Saldo projetado com tendência "+57%", Entradas success, Saídas warning) → legenda manual (quadrados 10.5px `#86EFAC` e `#FCA5A5`, linha `#1E54B7`, separador e linha tracejada `#CBD5E1`) → Card do gráfico (título + `Tabs` Completo/Realizado/Projeção; etiqueta "REALIZADO → ← PROJEÇÃO" somente em Completo; `ComposedChart` 260px com barras e linha, dois eixos Y: esquerdo "k" 30px, direito "R$…k" 40px) → grade 1→2 colunas: card "Realizado" e card "Projeção" (borda tracejada, aviso âmbar, linhas com opacidade 80%) → card "Resumo semanal" com `<table>` real (6 colunas, rolagem horizontal em `overflow-x-auto`, linhas projetadas com opacidade 70% e etiqueta cinza) → nota |
| Particularidades | A linha tracejada de projeção da legenda **não tem correspondente no gráfico** **[O]**. As colunas das listas Realizado/Projeção não têm cabeçalho **[O]**. Saídas usam o card `warning` (âmbar) enquanto no restante da tela saídas são vermelhas |
| Responsivo | A legenda de 4 itens não quebra linha (`flex` sem `wrap`) e pode exceder 375px **[C]**. A tabela rola horizontalmente |

### 16.10 W10 · Simulação de Split Payment

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/SplitPaymentPage.tsx` · Captura `22_split` |
| Largura | `max-w-lg` (448px), centralizado |
| Ordem | PageHeader (SIMULADO) → Card intro (ícone "%" 35px `#EFF6FF`, raio 20px, "O que é esta simulação?") → `FinancialSimulationDisclaimer` completo → Card "Parâmetros da simulação" (CurrencyInput "Valor da operação" com dica, campo de percentual com "%" à direita e dica, prévia `#F8FAFC` com 3 linhas) → Card `sm` "Contexto: Split Payment" (`h4` uppercase) → Button xl "Simular impacto" |
| Valores iniciais | Valor "150,00", percentual "10" |
| Prévia | Atualiza a cada digitação: valor, "− R$ x" em `#DC2626`, "Estimativa disponível" em `#16A34A` bold |

### 16.11 W11 · Resultado da simulação

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/SplitResultadoPage.tsx` · Capturas `23`, `24`, `25` |
| Largura | `max-w-lg`, centralizado |
| Ordem | PageHeader com voltar (SIMULADO) → disclaimer compacto → Card "Simulação do fluxo da operação" (3 caixas empilhadas e centralizadas, padding 14px, raio 20px: neutra `#F8FAFC`, vermelha `#FEF2F2`/`#FCA5A5`, verde `#F0FDF4`/`#BBF7D0`; valores 26.25px/700 mono; setas SVG 20×24px entre elas com `my-3`; aviso âmbar "Resultado exclusivamente simulado") → Card `sm` "Efeito em escala · 89 vendas simuladas" (grade de 3 colunas com valores no formato compacto `R$ x,yk` de `formatCurrency(v, true)`) → Card IA "O que isso significa?" (recolhido, carregando, expandido com 3 itens 01 a 03) → disclaimer completo → dois botões `flex-1`: "Ajustar simulação" (outline) e "Análise com IA →" (primary) |
| Sem dados | Texto centralizado "Nenhuma simulação encontrada." + botão "← Simular" |
| Particularidade | A segregação usa vermelho (`#DC2626`), enquanto no Dashboard e no POS o tributo usa âmbar/laranja |

### 16.12 W12 · Análise inteligente

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/IAAnalisePage.tsx` · Capturas `26` a `33` |
| Largura | `max-w-5xl` |
| Ordem | PageHeader (DemoDataBadge) → aviso fixo âmbar `sticky top-0 z-10` (10.5px `#92400E`, raio 20px) → seletor "Estado da IA (demo)" com 6 chips → conteúdo por estado |
| Sucesso | Grade 1→3 colunas, `gap-5`. Coluna 1: Card "Resumo" (texto, "NÍVEL DE ATENÇÃO" + Badge warning "Moderada", "PRINCIPAIS PONTOS" com "·", "RECOMENDAÇÕES" com "→" `#1E54B7`, duas notas 10px) + Card `sm` "INSIGHTS DETECTADOS" com 4 AIInsightCards. Colunas 2 e 3: card de chat com altura fixa de 480px (header com avatar 28px, título, subtítulo, Badge "Online"; mensagens roláveis com `space-y-4`; bolha da IA à esquerda `#F8FAFC` com borda e canto inferior esquerdo 6px; bolha do usuário à direita `#0F2544` branca com canto inferior direito 6px; largura máxima 80%; campo de pergunta `#F8FAFC` raio 20px 33.5px de altura + botão enviar 31.5px) → Card `sm` "SUGESTÕES DE PERGUNTAS" (5 chips) → bloco "Como funciona a análise" (5 etapas em caixas brancas ligadas por "→") |
| Outros estados | Carregando (cabeçalho + `AITypingIndicator`), Erro de conexão ("IA indisponível, exibindo análise convencional." + Tentar novamente), Timeout, Sem permissão, Vazio. Timeout e Sem permissão não têm o cabeçalho com ícone |
| Comportamento | Enter envia; a lista não rola automaticamente até a última mensagem **[C]** |
| Responsivo | Abaixo de 1024px as colunas empilham; o chat mantém 480px de altura |

### 16.13 W13 · Configurações

| Item | Especificação |
|---|---|
| Arquivo | `src/pages/ConfiguracoesPage.tsx` · Capturas `34` a `38` |
| Largura | `max-w-2xl` (588px), centralizado |
| Ordem | PageHeader → barra de abas (`#F1F5F9`, raio 20px, padding 3.5px, `overflow-x-auto`; abas `px-3 py-2` 28px de altura, raio 14px) → conteúdo da aba → bloco "Limite de responsabilidade" azul |
| Aba "Dados do estabelecimento" | Nome, CNPJ, Endereço, Cidade + Estado (2 colunas), Segmento (Select), Regime tributário (Select), "Salvar alterações" |
| Aba "Dados da conta" | Avatar 49px raio 14px "MS" `#1E3A5F` 15.75px/700 + nome 14px/600 + e-mail + pílula "Plano Gratuito · MVP"; Nome + Sobrenome, E-mail, Telefone, "Salvar dados" |
| Aba "Preferências" | "NOTIFICAÇÕES": 3 linhas com Toggle; "APARÊNCIA": Tema escuro (Toggle sem efeito, "Em desenvolvimento") |
| Aba "Segurança" | Card "Alterar senha" (3 campos, `space-y-3`), Card "Sessão ativa", Card "Sair da conta" com confirmação inline |
| Responsivo | Em 375px a barra de abas rola horizontalmente (`flex-shrink-0`) |

### 16.14 Smart POS (P1 a P15)

**Moldura.** `pos-shell mx-auto flex h-screen max-h-[760px] min-h-[640px] w-full max-w-[360px] flex-col overflow-hidden bg-slate-50 shadow-2xl` **[C]**. Centralizada na página, sem o Layout. Em telas com altura maior que 760px a moldura fica com 760px e o restante é fundo `#F0F4F8` **[O]**. O login (P1) não tem moldura com altura limitada nem sombra: ocupa `min-h-screen` com padding 21px × 28px.

```
┌──────────── 360px ────────────┐
│ HEADER #123463  67px          │  [PC 35px | ← 42px] Mercadinho São João (16px blue-200)
│                               │                     Título (15.75px/600)   [SIMULADO]
├───────────────────────────────┤
│ MAIN  overflow-y:auto         │  padding 14px; space-y-4
│  … conteúdo da tela …         │
│  [Aviso de responsabilidade]  │  slate-100, 16px, raio 20px
├───────────────────────────────┤
│ NAV (só em Início) 57px       │  Início | Operações | Simular | Alertas | Perfil
└───────────────────────────────┘
```

| Tela | Composição (de cima para baixo) |
|---|---|
| P1 Login | Botão texto "← Dashboard web" (42px) → quadrado "PC" 49px `#1F4E9E` raio 14px → "PLANNER COMERCIAL" 16px/700 `#1F4E9E` espaçamento 0.16em → `h1` "Acesse o Smart POS" 26.25px → descrição → E-mail e Senha (`min-h-12` = 42px, raio 20px, borda `slate-300`, rótulo 16px/600 envolvendo o campo) → erro (`red-50`/`red-200`/`red-700`) → "Entrar" 49px `#1F4E9E` raio 20px → "Demonstração: senha 123456" |
| P2 Início | Card `#1F4E9E` raio 14px padding 17.5px ("Líquido disponível hoje" + SIMULADO, valor 26.25px/700, divisória branca 15%, grade 2 colunas Total bruto / Tributo separado em `orange-300`) → botão "Nova venda" 56px → 3 atalhos 56px → card "Últimas vendas" (2 linhas de 56px) → botão de alertas âmbar 49px com seta → aviso → barra inferior |
| P3 Nova venda | Campo de valor 70px com borda 2px `#1F4E9E`, raio 14px, "R$" 15.75px + valor 26.25px/700 → Select "Forma de pagamento" 49px (PIX, Cartão, Dinheiro) → Select "Categoria do tributo" 49px → caixa `sky-50` com SIMULADO → "Cobrar R$ x" 56px → "Demonstrar fluxo com falha" texto vermelho |
| P4 Processando | Círculo 56px com borda 4px `blue-100` e topo `#1F4E9E`, `animate-pulse` (pulsa, não gira) → "Não retire o cartão…" → 5 etapas de 49px (pendente: branco + `slate-400`; concluída: `green-50`/`green-200`/`green-800` + ícone check) |
| P5 Resultado | Card `#123463` central (SIMULADO, "Valor bruto", 31.5px/700) → 3 parcelas (laranja, cinza, verde) com destino e "Parcela roteada · Confirmada" → "Soma das parcelas · R$ 150,00 = bruto" (azul) → Ver registro (49px) → Explicar com IA (contorno, 42px) → Nova venda (texto) → aviso |
| P6 Falha | Caixa `red-50` com ícone de alerta, título 17.5px "Falha ao rotear uma parcela" → card branco com borda `red-300` "Taxa de processamento · FALHA" → "Reprocessar" `red-700` 56px → "Ver registro preservado" → nota sobre idempotência |
| P7 Operações | 2 selects lado a lado (período sem efeito, status funcional) → legenda com SIMULADO → cartões por operação (bruto, ID · hora, pílula de status; divisória; Líquido em verde) |
| P8 Registro | Aviso azul "Registro somente leitura" → tabela chave/valor 6 linhas de 42px → "Destinos e status" com borda esquerda 4px `green-500` → "Linha do tempo" com borda esquerda 1px `blue-300` → aviso |
| P9 Caixa | Select período → card `#1F4E9E` "Saldo líquido" → grade 2 (Entradas `green-50`, Saídas `amber-50`) → aviso de inconsistência âmbar → "Ver projeção" (branco, sem borda) |
| P10 Projeção | Card `#123463` com selo `amber-400` "Atenção média" → grade 2 (Receitas `green-50`, Despesas `orange-50`) → "Tendência do saldo" com 7 barras `blue-200` em 112px → "Ver alertas" |
| P11 Despesas | Card "Cadastrar despesa" (Descrição, Valor + Data em 2 colunas, sugestão da IA azul, Categoria, "Salvar despesa" sem ação) → "Últimas despesas" |
| P12 Simular cenário | Caixa `sky-50` SIMULADO → Valor (49px) → Percentual (49px) → card com "Valor do split simulado" (`orange-700`) e "Valor disponível estimado" (`green-700`). Campos sem efeito no resultado **[C]** |
| P13 IA | Aviso fixo âmbar `sticky` → alternância Sucesso/Fallback → card azul "Nível de atenção: baixo" + recomendações, ou card de fallback |
| P14 Alertas | 3 cartões: âmbar, vermelho, azul |
| P15 Perfil | Card Comerciante, card Dispositivo ("POS-REC-0042", "Conectado" verde), aviso, "Sair do Smart POS" (contorno vermelho), "Voltar ao dashboard web" |

## 17. Navegação

### 17.1 Mecanismo

| Item | Implementação |
|---|---|
| Roteamento | Estado React `page` em `App.tsx` (13 valores). Sem React Router, sem URL, sem `history.pushState` **[C]** |
| Autenticação | `authenticated` booleano. Se falso, qualquer `page` (exceto `cadastro`) mostra o Login |
| Passagem de dados | `simulationData` guardado em `App` e entregue ao Resultado da simulação |
| Subtelas | Estados locais: `detailOpen` (Operações), `success` (Nova venda, Nova despesa), `tab` (Configurações), `aiState` (IA), `screen` + `history` (POS) |
| Persistência | Nenhuma. Recarregar a página volta ao Login e perde qualquer dado digitado |
| Rolagem | Ao trocar de página o `main` não volta ao topo (não há `scrollTo`) **[C]** |

### 17.2 Mapa de navegação do dashboard web

```
Login ──Criar conta──▶ Cadastro ──Voltar/Entrar──▶ Login
  │                       │
  └──Entrar──▶ Dashboard ◀┘ (sucesso do cadastro)
                │
   Sidebar: Dashboard · Operações · Despesas · Fluxo de Caixa · Simulação Split
            Análise com IA · Configurações · Modo POS · Sair(→Login)
                │
   Operações ──linha──▶ Detalhe ──voltar──▶ Operações
   Operações ──Nova operação──▶ Registrar venda ──sucesso──▶ (Nova venda | Voltar para vendas)
   Despesas ──Nova despesa──▶ Registrar despesa ──sucesso──▶ (Nova despesa | Voltar para despesas)
   Simulação ──Simular impacto──▶ Resultado ──Ajustar──▶ Simulação
                                           └─Análise com IA──▶ Análise inteligente
   Header: avatar ──▶ Configurações
   Configurações ▸ Segurança ▸ Sair ▸ Confirmar ──▶ Login
   Modo POS ──▶ POS (tela cheia) ──Dashboard web / Voltar ao dashboard web──▶ Dashboard
```

### 17.3 Mapa de navegação do POS

```
Login ─Entrar─▶ Início ─Nova venda─▶ Nova venda ─Cobrar─▶ Processando ─▶ Resultado ─Ver registro─▶ Registro
                  │                              └─Demonstrar falha─▶ Processando ─▶ Falha ─Reprocessar─▶ Processando ─▶ Resultado
                  ├─ Operações ─item─▶ Registro         Resultado ─Explicar com IA─▶ IA
                  ├─ Caixa ─Ver projeção─▶ Projeção ─Ver alertas─▶ Alertas
                  ├─ Despesas
                  └─ Barra inferior: Início · Operações · Simular · Alertas · Perfil ─Sair─▶ Login
Todas as telas internas: botão ← no header (pilha history)
```

### 17.4 Indicação de localização

| Local | Indicação |
|---|---|
| Sidebar | Item ativo com fundo `#2563EB`. Subtelas herdam o item do pai: Registrar venda não destaca nenhum item (o `page` é `nova-venda`, que não está no menu) **[C]**. O mesmo ocorre em Registrar despesa e Resultado da simulação |
| Título | `h1` do PageHeader |
| POS | Título no header; item ativo da barra inferior em `#1F4E9E` (a barra só existe na tela Início) |
| Breadcrumbs | Não existem |
