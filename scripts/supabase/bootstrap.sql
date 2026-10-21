-- Executar UMA VEZ como postgres no SQL Editor de um projeto dedicado novo.
-- Se as roles já existirem, a transação falha sem mudar senhas/privilégios existentes.
-- Não executar migrations como postgres: os grants automáticos do Supabase
-- para esse usuário podem expor tabelas pela Data API.
BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public')
     OR EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname='public') THEN
    RAISE EXCEPTION 'O schema public deve estar vazio. Use um projeto dedicado novo; não apague objetos existentes.';
  END IF;
END $$;
CREATE ROLE split_owner LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE split_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT split_owner TO postgres;
GRANT CONNECT ON DATABASE postgres TO split_owner, split_app;
GRANT USAGE, CREATE ON SCHEMA public TO split_owner;
GRANT USAGE ON SCHEMA public TO split_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Defaults pertencem ao criador dos objetos; não aos usuários da sessão web.
ALTER DEFAULT PRIVILEGES FOR ROLE split_owner IN SCHEMA public
  GRANT SELECT, INSERT ON TABLES TO split_app;
ALTER DEFAULT PRIVILEGES FOR ROLE split_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO split_app;
-- EXECUTE é concedido a PUBLIC por padrão no PostgreSQL. Revogar globalmente
-- apenas para objetos futuros desta role; revogação por schema não basta.
ALTER DEFAULT PRIVILEGES FOR ROLE split_owner REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE split_owner IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO split_app;
COMMIT;

-- As roles ainda não têm senha e não aceitam login remoto.
-- Defina senhas distintas depois, como explicado no README deste diretório.
