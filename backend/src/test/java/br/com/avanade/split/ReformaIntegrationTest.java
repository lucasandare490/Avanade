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
 * Reforma Tributária no caixa (Thayná Batista da Silva): crédito de IBS/CBS das compras e resumo
 * do período (imposto retido nas vendas, créditos, imposto líquido e linhas para o contador). Roda
 * com o papel de banco da produção (split_app).
 */
@SpringBootTest
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class ReformaIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  final ObjectMapper json = new ObjectMapper();
  final String ip = "10.98." + (int) (Math.random() * 200 + 1) + "." + (int) (Math.random() * 200 + 1);
  final String hoje = LocalDate.now(ZoneId.of("America/Fortaleza")).toString();

  MockHttpServletRequestBuilder com(MockHttpServletRequestBuilder r, String token) {
    return r.with(x -> { x.setRemoteAddr(ip); return x; }).header("Authorization", "Bearer " + token).contentType("application/json");
  }

  JsonNode ler(ResultActions r) throws Exception {
    return json.readTree(r.andReturn().getResponse().getContentAsString());
  }

  String novaLoja() throws Exception {
    String email = "reforma-" + UUID.randomUUID() + "@example.invalid";
    mvc.perform(post("/api/v1/auth/register").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"name\":\"P\",\"merchantName\":\"Loja\",\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}")).andExpect(status().isCreated());
    return ler(mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}"))).get("accessToken").asText();
  }

  void vender(String t, long cents) throws Exception {
    mvc.perform(com(post("/api/v1/sales"), t).header("Idempotency-Key", UUID.randomUUID().toString())
        .content("{\"amountCents\":" + cents + ",\"currency\":\"BRL\",\"paymentMethod\":\"PIX\",\"taxCategory\":\"GENERAL\"}"))
        .andExpect(status().isCreated());
  }

  ResultActions compra(String t, long cents, Long credito) throws Exception {
    String campoCredito = credito == null ? "" : ",\"taxCreditCents\":" + credito;
    return mvc.perform(com(post("/api/v1/expenses"), t).header("Idempotency-Key", UUID.randomUUID().toString())
        .content("{\"description\":\"Compra de estoque\",\"amountCents\":" + cents + ",\"categoryId\":\"STOCK\",\"paidOn\":\"" + hoje + "\"" + campoCredito + "}"));
  }

  JsonNode resumo(String t) throws Exception {
    return ler(mvc.perform(com(get("/api/v1/tax-reform/summary?from=" + hoje + "&to=" + hoje), t)).andExpect(status().isOk()));
  }

  @Test
  void compraGuardaCreditoDeIbsCbsEDespesaSemCreditoValeZero() throws Exception {
    String t = novaLoja();
    var comCredito = ler(compra(t, 100_000, 9_250L).andExpect(status().isCreated()));
    assertThat(comCredito.get("taxCreditCents").asLong()).isEqualTo(9_250);
    var semCredito = ler(compra(t, 20_000, null).andExpect(status().isCreated()));
    assertThat(semCredito.get("taxCreditCents").asLong()).isZero();
    var lista = ler(mvc.perform(com(get("/api/v1/expenses"), t)).andExpect(status().isOk()));
    assertThat(lista.at("/items/0/taxCreditCents").isNumber()).isTrue();
  }

  @Test
  void creditoMaiorQueACompraOuNegativoERecusado() throws Exception {
    String t = novaLoja();
    compra(t, 10_000, 10_001L).andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("INVALID_TAX_CREDIT"));
    compra(t, 10_000, -1L).andExpect(status().is4xxClientError());
    assertThat(resumo(t).get("purchasesCount").asLong()).isZero();
  }

  @Test
  void resumoSomaImpostoRetidoCreditosEImpostoLiquido() throws Exception {
    String t = novaLoja();
    vender(t, 300_000);
    vender(t, 150_000);
    compra(t, 80_000, 8_000L).andExpect(status().isCreated());
    compra(t, 5_000, null).andExpect(status().isCreated());
    var r = resumo(t);
    long imposto = r.get("taxWithheldCents").asLong();
    assertThat(imposto).isPositive();
    assertThat(r.get("salesCount").asLong()).isEqualTo(2);
    assertThat(r.get("grossCents").asLong()).isEqualTo(450_000);
    assertThat(r.get("grossCents").asLong()).isEqualTo(imposto + r.get("feeCents").asLong() + r.get("netCents").asLong());
    assertThat(r.get("taxCreditCents").asLong()).isEqualTo(8_000);
    assertThat(r.get("purchasesCents").asLong()).isEqualTo(85_000);
    assertThat(r.get("purchasesWithCreditCount").asLong()).isEqualTo(1);
    assertThat(r.get("creditUsableCents").asLong()).isEqualTo(Math.min(imposto, 8_000));
    assertThat(r.get("netTaxCents").asLong()).isEqualTo(Math.max(0, imposto - 8_000));
    assertThat(r.get("sales").size()).isEqualTo(2);
    assertThat(r.get("purchases").size()).isEqualTo(2);
    long somaImpostoLinhas = 0;
    for (var v : r.get("sales")) somaImpostoLinhas += v.get("taxCents").asLong();
    assertThat(somaImpostoLinhas).isEqualTo(imposto);
    assertThat(r.get("mode").asText()).isEqualTo("SIMULADO");
  }

  @Test
  void creditoAcimaDoImpostoFicaAcumulado() throws Exception {
    String t = novaLoja();
    vender(t, 10_000);
    compra(t, 900_000, 900_000L).andExpect(status().isCreated());
    var r = resumo(t);
    long imposto = r.get("taxWithheldCents").asLong();
    assertThat(r.get("netTaxCents").asLong()).isZero();
    assertThat(r.get("creditUsableCents").asLong()).isEqualTo(imposto);
    assertThat(r.get("creditCarryOverCents").asLong()).isEqualTo(900_000 - imposto);
  }

  @Test
  void cadaLojaVeSoOsSeusNumerosEPeriodoInvalidoERecusado() throws Exception {
    String a = novaLoja(), b = novaLoja();
    compra(a, 50_000, 5_000L).andExpect(status().isCreated());
    assertThat(resumo(b).get("taxCreditCents").asLong()).isZero();
    assertThat(resumo(b).get("purchases").size()).isZero();
    mvc.perform(com(get("/api/v1/tax-reform/summary?from=2026-01-01&to=2027-06-01"), a)).andExpect(status().isBadRequest());
    mvc.perform(com(get("/api/v1/tax-reform/summary?from=" + hoje + "&to=" + hoje), "token-invalido")).andExpect(status().isUnauthorized());
  }
}
