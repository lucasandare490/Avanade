package br.com.avanade.split.core;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
public class Views {
  private final JdbcTemplate db;
  private final org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate named;

  public Views(JdbcTemplate db) {
    this.db = db;
    this.named = new org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate(db);
  }

  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Map<String, Object> sale(Actor actor, UUID id) {
    var result = sales(actor, List.of(id));
    if (result.isEmpty()) throw ApiException.missing();
    return result.getFirst();
  }

  private List<Map<String, Object>> sales(Actor actor, List<UUID> ids) {
    if (ids.isEmpty()) return List.of();
    var rows =
        named.queryForList(
            """
            SELECT s.*,p.id payment_id,p.status payment_status,o.id operation_id
            FROM sale s JOIN payment p ON p.sale_id=s.id AND p.merchant_id=s.merchant_id
            LEFT JOIN split_operation o ON o.sale_id=s.id AND o.merchant_id=s.merchant_id
            WHERE s.merchant_id=:merchant AND s.id IN (:ids)
            """,
            parameters(actor, ids));
    var operationIds =
        rows.stream().map(r -> (UUID) r.get("operation_id")).filter(Objects::nonNull).toList();
    var operations = operations(actor, operationIds);
    Map<UUID, Map<String, Object>> result = new HashMap<>();
    for (var r : rows) {
      Map<String, Object> v = new LinkedHashMap<>();
      v.put("id", r.get("id"));
      v.put("amountCents", r.get("amount_cents"));
      v.put("currency", r.get("currency"));
      v.put("paymentMethod", r.get("payment_method"));
      v.put("createdAt", instant(r.get("created_at")));
      v.put("mode", "SIMULADO");
      v.put("payment", Map.of("id", r.get("payment_id"), "status", r.get("payment_status")));
      v.put("failureCode", r.get("failure_code"));
      v.put(
          "operation",
          r.get("operation_id") == null ? null : operations.get(r.get("operation_id")));
      result.put((UUID) r.get("id"), v);
    }
    return ids.stream().filter(result::containsKey).map(result::get).toList();
  }

  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Map<String, Object> operation(Actor actor, UUID id) {
    var result = operations(actor, List.of(id)).get(id);
    if (result == null) throw ApiException.missing();
    return result;
  }

  private Map<UUID, Map<String, Object>> operations(Actor actor, List<UUID> ids) {
    if (ids.isEmpty()) return Map.of();
    var params = parameters(actor, ids);
    var rows =
        named.queryForList(
            """
            SELECT o.*,s.payment_method,p.status payment_status
            FROM split_operation o
            JOIN sale s ON s.id=o.sale_id AND s.merchant_id=o.merchant_id
            JOIN payment p ON p.sale_id=s.id AND p.merchant_id=s.merchant_id
            WHERE o.merchant_id=:merchant AND o.id IN (:ids)
            """,
            params);
    Map<UUID, List<Map<String, Object>>> parcels = new HashMap<>();
    named.query(
        """
        SELECT * FROM parcel WHERE merchant_id=:merchant AND operation_id IN (:ids)
        ORDER BY operation_id, CASE kind WHEN 'TAX' THEN 1 WHEN 'FEE' THEN 2 ELSE 3 END
        """,
        params,
        (org.springframework.jdbc.core.RowCallbackHandler)
            r -> {
              Map<String, Object> v = new LinkedHashMap<>();
              v.put("id", r.getObject("id"));
              v.put("kind", r.getString("kind"));
              v.put("amountCents", r.getLong("amount_cents"));
              v.put("destination", r.getString("destination"));
              v.put("status", r.getString("status"));
              v.put("confirmedAt", instant(r.getTimestamp("confirmed_at")));
              parcels
                  .computeIfAbsent(r.getObject("operation_id", UUID.class), k -> new ArrayList<>())
                  .add(v);
            });
    Map<UUID, List<Map<String, Object>>> events = new HashMap<>();
    // Keep the existing per-operation history limit without fetching another operation's history.
    named.query(
        """
        SELECT e.* FROM split_operation o
        CROSS JOIN LATERAL (
          SELECT * FROM ledger_event e
          WHERE e.operation_id=o.id AND e.merchant_id=:merchant ORDER BY e.sequence LIMIT 1000
        ) e WHERE o.merchant_id=:merchant AND o.id IN (:ids)
        ORDER BY e.operation_id,e.sequence
        """,
        params,
        (org.springframework.jdbc.core.RowCallbackHandler)
            r ->
                events
                    .computeIfAbsent(
                        r.getObject("operation_id", UUID.class), k -> new ArrayList<>())
                    .add(event(r)));
    Map<UUID, Map<String, Object>> result = new HashMap<>();
    for (var r : rows) {
      UUID id = (UUID) r.get("id");
      Map<String, Object> v = new LinkedHashMap<>();
      v.put("id", id);
      v.put("saleId", r.get("sale_id"));
      v.put("createdAt", instant(r.get("created_at")));
      v.put("completedAt", instant(r.get("completed_at")));
      v.put("grossCents", r.get("gross_cents"));
      v.put("taxCents", r.get("tax_cents"));
      v.put("feeCents", r.get("fee_cents"));
      v.put("netCents", r.get("net_cents"));
      v.put("status", r.get("status"));
      v.put("paymentStatus", r.get("payment_status"));
      v.put("paymentMethod", r.get("payment_method"));
      v.put("mode", "SIMULADO");
      v.put("currency", "BRL");
      v.put(
          "rule",
          Map.of(
              "id",
              r.get("rule_id"),
              "version",
              r.get("rule_version"),
              "taxBps",
              r.get("tax_bps"),
              "feeBps",
              r.get("fee_bps"),
              "rounding",
              "HALF_UP_TAX_FIRST_RESIDUAL_NET"));
      v.put("parcels", parcels.getOrDefault(id, List.of()));
      v.put("events", events.getOrDefault(id, List.of()));
      result.put(id, v);
    }
    return result;
  }

