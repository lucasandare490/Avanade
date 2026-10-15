package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import java.sql.DriverManager;
import java.util.*;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/** Isolated database: exercises the actual V1 -> V3 upgrade, not a clean install. */
class MigrationUpgradeTest extends PostgresSupport {
  @Test void upgradePreservesExistingFinancialDataAndAddsGuards() throws Exception {
    String name="upgrade_"+UUID.randomUUID().toString().replace("-","");
    try(var c=PG.getPostgresDatabase().getConnection();var statement=c.createStatement()) {
      statement.execute("CREATE DATABASE "+name);
    }
    String url="jdbc:postgresql://127.0.0.1:"+PG.getPort()+"/"+name;
    Flyway.configure().dataSource(url,"postgres","").target("1").load().migrate();
    var db=new JdbcTemplate(new DriverManagerDataSource(url,"postgres",""));
    UUID merchant=UUID.randomUUID(), user=UUID.randomUUID(), expense=UUID.randomUUID(), sale=UUID.randomUUID();
    db.update("INSERT INTO merchant(id,name,time_zone) VALUES (?,?,?)",merchant,"Upgrade sintético","America/Recife");
    db.update("INSERT INTO app_user VALUES (?,?,?,?,?,?)",user,merchant,"upgrade@fixture.invalid","Teste","not-a-login","GERENTE");
    db.update("INSERT INTO expense VALUES (?,?,?,?,?,?,?,?)",expense,merchant,user,"Despesa anterior",1000,"STOCK",java.sql.Date.valueOf("2026-10-01"),java.sql.Timestamp.valueOf("2026-10-01 12:00:00"));
    db.update("INSERT INTO cash_entry VALUES (?,?,?,?,?,?)",UUID.randomUUID(),merchant,null,expense,-1000,java.sql.Date.valueOf("2026-10-01"));
    db.update("INSERT INTO request_intent VALUES (?,?,?,?,?,?,?)",UUID.randomUUID(),merchant,"EXPENSE","upgrade-key","a".repeat(64),"{\"id\":\""+expense+"\"}",java.sql.Timestamp.valueOf("2026-10-01 12:00:00"));
    db.update("INSERT INTO sale VALUES (?,?,?,?,?,?,?,?,?,?)",sale,merchant,user,15000,"BRL","PIX","GENERAL",null,java.sql.Timestamp.valueOf("2026-10-01 12:00:00"),null);
    db.update("INSERT INTO payment VALUES (?,?,?,?,?)",UUID.randomUUID(),sale,merchant,"PENDING","SIMULADO");
    var tables=List.of("merchant","app_user","auth_session","tax_rule","sale","payment","split_operation","parcel","ledger_event","expense_category","expense","cash_entry","request_intent","ai_interaction");
    Map<String,String> before=new LinkedHashMap<>();
    for(String table:tables) before.put(table,snapshot(db,table));
    var flyway=Flyway.configure().dataSource(url,"postgres","").load();
    assertThat(flyway.migrate().migrationsExecuted).isEqualTo(2);
    for(String table:tables) assertThat(snapshot(db,table)).as(table).isEqualTo(before.get(table));
    assertThat(flyway.migrate().migrationsExecuted).isZero();
    assertThatThrownBy(()->db.update("UPDATE request_intent SET response_json='{}' WHERE request_key='upgrade-key'")).isInstanceOf(org.springframework.dao.DataAccessException.class);
    assertThat(db.queryForObject("SELECT amount_cents FROM cash_entry WHERE expense_id=?",Long.class,expense)).isEqualTo(-1000L);
  }
  private String snapshot(JdbcTemplate db,String table) {
    return db.queryForObject("SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb)::text FROM "+table+" t",String.class);
  }
}
