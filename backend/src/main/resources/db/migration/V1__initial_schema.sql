CREATE TABLE merchant (
 id uuid PRIMARY KEY, name varchar(120) NOT NULL, time_zone varchar(80) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_user (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchant(id),
 email varchar(254) UNIQUE NOT NULL, display_name varchar(120) NOT NULL,
 password_hash varchar(100) NOT NULL, role varchar(20) NOT NULL CHECK(role IN ('GERENTE','FINANCEIRO','OPERADOR')),
 UNIQUE(id, merchant_id)
);
CREATE TABLE auth_session (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES app_user(id), token_hash char(64) UNIQUE NOT NULL,
 expires_at timestamptz NOT NULL, revoked boolean NOT NULL DEFAULT false
);
CREATE INDEX session_expiry ON auth_session(expires_at);
CREATE TABLE tax_rule (
 id uuid PRIMARY KEY, version varchar(60) UNIQUE NOT NULL, category varchar(40) NOT NULL,
 tax_bps integer NOT NULL CHECK(tax_bps BETWEEN 0 AND 10000),
 fee_bps integer NOT NULL CHECK(fee_bps BETWEEN 0 AND 10000),
 valid_from timestamptz NOT NULL, CHECK(tax_bps + fee_bps <= 10000), UNIQUE(category,valid_from)
);
CREATE TABLE sale (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchant(id),
 user_id uuid NOT NULL, amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 1 AND 100000000),
 currency varchar(3) NOT NULL CHECK(currency='BRL'),
 payment_method varchar(10) NOT NULL CHECK(payment_method IN ('PIX','DEBIT','CREDIT')),
 tax_category varchar(40) NOT NULL, pos_device_id varchar(100),
 created_at timestamptz NOT NULL, failure_code varchar(60),
 FOREIGN KEY(user_id,merchant_id) REFERENCES app_user(id,merchant_id), UNIQUE(id,merchant_id)
);
CREATE TABLE payment (
 id uuid PRIMARY KEY, sale_id uuid UNIQUE NOT NULL, merchant_id uuid NOT NULL,
 status varchar(20) NOT NULL CHECK(status IN ('CONFIRMED','PENDING','DECLINED')),
 mode varchar(20) NOT NULL CHECK(mode='SIMULADO'),
 FOREIGN KEY(sale_id,merchant_id) REFERENCES sale(id,merchant_id)
);
CREATE TABLE split_operation (
 id uuid PRIMARY KEY, sale_id uuid UNIQUE NOT NULL, merchant_id uuid NOT NULL,
 rule_id uuid NOT NULL REFERENCES tax_rule(id), rule_version varchar(60) NOT NULL,
 tax_bps integer NOT NULL, fee_bps integer NOT NULL,
 gross_cents bigint NOT NULL CHECK(gross_cents BETWEEN 1 AND 100000000),
 tax_cents bigint NOT NULL CHECK(tax_cents>=0), fee_cents bigint NOT NULL CHECK(fee_cents>=0),
 net_cents bigint NOT NULL CHECK(net_cents>=0),
 status varchar(20) NOT NULL CHECK(status IN ('CRIADA','SEPARADA','ROTEADA','CONCLUIDA','FALHA')),
 created_at timestamptz NOT NULL, completed_at timestamptz,
 CHECK(gross_cents=tax_cents+fee_cents+net_cents),
 CHECK((status='CONCLUIDA') = (completed_at IS NOT NULL)),
 FOREIGN KEY(sale_id,merchant_id) REFERENCES sale(id,merchant_id), UNIQUE(id,merchant_id)
);
CREATE TABLE parcel (
 id uuid PRIMARY KEY, operation_id uuid NOT NULL, merchant_id uuid NOT NULL,
 kind varchar(10) NOT NULL CHECK(kind IN ('TAX','FEE','NET')),
 amount_cents bigint NOT NULL CHECK(amount_cents>=0), destination varchar(100) NOT NULL,
 status varchar(20) NOT NULL CHECK(status IN ('PENDENTE','ENVIADA','CONFIRMADA','FALHA')),
 confirmed_at timestamptz,
 CHECK((status='CONFIRMADA')=(confirmed_at IS NOT NULL)),
 FOREIGN KEY(operation_id,merchant_id) REFERENCES split_operation(id,merchant_id), UNIQUE(operation_id,kind)
);
CREATE TABLE ledger_event (
 id uuid PRIMARY KEY, operation_id uuid NOT NULL, merchant_id uuid NOT NULL,
 sequence bigint NOT NULL CHECK(sequence>0), occurred_at timestamptz NOT NULL,
 description varchar(500) NOT NULL, previous_hash char(64) NOT NULL, event_hash char(64) NOT NULL,
 FOREIGN KEY(operation_id,merchant_id) REFERENCES split_operation(id,merchant_id), UNIQUE(operation_id,sequence)
);
CREATE TABLE expense_category (id varchar(40) PRIMARY KEY, name varchar(80) UNIQUE NOT NULL);
INSERT INTO expense_category VALUES ('STOCK','Estoque'),('SERVICES','Serviços'),('OPERATING','Operacional');
CREATE TABLE expense (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchant(id), user_id uuid NOT NULL,
 description varchar(240) NOT NULL, amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 1 AND 100000000),
 category_id varchar(40) NOT NULL REFERENCES expense_category(id), paid_on date NOT NULL,
 created_at timestamptz NOT NULL, FOREIGN KEY(user_id,merchant_id) REFERENCES app_user(id,merchant_id), UNIQUE(id,merchant_id)
);
CREATE TABLE cash_entry (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchant(id),
 operation_id uuid UNIQUE, expense_id uuid UNIQUE, amount_cents bigint NOT NULL, booked_on date NOT NULL,
 FOREIGN KEY(operation_id,merchant_id) REFERENCES split_operation(id,merchant_id),
 FOREIGN KEY(expense_id,merchant_id) REFERENCES expense(id,merchant_id),
 CHECK((operation_id IS NOT NULL AND expense_id IS NULL AND amount_cents>=0) OR
       (operation_id IS NULL AND expense_id IS NOT NULL AND amount_cents<0))
);
CREATE TABLE request_intent (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchant(id), action varchar(100) NOT NULL,
 request_key varchar(128) NOT NULL, request_hash char(64) NOT NULL, response_json text NOT NULL,
 created_at timestamptz NOT NULL, UNIQUE(merchant_id,action,request_key)
);
CREATE TABLE ai_interaction (
 id uuid PRIMARY KEY, merchant_id uuid NOT NULL REFERENCES merchant(id),
 prompt_version varchar(40) NOT NULL, input_hash char(64) NOT NULL, provider varchar(40) NOT NULL,
 status varchar(30) NOT NULL, latency_ms bigint NOT NULL, created_at timestamptz NOT NULL
);
CREATE INDEX sale_tenant_date ON sale(merchant_id,created_at DESC,id DESC);
CREATE INDEX operation_tenant_date ON split_operation(merchant_id,created_at DESC,id DESC);
CREATE INDEX expense_tenant_date ON expense(merchant_id,paid_on DESC,id DESC);
CREATE INDEX cash_tenant_date ON cash_entry(merchant_id,booked_on);
CREATE INDEX ledger_tenant_operation ON ledger_event(merchant_id,operation_id,sequence);
-- Defense in depth: even table owners cannot accidentally mutate financial audit history.
CREATE FUNCTION reject_immutable_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable financial history' USING ERRCODE='23514'; END $$;
CREATE TRIGGER immutable_ledger BEFORE UPDATE OR DELETE ON ledger_event FOR EACH ROW EXECUTE FUNCTION reject_immutable_mutation();
CREATE TRIGGER immutable_cash BEFORE UPDATE OR DELETE ON cash_entry FOR EACH ROW EXECUTE FUNCTION reject_immutable_mutation();
CREATE TRIGGER immutable_rule BEFORE UPDATE OR DELETE ON tax_rule FOR EACH ROW EXECUTE FUNCTION reject_immutable_mutation();
