package br.com.avanade.split.credito;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.finance.FinanceService;
import br.com.avanade.split.shared.ApiException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Capital de giro de ponta a ponta. Liga o problema central (a descapitalização
 * causada pelo imposto que sai na hora da venda) à solução: diagnóstico, ofertas
 * comparáveis de parceiros, crédito responsável, contratação, pagamento,
 * quitação antecipada, arrependimento e trilha de eventos.
 * Quem concede o crédito é sempre a instituição parceira; no MVP, simulada.
 */
@Service
public class CreditoService {
  static final String ESCOPO = "VENDAS_E_CAIXA_90_DIAS";
  /** O consentimento vale para os parceiros cadastrados na plataforma. */
  static final String PARCEIROS = "PARCEIROS_CADASTRADOS";
  static final int COMPROMETIMENTO_SAUDAVEL_BP = 2000;
  static final int COMPROMETIMENTO_ATENCAO_BP = 3000;
  /** Acima disso a contratação é recusada: a parcela tomaria mais da metade das entradas. */
  static final int COMPROMETIMENTO_MAXIMO_BP = 5000;
  static final int DIAS_ARREPENDIMENTO = 7;

  private final JdbcTemplate db;
  private final List<ParceiroCredito> parceiros;
  private final FinanceService finance;
  private final Clock clock;
  private final ObjectMapper json = new ObjectMapper();

  public CreditoService(JdbcTemplate db, List<ParceiroCredito> parceiros, FinanceService finance, Clock clock) {
    if (parceiros.isEmpty()) throw new IllegalStateException("Nenhum parceiro de crédito configurado.");
    this.db = db;
    this.parceiros = List.copyOf(parceiros);
    this.finance = finance;
    this.clock = clock;
  }

  // ---------------------------------------------------------------- utilidades

  LocalDate hoje(Actor actor) {
    return LocalDate.now(clock.withZone(actor.zone()));
  }

  static void exigirGerente(Actor actor) {
    actor.require("financeiro");
    if (!"GERENTE".equals(actor.role()))
      throw new ApiException(403, "FORBIDDEN", "Somente a pessoa gerente da loja pode autorizar ou contratar crédito.");
  }

  ParceiroCredito parceiro(String id) {
    return parceiros.stream().filter(p -> p.id().equals(id)).findFirst()
        .orElseThrow(() -> new ApiException(404, "NOT_FOUND", "Parceiro não encontrado."));
  }

