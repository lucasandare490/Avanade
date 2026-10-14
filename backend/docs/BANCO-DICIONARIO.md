# Dicionário extraído do PostgreSQL

Gerado por `DatabaseReport`; schema public após migrations. Sem dados de usuários.

## ai_interaction

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| prompt_version | character varying(40) | NO | — |
| input_hash | character(64) | NO | — |
| provider | character varying(40) | NO | — |
| status | character varying(30) | NO | — |
| latency_ms | bigint | NO | — |
| created_at | timestamp with time zone | NO | — |

Constraints:

- `ai_interaction_merchant_id_fkey`: FOREIGN KEY (merchant_id) REFERENCES merchant(id)
- `ai_interaction_pkey`: PRIMARY KEY (id)

Índices:

- `CREATE UNIQUE INDEX ai_interaction_pkey ON public.ai_interaction USING btree (id)`

## app_user

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| email | character varying(254) | NO | — |
| display_name | character varying(120) | NO | — |
| password_hash | character varying(100) | NO | — |
| role | character varying(20) | NO | — |

Constraints:

- `app_user_email_key`: UNIQUE (email)
- `app_user_id_merchant_id_key`: UNIQUE (id, merchant_id)
- `app_user_merchant_id_fkey`: FOREIGN KEY (merchant_id) REFERENCES merchant(id)
- `app_user_pkey`: PRIMARY KEY (id)
- `app_user_role_check`: CHECK (((role)::text = ANY ((ARRAY['GERENTE'::character varying, 'FINANCEIRO'::character varying, 'OPERADOR'::character varying])::text[])))

Índices:

- `CREATE UNIQUE INDEX app_user_email_key ON public.app_user USING btree (email)`
- `CREATE UNIQUE INDEX app_user_id_merchant_id_key ON public.app_user USING btree (id, merchant_id)`
- `CREATE UNIQUE INDEX app_user_pkey ON public.app_user USING btree (id)`

## auth_session

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| user_id | uuid | NO | — |
| token_hash | character(64) | NO | — |
| expires_at | timestamp with time zone | NO | — |
| revoked | boolean | NO | false |

Constraints:

- `auth_session_pkey`: PRIMARY KEY (id)
- `auth_session_token_hash_key`: UNIQUE (token_hash)
- `auth_session_user_id_fkey`: FOREIGN KEY (user_id) REFERENCES app_user(id)

Índices:

- `CREATE UNIQUE INDEX auth_session_pkey ON public.auth_session USING btree (id)`
- `CREATE UNIQUE INDEX auth_session_token_hash_key ON public.auth_session USING btree (token_hash)`
- `CREATE INDEX session_expiry ON public.auth_session USING btree (expires_at)`

## cash_entry

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| operation_id | uuid | YES | — |
| expense_id | uuid | YES | — |
| amount_cents | bigint | NO | — |
| booked_on | date | NO | — |

Constraints:

- `cash_entry_check`: CHECK ((((operation_id IS NOT NULL) AND (expense_id IS NULL) AND (amount_cents >= 0)) OR ((operation_id IS NULL) AND (expense_id IS NOT NULL) AND (amount_cents < 0))))
- `cash_entry_expense_id_key`: UNIQUE (expense_id)
- `cash_entry_expense_id_merchant_id_fkey`: FOREIGN KEY (expense_id, merchant_id) REFERENCES expense(id, merchant_id)
- `cash_entry_merchant_id_fkey`: FOREIGN KEY (merchant_id) REFERENCES merchant(id)
- `cash_entry_operation_id_key`: UNIQUE (operation_id)
- `cash_entry_operation_id_merchant_id_fkey`: FOREIGN KEY (operation_id, merchant_id) REFERENCES split_operation(id, merchant_id)
- `cash_entry_pkey`: PRIMARY KEY (id)

Índices:

- `CREATE UNIQUE INDEX cash_entry_expense_id_key ON public.cash_entry USING btree (expense_id)`
- `CREATE UNIQUE INDEX cash_entry_operation_id_key ON public.cash_entry USING btree (operation_id)`
- `CREATE UNIQUE INDEX cash_entry_pkey ON public.cash_entry USING btree (id)`
- `CREATE INDEX cash_tenant_date ON public.cash_entry USING btree (merchant_id, booked_on)`

