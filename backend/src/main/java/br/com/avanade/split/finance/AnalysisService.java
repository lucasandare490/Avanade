package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.*;
import java.time.Clock;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AnalysisService {
  private final FinanceService finance;
  private final AIProvider provider;
  private final JdbcTemplate db;
  private final Clock clock;

  public AnalysisService(
      FinanceService finance, AIProvider provider, JdbcTemplate db, Clock clock) {
    this.finance = finance;
    this.provider = provider;
    this.db = db;
    this.clock = clock;
  }

  public Object analyze(Actor actor, Period period) {
    var facts = finance.cash(actor, period);
    long start = System.nanoTime();
    String text;
    String status = "OK";
    try {
      text = provider.explain(facts);
      if (text == null || text.isBlank() || text.length() > 4000)
        throw new IllegalStateException("Invalid explanation");
    } catch (RuntimeException e) {
      text = "Explicação indisponível. Os indicadores financeiros permanecem disponíveis.";
      status = "FALLBACK";
    }
    // Only server facts enter the provider. Descriptions and arbitrary prompts are never sent.
    db.update(
        "INSERT INTO ai_interaction VALUES (?,?,?,?,?,?,?,?)",
        UUID.randomUUID(),
        actor.merchantId(),
        "cash-explanation-v1",
        Hashes.sha256(
            period
                + "|"
                + facts.openingCents()
                + "|"
                + facts.inflowCents()
                + "|"
                + facts.expenseCents()
                + "|"
                + facts.closingCents()),
        provider.name(),
        status,
        (System.nanoTime() - start) / 1000000,
        java.sql.Timestamp.from(clock.instant()));
    return Map.of(
        "period",
        period,
        "text",
        text,
        "origin",
        "demonstrativa",
        "provider",
        provider.name(),
        "status",
        status,
        "facts",
        facts);
  }
}
