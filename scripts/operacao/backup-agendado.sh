#!/usr/bin/env bash
set -euo pipefail
umask 077

backup_dir="${BACKUP_DIR:?Informe BACKUP_DIR fora do repositório}"
mkdir -p -- "$backup_dir"
dest="$backup_dir/planner-$(date -u +%Y%m%dT%H%M%SZ).dump"

if [[ -e "$dest" ]]; then
  echo "Destino já existe; recusando sobrescrever: $dest" >&2
  exit 2
fi

pg_dump --format=custom --no-owner --no-acl --file="$dest"
echo "Backup criado em $dest"
