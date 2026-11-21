#!/bin/sh
# Início da API no contêiner (Thayná Batista da Silva).
# Na Vercel não há arquivo secreto: o certificado CA público do Supabase pode vir
# na variável SUPABASE_SSL_ROOT_CERT_PEM e é gravado num arquivo só do processo.
set -eu
if [ -n "${SUPABASE_SSL_ROOT_CERT_PEM:-}" ]; then
  umask 077
  arquivo="$(mktemp /tmp/supabase-ca.XXXXXX)"
  printf '%s\n' "$SUPABASE_SSL_ROOT_CERT_PEM" > "$arquivo"
  if ! grep -q 'BEGIN CERTIFICATE' "$arquivo"; then
    echo 'SUPABASE_SSL_ROOT_CERT_PEM não contém um certificado PEM.' >&2
    exit 1
  fi
  SUPABASE_SSL_ROOT_CERT="$arquivo"
  export SUPABASE_SSL_ROOT_CERT
fi
exec java ${JAVA_OPTS:-} -jar /app/app.jar
