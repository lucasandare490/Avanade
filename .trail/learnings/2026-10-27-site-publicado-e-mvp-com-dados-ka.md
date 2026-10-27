---
title: Site publicado e MVP com dados persistidos
author: Kássio
date: 2026-10-27
branch: main
touches:
  - ".vscode/settings.json"
  - AGENTS.md
  - android-pos/README.md
  - backend/README.md
  - backend/src/main/java/br/com/avanade/split/config/OpenApiConfig.java
  - backend/src/main/java/br/com/avanade/split/core/ServicoRegistroVenda.java
  - backend/src/main/java/br/com/avanade/split/core/TaxEngine.java
  - backend/src/main/java/br/com/avanade/split/finance/ExplicacaoSplitController.java
  - backend/src/main/java/br/com/avanade/split/finance/MockAIProvider.java
  - backend/src/main/java/br/com/avanade/split/finance/ServicoExplicacaoFinanceira.java
---

## Decided
- O site conectado à API é o MVP publicado. Entrada, login, menu, ajuda e fluxos integrados não devem chamar o produto de demonstração.
- Vendas e despesas confirmadas são persistidas no servidor; pagamentos, split e tributos ainda são simulados, sem movimentação de dinheiro nem validade fiscal.
- A análise disponível é uma explicação por regras do servidor, sem provedor externo de IA.
- O Smart POS estático e as prévias com dados fictícios pertencem somente à demonstração local e ficam fora da navegação do MVP.

## Tried and ruled out
- Reaproveitar textos do protótipo local no modo integrado confundia dados persistidos com dados fictícios.
- Remover todos os avisos de simulação esconderia uma limitação importante do processamento financeiro.

## Watch out
- O identificador interno `venda-demonstrativa` e o valor de contrato `origem=demonstrativa` não são rótulos públicos; renomeá-los exigiria migração de rotas e contratos.
- Testes locais não versionados de Supabase podem esperar cinco migrações enquanto o projeto já tem seis; não alterar esse arquivo ao validar o MVP.
