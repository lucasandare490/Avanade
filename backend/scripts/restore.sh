#!/usr/bin/env bash
set -euo pipefail
# Explicit target must be an EMPTY disposable database; no --clean or drop.
if [[ $# != 1 || ! -f $1 ]]; then echo 'Informe o arquivo de backup.' >&2; exit 2; fi
: "${PGDATABASE:?Defina PGDATABASE apontando para banco descartável vazio}"
if [[ $(psql -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'") != 0 ]]; then
  echo 'Restauração recusada: schema public não está vazio.' >&2; exit 2
fi
pg_restore --exit-on-error --single-transaction --no-owner --no-acl --dbname="$PGDATABASE" "$1"