  private String jsonDe(Object valor) {
    try {
      return json.writeValueAsString(valor);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  void evento(UUID merchant, UUID contrato, UUID usuario, String tipo, Map<String, ?> detalhe) {
    db.update("INSERT INTO credit_event(id,merchant_id,contract_id,user_id,type,detail,created_at) VALUES (?,?,?,?,?,?::jsonb,?)",
        UUID.randomUUID(), merchant, contrato, usuario, tipo, jsonDe(detalhe), java.sql.Timestamp.from(clock.instant()));
  }

  private static long num(Object v) {
    return v == null ? 0 : ((Number) v).longValue();
  }

  // ---------------------------------------------------------------- fatos e diagnóstico

  ParceiroCredito.FatosLoja fatos(Actor actor) {
    LocalDate hoje = hoje(actor);
    var r = db.queryForMap(
        "SELECT COALESCE(sum(amount_cents) FILTER (WHERE operation_id IS NOT NULL),0) entradas,"
            + " COALESCE(-sum(amount_cents) FILTER (WHERE expense_id IS NOT NULL),0) despesas,"
            + " count(*) FILTER (WHERE operation_id IS NOT NULL) vendas"
            + " FROM cash_entry WHERE merchant_id=? AND booked_on BETWEEN ? AND ?",
        actor.merchantId(), java.sql.Date.valueOf(hoje.minusDays(89)), java.sql.Date.valueOf(hoje));
    return new ParceiroCredito.FatosLoja(num(r.get("entradas")), num(r.get("despesas")), num(r.get("vendas")));
  }

  /** Diagnóstico da descapitalização: o que o split tirou do caixa e quanto falta para cobrir 30 dias. */
  public Map<String, Object> diagnostico(Actor actor, ParceiroCredito.FatosLoja f, long melhorLimite, int menorTaxaBp) {
    long imposto90 = num(db.queryForObject(
        "SELECT COALESCE(sum(tax_cents),0) FROM split_operation WHERE merchant_id=? AND status='CONCLUIDA' AND completed_at >= ?",
        Long.class, actor.merchantId(), java.sql.Timestamp.from(clock.instant().minus(90, ChronoUnit.DAYS))));
    LocalDate hoje = hoje(actor);
    long saldo = finance.cash(actor, new br.com.avanade.split.shared.Period(hoje, hoje)).closingCents();
    long entradaMensal = f.entradasLiquidas90dCents() / 3;
    long despesaMensal = f.despesas90dCents() / 3;
    long impostoMensal = imposto90 / 3;
    long disponivel = saldo + entradaMensal;
    long falta = Math.max(0, despesaMensal - disponivel);
    Integer coberturaDias = despesaMensal > 0 ? (int) Math.max(0, Math.min(9999, saldo * 30 / despesaMensal)) : null;
    String situacao = falta > 0 ? "DESCAPITALIZADO" : coberturaDias != null && coberturaDias < 15 ? "ATENCAO" : "SAUDAVEL";
    long recomendado = 0;
    Integer parcelasRecomendadas = null;
    if (falta > 0 && melhorLimite > 0) {
      recomendado = Math.min(melhorLimite, Math.max(ParceiroCreditoSimulado.MINIMO_CENTS, (falta + 9_999) / 10_000 * 10_000));
      for (int n = 1; n <= 12; n++) {
        long parcela = ParceiroCreditoSimulado.parcelaPrice(recomendado, menorTaxaBp, n);
        if (entradaMensal > 0 && parcela * 10_000 <= entradaMensal * (long) COMPROMETIMENTO_ATENCAO_BP) {
          parcelasRecomendadas = n;
          break;
        }
      }
    }
    var d = new LinkedHashMap<String, Object>();
    d.put("taxWithheld90dCents", imposto90);
    d.put("taxWithheldMonthlyCents", impostoMensal);
    d.put("currentBalanceCents", saldo);
    d.put("monthlyNetInflowCents", entradaMensal);
    d.put("monthlyExpensesCents", despesaMensal);
    d.put("available30dCents", disponivel);
    d.put("shortfall30dCents", falta);
    d.put("coverageDays", coberturaDias);
    d.put("status", situacao);
    d.put("recommendedAmountCents", recomendado);
    d.put("recommendedInstallments", parcelasRecomendadas);
    return d;
  }

  static String nivel(Integer comprometimentoBp) {
    if (comprometimentoBp == null) return "SEM_RENDA";
    if (comprometimentoBp <= COMPROMETIMENTO_SAUDAVEL_BP) return "SAUDAVEL";
    if (comprometimentoBp <= COMPROMETIMENTO_ATENCAO_BP) return "ATENCAO";
    if (comprometimentoBp <= COMPROMETIMENTO_MAXIMO_BP) return "ALTO";
    return "EXCESSIVO";
  }

  static Integer comprometimento(long parcela, long entradaMensal) {
    if (entradaMensal <= 0) return null;
    return (int) Math.min(1_000_000, (parcela * 10_000 + entradaMensal - 1) / entradaMensal);
  }

  // ---------------------------------------------------------------- consulta

  Map<String, Object> consentimentoAtivo(Actor actor) {
    var rows = db.queryForList(
        "SELECT granted_at, scopes FROM credit_consent WHERE merchant_id=? AND partner=? AND revoked_at IS NULL",
        actor.merchantId(), PARCEIROS);
    if (rows.isEmpty()) return null;
    return Map.of(
        "grantedAt", ((java.sql.Timestamp) rows.getFirst().get("granted_at")).toInstant(),
        "scopes", List.of(((String) rows.getFirst().get("scopes")).split(",")),
        "partners", parceiros.stream().map(ParceiroCredito::nome).toList());
  }

  public Map<String, Object> consultar(Actor actor) {
    actor.require("financeiro");
    var f = fatos(actor);
    var lista = new ArrayList<Map<String, Object>>();
    long melhorLimite = 0;
    int menorTaxa = Integer.MAX_VALUE;
    for (var p : parceiros) {
      var l = p.limite(f);
      var cot = l.valorCents() > 0 ? p.cotar(f, Math.max(ParceiroCreditoSimulado.MINIMO_CENTS, Math.min(l.valorCents(), 100_000)), 1, hoje(actor)) : null;
      var m = new LinkedHashMap<String, Object>();
      m.put("id", p.id());
      m.put("name", p.nome());
      m.put("mode", p.modo());
      m.put("limitCents", l.valorCents());
      if (l.motivo() != null) m.put("reason", l.motivo());
      if (cot != null) {
        m.put("monthlyRateBp", cot.taxaMensalBp());
        m.put("annualCetBp", cot.cetAnualBp());
        menorTaxa = Math.min(menorTaxa, cot.taxaMensalBp());
      }
      melhorLimite = Math.max(melhorLimite, l.valorCents());
      lista.add(m);
    }
    var r = new LinkedHashMap<String, Object>();
    r.put("partners", lista);
    r.put("facts", Map.of("netInflow90dCents", f.entradasLiquidas90dCents(), "expenses90dCents", f.despesas90dCents(), "sales90d", f.vendas90d()));
    r.put("diagnosis", diagnostico(actor, f, melhorLimite, menorTaxa == Integer.MAX_VALUE ? 0 : menorTaxa));
    r.put("consent", consentimentoAtivo(actor));
    r.put("contracts", contratos(actor, null));
    r.put("canContract", "GERENTE".equals(actor.role()));
    r.put("rules", Map.of("minAmountCents", ParceiroCreditoSimulado.MINIMO_CENTS, "maxInstallments", 12,
        "maxCommitmentBp", COMPROMETIMENTO_MAXIMO_BP, "withdrawalDays", DIAS_ARREPENDIMENTO, "offerValidityHours", 24));
    return r;
  }

  // ---------------------------------------------------------------- consentimento

  @Transactional
  public Map<String, Object> consentir(Actor actor) {
    exigirGerente(actor);
    if (consentimentoAtivo(actor) == null) {
      db.update("INSERT INTO credit_consent(id,merchant_id,user_id,partner,scopes,granted_at) VALUES (?,?,?,?,?,?)",
          UUID.randomUUID(), actor.merchantId(), actor.userId(), PARCEIROS, ESCOPO, java.sql.Timestamp.from(clock.instant()));
      evento(actor.merchantId(), null, actor.userId(), "CONSENTIMENTO_CONCEDIDO",
          Map.of("scope", ESCOPO, "partners", parceiros.stream().map(ParceiroCredito::id).toList()));
    }
    return consentimentoAtivo(actor);
  }

  @Transactional
  public void revogar(Actor actor) {
    exigirGerente(actor);
    int n = db.update("UPDATE credit_consent SET revoked_at=? WHERE merchant_id=? AND partner=? AND revoked_at IS NULL",
        java.sql.Timestamp.from(clock.instant()), actor.merchantId(), PARCEIROS);
    if (n > 0) evento(actor.merchantId(), null, actor.userId(), "CONSENTIMENTO_REVOGADO", Map.of("scope", ESCOPO));
  }

  // ---------------------------------------------------------------- ofertas

  private Map<String, Object> oferta(Map<String, Object> o) {
    var m = new LinkedHashMap<String, Object>();
    m.put("id", o.get("id"));
    m.put("partnerId", o.get("partner"));
    m.put("partnerName", o.get("partner_name"));
    m.put("product", o.get("product"));
    m.put("mode", o.get("mode"));
    m.put("amountCents", o.get("amount_cents"));
    m.put("installments", o.get("installments"));
    m.put("installmentCents", o.get("installment_cents"));
    m.put("totalCents", o.get("total_cents"));
    m.put("interestCents", num(o.get("total_cents")) - num(o.get("amount_cents")));
    m.put("monthlyRateBp", o.get("monthly_rate_bp"));
    m.put("annualCetBp", o.get("annual_cet_bp"));
    Integer comp = o.get("commitment_bp") == null ? null : ((Number) o.get("commitment_bp")).intValue();
    m.put("commitmentBp", comp);
    m.put("commitmentLevel", nivel(comp));
    m.put("canContract", comp != null && comp <= COMPROMETIMENTO_MAXIMO_BP);
    m.put("firstDueOn", ((java.sql.Date) o.get("first_due_on")).toLocalDate());
    m.put("expiresAt", ((java.sql.Timestamp) o.get("expires_at")).toInstant());
    return m;
  }

  @Transactional
  public Map<String, Object> simular(Actor actor, long valorCents, int parcelas) {
    actor.require("financeiro");
    if (consentimentoAtivo(actor) == null)
      throw new ApiException(409, "CONSENT_REQUIRED", "Autorize o compartilhamento dos dados com os parceiros antes de simular.");
    if (parcelas < 1 || parcelas > 12) throw new ApiException(422, "INVALID_INSTALLMENTS", "Escolha de 1 a 12 parcelas.");
    var f = fatos(actor);
    long entradaMensal = f.entradasLiquidas90dCents() / 3;
    Instant agora = clock.instant();
    var ids = new ArrayList<UUID>();
    var recusas = new ArrayList<String>();
    for (var p : parceiros) {
      var limite = p.limite(f);
      if (valorCents < ParceiroCreditoSimulado.MINIMO_CENTS || valorCents > limite.valorCents()) {
        recusas.add(p.nome());
        continue;
      }
      var prop = p.cotar(f, valorCents, parcelas, hoje(actor));
      UUID id = UUID.randomUUID();
      db.update(
          "INSERT INTO credit_offer(id,merchant_id,partner,partner_name,product,amount_cents,installments,monthly_rate_bp,annual_cet_bp,installment_cents,total_cents,first_due_on,facts,mode,commitment_bp,created_at,expires_at)"
              + " VALUES (?,?,?,?,'CAPITAL_GIRO',?,?,?,?,?,?,?,?::jsonb,?,?,?,?)",
          id, actor.merchantId(), p.id(), p.nome(), prop.valorCents(), prop.parcelas(), prop.taxaMensalBp(), prop.cetAnualBp(),
          prop.parcelaCents(), prop.totalCents(), java.sql.Date.valueOf(prop.primeiroVencimento()),
          jsonDe(Map.of("netInflow90dCents", f.entradasLiquidas90dCents(), "expenses90dCents", f.despesas90dCents(), "sales90d", f.vendas90d())),
          p.modo(), comprometimento(prop.parcelaCents(), entradaMensal), java.sql.Timestamp.from(agora), java.sql.Timestamp.from(agora.plusSeconds(24 * 3600)));
      ids.add(id);
    }
    if (ids.isEmpty())
      throw new ApiException(422, "AMOUNT_OUT_OF_LIMIT", "Nenhum parceiro oferece esse valor agora. Escolha um valor entre R$ 500,00 e o maior limite disponível.");
    var ofertas = new ArrayList<Map<String, Object>>();
    for (UUID id : ids) ofertas.add(oferta(db.queryForMap("SELECT * FROM credit_offer WHERE id=?", id)));
    ofertas.sort(Comparator.comparingLong(o -> num(o.get("annualCetBp"))));
    evento(actor.merchantId(), null, actor.userId(), "PROPOSTAS_GERADAS",
        Map.of("amountCents", valorCents, "installments", parcelas, "offers", ids.size(), "declinedBy", recusas));
    return Map.of("offers", ofertas, "declinedBy", recusas);
  }

  // ---------------------------------------------------------------- contratos

  List<Map<String, Object>> contratos(Actor actor, UUID somente) {
    var lista = new ArrayList<Map<String, Object>>();
    LocalDate hoje = hoje(actor);
    for (var c : db.queryForList(
        "SELECT c.id, c.accepted_at, c.status, c.mode, c.settled_at, c.cancelled_at, c.payoff_cents, o.partner, o.partner_name,"
            + " o.amount_cents, o.installments, o.installment_cents, o.total_cents, o.monthly_rate_bp, o.annual_cet_bp, o.commitment_bp"
            + " FROM credit_contract c JOIN credit_offer o ON o.id=c.offer_id WHERE c.merchant_id=? AND (?::uuid IS NULL OR c.id=?::uuid)"
            + " ORDER BY c.accepted_at DESC LIMIT 20",
        actor.merchantId(), somente, somente)) {
      var parcelas = db.queryForList(
          "SELECT number, due_on, amount_cents, status, paid_at FROM credit_installment WHERE contract_id=? ORDER BY number", c.get("id"));
      long pago = 0, restante = 0;
      Map<String, Object> proxima = null;
      var cronograma = new ArrayList<Map<String, Object>>();
      for (var p : parcelas) {
        var x = new LinkedHashMap<String, Object>();
        x.put("number", p.get("number"));
        x.put("dueOn", ((java.sql.Date) p.get("due_on")).toLocalDate());
        x.put("amountCents", p.get("amount_cents"));
        x.put("status", p.get("status"));
        x.put("paidAt", p.get("paid_at") == null ? null : ((java.sql.Timestamp) p.get("paid_at")).toInstant());
        boolean paga = "PAGA".equals(p.get("status"));
        if (paga) pago += num(p.get("amount_cents"));
        else {
          restante += num(p.get("amount_cents"));
          if (proxima == null && "ATIVO".equals(c.get("status"))) proxima = x;
        }
        cronograma.add(x);
      }
      Instant aceito = ((java.sql.Timestamp) c.get("accepted_at")).toInstant();
      Instant limiteArrependimento = aceito.plus(DIAS_ARREPENDIMENTO, ChronoUnit.DAYS);
      var m = new LinkedHashMap<String, Object>();
      m.put("id", c.get("id"));
      m.put("partnerId", c.get("partner"));
      m.put("partnerName", c.get("partner_name"));
      m.put("acceptedAt", aceito);
      m.put("status", c.get("status"));
      m.put("mode", c.get("mode"));
      m.put("amountCents", c.get("amount_cents"));
      m.put("installments", c.get("installments"));
      m.put("installmentCents", c.get("installment_cents"));
      m.put("totalCents", c.get("total_cents"));
      m.put("monthlyRateBp", c.get("monthly_rate_bp"));
      m.put("annualCetBp", c.get("annual_cet_bp"));
      m.put("commitmentBp", c.get("commitment_bp"));
      m.put("paidCents", pago);
      m.put("remainingCents", "ATIVO".equals(c.get("status")) ? restante : 0);
      m.put("nextInstallment", proxima);
      m.put("overdue", proxima != null && ((LocalDate) proxima.get("dueOn")).isBefore(hoje));
      m.put("withdrawalUntil", limiteArrependimento);
      m.put("canWithdraw", "ATIVO".equals(c.get("status")) && pago == 0 && clock.instant().isBefore(limiteArrependimento));
      m.put("payoffCents", c.get("payoff_cents"));
      m.put("settledAt", c.get("settled_at") == null ? null : ((java.sql.Timestamp) c.get("settled_at")).toInstant());
      m.put("cancelledAt", c.get("cancelled_at") == null ? null : ((java.sql.Timestamp) c.get("cancelled_at")).toInstant());
      m.put("schedule", cronograma);
      lista.add(m);
    }
    return lista;
  }

  private Map<String, Object> contrato(Actor actor, UUID id) {
    return contratos(actor, id).stream().findFirst().orElseThrow(ApiException::missing);
  }

  private Map<String, Object> contratoParaAlterar(Actor actor, UUID id) {
    var rows = db.queryForList("SELECT * FROM credit_contract WHERE id=? AND merchant_id=? FOR UPDATE", id, actor.merchantId());
    if (rows.isEmpty()) throw ApiException.missing();
    return rows.getFirst();
  }

  @Transactional
  public Map<String, Object> contratar(Actor actor, UUID ofertaId) {
    exigirGerente(actor);
    var ofertas = db.queryForList("SELECT * FROM credit_offer WHERE id=? AND merchant_id=? FOR UPDATE", ofertaId, actor.merchantId());
    if (ofertas.isEmpty()) throw ApiException.missing();
    var o = ofertas.getFirst();
    var existente = db.queryForList("SELECT id FROM credit_contract WHERE offer_id=?", ofertaId);
    if (!existente.isEmpty()) return contrato(actor, (UUID) existente.getFirst().get("id"));
    if (!((java.sql.Timestamp) o.get("expires_at")).toInstant().isAfter(clock.instant()))
      throw new ApiException(409, "OFFER_EXPIRED", "A proposta venceu. Faça uma nova simulação.");
    if (consentimentoAtivo(actor) == null)
      throw new ApiException(409, "CONSENT_REQUIRED", "O compartilhamento de dados com os parceiros foi revogado. Autorize de novo para contratar.");
    Integer comp = o.get("commitment_bp") == null ? null : ((Number) o.get("commitment_bp")).intValue();
    if (comp == null || comp > COMPROMETIMENTO_MAXIMO_BP)
      throw new ApiException(422, "AFFORDABILITY_LIMIT", "A parcela comprometeria mais da metade das entradas líquidas mensais da loja. Escolha um valor menor ou mais parcelas.");
    var p = parceiro((String) o.get("partner"));
    var proposta = new ParceiroCredito.Proposta(num(o.get("amount_cents")), ((Number) o.get("installments")).intValue(),
        ((Number) o.get("monthly_rate_bp")).intValue(), ((Number) o.get("annual_cet_bp")).intValue(),
        num(o.get("installment_cents")), num(o.get("total_cents")), ((java.sql.Date) o.get("first_due_on")).toLocalDate());
    p.contratar(proposta);
    UUID id = UUID.randomUUID();
    db.update("INSERT INTO credit_contract(id,offer_id,merchant_id,user_id,accepted_at,status,mode) VALUES (?,?,?,?,?,'ATIVO',?)",
        id, ofertaId, actor.merchantId(), actor.userId(), java.sql.Timestamp.from(clock.instant()), o.get("mode"));
    for (int n = 1; n <= proposta.parcelas(); n++)
      db.update("INSERT INTO credit_installment(id,contract_id,number,due_on,amount_cents,status) VALUES (?,?,?,?,?,'A_VENCER')",
          UUID.randomUUID(), id, n, java.sql.Date.valueOf(proposta.primeiroVencimento().plusMonths(n - 1L)), proposta.parcelaCents());
    evento(actor.merchantId(), id, actor.userId(), "CONTRATADO", Map.of("partner", p.id(), "amountCents", proposta.valorCents(),
        "installments", proposta.parcelas(), "installmentCents", proposta.parcelaCents(), "annualCetBp", proposta.cetAnualBp()));
    return contrato(actor, id);
  }

  /** Registra o pagamento de uma parcela (no simulado; com parceiro real, chega pelo webhook). */
  @Transactional
  public Map<String, Object> pagarParcela(Actor actor, UUID contratoId, int numero) {
    exigirGerente(actor);
    var c = contratoParaAlterar(actor, contratoId);
    if (!"SIMULADO".equals(c.get("mode")))
      throw new ApiException(409, "PAID_BY_PARTNER", "Com parceiro real, o pagamento é confirmado pela instituição.");
    marcarPaga(c, numero, actor.userId());
    return contrato(actor, contratoId);
  }

  void marcarPaga(Map<String, Object> c, int numero, UUID usuario) {
    if (!"ATIVO".equals(c.get("status"))) throw new ApiException(409, "CONTRACT_NOT_ACTIVE", "Este contrato não está ativo.");
    var proxima = db.queryForList("SELECT number FROM credit_installment WHERE contract_id=? AND status='A_VENCER' ORDER BY number LIMIT 1", c.get("id"));
    if (proxima.isEmpty()) throw new ApiException(409, "NOTHING_DUE", "Não há parcelas a pagar.");
    int devida = ((Number) proxima.getFirst().get("number")).intValue();
    if (numero != devida) throw new ApiException(409, "OUT_OF_ORDER", "Pague as parcelas em ordem. A próxima é a parcela " + devida + ".");
    db.update("UPDATE credit_installment SET status='PAGA', paid_at=? WHERE contract_id=? AND number=?",
        java.sql.Timestamp.from(clock.instant()), c.get("id"), numero);
    evento((UUID) c.get("merchant_id"), (UUID) c.get("id"), usuario, "PARCELA_PAGA", Map.of("number", numero));
    var restantes = db.queryForObject("SELECT count(*) FROM credit_installment WHERE contract_id=? AND status='A_VENCER'", Long.class, c.get("id"));
    if (restantes != null && restantes == 0) {
      db.update("UPDATE credit_contract SET status='QUITADO', settled_at=? WHERE id=?", java.sql.Timestamp.from(clock.instant()), c.get("id"));
      evento((UUID) c.get("merchant_id"), (UUID) c.get("id"), usuario, "QUITADO", Map.of("reason", "ULTIMA_PARCELA"));
    }
  }

  /** Prazo em meses (inteiros + dias restantes / 30) de hoje até o vencimento; zero se já venceu. */
  static double mesesAte(LocalDate hoje, LocalDate vencimento) {
    if (!vencimento.isAfter(hoje)) return 0;
    long meses = ChronoUnit.MONTHS.between(hoje, vencimento);
    long dias = ChronoUnit.DAYS.between(hoje.plusMonths(meses), vencimento);
    return meses + dias / 30.0;
  }

  /** Valor para quitar hoje: parcelas futuras trazidas a valor presente pela taxa do contrato. */
  public Map<String, Object> cotarQuitacao(Actor actor, UUID contratoId) {
    actor.require("financeiro");
    var c = contrato(actor, contratoId);
    if (!"ATIVO".equals(c.get("status"))) throw new ApiException(409, "CONTRACT_NOT_ACTIVE", "Este contrato não está ativo.");
    return quitacao(actor, contratoId, ((Number) c.get("monthlyRateBp")).intValue());
  }

  private Map<String, Object> quitacao(Actor actor, UUID contratoId, int taxaBp) {
    LocalDate hoje = hoje(actor);
    long restante = 0;
    double presente = 0;
    for (var p : db.queryForList("SELECT due_on, amount_cents FROM credit_installment WHERE contract_id=? AND status='A_VENCER'", contratoId)) {
      long valor = num(p.get("amount_cents"));
      restante += valor;
      presente += valor / Math.pow(1 + taxaBp / 10_000.0, mesesAte(hoje, ((java.sql.Date) p.get("due_on")).toLocalDate()));
    }
    long quitar = Math.min(restante, (long) Math.ceil(presente - 1e-6));
    return Map.of("asOf", hoje, "remainingCents", restante, "payoffCents", quitar, "discountCents", restante - quitar);
  }

  /** Quitação antecipada com redução proporcional dos juros (direito do consumidor de crédito). */
  @Transactional
  public Map<String, Object> quitar(Actor actor, UUID contratoId) {
    exigirGerente(actor);
    var c = contratoParaAlterar(actor, contratoId);
    if (!"ATIVO".equals(c.get("status"))) throw new ApiException(409, "CONTRACT_NOT_ACTIVE", "Este contrato não está ativo.");
    int taxa = db.queryForObject("SELECT o.monthly_rate_bp FROM credit_offer o JOIN credit_contract c ON c.offer_id=o.id WHERE c.id=?", Integer.class, contratoId);
    var q = quitacao(actor, contratoId, taxa);
    Instant agora = clock.instant();
    db.update("UPDATE credit_installment SET status='PAGA', paid_at=? WHERE contract_id=? AND status='A_VENCER'", java.sql.Timestamp.from(agora), contratoId);
    db.update("UPDATE credit_contract SET status='QUITADO', settled_at=?, payoff_cents=? WHERE id=?", java.sql.Timestamp.from(agora), q.get("payoffCents"), contratoId);
    evento(actor.merchantId(), contratoId, actor.userId(), "QUITADO",
        Map.of("reason", "ANTECIPADA", "payoffCents", q.get("payoffCents"), "discountCents", q.get("discountCents")));
    return contrato(actor, contratoId);
  }

  /** Desistência em até 7 dias, sem parcelas pagas: devolve só o valor recebido, sem juros. */
  @Transactional
  public Map<String, Object> desistir(Actor actor, UUID contratoId) {
    exigirGerente(actor);
    var c = contratoParaAlterar(actor, contratoId);
    if (!"ATIVO".equals(c.get("status"))) throw new ApiException(409, "CONTRACT_NOT_ACTIVE", "Este contrato não está ativo.");
    Instant aceito = ((java.sql.Timestamp) c.get("accepted_at")).toInstant();
    if (!clock.instant().isBefore(aceito.plus(DIAS_ARREPENDIMENTO, ChronoUnit.DAYS)))
      throw new ApiException(409, "WITHDRAWAL_EXPIRED", "O prazo de 7 dias para desistir terminou. Você pode quitar antecipadamente.");
    Long pagas = db.queryForObject("SELECT count(*) FROM credit_installment WHERE contract_id=? AND status='PAGA'", Long.class, contratoId);
    if (pagas != null && pagas > 0) throw new ApiException(409, "WITHDRAWAL_NOT_ALLOWED", "Já há parcela paga. Use a quitação antecipada.");
    long principal = num(db.queryForObject("SELECT o.amount_cents FROM credit_offer o JOIN credit_contract c ON c.offer_id=o.id WHERE c.id=?", Long.class, contratoId));
    db.update("UPDATE credit_contract SET status='CANCELADO', cancelled_at=?, payoff_cents=? WHERE id=?",
        java.sql.Timestamp.from(clock.instant()), principal, contratoId);
    evento(actor.merchantId(), contratoId, actor.userId(), "CANCELADO_ARREPENDIMENTO", Map.of("returnedCents", principal));
    return contrato(actor, contratoId);
  }

  public List<Map<String, Object>> eventos(Actor actor) {
    actor.require("financeiro");
    return db.queryForList("SELECT type, contract_id, detail::text detail, created_at FROM credit_event WHERE merchant_id=? ORDER BY created_at DESC LIMIT 50",
        actor.merchantId()).stream().map(e -> {
          var m = new LinkedHashMap<String, Object>();
          m.put("type", e.get("type"));
          m.put("contractId", e.get("contract_id"));
          try {
            m.put("detail", json.readValue((String) e.get("detail"), Map.class));
          } catch (JsonProcessingException ex) {
            m.put("detail", Map.of());
          }
          m.put("at", ((java.sql.Timestamp) e.get("created_at")).toInstant());
          return (Map<String, Object>) m;
        }).toList();
  }

  // ---------------------------------------------------------------- projeção

  /** Impacto no caixa projetado: crédito líquido já recebido e parcelas que vencem até a data. */
  public record ImpactoCaixa(long creditoCents, long parcelasCents) {}

  public ImpactoCaixa impacto(Actor actor, LocalDate ate) {
    var r = db.queryForMap(
        "SELECT COALESCE((SELECT sum(o.amount_cents) FROM credit_contract c JOIN credit_offer o ON o.id=c.offer_id WHERE c.merchant_id=? AND c.status IN ('ATIVO','QUITADO')),0) recebido,"
            + " COALESCE((SELECT sum(i.amount_cents) FROM credit_installment i JOIN credit_contract c ON c.id=i.contract_id WHERE c.merchant_id=? AND c.status='ATIVO' AND i.status='PAGA'),0) pagas_ativos,"
            + " COALESCE((SELECT sum(i.amount_cents) FROM credit_installment i JOIN credit_contract c ON c.id=i.contract_id WHERE c.merchant_id=? AND c.status='QUITADO' AND c.payoff_cents IS NULL),0) pagas_quitados,"
            + " COALESCE((SELECT sum(i.amount_cents) FROM credit_installment i JOIN credit_contract c ON c.id=i.contract_id WHERE c.merchant_id=? AND c.status='QUITADO' AND c.payoff_cents IS NOT NULL AND i.paid_at < c.settled_at),0) pagas_antes_quitar,"
            + " COALESCE((SELECT sum(c.payoff_cents) FROM credit_contract c WHERE c.merchant_id=? AND c.status='QUITADO' AND c.payoff_cents IS NOT NULL),0) quitacoes,"
            + " COALESCE((SELECT sum(i.amount_cents) FROM credit_installment i JOIN credit_contract c ON c.id=i.contract_id WHERE c.merchant_id=? AND c.status='ATIVO' AND i.status='A_VENCER' AND i.due_on<=?),0) futuras",
        actor.merchantId(), actor.merchantId(), actor.merchantId(), actor.merchantId(), actor.merchantId(), actor.merchantId(), java.sql.Date.valueOf(ate));
    long liquido = num(r.get("recebido")) - num(r.get("pagas_ativos")) - num(r.get("pagas_quitados")) - num(r.get("pagas_antes_quitar")) - num(r.get("quitacoes"));
    return new ImpactoCaixa(liquido, num(r.get("futuras")));
  }
}
