#!/usr/bin/env bash
set -euo pipefail
# Uses standard PGHOST/PGPORT/PGUSER/PGDATABASE and .pgpass; never prints secrets.
umask 077
if [[ $# != 1 || -e $1 ]]; then echo 'Informe um arquivo de destino novo.' >&2; exit 2; fi
pg_dump --format=custom --no-owner --no-acl --file="$1"
