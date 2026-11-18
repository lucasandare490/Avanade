# Checklist de Fidelidade Visual · Planner Comercial

> Use este checklist ao reproduzir a interface em outra tecnologia ou ao revisar alterações no protótipo. Cada item tem o valor esperado do protótipo atual (commit `508e5de`), com medidas renderizadas na raiz de 14px. Fonte de cada valor: `DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md` (seção indicada).
>
> Marque `[x]` quando o item corresponder. Itens marcados com (defeito conhecido) reproduzem um comportamento atual que a documentação recomenda corrigir; decida com a equipe se a reprodução deve copiá-lo.

## 1. Fundamentos (seções 1.2, 6.3, 8)

- [ ] Tamanho de fonte raiz do web: 14px; altura de linha 1.6
- [ ] Tamanho de fonte raiz do POS: 16px; altura de linha 1.45
- [ ] Conversão usada: 1rem = 14px em espaçamentos, tamanhos de texto e larguras
- [ ] Breakpoints: 640px e 1024px (não usar 768px nem 1280px)
- [ ] Títulos (`h1` a `h6`): Outfit, peso 600, altura de linha 1.25, margem 0
- [ ] Texto corrido: Inter
- [ ] Valores monetários no web: JetBrains Mono
- [ ] Fontes carregadas com `display=swap`; Outfit 400 a 800, Inter 400 a 700, JetBrains Mono 400 e 500
- [ ] Formato monetário `R$ 1.234,56` (locale pt-BR, BRL)
- [ ] Contorno de foco: 2px sólido `#2563EB`, deslocamento 2px
- [ ] Scrollbar WebKit: 6px, trilho transparente, polegar `#CBD5E1` raio 3px, hover `#64748B`

## 2. Cores (seção 7)

- [ ] Fundo da página `#F0F4F8`
- [ ] Superfície de card `#FFFFFF` com borda 1px `#E2E8F0`
- [ ] Texto principal `#0F172A`; secundário `#334155`; atenuado `#64748B`; auxiliar `#94A3B8`
- [ ] Ação primária web `#1E54B7` (hover `#1844A0`, ativo `#143590`)
- [ ] Item ativo do menu e logo da sidebar `#2563EB`
- [ ] Sidebar, StatCard primary, chips selecionados, bolha do usuário `#0F2544`
- [ ] Sucesso `#16A34A`; atenção `#D97706`; erro `#DC2626`
- [ ] Badge success `#DCFCE7`/`#15803D`; warning `#FEF9C3`/`#A16207`; danger `#FEE2E2`/`#DC2626`; info `#DBEAFE`/`#1D4ED8`; default `#F1F5F9`/`#475569`
- [ ] Selo SIMULADO do Dashboard `#E0F2FE`/`#075985`; demais telas `Badge info`
- [ ] Composição do bruto: `#F59E0B` 10%, `#94A3B8` 2%, `#16A34A` 88%
- [ ] Gráficos: saldo `#1E54B7`, entradas `#16A34A` (área) ou `#86EFAC` (barra), saídas `#FCA5A5`, grade `#F1F5F9` tracejada 3 3
- [ ] POS: primária `#1F4E9E`, header `#123463`, fundo `slate-50` (`#F8FAFC`)

## 3. Raios, bordas e sombras (seção 10)

- [ ] Card, StatCard, AlertBanner, Toast: raio 20px
- [ ] Botão, campo, item de menu, avatar, chip: raio 14px
- [ ] Modal e bolhas do chat: raio 14px (não 20px)
- [ ] Segmento ativo de PeriodSelector e Tabs: raio 10px
- [ ] Canto "rabo" das bolhas: 6px
- [ ] Cards sem sombra em repouso
- [ ] `shadow-sm` em botões primary/danger, item ativo do menu e segmento ativo
- [ ] `shadow-lg` no toast; `shadow-2xl` no modal e na moldura do POS
- [ ] Card de projeção do Fluxo com borda tracejada

## 4. Shell (seções 13.25, 13.26, 16.0)

