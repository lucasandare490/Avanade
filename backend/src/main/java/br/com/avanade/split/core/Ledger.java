package br.com.avanade.split.core;

import br.com.avanade.split.shared.Hashes;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class Ledger {
  private final JdbcTemplate db;
  private final Clock clock;

  public Ledger(JdbcTemplate db, Clock clock) {
    this.db = db;
    this.clock = clock;
  }

  public static String hash(
      UUID id,
      UUID operation,
      UUID merchant,
      long sequence,
      Instant time,
      String text,
      String previous) {
    return Hashes.sha256(
        id + "|" + operation + "|" + merchant + "|" + sequence + "|" + time + "|" + text + "|"
            + previous);
  }

  public void append(Operation o, String description) {
    var rows =
        db.queryForList(
            "SELECT sequence,event_hash FROM ledger_event WHERE operation_id=? ORDER BY sequence"
                + " DESC LIMIT 1",
            o.id);
    long sequence = rows.isEmpty() ? 1 : ((Number) rows.getFirst().get("sequence")).longValue() + 1;
    String previous = rows.isEmpty() ? "0".repeat(64) : (String) rows.getFirst().get("event_hash");
    UUID id = UUID.randomUUID();
    Instant time = clock.instant().truncatedTo(ChronoUnit.MICROS);
    db.update(
        "INSERT INTO ledger_event VALUES (?,?,?,?,?,?,?,?)",
        id,
        o.id,
        o.merchantId,
        sequence,
        java.sql.Timestamp.from(time),
        description,
        previous,
        hash(id, o.id, o.merchantId, sequence, time, description, previous));
  }
}
