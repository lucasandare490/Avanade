-- Capital de giro, ciclo completo: vários parceiros, crédito responsável,
-- pagamento de parcela, quitação antecipada, arrependimento e trilha de eventos.
ALTER TABLE credit_offer ADD COLUMN partner_name varchar(80);
UPDATE credit_offer SET partner_name = partner WHERE partner_name IS NULL;
ALTER TABLE credit_offer ALTER COLUMN partner_name SET NOT NULL;
ALTER TABLE credit_offer ADD COLUMN product varchar(20) NOT NULL DEFAULT 'CAPITAL_GIRO' CHECK (product IN ('CAPITAL_GIRO'));
-- Quanto a parcela compromete das entradas líquidas mensais, em pontos-base.
ALTER TABLE credit_offer ADD COLUMN commitment_bp integer CHECK (commitment_bp IS NULL OR commitment_bp >= 0);

ALTER TABLE credit_contract DROP CONSTRAINT credit_contract_status_check;
ALTER TABLE credit_contract ADD CONSTRAINT credit_contract_status_check CHECK (status IN ('ATIVO', 'QUITADO', 'CANCELADO'));
ALTER TABLE credit_contract ADD COLUMN settled_at timestamptz;
ALTER TABLE credit_contract ADD COLUMN cancelled_at timestamptz;
ALTER TABLE credit_contract ADD COLUMN payoff_cents bigint CHECK (payoff_cents IS NULL OR payoff_cents >= 0);
ALTER TABLE credit_contract ADD CONSTRAINT credit_contract_final_state CHECK (
  (status = 'ATIVO' AND settled_at IS NULL AND cancelled_at IS NULL) OR
  (status = 'QUITADO' AND settled_at IS NOT NULL AND cancelled_at IS NULL) OR
  (status = 'CANCELADO' AND cancelled_at IS NOT NULL AND settled_at IS NULL));

ALTER TABLE credit_installment ADD COLUMN paid_at timestamptz;
ALTER TABLE credit_installment ADD CONSTRAINT credit_installment_paid CHECK ((status = 'PAGA') = (paid_at IS NOT NULL));

-- Trilha de eventos: só inserção, nunca alteração (mesma proteção do ledger).
CREATE TABLE credit_event (
  id uuid PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES merchant(id),
  contract_id uuid REFERENCES credit_contract(id),
  user_id uuid REFERENCES app_user(id),
  type varchar(40) NOT NULL,
  detail jsonb NOT NULL,
  created_at timestamptz NOT NULL
);
CREATE INDEX credit_event_merchant_idx ON credit_event(merchant_id, created_at DESC);
CREATE TRIGGER immutable_credit_event BEFORE UPDATE OR DELETE ON credit_event FOR EACH ROW EXECUTE FUNCTION reject_immutable_mutation();

-- Webhook do parceiro: cada evento é processado uma única vez.
CREATE TABLE credit_webhook_event (
  event_id varchar(100) PRIMARY KEY,
  partner varchar(40) NOT NULL,
  received_at timestamptz NOT NULL
);

GRANT SELECT, INSERT ON credit_event, credit_webhook_event TO split_app;
GRANT UPDATE (status, settled_at, cancelled_at, payoff_cents) ON credit_contract TO split_app;
GRANT UPDATE (status, paid_at) ON credit_installment TO split_app;
