# Inventário de Componentes · Planner Comercial

> Documento complementar de `DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md`. Medidas renderizadas com raiz de 14px (1rem = 14px). Marcadores: **[C]** confirmado no código, **[O]** observado, **[M]** medido, **[E]** estimado, **[R]** recomendado, **[NV]** não verificável.

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
