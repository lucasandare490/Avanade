-- Bloqueio temporário de login após tentativas erradas seguidas.
-- Guarda só o SHA-256 do e-mail normalizado, nunca o e-mail nem a senha.
-- A contagem vale para qualquer e-mail, exista conta ou não, para não revelar
-- quais e-mails estão cadastrados.
CREATE TABLE login_attempt (
  email_hash char(64) PRIMARY KEY,
  failed_count integer NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  locked_until timestamptz,
  updated_at timestamptz NOT NULL
);
CREATE INDEX login_attempt_updated_idx ON login_attempt(updated_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON login_attempt TO split_app;
