#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
umask 077
mkdir -p backend/.local
if [[ -z "${DEMO_PASSWORD:-}" ]]; then
  if [[ ! -f backend/.local/demo-password ]]; then
    python3 -c 'import secrets; from pathlib import Path; Path("backend/.local/demo-password").write_text(secrets.token_urlsafe(24))'
  fi
  DEMO_PASSWORD="$(cat backend/.local/demo-password)"
fi
export DEMO_PASSWORD
api_pid=''
web_pid=''
cleanup() {
  [[ -z "$web_pid" ]] || kill "$web_pid" 2>/dev/null || true
  [[ -z "$api_pid" ]] || kill "$api_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT TERM
if curl --fail --silent http://127.0.0.1:8080/actuator/health >/dev/null; then
  echo 'A API já está em execução na porta 8080.'
else
  backend/scripts/run-local.sh >backend/.local/server.log 2>&1 &
  api_pid=$!
  ready=false
  for ((i=0; i<120; i++)); do
    if curl --fail --silent http://127.0.0.1:8080/actuator/health >/dev/null; then ready=true; break; fi
    if ! kill -0 "$api_pid" 2>/dev/null; then echo 'Falha ao iniciar API. Consulte backend/.local/server.log.'; exit 1; fi
    sleep 1
  done
  if [[ "$ready" != true ]]; then echo 'A API não ficou pronta. Consulte backend/.local/server.log.'; exit 1; fi
fi
if [[ ! -d frontend/node_modules ]]; then npm --prefix frontend ci; fi
echo 'Planner integrado: http://127.0.0.1:5173'
echo 'Conta: gerente1@demo.local. Senha local: backend/.local/demo-password (ou DEMO_PASSWORD informada).'
echo 'Ctrl+C encerra os processos iniciados por este comando e preserva os dados.'
(cd frontend && exec env VITE_MODO_DADOS=api node node_modules/vite/bin/vite.js --host 127.0.0.1) &
web_pid=$!
wait "$web_pid"
