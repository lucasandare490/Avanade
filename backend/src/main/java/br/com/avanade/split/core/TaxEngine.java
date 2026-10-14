package br.com.avanade.split.core;

import br.com.avanade.split.shared.ApiException;
import java.math.*;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class TaxEngine {
  public record Rule(UUID id, String version, int taxBps, int feeBps) {}

  public record Amounts(long grossCents, long taxCents, long feeCents, long netCents) {}

  private final JdbcTemplate db;

  public TaxEngine(JdbcTemplate db) {
    this.db = db;
  }

  public Rule rule(String category, Instant at) {
    return db
        .query(
            "SELECT * FROM tax_rule WHERE category=? AND valid_from<=? ORDER BY valid_from DESC"
                + " LIMIT 1",
            (r, n) ->
                new Rule(
                    r.getObject("id", UUID.class),
                    r.getString("version"),
                    r.getInt("tax_bps"),
                    r.getInt("fee_bps")),
            category,
            java.sql.Timestamp.from(at))
        .stream()
        .findFirst()
        .orElseThrow(
            () ->
                new ApiException(
                    409,
                    "TAX_RULE_UNAVAILABLE",
                    "Não há regra demonstrativa vigente para esta categoria."));
  }

  public static Amounts calculate(long gross, int taxBps, int feeBps) {
    if (gross < 1 || gross > 100000000 || taxBps < 0 || feeBps < 0 || taxBps + feeBps > 10000)
      throw new IllegalArgumentException("Invalid split inputs");
    long tax = round(gross, taxBps);
    // Tax has priority; cap fee to residual when independent half-up rounds would exceed gross.
    long fee = Math.min(round(gross, feeBps), gross - tax);
    return new Amounts(gross, tax, fee, gross - tax - fee);
  }

  private static long round(long cents, int bps) {
    return BigDecimal.valueOf(cents)
        .multiply(BigDecimal.valueOf(bps))
        .divide(BigDecimal.valueOf(10000), 0, RoundingMode.HALF_UP)
        .longValueExact();
  }
}
