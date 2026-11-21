-- Limite de pedidos de acesso (login, cadastro, recuperação) por IP e minuto,
-- guardado no banco para valer em todas as cópias da API (Thayná Batista da Silva).
-- Guarda só o SHA-256 do IP, nunca o IP em texto.
CREATE TABLE access_rate_window (
  bucket_hash char(64) NOT NULL,
  minute bigint NOT NULL,
  hits integer NOT NULL CHECK (hits > 0),
  PRIMARY KEY (bucket_hash, minute)
);
CREATE INDEX access_rate_window_minute_idx ON access_rate_window(minute);
GRANT SELECT, INSERT, UPDATE, DELETE ON access_rate_window TO split_app;
