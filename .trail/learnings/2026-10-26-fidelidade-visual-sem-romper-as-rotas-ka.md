---
title: Fidelidade visual sem romper as rotas reais do Planner
author: Kássio
date: 2026-10-26
branch: main
touches:
  - ".vscode/settings.json"
  - android-pos/README.md
  - backend/README.md
  - frontend/e2e/caixa-semanal.spec.ts
  - frontend/e2e/integracao.spec.ts
  - frontend/e2e/relatorios-acessibilidade.spec.ts
  - frontend/package-lock.json
  - frontend/package.json
  - frontend/src/Aplicacao.tsx
  - frontend/src/componentes/EstruturaPainel.tsx
---

## Decided
- `DOCUMENTACAO_COMPLETA_FRONTEND_DESIGN_SYSTEM.md` é a referência para o frontend; traduzimos medidas do protótipo para `frontend/src/design-fidelidade.css` e fontes locais.
- O Smart POS do documento é uma experiência demonstrativa isolada em `pos-prototipo`. A rota de venda integrada à API continua separada.
- Em telas de até 480px, KPIs ficam em uma coluna para evitar corte horizontal identificado na própria documentação.

## Tried and ruled out
- Aplicar a largura máxima documentada diretamente ao elemento `main` reduzia o conteúdo útil pelo padding bilateral; o limite do `main` inclui esse padding.
- Reutilizar a classe global de `h2` no painel de marca fazia o título entrar em `display:flex` e quebrava a frase em colunas; a classe local define `display:block`.

## Watch out
- Não confundir os dados do POS demonstrativo com transações persistidas nem criar vendas de teste pela rota de produção.
- A validação visual local pode ser feita em 375, 768 e 1440px; a demo não usa credenciais reais.
