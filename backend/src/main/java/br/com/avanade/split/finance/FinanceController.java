package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.*;
import br.com.avanade.split.shared.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class FinanceController {
  private final FinanceService finance;
  private final Idempotency intents;
  private final TaxEngine tax;
  private final Clock clock;
  private final AnalysisService analysis;

  public FinanceController(
      FinanceService finance,
      Idempotency intents,
      TaxEngine tax,
      Clock clock,
      AnalysisService analysis) {
    this.finance = finance;
    this.intents = intents;
    this.tax = tax;
    this.clock = clock;
    this.analysis = analysis;
  }

  @PostMapping("/expenses")
  public Object create(
      @RequestAttribute Actor actor,
      @RequestHeader("Idempotency-Key") String key,
      @Valid @RequestBody FinanceService.ExpenseInput input) {
    actor.require("despesa");
    return CoreController.response(
        intents.execute(actor, "EXPENSE", key, input, () -> finance.create(actor, input)), 201);
  }

  @GetMapping("/expenses/{id}")
  public Object expense(@RequestAttribute Actor actor, @PathVariable UUID id) {
    actor.require("financeiro");
    return finance.expense(actor, id);
  }

  @GetMapping("/expense-categories")
  public Object categories(@RequestAttribute Actor actor) {
    actor.require("despesa");
    return finance.categories();
  }

  @GetMapping("/expenses")
  public Object list(
      @RequestAttribute Actor actor,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size) {
    actor.require("financeiro");
    return finance.list(actor, from, to, search, page, size);
  }

  @GetMapping({"/cash-flow", "/dashboard"})
  public Object cash(
      @RequestAttribute Actor actor, @RequestParam LocalDate from, @RequestParam LocalDate to) {
    actor.require("financeiro");
    return finance.cash(actor, new br.com.avanade.split.shared.Period(from, to));
  }

  public record SimulationInput(
      @NotNull @Min(1) @Max(100000000) Long amountCents,
      @NotNull Boolean includeFee,
      @NotBlank @Pattern(regexp = "[A-Z_]{1,40}") String taxCategory) {}

  @PostMapping("/split-payment/simulate")
  public Object simulate(@RequestAttribute Actor actor, @Valid @RequestBody SimulationInput input) {
    actor.require("consultar");
    var rule = tax.rule(input.taxCategory(), clock.instant());
    return Map.of(
        "simulation",
        true,
        "mode",
        "SIMULADO",
        "currency",
        "BRL",
        "rule",
        rule,
        "includeFee",
        input.includeFee(),
        "amounts",
        TaxEngine.calculate(
            input.amountCents(), rule.taxBps(), input.includeFee() ? rule.feeBps() : 0));
  }

  public record AnalysisInput(@NotNull LocalDate from, @NotNull LocalDate to) {}

  @PostMapping("/ai/cash-analysis")
  public Object analyze(@RequestAttribute Actor actor, @Valid @RequestBody AnalysisInput input) {
    actor.require("financeiro");
    return analysis.analyze(
        actor, new br.com.avanade.split.shared.Period(input.from(), input.to()));
  }
}
