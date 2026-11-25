#!/usr/bin/env bash
# Roda os testes do backend e do frontend e atualiza a contagem no README (PT, EN, ES).
# Uso: ./scripts/atualizar-contagem-testes.sh   (depois, faça o commit dos READMEs)
# Os testes de navegador são contados pela lista (não precisam rodar aqui).
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
(cd backend && ./mvnw -B -q test)
(cd frontend && npm test -- --reporter=default --reporter=json --outputFile=test-results/vitest.json)
node scripts/auditoria/contagem-testes.mjs --atualizar \
  --backend backend/target/surefire-reports \
  --vitest frontend/test-results/vitest.json \
  --playwright
