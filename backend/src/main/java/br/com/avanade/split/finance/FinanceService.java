package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.Views;
import br.com.avanade.split.shared.*;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
public class FinanceService {
  public record ExpenseInput(
      @NotBlank @Size(max = 240) String description,
      @NotNull @Min(1) @Max(100000000) Long amountCents,
      @NotBlank @Size(max = 40) String categoryId,
      @NotNull LocalDate paidOn) {}

  private final JdbcTemplate db;
  private final Clock clock;

  public FinanceService(JdbcTemplate db, Clock clock) {
    this.db = db;
    this.clock = clock;
  }

  @Transactional
  public Object create(Actor actor, ExpenseInput input) {
    if (input.paidOn().isAfter(LocalDate.now(clock.withZone(actor.zone())))
        || input.paidOn().isBefore(LocalDate.of(2000, 1, 1)))
      throw new ApiException(
          422, "INVALID_PAID_DATE", "Data paga deve estar entre 2000 e hoje no fuso da loja.");
    if (db.queryForObject(
            "SELECT count(*) FROM expense_category WHERE id=?", Long.class, input.categoryId())
        == 0) throw new ApiException(422, "INVALID_CATEGORY", "Categoria inválida.");
    UUID id = UUID.randomUUID();
    db.update(
        "INSERT INTO expense VALUES (?,?,?,?,?,?,?,?)",
        id,
        actor.merchantId(),
        actor.userId(),
        input.description().trim(),
        input.amountCents(),
        input.categoryId(),
        java.sql.Date.valueOf(input.paidOn()),
        java.sql.Timestamp.from(clock.instant()));
    db.update(
        "INSERT INTO cash_entry(id,merchant_id,expense_id,amount_cents,booked_on) VALUES"
            + " (?,?,?,?,?)",
        UUID.randomUUID(),
        actor.merchantId(),
        id,
        -input.amountCents(),
        java.sql.Date.valueOf(input.paidOn()));
    return expense(actor, id);
  }

  public Object expense(Actor actor, UUID id) {
    return db
        .query(
            "SELECT e.*,c.name category_name FROM expense e JOIN expense_category c ON"
                + " c.id=e.category_id WHERE e.id=? AND e.merchant_id=?",
            (r, n) -> expenseView(r),
            id,
            actor.merchantId())
        .stream()
        .findFirst()
        .orElseThrow(ApiException::missing);
  }

  private Map<String, Object> expenseView(java.sql.ResultSet r) throws java.sql.SQLException {
    return Map.of(
        "id",
        r.getObject("id"),
        "description",
        r.getString("description"),
        "amountCents",
        r.getLong("amount_cents"),
        "categoryId",
        r.getString("category_id"),
        "categoryName",
        r.getString("category_name"),
        "paidOn",
        r.getDate("paid_on").toLocalDate(),
        "createdAt",
        r.getTimestamp("created_at").toInstant());
  }

  public Object categories() {
    return db.query(
        "SELECT * FROM expense_category ORDER BY name",
        (r, n) -> Map.of("id", r.getString("id"), "name", r.getString("name")));
  }

  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Object list(Actor actor, LocalDate from, LocalDate to, String search, int page, int size) {
    Views.pagination(page, size);
    List<Object> args = new ArrayList<>();
    args.add(actor.merchantId());
    StringBuilder where = new StringBuilder(" WHERE e.merchant_id=?");
    if (from != null || to != null) {
      new br.com.avanade.split.shared.Period(from, to);
      where.append(" AND e.paid_on BETWEEN ? AND ?");
      args.add(java.sql.Date.valueOf(from));
      args.add(java.sql.Date.valueOf(to));
    }
    if (search != null && !search.isBlank()) {
      if (search.length() > 100)
        throw new ApiException(400, "INVALID_FILTER", "Busca muito longa.");
      where.append(" AND POSITION(lower(?) IN lower(e.description))>0");
      args.add(search.trim());
    }
    long count =
        db.queryForObject("SELECT count(*) FROM expense e" + where, Long.class, args.toArray());
    args.add(size);
    args.add((page - 1) * size);
    var items =
        db.query(
            "SELECT e.*,c.name category_name FROM expense e JOIN expense_category c ON"
                + " c.id=e.category_id"
                + where
                + " ORDER BY e.paid_on DESC,e.id DESC LIMIT ? OFFSET ?",
            (r, n) -> expenseView(r),
            args.toArray());
    return Map.of("items", items, "total", count, "page", page, "size", size);
  }

  public record CashFlow(
      br.com.avanade.split.shared.Period period,
      String timeZone,
      Instant updatedAt,
      long openingCents,
      long inflowCents,
      long expenseCents,
      long closingCents,
      String recognition) {}

  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public CashFlow cash(Actor actor, br.com.avanade.split.shared.Period period) {
    var rows =
        db.queryForMap(
            """
            SELECT COALESCE(sum(amount_cents) FILTER(WHERE booked_on<?),0) opening,
            COALESCE(sum(amount_cents) FILTER(WHERE booked_on BETWEEN ? AND ? AND operation_id IS NOT NULL),0) inflow,
            COALESCE(-sum(amount_cents) FILTER(WHERE booked_on BETWEEN ? AND ? AND expense_id IS NOT NULL),0) expense
            FROM cash_entry WHERE merchant_id=? AND booked_on<=?
            """,
            java.sql.Date.valueOf(period.from()),
            java.sql.Date.valueOf(period.from()),
            java.sql.Date.valueOf(period.to()),
            java.sql.Date.valueOf(period.from()),
            java.sql.Date.valueOf(period.to()),
            actor.merchantId(),
            java.sql.Date.valueOf(period.to()));
    long opening = safe(rows.get("opening")),
        inflow = safe(rows.get("inflow")),
        expense = safe(rows.get("expense"));
    long closing = Math.subtractExact(Math.addExact(opening, inflow), expense);
    safe(closing);
    return new CashFlow(
        period,
        actor.timeZone(),
        clock.instant(),
        opening,
        inflow,
        expense,
        closing,
        "NET_ON_SPLIT_COMPLETION_AND_PAID_EXPENSES");
  }

  private long safe(Object value) {
    long v = new java.math.BigDecimal(value.toString()).longValueExact();
    if (v > 9007199254740991L || v < -9007199254740991L)
      throw new ApiException(
          422, "AGGREGATE_LIMIT", "Agregado excede o limite numérico do cliente.");
    return v;
  }
}
