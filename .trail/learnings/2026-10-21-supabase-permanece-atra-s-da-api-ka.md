---
title: Supabase permanece atrás da API Java
author: Kássio
date: 2026-10-21
branch: main
touches:
  - ".vscode/settings.json"
  - README.md
  - android-pos/README.md
  - backend/README.md
  - frontend/e2e/caixa-semanal.spec.ts
  - frontend/e2e/integracao.spec.ts
  - frontend/e2e/relatorios-acessibilidade.spec.ts
  - frontend/src/estilos.css
  - frontend/src/telas/TelaLogin.tsx
  - AGENTS.md
---

## Decidido

- A integração usa o backend Java como única fronteira de autenticação e acesso ao PostgreSQL do Supabase; frontend e Android não devem receber o SDK Supabase nem chaves anon/service_role.

## Tentado e descartado

- Não foi adicionada dependência ou chave Supabase ao cliente, pois isso duplicaria a arquitetura documentada e exporia responsabilidades de autorização.

## Atenção

- A preparação real ainda depende de provisionar o projeto Supabase dedicado, roles split_owner/split_app, CA TLS e variáveis secretas fora do Git; depois é necessário homologar rede, certificado, migrações e HTTPS.
