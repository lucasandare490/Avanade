#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export COMPOSE_PROJECT_NAME="planner_hospedagem_${GITHUB_RUN_ID:-local}"
export SITE_ADDRESS=:80 PUBLIC_ORIGIN=http://127.0.0.1:5188 WEB_HTTP_BIND=127.0.0.1:5188 WEB_HTTPS_BIND=127.0.0.1:5443
export DATABASE_URL=jdbc:postgresql://db:5432/split
trap 'docker compose --profile banco-local down' EXIT
docker compose --profile banco-local config --quiet
docker compose --profile banco-local up -d --wait db
docker compose --profile banco-local up --build -d --wait --wait-timeout 240 api web
docker compose exec -T web caddy validate --config /etc/caddy/Caddyfile
curl -fsS http://127.0.0.1:5188/ | grep -q '<html'
for path in actuator/metrics v3/api-docs; do
 status=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:5188/$path")
 [[ "$status" == 404 ]] || exit 3
done
[[ $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5188/api/v1/sales) == 401 ]]
docker compose exec -T api curl -fsS http://127.0.0.1:9090/actuator/metrics | grep -q names
python3 - <<'PY'
import json,os,urllib.request,subprocess
body=json.dumps({'email':'gerente1@demo.local','password':os.environ['DEMO_PASSWORD']}).encode()
r=urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:5188/api/v1/auth/login',data=body,headers={'Content-Type':'application/json','X-Forwarded-For':'203.0.113.11'}))
assert r.status==200
assert 'no-store' in r.headers.get('Cache-Control','')
config=json.loads(subprocess.check_output(['docker','compose','--profile','banco-local','config','--format','json']))
assert not config['services']['api'].get('ports') and not config['services']['db'].get('ports')
print('Proxy, frontend, login, metricas privadas e isolamento de portas: aprovados. TLS publico requer dominio real.')
PY
