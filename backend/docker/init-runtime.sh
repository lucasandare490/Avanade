#!/usr/bin/env bash
set -euo pipefail
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=runtime_password="$DATABASE_PASSWORD" <<'SQL'
CREATE ROLE split_app LOGIN PASSWORD :'runtime_password';
GRANT USAGE ON SCHEMA public TO split_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO split_app;
SQL
