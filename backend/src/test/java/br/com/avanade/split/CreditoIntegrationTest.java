package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Capital de giro, ciclo completo, com os parceiros simulados (fintech 2,49% a.m. e
 * limite de 50%; banco 1,89% a.m. e limite de 30%). Roda com o papel de banco da
 * produção (split_app), então também prova as permissões das migrations.
 */
@SpringBootTest
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class CreditoIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  final ObjectMapper json = new ObjectMapper();
  final String ip = "10.99." + (int) (Math.random() * 200 + 1) + "." + (int) (Math.random() * 200 + 1);
  /** Conexão de dono do banco, só para simular a passagem do tempo nos testes. */
  final JdbcTemplate dono = new JdbcTemplate(PG.getPostgresDatabase());

  MockHttpServletRequestBuilder com(MockHttpServletRequestBuilder r, String token) {
    return r.with(x -> { x.setRemoteAddr(ip); return x; }).header("Authorization", "Bearer " + token).contentType("application/json");
  }

  String novaLoja() throws Exception {
    String email = "credito-" + UUID.randomUUID() + "@example.invalid";
    mvc.perform(post("/api/v1/auth/register").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"name\":\"P\",\"merchantName\":\"Loja\",\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}")).andExpect(status().isCreated());
    return ler(mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}"))).get("accessToken").asText();
  }

  void vender(String token, long cents) throws Exception {
    mvc.perform(com(post("/api/v1/sales"), token).header("Idempotency-Key", UUID.randomUUID().toString())
        .content("{\"amountCents\":" + cents + ",\"currency\":\"BRL\",\"paymentMethod\":\"PIX\",\"taxCategory\":\"GENERAL\"}"))
        .andExpect(status().isCreated());
  }

  void despesa(String token, long cents) throws Exception {
    mvc.perform(com(post("/api/v1/expenses"), token).header("Idempotency-Key", UUID.randomUUID().toString())
        .content("{\"description\":\"Aluguel\",\"amountCents\":" + cents + ",\"categoryId\":\"OPERATING\",\"paidOn\":\"" + LocalDate.now(ZoneId.of("America/Fortaleza")) + "\"}"))
        .andExpect(status().is2xxSuccessful());
  }

  JsonNode ler(ResultActions r) throws Exception {
    return json.readTree(r.andReturn().getResponse().getContentAsString());
  }

  /** Loja com R$ 6.000,00 em vendas (líquido ~R$ 5.280,00) e consentimento dado. */
  String lojaComVendasEConsentimento() throws Exception {
    String t = novaLoja();
    vender(t, 300_000);
    vender(t, 300_000);
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated());
    return t;
  }

  JsonNode simular(String t, long valor, int parcelas) throws Exception {
    return ler(mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":" + valor + ",\"installments\":" + parcelas + "}")).andExpect(status().isCreated()));
  }

  JsonNode contratarMelhor(String t, long valor, int parcelas) throws Exception {
    String id = simular(t, valor, parcelas).at("/offers/0/id").asText();
    return ler(mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isOk()));
  }

  @Test
  void lojaSemVendasNaoRecebeLimiteEDiagnosticoAponta() throws Exception {
    String t = novaLoja();
    var c = ler(mvc.perform(com(get("/api/v1/credit"), t)).andExpect(status().isOk()));
    assertThat(c.get("partners")).hasSize(2);
    for (JsonNode p : c.get("partners")) {
      assertThat(p.get("limitCents").asLong()).isZero();
      assertThat(p.get("reason").asText()).contains("Ainda não há vendas suficientes");
      assertThat(p.get("mode").asText()).isEqualTo("SIMULADO");
    }
    assertThat(c.at("/diagnosis/recommendedAmountCents").asLong()).isZero();
    assertThat(c.get("consent").isNull()).isTrue();
    assertThat(c.at("/rules/maxCommitmentBp").asInt()).isEqualTo(5000);
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated());
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":50000,\"installments\":3}"))
        .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("AMOUNT_OUT_OF_LIMIT"));
  }

  @Test
  void diagnosticoMostraImpostoRetidoFaltaDeCaixaERecomendacao() throws Exception {
    String t = novaLoja();
    vender(t, 300_000);
    vender(t, 300_000);
    despesa(t, 2_000_000); // R$ 20.000,00 de despesas: caixa negativo
    var d = ler(mvc.perform(com(get("/api/v1/credit"), t))).get("diagnosis");
    assertThat(d.get("taxWithheld90dCents").asLong()).isEqualTo(60_000); // 10% de R$ 6.000,00
    assertThat(d.get("taxWithheldMonthlyCents").asLong()).isEqualTo(20_000);
    long saldo = d.get("currentBalanceCents").asLong();
    long entrada = d.get("monthlyNetInflowCents").asLong();
    long despesaMes = d.get("monthlyExpensesCents").asLong();
    assertThat(d.get("shortfall30dCents").asLong()).isEqualTo(Math.max(0, despesaMes - (saldo + entrada)));
    assertThat(d.get("status").asText()).isEqualTo("DESCAPITALIZADO");
    long recomendado = d.get("recommendedAmountCents").asLong();
    assertThat(recomendado).isPositive().isLessThanOrEqualTo(264_000);
  }

  @Test
  void ofertasDeDoisParceirosOrdenadasPeloCet() throws Exception {
    String t = novaLoja();
    vender(t, 300_000);
    vender(t, 300_000);
    var c = ler(mvc.perform(com(get("/api/v1/credit"), t)));
    long entradas = c.at("/facts/netInflow90dCents").asLong();
    assertThat(c.at("/partners/0/limitCents").asLong()).isEqualTo(Math.min(5_000_000, entradas * 50 / 100 / 10_000 * 10_000));
    assertThat(c.at("/partners/1/limitCents").asLong()).isEqualTo(Math.min(5_000_000, entradas * 30 / 100 / 10_000 * 10_000));
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":100000,\"installments\":6}"))
        .andExpect(status().isConflict()).andExpect(jsonPath("code").value("CONSENT_REQUIRED"));
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated()).andExpect(jsonPath("scopes[0]").value("VENDAS_E_CAIXA_90_DIAS"));
    var r = simular(t, 100_000, 6);
    assertThat(r.get("offers")).hasSize(2);
    var melhor = r.at("/offers/0");
    assertThat(melhor.get("partnerId").asText()).isEqualTo("banco-demo");
    assertThat(melhor.get("annualCetBp").asInt()).isLessThan(r.at("/offers/1/annualCetBp").asInt());
    // Fintech: R$ 1.000,00 a 2,49% a.m. em 6x = R$ 181,49; banco: 1,89% a.m. = R$ 177,87.
    assertThat(r.at("/offers/1/installmentCents").asLong()).isEqualTo(18_149);
    assertThat(melhor.get("installmentCents").asLong()).isEqualTo(17_787);
    assertThat(melhor.get("annualCetBp").asInt()).isEqualTo(2519);
    assertThat(melhor.get("interestCents").asLong()).isEqualTo(17_787L * 6 - 100_000);
    assertThat(melhor.get("commitmentLevel").asText()).isEqualTo("SAUDAVEL");
    // Valor acima do limite do banco e abaixo do da fintech: só a fintech oferece.
    long limiteFintech = c.at("/partners/0/limitCents").asLong();
    var soFintech = simular(t, limiteFintech, 12);
    assertThat(soFintech.get("offers")).hasSize(1);
    assertThat(soFintech.at("/declinedBy/0").asText()).isEqualTo("Banco demonstrativo");
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":100000,\"installments\":13}")).andExpect(status().is4xxClientError());
  }

  @Test
  void contratacaoIdempotenteEProjecaoComCredito() throws Exception {
    String t = lojaComVendasEConsentimento();
    var r = simular(t, 100_000, 6);
    String id = r.at("/offers/0/id").asText();
    var contrato = ler(mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isOk()));
    assertThat(contrato.get("schedule")).hasSize(6);
    assertThat(contrato.get("status").asText()).isEqualTo("ATIVO");
    assertThat(contrato.get("canWithdraw").asBoolean()).isTrue();
    assertThat(contrato.at("/nextInstallment/number").asInt()).isEqualTo(1);
    var repetido = ler(mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isOk()));
    assertThat(repetido.get("id").asText()).isEqualTo(contrato.get("id").asText());
    assertThat(db.queryForObject("SELECT count(*) FROM credit_contract WHERE offer_id=?::uuid", Long.class, id)).isEqualTo(1);
    String ate = LocalDate.now(ZoneId.of("America/Fortaleza")).plusDays(40).toString();
    var proj = ler(mvc.perform(com(post("/api/v1/planning/projection"), t).content("{\"until\":\"" + ate + "\",\"incomeCents\":0,\"expenseCents\":0}")).andExpect(status().isOk()));
    long parcela = contrato.get("installmentCents").asLong();
    assertThat(proj.get("creditCents").asLong()).isEqualTo(100_000);
    assertThat(proj.get("installmentsDueCents").asLong()).isEqualTo(parcela);
    assertThat(proj.get("projectedCents").asLong()).isEqualTo(proj.get("openingCents").asLong() + 100_000 - parcela);
  }

  @Test
  void pagamentoEmOrdemQuitacaoAutomaticaETrilhaDeEventos() throws Exception {
    String t = lojaComVendasEConsentimento();
    var c = contratarMelhor(t, 60_000, 2);
    String id = c.get("id").asText();
    mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/installments/2/pay"), t))
        .andExpect(status().isConflict()).andExpect(jsonPath("code").value("OUT_OF_ORDER"));
    var depois1 = ler(mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/installments/1/pay"), t)).andExpect(status().isOk()));
    assertThat(depois1.get("paidCents").asLong()).isEqualTo(c.get("installmentCents").asLong());
    assertThat(depois1.get("canWithdraw").asBoolean()).isFalse();
    var depois2 = ler(mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/installments/2/pay"), t)).andExpect(status().isOk()));
    assertThat(depois2.get("status").asText()).isEqualTo("QUITADO");
    assertThat(depois2.get("remainingCents").asLong()).isZero();
    mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/installments/2/pay"), t)).andExpect(status().isConflict());
    var eventos = ler(mvc.perform(com(get("/api/v1/credit/events"), t)).andExpect(status().isOk()));
    var tipos = new java.util.ArrayList<String>();
    eventos.forEach(e -> tipos.add(e.get("type").asText()));
    assertThat(tipos).contains("CONSENTIMENTO_CONCEDIDO", "PROPOSTAS_GERADAS", "CONTRATADO", "PARCELA_PAGA", "QUITADO");
    // A trilha não pode ser alterada nem pelo dono do banco.
    assertThatThrownBy(() -> dono.update("UPDATE credit_event SET type='X'")).hasMessageContaining("immutable");
    // Projeção depois de quitar: recebeu R$ 600,00 e pagou as duas parcelas.
    String ate = LocalDate.now(ZoneId.of("America/Fortaleza")).plusDays(10).toString();
    var proj = ler(mvc.perform(com(post("/api/v1/planning/projection"), t).content("{\"until\":\"" + ate + "\",\"incomeCents\":0,\"expenseCents\":0}")));
    assertThat(proj.get("creditCents").asLong()).isEqualTo(60_000 - 2 * c.get("installmentCents").asLong());
    assertThat(proj.get("installmentsDueCents").asLong()).isZero();
  }

  @Test
  void quitacaoAntecipadaComDescontoDosJuros() throws Exception {
    String t = lojaComVendasEConsentimento();
    var c = contratarMelhor(t, 100_000, 6);
    String id = c.get("id").asText();
    var cotacao = ler(mvc.perform(com(get("/api/v1/credit/contracts/" + id + "/payoff"), t)).andExpect(status().isOk()));
    long restante = cotacao.get("remainingCents").asLong();
    long quitar = cotacao.get("payoffCents").asLong();
    assertThat(restante).isEqualTo(c.get("totalCents").asLong());
    assertThat(quitar).isLessThan(restante).isGreaterThanOrEqualTo(100_000);
    assertThat(cotacao.get("discountCents").asLong()).isEqualTo(restante - quitar);
    var quitado = ler(mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/payoff"), t)).andExpect(status().isOk()));
    assertThat(quitado.get("status").asText()).isEqualTo("QUITADO");
    assertThat(quitado.get("payoffCents").asLong()).isEqualTo(quitar);
    mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/payoff"), t)).andExpect(status().isConflict());
    String ate = LocalDate.now(ZoneId.of("America/Fortaleza")).plusDays(60).toString();
    var proj = ler(mvc.perform(com(post("/api/v1/planning/projection"), t).content("{\"until\":\"" + ate + "\",\"incomeCents\":0,\"expenseCents\":0}")));
    assertThat(proj.get("creditCents").asLong()).isEqualTo(100_000 - quitar);
    assertThat(proj.get("installmentsDueCents").asLong()).isZero();
  }

  @Test
  void arrependimentoEmSeteDiasDevolveSoOPrincipal() throws Exception {
    String t = lojaComVendasEConsentimento();
    var c = contratarMelhor(t, 60_000, 3);
    String id = c.get("id").asText();
    var cancelado = ler(mvc.perform(com(post("/api/v1/credit/contracts/" + id + "/cancel"), t)).andExpect(status().isOk()));
    assertThat(cancelado.get("status").asText()).isEqualTo("CANCELADO");
    assertThat(cancelado.get("payoffCents").asLong()).isEqualTo(60_000);
    String ate = LocalDate.now(ZoneId.of("America/Fortaleza")).plusDays(100).toString();
    var proj = ler(mvc.perform(com(post("/api/v1/planning/projection"), t).content("{\"until\":\"" + ate + "\",\"incomeCents\":0,\"expenseCents\":0}")));
    assertThat(proj.get("creditCents").asLong()).isZero();
    assertThat(proj.get("installmentsDueCents").asLong()).isZero();
    // Depois de 7 dias, não dá mais para desistir.
    var c2 = contratarMelhor(t, 60_000, 3);
    dono.update("UPDATE credit_contract SET accepted_at = accepted_at - interval '8 days' WHERE id=?::uuid", c2.get("id").asText());
    mvc.perform(com(post("/api/v1/credit/contracts/" + c2.get("id").asText() + "/cancel"), t))
        .andExpect(status().isConflict()).andExpect(jsonPath("code").value("WITHDRAWAL_EXPIRED"));
    // Com parcela paga, também não (usa a quitação).
    var c3 = contratarMelhor(t, 60_000, 3);
    mvc.perform(com(post("/api/v1/credit/contracts/" + c3.get("id").asText() + "/installments/1/pay"), t)).andExpect(status().isOk());
    mvc.perform(com(post("/api/v1/credit/contracts/" + c3.get("id").asText() + "/cancel"), t))
        .andExpect(status().isConflict()).andExpect(jsonPath("code").value("WITHDRAWAL_NOT_ALLOWED"));
  }

  @Test
  void creditoResponsavelRecusaParcelaQueComprometeMaisDaMetade() throws Exception {
    String t = lojaComVendasEConsentimento();
    // Entradas mensais ~R$ 1.760,00; R$ 2.600,00 em 1x passa de 100% das entradas do mês.
    var r = simular(t, 260_000, 1);
    var oferta = r.at("/offers/0");
    assertThat(oferta.get("commitmentLevel").asText()).isEqualTo("EXCESSIVO");
    assertThat(oferta.get("canContract").asBoolean()).isFalse();
    mvc.perform(com(post("/api/v1/credit/offers/" + oferta.get("id").asText() + "/accept"), t))
        .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("AFFORDABILITY_LIMIT"));
    // Em 12x a parcela cabe.
    assertThat(simular(t, 260_000, 12).at("/offers/0/canContract").asBoolean()).isTrue();
  }

  @Test
  void permissoesConsentimentoRevogadoPropostaVencidaEOutraLoja() throws Exception {
    String t = lojaComVendasEConsentimento();
    String id = simular(t, 60_000, 1).at("/offers/0/id").asText();
    String outra = novaLoja();
    mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), outra)).andExpect(status().isNotFound());
    // Proposta vencida.
    dono.update("UPDATE credit_offer SET created_at = created_at - interval '2 days', expires_at = expires_at - interval '2 days' WHERE id=?::uuid", id);
    mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isConflict()).andExpect(jsonPath("code").value("OFFER_EXPIRED"));
    // Consentimento revogado bloqueia.
    String id2 = simular(t, 60_000, 1).at("/offers/0/id").asText();
    mvc.perform(com(delete("/api/v1/credit/consent"), t)).andExpect(status().isNoContent());
    mvc.perform(com(post("/api/v1/credit/offers/" + id2 + "/accept"), t)).andExpect(status().isConflict()).andExpect(jsonPath("code").value("CONSENT_REQUIRED"));
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":60000,\"installments\":1}")).andExpect(status().isConflict());
    // Perfis: financeiro consulta mas não contrata; operador não acessa.
    String financeiro = ler(mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"email\":\"financeiro1@demo.local\",\"password\":\"Only-tests-12345\"}"))).get("accessToken").asText();
    String operador = ler(mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"email\":\"operador1@demo.local\",\"password\":\"Only-tests-12345\"}"))).get("accessToken").asText();
    assertThat(ler(mvc.perform(com(get("/api/v1/credit"), financeiro)).andExpect(status().isOk())).get("canContract").asBoolean()).isFalse();
    mvc.perform(com(post("/api/v1/credit/consent"), financeiro)).andExpect(status().isForbidden());
    mvc.perform(com(get("/api/v1/credit"), operador)).andExpect(status().isForbidden());
    // Sem sessão, nada.
    mvc.perform(get("/api/v1/credit").with(x -> { x.setRemoteAddr(ip); return x; })).andExpect(status().isUnauthorized());
  }

  @Test
  void calculosDoParceiroSimulado() {
    assertThat(br.com.avanade.split.credito.ParceiroCreditoSimuladoAcesso.parcela(100000, 249, 1)).isEqualTo(102490);
    assertThat(br.com.avanade.split.credito.ParceiroCreditoSimuladoAcesso.parcela(120000, 0, 12)).isEqualTo(10000);
    assertThat(br.com.avanade.split.credito.ParceiroCreditoSimuladoAcesso.parcela(100000, 189, 6)).isEqualTo(17787);
  }
}
