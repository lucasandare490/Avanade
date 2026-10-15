package br.com.avanade.split;
import static org.assertj.core.api.Assertions.*;
import br.com.avanade.split.core.TaxEngine;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
@SpringBootTest
class VigenciaRegraIntegrationTest extends PostgresSupport {
 @Autowired JdbcTemplate db;
 @Autowired TaxEngine engine;
 @Test void endIsExclusiveAndInvalidIntervalIsRejected() {
  String category="VALIDITY";
  var start=Instant.parse("2026-01-01T00:00:00Z");
  var end=Instant.parse("2026-02-01T00:00:00Z");
  var id=UUID.randomUUID();
  db.update("INSERT INTO tax_rule(id,version,category,tax_bps,fee_bps,valid_from,valid_to) VALUES (?,?,?,?,?,?,?)",id,"validity-"+id,category,1000,200,java.sql.Timestamp.from(start),java.sql.Timestamp.from(end));
  assertThat(engine.rule(category,start).id()).isEqualTo(id);
  assertThat(engine.rule(category,end.minusNanos(1000)).id()).isEqualTo(id);
  assertThatThrownBy(()->engine.rule(category,end)).isInstanceOf(br.com.avanade.split.shared.ApiException.class);
  assertThatThrownBy(()->db.update("INSERT INTO tax_rule(id,version,category,tax_bps,fee_bps,valid_from,valid_to) VALUES (?,?,?,?,?,?,?)",UUID.randomUUID(),"invalid-"+id,"INVALID",1000,0,java.sql.Timestamp.from(start),java.sql.Timestamp.from(start))).isInstanceOf(org.springframework.dao.DataAccessException.class);
 }
}

