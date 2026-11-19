package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.Period;
import java.time.LocalDate;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Reforma Tributária no caixa (Thayná Batista da Silva): imposto retido nas vendas pelo split
 * payment, créditos de IBS/CBS das compras e as linhas para o contador, num período de até 366
 * dias. Só leitura, sempre filtrado pela loja de quem pergunta.
 */
@RestController
@RequestMapping("/api/v1/tax-reform")
public class ReformaController {
  static final int LIMITE_LINHAS = 1000;
  private final JdbcTemplate db;

  public ReformaController(JdbcTemplate db) {
    this.db = db;
  }

  @GetMapping("/summary")
  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Map<String, Object> resumo(
      @RequestAttribute Actor actor, @RequestParam LocalDate from, @RequestParam LocalDate to) {
    actor.require("financeiro");
    var p = new Period(from, to);
    var de = java.sql.Date.valueOf(p.from());
    var ate = java.sql.Date.valueOf(p.to());
    var vendasTotais =
        db.queryForMap(
            "SELECT count(*) n, COALESCE(sum(o.gross_cents),0) gross, COALESCE(sum(o.tax_cents),0) tax,"
                + " COALESCE(sum(o.fee_cents),0) fee, COALESCE(sum(o.net_cents),0) net"
                + " FROM split_operation o JOIN cash_entry c ON c.operation_id=o.id AND c.merchant_id=o.merchant_id"
                + " WHERE o.merchant_id=? AND o.status='CONCLUIDA' AND c.booked_on BETWEEN ? AND ?",
            actor.merchantId(),
            de,
            ate);
    var comprasTotais =
        db.queryForMap(
            "SELECT count(*) n, COALESCE(sum(amount_cents),0) amount, COALESCE(sum(tax_credit_cents),0) credit,"
                + " count(*) FILTER (WHERE tax_credit_cents>0) with_credit"
                + " FROM expense WHERE merchant_id=? AND paid_on BETWEEN ? AND ?",
            actor.merchantId(),
            de,
            ate);
    var vendas =
        db.query(
            "SELECT o.id, c.booked_on, s.payment_method, o.gross_cents, o.tax_cents, o.fee_cents, o.net_cents"
                + " FROM split_operation o JOIN cash_entry c ON c.operation_id=o.id AND c.merchant_id=o.merchant_id"
                + " JOIN sale s ON s.id=o.sale_id AND s.merchant_id=o.merchant_id"
                + " WHERE o.merchant_id=? AND o.status='CONCLUIDA' AND c.booked_on BETWEEN ? AND ?"
                + " ORDER BY c.booked_on DESC, o.id DESC LIMIT ?",
            (r, n) -> {
              Map<String, Object> m = new LinkedHashMap<>();
              m.put("id", r.getObject("id"));
              m.put("date", r.getDate("booked_on").toLocalDate());
              m.put("paymentMethod", r.getString("payment_method"));
              m.put("grossCents", r.getLong("gross_cents"));
              m.put("taxCents", r.getLong("tax_cents"));
              m.put("feeCents", r.getLong("fee_cents"));
              m.put("netCents", r.getLong("net_cents"));
              return m;
            },
            actor.merchantId(),
            de,
            ate,
            LIMITE_LINHAS);
    var compras =
        db.query(
            "SELECT e.id, e.paid_on, e.description, c.name category_name, e.amount_cents, e.tax_credit_cents"
                + " FROM expense e JOIN expense_category c ON c.id=e.category_id"
                + " WHERE e.merchant_id=? AND e.paid_on BETWEEN ? AND ?"
                + " ORDER BY e.paid_on DESC, e.id DESC LIMIT ?",
            (r, n) -> {
              Map<String, Object> m = new LinkedHashMap<>();
              m.put("id", r.getObject("id"));
              m.put("date", r.getDate("paid_on").toLocalDate());
              m.put("description", r.getString("description"));
              m.put("categoryName", r.getString("category_name"));
              m.put("amountCents", r.getLong("amount_cents"));
              m.put("taxCreditCents", r.getLong("tax_credit_cents"));
              return m;
            },
            actor.merchantId(),
            de,
            ate,
            LIMITE_LINHAS);
    long imposto = ((Number) vendasTotais.get("tax")).longValue();
    long credito = ((Number) comprasTotais.get("credit")).longValue();
    Map<String, Object> r = new LinkedHashMap<>();
    r.put("from", p.from());
    r.put("to", p.to());
    r.put("salesCount", ((Number) vendasTotais.get("n")).longValue());
    r.put("grossCents", ((Number) vendasTotais.get("gross")).longValue());
    r.put("taxWithheldCents", imposto);
    r.put("feeCents", ((Number) vendasTotais.get("fee")).longValue());
    r.put("netCents", ((Number) vendasTotais.get("net")).longValue());
    r.put("purchasesCount", ((Number) comprasTotais.get("n")).longValue());
    r.put("purchasesCents", ((Number) comprasTotais.get("amount")).longValue());
    r.put("purchasesWithCreditCount", ((Number) comprasTotais.get("with_credit")).longValue());
    r.put("taxCreditCents", credito);
    // Crédito que ultrapassa o imposto do período fica acumulado para os próximos.
    r.put("creditUsableCents", Math.min(imposto, credito));
    r.put("creditCarryOverCents", Math.max(0, credito - imposto));
    r.put("netTaxCents", Math.max(0, imposto - credito));
    r.put("sales", vendas);
    r.put("purchases", compras);
    r.put("rowLimit", LIMITE_LINHAS);
    r.put("mode", "SIMULADO");
    return r;
  }
}
