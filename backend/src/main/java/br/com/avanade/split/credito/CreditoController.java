package br.com.avanade.split.credito;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Capital de giro dentro do app: o comerciante autoriza o compartilhamento de
 * dados agregados, simula valor e parcelas e contrata com o parceiro, sem ir ao
 * banco. Quem concede o crédito é o parceiro (no MVP, simulado).
 */
@RestController
@RequestMapping("/api/v1/credit")
public class CreditoController {
  static final String ESCOPO = "VENDAS_E_CAIXA_90_DIAS";
  private final JdbcTemplate db;
  private final ParceiroCredito parceiro;
  private final Clock clock;

  public CreditoController(JdbcTemplate db, ParceiroCredito parceiro, Clock clock) {
    this.db = db;
    this.parceiro = parceiro;
    this.clock = clock;
  }

  public record PedidoOferta(
      @NotNull @Min(1) @Max(100_000_000) Long amountCents,
      @NotNull @Min(1) @Max(12) Integer installments) {}

  private static void exigirGerente(Actor actor) {
    if (!"GERENTE".equals(actor.role()))
      throw new ApiException(403, "FORBIDDEN", "Somente a pessoa gerente da loja pode autorizar ou contratar crédito.");
  }

  private LocalDate hoje(Actor actor) {
    return LocalDate.now(clock.withZone(actor.zone()));
  }

  ParceiroCredito.FatosLoja fatos(Actor actor) {
    LocalDate hoje = hoje(actor);
    var r = db.queryForMap(
        "SELECT COALESCE(sum(amount_cents) FILTER (WHERE operation_id IS NOT NULL),0) entradas,"
            + " COALESCE(-sum(amount_cents) FILTER (WHERE expense_id IS NOT NULL),0) despesas,"
            + " count(*) FILTER (WHERE operation_id IS NOT NULL) vendas"
            + " FROM cash_entry WHERE merchant_id=? AND booked_on BETWEEN ? AND ?",
        actor.merchantId(), java.sql.Date.valueOf(hoje.minusDays(89)), java.sql.Date.valueOf(hoje));
    return new ParceiroCredito.FatosLoja(
        ((Number) r.get("entradas")).longValue(), ((Number) r.get("despesas")).longValue(), ((Number) r.get("vendas")).longValue());
  }

  private Map<String, Object> consentimentoAtivo(Actor actor) {
    var rows = db.queryForList(
        "SELECT granted_at, scopes FROM credit_consent WHERE merchant_id=? AND partner=? AND revoked_at IS NULL",
        actor.merchantId(), parceiro.nome());
    if (rows.isEmpty()) return null;
    return Map.of(
        "grantedAt", ((java.sql.Timestamp) rows.getFirst().get("granted_at")).toInstant(),
        "scopes", List.of(((String) rows.getFirst().get("scopes")).split(",")));
  }

  private List<Map<String, Object>> contratos(Actor actor) {
    var lista = new ArrayList<Map<String, Object>>();
    for (var c : db.queryForList(
        "SELECT c.id, c.accepted_at, c.status, c.mode, o.amount_cents, o.installments, o.installment_cents, o.total_cents,"
            + " o.monthly_rate_bp, o.annual_cet_bp FROM credit_contract c JOIN credit_offer o ON o.id=c.offer_id"
            + " WHERE c.merchant_id=? ORDER BY c.accepted_at DESC LIMIT 20",
        actor.merchantId())) {
      var parcelas = db.queryForList(
          "SELECT number, due_on, amount_cents, status FROM credit_installment WHERE contract_id=? ORDER BY number",
          c.get("id"));
      var cronograma = parcelas.stream().map(p -> Map.<String, Object>of(
          "number", p.get("number"), "dueOn", ((java.sql.Date) p.get("due_on")).toLocalDate(),
          "amountCents", p.get("amount_cents"), "status", p.get("status"))).toList();
      var m = new LinkedHashMap<String, Object>();
      m.put("id", c.get("id"));
      m.put("acceptedAt", ((java.sql.Timestamp) c.get("accepted_at")).toInstant());
      m.put("status", c.get("status"));
      m.put("mode", c.get("mode"));
      m.put("amountCents", c.get("amount_cents"));
      m.put("installments", c.get("installments"));
      m.put("installmentCents", c.get("installment_cents"));
      m.put("totalCents", c.get("total_cents"));
      m.put("monthlyRateBp", c.get("monthly_rate_bp"));
      m.put("annualCetBp", c.get("annual_cet_bp"));
      m.put("schedule", cronograma);
      lista.add(m);
    }
    return lista;
  }

