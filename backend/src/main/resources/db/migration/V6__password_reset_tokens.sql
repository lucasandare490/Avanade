CREATE TABLE password_reset_token (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app_user(id),
  token_hash char(64) UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL,
  CHECK (expires_at > created_at),
  CHECK (used_at IS NULL OR used_at >= created_at)
);
CREATE INDEX password_reset_token_user_idx ON password_reset_token(user_id, created_at DESC);
CREATE INDEX password_reset_token_expiry_idx ON password_reset_token(expires_at) WHERE used_at IS NULL;
GRANT SELECT, INSERT, UPDATE ON password_reset_token TO split_app;