- [ ] Sidebar 210px, altura total, `#0F2544`
- [ ] Área do logo 64px de altura com borda inferior branca 10%
- [ ] Logo: quadrado 28px `#2563EB` raio 14px com ícone de arco branco 16px
- [ ] "Planner" Outfit 12.25px/600 branco; "Comercial" 10px/500 `#93C5FD`
- [ ] Card do estabelecimento 189px, fundo branco 5%, borda branca 10%, raio 20px
- [ ] Grupos: Principal, Operações, Financeiro, IA, Conta; rótulo 10px/600 uppercase `#4E7298`, espaçamento 1px
- [ ] Itens 35px de altura, ícone 16px, gap 10.5px, texto 12.25px/500
- [ ] Inativo `#93C5FD`, hover fundo branco 8% e texto branco, ativo `#2563EB`
- [ ] Selo "IA" 9px/700 no item Análise com IA
- [ ] Botão "Sair" no rodapé com borda superior branca 10%
- [ ] Header 49px, branco, borda inferior `#E2E8F0`, padding 14px (21px ≥1024px)
- [ ] Data por extenso pt-BR visível só ≥640px
- [ ] Sino 30×30px com ponto vermelho 7px
- [ ] Avatar 28px `#1E3A5F` com "MS" 10.5px/700; nome visível só ≥640px
- [ ] `main` com padding 14px (21px ≥1024px), único elemento rolável
- [ ] <1024px: sidebar oculta, botão ☰, overlay preto 40%, transição 200ms

## 5. Componentes (seção 13)

- [ ] Button sm 24.5px, md 31.5px, lg 35px, xl 49px de altura
- [ ] Button gap ícone/texto 7px; transição 150ms
- [ ] Button desabilitado com opacidade 50%
- [ ] Button loading mostra Spinner no lugar do ícone e mantém o texto
- [ ] Input e Select 37px; padding 8.75 × 12.25px; com ícone, padding esquerdo 31.5px
- [ ] Rótulo 12.25px/500 `#334155`, 5.25px acima do campo
- [ ] Foco do campo: borda `#1E54B7` + anel 2px a 15% + contorno global
- [ ] Erro do campo: borda `#DC2626` + mensagem 10.5px com "⚠"
- [ ] CurrencyInput com "R$" à esquerda e padding esquerdo 35px; tamanho lg 44px
- [ ] Toggle 35×21px, botão 17.5px, deslocamento 14px, 200ms; ligado `#1E54B7`, desligado `#CBD5E1`
- [ ] PeriodSelector/Tabs: contêiner `#F1F5F9` 31.5px, padding 3.5px; opção 24.5px
- [ ] StatCard padding 17.5px; rótulo 10.5px uppercase; valor 21px/600 mono
- [ ] Badge md 17.5px de altura; Badge sm 19.5px (sim, maior que o md)
- [ ] AlertBanner padding 12.25 × 14px, título 12.25px/600, mensagem 10.5px
- [ ] AIInsightCard com ponto 7px e padding 12.25px
- [ ] EmptyState com ícone 49px raio 14px e padding vertical 56px
- [ ] SuccessScreen com círculo 56px e botões em contêiner de 280px
- [ ] DemoDataBadge 10px/600 uppercase `#A16207` sobre `#FEF9C3` com "◉"
- [ ] PageHeader: `h1` 17.5px, subtítulo 12.25px, margem inferior 21px, botão voltar 28px

## 6. Telas (seção 16)

### Login
- [ ] Painel de marca 420px `#0F2544` só ≥1024px, padding 42px
- [ ] Coluna do formulário 360px centralizada
- [ ] h1 21px "Entrar na sua conta"
- [ ] Botão Entrar lg, largura total
- [ ] Divider "ou" encostado no botão (defeito conhecido)
- [ ] Marcadores 01 a 03 em quadrado 31.5px branco 8% com texto escuro (defeito conhecido)
- [ ] Caixa "Acesso demonstrativo" azul com margem superior 28px

### Cadastro
- [ ] Coluna 380px; botão voltar 31.5px branco com borda e raio 20px
- [ ] 5 campos com asterisco; dica "Mínimo 8 caracteres."

### Dashboard
- [ ] Largura máxima 896px, alinhado à esquerda, seções a cada 17.5px
- [ ] Carregamento de 600ms com spinner 28px
- [ ] 4 KPIs do núcleo (primary, warning, default, success) com gap 10.5px
- [ ] Composição 2/5 e Últimas operações 3/5 a partir de 1024px
- [ ] 4 KPIs do planner que mudam com Hoje / 7 dias / 30 dias
- [ ] Gráfico de área 180px com legenda Saldo, Entradas, Projeção
- [ ] AlertBanner warning dispensável
- [ ] AIAnalysisCard com 2 insights
- [ ] Ações rápidas 49px, 2 colunas <640px e 4 colunas ≥640px

### Operações e Detalhe
- [ ] Largura máxima 784px; filtros em card com padding 14px
- [ ] Tabela em grade de 5 colunas; linha 60.75px; hover `#F8FAFC`
- [ ] Líquido = bruto × 0,88 em verde; "Falha" com bruto riscado e líquido R$ 0,00
- [ ] Detalhe em 672px com 4 cards, destinos e linha do tempo com borda 2px `#BFDBFE`

