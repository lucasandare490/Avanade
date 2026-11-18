-- Redefinição de senha: a API (papel split_app) precisa trocar o hash da senha.
-- Sem esta permissão, password-reset/complete falhava com "permission denied for
-- table app_user". Libera somente a coluna password_hash, nada mais da tabela.
GRANT UPDATE (password_hash) ON app_user TO split_app;
