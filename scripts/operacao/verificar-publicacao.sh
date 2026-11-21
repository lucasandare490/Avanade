#!/usr/bin/env bash
set -euo pipefail

api_url="${API_URL:?Informe API_URL, por exemplo https://planner-api-tvmg.onrender.com}"
frontend_url="${FRONTEND_URL:?Informe FRONTEND_URL, por exemplo https://planner-api-tvmg.onrender.com}"
api_url="${api_url%/}"
frontend_url="${frontend_url%/}"

health="$(curl --fail --silent --show-error --retry 3 --retry-delay 5 --max-time 180 "$api_url/actuator/health/readiness")"
[[ "$health" == *'"status":"UP"'* ]] || {
  echo "Readiness inesperado: $health" >&2
  exit 1
}

curl --fail --silent --show-error --max-time 30 -I "$frontend_url/" | grep -q ' 200 '

if [[ "$frontend_url" == "$api_url" ]]; then
  # Site e API no mesmo endereço: não há pedido entre origens, então não há CORS a conferir.
  curl --fail --silent --show-error --max-time 30 "$frontend_url/" | grep -q '<div id="root">'
  echo "Publicação aprovada: API UP e site no mesmo endereço (200)."
  exit 0
fi

cors_headers="$(curl --fail --silent --show-error --max-time 30 -i -X OPTIONS \
  "$api_url/api/v1/auth/login" \
  -H "Origin: $frontend_url" \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type')"
grep -Fqi "access-control-allow-origin: $frontend_url" <<<"$cors_headers"

echo "Publicação aprovada: API UP, frontend 200 e CORS autorizado."
