---
title: Rotulo do ambiente no menu deve seguir o modo da sessao
author: Kássio
date: 2026-10-27
branch: main
touches:
  - ".vscode/settings.json"
  - android-pos/README.md
  - backend/README.md
  - frontend/e2e/caixa-semanal.spec.ts
  - frontend/e2e/integracao.spec.ts
  - frontend/e2e/relatorios-acessibilidade.spec.ts
  - frontend/src/componentes/EstruturaPainel.tsx
  - backend/src/test/java/br/com/avanade/split/SupabaseDatabaseTest.java
  - codex-agentes-projeto/.codex/agents/desenvolvedor.toml
  - codex-agentes-projeto/.codex/agents/explorador.toml
---

## Decided
- No shell do Planner, o modo demonstrativo mostra “Ambiente demonstrativo” e “Sair da demonstração”.
- Quando a API está integrada, o menu mostra “Processamento simulado”, “Sem movimentação real” e “Sair”: a autenticação e os dados podem ser persistidos, mas o processamento financeiro ainda é simulado.
- Um teste de interface cobre as duas situações.

## Tried and ruled out
- Manter “Ambiente demonstrativo” fixo em todos os modos: rotulava incorretamente a sessão conectada à API.

## Watch out
- A ausência de movimentação real não equivale a ausência de dados persistidos; textos do menu precisam distinguir essas coisas.
