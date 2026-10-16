#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DEMO_PASSWORD:?Configure uma senha sintetica para a verificacao}"
: "${MIGRATION_PASSWORD:?Configure uma senha sintetica para a verificacao}"
: "${DATABASE_PASSWORD:?Configure uma senha sintetica para a verificacao}"
# Dedicated Compose project: never stop another project's containers or remove volumes.
export COMPOSE_PROJECT_NAME="planner_verificacao_${GITHUB_RUN_ID:-local}"
trap 'docker compose down' EXIT
docker compose up --build --wait --wait-timeout 180
python3 scripts/smoke.py
docker compose restart api
for attempt in {1..60}; do
  if curl -fsS http://127.0.0.1:8080/actuator/health/readiness >/dev/null; then break; fi
  sleep 2
done
python3 scripts/smoke.py --recover
mkdir -p .local
backup=.local/verificacao-restauracao.dump
if [[ -e "$backup" ]]; then echo 'O backup de verificacao ja existe; escolha uma pasta de trabalho nova.' >&2; exit 2; fi
docker compose exec -T db pg_dump -U split_owner -d split --format=custom --no-owner --no-acl > "$backup"
restore_db="verificacao_restore_${GITHUB_RUN_ID:-$(date +%s)}"
docker compose exec -T db createdb -U split_owner "$restore_db"
docker compose exec -T db pg_restore -U split_owner --single-transaction --exit-on-error --no-owner --no-acl -d "$restore_db" < "$backup"
mapfile -t tables < <(docker compose exec -T db psql -U split_owner -d split -Atc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
[[ ${#tables[@]} -ge 15 ]] || { echo "Inventario de tabelas incompleto" >&2; exit 5; }
count=0
for table in "${tables[@]}"; do
  [[ "$table" =~ ^[a-z_][a-z_0-9]*$ ]] || exit 3
  query="SELECT count(*)::text || ':' || md5(COALESCE(string_agg(row_to_json(t)::text, E'\n' ORDER BY row_to_json(t)::text),'')) FROM \"$table\" t"
  original=$(docker compose exec -T db psql -U split_owner -d split -Atc "$query")
  restored=$(docker compose exec -T db psql -U split_owner -d "$restore_db" -Atc "$query")
  [[ "$original" == "$restored" ]] || { echo "Divergencia na tabela $table" >&2; exit 4; }
  count=$((count+1))
done
[[ "$count" == "${#tables[@]}" ]] || exit 6
printf '{"docker":true,"restart":true,"restoredTables":%s,"allTableContentsIdentical":true}\n' "$count" > .local/resultado-docker-restauracao.json
cat .local/resultado-docker-restauracao.json