### Registrar venda
- [ ] Largura 392px centralizada; CurrencyInput lg; 5 formas de pagamento em 2 colunas (173 × 51px)
- [ ] Selecionada: borda `#1E54B7`, fundo `#EFF6FF`
- [ ] Botão xl desabilitado até preencher; dica verde ao escolher PIX

### Despesas e Registrar despesa
- [ ] Alerta vermelho de vencidas com botão danger "Ver"
- [ ] Tabela em grade de 4 colunas com Badge "Recorrente"
- [ ] Campo de descrição com botão "Sugerir categoria" `#EFF6FF`/`#1E54B7`
- [ ] Caixa de sugestão da IA com "Aceitar" e "Alterar"
- [ ] Data e Status lado a lado; linha de despesa recorrente com Toggle

### Fluxo de Caixa
- [ ] 4 KPIs (primary, default com +57%, success, warning)
- [ ] Gráfico composto 260px com barras de largura máxima 14px e linha 2.5px
- [ ] Tabs Completo / Realizado / Projeção
- [ ] Cards Realizado e Projeção lado a lado ≥1024px; projeção com borda tracejada
- [ ] Tabela semanal com linhas projetadas a 70% de opacidade

### Simulação e Resultado
- [ ] Largura 448px centralizada
- [ ] Prévia com segregação em `#DC2626` e estimativa em `#16A34A`
- [ ] Resultado com 3 caixas empilhadas, valores 26.25px, setas 20×24px
- [ ] Card de IA com "Entender melhor" e 3 itens numerados

### Análise inteligente
- [ ] Aviso âmbar fixo no topo da rolagem (`sticky`)
- [ ] 6 chips de estado da IA
- [ ] Grade 1/3 + 2/3 ≥1024px
- [ ] Chat com 480px de altura; bolhas com largura máxima 80%
- [ ] Botão enviar 31.5px desabilitado com opacidade 40%

### Configurações
- [ ] Largura 588px centralizada; barra de abas raio 20px, abas 28px
- [ ] 4 abas com conteúdos conforme seção 16.13
- [ ] Botões "Salvar" mudam para "✓ Salvo!" por 2 segundos
- [ ] Confirmação de saída inline

## 7. Smart POS (seção 16.14)

- [ ] Moldura 360px, altura entre 640 e 760px, sombra 2xl, centralizada
- [ ] Header `#123463` com 67px; título 15.75px
- [ ] Selo SIMULADO `sky-100`/`sky-800` 16px/700
- [ ] Botões principais 56px (`min-h-16`) raio 14px `#1F4E9E`
- [ ] Botões e campos secundários 42px (`min-h-12`) (abaixo do requisito de 48px)
- [ ] Barra inferior com 5 itens de 49px, só na tela Início
- [ ] Processamento: 5 etapas que acendem a cada 420ms, total 2550ms
- [ ] Resultado: 3 parcelas laranja / cinza / verde e "Soma das parcelas = bruto"
- [ ] Falha: caixa `red-50`, botão "Reprocessar" `red-700` 56px
- [ ] Aviso de responsabilidade `slate-100` nas telas listadas na seção 5.2

## 8. Responsividade (seção 18)

- [ ] 375px: KPIs em 2 colunas; seções empilhadas; sidebar em gaveta
- [ ] 768px: ainda layout mobile (sidebar em gaveta), data visível no header
- [ ] 1440px: sidebar fixa; grades de 4 e 5 colunas
- [ ] Tabela semanal do Fluxo com rolagem horizontal em telas estreitas
- [ ] Barra de abas de Configurações com rolagem horizontal em telas estreitas

## 9. Animações (seção 19)

- [ ] Spinner gira 360° em 1s linear
- [ ] Indicador de digitação: 3 pontos com bounce 1s, atrasos 0 / 0.15 / 0.3s
- [ ] Processamento do POS com pulse 2s (não gira)
- [ ] Transições de hover em 150ms `cubic-bezier(0.4, 0, 0.2, 1)`
- [ ] Hover aplicado só em dispositivos com `(hover: hover)`

## 10. Textos obrigatórios

- [ ] "Valores simulados para demonstração e planejamento. O recolhimento oficial de IBS/CBS depende de integração com instituição autorizada e homologação." nas telas de resultado, Fluxo, Operações, Detalhe, Configurações e POS
- [ ] "Explicação gerada por IA. Não é aconselhamento tributário nem financeiro." no topo da Análise inteligente e da IA do POS
- [ ] "Análise gerada por IA" nos cabeçalhos de cards de IA
- [ ] Selo "SIMULADO" junto a valores de split
- [ ] "O Planner Comercial não é banco, adquirente, PSP nem sistema oficial do governo." em Configurações
