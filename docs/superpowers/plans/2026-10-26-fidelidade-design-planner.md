# Fidelidade visual do Planner — plano de implementação

> **For agentic workers:** Use `superpowers:executing-plans` or bounded independent delegation. Track each deliverable and verify it.

**Goal:** Aproximar o frontend da documentação Figma Make incorporada ao repositório, com servidor local para revisão visual.

**Architecture:** Manter React, rotas e contratos atuais. Aplicar tokens e layout no CSS global; ajustar entrada, painel e dashboard. Adicionar experiência POS demonstrativa isolada sem substituir o registro integrado da API.

**Tech Stack:** React 19, TypeScript, Vite 6, CSS, Vitest, Playwright.

**Spec:** `DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md`, seções 6–16, 18 e 26–27.

## Global Constraints

- Preservar autenticação, cadastro, recuperação de senha e operações da API.
- Manter melhorias de acessibilidade e legibilidade mobile que corrigem problemas reconhecidos no documento.
- Dados da experiência POS são demonstrativos e não criam vendas reais.
- Preservar mudanças preexistentes do usuário em arquivos não relacionados.

## Review Focus

- Entrada pública e login API: navegação continua permitindo autenticação.
- Largura 375px: sem rolagem horizontal nem KPI cortado.
- Menu móvel: abre, fecha e devolve foco.
- Valor financeiro longo: permanece legível.
- Modo POS: navega entre seus estados sem modificar dados de negócio.

### Task 1: Tokens e shell

**Files:** `frontend/src/estilos.css`, `frontend/src/inicializar.tsx`, `frontend/package.json`, `frontend/package-lock.json`.

- [x] Introduzir fontes Outfit, Inter e JetBrains Mono hospedadas no pacote.
- [x] Aplicar cores, raios, foco, sidebar 210px, header 49px e breakpoints 640/1024px.
- [x] Verificar build e visual em 375, 768 e 1440px.

### Task 2: Entrada e componentes

**Files:** `frontend/src/estilos.css`, `frontend/src/telas/TelaLogin.tsx`, `frontend/src/telas/TelaEntrada.tsx`.

- [x] Transformar login em layout de duas colunas no desktop, com formulário de 360px.
- [x] Adaptar cadastro e recuperação ao mesmo sistema visual sem perder controles existentes.
- [x] Aplicar medidas do documento em campos, botões, cards e selos.
- [x] Verificar fluxo de entrada e login em testes existentes.

### Task 3: Dashboard e responsividade

**Files:** `frontend/src/estilos.css`, `frontend/src/telas/TelaDashboard.tsx`.

- [x] Ajustar largura do dashboard, quatro indicadores financeiros e gráfico de área.
- [x] Manter valores calculados da fonte ativa; não introduzir números fixos do protótipo.
- [x] Verificar composição e estados em desktop e mobile.

### Task 4: POS demonstrativo isolado

**Files:** `frontend/src/telas/TelaPosDesign.tsx`, `frontend/src/estilos-pos.css`, `frontend/src/testes/pos-design.test.tsx`, `frontend/src/Aplicacao.tsx`.

- [x] Reproduzir as 15 telas demonstrativas P1–P15 com navegação local e aviso SIMULADO.
- [x] Preservar o formulário de venda integrado na rota atual da API.
- [x] Testar navegação representativa e saída ao dashboard.

### Task 5: Revisão e servidor

- [x] Rodar Vitest, build e verificações Playwright focadas.
- [x] Rodar `trail check` antes de eventual commit.
- [x] Iniciar Vite em 127.0.0.1 e informar o URL local.