  @GetMapping
  public Map<String, Object> consultar(@RequestAttribute Actor actor) {
    actor.require("financeiro");
    var f = fatos(actor);
    var limite = parceiro.limite(f);
    var partner = new LinkedHashMap<String, Object>();
    partner.put("name", parceiro.nome());
    partner.put("mode", parceiro.modo());
    partner.put("limitCents", limite.valorCents());
    if (limite.motivo() != null) partner.put("reason", limite.motivo());
    partner.put("facts", Map.of("netInflow90dCents", f.entradasLiquidas90dCents(), "expenses90dCents", f.despesas90dCents(), "sales90d", f.vendas90d()));
    var resposta = new LinkedHashMap<String, Object>();
    resposta.put("partner", partner);
    resposta.put("consent", consentimentoAtivo(actor));
    resposta.put("contracts", contratos(actor));
    resposta.put("canContract", "GERENTE".equals(actor.role()));
    return resposta;
  }

  @PostMapping("/consent")
  @Transactional
  public ResponseEntity<?> consentir(@RequestAttribute Actor actor) {
    actor.require("financeiro");
    exigirGerente(actor);
    if (consentimentoAtivo(actor) == null)
      db.update("INSERT INTO credit_consent(id,merchant_id,user_id,partner,scopes,granted_at) VALUES (?,?,?,?,?,?)",
          UUID.randomUUID(), actor.merchantId(), actor.userId(), parceiro.nome(), ESCOPO, java.sql.Timestamp.from(clock.instant()));
    return ResponseEntity.status(201).body(consentimentoAtivo(actor));
  }

  @DeleteMapping("/consent")
  @Transactional
  public ResponseEntity<Void> revogar(@RequestAttribute Actor actor) {
    actor.require("financeiro");
    exigirGerente(actor);
    db.update("UPDATE credit_consent SET revoked_at=? WHERE merchant_id=? AND partner=? AND revoked_at IS NULL",
        java.sql.Timestamp.from(clock.instant()), actor.merchantId(), parceiro.nome());
    return ResponseEntity.noContent().build();
  }

  private Map<String, Object> oferta(Map<String, Object> o) {
    var m = new LinkedHashMap<String, Object>();
    m.put("id", o.get("id"));
    m.put("partner", o.get("partner"));
    m.put("mode", o.get("mode"));
    m.put("amountCents", o.get("amount_cents"));
    m.put("installments", o.get("installments"));
    m.put("installmentCents", o.get("installment_cents"));
    m.put("totalCents", o.get("total_cents"));
    m.put("interestCents", ((Number) o.get("total_cents")).longValue() - ((Number) o.get("amount_cents")).longValue());
    m.put("monthlyRateBp", o.get("monthly_rate_bp"));
    m.put("annualCetBp", o.get("annual_cet_bp"));
    m.put("firstDueOn", ((java.sql.Date) o.get("first_due_on")).toLocalDate());
    m.put("expiresAt", ((java.sql.Timestamp) o.get("expires_at")).toInstant());
    return m;
  }

  @PostMapping("/offers")
  @Transactional
  public ResponseEntity<?> simular(@RequestAttribute Actor actor, @Valid @RequestBody PedidoOferta pedido) {
    actor.require("financeiro");
    if (consentimentoAtivo(actor) == null)
      throw new ApiException(409, "CONSENT_REQUIRED", "Autorize o compartilhamento dos dados com o parceiro antes de simular.");
    var f = fatos(actor);
    var p = parceiro.cotar(f, pedido.amountCents(), pedido.installments(), hoje(actor));
    UUID id = UUID.randomUUID();
    Instant agora = clock.instant();
    db.update(
        "INSERT INTO credit_offer(id,merchant_id,partner,amount_cents,installments,monthly_rate_bp,annual_cet_bp,installment_cents,total_cents,first_due_on,facts,mode,created_at,expires_at)"
            + " VALUES (?,?,?,?,?,?,?,?,?,?,?::jsonb,?,?,?)",
        id, actor.merchantId(), parceiro.nome(), p.valorCents(), p.parcelas(), p.taxaMensalBp(), p.cetAnualBp(),
        p.parcelaCents(), p.totalCents(), java.sql.Date.valueOf(p.primeiroVencimento()),
        "{\"netInflow90dCents\":" + f.entradasLiquidas90dCents() + ",\"expenses90dCents\":" + f.despesas90dCents() + ",\"sales90d\":" + f.vendas90d() + "}",
        parceiro.modo(), java.sql.Timestamp.from(agora), java.sql.Timestamp.from(agora.plusSeconds(24 * 3600)));
    return ResponseEntity.status(201).body(oferta(db.queryForMap("SELECT * FROM credit_offer WHERE id=?", id)));
  }