## expense

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| user_id | uuid | NO | — |
| description | character varying(240) | NO | — |
| amount_cents | bigint | NO | — |
| category_id | character varying(40) | NO | — |
| paid_on | date | NO | — |
| created_at | timestamp with time zone | NO | — |

Constraints:

- `expense_amount_cents_check`: CHECK (((amount_cents >= 1) AND (amount_cents <= 100000000)))
- `expense_category_id_fkey`: FOREIGN KEY (category_id) REFERENCES expense_category(id)
- `expense_id_merchant_id_key`: UNIQUE (id, merchant_id)
- `expense_merchant_id_fkey`: FOREIGN KEY (merchant_id) REFERENCES merchant(id)
- `expense_pkey`: PRIMARY KEY (id)
- `expense_user_id_merchant_id_fkey`: FOREIGN KEY (user_id, merchant_id) REFERENCES app_user(id, merchant_id)

Índices:

- `CREATE UNIQUE INDEX expense_id_merchant_id_key ON public.expense USING btree (id, merchant_id)`
- `CREATE UNIQUE INDEX expense_pkey ON public.expense USING btree (id)`
- `CREATE INDEX expense_tenant_date ON public.expense USING btree (merchant_id, paid_on DESC, id DESC)`

## expense_category

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | character varying(40) | NO | — |
| name | character varying(80) | NO | — |

Constraints:

- `expense_category_name_key`: UNIQUE (name)
- `expense_category_pkey`: PRIMARY KEY (id)

Índices:

- `CREATE UNIQUE INDEX expense_category_name_key ON public.expense_category USING btree (name)`
- `CREATE UNIQUE INDEX expense_category_pkey ON public.expense_category USING btree (id)`

## flyway_schema_history

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| installed_rank | integer | NO | — |
| version | character varying(50) | YES | — |
| description | character varying(200) | NO | — |
| type | character varying(20) | NO | — |
| script | character varying(1000) | NO | — |
| checksum | integer | YES | — |
| installed_by | character varying(100) | NO | — |
| installed_on | timestamp without time zone | NO | now() |
| execution_time | integer | NO | — |
| success | boolean | NO | — |

Constraints:

- `flyway_schema_history_pk`: PRIMARY KEY (installed_rank)

Índices:

- `CREATE UNIQUE INDEX flyway_schema_history_pk ON public.flyway_schema_history USING btree (installed_rank)`
- `CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success)`

## ledger_event

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| operation_id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| sequence | bigint | NO | — |
| occurred_at | timestamp with time zone | NO | — |
| description | character varying(500) | NO | — |
| previous_hash | character(64) | NO | — |
| event_hash | character(64) | NO | — |

Constraints:

- `ledger_event_operation_id_merchant_id_fkey`: FOREIGN KEY (operation_id, merchant_id) REFERENCES split_operation(id, merchant_id)
- `ledger_event_operation_id_sequence_key`: UNIQUE (operation_id, sequence)
- `ledger_event_pkey`: PRIMARY KEY (id)
- `ledger_event_sequence_check`: CHECK ((sequence > 0))

Índices:

- `CREATE UNIQUE INDEX ledger_event_operation_id_sequence_key ON public.ledger_event USING btree (operation_id, sequence)`
- `CREATE UNIQUE INDEX ledger_event_pkey ON public.ledger_event USING btree (id)`
- `CREATE INDEX ledger_tenant_operation ON public.ledger_event USING btree (merchant_id, operation_id, sequence)`

## merchant

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| name | character varying(120) | NO | — |
| time_zone | character varying(80) | NO | — |
| created_at | timestamp with time zone | NO | now() |

Constraints:

- `merchant_pkey`: PRIMARY KEY (id)

Índices:

- `CREATE UNIQUE INDEX merchant_pkey ON public.merchant USING btree (id)`

## parcel

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| operation_id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| kind | character varying(10) | NO | — |
| amount_cents | bigint | NO | — |
| destination | character varying(100) | NO | — |
| status | character varying(20) | NO | — |
| confirmed_at | timestamp with time zone | YES | — |

