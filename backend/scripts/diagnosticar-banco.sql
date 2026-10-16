-- Diagnóstico somente leitura. Execute com psql e credenciais locais/operacionais apropriadas.
-- Não imprime SQL em execução, nomes de usuários, tokens ou dados financeiros.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '5s';
SELECT current_database() AS database, pg_database_size(current_database()) AS bytes;
SELECT state, count(*) AS connections FROM pg_stat_activity WHERE datname=current_database() GROUP BY state ORDER BY state;
SELECT mode, granted, count(*) AS locks FROM pg_locks WHERE database=(SELECT oid FROM pg_database WHERE datname=current_database()) GROUP BY mode, granted ORDER BY mode, granted;
SELECT count(*) AS blocked_connections FROM pg_stat_activity WHERE datname=current_database() AND cardinality(pg_blocking_pids(pid))>0;
SELECT count(*) FILTER (WHERE NOT success) AS failed_migrations, max(version) AS last_version FROM flyway_schema_history;
ROLLBACK;
