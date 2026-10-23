---
title: Password recovery flow and delivery boundary
author: Kássio
date: 2026-10-23
branch: main
touches:
  - ".vscode/settings.json"
  - android-pos/README.md
  - backend/README.md
  - frontend/e2e/caixa-semanal.spec.ts
  - frontend/e2e/integracao.spec.ts
  - frontend/e2e/relatorios-acessibilidade.spec.ts
  - frontend/src/estilos.css
  - AGENTS.md
  - backend/src/test/java/br/com/avanade/split/SupabaseDatabaseTest.java
  - codex-agentes-projeto/.codex/agents/desenvolvedor.toml
---

## Decided
- Password recovery stores only a SHA-256 token hash, enforces 12–72 minute expiry, invalidates prior tokens and active sessions, and returns a generic request response.

## Tried and ruled out
- No SMTP provider is configured in the project, so the production delivery adapter remains an explicit follow-up; a development-only response token is opt-in and disabled by default.

## Watch out
- Do not enable PASSWORD_RESET_DEV_TOKEN in production. The backend integration tests require socket permission for embedded Postgres; frontend tests and backend compilation passed.
