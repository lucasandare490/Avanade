-- Capital de giro com parceiro de crédito (fintech ou banco).
-- No MVP o parceiro é simulado (mode = 'SIMULADO'): nenhum dinheiro é movimentado.
-- O consentimento registra o que o comerciante aceitou compartilhar e pode ser revogado.
CREATE TABLE credit_consent (
  id uuid PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES merchant(id),
  user_id uuid NOT NULL REFERENCES app_user(id),
  partner varchar(40) NOT NULL,
  scopes varchar(200) NOT NULL,
  granted_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);
CREATE UNIQUE INDEX credit_consent_active ON credit_consent(merchant_id, partner) WHERE revoked_at IS NULL;

CREATE TABLE credit_offer (
  id uuid PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES merchant(id),
  partner varchar(40) NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  installments integer NOT NULL CHECK (installments BETWEEN 1 AND 12),
  monthly_rate_bp integer NOT NULL CHECK (monthly_rate_bp >= 0),
  annual_cet_bp integer NOT NULL CHECK (annual_cet_bp >= 0),
  installment_cents bigint NOT NULL CHECK (installment_cents > 0),
  total_cents bigint NOT NULL,
  first_due_on date NOT NULL,
  facts jsonb NOT NULL,
  mode varchar(10) NOT NULL CHECK (mode IN ('SIMULADO', 'REAL')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (total_cents = installment_cents * installments),
  CHECK (total_cents >= amount_cents),
  CHECK (expires_at > created_at)
);
CREATE INDEX credit_offer_merchant_idx ON credit_offer(merchant_id, created_at DESC);

CREATE TABLE credit_contract (
  id uuid PRIMARY KEY,
  offer_id uuid NOT NULL UNIQUE REFERENCES credit_offer(id),
  merchant_id uuid NOT NULL REFERENCES merchant(id),
  user_id uuid NOT NULL REFERENCES app_user(id),
  accepted_at timestamptz NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('ATIVO', 'QUITADO')),
  mode varchar(10) NOT NULL CHECK (mode IN ('SIMULADO', 'REAL'))
);
CREATE INDEX credit_contract_merchant_idx ON credit_contract(merchant_id, accepted_at DESC);

CREATE TABLE credit_installment (
  id uuid PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES credit_contract(id),
  number integer NOT NULL CHECK (number >= 1),
  due_on date NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  status varchar(20) NOT NULL CHECK (status IN ('A_VENCER', 'PAGA')),
  UNIQUE (contract_id, number)
);

GRANT SELECT, INSERT ON credit_consent, credit_offer, credit_contract, credit_installment TO split_app;
GRANT UPDATE (revoked_at) ON credit_consent TO split_app;
