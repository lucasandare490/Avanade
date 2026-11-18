# Documentação Completa do Frontend e Design System

## Planner Comercial · MVP de Design (Figma Make)

---

## 1. Capa e identificação do projeto

| Campo | Valor |
|---|---|
| Produto | Planner Comercial |
| Artefato analisado | Protótipo de alta fidelidade "Planner Comercial MVP Design" gerado no Figma Make |
| Arquivo Figma Make | `tJXFL2o4nYoZnZARUCkBLQ` (nó de código `0:6`) |
| Exportação analisada | `Planner Comercial MVP Design.make` e pasta `Planner Comercial MVP Design.make_FILES`, exportados em 2026-10-23T22:54Z (`meta.json`) |
| Commit de código analisado | `508e5def93168a95d14c58b8cb57fe876ae5548a` (branch `main`, reconstruído a partir de `make_repos/4rpj9m.zip`) |
| Contexto acadêmico | GROWUP-SENAC-N2, Squad 19, empresa parceira Avanade |
| Responsável pela documentação de design | Thayná Batista da Silva (Design e Prototipação, pesquisa e documentação de requisitos) |
| Data da análise | 23/10/2026 |
| Versão deste documento | 1.0 |

### 1.1 Legenda de rastreabilidade usada em todo o documento

| Marcador | Significado |
|---|---|
| **[C]** Confirmado no código | Valor ou comportamento lido diretamente nos arquivos-fonte ou no CSS compilado. |
| **[O]** Observado na interface | Constatado na interface renderizada (capturas automatizadas com Chromium, seção 3). |
| **[M]** Medido | Valor obtido por `getComputedStyle` e `getBoundingClientRect` na interface renderizada. É um tipo de observação com número exato. |
| **[E]** Estimado | Valor aproximado que não pôde ser confirmado diretamente. |
| **[R]** Recomendado | Sugestão técnica. Não faz parte da implementação atual. |
| **[NV]** Não verificável | Não foi possível determinar com os recursos disponíveis. |

### 1.2 Convenção de unidades (leitura obrigatória)

O arquivo `src/index.css` define `html, body { font-size: 14px; }` **[C]**. Como o Tailwind CSS v4 expressa espaçamentos, tamanhos de texto, larguras de contêiner e o raio `2xl` em `rem`, **todos esses valores renderizam a 87,5% do padrão do Tailwind** (1rem = 14px, não 16px) **[M]**. Media queries são exceção: `rem` em media query usa o tamanho padrão do navegador (16px), portanto os breakpoints permanecem em 640px e 1024px **[C][O]**.

Por isso, sempre que possível, este documento apresenta três colunas: a **classe Tailwind**, o **valor CSS declarado** e o **valor renderizado em px**. Para reproduzir a interface em outra tecnologia, use o valor renderizado em px.

| Classe | Declarado | Renderizado (raiz 14px) |
|---|---|---|
| Unidade de espaçamento (`--spacing`) | 0.25rem | 3.5px |
| `p-4`, `gap-4`, `w-4` | 1rem | 14px |
| `text-sm` | 0.875rem | 12.25px |
| `text-xs` | 0.75rem | 10.5px |
| `rounded-2xl` | 1rem | 14px |
| `max-w-5xl` | 64rem | 896px |
| `sm:` / `lg:` | 40rem / 64rem em media query | 640px / 1024px |

---

## Índice

