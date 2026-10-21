#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
config_file="${1:-.env.supabase}"
if [[ ! -f "$config_file" ]]; then
  echo 'Crie backend/.env.supabase a partir de scripts/supabase/.env.example.' >&2
  exit 1
fi
# Arquivo local confiável de configuração Bash; nunca imprimir seu conteúdo.
set -a
source "$config_file"
set +a
for name in DATABASE_URL DATABASE_USER DATABASE_PASSWORD MIGRATION_USER MIGRATION_PASSWORD SUPABASE_SSL_ROOT_CERT; do
  if [[ -z "${!name:-}" ]]; then
    echo "Configure $name no arquivo local." >&2
    exit 1
  fi
done
for name in DATABASE_URL MIGRATION_URL; do
  value="${!name:-$DATABASE_URL}"
  if [[ ! "$value" =~ ^jdbc:postgresql://[^/@?:]+:5432/postgres$ ]]; then
    echo "$name deve usar JDBC, porta 5432 e banco postgres, sem senha nem parâmetros na URL." >&2
    exit 1
  fi
done
if [[ ! "$DATABASE_USER" =~ ^split_app(\.[a-z0-9]+)?$ || ! "$MIGRATION_USER" =~ ^split_owner(\.[a-z0-9]+)?$ ]]; then
  echo 'Use split_app no runtime e split_owner nas migrations (com .PROJECT_REF no session pooler).' >&2
  exit 1
fi
if [[ ! -r "$SUPABASE_SSL_ROOT_CERT" ]]; then
  echo 'O certificado indicado em SUPABASE_SSL_ROOT_CERT não pode ser lido.' >&2
  exit 1
fi
jar_file=target/split-backend-0.1.0-SNAPSHOT.jar
if [[ ! -f "$jar_file" ]]; then
  echo 'Compile antes: cd backend && MAVEN_OPTS="-Xmx192m" ./mvnw -DskipTests package' >&2
  exit 1
fi
export SPRING_PROFILES_ACTIVE=supabase
export DEBUG=false TRACE=false
exec java -Xms32m -Xmx256m -jar "$jar_file"