Constraints:

- `parcel_amount_cents_check`: CHECK ((amount_cents >= 0))
- `parcel_check`: CHECK ((((status)::text = 'CONFIRMADA'::text) = (confirmed_at IS NOT NULL)))
- `parcel_kind_check`: CHECK (((kind)::text = ANY ((ARRAY['TAX'::character varying, 'FEE'::character varying, 'NET'::character varying])::text[])))
- `parcel_operation_id_kind_key`: UNIQUE (operation_id, kind)
- `parcel_operation_id_merchant_id_fkey`: FOREIGN KEY (operation_id, merchant_id) REFERENCES split_operation(id, merchant_id)
- `parcel_pkey`: PRIMARY KEY (id)
- `parcel_status_check`: CHECK (((status)::text = ANY ((ARRAY['PENDENTE'::character varying, 'ENVIADA'::character varying, 'CONFIRMADA'::character varying, 'FALHA'::character varying])::text[])))

Índices:

- `CREATE UNIQUE INDEX parcel_operation_id_kind_key ON public.parcel USING btree (operation_id, kind)`
- `CREATE UNIQUE INDEX parcel_pkey ON public.parcel USING btree (id)`

## payment

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| sale_id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| status | character varying(20) | NO | — |
| mode | character varying(20) | NO | — |

Constraints:

- `payment_mode_check`: CHECK (((mode)::text = 'SIMULADO'::text))
- `payment_pkey`: PRIMARY KEY (id)
- `payment_sale_id_key`: UNIQUE (sale_id)
- `payment_sale_id_merchant_id_fkey`: FOREIGN KEY (sale_id, merchant_id) REFERENCES sale(id, merchant_id)
- `payment_status_check`: CHECK (((status)::text = ANY ((ARRAY['CONFIRMED'::character varying, 'PENDING'::character varying, 'DECLINED'::character varying])::text[])))

Índices:

- `CREATE UNIQUE INDEX payment_pkey ON public.payment USING btree (id)`
- `CREATE UNIQUE INDEX payment_sale_id_key ON public.payment USING btree (sale_id)`

## request_intent

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| action | character varying(100) | NO | — |
| request_key | character varying(128) | NO | — |
| request_hash | character(64) | NO | — |
| response_json | text | NO | — |
| created_at | timestamp with time zone | NO | — |

Constraints:

- `request_intent_merchant_id_action_request_key_key`: UNIQUE (merchant_id, action, request_key)
- `request_intent_merchant_id_fkey`: FOREIGN KEY (merchant_id) REFERENCES merchant(id)
- `request_intent_pkey`: PRIMARY KEY (id)

Índices:

- `CREATE UNIQUE INDEX request_intent_merchant_id_action_request_key_key ON public.request_intent USING btree (merchant_id, action, request_key)`
- `CREATE UNIQUE INDEX request_intent_pkey ON public.request_intent USING btree (id)`

## sale

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| user_id | uuid | NO | — |
| amount_cents | bigint | NO | — |
| currency | character varying(3) | NO | — |
| payment_method | character varying(10) | NO | — |
| tax_category | character varying(40) | NO | — |
| pos_device_id | character varying(100) | YES | — |
| created_at | timestamp with time zone | NO | — |
| failure_code | character varying(60) | YES | — |

Constraints:

- `sale_amount_cents_check`: CHECK (((amount_cents >= 1) AND (amount_cents <= 100000000)))
- `sale_currency_check`: CHECK (((currency)::text = 'BRL'::text))
- `sale_id_merchant_id_key`: UNIQUE (id, merchant_id)
- `sale_merchant_id_fkey`: FOREIGN KEY (merchant_id) REFERENCES merchant(id)
- `sale_payment_method_check`: CHECK (((payment_method)::text = ANY ((ARRAY['PIX'::character varying, 'DEBIT'::character varying, 'CREDIT'::character varying])::text[])))
- `sale_pkey`: PRIMARY KEY (id)
- `sale_user_id_merchant_id_fkey`: FOREIGN KEY (user_id, merchant_id) REFERENCES app_user(id, merchant_id)

