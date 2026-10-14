package br.com.avanade.split.core;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.*;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaleService {
  public enum PaymentMethod {
    PIX,
    DEBIT,
    CREDIT
  }

  public record SaleInput(
      @NotNull @Min(1) @Max(100000000) Long amountCents,
      @NotNull @Pattern(regexp = "BRL") String currency,
      @NotNull PaymentMethod paymentMethod,
      @NotBlank @Pattern(regexp = "[A-Z_]{1,40}") String taxCategory,
      @Size(max = 100) String posDeviceId) {}

  private final JdbcTemplate db;
  private final OperationRepository operations;
  private final TaxEngine tax;
  private final Ledger ledger;
  private final MockAdapters adapters;
  private final Clock clock;
  private final Views views;

  public SaleService(
      JdbcTemplate db,
      OperationRepository operations,
      TaxEngine tax,
      Ledger ledger,
      MockAdapters adapters,
      Clock clock,
      Views views) {
    this.db = db;
    this.operations = operations;
    this.tax = tax;
    this.ledger = ledger;
    this.adapters = adapters;
    this.clock = clock;
    this.views = views;
  }

  @Transactional
  public Object create(Actor actor, SaleInput input) {
    UUID sale = UUID.randomUUID();
    Instant now = clock.instant();
    db.update(
        "INSERT INTO"
            + " sale(id,merchant_id,user_id,amount_cents,currency,payment_method,tax_category,pos_device_id,created_at)"
            + " VALUES (?,?,?,?,?,?,?,?,?)",
        sale,
        actor.merchantId(),
        actor.userId(),
        input.amountCents(),
        input.currency(),
        input.paymentMethod().name(),
        input.taxCategory(),
        input.posDeviceId(),
        java.sql.Timestamp.from(now));
    String payment = adapters.confirmPayment();
    db.update(
        "INSERT INTO payment VALUES (?,?,?,?,?)",
        UUID.randomUUID(),
        sale,
        actor.merchantId(),
        payment,
        "SIMULADO");
    if (payment.equals("CONFIRMED")) {
      TaxEngine.Rule rule;
      try {
        rule = tax.rule(input.taxCategory(), now);
      } catch (ApiException e) {
        db.update("UPDATE sale SET failure_code=? WHERE id=?", e.code, sale);
        return views.sale(actor, sale);
      }
      var o =
          Operation.create(
              sale,
              actor.merchantId(),
              rule,
              TaxEngine.calculate(input.amountCents(), rule.taxBps(), rule.feeBps()),
              now);
      o = operations.saveAndFlush(o);
      ledger.append(o, "Pagamento simulado confirmado. Split criado.");
      parcel(o, "TAX", o.taxCents, "Tributo demonstrativo");
      parcel(o, "FEE", o.feeCents, "Processamento demonstrativo");
      parcel(o, "NET", o.netCents, "Estabelecimento demonstrativo");
      o.status = "SEPARADA";
      operations.flush();
      ledger.append(o, "Parcelas separadas pela regra " + o.ruleVersion + ".");
      route(actor, o, false);
    }
    return views.sale(actor, sale);
  }

  private void parcel(Operation o, String kind, long amount, String destination) {
    db.update(
        "INSERT INTO parcel(id,operation_id,merchant_id,kind,amount_cents,destination,status)"
            + " VALUES (?,?,?,?,?,?,?)",
        UUID.randomUUID(),
        o.id,
        o.merchantId,
        kind,
        amount,
        destination,
        "PENDENTE");
  }

  @Transactional
  public Object reprocess(Actor actor, UUID id) {
    Operation o = operations.lock(id, actor.merchantId()).orElseThrow(ApiException::missing);
    if (o.status.equals("CONCLUIDA")) return views.operation(actor, id);
    if (!o.status.equals("FALHA"))
      throw new ApiException(409, "INVALID_STATE", "Operação não elegível para retomada.");
    ledger.append(o, "Retomada solicitada; parcelas confirmadas serão preservadas.");
    route(actor, o, true);
    return views.operation(actor, id);
  }

  private void route(Actor actor, Operation o, boolean retry) {
    o.status = "ROTEADA";
    operations.flush();
    var parcels =
        db.queryForList(
            "SELECT * FROM parcel WHERE operation_id=? ORDER BY CASE kind WHEN 'TAX' THEN 1 WHEN"
                + " 'FEE' THEN 2 ELSE 3 END",
            o.id);
    for (var parcel : parcels) {
      if (parcel.get("status").equals("CONFIRMADA")) continue;
      String kind = (String) parcel.get("kind");
      if (!adapters.route(kind, retry)) {
        db.update("UPDATE parcel SET status='FALHA' WHERE id=?", parcel.get("id"));
        o.status = "FALHA";
        operations.flush();
        ledger.append(
            o, "Falha simulada no destino " + kind + ". Demais parcelas aguardam retomada.");
        return;
      }
      db.update(
          "UPDATE parcel SET status='CONFIRMADA',confirmed_at=? WHERE id=?",
          java.sql.Timestamp.from(clock.instant()),
          parcel.get("id"));
      ledger.append(o, "Parcela " + kind + " confirmada em modo SIMULADO.");
    }
    o.status = "CONCLUIDA";
    o.completedAt = clock.instant();
    operations.flush();
    db.update(
        "INSERT INTO cash_entry(id,merchant_id,operation_id,amount_cents,booked_on) VALUES"
            + " (?,?,?,?,?)",
        UUID.randomUUID(),
        o.merchantId,
        o.id,
        o.netCents,
        java.sql.Date.valueOf(o.completedAt.atZone(actor.zone()).toLocalDate()));
    ledger.append(o, "Split concluído; líquido reconhecido no caixa uma única vez.");
  }
}
