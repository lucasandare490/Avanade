---
title: Release demo e cold start do Render Free
author: Kássio
date: 2026-10-22
branch: main
touches:
  - ".vscode/settings.json"
  - android-pos/README.md
  - backend/README.md
  - frontend/e2e/caixa-semanal.spec.ts
  - frontend/e2e/integracao.spec.ts
  - frontend/e2e/relatorios-acessibilidade.spec.ts
  - frontend/src/estilos.css
  - frontend/src/telas/TelaLogin.tsx
  - AGENTS.md
  - backend/src/test/java/br/com/avanade/split/SupabaseDatabaseTest.java
---

## Decidido

- A release demonstrativa v0.1.0-demo representa o estado publicado em Vercel + Render + Supabase.
- O Render Free pode levar cerca de 90 segundos ou mais para responder depois de inatividade; isso é comportamento do plano, não falha do backend Java.

## Tentado e descartado

- Não foi removido o binding SERVER_ADDRESS=0.0.0.0 nem alterado o backend para contornar o cold start; a API respondeu status UP após a inicialização.

## Atenção

- Para uma experiência sem espera, será necessário manter o serviço ativo em plano pago ou migrar a hospedagem. Backups e monitoramento contínuo ainda precisam ser operacionalizados.