  private Map<String, Object> parameters(Actor actor, List<UUID> ids) {
    return Map.of("merchant", actor.merchantId(), "ids", ids);
  }

  private Map<String, Object> event(java.sql.ResultSet r) throws java.sql.SQLException {
    return Map.of(
        "id",
        r.getObject("id"),
        "sequence",
        r.getLong("sequence"),
        "occurredAt",
        r.getTimestamp("occurred_at").toInstant(),
        "description",
        r.getString("description"),
        "previousHash",
        r.getString("previous_hash"),
        "hash",
        r.getString("event_hash"));
  }

  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Map<String, Object> ledger(Actor actor, UUID saleId, int page, int size) {
    pagination(page, size);
    var rows =
        db.queryForList(
            """
            SELECT o.id FROM sale s LEFT JOIN split_operation o ON o.sale_id=s.id AND o.merchant_id=s.merchant_id
            WHERE s.id=? AND s.merchant_id=?
            """,
            saleId,
            actor.merchantId());
    if (rows.isEmpty()) throw ApiException.missing();
    UUID id = (UUID) rows.getFirst().get("id");
    if (id == null) return Map.of("items", List.of(), "total", 0L, "page", page, "size", size);
    long total =
        db.queryForObject(
            "SELECT count(*) FROM ledger_event WHERE operation_id=? AND merchant_id=?",
            Long.class,
            id,
            actor.merchantId());
    var items =
        db.query(
            "SELECT * FROM ledger_event WHERE operation_id=? AND merchant_id=? ORDER BY sequence"
                + " LIMIT ? OFFSET ?",
            (r, n) -> event(r),
            id,
            actor.merchantId(),
            size,
            (page - 1) * size);
    return Map.of("items", items, "total", total, "page", page, "size", size);
  }

  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Map<String, Object> list(
      Actor actor,
      boolean sales,
      LocalDate from,
      LocalDate to,
      String status,
      String method,
      String search,
      int page,
      int size) {
    pagination(page, size);
    String table = sales ? "sale" : "split_operation";
    StringBuilder where = new StringBuilder(" WHERE t.merchant_id=?");
    List<Object> args = new ArrayList<>();
    args.add(actor.merchantId());
    if (from != null || to != null) {
      var period = new br.com.avanade.split.shared.Period(from, to);
      where.append(" AND t.created_at>=? AND t.created_at<?");
      args.add(period.start(actor.zone()));
      args.add(period.end(actor.zone()));
    }
    if (status != null) {
      if (sales || !Set.of("CRIADA", "SEPARADA", "ROTEADA", "CONCLUIDA", "FALHA", "PENDENTE").contains(status))
        throw new ApiException(400, "INVALID_FILTER", "Status inválido.");
      if (status.equals("PENDENTE")) {
        where.append(" AND t.status IN ('CRIADA','SEPARADA','ROTEADA')");
      } else {
        where.append(" AND t.status=?");
        args.add(status);
      }
    }
    if (method != null) {
      if (!Set.of("PIX", "DEBIT", "CREDIT").contains(method))
        throw new ApiException(400, "INVALID_FILTER", "Meio inválido.");
      where.append(
          sales
              ? " AND t.payment_method=?"
              : " AND EXISTS(SELECT 1 FROM sale s WHERE s.id=t.sale_id AND s.payment_method=?)");
      args.add(method);
    }
    if (search != null && !search.isBlank()) {
      if (search.length() > 100)
        throw new ApiException(400, "INVALID_FILTER", "Busca muito longa.");
      where.append(" AND POSITION(? IN CAST(t.id AS text))>0");
      args.add(search.trim().toLowerCase(Locale.ROOT));
    }
    long count =
        db.queryForObject(
            "SELECT count(*) FROM " + table + " t" + where, Long.class, args.toArray());
    args.add(size);
    args.add((page - 1) * size);
    var ids =
        db.query(
            "SELECT t.id FROM "
                + table
                + " t"
                + where
                + " ORDER BY t.created_at DESC,t.id DESC LIMIT ? OFFSET ?",
            (r, n) -> r.getObject(1, UUID.class),
            args.toArray());
    List<Map<String, Object>> items;
    if (sales) items = sales(actor, ids);
    else {
      var operations = operations(actor, ids);
      items = ids.stream().map(operations::get).toList();
    }
    return Map.of("items", items, "total", count, "page", page, "size", size);
  }

  public static void pagination(int page, int size) {
    if (page < 1 || page > 1000000 || size < 1 || size > 100)
      throw new ApiException(
          400, "INVALID_PAGE", "Página deve ser positiva; tamanho entre 1 e 100.");
  }

  private Object instant(Object value) {
    return value == null ? null : ((java.sql.Timestamp) value).toInstant();
  }
}
