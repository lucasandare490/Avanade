package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.*;
import java.time.Clock;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ServicoExplicacaoFinanceira {
  private final ConsultaFatosParaExplicacao consultaFatos;
  private final AIProvider provider;
  private final JdbcTemplate db;
  private final Clock clock;
  private final ConsultaExplicacaoLimitada consultaLimitada;

  public ServicoExplicacaoFinanceira(
      ConsultaFatosParaExplicacao consultaFatos, AIProvider provider, JdbcTemplate db, Clock clock, ConsultaExplicacaoLimitada consultaLimitada) {
    this.consultaFatos = consultaFatos;
    this.provider = provider;
    this.db = db;
    this.clock = clock;
    this.consultaLimitada = consultaLimitada;
  }

  public Object analyze(Actor actor, Period period) {
    var snapshot = consultaFatos.consultar(actor, period);
    var facts = snapshot.cash();
    var comparison = snapshot.comparison();
    long start = System.nanoTime();
    String text;
    String status = "OK";
    try {
      text = consultaLimitada.consultar(() -> provider.explain(facts), 3000);
      text = ValidacaoExplicacaoFinanceira.validar(text, facts.openingCents(), facts.inflowCents(), facts.expenseCents(), facts.closingCents());
    } catch (RuntimeException e) {
      text = "Explicação indisponível. Os indicadores financeiros permanecem disponíveis.";
      status = "FALLBACK";
    }
    // Only server facts enter the provider. Descriptions and arbitrary prompts are never sent.
    db.update(
        "INSERT INTO ai_interaction VALUES (?,?,?,?,?,?,?,?)",
        UUID.randomUUID(),
        actor.merchantId(),
        "cash-explanation-v2",
        Hashes.sha256(
            period
                + "|"
                + facts.openingCents()
                + "|"
                + facts.inflowCents()
                + "|"
                + facts.expenseCents()
                + "|"
                + facts.closingCents() + "|" + comparison),
        provider.name(),
        status,
        (System.nanoTime() - start) / 1000000,
        java.sql.Timestamp.from(clock.instant()));
    text += InterpretacaoTendencias.explicar(comparison);
    var attention = facts.closingCents() < 0 ? "NEGATIVE_BALANCE" : facts.closingCents() == 0 ? "ZERO_BALANCE" : "POSITIVE_BALANCE";
    var structured = Map.of("summary", text, "attention", attention,
        "recommendations", List.of(facts.closingCents() < 0 ? "Confira as saídas realizadas e as entradas previstas antes de assumir novos compromissos." : "Compare os registros do período e confira as despesas antes de planejar novos compromissos."),
        "limitations", List.of("Dados demonstrativos; não representa aconselhamento fiscal.", "Saldo histórico não é previsão nem garantia de disponibilidade futura."),
        "templateVersion", "cash-explanation-v2");
    return Map.of(
        "structured", structured,
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
        facts,
        "tendencias", comparison);
  }
}


