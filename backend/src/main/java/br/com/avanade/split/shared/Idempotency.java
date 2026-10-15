package br.com.avanade.split.shared;

import br.com.avanade.split.auth.Actor;
import com.fasterxml.jackson.databind.*;
import java.time.Clock;
import java.util.*;
import java.util.function.Supplier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Idempotency {
  private final JdbcTemplate db;
  private final ObjectMapper json;
  private final Clock clock;

  public record Result(JsonNode body, boolean replayed) {}

  public Idempotency(JdbcTemplate db, ObjectMapper json, Clock clock) {
    this.db = db;
    this.json = json;
    this.clock = clock;
  }

  @Transactional
  public Result execute(
      Actor actor, String action, String key, Object input, Supplier<Object> work) {
    validateKey(key);
    String hash = Hashes.sha256(encode(input));
    // Transaction-scoped lock works across processes/connections; collisions merely serialize
    // unrelated work.
    db.execute(
        (org.springframework.jdbc.core.ConnectionCallback<Void>)
            c -> {
              try (var p =
                  c.prepareStatement("SELECT pg_advisory_xact_lock(hashtextextended(?,0))")) {
                p.setString(1, actor.merchantId() + "/" + action + "/" + key);
                p.execute();
              }
              return null;
            });
    var existing =
        db.queryForList(
            "SELECT request_hash,response_json FROM request_intent WHERE merchant_id=? AND action=?"
                + " AND request_key=?",
            actor.merchantId(),
            action,
            key);
    if (!existing.isEmpty()) {
      if (!hash.equals(existing.getFirst().get("request_hash")))
        throw new ApiException(
            409, "IDEMPOTENCY_CONFLICT", "Chave já utilizada com dados diferentes.");
      return new Result(decode((String) existing.getFirst().get("response_json")), true);
    }
    String response = encode(work.get());
    db.update(
        "INSERT INTO request_intent VALUES (?,?,?,?,?,?,?)",
        UUID.randomUUID(),
        actor.merchantId(),
        action,
        key,
        hash,
        response,
        java.sql.Timestamp.from(clock.instant()));
    return new Result(decode(response), false);
  }

  public JsonNode recover(Actor actor, String action, String key) {
    validateKey(key);
    if (action.equals("SALE")) actor.require("vender");
    else if (action.equals("EXPENSE")) actor.require("despesa");
    else if ((action.startsWith("REPROCESS:") || action.startsWith("RECOVER_SPLIT:"))) actor.require("retomar");
    else throw ApiException.missing();
    return db
        .query(
            "SELECT response_json FROM request_intent WHERE merchant_id=? AND action=? AND"
                + " request_key=?",
            (r, n) -> decode(r.getString(1)),
            actor.merchantId(),
            action,
            key)
        .stream()
        .findFirst()
        .orElseThrow(ApiException::missing);
  }

  private void validateKey(String key) {
    if (key == null || !key.matches("[A-Za-z0-9_-]{8,128}"))
      throw new ApiException(
          422,
          "INVALID_IDEMPOTENCY_KEY",
          "Chave deve conter 8 a 128 letras, números, hífen ou sublinhado.");
  }

  private String encode(Object o) {
    try {
      return json.writeValueAsString(o);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private JsonNode decode(String s) {
    try {
      return json.readTree(s);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
