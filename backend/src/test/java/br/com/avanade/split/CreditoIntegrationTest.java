package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Capital de giro com parceiro simulado: consentimento, limite, simulação, contratação e projeção. */
@SpringBootTest
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class CreditoIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  final ObjectMapper json = new ObjectMapper();
  final String ip = "10.99.0." + (int) (Math.random() * 200 + 1);

  MockHttpServletRequestBuilder com(MockHttpServletRequestBuilder r, String token) {
    return r.with(x -> { x.setRemoteAddr(ip); return x; }).header("Authorization", "Bearer " + token).contentType("application/json");
  }

  String novaLoja() throws Exception {
    String email = "credito-" + UUID.randomUUID() + "@example.invalid";
    mvc.perform(post("/api/v1/auth/register").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"name\":\"P\",\"merchantName\":\"Loja\",\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}")).andExpect(status().isCreated());
    return json.readTree(mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}")).andReturn().getResponse().getContentAsString()).get("accessToken").asText();
  }

  void vender(String token, long cents) throws Exception {
    mvc.perform(com(post("/api/v1/sales"), token).header("Idempotency-Key", UUID.randomUUID().toString())
        .content("{\"amountCents\":" + cents + ",\"currency\":\"BRL\",\"paymentMethod\":\"PIX\",\"taxCategory\":\"GENERAL\"}"))
        .andExpect(status().isCreated());
  }

  JsonNode ler(org.springframework.test.web.servlet.ResultActions r) throws Exception {
    return json.readTree(r.andReturn().getResponse().getContentAsString());
  }

  @Test
  void lojaSemVendasNaoRecebeLimite() throws Exception {
    String t = novaLoja();
    var c = ler(mvc.perform(com(get("/api/v1/credit"), t)).andExpect(status().isOk()));
    assertThat(c.at("/partner/limitCents").asLong()).isZero();
    assertThat(c.at("/partner/reason").asText()).contains("Ainda não há vendas suficientes");
    assertThat(c.at("/partner/mode").asText()).isEqualTo("SIMULADO");
    assertThat(c.get("consent").isNull()).isTrue();
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated());
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":50000,\"installments\":3}"))
        .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("AMOUNT_OUT_OF_LIMIT"));
  }

  @Test
  void fluxoCompletoComConsentimentoSimulacaoContratacaoEProjecao() throws Exception {
    String t = novaLoja();
    vender(t, 300_000);
    vender(t, 300_000);
    var c = ler(mvc.perform(com(get("/api/v1/credit"), t)));
    long limite = c.at("/partner/limitCents").asLong();
    long entradas = c.at("/partner/facts/netInflow90dCents").asLong();
    assertThat(entradas).isPositive();
    assertThat(limite).isEqualTo(Math.min(5_000_000, entradas / 2 / 10_000 * 10_000)).isGreaterThanOrEqualTo(50_000);
    assertThat(c.get("canContract").asBoolean()).isTrue();

    // Sem consentimento não simula.
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":100000,\"installments\":6}"))
        .andExpect(status().isConflict()).andExpect(jsonPath("code").value("CONSENT_REQUIRED"));
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated()).andExpect(jsonPath("scopes[0]").value("VENDAS_E_CAIXA_90_DIAS"));

    // Acima do limite e parcelas inválidas são recusados.
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":" + (limite + 10_000) + ",\"installments\":6}")).andExpect(status().isUnprocessableEntity());
    mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":100000,\"installments\":13}")).andExpect(status().is4xxClientError());

    var oferta = ler(mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":100000,\"installments\":6}")).andExpect(status().isCreated()));
    // Tabela Price de R$ 1.000,00 a 2,49% a.m. em 6 vezes: R$ 181,49 (arredondado para cima).
    assertThat(oferta.get("installmentCents").asLong()).isEqualTo(18149);
    assertThat(oferta.get("totalCents").asLong()).isEqualTo(18149L * 6);
    assertThat(oferta.get("interestCents").asLong()).isEqualTo(18149L * 6 - 100000);
    assertThat(oferta.get("annualCetBp").asInt()).isEqualTo(3433);
    assertThat(oferta.get("mode").asText()).isEqualTo("SIMULADO");

    String id = oferta.get("id").asText();
    var contrato = ler(mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isOk()));
    assertThat(contrato.get("schedule")).hasSize(6);
    assertThat(contrato.get("status").asText()).isEqualTo("ATIVO");
    // Aceitar de novo não contrata duas vezes.
    var repetido = ler(mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isOk()));
    assertThat(repetido.get("id").asText()).isEqualTo(contrato.get("id").asText());
    assertThat(db.queryForObject("SELECT count(*) FROM credit_contract WHERE offer_id=?::uuid", Long.class, id)).isEqualTo(1);

    // A projeção soma o crédito e desconta as parcelas que vencem até a data.
    String daqui40dias = java.time.LocalDate.now(java.time.ZoneId.of("America/Fortaleza")).plusDays(40).toString();
    var proj = ler(mvc.perform(com(post("/api/v1/planning/projection"), t).content("{\"until\":\"" + daqui40dias + "\",\"incomeCents\":0,\"expenseCents\":0}")).andExpect(status().isOk()));
    assertThat(proj.get("creditCents").asLong()).isEqualTo(100000);
    assertThat(proj.get("installmentsDueCents").asLong()).isEqualTo(18149);
    assertThat(proj.get("projectedCents").asLong()).isEqualTo(proj.get("openingCents").asLong() + 100000 - 18149);

    // O caixa realizado não muda: o dinheiro do parceiro é simulado.
    var c2 = ler(mvc.perform(com(get("/api/v1/credit"), t)));
    assertThat(c2.get("contracts")).hasSize(1);
  }

  @Test
  void revogarConsentimentoImpedeContratarEOutraLojaNaoAceita() throws Exception {
    String t = novaLoja();
    vender(t, 300_000);
    vender(t, 300_000);
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated());
    String id = ler(mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":60000,\"installments\":1}"))).get("id").asText();
    String outra = novaLoja();
    mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), outra)).andExpect(status().isNotFound());
    mvc.perform(com(delete("/api/v1/credit/consent"), t)).andExpect(status().isNoContent());
    mvc.perform(com(post("/api/v1/credit/offers/" + id + "/accept"), t)).andExpect(status().isConflict()).andExpect(jsonPath("code").value("CONSENT_REQUIRED"));
  }

  @Test
  void parcelaPriceECet() {
    assertThat(br.com.avanade.split.credito.ParceiroCreditoSimuladoAcesso.parcela(100000, 249, 1)).isEqualTo(102490);
    assertThat(br.com.avanade.split.credito.ParceiroCreditoSimuladoAcesso.parcela(120000, 0, 12)).isEqualTo(10000);
  }
}