  @PostMapping("/offers/{id}/accept")
  @Transactional
  public Map<String, Object> contratar(@RequestAttribute Actor actor, @PathVariable UUID id) {
    actor.require("financeiro");
    exigirGerente(actor);
    var ofertas = db.queryForList("SELECT * FROM credit_offer WHERE id=? AND merchant_id=? FOR UPDATE", id, actor.merchantId());
    if (ofertas.isEmpty()) throw ApiException.missing();
    var o = ofertas.getFirst();
    // Mesma oferta aceita de novo devolve o mesmo contrato (sem contratar duas vezes).
    var existente = db.queryForList("SELECT id FROM credit_contract WHERE offer_id=?", id);
    if (existente.isEmpty()) {
      if (!((java.sql.Timestamp) o.get("expires_at")).toInstant().isAfter(clock.instant()))
        throw new ApiException(409, "OFFER_EXPIRED", "A proposta venceu. Faça uma nova simulação.");
      if (consentimentoAtivo(actor) == null)
        throw new ApiException(409, "CONSENT_REQUIRED", "O compartilhamento de dados com o parceiro foi revogado. Autorize de novo para contratar.");
      var proposta = new ParceiroCredito.Proposta(
          ((Number) o.get("amount_cents")).longValue(), ((Number) o.get("installments")).intValue(),
          ((Number) o.get("monthly_rate_bp")).intValue(), ((Number) o.get("annual_cet_bp")).intValue(),
          ((Number) o.get("installment_cents")).longValue(), ((Number) o.get("total_cents")).longValue(),
          ((java.sql.Date) o.get("first_due_on")).toLocalDate());
      parceiro.contratar(proposta);
      UUID contrato = UUID.randomUUID();
      db.update("INSERT INTO credit_contract(id,offer_id,merchant_id,user_id,accepted_at,status,mode) VALUES (?,?,?,?,?,?,?)",
          contrato, id, actor.merchantId(), actor.userId(), java.sql.Timestamp.from(clock.instant()), "ATIVO", o.get("mode"));
      for (int n = 1; n <= proposta.parcelas(); n++)
        db.update("INSERT INTO credit_installment(id,contract_id,number,due_on,amount_cents,status) VALUES (?,?,?,?,?,?)",
            UUID.randomUUID(), contrato, n, java.sql.Date.valueOf(proposta.primeiroVencimento().plusMonths(n - 1L)),
            proposta.parcelaCents(), "A_VENCER");
    }
    UUID contratoId = (UUID) db.queryForObject("SELECT id FROM credit_contract WHERE offer_id=?", UUID.class, id);
    return contratos(actor).stream().filter(c -> contratoId.equals(c.get("id"))).findFirst().orElseThrow();
  }

  /** Para a projeção de caixa: crédito ativo recebido e parcelas que vencem até a data. */
  public record ImpactoCaixa(long creditoCents, long parcelasCents) {}

  public ImpactoCaixa impacto(Actor actor, LocalDate ate) {
    var r = db.queryForMap(
        "SELECT COALESCE((SELECT sum(o.amount_cents) FROM credit_contract c JOIN credit_offer o ON o.id=c.offer_id WHERE c.merchant_id=? AND c.status='ATIVO'),0) credito,"
            + " COALESCE((SELECT sum(i.amount_cents) FROM credit_installment i JOIN credit_contract c ON c.id=i.contract_id WHERE c.merchant_id=? AND c.status='ATIVO' AND i.status='A_VENCER' AND i.due_on<=?),0) parcelas",
        actor.merchantId(), actor.merchantId(), java.sql.Date.valueOf(ate));
    return new ImpactoCaixa(((Number) r.get("credito")).longValue(), ((Number) r.get("parcelas")).longValue());
  }
}