Índices:

- `CREATE UNIQUE INDEX sale_id_merchant_id_key ON public.sale USING btree (id, merchant_id)`
- `CREATE UNIQUE INDEX sale_pkey ON public.sale USING btree (id)`
- `CREATE INDEX sale_tenant_date ON public.sale USING btree (merchant_id, created_at DESC, id DESC)`

## split_operation

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| sale_id | uuid | NO | — |
| merchant_id | uuid | NO | — |
| rule_id | uuid | NO | — |
| rule_version | character varying(60) | NO | — |
| tax_bps | integer | NO | — |
| fee_bps | integer | NO | — |
| gross_cents | bigint | NO | — |
| tax_cents | bigint | NO | — |
| fee_cents | bigint | NO | — |
| net_cents | bigint | NO | — |
| status | character varying(20) | NO | — |
| created_at | timestamp with time zone | NO | — |
| completed_at | timestamp with time zone | YES | — |

Constraints:

- `operation_parcels`: TRIGGER DEFERRABLE INITIALLY DEFERRED
- `split_operation_check`: CHECK ((gross_cents = ((tax_cents + fee_cents) + net_cents)))
- `split_operation_check1`: CHECK ((((status)::text = 'CONCLUIDA'::text) = (completed_at IS NOT NULL)))
- `split_operation_fee_cents_check`: CHECK ((fee_cents >= 0))
- `split_operation_gross_cents_check`: CHECK (((gross_cents >= 1) AND (gross_cents <= 100000000)))
- `split_operation_id_merchant_id_key`: UNIQUE (id, merchant_id)
- `split_operation_net_cents_check`: CHECK ((net_cents >= 0))
- `split_operation_pkey`: PRIMARY KEY (id)
- `split_operation_rule_id_fkey`: FOREIGN KEY (rule_id) REFERENCES tax_rule(id)
- `split_operation_sale_id_key`: UNIQUE (sale_id)
- `split_operation_sale_id_merchant_id_fkey`: FOREIGN KEY (sale_id, merchant_id) REFERENCES sale(id, merchant_id)
- `split_operation_status_check`: CHECK (((status)::text = ANY ((ARRAY['CRIADA'::character varying, 'SEPARADA'::character varying, 'ROTEADA'::character varying, 'CONCLUIDA'::character varying, 'FALHA'::character varying])::text[])))
- `split_operation_tax_cents_check`: CHECK ((tax_cents >= 0))

Índices:

- `CREATE INDEX operation_tenant_date ON public.split_operation USING btree (merchant_id, created_at DESC, id DESC)`
- `CREATE UNIQUE INDEX split_operation_id_merchant_id_key ON public.split_operation USING btree (id, merchant_id)`
- `CREATE UNIQUE INDEX split_operation_pkey ON public.split_operation USING btree (id)`
- `CREATE UNIQUE INDEX split_operation_sale_id_key ON public.split_operation USING btree (sale_id)`

## tax_rule

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| version | character varying(60) | NO | — |
| category | character varying(40) | NO | — |
| tax_bps | integer | NO | — |
| fee_bps | integer | NO | — |
| valid_from | timestamp with time zone | NO | — |

Constraints:

- `tax_rule_category_valid_from_key`: UNIQUE (category, valid_from)
- `tax_rule_check`: CHECK (((tax_bps + fee_bps) <= 10000))
- `tax_rule_fee_bps_check`: CHECK (((fee_bps >= 0) AND (fee_bps <= 10000)))
- `tax_rule_pkey`: PRIMARY KEY (id)
- `tax_rule_tax_bps_check`: CHECK (((tax_bps >= 0) AND (tax_bps <= 10000)))
- `tax_rule_version_key`: UNIQUE (version)

Índices:

- `CREATE UNIQUE INDEX tax_rule_category_valid_from_key ON public.tax_rule USING btree (category, valid_from)`
- `CREATE UNIQUE INDEX tax_rule_pkey ON public.tax_rule USING btree (id)`
- `CREATE UNIQUE INDEX tax_rule_version_key ON public.tax_rule USING btree (version)`