- [Planner Comercial · MVP de Design (Figma Make)](#planner-comercial--mvp-de-design-figma-make)
- [1. Capa e identificação do projeto](#1-capa-e-identificação-do-projeto)
   - [1.1 Legenda de rastreabilidade usada em todo o documento](#11-legenda-de-rastreabilidade-usada-em-todo-o-documento)
   - [1.2 Convenção de unidades (leitura obrigatória)](#12-convenção-de-unidades-leitura-obrigatória)
- [2. Objetivo e escopo da documentação](#2-objetivo-e-escopo-da-documentação)
   - [2.1 Objetivo](#21-objetivo)
   - [2.2 Dentro do escopo](#22-dentro-do-escopo)
   - [2.3 Fora do escopo](#23-fora-do-escopo)
- [3. Metodologia de análise](#3-metodologia-de-análise)
   - [3.1 Limitações conhecidas](#31-limitações-conhecidas)
- [4. Visão geral do frontend](#4-visão-geral-do-frontend)
   - [4.1 Natureza do protótipo](#41-natureza-do-protótipo)
   - [4.2 Módulos](#42-módulos)
   - [4.3 Hierarquia de navegação](#43-hierarquia-de-navegação)
   - [4.4 Dados exibidos](#44-dados-exibidos)
- [5. Inventário das telas](#5-inventário-das-telas)
   - [5.1 Dashboard web](#51-dashboard-web)
   - [5.2 Smart POS](#52-smart-pos)
- [6. Sistema de design](#6-sistema-de-design)
   - [6.1 Onde o sistema está definido](#61-onde-o-sistema-está-definido)
   - [6.2 Princípios visuais observados](#62-princípios-visuais-observados)
   - [6.3 Regras de cascata que alteram o resultado visual](#63-regras-de-cascata-que-alteram-o-resultado-visual)
- [7. Paleta de cores](#7-paleta-de-cores)
   - [7.1 Resumo](#71-resumo)
   - [7.2 Tokens declarados em `@theme` (`src/index.css`)](#72-tokens-declarados-em-theme-srcindexcss)
   - [7.3 Inventário completo de cores do dashboard web](#73-inventário-completo-de-cores-do-dashboard-web)
   - [7.4 Paleta nomeada do Tailwind usada no Smart POS](#74-paleta-nomeada-do-tailwind-usada-no-smart-pos)
   - [7.5 Cores com transparência e sobreposição](#75-cores-com-transparência-e-sobreposição)
   - [7.6 Cores de gráficos (Recharts)](#76-cores-de-gráficos-recharts)
- [8. Tipografia](#8-tipografia)
   - [8.1 Famílias](#81-famílias)
   - [8.2 Escala tipográfica renderizada](#82-escala-tipográfica-renderizada)
   - [8.3 Estilos tipográficos identificados (dashboard web)](#83-estilos-tipográficos-identificados-dashboard-web)
   - [8.4 Estilos tipográficos do Smart POS](#84-estilos-tipográficos-do-smart-pos)
   - [8.5 Transformações, alinhamento e quebras](#85-transformações-alinhamento-e-quebras)
   - [8.6 Diferenças por dispositivo](#86-diferenças-por-dispositivo)
- [9. Espaçamentos e dimensões](#9-espaçamentos-e-dimensões)
   - [9.1 Escala de espaçamento](#91-escala-de-espaçamento)
   - [9.2 Ritmo vertical por contexto](#92-ritmo-vertical-por-contexto)
   - [9.3 Espaçamentos internos (padding) de componentes](#93-espaçamentos-internos-padding-de-componentes)
   - [9.4 Dimensões fixas](#94-dimensões-fixas)
   - [9.5 Larguras máximas de conteúdo](#95-larguras-máximas-de-conteúdo)
   - [9.6 Dimensões dependentes de conteúdo ou viewport](#96-dimensões-dependentes-de-conteúdo-ou-viewport)
- [10. Bordas e sombras](#10-bordas-e-sombras)
   - [10.1 Bordas](#101-bordas)
   - [10.2 Raios](#102-raios)
   - [10.3 Sombras](#103-sombras)
   - [10.4 Separadores](#104-separadores)
- [11. Ícones, imagens e recursos visuais](#11-ícones-imagens-e-recursos-visuais)
   - [11.1 Biblioteca de ícones](#111-biblioteca-de-ícones)
   - [11.2 Inventário de ícones SVG](#112-inventário-de-ícones-svg)
   - [11.3 Glifos de texto e emojis usados como ícone](#113-glifos-de-texto-e-emojis-usados-como-ícone)
   - [11.4 Imagens](#114-imagens)
- [12. Inventário de componentes](#12-inventário-de-componentes)
   - [12.1 Componentes exportados de `src/components/ui.tsx`](#121-componentes-exportados-de-srccomponentsuitsx)
   - [12.2 Componentes do shell (`src/components/Layout.tsx`)](#122-componentes-do-shell-srccomponentslayouttsx)
   - [12.3 Padrões recorrentes não componentizados (inline nas páginas)](#123-padrões-recorrentes-não-componentizados-inline-nas-páginas)
- [13. Especificação dos componentes](#13-especificação-dos-componentes)
   - [13.1 C01 · `Button`](#131-c01--button)
   - [13.2 C02 · `Spinner`](#132-c02--spinner)
   - [13.3 C03 · `Card`](#133-c03--card)
   - [13.4 C04 · `Badge`](#134-c04--badge)
   - [13.5 C05 · `Input`](#135-c05--input)
   - [13.6 C06 · `Select`](#136-c06--select)
   - [13.7 C07 · `Textarea`](#137-c07--textarea)
   - [13.8 C08 · `Toggle`](#138-c08--toggle)
   - [13.9 C09 · `CurrencyInput`](#139-c09--currencyinput)
   - [13.10 C10 · `PeriodSelector`](#1310-c10--periodselector)
   - [13.11 C11 · `EmptyState` e C12 · `ErrorState`](#1311-c11--emptystate-e-c12--errorstate)
   - [13.12 C13 · `PageHeader`](#1312-c13--pageheader)
   - [13.13 C14 · `StatCard`](#1313-c14--statcard)
   - [13.14 C15 · `AlertBanner`](#1314-c15--alertbanner)
   - [13.15 C16 · `FinancialSimulationDisclaimer`](#1315-c16--financialsimulationdisclaimer)
   - [13.16 C17 · `AIAnalysisCard`](#1316-c17--aianalysiscard)
   - [13.17 C18 · `AIInsightCard`](#1317-c18--aiinsightcard)
   - [13.18 C19 · `LoadingOverlay`](#1318-c19--loadingoverlay)
   - [13.19 C20 · `TransactionList` (não usado)](#1319-c20--transactionlist-não-usado)
   - [13.20 C21 · `ToastProvider`](#1320-c21--toastprovider)
   - [13.21 C22 · `Tabs`](#1321-c22--tabs)
   - [13.22 C23 · `Modal` (não usado)](#1322-c23--modal-não-usado)
   - [13.23 C24 · `SuccessScreen`](#1323-c24--successscreen)
   - [13.24 C25 · `Divider`, C26 · `AITypingIndicator`, C27 · `DemoDataBadge`](#1324-c25--divider-c26--aitypingindicator-c27--demodatabadge)
   - [13.25 L02 · Sidebar](#1325-l02--sidebar)
   - [13.26 L03 · Header](#1326-l03--header)
- [14. Botões e elementos interativos](#14-botões-e-elementos-interativos)
   - [14.1 Tipos de botão encontrados](#141-tipos-de-botão-encontrados)
   - [14.2 Cursor](#142-cursor)
   - [14.3 Transições de interação](#143-transições-de-interação)
   - [14.4 Estado pressionado](#144-estado-pressionado)
   - [14.5 Estado desabilitado](#145-estado-desabilitado)
   - [14.6 Estado de carregamento](#146-estado-de-carregamento)
   - [14.7 Comportamento em clique](#147-comportamento-em-clique)
   - [14.8 Dispositivos móveis](#148-dispositivos-móveis)
   - [14.9 Foco (verificado em execução)](#149-foco-verificado-em-execução)
- [15. Formulários e validações](#15-formulários-e-validações)
   - [15.1 Padrão visual comum](#151-padrão-visual-comum)
   - [15.2 Regras de validação funcional implementadas](#152-regras-de-validação-funcional-implementadas)
   - [15.3 Tipos de entrada e máscaras](#153-tipos-de-entrada-e-máscaras)
   - [15.4 Estados visuais](#154-estados-visuais)
   - [15.5 Sugestão de categoria pela IA (Nova despesa)](#155-sugestão-de-categoria-pela-ia-nova-despesa)
   - [15.6 Recomendações (não implementadas)](#156-recomendações-não-implementadas)
- [16. Estrutura individual das telas](#16-estrutura-individual-das-telas)
   - [16.0 Shell comum (Layout), telas W3 a W13](#160-shell-comum-layout-telas-w3-a-w13)
   - [16.1 W1 · Login](#161-w1--login)
   - [16.2 W2 · Cadastro](#162-w2--cadastro)
   - [16.3 W3 · Dashboard](#163-w3--dashboard)
   - [16.4 W4 · Operações](#164-w4--operações)
   - [16.5 W5 · Detalhe da operação](#165-w5--detalhe-da-operação)
   - [16.6 W6 · Registrar venda](#166-w6--registrar-venda)
   - [16.7 W7 · Despesas](#167-w7--despesas)
   - [16.8 W8 · Registrar despesa](#168-w8--registrar-despesa)
   - [16.9 W9 · Fluxo de Caixa](#169-w9--fluxo-de-caixa)
   - [16.10 W10 · Simulação de Split Payment](#1610-w10--simulação-de-split-payment)
   - [16.11 W11 · Resultado da simulação](#1611-w11--resultado-da-simulação)
   - [16.12 W12 · Análise inteligente](#1612-w12--análise-inteligente)
   - [16.13 W13 · Configurações](#1613-w13--configurações)
   - [16.14 Smart POS (P1 a P15)](#1614-smart-pos-p1-a-p15)
- [17. Navegação](#17-navegação)
   - [17.1 Mecanismo](#171-mecanismo)
   - [17.2 Mapa de navegação do dashboard web](#172-mapa-de-navegação-do-dashboard-web)
   - [17.3 Mapa de navegação do POS](#173-mapa-de-navegação-do-pos)
   - [17.4 Indicação de localização](#174-indicação-de-localização)
- [18. Responsividade](#18-responsividade)
   - [18.1 Breakpoints reais](#181-breakpoints-reais)
   - [18.2 Comportamento por faixa (verificado em 1440, 768 e 375px)](#182-comportamento-por-faixa-verificado-em-1440-768-e-375px)
   - [18.3 Rolagem](#183-rolagem)
   - [18.4 Não tratados](#184-não-tratados)
- [19. Animações e microinterações](#19-animações-e-microinterações)
- [20. Acessibilidade](#20-acessibilidade)
   - [20.1 Contraste de cores](#201-contraste-de-cores)
   - [20.2 Demais critérios](#202-demais-critérios)
   - [20.3 Recomendações de acessibilidade (separadas do padrão atual)](#203-recomendações-de-acessibilidade-separadas-do-padrão-atual)
- [21. Tecnologias e implementação](#21-tecnologias-e-implementação)
   - [21.1 Stack](#211-stack)
   - [21.2 Estrutura de diretórios](#212-estrutura-de-diretórios)
   - [21.3 Estratégia de estilos](#213-estratégia-de-estilos)
   - [21.4 Convenções de nomenclatura](#214-convenções-de-nomenclatura)
   - [21.5 Build](#215-build)
- [22. Design tokens](#22-design-tokens)
   - [22.1 Tokens existentes formalmente (`@theme` em `src/index.css`)](#221-tokens-existentes-formalmente-theme-em-srcindexcss)
   - [22.2 Valores do Tailwind v4 usados como tokens implícitos](#222-valores-do-tailwind-v4-usados-como-tokens-implícitos)
   - [22.3 Valores de fato não tokenizados (mais relevantes)](#223-valores-de-fato-não-tokenizados-mais-relevantes)
   - [22.4 Tokens sugeridos](#224-tokens-sugeridos)
- [23. Consistência visual](#23-consistência-visual)
- [24. Problemas identificados](#24-problemas-identificados)
   - [24.1 Requisitos do prompt de geração versus implementação](#241-requisitos-do-prompt-de-geração-versus-implementação)
   - [24.2 Problemas de interface (prioridade)](#242-problemas-de-interface-prioridade)
- [25. Recomendações técnicas](#25-recomendações-técnicas)
- [26. Regras para reprodução fiel da interface](#26-regras-para-reprodução-fiel-da-interface)
   - [26.1 Regras globais](#261-regras-globais)
   - [26.2 Regras locais que não podem ser omitidas](#262-regras-locais-que-não-podem-ser-omitidas)
   - [26.3 Recursos que não devem ser substituídos arbitrariamente](#263-recursos-que-não-devem-ser-substituídos-arbitrariamente)
   - [26.4 Pontos sem informação suficiente para reprodução exata](#264-pontos-sem-informação-suficiente-para-reprodução-exata)
- [27. Checklist de conformidade visual](#27-checklist-de-conformidade-visual)
- [28. Glossário](#28-glossário)
- [29. Referências técnicas](#29-referências-técnicas)
- [30. Apêndices](#30-apêndices)
   - [Apêndice A. Arquivos analisados](#apêndice-a-arquivos-analisados)
   - [Apêndice B. Medições automatizadas](#apêndice-b-medições-automatizadas)
   - [Apêndice C. Capturas de tela](#apêndice-c-capturas-de-tela)
   - [Apêndice D. Histórico de versões do protótipo](#apêndice-d-histórico-de-versões-do-protótipo)

---

## 2. Objetivo e escopo da documentação

### 2.1 Objetivo

Registrar, de forma verificável, como a interface do Planner Comercial foi construída no Figma Make: tokens, paleta, tipografia, espaçamentos, dimensões, componentes, estados, telas, navegação, responsividade, animações e acessibilidade. O documento serve como fonte de referência para reproduzir a interface em outra tecnologia (por exemplo Angular, conforme a stack da equipe) mantendo fidelidade visual.

### 2.2 Dentro do escopo

1. Código-fonte React/TypeScript do protótipo (21 arquivos de aplicação, 4.124 linhas contando `vite.config.ts`).
2. CSS global (`src/index.css`) e CSS compilado pelo Tailwind v4 (`dist/assets/index-*.css`, 40,73 kB).
3. As 13 telas do dashboard web, incluindo subestados (detalhe da operação, sucesso de formulários, estados da IA, abas de configurações).
4. As 15 telas internas do módulo Smart POS (`POSPage.tsx`).
5. Interface renderizada em três larguras: 1440×900, 768×1024 e 375×812.
6. Histórico de geração no Figma Make (`ai_chat.json`): 4 versões e 4 prompts de usuário, usados para comparar requisito e implementação.
7. Recursos visuais exportados (`images/`, `thumbnail.png`).

### 2.3 Fora do escopo

1. Back-end, APIs e persistência. O protótipo não possui nenhum desses elementos: todos os dados vêm de `src/data/mockData.ts` ou estão fixos no JSX **[C]**.
2. O conteúdo binário de `canvas.fig` (31,7 kB). Não há ferramenta pública que leia esse formato com segurança; ele não foi interpretado **[NV]**.
3. Variáveis e estilos publicados em bibliotecas do Figma Design. O Figma Make não expõe esses dados no pacote exportado **[NV]**.

---

## 3. Metodologia de análise

| Etapa | O que foi feito | Evidência |
|---|---|---|
| 1. Reconhecimento | Listagem da pasta `PlannerComercial` no computador da usuária. Identificação do repositório git compactado em 6 *packfiles* dentro de `make_repos/4rpj9m.zip`. | `make_repos.json`, `manifest.json` |
| 2. Reconstrução | `git index-pack` de cada pack e checkout do commit `508e5de` (histórico: `a706a85` bootstrap, `0ac3afe`…`2ffc68e` prompts 0 a 40, `508e5de` bootstrap final). | `git log` |
| 3. Leitura integral | Todos os arquivos de `src/` lidos linha a linha. | Seções 12 a 16 citam arquivo e linha |
| 4. Inventário automatizado | Extração por expressão regular de todas as cores hex (52 valores únicos), classes de espaçamento, tamanhos, raios, sombras, opacidades, transições e modificadores responsivos. | Apêndice A |
| 5. Build | `pnpm install --frozen-lockfile` e `vite build` (Vite 8.0.5, 605 módulos, sem erros). | Seção 21 |
| 6. Renderização | Script Playwright com Chromium (`/opt/pw-browsers/chromium`), locale `pt-BR`, fuso `America/Recife`, navegando por todos os fluxos clicáveis. 158 capturas no total (52 em desktop, 53 em tablet, 53 em mobile). | Apêndice C, arquivo `capturas.zip` |
| 7. Medição | `getComputedStyle` e `getBoundingClientRect` em 60 seletores por largura. | Apêndice B |
| 8. Contraste | Razão de contraste WCAG 2.x calculada a partir dos hex do código (fórmula de luminância relativa do WCAG). | Seção 20 |
| 9. Requisitos | Leitura do último prompt de geração (versão 4) para comparar especificação e implementação. | Seção 24 |

### 3.1 Limitações conhecidas

1. **Fontes web não carregadas nas capturas.** O ambiente de inspeção bloqueou `fonts.googleapis.com` (HTTP 403 no proxy). `document.fonts` retornou vazio; as capturas usam a fonte de fallback (`sans-serif` e `monospace` do sistema). As famílias, pesos e tamanhos declarados estão confirmados no código e no estilo computado, mas a **aparência exata dos glifos de Outfit, Inter e JetBrains Mono nas capturas não é representativa** **[NV]**.
2. Os estados de *hover*, *active* e transições foram documentados a partir do código. Apenas o foco foi verificado em execução (seção 14.9).
3. A data exibida no header usa `new Date()` e por isso aparece como 23/10/2026 nas capturas, não como setembro de 2024 dos dados de exemplo **[C][O]**.
4. Não foram feitos testes com leitores de tela reais (NVDA, TalkBack). A avaliação de acessibilidade é estrutural (seção 20).

---

## 4. Visão geral do frontend

### 4.1 Natureza do protótipo

É uma **aplicação React de página única (SPA) sem roteador de URL**. A navegação é controlada por um estado `page` em `App.tsx` **[C]**. Não existem rotas, histórico de navegador nem deep links: atualizar a página sempre volta ao Login.

### 4.2 Módulos

| Módulo | Arquivos | Padrão visual | Público |
|---|---|---|---|
| Dashboard web | `Layout.tsx`, `ui.tsx`, 12 páginas | Sidebar escura fixa + header branco + área de conteúdo cinza-azulada; tokens hex arbitrários | Comerciante no navegador |
| Smart POS | `POSPage.tsx` (329 linhas, autocontido) | Moldura de 360px de largura, header azul-marinho, botões grandes, paleta Tailwind nomeada (`slate`, `sky`, `blue`, `green`, `amber`, `orange`, `red`) | Operador no terminal Android |

O Smart POS **não reutiliza** nenhum componente de `ui.tsx` **[C]**. Ele define três componentes internos (`Simulated`, `ResponsibilityNotice`, `Icon`) e escreve todo o restante em JSX inline.

### 4.3 Hierarquia de navegação

```
App (estado: page, authenticated, simulationData)
├── LoginPage                       (tela cheia)
├── CadastroPage                    (tela cheia)
├── POSPage                         (tela cheia, navegação interna própria)
└── Layout (sidebar + header + main)
    ├── DashboardPage
    ├── VendasPage  ⇄ detalhe da operação (estado local)
    ├── NovaVendaPage ⇄ sucesso (estado local)
    ├── DespesasPage
    ├── NovaDespesaPage ⇄ sucesso (estado local)
    ├── FluxoDeCaixaPage
    ├── SplitPaymentPage → SplitResultadoPage
    ├── IAAnalisePage (6 estados demonstrativos)
    └── ConfiguracoesPage (4 abas)
```

### 4.4 Dados exibidos

Persona fixa: **Maria Silva**, estabelecimento **Mercadinho São João**, CNPJ 12.345.678/0001-90 **[C]** (`Layout.tsx` linhas 66, 67 e 129). Período dos dados: setembro de 2024 no web e outubro de 2026 em alguns pontos do POS (`OP-2026-0184`, data padrão `2026-10-02`) **[C]**.

---

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


---

## 6. Sistema de design

### 6.1 Onde o sistema está definido

| Camada | Local | Conteúdo | Situação |
|---|---|---|---|
| Tokens declarados | `src/index.css`, bloco `@theme` (linhas 6 a 36) | 20 cores, 3 famílias tipográficas, 4 raios | **Declarados mas quase não referenciados.** Nenhum arquivo `.tsx` usa as classes geradas (`bg-primary`, `text-text-muted` etc.). Os componentes repetem os hex como valores arbitrários (`bg-[#0F172A]`) **[C]**. |
| Estilos globais não estratificados | `src/index.css`, linhas 38 a 99 | Tamanho base 14px, regra de 16px do POS, tipografia de títulos, scrollbar, anel de foco, `.font-mono`, `.transition-base`, z-index do tooltip | Estão fora de `@layer`. Por isso **vencem qualquer utilitário do Tailwind**, que fica em `@layer utilities` (ver 6.3) **[C][M]**. |
| Biblioteca de componentes | `src/components/ui.tsx` | 24 componentes e 3 funções utilitárias | Usada por todas as telas web. Não usada pelo POS. |
| Shell | `src/components/Layout.tsx` | Sidebar, header, área principal, 11 ícones SVG | Usado pelas telas W3 a W13. |
| Estilos locais | Classes Tailwind inline em cada página | Grades, espaçamentos e variações | Grande parte dos padrões é repetida em vez de componentizada (seção 23). |

### 6.2 Princípios visuais observados

1. **Hierarquia por cor de superfície, não por sombra.** Cards são planos (borda 1px `#E2E8F0`, sem sombra). Sombras aparecem apenas em botões (`shadow-sm`), cards clicáveis no hover (`shadow-md`), toasts (`shadow-lg`), modal e moldura do POS (`shadow-2xl`) **[C]**.
2. **Codificação semântica por família de cor:** verde = líquido/confirmado/entrada; âmbar e laranja = tributo/atenção/pendente; vermelho = falha/saída/erro; cinza = taxas; azul claro = simulado/informação. Corresponde ao requisito do prompt de geração (seção 24) **[C]**.
3. **Valores monetários sempre em fonte monoespaçada** (`font-mono`, JetBrains Mono) no web **[C]**. No POS não há `font-mono` **[C]**.
4. **Selos de transparência recorrentes:** "SIMULADO" e "Dados demonstrativos" aparecem no cabeçalho das telas com valores financeiros **[C]**.

### 6.3 Regras de cascata que alteram o resultado visual

Esta seção é crítica para a reprodução fiel, porque o resultado renderizado difere do que as classes sugerem.

| # | Regra global (`index.css`) | Efeito | Exemplo medido |
|---|---|---|---|
| 1 | `html, body { font-size: 14px }` | Toda unidade `rem` vale 14px. | `text-sm` = 12.25px; `w-60` = 210px **[M]** |
| 2 | `h1…h6 { margin: 0; font-weight: 600; line-height: 1.25; font-family: var(--font-display) }` fora de camada | Anula `mb-*`, `mt-*`, `font-bold` e `leading-*` aplicados em títulos. | `h1.mb-1` no Login com margem 0px; `h2.mb-10` do painel de marca com margem 0px; `h1.font-bold` do POS com peso 600 **[M]** |
| 3 | `*:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` fora de camada | Sobrescreve as cores de foco por variante do `Button` e soma um contorno ao `focus:ring` dos inputs. | Input focado: contorno 2px `#2563EB` + anel 2px `#1E54B7` a 15% + borda `#1E54B7` **[M]** |
| 4 | `.pos-shell .text-xs, .pos-shell .text-sm, .pos-shell small { font-size: 16px }` | Garante 16px mínimo no POS apenas para essas classes. `text-lg` (15.75px) não é coberto. | Título do header do POS: 15.75px **[M]** |
| 5 | `.pos-shell { font-size: 16px; line-height: 1.45 }` e botões, inputs e selects em 16px | Base tipográfica do POS. | `.pos-shell` com 16px e altura de linha 23.2px **[M]** |

---

## 7. Paleta de cores

### 7.1 Resumo

| Métrica | Valor |
|---|---|
| Cores hex únicas no código | 52 (51 em componentes e páginas, mais `#FFFFFF` no `@theme`) **[C]** |
| Tokens de cor declarados em `@theme` | 20 **[C]** |
| Tokens referenciados por classe semântica em `.tsx` | 0 **[C]** |
| Cores da paleta nomeada do Tailwind (somente POS) | 41 classes, 41 valores OKLCH **[C]** |
| Cores com transparência | `white/5`, `white/8`, `white/10`, `white/15`, `black/40`, anel `#1E54B7` a 15%, anel `#DC2626` a 20% **[C]** |

**Divergência principal:** o token `--color-accent` é `#2563EB`, mas a cor de ação efetivamente usada em botões, links, foco de campo e gráficos do web é `#1E54B7` (48 ocorrências), que não existe como token. No POS a cor de ação é `#1F4E9E` (20 ocorrências), valor especificado no prompt. São três azuis de ação diferentes (seção 23, item I-01).

### 7.2 Tokens declarados em `@theme` (`src/index.css`)

| Token | Valor | Uso real no código |
|---|---|---|
| `--color-primary` | `#1E3A5F` | Literal `#1E3A5F` no avatar e no Badge `blue` |
| `--color-primary-light` | `#2563EB` | Não referenciado |
| `--color-primary-foreground` | `#FFFFFF` | Não referenciado |
| `--color-accent` | `#2563EB` | Referenciado apenas pelo anel de foco global (`var(--color-accent)`) |
| `--color-accent-hover` | `#1D4ED8` | Não referenciado como token; o hex aparece como cor de texto informativo |
| `--color-background` | `#F0F4F8` | `html, body` e `Layout` via `var(--color-background)` |
| `--color-surface` | `#FFFFFF` | Não referenciado (o JSX usa `bg-white`) |
| `--color-surface-2` | `#F8FAFC` | Não referenciado como token |
| `--color-border` | `#E2E8F0` | Não referenciado como token |
| `--color-border-strong` | `#CBD5E1` | Scrollbar via `var()` |
| `--color-text` | `#0F172A` | `html, body` via `var()` |
| `--color-text-2` | `#334155` | Não referenciado como token |
| `--color-text-muted` | `#64748B` | Hover da scrollbar via `var()` |
| `--color-success` / `--color-success-bg` | `#16A34A` / `#F0FDF4` | Não referenciados como token |
| `--color-warning` / `--color-warning-bg` | `#D97706` / `#FFFBEB` | Não referenciados como token |
| `--color-danger` / `--color-danger-bg` | `#DC2626` / `#FEF2F2` | Não referenciados como token |
| `--color-sidebar` | `#0F2544` | `Layout` via `var(--color-sidebar)` |

### 7.3 Inventário completo de cores do dashboard web

Todas as linhas abaixo têm confiança **Confirmado no código**. "Ocorrências" conta as aparições literais do hex em `src/`. "Arquivos" omite o caminho `src/pages/` e `src/components/`.

#### Marca e ação

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `action-primary` | `#1E54B7` | 30, 84, 183 | 219, 72%, 42% | 48 | Cor de ação real dos componentes web | Button primary, links, foco de inputs, Toggle ligado, série 'Saldo' dos gráficos, logo do Login. Não existe como token. | ui, CadastroPage, LoginPage, FluxoDeCaixaPage, IAAnalisePage, NovaDespesaPage, DashboardPage, NovaVendaPage, SplitPaymentPage | Confirmado no código |
| `action-primary-hover` | `#1844A0` | 24, 68, 160 | 221, 74%, 36% | 3 | Hover do botão primário | Button primary, botão 'Aceitar' (IA), botão enviar do chat. | ui, IAAnalisePage, NovaDespesaPage | Confirmado no código |
| `action-primary-active` | `#143590` | 20, 53, 144 | 224, 76%, 32% | 1 | Estado pressionado do botão primário | Button primary `active:`. | ui | Confirmado no código |
| `accent (token) / nav-active` | `#2563EB` | 37, 99, 235 | 221, 83%, 53% | 5 | Item ativo da sidebar, logo da sidebar, selo 'IA' do menu, outline de foco global | Tokens `--color-accent` e `--color-primary-light`; `*:focus-visible`. | Layout, index | Confirmado no código |
| `primary (token) / avatar` | `#1E3A5F` | 30, 58, 95 | 214, 52%, 25% | 4 | Avatar 'MS', Badge `blue` | Token `--color-primary`; usado literalmente em Layout e Configurações. | Layout, ui, index, ConfiguracoesPage | Confirmado no código |
| `sidebar / brand-dark` | `#0F2544` | 15, 37, 68 | 215, 64%, 16% | 11 | Fundo da sidebar, painel de marca do Login, StatCard primary, botão secondary, chips ativos, bolha do usuário, toast de sucesso | Token `--color-sidebar`. | ui, index, LoginPage, VendasPage, IAAnalisePage, DespesasPage | Confirmado no código |
| `secondary-hover` | `#1A3860` | 26, 56, 96 | 214, 57%, 24% | 1 | Hover do botão secondary | ui.tsx Button. | ui | Confirmado no código |
| `secondary-active` | `#0A1A30` | 10, 26, 48 | 215, 66%, 11% | 1 | Active do botão secondary | ui.tsx Button. | ui | Confirmado no código |
| `pos-primary` | `#1F4E9E` | 31, 78, 158 | 218, 67%, 37% | 20 | Cor primária do módulo Smart POS | POSPage (botões, cards de destaque, logo 'PC'). Valor exigido no prompt de geração. | POSPage | Confirmado no código |
| `pos-header` | `#123463` | 18, 52, 99 | 215, 69%, 23% | 3 | Fundo do header do Smart POS e card de resultado | POSPage. | POSPage | Confirmado no código |

#### Fundos e superfícies

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `background` | `#F0F4F8` | 240, 244, 248 | 210, 36%, 96% | 4 | Fundo de página | `html, body`, Login, Cadastro, botão 'Ver fluxo de caixa'. Token `--color-background`. | index, CadastroPage, LoginPage, DashboardPage | Confirmado no código |
| `surface` | `#FFFFFF` | 255, 255, 255 | 0, 0%, 100% | 2 | Superfície de cards e header | Token `--color-surface`; no JSX aparece como `bg-white`/`text-white` (classes nomeadas). | index | Confirmado no código |
| `surface-2` | `#F8FAFC` | 248, 250, 252 | 210, 40%, 98% | 28 | Superfície secundária | Hover de linhas, notas de rodapé, footer de Modal, prévia da simulação, divisórias `divide-[#F8FAFC]`. Token `--color-surface-2`. | ui, index, SplitResultadoPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaVendaPage, DespesasPage, SplitPaymentPage | Confirmado no código |
| `surface-muted / divider` | `#F1F5F9` | 241, 245, 249 | 210, 40%, 96% | 33 | Fundo de grupos segmentados, hover ghost, divisórias internas | PeriodSelector, Tabs, chips de filtro inativos, `divide-[#F1F5F9]`, hover de botões ícone, grade de gráficos. | Layout, ui, SplitResultadoPage, CadastroPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, DespesasPage | Confirmado no código |

#### Texto

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `text-primary` | `#0F172A` | 15, 23, 42 | 222, 47%, 11% | 57 | Texto principal, títulos, valores | h1/h2, valores monetários, texto de inputs, tooltip de gráfico. Token `--color-text`. | ui, index, SplitResultadoPage, CadastroPage, LoginPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, DespesasPage, SplitPaymentPage | Confirmado no código |
| `text-secondary` | `#334155` | 51, 65, 85 | 215, 25%, 27% | 43 | Rótulos e texto de apoio forte | Labels de campo, botões ghost/outline, títulos de card (h2 text-[#334155]), bolhas da IA. Token `--color-text-2`. | Layout, ui, index, SplitResultadoPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, NovaVendaPage, SplitPaymentPage | Confirmado no código |
| `badge-default-text` | `#475569` | 71, 85, 105 | 215, 19%, 35% | 1 | Texto do Badge default | `Badge variant=default` (ui.tsx). | ui | Confirmado no código |
| `text-muted` | `#64748B` | 100, 116, 139 | 215, 16%, 47% | 62 | Texto secundário | Subtítulos, datas do header, descrições, ícones do header. Token `--color-text-muted`. | Layout, ui, index, SplitResultadoPage, CadastroPage, LoginPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, DespesasPage, SplitPaymentPage | Confirmado no código |
| `text-subtle / icon` | `#94A3B8` | 148, 163, 184 | 215, 20%, 65% | 94 | Texto auxiliar, placeholder, ícones de input, eixos de gráfico | Placeholder, hint, cabeçalhos de tabela, datas em listas, ícones de StatCard default, ticks de Recharts. | ui, SplitResultadoPage, CadastroPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, DespesasPage, SplitPaymentPage | Confirmado no código |

#### Texto sobre fundo escuro

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `on-dark-muted` | `#93C5FD` | 147, 197, 253 | 212, 96%, 78% | 9 | Texto secundário sobre fundo escuro | Itens inativos da sidebar, subtítulo 'Comercial', CNPJ, label de StatCard primary, textos do painel de marca. | Layout, ui, LoginPage | Confirmado no código |
| `on-dark-subtle` | `#4E7298` | 78, 114, 152 | 211, 32%, 45% | 2 | Rótulos de grupo da sidebar e copyright do Login | Layout.tsx, LoginPage.tsx. | Layout, LoginPage | Confirmado no código |

#### Bordas e divisórias

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `border` | `#E2E8F0` | 226, 232, 240 | 214, 32%, 91% | 40 | Borda padrão de cards, inputs e divisórias | Card, Input, Select, Modal, header (border-b), tooltip de gráfico. Token `--color-border`. | Layout, ui, index, SplitResultadoPage, CadastroPage, VendasPage, FluxoDeCaixaPage, IAAnalisePage, NovaDespesaPage, DashboardPage, NovaVendaPage, DespesasPage, SplitPaymentPage | Confirmado no código |
| `border-strong / disabled-track` | `#CBD5E1` | 203, 213, 225 | 213, 27%, 84% | 9 | Borda forte, trilho do Toggle desligado, série 'Projeção' | `--color-border-strong`, scrollbar thumb, hover de outline, legenda de projeção. | ui, index, FluxoDeCaixaPage, DashboardPage, NovaVendaPage | Confirmado no código |

#### Informação e estado simulado

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `info-text / accent-hover` | `#1D4ED8` | 29, 78, 216 | 224, 76%, 48% | 21 | Texto informativo e ícone da IA | Badge info, ícone estrela da IA, AlertBanner info, disclaimers. Token `--color-accent-hover` (valor igual, mas não referenciado). | ui, index, SplitResultadoPage, LoginPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, SplitPaymentPage | Confirmado no código |
| `info-title` | `#1E3A8A` | 30, 58, 138 | 224, 64%, 33% | 6 | Título de blocos informativos | AlertBanner/AIInsightCard info, sugestão da IA, detalhe da operação. | ui, VendasPage, ConfiguracoesPage, NovaDespesaPage, NovaVendaPage | Confirmado no código |
| `info-text-light` | `#3B82F6` | 59, 130, 246 | 217, 91%, 60% | 2 | Texto informativo leve | Dica 'Acesso demonstrativo' (Login), 'Confiança' (sugestão IA). | LoginPage, NovaDespesaPage | Confirmado no código |
| `info-border` | `#BFDBFE` | 191, 219, 254 | 213, 97%, 87% | 8 | Borda de blocos informativos | AlertBanner info, dica demo, sugestão IA, linha do tempo. | ui, LoginPage, VendasPage, ConfiguracoesPage, NovaDespesaPage | Confirmado no código |
| `info-bg-strong` | `#DBEAFE` | 219, 234, 254 | 214, 95%, 93% | 14 | Fundo de Badge info e ícones da IA | Badge info, avatar da IA, 'Plano Gratuito', tipo 'Realizado' na tabela, hover do botão 'Sugerir categoria'. | ui, SplitResultadoPage, FluxoDeCaixaPage, IAAnalisePage, ConfiguracoesPage, NovaDespesaPage | Confirmado no código |
| `info-bg` | `#EFF6FF` | 239, 246, 255 | 214, 100%, 97% | 10 | Fundo informativo | AlertBanner info, dica demo, forma de pagamento selecionada, ação 'Registrar venda'. | ui, LoginPage, VendasPage, ConfiguracoesPage, NovaDespesaPage, DashboardPage, NovaVendaPage, SplitPaymentPage | Confirmado no código |
| `simulated-text` | `#075985` | 7, 89, 133 | 201, 90%, 27% | 2 | Texto do selo 'SIMULADO' (Dashboard) | DashboardPage. | DashboardPage | Confirmado no código |
| `simulated-bg` | `#E0F2FE` | 224, 242, 254 | 204, 94%, 94% | 1 | Fundo do selo 'SIMULADO' (Dashboard) | DashboardPage. | DashboardPage | Confirmado no código |

#### Sucesso

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `success` | `#16A34A` | 22, 163, 74 | 142, 76%, 36% | 33 | Confirmado, líquido, entradas, tendência positiva | Valores líquidos, StatCard success, Button success, status 'Concluída'. Token `--color-success`. | ui, index, SplitResultadoPage, VendasPage, FluxoDeCaixaPage, NovaDespesaPage, DashboardPage, SplitPaymentPage | Confirmado no código |
| `success-strong` | `#15803D` | 21, 128, 61 | 142, 72%, 29% | 6 | Texto de sucesso / hover do Button success | Badge success, AlertBanner success, AIInsight positive. | ui, DashboardPage, NovaVendaPage | Confirmado no código |
| `success-title` | `#14532D` | 20, 83, 45 | 144, 61%, 20% | 2 | Título de bloco de sucesso | AlertBanner/AIInsightCard. | ui | Confirmado no código |
| `success-border` | `#BBF7D0` | 187, 247, 208 | 141, 79%, 85% | 5 | Borda de blocos de sucesso | StatCard success, AlertBanner success, dica PIX. | ui, SplitResultadoPage, NovaVendaPage | Confirmado no código |
| `success-bg-strong` | `#DCFCE7` | 220, 252, 231 | 141, 84%, 93% | 1 | Fundo do Badge success | ui.tsx. | ui | Confirmado no código |
| `success-bg` | `#F0FDF4` | 240, 253, 244 | 138, 76%, 97% | 9 | Fundo de sucesso | StatCard success, SuccessScreen, ação 'Simular impacto'. Token `--color-success-bg`. | ui, index, SplitResultadoPage, DashboardPage, NovaVendaPage | Confirmado no código |
| `chart-inflow` | `#86EFAC` | 134, 239, 172 | 142, 77%, 73% | 2 | Barras de entradas no Fluxo de Caixa | FluxoDeCaixaPage. | FluxoDeCaixaPage | Confirmado no código |

#### Atenção

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `warning` | `#D97706` | 217, 119, 6 | 32, 95%, 44% | 8 | Atenção, pendente, tributo | StatCard warning label, status 'Pendente', ponto de AIInsight warning. Token `--color-warning`. | ui, index, VendasPage, NovaDespesaPage, DashboardPage | Confirmado no código |
| `tax-chart` | `#F59E0B` | 245, 158, 11 | 38, 92%, 50% | 2 | Segmento 'Tributo separado' na barra de composição | DashboardPage. | DashboardPage | Confirmado no código |
| `warning-text` | `#A16207` | 161, 98, 7 | 35, 92%, 33% | 3 | Texto do Badge warning e do selo 'Dados demonstrativos' | ui.tsx, SplitResultadoPage. | ui, SplitResultadoPage | Confirmado no código |
| `warning-body` | `#92400E` | 146, 64, 14 | 23, 82%, 31% | 7 | Texto de alertas de atenção | AlertBanner warning, aviso de IA, aviso de projeção, ação 'Registrar despesa'. | ui, SplitResultadoPage, FluxoDeCaixaPage, IAAnalisePage, DashboardPage | Confirmado no código |
| `warning-title` | `#78350F` | 120, 53, 15 | 22, 78%, 26% | 2 | Título de alerta de atenção | AlertBanner/AIInsightCard warning. | ui | Confirmado no código |
| `warning-border` | `#FDE68A` | 253, 230, 138 | 48, 97%, 77% | 6 | Borda de alertas de atenção | StatCard warning, AlertBanner warning, aviso fixo da IA. | ui, SplitResultadoPage, FluxoDeCaixaPage, IAAnalisePage | Confirmado no código |
| `warning-bg-strong` | `#FEF9C3` | 254, 249, 195 | 55, 97%, 88% | 3 | Fundo do Badge warning e do selo demonstrativo | Badge warning, DemoDataBadge, ação 'Registrar despesa'. | ui, DashboardPage | Confirmado no código |
| `warning-bg` | `#FFFBEB` | 255, 251, 235 | 48, 100%, 96% | 7 | Fundo de atenção | StatCard warning, AlertBanner warning. Token `--color-warning-bg`. | ui, index, SplitResultadoPage, FluxoDeCaixaPage, IAAnalisePage | Confirmado no código |

#### Erro

| Nome semântico | Hex | RGB | HSL | Ocorrências | Finalidade | Onde aparece | Arquivos | Confiança |
|---|---|---|---|---|---|---|---|---|
| `danger` | `#DC2626` | 220, 38, 38 | 0, 72%, 51% | 40 | Erro, saídas, falha, notificação | Mensagens de erro, borda inválida, Button danger, ponto do sino, saídas. Token `--color-danger`. | Layout, ui, index, SplitResultadoPage, LoginPage, FluxoDeCaixaPage, NovaDespesaPage, NovaVendaPage, DespesasPage, SplitPaymentPage | Confirmado no código |
| `danger-hover` | `#B91C1C` | 185, 28, 28 | 0, 74%, 42% | 1 | Hover do botão danger | ui.tsx. | ui | Confirmado no código |
| `danger-title` | `#991B1B` | 153, 27, 27 | 0, 70%, 35% | 2 | Título de alerta de erro | AlertBanner danger, aviso de despesas vencidas. | ui, DespesasPage | Confirmado no código |
| `danger-border / chart-outflow` | `#FCA5A5` | 252, 165, 165 | 0, 94%, 82% | 7 | Borda de erro e barras de saídas | Erro do Login, StatCard danger, Fluxo de Caixa (barras). | ui, SplitResultadoPage, LoginPage, FluxoDeCaixaPage, DespesasPage | Confirmado no código |
| `danger-bg-strong` | `#FEE2E2` | 254, 226, 226 | 0, 93%, 94% | 2 | Fundo do Badge danger | ui.tsx, DespesasPage. | ui, DespesasPage | Confirmado no código |
| `danger-bg` | `#FEF2F2` | 254, 242, 242 | 0, 86%, 97% | 8 | Fundo de erro | Erro do Login, ErrorState, segregação simulada. Token `--color-danger-bg`. | ui, index, SplitResultadoPage, LoginPage, DespesasPage | Confirmado no código |

### 7.4 Paleta nomeada do Tailwind usada no Smart POS

O POS usa classes como `bg-slate-50` e `text-green-700`. No Tailwind v4 essas cores são definidas em OKLCH. A coluna "Hex convertido" foi calculada a partir do OKLCH do build (conversão OKLab para sRGB) e serve para reprodução em ferramentas que não aceitam OKLCH **[C]** para o OKLCH, **[E]** para o hex (arredondamento de conversão de no máximo ±1 por canal).

| Classe Tailwind (cor) | Valor OKLCH no build | Hex convertido | Uso no POS |
|---|---|---|---|
| `amber-200` | `oklch(92.4% .12 95.746)` | `#FEE685` | borda de alerta |
| `amber-400` | `oklch(82.8% .189 84.429)` | `#FFB900` | selo 'Atenção média' |
| `amber-50` | `oklch(98.7% .022 95.277)` | `#FFFBEB` | fundo de alerta |
| `amber-800` | `oklch(47.3% .137 46.201)` | `#973C00` | saídas, status pendente |
| `amber-900` | `oklch(41.4% .112 45.904)` | `#7B3306` | texto de alerta |
| `amber-950` | `oklch(27.9% .077 45.635)` | `#461901` | texto do selo de atenção |
| `blue-100` | `oklch(93.2% .032 255.585)` | `#DBEAFE` | texto sobre azul, trilho do spinner |
| `blue-200` | `oklch(88.2% .059 254.128)` | `#BEDBFF` | texto sobre azul escuro, barras de tendência |
| `blue-300` | `oklch(80.9% .105 251.813)` | `#8EC5FF` | linha do tempo |
| `blue-50` | `oklch(97% .014 254.604)` | `#EFF6FF` | registro somente leitura, soma das parcelas |
| `blue-800` | `oklch(42.4% .199 265.638)` | `#193CB8` | nível de atenção |
| `blue-900` | `oklch(37.9% .146 265.522)` | `#1C398E` | texto informativo |
| `blue-950` | `oklch(28.2% .091 267.935)` | `#162456` | soma das parcelas |
| `green-200` | `oklch(92.5% .084 155.995)` | `#B9F8CF` | borda de sucesso |
| `green-50` | `oklch(98.2% .018 155.826)` | `#F0FDF4` | fundo de sucesso |
| `green-500` | `oklch(72.3% .219 149.579)` | `#00C950` | marcador de destino |
| `green-700` | `oklch(52.7% .154 150.069)` | `#008236` | valores líquidos |
| `green-800` | `oklch(44.8% .119 151.328)` | `#016630` | texto de etapa concluída |
| `orange-200` | `oklch(90.1% .076 70.697)` | `#FFD6A7` | borda da parcela de tributo |
| `orange-300` | `oklch(83.7% .128 66.29)` | `#FFB86A` | valor de tributo sobre azul |
| `orange-50` | `oklch(98% .016 73.684)` | `#FFF7ED` | parcela de tributo |
| `orange-700` | `oklch(55.3% .195 38.402)` | `#CA3500` | split simulado |
| `orange-800` | `oklch(47% .157 37.304)` | `#9F2D00` | despesas projetadas |
| `orange-900` | `oklch(40.8% .123 38.172)` | `#7E2A0C` | texto da parcela de tributo |
| `red-200` | `oklch(88.5% .062 18.334)` | `#FFC9C9` | borda de erro |
| `red-300` | `oklch(80.8% .114 19.571)` | `#FFA2A2` | borda de falha / botão sair |
| `red-50` | `oklch(97.1% .013 17.38)` | `#FEF2F2` | fundo de falha |
| `red-700` | `oklch(50.5% .213 27.518)` | `#C10007` | texto de erro, botão Reprocessar |
| `red-800` | `oklch(44.4% .177 26.899)` | `#9F0712` | texto de falha |
| `sky-100` | `oklch(95.1% .026 236.824)` | `#DFF2FE` | fundo do selo SIMULADO |
| `sky-50` | `oklch(97.7% .013 236.62)` | `#F0F9FF` | caixa de percentuais demonstrativos |
| `sky-800` | `oklch(44.3% .11 240.79)` | `#00598A` | texto do selo SIMULADO |
| `sky-900` | `oklch(39.1% .09 240.876)` | `#024A70` | texto informativo |
| `slate-100` | `oklch(96.8% .007 247.896)` | `#F1F5F9` | aviso de responsabilidade, card 'Taxa' |
| `slate-200` | `oklch(92.9% .013 255.508)` | `#E2E8F0` | bordas de cards e nav |
| `slate-300` | `oklch(86.9% .022 252.894)` | `#CAD5E2` | bordas de inputs/selects |
| `slate-400` | `oklch(70.4% .04 256.788)` | `#90A1B9` | etapa pendente (processamento) |
| `slate-50` | `oklch(98.4% .003 247.858)` | `#F8FAFC` | fundo do shell |
| `slate-500` | `oklch(55.4% .046 257.417)` | `#62748E` | texto secundário |
| `slate-600` | `oklch(44.6% .043 257.281)` | `#45556C` | texto de apoio |
| `slate-700` | `oklch(37.2% .044 257.287)` | `#314158` | labels, botões neutros |
| `slate-950` | `oklch(12.9% .042 264.695)` | `#020618` | título do login POS |

### 7.5 Cores com transparência e sobreposição

| Uso | Classe | Valor | Contexto |
|---|---|---|---|
| Overlay da sidebar no mobile | `bg-black/40` | `rgba(0,0,0,0.4)` | `Layout.tsx` linha 45 |
| Fundo do modal | `bg-black/40` + `backdrop-blur-sm` | `rgba(0,0,0,0.4)` + desfoque 8px | `ui.tsx` `Modal` |
| Card do estabelecimento na sidebar | `bg-white/5`, `border-white/10` | `#FFFFFF0D`, `#FFFFFF1A` | `Layout.tsx` linha 65 |
| Hover de item da sidebar | `hover:bg-white/8` | `#FFFFFF14` | `Layout.tsx` linhas 85 e 102 |
| Divisórias da sidebar | `border-white/10` | `#FFFFFF1A` | `Layout.tsx` linhas 52 e 99 |
| Círculos decorativos do Login | `opacity-5` sobre `#1E54B7` | 5% | `LoginPage.tsx` linhas 30 e 31 |
| Indicadores 01 a 03 do Login | `bg-white/8` | `#FFFFFF14` | `LoginPage.tsx` linha 60 |
| Botões do header do POS | `bg-white/10`, `bg-white/15` | 10% e 15% | `POSPage.tsx` linhas 137 e 138 |
| Anel de foco de campo válido | `focus:ring-[#1E54B7]/15` | `#1E54B7` a 15%, 2px | `ui.tsx` |
| Anel de foco de campo inválido | `focus:ring-[#DC2626]/20` | `#DC2626` a 20%, 2px | `ui.tsx` `Input` |
| Desabilitado | `opacity-50` (Button), `disabled:opacity-40` (enviar do chat), `disabled:opacity-50` (Sugerir categoria) | 50% e 40% | `ui.tsx`, `IAAnalisePage.tsx`, `NovaDespesaPage.tsx` |
| Linhas projetadas | `opacity-80` (lista), `opacity-70` (tabela) | 80% e 70% | `FluxoDeCaixaPage.tsx` |
| Sombras | `#0000001A` (sm, md, lg), `#00000040` (2xl) | 10% e 25% de preto | CSS compilado |

### 7.6 Cores de gráficos (Recharts)

| Série ou elemento | Cor | Espessura | Tela |
|---|---|---|---|
| Saldo (área) | traço `#1E54B7`, gradiente `#1E54B7` 12% → 0% | 2px | Dashboard |
| Entradas (área) | traço `#16A34A`, gradiente `#16A34A` 12% → 0% | 1.5px | Dashboard |
| Entradas (barra) | `#86EFAC`, raio superior 3px, largura máxima 14px | n/a | Fluxo de Caixa |
| Saídas (barra) | `#FCA5A5`, raio superior 3px, largura máxima 14px | n/a | Fluxo de Caixa |
| Saldo (linha) | `#1E54B7` | 2.5px | Fluxo de Caixa |
| Grade | `#F1F5F9`, tracejado `3 3` | 1px | Ambos |
| Rótulos dos eixos | `#94A3B8`, 10px | n/a | Ambos |
| Linha de referência y=0 | `#E2E8F0` | 1px | Fluxo de Caixa |
| Tooltip | fundo `#FFFFFF`, borda 1px `#E2E8F0`, raio 10px, fonte 12px, padding 8px 12px | n/a | Ambos |
| Composição do bruto | Tributo `#F59E0B` 10%, Taxas `#94A3B8` 2%, Líquido `#16A34A` 88%; barra de 14px de altura, `rounded-full` | n/a | Dashboard |
| Tendência do saldo (POS) | `bg-blue-200` (`#BEDBFF`), barras de 35% a 84% de altura em contêiner de 112px | n/a | POS P10 |

---

## 8. Tipografia

### 8.1 Famílias

| Token | Família | Pesos importados | Fallback | Aplicação | Origem |
|---|---|---|---|---|---|
| `--font-display` | Outfit | 400, 500, 600, 700, 800 | `sans-serif` | Todos os `h1` a `h6` (regra global) | `index.css` linhas 1 e 28 |
| `--font-body` | Inter | 400, 500, 600, 700 | `sans-serif` | `html, body` e todo texto que não é título | `index.css` linhas 2 e 29 |
| `--font-mono` | JetBrains Mono | **400, 500** | `monospace` | Valores monetários e numéricos (`font-mono`, 41 ocorrências) | `index.css` linhas 3 e 30 |

Carregamento: três `@import url('https://fonts.googleapis.com/css2?…&display=swap')` **[C]**. Não há arquivos de fonte locais nem `@font-face` **[C]**.

**Atenção:** o código usa `font-mono` combinado com `font-semibold` (600) e `font-bold` (700) em 22 declarações de classe, além de elementos `<strong>` com `font-mono` (negrito por padrão do navegador), mas apenas os pesos 400 e 500 de JetBrains Mono são importados. Nesses casos o navegador sintetiza negrito ou usa o peso mais próximo **[C]**. Para reprodução fiel, importe também 600 e 700 **[R]**.

Exceção: o painel de marca do Login usa `font-bold` (700) em `div`, não em título, portanto renderiza em Inter 700 **[C]**.

### 8.2 Escala tipográfica renderizada

Valores com raiz de 14px. A altura de linha de `text-[10px]` e `text-[9px]` não é definida pela classe; herda o `line-height: 1.6` do `body` **[M]**.

| Classe | Declarado | Tamanho renderizado | Altura de linha renderizada | Ocorrências |
|---|---|---|---|---|
| `text-[9px]` | 9px | 9px | 14.4px (herdada 1.6) | 1 |
| `text-[10px]` | 10px | 10px | 16px (herdada 1.6) | 22 |
| `text-xs` | 0.75rem | 10.5px | 14px | 144 |
| `text-sm` | 0.875rem | 12.25px | 17.5px | 143 |
| `text-base` | 1rem | 14px | 21px | 7 |
| `text-lg` | 1.125rem | 15.75px | 24.5px (em título: 19.69px) | 12 |
| `text-xl` | 1.25rem | 17.5px | 24.5px (em título: 21.875px) | 11 |
| `text-2xl` | 1.5rem | 21px | 28px (em título: 26.25px) | 5 |
| `text-3xl` | 1.875rem | 26.25px | 31.5px (em título: 32.81px) | 9 |
| `text-4xl` | 2.25rem | 31.5px | 35px | 1 |
| Base do `body` | 14px | 14px | 22.4px (1.6) | global |
| Base do `.pos-shell` | 16px | 16px | 23.2px (1.45) | POS |

### 8.3 Estilos tipográficos identificados (dashboard web)

| Estilo | Classe(s) | Família | Tamanho | Peso | Altura de linha | Espaçamento | Cor habitual | Onde aparece |
|---|---|---|---|---|---|---|---|---|
| Título de autenticação | `h1 text-2xl font-semibold` | Outfit | 21px | 600 | 26.25px | normal | `#0F172A` | "Entrar na sua conta" **[M]** |
| Tagline da marca | `h2 text-2xl font-semibold leading-snug` | Outfit | 21px | 600 | 26.25px (leading-snug anulado) | normal | `#FFFFFF` / `#93C5FD` | Painel do Login |
| Título de página | `h1 text-xl font-semibold` (`PageHeader`) | Outfit | 17.5px | 600 | 21.875px | normal | `#0F172A` | Todas as telas do Layout **[M]** |
| Título de modal / SuccessScreen | `h2 text-base` / `h2 text-xl` | Outfit | 14px / 17.5px | 600 | 1.25 | normal | `#0F172A` | `Modal`, `SuccessScreen` |
| Título de seção ou card | `h2 text-sm font-semibold` | Outfit | 12.25px | 600 | 15.31px | normal | `#0F172A` ou `#334155` | Cards em geral **[M]** |
| Título de card em `h3` e `h4` | `h3 text-sm`, `h4 text-xs uppercase tracking-wide` | Outfit | 12.25px / 10.5px | 600 | 1.25 | 0 / 0.2625px | `#0F172A`, `#334155` | Fluxo, Split |
| Valor de KPI | `text-2xl font-semibold font-mono` | JetBrains Mono | 21px | 600 (sintetizado) | 28px | normal | `#0F172A` ou `#FFFFFF` | `StatCard` **[M]** |
| Valor de destaque | `text-3xl font-bold font-mono` | JetBrains Mono | 26.25px | 700 (sintetizado) | 31.5px | normal | `#0F172A`, `#DC2626`, `#16A34A` | `SuccessScreen`, Resultado do split |
| Valor em tabela ou lista | `text-sm font-semibold font-mono` | JetBrains Mono | 12.25px | 600 | 17.5px | normal | `#0F172A`, `#16A34A`, `#DC2626` | Operações, Despesas, Fluxo |
| Corpo | `text-sm` | Inter | 12.25px | 400 | 17.5px | normal | `#64748B` ou `#334155` | Descrições, subtítulos |
| Corpo longo | `text-sm leading-relaxed` | Inter | 12.25px | 400 | 19.91px (1.625) | normal | `#334155` | Bolhas da IA, análise **[M]** |
| Rótulo de campo | `text-sm font-medium` | Inter | 12.25px | 500 | 17.5px | normal | `#334155` | `Input`, `Select`, `Textarea`, `CurrencyInput` **[M]** |
| Texto de botão (sm) | `text-xs font-medium` | Inter | 10.5px | 500 | 14px | normal | conforme variante | `Button size="sm"` **[M]** |
| Texto de botão (md, lg) | `text-sm font-medium` | Inter | 12.25px | 500 | 17.5px | normal | conforme variante | `Button` **[M]** |
| Texto de botão (xl) | `text-base font-medium` | Inter | 14px | 500 | 21px | normal | `#FFFFFF` | Registrar venda, Simular impacto **[M]** |
| Rótulo de KPI | `text-xs font-medium uppercase tracking-wide` | Inter | 10.5px | 500 | 14px | 0.2625px (0.025em) | conforme variante | `StatCard` **[M]** |
| Cabeçalho de tabela | `text-xs font-semibold uppercase tracking-wide` | Inter | 10.5px | 600 | 14px | 0.2625px | `#94A3B8` | Operações, Despesas, Fluxo **[M]** |
| Rótulo de grupo da sidebar | `text-[10px] font-semibold uppercase tracking-widest` | Inter | 10px | 600 | 16px | 1px (0.1em) | `#4E7298` | Sidebar **[M]** |
| Item da sidebar | `text-sm font-medium` | Inter | 12.25px | 500 | 17.5px | normal | `#93C5FD` / `#FFFFFF` ativo | Sidebar **[M]** |
| Texto auxiliar | `text-xs` | Inter | 10.5px | 400 | 14px | normal | `#94A3B8` | Hints, datas, legendas |
| Microtexto legal | `text-[10px]` | Inter | 10px | 400 | 16px | normal | `#94A3B8` | Avisos de IA e simulação |
| Mensagem de validação | `text-xs` com prefixo "⚠" | Inter | 10.5px | 400 | 14px | normal | `#DC2626` | `Input`, `CurrencyInput`, formulários **[M]** |
| Link de texto | `text-xs` ou `text-sm font-medium`/`font-semibold hover:underline` | Inter | 10.5px / 12.25px | 500 / 600 | conforme classe | normal | `#1E54B7` | "Ver completo →", "Criar conta" |
| Badge (md) | `text-xs font-medium` | Inter | 10.5px | 500 | 14px | normal | conforme variante | `Badge` **[M]** |
| Badge (sm) | `text-[10px] font-medium` | Inter | 10px | 500 | 16px | normal | conforme variante | `Badge size="sm"` |
| Selo demonstrativo | `text-[10px] font-semibold uppercase tracking-wide` | Inter | 10px | 600 | 16px | 0.25px | `#A16207` | `DemoDataBadge` **[M]** |
| Selo SIMULADO (Dashboard) | `text-[10px] font-bold tracking-wide` | Inter | 10px | 700 | 16px | 0.25px | `#075985` | Dashboard |
| Selo IA no menu | `text-[9px] font-bold` | Inter | 9px | 700 | 14.4px | normal | `#FFFFFF` | Sidebar |
| Marca na sidebar | `text-sm font-semibold` + `text-[10px] font-medium` | Outfit (inline) / Inter | 12.25px / 10px | 600 / 500 | `leading-tight` (1.25) | normal | `#FFFFFF` / `#93C5FD` | Sidebar |
| Iniciais do avatar | `text-xs font-bold` | Inter | 10.5px | 700 | 14px | normal | `#FFFFFF` | Header **[M]** |

### 8.4 Estilos tipográficos do Smart POS

| Estilo | Classe(s) | Tamanho renderizado | Peso | Observação |
|---|---|---|---|---|
| Título do login POS | `h1 text-3xl font-bold` | 26.25px | 600 (font-bold anulado pela regra global) | **[M]** |
| Título do header | `h1 text-lg font-bold truncate` | 15.75px | 600 | Abaixo do mínimo de 16px exigido (seção 24) **[M]** |
| Sobretítulo da marca | `text-sm font-bold uppercase tracking-[0.16em]` | 16px (forçado) | 700 | Espaçamento 2.56px **[M]** |
| Valor principal | `text-3xl font-bold` / `text-4xl font-bold` | 26.25px / 31.5px | 700 | Inter, sem `font-mono` |
| Valor do campo de venda | `text-3xl font-bold` no contêiner | 26.25px | 700 | Input herda |
| Botão principal | `text-lg font-bold` | 15.75px | 700 | Abaixo de 16px **[C]** |
| Botão padrão | `font-bold` ou `font-semibold` | 16px | 700 / 600 | **[M]** |
| Texto de apoio | `text-sm`, `text-xs`, `small` | 16px (forçado) | 400 | Regra `.pos-shell` **[M]** |
| Item da barra inferior | `text-xs font-bold` | 16px | 700 | Rótulos se sobrepõem em 360px (seção 24) **[O]** |
| Selo SIMULADO | `text-xs font-bold tracking-wide` | 16px | 700 | Espaçamento 0.4px **[M]** |

### 8.5 Transformações, alinhamento e quebras

| Recurso | Uso |
|---|---|
| `uppercase` | Rótulos de KPI, cabeçalhos de tabela, grupos da sidebar, títulos de bloco ("NÍVEL DE ATENÇÃO", "AÇÕES RÁPIDAS"), selo demonstrativo |
| `truncate` | Descrição em listas e tabelas, nomes no header do POS |
| `whitespace-nowrap` | Datas, valores, chips de filtro, botão "Sugerir categoria" |
| `whitespace-pre-line` | Bolhas do chat da IA (preserva `\n`) |
| `line-through` | Valor bruto de operação com status "Falha" |
| `underline` / `hover:underline` | Links de texto |
| `text-center` | Telas de sucesso, estados vazios, fluxo do resultado do split, rodapé do login |
| `text-right` | Colunas numéricas de tabelas e listas |

### 8.6 Diferenças por dispositivo

Não há tamanhos de fonte responsivos (`sm:text-*`, `lg:text-*`) em nenhum arquivo **[C]**. A tipografia é idêntica em 375px, 768px e 1440px. A única variação é entre módulos: web com base 14px, POS com base 16px.


---

## 9. Espaçamentos e dimensões

### 9.1 Escala de espaçamento

O projeto usa a **escala padrão do Tailwind v4** (múltiplos de `--spacing: 0.25rem`), que com raiz de 14px gera passos de 3.5px **[C][M]**. Não há escala customizada. Os valores realmente usados e sua frequência (contagem de classes `p*`, `m*`, `gap*` e `space-*` sem prefixo responsivo; `lg:p-6` e `lg:px-6` do Layout não estão somados):

| Passo | Renderizado | Ocorrências (p, m, gap, space) | Usos típicos |
|---|---|---|---|
| 0.5 | 1.75px | 31 | `py-0.5` de badges, `mt-0.5` entre título e subtítulo, `gap-0.5` |
| 1 | 3.5px | 63 | `gap-1` de grupos segmentados, `p-1` do PeriodSelector/Tabs, `mb-1`, `mt-1` |
| 1.5 | 5.25px | 30 | `gap-1.5` entre rótulo e campo, `py-1.5` de botão `sm` e chips, `mb-1.5` |
| 2 | 7px | 106 | `gap-2` ícone e texto, `space-y-2`, `mt-2`, `mb-2`, `p-2` |
| 2.5 | 8.75px | 24 | `py-2.5` de inputs e itens da sidebar, `gap-2.5` em grades de botões, `p-2.5` |
| 3 | 10.5px | 163 | `gap-3` entre KPIs e entre botões, `p-3` de notas, `px-3` de botão `sm`, `mb-3` |
| 3.5 | 12.25px | 15 | `p-3.5` de AlertBanner, AIInsightCard e botões de forma de pagamento, `px-3.5` de inputs |
| 4 | 14px | 137 | `p-4` (Card `sm`, main mobile), `px-4`, `gap-4` entre colunas de grid, `space-y-4` de formulários |
| 5 | 17.5px | 38 | `p-5` (Card `md`, StatCard), `space-y-5` entre seções de página, `px-5` |
| 6 | 21px | 12 | `p-6` (Card `lg`, main desktop), `px-6` (Modal, header desktop), `mb-6` do PageHeader |
| 8 | 28px | 10 | `mb-8` no Login/Cadastro, `pt-8` de telas de sucesso, `py-8` do POS |
| 9 | 31.5px | 1 | `pr-9` do Select (espaço do chevron) |
| 10 | 35px | 4 | `pl-10` do CurrencyInput, `pr-10` do campo de percentual, `py-10` do SuccessScreen |
| 12 | 42px | 3 | `p-12` do painel de marca, `py-12` de Login e Cadastro |
| 14 | 49px | 1 | `mb-14` do logo no painel de marca |
| 16 | 56px | 2 | `py-16` de EmptyState e ErrorState |
| 20 | 70px | 2 | `py-20` de LoadingOverlay e Resultado sem dados |

**Conclusão:** a escala é consistente no sentido de que todos os valores pertencem à grade de 3.5px, mas a **escolha do passo varia por tela** para elementos equivalentes (seção 23).

### 9.2 Ritmo vertical por contexto

| Contexto | Valor | Classe | Fonte |
|---|---|---|---|
| Entre seções de uma página do Layout | 17.5px | `space-y-5` | Dashboard, Operações, Despesas, Fluxo, Split, IA, Configurações |
| Entre campos de formulário | 14px | `space-y-4` | Login, Cadastro, Nova despesa, Configurações |
| Entre campos (aba Segurança) | 10.5px | `space-y-3` | Configurações |
| Entre cards de formulário | 17.5px (venda) / 14px (despesa) | `space-y-5` / `space-y-4` | Nova venda / Nova despesa |
| Rótulo para campo | 5.25px | `gap-1.5` | `Input`, `Select`, `Textarea`, `CurrencyInput` |
| Campo para mensagem de erro | 5.25px | `gap-1.5` | Idem |
| Título para subtítulo | 1.75px | `mt-0.5` | `PageHeader` |
| PageHeader para conteúdo | 21px | `mb-6` | `PageHeader` |
| Título de card para conteúdo | 0px renderizado | `mb-3`, `mb-4`, `mb-5` em `h2` e `h3` anulados pela regra global | Ver 6.3 item 2 **[M]** |
| Ícone para texto em botão | 7px | `gap-2` | `Button` |
| Ícone para texto em item de menu | 10.5px | `gap-3` | Sidebar |
| Entre grupos do menu | 17.5px | `space-y-5` | Sidebar |
| Rótulo do grupo para itens | 5.25px | `mb-1.5` | Sidebar |
| Entre itens do menu | 1.75px | `mb-0.5` | Sidebar |
| Entre KPIs | 10.5px | `gap-3` | Dashboard, Fluxo, Detalhe |
| Entre colunas de conteúdo | 14px / 17.5px | `gap-4` / `gap-5` | Dashboard, Fluxo / IA |
| Entre bolhas do chat | 14px | `space-y-4` | IA |
| POS: entre blocos | 14px / 17.5px | `space-y-4` / `space-y-5` | POS |

### 9.3 Espaçamentos internos (padding) de componentes

| Componente | Classe | Renderizado (vertical × horizontal) |
|---|---|---|
| `Button sm` | `px-3 py-1.5` | 5.25px × 10.5px |
| `Button md` | `px-4 py-2` | 7px × 14px |
| `Button lg` | `px-5 py-2.5` | 8.75px × 17.5px |
| `Button xl` | `px-6 py-4` | 14px × 21px |
| `Card sm / md / lg` | `p-4 / p-5 / p-6` | 14px / 17.5px / 21px |
| `StatCard` | `p-5` | 17.5px |
| `Input`, `Select`, `Textarea` | `py-2.5 px-3.5` | 8.75px × 12.25px (com ícone à esquerda: 31.5px; com ícone à direita: 31.5px) |
| `CurrencyInput md` | `py-2.5 pl-10 pr-3.5` | 8.75px; esquerda 35px; direita 12.25px |
| `CurrencyInput lg` | `py-3` | 10.5px |
| `CurrencyInput xl` | `py-4` | 14px |
| `Badge md / sm` | `px-2.5 py-0.5` / `px-1.5 py-0.5` | 1.75px × 8.75px / 1.75px × 5.25px |
| `AlertBanner` | `px-4 py-3.5` | 12.25px × 14px |
| `AIInsightCard` | `p-3.5` | 12.25px |
| `Modal` header / corpo / rodapé | `px-6 py-4` / `px-6 py-5` / `px-6 py-4` | 14×21 / 17.5×21 / 14×21 |
| `Toast` | `px-4 py-3` | 10.5px × 14px |
| Item da sidebar | `px-3 py-2.5` | 8.75px × 10.5px |
| Área do logo da sidebar | `px-5 py-5` | 17.5px |
| Card do estabelecimento | `px-4 py-3 mx-3 mt-3` | 10.5px × 14px, margem 10.5px |
| `nav` da sidebar | `px-3 py-4` | 14px × 10.5px |
| Header | `px-4 lg:px-6` | 14px / 21px |
| `main` | `p-4 lg:p-6` | 14px / 21px |
| Linha de tabela | `px-4 py-3` | 10.5px × 14px |
| Cabeçalho de tabela | `px-4 py-2.5` | 8.75px × 14px |
| Painel de marca do Login | `p-12` | 42px |
| Bolha do chat | `px-4 py-3` | 10.5px × 14px |

### 9.4 Dimensões fixas

| Elemento | Classe | Renderizado | Fonte |
|---|---|---|---|
| Sidebar (largura) | `w-60` | 210px | `Layout.tsx` 49 **[M]** |
| Header (altura) | `h-14` | 49px | `Layout.tsx` 113 **[M]** |
| Logo da sidebar | `w-8 h-8 rounded-lg` | 28×28px, raio 14px | `Layout.tsx` 54 |
| Avatar do header | `w-8 h-8 rounded-lg` | 28×28px, raio 14px | `Layout.tsx` 128 **[M]** |
| Botão de notificação | `p-2` + ícone 16px | 30×30px | **[M]** |
| Indicador de notificação | `w-2 h-2` | 7×7px, `#DC2626` | `Layout.tsx` 125 |
| Painel de marca do Login | `w-[420px]` | 420px × 100vh | `LoginPage.tsx` 26 **[M]** |
| Coluna do formulário de Login | `max-w-[360px]` | 360px | **[M]** |
| Coluna do Cadastro | `max-w-[380px]` | 380px | **[M]** |
| Logo do Login | `w-10 h-10 rounded-xl` (desktop), `w-9 h-9` (mobile) | 35px / 31.5px, raio 20px | |
| Botão voltar (PageHeader) | `w-8 h-8` | 28×28px | **[M]** |
| Botão voltar (Cadastro) | `w-9 h-9 rounded-xl` | 31.5×31.5px, raio 20px | **[M]** |
| `Input`, `Select` | altura resultante | 37px | **[M]** |
| `CurrencyInput lg` | altura resultante | 44px | **[M]** |
| `CurrencyInput xl` | altura resultante | 58px **[E]** (14+28+14+2 pela soma das regras) | |
| `Button sm / md / lg / xl` | altura resultante | 24.5 / 31.5 / 35 / 49px | **[M]** sm, lg, xl; md **[E]** pela mesma regra |
| `Toggle` | `w-10 h-6`, botão `w-5 h-5` | 35×21px, botão 17.5px, deslocamento 14px | **[M]** |
| Ícone de EmptyState/ErrorState | `w-14 h-14 rounded-2xl` | 49×49px, raio 14px | |
| Ícone de SuccessScreen | `w-16 h-16 rounded-full` | 56×56px | |
| Ícone da IA (card) | `w-6 h-6 rounded-lg` | 21×21px | |
| Avatar da IA (chat) | `w-8 h-8` (header) / `w-7 h-7` (mensagens) | 28px / 24.5px | |
| Card do chat | `style={{ height: 480 }}` | 480px fixos (px reais, não rem) | `IAAnalisePage.tsx` 212 **[M]** |
| Botão enviar do chat | `w-9 h-9 rounded-xl` | 31.5px, raio 20px | **[M]** |
| Gráfico do Dashboard | `ResponsiveContainer height={180}` | 100% × 180px | **[C]** |
| Gráfico do Fluxo de Caixa | `ResponsiveContainer height={260}` | 100% × 260px | **[M]** |
| Barra de composição | `h-4` | 14px | |
| Ponto de legenda | `h-2 w-2` | 7px | |
| Ponto de status em lista | `w-1.5 h-1.5` | 5.25px | |
| Moldura do POS | `max-w-[360px] min-h-[640px] max-h-[760px] h-screen` | 360 × min(100vh, 760)px, mínimo 640px | `POSPage.tsx` 133 **[M]** |
| Header do POS | conteúdo + `pt-3 pb-4 px-4` | 67px | **[M]** |
| Barra inferior do POS | `grid-cols-5`, botões `min-h-14` | 360 × 57px; botões 70.6 × 49px | **[M]** |
| Alvos de toque do POS | `min-h-12` / `min-h-14` / `min-h-16` / `min-h-20` | 42 / 49 / 56 / 70px | **[M]** |

### 9.5 Larguras máximas de conteúdo

| Classe | Renderizado | Telas |
|---|---|---|
| `max-w-5xl` | 896px | Dashboard, Fluxo de Caixa, Análise com IA |
| `max-w-4xl` | 784px | Operações, Despesas |
| `max-w-3xl` | 672px | Detalhe da operação |
| `max-w-2xl` | 588px (centralizado `mx-auto`) | Configurações |
| `max-w-lg` | 448px (centralizado) | Simulação, Resultado, Modal |
| `max-w-md` | 392px (centralizado) | Registrar venda, Registrar despesa |
| `max-w-sm` | 336px (centralizado) | Telas de sucesso, Resultado sem dados |
| `max-w-xs` | 280px | Texto de EmptyState, botões de SuccessScreen |
| `max-w-[80%]` | 80% do contêiner | Bolhas do chat |

As telas com `max-w-5xl`, `4xl` e `3xl` **não** são centralizadas: ficam alinhadas à esquerda do `main`, deixando espaço vazio à direita em telas largas **[C][O]**. As telas de formulário são centralizadas.

### 9.6 Dimensões dependentes de conteúdo ou viewport

| Elemento | Regra |
|---|---|
| Shell do Layout | `flex h-screen overflow-hidden`; `main` com `flex-1 overflow-y-auto` (somente o `main` rola) |
| Área útil do conteúdo (desktop 1440px) | 1440 − 210 (sidebar) − 2×21 (padding) = 1188px, limitada pelo `max-w` da tela **[M]** |
| Área útil (mobile 375px) | 375 − 2×14 = 347px **[M]** |
| Grades de KPI | `grid-cols-2 lg:grid-cols-4` com `gap-3`: 216.13px por card em 1440px; 168.25px em 375px **[M]** |
| Tabelas em grade | `grid-cols-[1fr_auto_auto_auto_auto]`: a coluna de descrição absorve o espaço restante |
| Painel de marca | Altura total (`min-h-screen`), `justify-between` empurra o copyright para baixo |

---

## 10. Bordas e sombras

### 10.1 Bordas

| Uso | Espessura | Estilo | Cor | Classe |
|---|---|---|---|---|
| Card, Input, Select, Textarea, Modal | 1px | sólida | `#E2E8F0` | `border border-[#E2E8F0]` |
| Campo com erro | 1px | sólida | `#DC2626` | `border-[#DC2626]` |
| Campo focado | 1px | sólida | `#1E54B7` | `focus:border-[#1E54B7]` |
| Botão `outline` | 1px | sólida | `#E2E8F0`, hover `#CBD5E1` | |
| Header (base) | 1px | sólida | `#E2E8F0` | `border-b` |
| Sidebar: divisórias | 1px | sólida | branco a 10% | `border-white/10` |
| Divisória de lista | 1px | sólida | `#F8FAFC` ou `#F1F5F9` | `divide-y`, `border-b` |
| Card de projeção | 1px | **tracejada** | `#E2E8F0` | `border-dashed` (Fluxo) |
| Legenda de projeção | 1px / 2px | tracejada | `#CBD5E1` | `border-t border-dashed` |
| Linha do tempo (web) | 2px | sólida | `#BFDBFE` | `border-l-2` |
| Linha do tempo (POS) | 1px | sólida | `blue-300` | `border-l` |
| Destino da parcela (POS) | 4px | sólida | `green-500` | `border-l-4` |
| Campo de valor (POS) | 2px | sólida | `#1F4E9E` | `border-2` |
| Spinner do processamento (POS) | 4px | sólida | `blue-100`, topo `#1F4E9E` | `border-4` |
| Variações semânticas | 1px | sólida | `#BBF7D0`, `#FDE68A`, `#FCA5A5`, `#BFDBFE` | StatCard, AlertBanner, AIInsightCard |

### 10.2 Raios

O bloco `@theme` redefine os raios `sm`, `md`, `lg` e `xl` em **px** **[C]**. Os demais vêm do Tailwind e escalam com o rem de 14px. Isso cria uma **inversão**: `rounded-2xl` (14px) fica **menor** que `rounded-xl` (20px) **[M]**.

| Classe | Declarado | Renderizado | Ocorrências | Usos |
|---|---|---|---|---|
| `rounded` | 0.25rem | 3.5px | 4 | Etiqueta "REALIZADO → ← PROJEÇÃO", legendas |
| `rounded-sm` (e `-bl-sm`, `-br-sm`) | 6px | 6px | 3 | Canto "rabo" das bolhas do chat |
| `rounded-md` | 10px | 10px | 2 | Opção ativa do PeriodSelector e Tabs |
| `rounded-lg` | 14px | 14px | 37 | Button, Input, Select, item da sidebar, avatar, chips, logo |
| `rounded-xl` | 20px | 20px | 85 | Card, StatCard, AlertBanner, Toast, card do estabelecimento, botões grandes |
| `rounded-2xl` | 1rem | 14px | 31 | Modal, bolhas do chat, EmptyState, avatar de Configurações, cards do POS |
| `rounded-full` | infinito | pílula | 27 | Badge, Toggle, selos, pontos |
| `rounded-t` | 0.25rem | 3.5px no topo | 1 | Barras de tendência do POS |

### 10.3 Sombras

| Classe | Valor exato (CSS compilado) | Usos |
|---|---|---|
| `shadow-sm` | `0 1px 3px 0 #0000001A, 0 1px 2px -1px #0000001A` | Button primary, danger e success; item ativo da sidebar; opção ativa de PeriodSelector, Tabs e abas de Configurações; botão do Toggle |
| `hover:shadow-md` | `0 4px 6px -1px #0000001A, 0 2px 4px -2px #0000001A` | Card e StatCard quando recebem `onClick` |
| `shadow-lg` | `0 10px 15px -3px #0000001A, 0 4px 6px -4px #0000001A` | Toast |
| `shadow-2xl` | `0 25px 50px -12px #00000040` | Modal, moldura do POS |
| `ring-2` (foco de campo) | `0 0 0 2px` na cor `#1E54B7` a 15% | Input, Select, Textarea, CurrencyInput |

**Elevação:** plano (cards, borda), nível 1 (`shadow-sm`, controles), nível 2 (`shadow-md`, hover clicável), nível 3 (`shadow-lg`, toast), nível 4 (`shadow-2xl`, modal e POS). Cards nunca têm sombra em repouso **[C]**.

### 10.4 Separadores

| Componente | Implementação |
|---|---|
| `Divider` sem rótulo | `<hr class="border-[#E2E8F0]">` |
| `Divider` com rótulo | Duas `hr` flexíveis com texto `text-xs #94A3B8` ao centro, `gap-3`. Usado em "ou" no Login |
| Divisória de seção em card | `border-t border-[#F1F5F9]` com `pt-2`, `pt-3` ou `mt-3` |
| Divisória de lista | `divide-y divide-[#F8FAFC]` (quase invisível sobre branco, contraste 1.04:1) ou `divide-[#F1F5F9]` |

---

## 11. Ícones, imagens e recursos visuais

### 11.1 Biblioteca de ícones

**Não há biblioteca de ícones** **[C]**: `package.json` contém apenas `react`, `react-dom` e `recharts` como dependências de execução. Todos os ícones são **SVG inline desenhados à mão** dentro dos componentes, com `stroke="currentColor"` ou `fill="currentColor"`, herdando a cor do texto.

### 11.2 Inventário de ícones SVG

| Ícone | viewBox | Exibição | Traço | Onde | Arquivo |
|---|---|---|---|---|---|
| Logo (arco + ponto) | 16 / 20 | 16px (sidebar), 20px (Login desktop), 18px (Login mobile) | 1.5 / 1.8, branco | Marca | `Layout.tsx` 55, `LoginPage.tsx` 37 e 79 |
| `IconGrid` | 16 | 16px | preenchido, opacidade 0.7 em 2 quadrados | Menu Dashboard | `Layout.tsx` 144 |
| `IconCart` | 16 | 16px | 1.5 | Menu Operações | 145 |
| `IconArrowDown` | 16 | 16px | 1.5 | Menu Despesas | 146 |
| `IconChart` | 16 | 16px | 1.5 | Menu Fluxo de Caixa | 147 |
| `IconSplit` | 16 | 16px | 1.5 | Menu Simulação Split | 148 |
| `IconSparkle` (estrela) | 16 | 16px menu; 12, 11 e 14px na IA | preenchido | Menu IA e todos os cabeçalhos de IA (cor `#1D4ED8`) | 149, `ui.tsx` 392, `IAAnalisePage.tsx` |
| `IconGear` | 16 | 16px | 1.5 | Menu Configurações | 150 |
| `IconPos` | 16 | 16px | 1.5 | Menu Modo POS | 151 |
| `IconLogout` | 16 | 16px | 1.5 | Sair | 152 |
| `IconBell` | 16 | 16px | 1.5 | Notificações | 153 |
| `IconMenu` (hambúrguer) | 18 | 18px | 1.5 | Abrir menu no mobile | 154 |
| Chevron voltar | 16 | 16px | 1.5 | PageHeader, Cadastro | `ui.tsx` 277 |
| Chevron do Select | 12 | 12px | 1.5 | Select | `ui.tsx` 139 |
| Envelope, cadeado | 16 | 14px | 1.5 | Campos do Login | `LoginPage.tsx` 102 e 112 |
| Olho / olho cortado | 16 | 14px | 1.5 | Mostrar senha | `LoginPage.tsx` 115, `CadastroPage.tsx` 183 |
| Lupa | 16 | 13px | 1.5 | Busca em Operações e Despesas | |
| Mais | 14 | 12px | 2 | Botões "Nova operação", "Nova despesa" | |
| Prancheta, sacola | 24 | 24px | 1.5 | EmptyState | `ui.tsx` 486, `VendasPage.tsx` |
| Cartão, linha, setas | 16 | 16px | 1.5 | Ícones de StatCard | `DashboardPage.tsx` |
| Seta para baixo | 20×24 | 20×24px | 1.5 | Fluxo do resultado | `SplitResultadoPage.tsx` |
| Avião de papel | 16 | 14px | preenchido | Enviar pergunta | `IAAnalisePage.tsx` 270 |
| Spinner | 24 | 14, 16, 20, 28px | 3 | `Spinner` | `ui.tsx` 49 |
| POS `Icon` (`back`, `check`, `warning`, `arrow`) | 24 | 20px (`h-5 w-5`) | 2 | Todo o POS | `POSPage.tsx` 29 a 37 |

### 11.3 Glifos de texto e emojis usados como ícone

| Caractere | Uso | Arquivo |
|---|---|---|
| ⚡ 💳 🏧 💵 📄 | Ícones das formas de pagamento (`text-xl`) | `NovaVendaPage.tsx` 7 e 8 |
| 💡 | Ícone do AlertBanner `info` | `ui.tsx` 338 |
| ⚠ | Prefixo de erros e AlertBanner `warning` | `ui.tsx`, páginas |
| ✓ ! i | Toast, AlertBanner, SuccessScreen, ErrorState | `ui.tsx` |
| ✕ | Fechar alerta e modal | `ui.tsx` |
| ↑ ↓ | Tendência no StatCard (`aria-hidden`) | `ui.tsx` 318 |
| → ← ↗ % + − | Links, ações rápidas, etapas | Várias |
| ◉ | Selo "Dados demonstrativos" | `ui.tsx` 669 |
| 01 02 03 | Marcadores numéricos em quadrados | Login, Resultado do split |

Os emojis renderizam com a fonte de emoji do sistema operacional, portanto sua aparência varia entre Android, Windows, macOS e Linux **[O]**. Por orientação deste documento, eles **não** devem ser trocados sem necessidade técnica; a necessidade técnica existente é a falta de padronização entre plataformas e a ausência de nome acessível, registrada na seção 24 como observação, não como substituição obrigatória.

### 11.4 Imagens

| Arquivo | Formato | Dimensões | Proporção | Conteúdo | Usado no código? |
|---|---|---|---|---|---|
| `images/5555d7bf0b03…812c` | PNG RGBA | 2560 × 2160 | 1.185:1 | Captura da tela de Login gerada pelo Figma Make **[O]** (mesma composição da miniatura) | **Não** **[C]** |
| `images/91e7c68d6530…c89c` | PNG RGBA | 320 × 270 | 1.185:1 | Miniatura da tela de Login **[O]** | **Não** **[C]** |
| `thumbnail.png` | PNG | 400 × 353 (`meta.json`) | 1.133:1 | Miniatura do arquivo no Figma | **Não** |

O protótipo **não contém** `<img>`, imagens de fundo, ilustrações, logotipo em arquivo nem favicon **[C]**. Os únicos elementos decorativos são dois círculos com 5% de opacidade no painel de marca do Login (224px e 168px, classes `w-64` e `w-48`, `-top-24 -right-24` e `-bottom-16 -left-16`, ou seja, deslocados 84px e 56px para fora) **[C]**.


---

## 12. Inventário de componentes

### 12.1 Componentes exportados de `src/components/ui.tsx`

| # | Componente | Linhas | Tipo | Telas que usam |
|---|---|---|---|---|
| C01 | `Button` | 4 a 44 | Ação | Todas as telas web |
| C02 | `Spinner` | 47 a 54 | Feedback | Button (loading), AIAnalysisCard, LoadingOverlay, Nova despesa |
| C03 | `Card` | 57 a 73 | Contêiner | Todas as telas do Layout |
| C04 | `Badge` | 76 a 92 | Indicador | Operações, Detalhe, Despesas, Fluxo, Split, Resultado, IA |
| C05 | `Input` | 95 a 119 | Formulário | Login, Cadastro, Operações, Despesas, Nova despesa, Configurações |
| C06 | `Select` | 122 a 146 | Formulário | Operações, Despesas, Nova despesa, Configurações |
| C07 | `Textarea` | 149 a 161 | Formulário | **Nenhuma** (exportado, não usado) |
| C08 | `Toggle` | 164 a 181 | Formulário | Nova despesa, Configurações |
| C09 | `CurrencyInput` | 184 a 212 | Formulário | Nova venda, Nova despesa, Simulação |
| C10 | `PeriodSelector` | 215 a 237 | Controle segmentado | Dashboard |
| C11 | `EmptyState` | 240 a 251 | Estado | Operações, Despesas, `TransactionList` |
| C12 | `ErrorState` | 254 a 266 | Estado | **Nenhuma** |
| C13 | `PageHeader` | 269 a 288 | Cabeçalho | Todas as telas do Layout exceto Dashboard |
| C14 | `StatCard` | 291 a 324 | Indicador (KPI) | Dashboard, Fluxo de Caixa |
| C15 | `AlertBanner` | 327 a 357 | Alerta | Dashboard |
| C16 | `FinancialSimulationDisclaimer` | 360 a 380 | Aviso legal | Simulação, Resultado |
| C17 | `AIAnalysisCard` | 383 a 440 | Domínio (IA) | Dashboard |
| C18 | `AIInsightCard` | 443 a 461 | Domínio (IA) | Dashboard, Análise com IA |
| C19 | `LoadingOverlay` | 464 a 471 | Estado | Dashboard |
| C20 | `TransactionList` | 474 a 520 | Lista | **Nenhuma** |
| C21 | `ToastProvider` / `useToast` | 523 a 551 | Notificação | Provider em `App.tsx`; `useToast` **nunca chamado** |
| C22 | `Tabs` | 554 a 570 | Navegação | Fluxo de Caixa |
| C23 | `Modal` | 573 a 597 | Diálogo | **Nenhuma** |
| C24 | `SuccessScreen` | 600 a 616 | Estado | Nova venda, Nova despesa |
| C25 | `Divider` | 619 a 628 | Separador | Login |
| C26 | `AITypingIndicator` | 631 a 642 | Domínio (IA) | Resultado, Análise com IA |
| C27 | `DemoDataBadge` | 666 a 672 | Selo | Dashboard, Operações, Despesas, Fluxo, Análise com IA |
| F1 | `formatCurrency(value, compact)` | 645 a 650 | Utilitário | `R$ 1.234,56` ou `R$ 1,2k` |
| F2 | `formatDate(yyyy-mm-dd)` | 652 a 656 | Utilitário | `dd/mm/aaaa` |
| F3 | `paymentLabel(method)` | 658 a 663 | Utilitário | `pix` → `PIX` etc. |

### 12.2 Componentes do shell (`src/components/Layout.tsx`)

| # | Elemento | Descrição |
|---|---|---|
| L01 | `Layout` | Contêiner `flex h-screen` com sidebar, header e `main` rolável |
| L02 | Sidebar (`aside`) | Logo, card do estabelecimento, navegação agrupada em 5 grupos, botão Sair |
| L03 | Header | Botão de menu (mobile), data por extenso, sino, atalho de perfil |
| L04 | Overlay mobile | `fixed inset-0 bg-black/40 z-20`, fecha a sidebar ao clicar |
| L05 | 11 ícones SVG | Seção 11.2 |

### 12.3 Padrões recorrentes não componentizados (inline nas páginas)

| # | Padrão | Ocorrências | Arquivos | Deveria compartilhar implementação com |
|---|---|---|---|---|
| X01 | Selo "SIMULADO" | 2 implementações web (span manual no Dashboard e `Badge variant="info"`) + 1 no POS (`Simulated`) | Dashboard, Operações, Detalhe, Fluxo, Split, Resultado, POS | Um único componente `SimulatedBadge` |
| X02 | Nota de responsabilidade (`rounded-xl bg-[#F8FAFC] p-3 text-xs text-[#64748B]`) | 3 web + 1 bloco azul em Configurações + `ResponsibilityNotice` no POS | Dashboard, Operações, Detalhe, Fluxo, Configurações, POS | `FinancialSimulationDisclaimer` (já existe, mas tem outro texto) |
| X03 | Cabeçalho de card de IA (ícone estrela em quadrado 21px + título + "Análise gerada por IA") | 6 cópias do cabeçalho; o caminho SVG da estrela aparece 11 vezes no projeto | `ui.tsx` (AIAnalysisCard), Resultado (1×), Análise com IA (4×) | `AIAnalysisCard` |
| X04 | Chips de filtro de status | 2 cópias idênticas | Operações, Despesas | Componente `FilterChips` |
| X05 | Barra de abas segmentada | 3 variantes (`PeriodSelector`, `Tabs`, abas de Configurações) | `ui.tsx`, Configurações | `Tabs` |
| X06 | Botões de estado da IA (demo) | 1 | Análise com IA | X04 |
| X07 | Tabela em grade CSS | 2 (Operações, Despesas) + 1 `<table>` real (Fluxo) | | Componente `DataTable` |
| X08 | Campo de texto inline fora do `Input` | 3 (descrição em Nova despesa, percentual em Simulação, pergunta do chat) | | `Input` com `iconRight`/`addon` |
| X09 | Bloco informativo azul (`bg-[#EFF6FF] border-[#BFDBFE]`) | 5 | Login, Detalhe, Nova despesa, Configurações | `AlertBanner type="info"` |
| X10 | Linha "rótulo + valor" | Diversas | Resultado, Split, Detalhe, POS | Componente `KeyValueRow` |

---

## 13. Especificação dos componentes

As medidas abaixo usam a raiz de 14px. A coluna "Classe" permite reproduzir no próprio Tailwind; a coluna "Renderizado" permite reproduzir em qualquer tecnologia.

### 13.1 C01 · `Button`

| Item | Especificação |
|---|---|
| Finalidade | Ação primária, secundária, neutra ou destrutiva |
| Estrutura | `<button>` → [Spinner ou `icon`] + `children` + [`iconRight`] |
| Base | `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer border-0 select-none` |
| Propriedades | `variant`: `primary` (padrão), `secondary`, `ghost`, `danger`, `success`, `outline`; `size`: `sm`, `md` (padrão), `lg`, `xl`; `loading`; `icon`; `iconRight`; `fullWidth`; todos os atributos nativos de `button` |
| Raio | 14px |
| Espaço ícone/texto | 7px |
| Transição | todas as propriedades, 150ms, `cubic-bezier(0.4, 0, 0.2, 1)` |
| Desabilitado ou carregando | `opacity-50 cursor-not-allowed`; atributo `disabled` aplicado nos dois casos |
| Carregando | Substitui `icon` por `Spinner` (14px em `sm`, 16px nos demais) e oculta `iconRight`; o texto continua visível |
| Dependências | `Spinner` |
| Reutilização | Alta. Não usado no POS |

Variantes (cores confirmadas no código):

| Variante | Fundo | Texto | Borda | Hover | Active | Sombra | Cor de foco declarada |
|---|---|---|---|---|---|---|---|
| `primary` | `#1E54B7` | `#FFFFFF` | nenhuma | `#1844A0` | `#143590` | `shadow-sm` | `#1E54B7` (sobrescrita para `#2563EB`, ver 6.3) |
| `secondary` | `#0F2544` | `#FFFFFF` | nenhuma | `#1A3860` | `#0A1A30` | nenhuma | `#0F2544` (idem) |
| `ghost` | transparente | `#334155` | nenhuma | `#F1F5F9` | `#E2E8F0` | nenhuma | `#1E54B7` (idem) |
| `danger` | `#DC2626` | `#FFFFFF` | nenhuma | `#B91C1C` | sem estado | `shadow-sm` | `#DC2626` (idem) |
| `success` | `#16A34A` | `#FFFFFF` | nenhuma | `#15803D` | sem estado | `shadow-sm` | `#16A34A` (idem) |
| `outline` | transparente | `#334155` | 1px `#E2E8F0` | fundo `#F8FAFC`, borda `#CBD5E1` | sem estado | nenhuma | `#1E54B7` (idem) |

Tamanhos:

| Tamanho | Padding (classe) | Padding renderizado | Fonte | Altura renderizada |
|---|---|---|---|---|
| `sm` | `px-3 py-1.5` | 5.25 × 10.5px | 10.5px / 500 | 24.5px **[M]** |
| `md` | `px-4 py-2` | 7 × 14px | 12.25px / 500 | 31.5px **[E]** (soma: 7 + 17.5 + 7) |
| `lg` | `px-5 py-2.5` | 8.75 × 17.5px | 12.25px / 500 | 35px **[M]** |
| `xl` | `px-6 py-4` | 14 × 21px | 14px / 500 | 49px **[M]** |

Uso por variante: `primary` em quase todas as ações; `outline` em Exportar, Tentar novamente, Entender melhor, Ajustar simulação, Sair, Encerrar outras sessões; `ghost` em "Ver todas" e "Cancelar"; `danger` em "Ver" (despesas vencidas) e "Confirmar" saída; `secondary` e `success` **não são usados** **[C]**.

### 13.2 C02 · `Spinner`

SVG 24×24 com círculo de fundo (traço 3, `strokeDasharray 60`, `strokeDashoffset 15`, opacidade 0.2) e arco de 90° (traço 3, ponta arredondada). Classe `animate-spin` (rotação 360°, 1s, linear, infinita). `aria-label="Carregando"`. Propriedades `size` (padrão 20) e `color` (padrão `currentColor`). Tamanhos usados: 12, 14, 16, 28px.

### 13.3 C03 · `Card`

| Item | Especificação |
|---|---|
| Classe base | `bg-white rounded-xl border border-[#E2E8F0]` |
| Renderizado | Fundo `#FFFFFF`, borda 1px `#E2E8F0`, raio 20px, sem sombra |
| `padding` | `none` (0), `sm` (14px), `md` (17.5px, padrão), `lg` (21px, não usado) |
| `as` | `div` (padrão), `section`, `article` |
| `onClick` | Adiciona `cursor-pointer hover:shadow-md transition-shadow duration-150`. Nenhuma tela passa `onClick` **[C]** |
| Acessibilidade | Quando clicável vira `div` com `onClick`, sem `role="button"` nem `tabIndex` **[C]** |

### 13.4 C04 · `Badge`

`inline-flex items-center gap-1 font-medium rounded-full`.

| Variante | Fundo | Texto | Uso |
|---|---|---|---|
| `default` | `#F1F5F9` | `#475569` | Forma de pagamento, categoria |
| `success` | `#DCFCE7` | `#15803D` | Concluída, Pago, Online |
| `warning` | `#FEF9C3` | `#A16207` | Pendente, Moderada |
| `danger` | `#FEE2E2` | `#DC2626` | Falha, Vencido |
| `info` | `#DBEAFE` | `#1D4ED8` | SIMULADO, Recorrente |
| `blue` | `#1E3A5F` | `#FFFFFF` | Não usado |

| Tamanho | Padding | Fonte | Altura |
|---|---|---|---|
| `sm` | 1.75 × 5.25px | 10px / 500 | 19.5px **[E]** |
| `md` | 1.75 × 8.75px | 10.5px / 500 | 17.5px **[M]** |

Observação: o `sm` fica **mais alto** que o `md` porque `text-[10px]` herda a altura de linha 1.6 (16px) enquanto `text-xs` tem 14px **[M]**.

### 13.5 C05 · `Input`

| Item | Especificação |
|---|---|
| Estrutura | `div.flex-col.gap-1.5` → [`label`] → `div.relative` → [ícone esquerdo absoluto `left-3`] + `input` + [ícone direito absoluto `right-3`] → [erro `p[role=alert]`] ou [dica] |
| Rótulo | 12.25px, 500, `#334155`, associado por `htmlFor`/`id` |
| `id` automático | `label.toLowerCase().replace(/\s+/g, '-')`. Ex.: "Seu nome *" vira `seu-nome-*` **[C]** |
| Campo | Largura 100%, fundo `#FFFFFF`, borda 1px `#E2E8F0`, raio 14px, padding 8.75px × 12.25px, fonte 12.25px `#0F172A`, placeholder `#94A3B8`, altura 37px **[M]** |
| Com ícone | Padding esquerdo 31.5px; ícone `#94A3B8`, `pointer-events-none` (o da direita aceita clique) |
| Foco | Borda `#1E54B7`, anel 2px `#1E54B7`/15%, contorno global 2px `#2563EB` com deslocamento 2px **[M]** |
| Erro | Borda `#DC2626`, anel de foco `#DC2626`/20%, `aria-invalid="true"`, mensagem 10.5px `#DC2626` com "⚠" e `role="alert"`, ligada por `aria-describedby` |
| Dica | 10.5px `#94A3B8`, oculta quando há erro |
| Transição | `transition-colors` 150ms |

### 13.6 C06 · `Select`

Mesmo visual do `Input` (altura 37px **[M]**) com `appearance-none`, padding direito 31.5px e chevron SVG 12px `#94A3B8` posicionado a 10.5px da direita, centralizado verticalmente. Erro apenas muda a borda e exibe mensagem (sem "⚠" e sem `aria-invalid`). Sem rótulo, o campo não tem nome acessível (caso dos filtros em Operações e Despesas) **[C]**.

### 13.7 C07 · `Textarea`

Mesmo visual do `Input`, `resize-none`. O `label` não tem `htmlFor` **[C]**. Não é usado.

### 13.8 C08 · `Toggle`

| Item | Especificação |
|---|---|
| Estrutura | `label` → `button[role=switch][aria-checked]` com `span` interno → [texto] |
| Trilho | 35 × 21px, pílula; desligado `#CBD5E1`, ligado `#1E54B7`; `transition-colors` 200ms |
| Botão | 17.5px, branco, `shadow-sm`, inset 1.75px; desloca 14px (`translate-x-4`) quando ligado; `transition-transform` 200ms |
| Foco | Contorno global 2px `#2563EB` |
| `id` padrão | `"toggle"`. Em Configurações três toggles sem `id` compartilham `id="toggle"` **[C]** (IDs duplicados) |
| Desabilitado | Não suportado. O toggle "Tema escuro" usa `onChange={() => {}}` e continua clicável sem efeito **[C]** |

### 13.9 C09 · `CurrencyInput`

Prefixo "R$" absoluto a 12.25px da esquerda (`#94A3B8`, 500; `text-xl` no tamanho `xl`), campo `type="text" inputMode="decimal"`, fonte monoespaçada, padding esquerdo 35px.

| Tamanho | Padding vertical | Fonte | Altura |
|---|---|---|---|
| `md` | 8.75px | 12.25px | 37px **[E]** |
| `lg` | 10.5px | 14px / 600 | 44px **[M]** |
| `xl` | 14px | 21px / 700 | 58px **[E]** |

Sem máscara: aceita qualquer texto; a conversão usa `replace(',', '.')` **[C]**. O `label` não tem `htmlFor` **[C]**.

### 13.10 C10 · `PeriodSelector`

Contêiner `role="group" aria-label="Selecionar período"`, fundo `#F1F5F9`, raio 14px, padding 3.5px, espaço 3.5px; altura 31.5px **[M]**. Opções "Hoje", "7 dias", "30 dias" com `aria-pressed`. Ativa: fundo branco, texto `#0F172A`, raio 10px, `shadow-sm`. Inativa: `#64748B`, hover `#334155`. Fonte 10.5px/500, padding 5.25 × 10.5px, altura 24.5px **[M]**.

### 13.11 C11 · `EmptyState` e C12 · `ErrorState`

Coluna centralizada, padding 56px × 14px. Ícone em quadrado 49px raio 14px (`#F1F5F9`/`#94A3B8` no vazio; `#FEF2F2`/`#DC2626` com "!" no erro). Título `h3` 12.25px/600 `#334155`. Descrição 12.25px `#94A3B8`, largura máx. 280px, altura de linha 1.625. Ação abaixo (botão `sm`). ErrorState tem texto fixo "Não foi possível concluir esta operação" e botões "Tentar novamente" e "Voltar".

### 13.12 C13 · `PageHeader`

`flex items-start justify-between gap-4 mb-6`. Esquerda: [botão voltar 28px, raio 14px, `#64748B`, hover `#F1F5F9`, `aria-label="Voltar"`] + `h1` 17.5px/600 `#0F172A` + subtítulo 12.25px `#64748B` com 1.75px de margem superior. Direita: ações com `gap-2`, `shrink-0` **[C]**. No mobile o grupo de ações não quebra linha e comprime o título (Operações em 375px: subtítulo quebra em duas linhas) **[O]**.

### 13.13 C14 · `StatCard`

| Item | Especificação |
|---|---|
| Estrutura | Rótulo (uppercase) + [ícone à direita] → valor (mono) → [sub] + [tendência] |
| Caixa | Raio 20px, borda 1px, padding 17.5px. Altura medida 108.75px em desktop, 122.75px em 375px (sub quebra linha) **[M]** |
| Rótulo | 10.5px, 500, uppercase, espaçamento 0.2625px, margem inferior 10.5px |
| Valor | 21px, 600, JetBrains Mono |
| Linha inferior | `mt-1.5`, `gap-2`, sub 10.5px, tendência 10.5px/500 com seta ↑ ou ↓ (`aria-label` "Aumento de X" ou "Queda de X") |
| Ícone | 16px, `#94A3B8` (ou `#93C5FD` em `primary`) |

| Variante | Fundo | Borda | Valor | Rótulo e sub |
|---|---|---|---|---|
| `default` | `#FFFFFF` | `#E2E8F0` | `#0F172A` | `#64748B` |
| `primary` | `#0F2544` | `#0F2544` | `#FFFFFF` | `#93C5FD` |
| `success` | `#F0FDF4` | `#BBF7D0` | `#0F172A` | `#16A34A` |
| `warning` | `#FFFBEB` | `#FDE68A` | `#0F172A` | `#D97706` |
| `danger` | `#FEF2F2` | `#FCA5A5` | `#0F172A` | `#DC2626` |

Tendência: `#16A34A` quando positiva, `#DC2626` quando negativa, inclusive no card `primary` (verde sobre azul-marinho) **[C]**.

Responsividade: o valor não quebra nem reduz. Em 375px, com card de 168.25px e área interna de 131.25px, valores como "R$ 52.800,00" **ultrapassam a borda do card** **[O]** (captura `mobile_07_dashboard.png`).

### 13.14 C15 · `AlertBanner`

`role="alert"`, `flex items-start gap-3 rounded-xl border px-4 py-3.5`. Ícone textual 12.25px bold, título 12.25px/600, mensagem 10.5px com opacidade 90% e altura de linha 1.625, ação opcional com `mt-2`, botão fechar "✕" (`aria-label="Fechar alerta"`, opacidade 60%, hover 100%).

| Tipo | Fundo | Borda | Título | Corpo e ícone | Ícone |
|---|---|---|---|---|---|
| `info` | `#EFF6FF` | `#BFDBFE` | `#1E3A8A` | `#1D4ED8` | 💡 |
| `warning` | `#FFFBEB` | `#FDE68A` | `#78350F` | `#92400E` | ⚠ |
| `danger` | `#FEF2F2` | `#FCA5A5` | `#991B1B` | `#DC2626` | ! |
| `success` | `#F0FDF4` | `#BBF7D0` | `#14532D` | `#15803D` | ✓ |

### 13.15 C16 · `FinancialSimulationDisclaimer`

Completo: `role="note"`, `flex gap-3 p-4 rounded-xl bg-[#F8FAFC] border-[#E2E8F0]`, ícone "i" em quadrado 28px `#DBEAFE`/`#1D4ED8`, título 10.5px/600 `#334155`, texto 10.5px `#64748B` altura 1.625. Compacto: um parágrafo 10px `#94A3B8` com prefixo em `#64748B`/600.

### 13.16 C17 · `AIAnalysisCard`

Card `md` com cabeçalho (ícone estrela 12px em quadrado 21px `#DBEAFE`, título "Análise inteligente" 12.25px/600, rótulo "Análise gerada por IA" 10px `#94A3B8` à direita). Estados: `loading` (Spinner 16px `#1E54B7` + "Analisando seus dados..."), `unavailable` (mensagem + botão outline `sm` + nota), `insufficient` (mensagem), `done` (conteúdo + rodapé 10px com borda superior `#F1F5F9`). O Dashboard usa apenas `done` **[C]**.

### 13.17 C18 · `AIInsightCard`

Raio 20px, borda 1px, padding 12.25px. Ponto 7px (`mt-1.5`), título 12.25px/600, texto 10.5px altura 1.625.

| Tipo | Fundo/borda | Ponto | Título | Texto |
|---|---|---|---|---|
| `positive` | `#F0FDF4` / `#BBF7D0` | `#16A34A` | `#14532D` | `#15803D` |
| `warning` | `#FFFBEB` / `#FDE68A` | `#D97706` | `#78350F` | `#92400E` |
| `info` | `#EFF6FF` / `#BFDBFE` | `#1E54B7` | `#1E3A8A` | `#1D4ED8` |

### 13.18 C19 · `LoadingOverlay`

`role="status"`, coluna centralizada com padding vertical 70px e `gap-4`; Spinner 28px `#1E54B7` + mensagem 12.25px `#64748B`. No Dashboard: "Carregando seu painel..." por 600ms **[C]**.

### 13.19 C20 · `TransactionList` (não usado)

Lista `divide-y #F8FAFC`; item `flex gap-4 py-3 px-4 rounded-lg hover:#F8FAFC`; descrição 12.25px/500 truncada; meta 10.5px `#94A3B8`; valor 12.25px/600 mono com sinal "−" para negativos; ponto de status 5.25px. Vazio delega a `EmptyState`.

### 13.20 C21 · `ToastProvider`

Região `aria-live="polite"` fixa a 14px da direita e da base, `z-50`, coluna com `gap-2`. Toast: `px-4 py-3 rounded-xl shadow-lg`, 12.25px/500, branco sobre `#0F2544` (sucesso), `#DC2626` (erro) ou `#1E54B7` (info), com ícone textual. Remoção automática após 3500ms. Declara `transition-all duration-300`, mas como o elemento é montado e removido sem estado intermediário, **não há animação visível** **[C]**. Nenhuma tela dispara toasts **[C]**.

### 13.21 C22 · `Tabs`

Igual ao `PeriodSelector` (contêiner `#F1F5F9`, raio 14px, padding 3.5px), com `role="tablist"`, botões `role="tab"`, `aria-selected` e `flex-1`. Não há `role="tabpanel"` nem `aria-controls` **[C]**. Altura 31.5px **[M]**.

### 13.22 C23 · `Modal` (não usado)

`role="dialog" aria-modal="true" aria-label={title}`, `fixed inset-0 z-50 p-4`. Fundo `bg-black/40` com desfoque 8px que fecha ao clicar. Painel branco, raio 14px, `shadow-2xl`, largura máxima 448px. Header `px-6 py-4` com `h2` 14px/600 e botão "✕" 28px. Corpo `px-6 py-5`. Rodapé `px-6 py-4 bg-[#F8FAFC] border-t` alinhado à direita com `gap-3`. Fecha com Escape. Sem prender o foco (*focus trap*) e sem devolver o foco ao gatilho **[C]**.

### 13.23 C24 · `SuccessScreen`

Coluna centralizada, padding 35 × 21px. Círculo 56px `#F0FDF4` com "✓" `#16A34A` 21px. Título `h2` 17.5px/600. Valor opcional 26.25px/700 mono com margem vertical 10.5px. Mensagem 12.25px `#64748B` (largura máx. 280px). Botões lado a lado com `gap-3`, cada um `fullWidth`, contêiner de 280px: [`outline` "Nova …"] [`primary` "Voltar para …"].

### 13.24 C25 · `Divider`, C26 · `AITypingIndicator`, C27 · `DemoDataBadge`

`AITypingIndicator`: três pontos 5.25px `#1E54B7` a 70% com `animate-bounce` defasados em 0s, 0.15s e 0.3s, mais o texto "Analisando seus dados..." 10.5px `#64748B`; `aria-label="IA processando"` em um `div` sem papel **[C]**.

`DemoDataBadge`: pílula `#FEF9C3`, texto `#A16207` 10px/600 uppercase, espaçamento 0.25px, padding 1.75 × 7px, ícone "◉" com `aria-hidden`; altura 19.5px **[M]**.

### 13.25 L02 · Sidebar

| Região | Especificação |
|---|---|
| Contêiner | 210px, altura total, fundo `#0F2544`, `flex-col`. Desktop (≥1024px): estática. Mobile: `fixed`, `z-30`, `-translate-x-full`, entra com `translate-x-0` em 200ms |
| Logo | Altura 64px **[M]**, padding 17.5px, borda inferior branca 10%. Quadrado 28px `#2563EB` raio 14px + "Planner" (Outfit 12.25px/600 branco) e "Comercial" (10px/500 `#93C5FD`) |
| Card do estabelecimento | 189 × 55px **[M]**, fundo branco 5%, borda branca 10%, raio 20px; nome 10.5px/500 branco, CNPJ 10px `#93C5FD` |
| Navegação | 5 grupos: Principal (Dashboard), Operações (Operações, Despesas), Financeiro (Fluxo de Caixa, Simulação Split), IA (Análise com IA), Conta (Configurações, Modo POS). Rola verticalmente se necessário |
| Item | 189 × 35px **[M]**, raio 14px, ícone 16px + rótulo 12.25px/500 com `gap-3`. Inativo `#93C5FD`, hover fundo branco 8% e texto branco. Ativo fundo `#2563EB`, texto branco, `shadow-sm` |
| Selo "IA" | No item Análise com IA: 9px/700, fundo `#2563EB`, `px-1.5 py-0.5`, pílula, alinhado à direita. **Fica invisível quando o item está ativo**, pois tem a mesma cor do fundo ativo **[O]** |
| Rodapé | Botão "Sair" com o mesmo visual de item, borda superior branca 10% |
| Estado ativo | Apenas cor; não há `aria-current` **[C]** |

### 13.26 L03 · Header

Altura 49px, fundo branco, borda inferior `#E2E8F0`, padding horizontal 14px (21px em ≥1024px), `gap-4`. Esquerda: botão hambúrguer (somente <1024px, padding 7px, raio 14px, sem `aria-label`) e data por extenso `pt-BR` 12.25px `#64748B` (somente ≥640px). Direita: sino (`title="Notificações"`, sem `aria-label`, ponto vermelho 7px fixo) e botão de perfil (avatar 28px `#1E3A5F` com "MS" + "Maria Silva" 12.25px/500 `#334155`, nome somente ≥640px) que leva a Configurações. O sino não abre nada **[C]**.


---

## 14. Botões e elementos interativos

### 14.1 Tipos de botão encontrados

Além das variantes de `Button` (seção 13.1), existem 15 estilos de botão escritos inline. Todos estão listados para que nenhuma variação se perca na reprodução.

| # | Tipo | Classe principal | Dimensões | Cores (repouso / hover / ativo) | Raio | Onde |
|---|---|---|---|---|---|---|
| B01 | Primário (`Button primary`) | ver 13.1 | 24.5 a 49px de altura | `#1E54B7` / `#1844A0` / `#143590` | 14px | Global |
| B02 | Contorno (`Button outline`) | ver 13.1 | idem | transparente + borda `#E2E8F0` / `#F8FAFC` + `#CBD5E1` | 14px | Global |
| B03 | Fantasma (`Button ghost`) | ver 13.1 | idem | transparente / `#F1F5F9` / `#E2E8F0` | 14px | Dashboard, Configurações |
| B04 | Destrutivo (`Button danger`) | ver 13.1 | idem | `#DC2626` / `#B91C1C` | 14px | Despesas, Configurações |
| B05 | Item de navegação | `px-3 py-2.5 rounded-lg` | 189 × 35px | `#93C5FD` texto / branco 8% / ativo `#2563EB` | 14px | Sidebar |
| B06 | Chip de filtro | `px-3 py-1.5 rounded-lg text-xs` | 24.5px altura | `#F1F5F9` + `#64748B` / `#E2E8F0` / selecionado `#0F2544` + branco | 14px | Operações, Despesas, estados da IA (`px-2.5 py-1`) |
| B07 | Segmento | `px-3 py-1.5 rounded-md text-xs` | 24.5px | texto `#64748B` / `#334155` / selecionado branco + `shadow-sm` | 10px | PeriodSelector, Tabs |
| B08 | Aba de Configurações | `px-3 py-2 rounded-lg text-xs` | 28px | idem B07 | 14px | Configurações |
| B09 | Link de texto | `text-[#1E54B7] hover:underline` | conforme texto | `#1E54B7` / sublinhado | n/a | Login, Cadastro, Dashboard |
| B10 | Link de alerta | `text-xs text-[#92400E] font-semibold underline` | conforme texto | `#92400E` sempre sublinhado | n/a | AlertBanner do Dashboard |
| B11 | Ação rápida | `p-3.5 rounded-xl hover:opacity-80 active:scale-98` | 49px altura **[M]** | fundo por ação: `#EFF6FF`, `#FEF9C3`, `#F0FDF4`, `#F0F4F8` / opacidade 80% / escala 98% | 20px | Dashboard |
| B12 | Forma de pagamento | `p-3.5 rounded-xl border` + `aria-pressed` | 173 × 51px **[M]** | borda `#E2E8F0` / borda `#CBD5E1` + fundo `#F8FAFC` / selecionado borda `#1E54B7` + fundo `#EFF6FF` + texto `#1E3A8A` | 20px | Nova venda |
| B13 | Ação da IA (Sugerir categoria) | `px-3 py-2 rounded-lg border text-xs` | 37px (estica na linha) **[M]** | `#EFF6FF` + `#1E54B7` + borda `#BFDBFE` / `#DBEAFE` | 14px | Nova despesa |
| B14 | Mini primário e mini neutro | `px-3 py-1.5 rounded-lg text-xs` | 24.5px | Aceitar: `#1E54B7` / `#1844A0`; Alterar: branco + borda / `#F1F5F9` | 14px | Sugestão da IA |
| B15 | Ícone quadrado | `w-8 h-8` / `w-9 h-9` | 28 / 31.5px | transparente ou branco / `#F1F5F9` | 14 / 20px | Voltar, fechar, enviar |
| B16 | Sugestão de pergunta | `px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-xs` | 24.5px | `#F1F5F9` / `#E2E8F0` | 14px | Análise com IA |
| B17 | Linha clicável | `grid … hover:bg-[#F8FAFC]` | 60.75px **[M]** | transparente / `#F8FAFC` | 0 | Operações (abre detalhe), Dashboard |
| B18 | POS primário | `min-h-14`/`min-h-16 rounded-xl`/`rounded-2xl bg-[#1F4E9E] font-bold` | 49 ou 56px | `#1F4E9E` sem hover | 20 / 14px | POS |
| B19 | POS contorno | `border border-[#1F4E9E] text-[#1F4E9E]` ou `border-slate-300` | 42px | sem hover | 20px | POS |
| B20 | POS destrutivo | `bg-red-700` ou `border-red-300 text-red-700` | 56 / 49px | sem hover | 14 / 20px | Falha, Sair |
| B21 | POS texto | `min-h-12 font-bold text-slate-700` / `text-red-700` | 42px | sem hover | n/a | Nova venda, Demonstrar falha |
| B22 | POS atalho | `min-h-16 rounded-xl border bg-white` | 56px | sem hover | 20px | Operações, Caixa, Despesas |
| B23 | POS barra inferior | `min-h-14 text-xs font-bold` | 70.6 × 49px **[M]** | `#1F4E9E` ativo / `slate-500` | 0 | Início |

### 14.2 Cursor

`Button` declara `cursor-pointer` e `cursor-not-allowed` quando desabilitado. Botões inline não declaram cursor e herdam o padrão do Tailwind v4 (`cursor: default` em `button`) **[C]**. Ou seja, chips, abas, itens do menu, ações rápidas, links e todo o POS exibem a seta padrão, não a mão, no hover. Exceções: `Toggle` (`cursor-pointer` no `label`), botões de olho (`cursor-pointer`), links de Termos no Cadastro (`cursor-pointer`), `Select` (`cursor-pointer`).

### 14.3 Transições de interação

| Elemento | Propriedade | Duração | Curva |
|---|---|---|---|
| `Button`, item de menu, chips de segmento, ações rápidas, abas de Configurações | `all` | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Inputs, selects, chips de filtro, linhas de tabela, botões ícone, links de sugestão | `color`, `background-color`, `border-color` e afins | 150ms | idem |
| Cards clicáveis | `box-shadow` | 150ms | idem |
| Botão fechar do alerta | `opacity` | 150ms | idem |
| Sidebar mobile | `transform` | 200ms | idem |
| Toggle (trilho e botão) | cor e `transform` | 200ms | idem |
| POS | nenhuma transição declarada | n/a | n/a |

Duração padrão do Tailwind v4: `--default-transition-duration: .15s`, curva `cubic-bezier(.4, 0, .2, 1)` **[C]** (CSS compilado).

### 14.4 Estado pressionado

Apenas `Button primary`, `secondary`, `ghost` (cores *active*) e ações rápidas (`active:scale-98`, escala 98%) têm estado pressionado **[C]**. O POS não tem nenhum feedback de toque além do padrão do navegador.

### 14.5 Estado desabilitado

| Elemento | Tratamento |
|---|---|
| `Button` | `opacity: 0.5` + `cursor-not-allowed` + atributo `disabled`. Primário desabilitado sobre fundo `#F0F4F8` resulta em `#87A4D8` com texto branco, contraste 2.52:1 **[C]** (cálculo) |
| Enviar do chat | `disabled:opacity-40` e `disabled:cursor-not-allowed` quando a pergunta está vazia |
| Sugerir categoria | `disabled:opacity-50` durante a análise |
| Registrar venda | Desabilitado até haver valor e forma de pagamento (`disabled={!amount || !pm}`) |
| Campos | Nenhum estado desabilitado ou somente leitura visual definido **[C]** |

### 14.6 Estado de carregamento

| Local | Indicação | Duração simulada |
|---|---|---|
| Entrar (Login) | Spinner no botão, botão desabilitado | 1000ms |
| Criar conta | idem | 1200ms |
| Registrar venda, Registrar despesa | idem | 900ms |
| Simular impacto | idem | 900ms |
| Sugerir categoria | Spinner 12px + "Analisando..." | 1200ms |
| Entender melhor | `AITypingIndicator` no card | 1400ms |
| Pergunta no chat | Bolha com `AITypingIndicator` | 1600ms |
| Dashboard | `LoadingOverlay` substitui a página | 600ms |
| POS processamento | Círculo pulsante + 5 etapas que acendem a cada 420ms | 2550ms até o resultado |

### 14.7 Comportamento em clique

| Elemento | Ação |
|---|---|
| Itens da sidebar | Trocam `page` e fecham a sidebar mobile |
| "Sair" (sidebar) | Logout imediato, sem confirmação |
| "Sair" (Configurações) | Exibe confirmação inline "Confirmar saída?" com Confirmar (danger) e Cancelar (ghost) |
| Avatar do header | Abre Configurações |
| Sino | Nenhuma ação **[C]** |
| Exportar | Nenhuma ação **[C]** |
| Esqueci minha senha, Termos de Uso, Política de Privacidade | Nenhuma ação **[C]** |
| Encerrar outras sessões | Nenhuma ação **[C]** |
| Salvar alterações / Salvar dados / Alterar senha | Texto muda para "✓ Salvo!" ou "✓ Senha alterada!" por 2000ms; não valida nem salva |
| Qualquer linha de Operações | Abre sempre o mesmo detalhe (OP-2026-0184), independentemente da linha **[C]** |
| Linhas de "Últimas operações" no Dashboard | Abrem a lista de Operações, não o detalhe |
| Linhas de Despesas | Hover visual, sem clique |
| POS "Voltar" | Volta pela pilha `history`; após o processamento a pilha inclui `processing`, então "Voltar" a partir do resultado reexecuta a animação de processamento **[C]** |

### 14.8 Dispositivos móveis

Não há tratamento específico de toque no web (sem `touch-action`, sem alvos ampliados). Em 375px os botões `sm`, chips e segmentos mantêm 24.5px de altura. Isso atende, por margem de 0.5px, ao mínimo de 24×24 CSS px do critério 2.5.8 do WCAG 2.2 (nível AA) e fica abaixo dos 44px do critério 2.5.5 (nível AAA) **[M]**.

### 14.9 Foco (verificado em execução)

| Elemento | Resultado medido |
|---|---|
| `input` (clique) | Contorno sólido 2px `#2563EB`, deslocamento 2px, borda `#1E54B7` e anel 2px `#1E54B7`/15% simultâneos **[M]** |
| Link "Esqueci minha senha" (Tab) | Contorno sólido 2px `#2563EB` **[M]** |
| Segmento do PeriodSelector após foco programático + Tab | Contorno 3px na cor do texto, deslocamento 0. Resultado inconsistente com a regra global; provável foco não classificado como `:focus-visible` pelo navegador no teste automatizado **[NV]** |
| Botões de olho (mostrar senha) | `tabIndex={-1}`: inalcançáveis por teclado **[C]** |

---

## 15. Formulários e validações

### 15.1 Padrão visual comum

| Item | Valor |
|---|---|
| Disposição | Uma coluna; pares lado a lado em `grid-cols-2 gap-3` (Data + Status; Cidade + Estado; Nome + Sobrenome) |
| Espaço entre campos | 14px (`space-y-4`) |
| Rótulo | Acima do campo, 12.25px/500 `#334155`, 5.25px de distância |
| Obrigatoriedade | Asterisco no texto do rótulo ("Seu nome *"). Sem `required`, sem `aria-required` **[C]** |
| Opcional | Sem marcação |
| Botão de envio | Largura total, `size="lg"` (35px) ou `xl` (49px) |
| Validação nativa | Desativada (`noValidate`) no Login e no Cadastro |
| Comportamento em 375px | Os pares em `grid-cols-2` continuam lado a lado (sem quebra) **[C][O]** |

### 15.2 Regras de validação funcional implementadas

| Formulário | Campo | Regra | Mensagem | Quando valida |
|---|---|---|---|---|
| Login | E-mail | Não vazio (após `trim`) | "Informe seu e-mail." | No envio |
| Login | Senha | Não vazia | "Informe sua senha." | No envio |
| Cadastro | Nome | Não vazio | "Informe seu nome." | No envio |
| Cadastro | Estabelecimento | Não vazio | "Informe o nome do estabelecimento." | No envio |
| Cadastro | E-mail | Contém "@" | "Informe um e-mail válido." | No envio |
| Cadastro | Senha | 8 caracteres ou mais | "A senha deve ter pelo menos 8 caracteres." | No envio |
| Cadastro | Confirmar senha | Igual à senha | "As senhas não coincidem." | No envio |
| Nova venda | Valor | Número maior que zero | "Informe um valor válido." | No envio (o botão fica desabilitado antes) |
| Nova venda | Forma de pagamento | Selecionada | "Selecione a forma de pagamento." | No envio |
| Nova despesa | Descrição | Não vazia | "Informe a descrição." / "Informe a descrição para sugerir uma categoria." | No envio / ao pedir sugestão |
| Nova despesa | Valor | Não vazio (aceita qualquer texto) | "Informe o valor." | No envio |
| Nova despesa | Categoria | Selecionada | "Selecione a categoria." | No envio |
| Simulação | Valor | Número maior que zero | "Informe um valor válido." | No envio |
| Simulação | Percentual | Maior que 0 e até 100 | "Informe um percentual entre 0,01 e 100." | No envio |
| POS login | E-mail e senha | E-mail com "@" e senha exatamente "123456" | "Credenciais inválidas. Confira e tente novamente." | No envio |
| POS venda | Valor | Maior que zero | "Informe um valor maior que zero." | No envio |
| Configurações | Todos | **Nenhuma** | n/a | n/a |

As mensagens de erro somem apenas no próximo envio; editar o campo não limpa o erro (exceto a descrição de Nova despesa, que limpa a sugestão) **[C]**.

### 15.3 Tipos de entrada e máscaras

| Campo | `type` / `inputMode` | Máscara |
|---|---|---|
| E-mail | `email` + `autoComplete="email"` | Não |
| Senha | `password` ↔ `text` (mostrar senha) + `autoComplete` `current-password` / `new-password` | Não |
| Valores monetários | `text` + `inputMode="decimal"` | **Não**; o usuário digita "150,00" livremente |
| Percentual | `number`, `step 0.01`, `min 0.01`, `max 100` | Não |
| Data | `date` | Nativa do navegador |
| CNPJ, telefone | `text` com valor padrão formatado | **Não** |
| Selects | `select` nativo estilizado | n/a |

### 15.4 Estados visuais

| Estado | Borda | Anel | Texto auxiliar |
|---|---|---|---|
| Normal | 1px `#E2E8F0` | nenhum | Dica `#94A3B8` 10.5px quando existe |
| Foco | 1px `#1E54B7` | 2px `#1E54B7`/15% + contorno global 2px `#2563EB` | Inalterado |
| Inválido | 1px `#DC2626` | 2px `#DC2626`/20% no foco (somente `Input`) | Mensagem `#DC2626` 10.5px com "⚠" |
| Desabilitado | Não definido | n/a | n/a |
| Somente leitura | Não definido. O "Detalhe da operação" é somente leitura por não ter campos, não por estilo de campo | n/a | n/a |
| Erro global (Login) | Caixa `#FEF2F2` + borda `#FCA5A5`, raio 20px, padding 10.5px, texto 10.5px/500 `#DC2626` com "⚠", acima do formulário | n/a | n/a |
| Sucesso | `SuccessScreen` (13.23) ou texto do botão "✓ Salvo!" | n/a | n/a |
| Dica contextual | PIX selecionado: caixa `#F0FDF4`/`#BBF7D0`, raio 14px, texto `#15803D` "✓ PIX não tem taxa de adquirente…" | n/a | n/a |

### 15.5 Sugestão de categoria pela IA (Nova despesa)

Fluxo: descrição → "Sugerir categoria" → 1200ms → caixa `role="status"` azul (`#EFF6FF`/`#BFDBFE`, raio 20px, padding 12.25px) com "Sugestão da IA" (10.5px/600 `#1E3A8A`), "Categoria sugerida: **X**" (12.25px/500 `#1D4ED8`), "Confiança: Alta/Média/Baixa" colorida (`#16A34A`, `#D97706`, `#94A3B8`), nota 10px e botões empilhados "Aceitar" e "Alterar". "Aceitar" preenche o `Select`; "Alterar" fecha a caixa. A categoria vem de regras por palavra-chave (`guessCategory`, 10 regras), não de um modelo de IA **[C]**.

### 15.6 Recomendações (não implementadas)

1. **[R]** Validar no evento `blur` e limpar o erro ao editar o campo.
2. **[R]** Máscaras para moeda (`R$ 1.234,56`), CNPJ e telefone.
3. **[R]** `aria-required="true"` nos campos com asterisco e legenda "* obrigatório".
4. **[R]** Estilo de desabilitado e somente leitura para `Input` e `Select`.
5. **[R]** Validação nos formulários de Configurações.


---

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


---

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

---

## 18. Responsividade

### 18.1 Breakpoints reais

| Prefixo | Condição compilada | Largura efetiva | Usos no código |
|---|---|---|---|
| (base) | n/a | 0 a 639px | Layout mobile |
| `sm:` | `@media (width >= 40rem)` | **640px** | Data e nome no header; saudação do Dashboard em linha; ações rápidas em 4 colunas |
| `lg:` | `@media (width >= 64rem)` | **1024px** | Sidebar fixa; padding 21px; painel de marca do Login; grades de 4, 5, 3 e 2 colunas |
| `md:`, `xl:`, `2xl:` | n/a | n/a | **Não usados** **[C]** |

Fonte: CSS compilado contém exatamente duas media queries de largura (`width>=40rem` e `width>=64rem`) e uma `@media (hover:hover)` que o Tailwind v4 aplica a todas as variantes `hover:` **[C]**. Consequência: em dispositivos sem mouse (toque), nenhum estilo de hover é aplicado.

### 18.2 Comportamento por faixa (verificado em 1440, 768 e 375px)

| Elemento | < 640px (375) | 640 a 1023px (768) | ≥ 1024px (1440) |
|---|---|---|---|
| Sidebar | Oculta (`-translate-x-full`), abre por cima com overlay `bg-black/40` e transição de 200ms | Idem mobile | Fixa à esquerda, 210px |
| Header | ☰ + sino + avatar | ☰ + data + sino + avatar + nome | data + sino + avatar + nome |
| Padding do `main` | 14px | 14px | 21px |
| KPIs | 2 colunas | 2 colunas | 4 colunas |
| Dashboard: composição + operações | Empilhados | Empilhados | 2/5 + 3/5 |
| Ações rápidas | 2 colunas | 4 colunas | 4 colunas |
| Fluxo: Realizado + Projeção | Empilhados | Empilhados | 2 colunas |
| IA: resumo + chat | Empilhados | Empilhados | 1/3 + 2/3 |
| Login | Formulário só, com logo | Formulário só, com logo | Painel de marca 420px + formulário |
| Tabelas em grade | Comprimidas, conteúdo cortado | Adequadas | Adequadas |
| Tabela HTML (Fluxo) | Rolagem horizontal | Adequada | Adequada |
| Formulários | Largura total (347px) | Largura máxima da tela, centralizado | Idem |
| Modal | `p-4` externo, largura total até 448px | Idem | Idem |
| POS | Moldura de 360px centralizada com 7.5px de sobra lateral | Moldura centralizada | Moldura centralizada |

### 18.3 Rolagem

Apenas o `main` rola no Layout; a página como um todo não rola (`h-screen overflow-hidden`). A largura do documento medida foi igual à viewport nas três larguras (sem rolagem horizontal da página) **[M]**, mas há conteúdo que ultrapassa o limite dos cards em 375px (KPIs e badges da tabela), cortado visualmente ou sobreposto ao card vizinho **[O]**.

### 18.4 Não tratados

Orientação paisagem, telas ultrawide (o conteúdo fica limitado a 896px e alinhado à esquerda, deixando a área à direita vazia), áreas seguras (`env(safe-area-inset-*)`) e `prefers-color-scheme` **[C]**.

---

## 19. Animações e microinterações

| # | Elemento | Gatilho | Estado inicial → final | Duração | Curva | Repetição | Fonte |
|---|---|---|---|---|---|---|---|
| A1 | `Spinner` | Montagem | rotação 0° → 360° | 1s | linear | infinita | `animate-spin` |
| A2 | `AITypingIndicator` (3 pontos) | Montagem | `translateY(-25%)` ↔ 0 | 1s, atrasos 0 / 0.15 / 0.3s | `cubic-bezier(.8,0,1,1)` e `(0,0,.2,1)` | infinita | `animate-bounce` |
| A3 | Círculo de processamento do POS | Montagem | opacidade 1 → 0.5 → 1 | 2s | `cubic-bezier(.4,0,.6,1)` | infinita | `animate-pulse` |
| A4 | Etapas do processamento do POS | Temporizador | cinza → verde, uma a cada 420ms | troca instantânea | n/a | 5 vezes | `setTimeout` |
| A5 | Sidebar mobile | Abrir/fechar | `translateX(-100%)` ↔ 0 | 200ms | `cubic-bezier(.4,0,.2,1)` | não | `transition-transform duration-200` |
| A6 | Toggle | Clique | cor do trilho; botão desloca 14px | 200ms | idem | não | `transition-colors`, `transition-transform` |
| A7 | Hover/active de botões | Ponteiro | cores (13.1) | 150ms | idem | não | `transition-all` |
| A8 | Ação rápida | Pressionar | escala 100% → 98% e opacidade 80% no hover | 150ms | idem | não | `active:scale-98` |
| A9 | Card clicável | Hover | sem sombra → `shadow-md` | 150ms | idem | não | Não usado em nenhuma tela |
| A10 | Toast | Montagem | sem animação real (ver 13.20) | n/a | n/a | n/a | |
| A11 | Gráficos Recharts | Montagem e troca de aba | animação padrão da biblioteca (desenho das séries) | padrão da Recharts **[NV]** | padrão | não | `recharts` 3.x |
| A12 | Carregamentos simulados | Envio | spinner no botão | 900 a 1600ms (14.6) | n/a | não | `setTimeout` |

**Movimento reduzido:** não há regra `prefers-reduced-motion` no CSS compilado (0 ocorrências) **[C]**. O `site.json` do Figma Make declara `"ignoreReducedMotion": false`, mas isso é configuração da hospedagem, não um estilo do app **[C]**.

---

## 20. Acessibilidade

Referência: WCAG 2.2. As razões de contraste foram calculadas com a fórmula de luminância relativa do WCAG sobre os hex do código.

### 20.1 Contraste de cores

| Par (texto sobre fundo) | Razão | Requisito | Classificação |
|---|---|---|---|
| `#0F172A` sobre `#FFFFFF` (texto principal) | 17.85:1 | 4.5:1 | Conforme e verificado |
| `#334155` sobre `#FFFFFF` (rótulos) | 10.35:1 | 4.5:1 | Conforme e verificado |
| `#64748B` sobre `#FFFFFF` (texto secundário) | 4.76:1 | 4.5:1 | Conforme e verificado |
| `#64748B` sobre `#F0F4F8` (subtítulos na página) | 4.31:1 | 4.5:1 | **Não conforme** (1.4.3) |
| `#94A3B8` sobre `#FFFFFF` (placeholder, dicas, datas, cabeçalhos de tabela, avisos de IA) | 2.56:1 | 4.5:1 | **Não conforme** |
| `#94A3B8` sobre `#F0F4F8` ("AÇÕES RÁPIDAS") | 2.32:1 | 4.5:1 | **Não conforme** |
| `#CBD5E1` sobre `#FFFFFF` ("Projeção" na legenda) | 1.48:1 | 4.5:1 | **Não conforme** |
| `#FFFFFF` sobre `#1E54B7` (botão primário) | 6.98:1 | 4.5:1 | Conforme e verificado |
| `#FFFFFF` sobre `#2563EB` (menu ativo) | 5.17:1 | 4.5:1 | Conforme e verificado |
| `#93C5FD` sobre `#0F2544` (menu inativo) | 8.51:1 | 4.5:1 | Conforme e verificado |
| `#4E7298` sobre `#0F2544` (grupos do menu, 10px) | 3.06:1 | 4.5:1 | **Não conforme** |
| `#0F172A` sobre branco 8% em `#0F2544` (01, 02, 03 do Login) | 1.46:1 | 4.5:1 | **Não conforme** |
| `#16A34A` sobre `#FFFFFF` (valores líquidos 12.25px) | 3.30:1 | 4.5:1 | **Não conforme** |
| `#16A34A` sobre `#F0FDF4` (rótulo de StatCard success) | 3.15:1 | 4.5:1 | **Não conforme** |
| `#D97706` sobre `#FFFFFF` ("Pendente") | 3.19:1 | 4.5:1 | **Não conforme** |
| `#D97706` sobre `#FFFBEB` (rótulo de StatCard warning) | 3.07:1 | 4.5:1 | **Não conforme** |
| `#DC2626` sobre `#FFFFFF` (erros) | 4.83:1 | 4.5:1 | Conforme e verificado |
| `#DC2626` sobre `#FEE2E2` (Badge danger) | 3.95:1 | 4.5:1 | **Não conforme** |
| `#15803D` sobre `#DCFCE7` (Badge success) | 4.57:1 | 4.5:1 | Conforme e verificado |
| `#A16207` sobre `#FEF9C3` (Badge warning, selo demonstrativo) | 4.58:1 | 4.5:1 | Conforme e verificado |
| `#1D4ED8` sobre `#DBEAFE` (Badge info) | 5.49:1 | 4.5:1 | Conforme e verificado |
| `#075985` sobre `#E0F2FE` (SIMULADO) | 6.59:1 | 4.5:1 | Conforme e verificado |
| `#3B82F6` sobre `#EFF6FF` (dica demo do Login) | 3.38:1 | 4.5:1 | **Não conforme** |
| `#FFFFFF` sobre `#1F4E9E` (botões do POS) | 7.95:1 | 4.5:1 | Conforme e verificado |
| Botão primário desabilitado (`#FFFFFF` sobre `#87A4D8`) | 2.52:1 | Isento (1.4.3, componente inativo) | Conforme por isenção |
| Borda de campo `#E2E8F0` sobre `#FFFFFF` | 1.23:1 | 3:1 para identificar o componente (1.4.11) | **Não conforme** |
| Trilho do Toggle desligado `#CBD5E1` sobre `#FFFFFF` | 1.48:1 | 3:1 (1.4.11) | **Não conforme** |
| Contraste dos tons OKLCH do POS | não calculado | n/a | Não foi possível verificar com precisão (conversão aproximada) |

### 20.2 Demais critérios

| Tema | Achado | Classificação |
|---|---|---|
| Idioma da página | `index.html` tem `lang="<!-- figma:lang -->"`, preenchido pela hospedagem do Figma Make | Não foi possível verificar |
| Título da página | `<title><!-- figma:title --></title>`, idem | Não foi possível verificar |
| Hierarquia de títulos | Cada tela tem um `h1`. Há saltos (`h1` → `h3` no Fluxo e em EmptyState; `h4` em Simulação) | Parcialmente conforme |
| HTML semântico | `aside`, `nav`, `header`, `main`, `form`, `table` (Fluxo) presentes. Tabelas de Operações e Despesas são `div` em grade, sem papéis de tabela | Parcialmente conforme |
| Navegação por teclado | Todos os controles são `button`, `input` ou `select` nativos, portanto focáveis. Exceções: botões de olho com `tabIndex=-1`; `Card` e `StatCard` clicáveis seriam `div` (não usados) | Parcialmente conforme |
| Indicador de foco | Regra global `*:focus-visible` 2px `#2563EB` com deslocamento 2px **[M]**. Contraste do contorno sobre `#F0F4F8`: 4.68:1; sobre `#FFFFFF`: 5.17:1; sobre `#0F2544` (sidebar): 2.97:1, abaixo dos 3:1 do critério 1.4.11 **[C]** (cálculo) | Parcialmente conforme |
| Foco no POS | Herda a regra global; não verificado em execução | Não foi possível verificar |
| Nomes acessíveis | Presentes: voltar, fechar alerta, fechar modal, mostrar senha, enviar pergunta, Toggle (via `label` quando há texto). Ausentes: botão de menu ☰, sino (só `title`), Selects de filtro, campo de busca (só placeholder), campo de pergunta do chat, Toggles de Configurações (o `label` envolve o botão mas o texto está em outro elemento) | Parcialmente conforme |
| Rótulos e campos | `Input` e `Select` associam por `htmlFor`. `CurrencyInput`, `Textarea`, descrição da despesa e percentual da simulação têm `label` sem associação | Parcialmente conforme |
| IDs duplicados | Três `Toggle` sem `id` geram `id="toggle"` repetido em Configurações | Não conforme (4.1.1 removido no WCAG 2.2, mas afeta a associação de rótulo) |
| Mensagens de erro | Texto claro em português, `role="alert"`, `aria-invalid` e `aria-describedby` no `Input`. `Select` e `CurrencyInput` sem `aria-describedby` | Parcialmente conforme |
| Estado de componentes | `aria-pressed` (período, formas de pagamento), `aria-selected` (Tabs), `aria-checked` (Toggle) | Conforme e verificado (código) |
| Item de menu atual | Sem `aria-current="page"` | Não conforme |
| Abas | `role="tablist"` e `role="tab"` sem `tabpanel`, sem `aria-controls` e sem navegação por setas | Parcialmente conforme |
| Diálogo | `Modal` com `role="dialog"` e Escape, sem *focus trap* (não usado) | Parcialmente conforme |
| Regiões vivas | `ToastProvider` com `aria-live="polite"` (não usado); `LoadingOverlay` e sugestão da IA com `role="status"`; respostas do chat sem região viva | Parcialmente conforme |
| Alvos de toque (web) | Mínimo observado 24.5px (botões `sm`, chips, segmentos) | Conforme (2.5.8 AA) por margem mínima |
| Alvos de toque (POS) | Requisito do produto: 48px. Medido: 42px em todos os botões e campos com `min-h-12` (21 ocorrências; 3rem × 14px) | Não conforme ao requisito do produto; conforme ao 2.5.8 |
| Tamanho mínimo de texto no POS | Requisito: 16px. Medido: título do header e botões `text-lg` com 15.75px | Não conforme ao requisito do produto |
| Uso exclusivo de cor | Status sempre acompanhados de texto (Concluída, Pendente, Falha). Exceções: pontos de status sem texto em `TransactionList` (não usado) e cores dos valores (+/− têm sinal) | Conforme e verificado |
| Zoom e redimensionamento | Unidades em rem respeitam zoom; a raiz fixa de 14px ignora o tamanho de fonte escolhido pelo usuário no navegador | Parcialmente conforme |
| Reflow em 320px | Não testado em 320px; em 375px há conteúdo cortado (KPIs, tabela) | Não conforme (1.4.10) em 375px |
| Movimento reduzido | Sem `prefers-reduced-motion`; animações infinitas (spin, bounce, pulse) só aparecem durante carregamentos | Parcialmente conforme |
| Emojis como ícone | Sem `aria-hidden` nem texto alternativo nas formas de pagamento (o rótulo ao lado compensa) | Parcialmente conforme |
| Leitores de tela | Não testado com NVDA, VoiceOver ou TalkBack | Não foi possível verificar |

### 20.3 Recomendações de acessibilidade (separadas do padrão atual)

1. **[R]** Escurecer `#94A3B8` para `#64748B` em textos informativos e `#64748B` para `#475569` sobre `#F0F4F8`.
2. **[R]** Usar `#15803D` (verde) e `#B45309` (âmbar) para texto sobre branco.
3. **[R]** Definir cor `#FFFFFF` nos marcadores 01, 02 e 03 do Login.
4. **[R]** Bordas de campo com pelo menos 3:1 (`#94A3B8` atinge 2.56:1; `#8494AB` atinge 3.09:1) **[C]** (cálculo).
5. **[R]** `aria-label` no botão de menu, no sino, nos filtros e no campo de pergunta; `aria-current="page"` no item ativo.
6. **[R]** Trocar `min-h-12` por `min-h-[48px]` no POS e `text-lg` por `text-[18px]` para cumprir os requisitos do produto em px absolutos.
7. **[R]** Bloco `@media (prefers-reduced-motion: reduce)` desativando `animate-*`.

---

## 21. Tecnologias e implementação

### 21.1 Stack

| Camada | Tecnologia | Versão declarada | Versão instalada (lockfile) |
|---|---|---|---|
| Linguagem | TypeScript (`strict: true`, alvo ES2020, JSX `react-jsx`) | ^5.7.0 | 5.9.3 |
| UI | React e React DOM | ^19.0.0 | 19.x |
| Estilos | Tailwind CSS v4 via `@tailwindcss/vite` (sem `tailwind.config`, sem PostCSS) | ^4.0.0 | 4.2.2 |
| Gráficos | Recharts | ^3.10.1 | 3.x |
| Build | Vite | ^8.0.5 | 8.0.5 |
| Plugin React | `@vitejs/plugin-react` | ^6.0.0 | |
| Formatação | oxfmt | ^0.2.0 | |
| Gerenciador | pnpm (versão definida em `.mise.toml`) | | 10.28.0 no ambiente de análise |
| Ícones | Nenhuma biblioteca (SVG inline) | | |
| Roteamento, estado global, i18n, testes | Nenhum | | |

### 21.2 Estrutura de diretórios

```
/
├── .figma/make/          scripts e site.json do Figma Make (hospedagem)
├── arquivos de configuração do Figma Make
├── index.html            shell com marcadores <!-- figma:* -->
├── package.json, pnpm-lock.yaml, tsconfig.json, vite.config.ts (387 linhas, plugins do Figma Make)
└── src/
    ├── main.tsx          monta <App/> em StrictMode e importa index.css
    ├── App.tsx           navegação por estado (90 linhas)
    ├── index.css         tokens @theme e estilos globais (99 linhas)
    ├── vite-env.d.ts
    ├── components/
    │   ├── Layout.tsx    shell (154 linhas)
    │   └── ui.tsx        biblioteca de componentes (672 linhas)
    ├── data/
    │   └── mockData.ts   dados fictícios (140 linhas)
    └── pages/            13 páginas (110 a 329 linhas cada)
```

### 21.3 Estratégia de estilos

1. **Utilitários Tailwind inline** em `className`, com cores quase sempre como valores arbitrários (`bg-[#1E54B7]`) em vez dos tokens do `@theme`.
2. **`style` inline** em pontos específicos: fundo do Login (`#F0F4F8`, `#0F2544`), fundo do Layout e da sidebar (`var(--color-*)`), família da marca na sidebar, ações rápidas (fundo e texto por item), altura do chat (480), barras do POS (`height: %`), atrasos do indicador de digitação.
3. **CSS global** em `index.css` (seção 6.3).
4. **Props do Recharts** para cores e tamanhos de gráfico.
5. **Classe `.transition-base`** definida no CSS, não usada em nenhum componente **[C]**.

### 21.4 Convenções de nomenclatura

| Item | Convenção | Exemplos |
|---|---|---|
| Componentes | PascalCase em inglês | `StatCard`, `AlertBanner` |
| Páginas | PascalCase em português + sufixo `Page` | `FluxoDeCaixaPage`, `NovaVendaPage` |
| Identificadores de página | kebab-case em português | `fluxo-de-caixa`, `split-resultado` |
| Inconsistência | `VendasPage` exibe "Operações"; `page` `vendas` corresponde ao menu "Operações" | |
| Variantes | inglês | `primary`, `warning`, `positive` |
| Textos de interface | português do Brasil | |

### 21.5 Build

`vite build` gera `dist/index.html` (0,91 kB), CSS de 40,73 kB (8,56 kB gzip) e JS de 731,64 kB (204,32 kB gzip), com aviso de *chunk* maior que 500 kB **[C]** (saída do build). Sourcemaps apenas em modo `development`. `robots.txt` com `index: false`.


---

## 22. Design tokens

### 22.1 Tokens existentes formalmente (`@theme` em `src/index.css`)

| Nome | Valor | Categoria | Aplicação | Origem | Confiança |
|---|---|---|---|---|---|
| `--color-primary` | `#1E3A5F` | Cor | Avatar, Badge `blue` (por hex literal) | `index.css` 7 | Confirmado |
| `--color-primary-light` | `#2563EB` | Cor | Sem referência | `index.css` 8 | Confirmado |
| `--color-primary-foreground` | `#FFFFFF` | Cor | Sem referência | `index.css` 9 | Confirmado |
| `--color-accent` | `#2563EB` | Cor | Contorno de foco global | `index.css` 10 | Confirmado |
| `--color-accent-hover` | `#1D4ED8` | Cor | Sem referência como token | `index.css` 11 | Confirmado |
| `--color-background` | `#F0F4F8` | Cor | `body`, Layout | `index.css` 12 | Confirmado |
| `--color-surface` | `#FFFFFF` | Cor | Sem referência como token | `index.css` 13 | Confirmado |
| `--color-surface-2` | `#F8FAFC` | Cor | Sem referência como token | `index.css` 14 | Confirmado |
| `--color-border` | `#E2E8F0` | Cor | Sem referência como token | `index.css` 15 | Confirmado |
| `--color-border-strong` | `#CBD5E1` | Cor | Scrollbar | `index.css` 16 | Confirmado |
| `--color-text` | `#0F172A` | Cor | `body` | `index.css` 17 | Confirmado |
| `--color-text-2` | `#334155` | Cor | Sem referência como token | `index.css` 18 | Confirmado |
| `--color-text-muted` | `#64748B` | Cor | Scrollbar (hover) | `index.css` 19 | Confirmado |
| `--color-success` | `#16A34A` | Cor | Sem referência como token | `index.css` 20 | Confirmado |
| `--color-success-bg` | `#F0FDF4` | Cor | Sem referência como token | `index.css` 21 | Confirmado |
| `--color-warning` | `#D97706` | Cor | Sem referência como token | `index.css` 22 | Confirmado |
| `--color-warning-bg` | `#FFFBEB` | Cor | Sem referência como token | `index.css` 23 | Confirmado |
| `--color-danger` | `#DC2626` | Cor | Sem referência como token | `index.css` 24 | Confirmado |
| `--color-danger-bg` | `#FEF2F2` | Cor | Sem referência como token | `index.css` 25 | Confirmado |
| `--color-sidebar` | `#0F2544` | Cor | Sidebar | `index.css` 26 | Confirmado |
| `--font-display` | `'Outfit', sans-serif` | Tipografia | `h1` a `h6`, marca | `index.css` 28 | Confirmado |
| `--font-body` | `'Inter', sans-serif` | Tipografia | `body` | `index.css` 29 | Confirmado |
| `--font-mono` | `'JetBrains Mono', monospace` | Tipografia | `.font-mono` | `index.css` 30 | Confirmado |
| `--radius-sm` | `6px` | Raio | `rounded-sm` | `index.css` 32 | Confirmado |
| `--radius-md` | `10px` | Raio | `rounded-md` | `index.css` 33 | Confirmado |
| `--radius-lg` | `14px` | Raio | `rounded-lg` | `index.css` 34 | Confirmado |
| `--radius-xl` | `20px` | Raio | `rounded-xl` | `index.css` 35 | Confirmado |

### 22.2 Valores do Tailwind v4 usados como tokens implícitos

| Nome | Valor declarado | Valor renderizado | Categoria | Aplicação | Origem | Confiança |
|---|---|---|---|---|---|---|
| `--spacing` | 0.25rem | 3.5px | Espaçamento | Toda a escala `p`, `m`, `gap`, `w`, `h` | Tailwind (padrão) | Confirmado |
| `--radius-2xl` | 1rem | 14px | Raio | Modal, bolhas, cards do POS | Tailwind (padrão) | Confirmado |
| `--text-xs` / `--text-sm` / `--text-base` / `--text-lg` / `--text-xl` / `--text-2xl` / `--text-3xl` / `--text-4xl` | 0.75 a 2.25rem | 10.5 / 12.25 / 14 / 15.75 / 17.5 / 21 / 26.25 / 31.5px | Tipografia | Seção 8.2 | Tailwind (padrão) | Confirmado |
| `--font-weight-medium` / `semibold` / `bold` | 500 / 600 / 700 | idem | Tipografia | Global | Tailwind | Confirmado |
| `--leading-tight` / `snug` / `relaxed` | 1.25 / 1.375 / 1.625 | idem | Tipografia | Marca, textos longos | Tailwind | Confirmado |
| `--tracking-wide` / `widest` | 0.025em / 0.1em | 0.26px (10.5px) / 1px (10px) | Tipografia | Rótulos uppercase | Tailwind | Confirmado |
| `--container-xs` … `--container-5xl` | 20 a 64rem | 280 a 896px | Dimensão | `max-w-*` | Tailwind | Confirmado |
| `--shadow-sm` / `md` / `lg` / `2xl` | seção 10.3 | idem | Sombra | seção 10.3 | Tailwind | Confirmado |
| `--blur-sm` | 8px | 8px | Efeito | Fundo do modal | Tailwind | Confirmado |
| `--breakpoint-sm` / `lg` | 40rem / 64rem | 640px / 1024px | Breakpoint | seção 18 | Tailwind | Confirmado |
| `--default-transition-duration` | 0.15s | 150ms | Transição | Global | Tailwind | Confirmado |
| `--default-transition-timing-function` | `cubic-bezier(.4,0,.2,1)` | idem | Transição | Global | Tailwind | Confirmado |
| `--animate-spin` / `bounce` / `pulse` | 1s linear / 1s / 2s | idem | Animação | seção 19 | Tailwind | Confirmado |
| Camadas `z-10` / `z-20` / `z-30` / `z-50` / `1000` | 10, 20, 30, 50, 1000 | idem | Sobreposição | Aviso fixo e ícones de campo / overlay mobile / sidebar mobile / modal e toasts / tooltip Recharts | Tailwind e `index.css` | Confirmado |

### 22.3 Valores de fato não tokenizados (mais relevantes)

| Valor | Papel | Ocorrências | Observação |
|---|---|---|---|
| `#1E54B7` | Ação primária web | 48 | Deveria virar token (ex.: `--color-action`) |
| `#1844A0`, `#143590` | Hover e active da ação | 3 e 1 | Idem |
| `#94A3B8` | Texto auxiliar e ícones | 94 | Cor mais usada do projeto, sem token |
| `#F1F5F9` | Superfície neutra e divisória | 33 | Sem token |
| `#1F4E9E`, `#123463` | Primária e header do POS | 20 e 3 | Sem token |
| Opacidades 5, 8, 10, 15, 40, 50, 60, 70, 80, 90% | Overlays e estados | seção 7.5 | Sem token |
| Altura do chat 480px; gráficos 180 e 260px | Dimensões fixas | 3 | Em px reais (não escalam com rem) |

### 22.4 Tokens sugeridos

A proposta completa está em `DESIGN_TOKENS.css` (variáveis CSS) e `DESIGN_TOKENS.json` (formato estruturado). Os arquivos separam explicitamente `existing` (valores confirmados) e `suggested` (proposta). A proposta **preserva os valores atuais**; ela apenas dá nomes semânticos aos valores repetidos e expressa medidas em px absolutos para reprodução fora do Tailwind. Nenhum valor visual foi alterado.

---

## 23. Consistência visual

| ID | Inconsistência | Evidência | Impacto | Recomendação |
|---|---|---|---|---|
| I-01 | Três azuis de ação | `#2563EB` (token `--color-accent`, menu ativo, logo da sidebar, foco), `#1E54B7` (botões, links, campos, gráficos), `#1F4E9E` (POS, cor exigida no prompt) | Marca sem cor primária única; o logo da sidebar (`#2563EB`) difere do logo do Login (`#1E54B7`) | Eleger uma cor primária e criar tokens `action`, `action-hover`, `action-active` |
| I-02 | Dois azuis-marinho de marca | `#0F2544` (web) e `#123463` (POS) | Pequena diferença perceptível entre módulos | Unificar ou documentar como variação de módulo |
| I-03 | Tokens declarados e não usados | 20 tokens de cor vs. 0 classes semânticas em `.tsx` | Alterar um token não altera a interface | Substituir hex arbitrários por `bg-primary`, `text-text-muted` etc. |
| I-04 | Inversão de raios | `rounded-2xl` 14px < `rounded-xl` 20px | Componentes "mais arredondados" na intenção (Modal, bolhas) ficam menos arredondados | Definir `--radius-2xl` explicitamente ou usar `xl` |
| I-05 | Margens de títulos anuladas | Regra global `h1…h6 { margin: 0 }` fora de camada | Títulos de card encostam no conteúdo; tagline do Login encosta na lista | Mover a regra para `@layer base` |
| I-06 | `font-bold` e `leading-*` em títulos ignorados | idem | Pesos e alturas de linha diferentes do pretendido no POS | idem |
| I-07 | Selo SIMULADO em três versões | Span `#E0F2FE`/`#075985` (Dashboard), `Badge info` `#DBEAFE`/`#1D4ED8` (demais telas), `sky-100`/`sky-800` (POS) | Mesmo conceito com aparências diferentes | Componente único |
| I-08 | Cor do tributo | Âmbar `#F59E0B`/`#D97706` (Dashboard, Detalhe), laranja `orange-*` (POS), vermelho `#DC2626` (Resultado da simulação) | Quebra a regra semântica "laranja = tributo" | Usar âmbar/laranja também no Resultado |
| I-09 | Cor de saídas | Vermelho em listas e tabela do Fluxo; card `warning` (âmbar) para "Saídas" no Fluxo; `amber-800` no POS | Leitura semântica ambígua | Padronizar |
| I-10 | Títulos de card com cores diferentes | `h2` em `#0F172A` (maioria), `#334155` (formulários, Resultado), sem cor (Detalhe) | Hierarquia irregular | Um estilo de título de card |
| I-11 | Tamanhos de raio em blocos informativos | 14px (`rounded-lg`, dica PIX, aviso de projeção) e 20px (`rounded-xl`, demais) | Variação sem justificativa aparente | Padronizar em 20px |
| I-12 | Divisórias com duas cores | `#F8FAFC` e `#F1F5F9` | `#F8FAFC` é praticamente invisível (1.05:1) | Usar `#F1F5F9` ou `#E2E8F0` |
| I-13 | Segmentados com três implementações | `PeriodSelector`, `Tabs` (raio interno 10px, altura 24.5px), abas de Configurações (raio interno 14px, contêiner 20px, altura 28px) | Componentes iguais com medidas diferentes | Um componente |
| I-14 | Chips de filtro duplicados | Operações e Despesas | Manutenção dupla | Componente `FilterChips` |
| I-15 | Campos fora do `Input` | Descrição (Nova despesa), percentual (Simulação), pergunta (IA) | Estados de erro e foco divergentes (o campo do chat não tem anel) | Estender `Input` |
| I-16 | Cabeçalho de IA copiado 6 vezes | seção 12.3, X03 | Manutenção | Extrair componente |
| I-17 | Alinhamento de páginas | Listas e painéis alinhados à esquerda; formulários centralizados | Possivelmente intencional; em 1440px sobra ~290px à direita no Dashboard | Avaliar centralizar ou usar largura total |
| I-18 | Legenda de projeção sem série | Dashboard e Fluxo | Legenda promete algo que o gráfico não mostra | Renderizar o trecho projetado tracejado ou remover da legenda |
| I-19 | Cabeçalho "Data" | Alinhado à direita em Operações e à esquerda em Despesas | Pequena divergência | Padronizar |
| I-20 | Selo "IA" do menu invisível quando ativo | Mesmo `#2563EB` do fundo ativo | Informação some | Fundo branco ou contorno no estado ativo |
| I-21 | Ação rápida "Ver fluxo de caixa" | Fundo `#F0F4F8` igual ao da página | Parece texto, não botão | Fundo branco com borda |
| I-22 | Ano e período | Copyright "© 2024", dados de setembro/2024, IDs "OP-2026-…", data do header em tempo real | Coerência narrativa do protótipo | Unificar período fictício |
| I-23 | Números divergentes entre telas | Entradas de setembro: R$ 52.800,00 (Dashboard) e R$ 45.500,00 (Fluxo, soma de 1 a 17/09); KPIs do núcleo fixos enquanto o planner muda com o período | Pode confundir em demonstração | Revisar `mockData` |
| I-24 | POS e web sem biblioteca comum | POS não usa `ui.tsx` | Dois design systems paralelos | Componentes compartilhados com variante `pos` |
| I-25 | Travessões em textos de interface | 11 ocorrências do caractere travessão (U+2014) em `mockData.ts`, `LoginPage.tsx`, `IAAnalisePage.tsx`, `NovaVendaPage.tsx`, `SplitPaymentPage.tsx`, `SplitResultadoPage.tsx` | Estilo de redação divergente do restante | Revisar redação conforme o guia de conteúdo da equipe |

---

## 24. Problemas identificados

### 24.1 Requisitos do prompt de geração versus implementação

Fonte do requisito: último prompt do histórico `ai_chat.json` (versão 4, 2026-10-01).

| Requisito | Implementação | Situação |
|---|---|---|
| Cor primária `#1F4E9E` | POS usa `#1F4E9E`; web usa `#1E54B7` e `#2563EB` | Parcial |
| POS em 360×640 | Moldura com largura máx. 360px, altura entre 640 e 760px | Parcial (altura variável) |
| Botões do POS com mínimo de 48px | `min-h-12` = 42px renderizados | **Não atendido** |
| Fonte mínima de 16px no POS | 16px para `text-xs`/`text-sm`/`small`; 15.75px em `text-lg` | **Não atendido** em títulos e botões principais |
| Dashboard 1440×900 responsivo | Funciona em 1440; em 375px há cortes | Parcial |
| Cores semânticas (verde líquido, laranja tributo, cinza taxas, vermelho falha, azul claro simulado) | Respeitadas na maior parte; exceções I-08 e I-09 | Parcial |
| Design system reutilizado em todas as telas | Web reutiliza `ui.tsx`; POS não | Parcial |
| Selo "SIMULADO" em todo valor do split | Presente nas telas de split; ausente em Despesas e Configurações (não exibem split) | Atendido no escopo |
| Estados obrigatórios (carregando, vazio, validação, conexão, timeout, sem permissão, sucesso) | Todos existem na tela de IA; vazio em Operações e Despesas; demais telas sem erro de conexão, timeout e sem permissão | Parcial |
| Aviso de responsabilidade em telas de resultado e em Configurações | Presente | Atendido |
| Formato monetário R$ 1.234,56 | `toLocaleString('pt-BR', BRL)` | Atendido |
| Botão "Cobrar", etapas de processamento, falha com "Reprocessar", ledger somente leitura | Presentes no POS | Atendido |

### 24.2 Problemas de interface (prioridade)

| Prioridade | ID | Problema | Tela | Evidência |
|---|---|---|---|---|
| Alta | P-01 | Valores de KPI extrapolam o card em 375px | Dashboard, Fluxo | `mobile_07_dashboard.png` |
| Alta | P-02 | Tabela de Operações e Despesas sem layout mobile; descrição reduzida a 1 letra e badge fora do card | Operações, Despesas | `mobile_10_operacoes.png` |
| Alta | P-03 | Contraste insuficiente em textos auxiliares (`#94A3B8`) | Global | 20.1 |
| Alta | P-04 | Alvos de 42px e textos de 15.75px no POS contra requisito de 48px e 16px | POS | 9.4, 8.4 |
| Média | P-05 | Margens de títulos anuladas pela regra global | Global | 6.3 |
| Média | P-06 | Rótulos da barra inferior do POS se sobrepõem ("OperaçõesSimular") em 360px | POS P2 | `desktop_40_pos_home.png` |
| Média | P-07 | Marcadores 01 a 03 do Login quase invisíveis | Login | `desktop_01_login.png` |
| Média | P-08 | Selo "IA" invisível com item ativo | Sidebar | `desktop_26_ia_sucesso.png` |
| Média | P-09 | Fontes JetBrains Mono 600 e 700 não importadas | Global | 8.1 |
| Média | P-10 | Item de menu não destacado em subtelas (Registrar venda, Registrar despesa, Resultado) | Sidebar | 17.4 |
| Baixa | P-11 | Filtro de período de Operações sem efeito | Operações | `VendasPage.tsx` |
| Baixa | P-12 | Qualquer linha abre o mesmo detalhe | Operações | idem |
| Baixa | P-13 | Botões sem ação (Exportar, sino, Esqueci minha senha, Encerrar sessões, Salvar despesa no POS) | Diversas | 14.7 |
| Baixa | P-14 | Componentes não usados (`Modal`, `ErrorState`, `TransactionList`, `Textarea`, `useToast`, variantes `secondary`, `success` e `blue`) | `ui.tsx` | 12.1 |
| Baixa | P-15 | "Voltar" a partir do Resultado do POS repete a animação de processamento | POS | 14.7 |
| Baixa | P-16 | Chat não rola automaticamente para a última mensagem | IA | 16.12 |

---

## 25. Recomendações técnicas

Todas as recomendações abaixo são **[R]** e não alteram a aparência existente, salvo quando indicado como correção de defeito.

1. **Centralizar tokens.** Substituir os 52 hex arbitrários por tokens semânticos (`DESIGN_TOKENS.css`). Prioridade: `#1E54B7`, `#94A3B8`, `#F1F5F9`, `#E2E8F0`, `#64748B`, `#0F172A`.
2. **Mover estilos globais para `@layer base`** em `index.css`, para que utilitários voltem a funcionar em títulos (I-05, I-06). Isso **altera** espaçamentos que hoje estão zerados; tratar como correção de defeito e revisar as telas depois.
3. **Fixar a base em 16px ou converter a escala.** A raiz de 14px reduz todo o design para 87,5%. Para reproduzir fielmente em outra stack, use os valores em px deste documento. Para evoluir o protótipo, mantenha 14px e documente, ou passe para 16px e ajuste proporcionalmente (alteração visual).
4. **Unificar componentes duplicados** (seção 12.3) mantendo as medidas atuais.
5. **Compartilhar componentes com o POS** por meio de uma variante de tamanho (`size="pos"`) com alvos de 48px e fonte mínima de 16px em px absolutos.
6. **Layout mobile para tabelas:** em <640px, transformar linhas em cartões (o POS já usa esse padrão em P7).
7. **Truncar ou reduzir valores de KPI** em <640px (por exemplo `text-lg`) ou usar 1 coluna.
8. **Importar JetBrains Mono 600 e 700.**
9. **Hospedar fontes localmente** (`@font-face` com `font-display: swap`) para não depender do Google Fonts em ambientes restritos.
10. **Roteamento por URL** quando o protótipo virar aplicação (em Angular: `RouterModule` com rotas equivalentes aos 13 valores de `page`).
11. **Acessibilidade:** ver 20.3.
12. **Ao portar para Angular** (stack da equipe): mapear cada componente de `ui.tsx` para um componente *standalone*, mapear `@theme` para variáveis CSS globais em `styles.scss` e manter Tailwind ou converter as classes pelos valores em px deste documento.

---

## 26. Regras para reprodução fiel da interface

### 26.1 Regras globais

1. Base tipográfica **14px** no web e **16px** no POS; altura de linha 1.6 e 1.45.
2. Toda medida em `rem` do Tailwind deve ser convertida com **1rem = 14px**. Breakpoints em **640px** e **1024px**.
3. Famílias: Outfit (títulos), Inter (texto), JetBrains Mono (números). Títulos com peso 600, altura de linha 1.25 e **margem 0**, independentemente de classes aplicadas.
4. Fundo de página `#F0F4F8`; cards brancos com borda 1px `#E2E8F0`, raio 20px e **sem sombra**.
5. Foco: contorno 2px `#2563EB` com deslocamento 2px em todo elemento com `:focus-visible`.
6. Valores monetários: `R$ 1.234,56`, fonte monoespaçada no web.
7. Raios: 6, 10, 14 e 20px; o "2xl" vale 14px.

### 26.2 Regras locais que não podem ser omitidas

| Tela ou componente | Regra |
|---|---|
| Sidebar | 210px, `#0F2544`, grupos com rótulo 10px uppercase `#4E7298` e espaçamento 1px |
| Header | 49px, branco, borda inferior; data só ≥640px |
| StatCard `primary` | Fundo e borda `#0F2544`, rótulo `#93C5FD` |
| Composição do bruto | Barra de 14px com 10% / 2% / 88% em `#F59E0B`, `#94A3B8`, `#16A34A` |
| Login | Painel de marca 420px só ≥1024px; formulário 360px |
| Formulários | Larguras máximas 392px (registro) e 448px (simulação), centralizados |
| Chat da IA | Altura fixa de 480px; bolhas com canto "rabo" de 6px |
| POS | Moldura 360px, altura 640 a 760px, header `#123463`, primária `#1F4E9E`, barra inferior só em Início |

### 26.3 Recursos que não devem ser substituídos arbitrariamente

Ícones SVG inline (seção 11.2), emojis das formas de pagamento, marcadores 01 a 03, glifos ✓ ! i ⚠ ✕ ◉, logo em arco com ponto, cores semânticas por estado, selos "SIMULADO" e "Dados demonstrativos" e todos os textos de responsabilidade legal.

### 26.4 Pontos sem informação suficiente para reprodução exata

1. Aparência dos glifos das fontes web (não carregadas no ambiente de inspeção).
2. Animação de entrada dos gráficos da Recharts (padrão da biblioteca, não configurada no código).
3. Valores de `lang` e `title` injetados pela hospedagem do Figma Make.
4. Conteúdo de `canvas.fig`.

---

## 27. Checklist de conformidade visual

Versão resumida. A versão completa, com mais de 100 itens verificáveis por tela, está em `CHECKLIST_DE_FIDELIDADE_VISUAL.md`.

| # | Item | Valor esperado |
|---|---|---|
| 1 | Raiz tipográfica | 14px |
| 2 | Largura da sidebar | 210px |
| 3 | Altura do header | 49px |
| 4 | Altura de `Input`/`Select` | 37px |
| 5 | Altura do botão `lg` | 35px |
| 6 | Raio de card | 20px |
| 7 | Raio de botão e campo | 14px |
| 8 | Cor do botão primário | `#1E54B7` |
| 9 | Cor do item ativo do menu | `#2563EB` |
| 10 | Fundo da página | `#F0F4F8` |
| 11 | Valor de KPI | JetBrains Mono 21px/600 |
| 12 | Título de página | Outfit 17.5px/600 |
| 13 | Breakpoints | 640px e 1024px |
| 14 | Sidebar mobile | Oculta, abre com overlay 40% e transição de 200ms |
| 15 | Contorno de foco | 2px `#2563EB`, deslocamento 2px |

---

## 28. Glossário

| Termo | Definição |
|---|---|
| Split Payment | Mecanismo previsto na Reforma Tributária (EC 132/2023) em que tributos são separados no momento do pagamento. No protótipo, sempre simulado |
| IBS / CBS | Imposto sobre Bens e Serviços e Contribuição sobre Bens e Serviços |
| Parcela roteada | Fração do pagamento enviada a um destino (tributo, taxa, comerciante) |
| Chave de idempotência | Identificador que impede o processamento duplicado da mesma operação |
| Smart POS | Terminal de pagamento Android com tela de toque |
| Token de design | Valor nomeado e reutilizável de cor, tipografia, espaço etc. |
| Valor arbitrário (Tailwind) | Classe com valor literal entre colchetes, como `bg-[#1E54B7]` |
| `@theme` | Bloco do Tailwind v4 que declara variáveis e gera utilitários |
| `@layer` | Camada de cascata do CSS; estilos fora de camada vencem os de dentro |
| rem | Unidade relativa ao tamanho de fonte do elemento raiz (`html`) |
| OKLCH | Espaço de cor perceptual usado pela paleta padrão do Tailwind v4 |
| `focus-visible` | Pseudoclasse de foco exibida quando o navegador julga que o usuário navega por teclado |
| Reflow | Capacidade de o conteúdo se reorganizar em larguras pequenas sem rolagem em duas direções |

---

## 29. Referências técnicas

1. W3C. *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
2. W3C. *Understanding Success Criterion 1.4.3: Contrast (Minimum)*. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
3. W3C. *Understanding Success Criterion 2.5.8: Target Size (Minimum)*. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
4. W3C. *Relative luminance* (definição usada no cálculo de contraste). https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
5. Tailwind Labs. *Tailwind CSS v4: Theme variables*. https://tailwindcss.com/docs/theme
6. Tailwind Labs. *Tailwind CSS v4: Adding custom styles / Using CSS layers*. https://tailwindcss.com/docs/adding-custom-styles
7. Tailwind Labs. *Upgrade guide v4 (cursor padrão em botões, hover apenas em dispositivos com hover)*. https://tailwindcss.com/docs/upgrade-guide
8. MDN Web Docs. *Cascade layers*. https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
9. MDN Web Docs. *rem e media queries*. https://developer.mozilla.org/en-US/docs/Web/CSS/length#rem
10. Recharts. *API Reference*. https://recharts.org/en-US/api
11. Björn Ottosson. *A perceptual color space for image processing (OKLab)*. https://bottosson.github.io/posts/oklab/
12. Brasil. *Emenda Constitucional nº 132, de 20 de dezembro de 2023*. https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm

---

## 30. Apêndices

### Apêndice A. Arquivos analisados

| Arquivo | Linhas | Conteúdo |
|---|---|---|
| `src/App.tsx` | 90 | Navegação por estado |
| `src/main.tsx` | 10 | Ponto de entrada |
| `src/index.css` | 99 | Tokens e estilos globais |
| `src/components/Layout.tsx` | 154 | Shell |
| `src/components/ui.tsx` | 672 | Biblioteca de componentes |
| `src/data/mockData.ts` | 140 | Dados fictícios |
| `src/pages/LoginPage.tsx` | 149 | W1 |
| `src/pages/CadastroPage.tsx` | 130 | W2 |
| `src/pages/DashboardPage.tsx` | 285 | W3 |
| `src/pages/VendasPage.tsx` | 200 | W4, W5 |
| `src/pages/NovaVendaPage.tsx` | 110 | W6 |
| `src/pages/DespesasPage.tsx` | 145 | W7 |
| `src/pages/NovaDespesaPage.tsx` | 202 | W8 |
| `src/pages/FluxoDeCaixaPage.tsx` | 207 | W9 |
| `src/pages/SplitPaymentPage.tsx` | 139 | W10 |
| `src/pages/SplitResultadoPage.tsx` | 179 | W11 |
| `src/pages/IAAnalisePage.tsx` | 309 | W12 |
| `src/pages/ConfiguracoesPage.tsx` | 187 | W13 |
| `src/pages/POSPage.tsx` | 329 | P1 a P15 |
| `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `.figma/make/site.json`, `AGENTS.md` | | Configuração |
| `make_repos.json`, `meta.json`, `ai_chat.json`, `images/*`, `thumbnail.png` | | Metadados e histórico |

### Apêndice B. Medições automatizadas

O arquivo `metrics.json` (incluído em `capturas.zip`) contém, para cada largura e tela, o estilo computado de 60 seletores: largura, altura, posição, família, tamanho, peso, altura de linha, espaçamento entre letras, cor, fundo, padding, raio, borda, sombra, gap e transição. Os valores marcados **[M]** neste documento vêm desse arquivo.

### Apêndice C. Capturas de tela

`capturas.zip` contém 158 PNGs (52 em desktop, 53 em tablet e 53 em mobile; a captura 09 só existe abaixo de 1024px) com os prefixos `desktop_` (1440×900), `tablet_` (768×1024) e `mobile_` (375×812). Capturas do Layout têm altura igual ao conteúdo do `main`. Lembrete: as fontes web não carregaram no ambiente de captura (seção 3.1).

| Nº | Conteúdo | Nº | Conteúdo |
|---|---|---|---|
| 01 | Login | 27 | IA digitando |
| 02 | Login com erro | 28 | IA respondendo |
| 03 | Login carregando | 29 a 33 | Estados da IA (Carregando, Erro de conexão, Timeout, Sem permissão, Vazio) |
| 04 | Cadastro | 34 | Configurações, dados do estabelecimento |
| 05 | Cadastro com erros | 35 | Dados da conta |
| 06 | Dashboard carregando | 36 | Preferências |
| 07 | Dashboard | 37 | Segurança |
| 08 | Dashboard, período Hoje | 38 | Confirmação de saída |
| 09 | Sidebar mobile aberta (só mobile e tablet) | 39 | POS login |
| 10 | Operações | 40 | POS início |
| 11 | Operações vazio | 41 | POS nova venda |
| 12 | Detalhe da operação | 42 | POS processando |
| 13 | Registrar venda | 43 | POS resultado |
| 14 | Registrar venda preenchido | 44 | POS registro |
| 15 | Venda registrada | 45 | POS IA |
| 16 | Despesas | 46 | POS falha |
| 17 | Registrar despesa com erros | 47 | POS operações |
| 18 | Sugestão da IA carregando | 48 | POS caixa |
| 19 | Sugestão da IA | 49 | POS projeção |
| 20 | Fluxo de Caixa | 50 | POS despesas |
| 21 | Fluxo, aba Realizado | 51 | POS simular |
| 22 | Simulação | 52 | POS alertas |
| 23 | Resultado da simulação | 53 | POS perfil |
| 24 | Resultado, IA carregando | | |
| 25 | Resultado, IA expandida | | |
| 26 | Análise com IA | | |

### Apêndice D. Histórico de versões do protótipo

| Versão | Commit | Data (UTC) | Título no Figma Make |
|---|---|---|---|
| 1 | `0ac3afe` | 2026-09-17 02:47 | Create Planner Commercial MVP |
| 2 | `303dfed` | 2026-09-17 03:03 | Update Planner Comercial MVP |
| 3 | `9f117f5` | 2026-10-01 06:26 | Create complete prototype |
| 4 | `2ffc68e` | 2026-10-01 06:35 | Planner Comercial Prototype |
| exportação | `508e5de` | 2026-10-23 22:35 | bootstrap (estado analisado) |

