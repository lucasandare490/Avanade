package br.com.avanade.split;

import br.com.avanade.split.auth.Actor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Bulk synthetic fixture in disposable test PostgreSQL, never in the persistent demo database. */
final class QueryPerformanceFixture {
  static void load(
      JdbcTemplate db, PlatformTransactionManager transactions, Actor first, Actor second) {
    new TransactionTemplate(transactions)
        .executeWithoutResult(
            tx -> {
              db.execute(
                  """
                  CREATE TEMP TABLE query_fixture (
                    sale_id uuid,operation_id uuid,expense_id uuid,merchant_id uuid,user_id uuid,
                    ordinal integer,created_at timestamptz
                  ) ON COMMIT DROP
                  """);
              for (var actor : java.util.List.of(first, second)) {
                db.update(
                    """
                    INSERT INTO query_fixture SELECT gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),?,?,g,
                      timestamptz '2026-09-01 12:00:00+00'+g*interval '1 second'
                    FROM generate_series(1,2000) g
                    """,
                    actor.merchantId(),
                    actor.userId());
              }
              db.execute(
                  """
                  INSERT INTO sale(id,merchant_id,user_id,amount_cents,currency,payment_method,tax_category,created_at)
                  SELECT sale_id,merchant_id,user_id,15000,'BRL','PIX','GENERAL',created_at FROM query_fixture
                  """);
              db.execute(
                  """
                  INSERT INTO payment SELECT gen_random_uuid(),sale_id,merchant_id,'CONFIRMED','SIMULADO' FROM query_fixture
                  """);
              db.execute(
                  """
                  INSERT INTO split_operation(id,sale_id,merchant_id,rule_id,rule_version,tax_bps,fee_bps,
                    gross_cents,tax_cents,fee_cents,net_cents,status,created_at,completed_at)
                  SELECT f.operation_id,f.sale_id,f.merchant_id,r.id,r.version,r.tax_bps,r.fee_bps,
                    15000,1500,300,13200,'CONCLUIDA',f.created_at,f.created_at+interval '1 second'
                  FROM query_fixture f CROSS JOIN tax_rule r WHERE r.version='DEMO-v1'
                  """);
              db.execute(
                  """
                  INSERT INTO parcel(id,operation_id,merchant_id,kind,amount_cents,destination,status,confirmed_at)
                  SELECT gen_random_uuid(),f.operation_id,f.merchant_id,p.kind,p.amount,'Destino sintético',
                    'CONFIRMADA',f.created_at+interval '1 second'
                  FROM query_fixture f CROSS JOIN (VALUES ('TAX',1500),('FEE',300),('NET',13200)) p(kind,amount)
                  """);
              db.execute(
                  """
                  WITH e AS (SELECT gen_random_uuid() id,operation_id,merchant_id,created_at FROM query_fixture)
                  INSERT INTO ledger_event
                  SELECT id,operation_id,merchant_id,1,created_at,'Carga sintética de consulta',repeat('0',64),
                    encode(sha256(convert_to(id::text||'|'||operation_id::text||'|'||merchant_id::text||'|1|'||
                      to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"')||
                      '|Carga sintética de consulta|'||repeat('0',64),'UTF8')),'hex') FROM e
                  """);
              db.execute(
                  """
                  INSERT INTO cash_entry(id,merchant_id,operation_id,amount_cents,booked_on)
                  SELECT gen_random_uuid(),merchant_id,operation_id,13200,date '2026-09-01' FROM query_fixture
                  """);
              db.execute(
                  """
                  INSERT INTO expense(id,merchant_id,user_id,description,amount_cents,category_id,paid_on,created_at)
                  SELECT expense_id,merchant_id,user_id,'Despesa sintética '||ordinal,100,'STOCK',
                    date '2026-09-01'+ordinal%30,created_at FROM query_fixture
                  """);
              db.execute(
                  """
                  INSERT INTO cash_entry(id,merchant_id,expense_id,amount_cents,booked_on)
                  SELECT gen_random_uuid(),merchant_id,expense_id,-100,date '2026-09-01'+ordinal%30 FROM query_fixture
                  """);
            });
  }
}
