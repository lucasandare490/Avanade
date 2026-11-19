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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Webhook do parceiro: assinatura HMAC obrigatória, evento único e parceiro dono do contrato. */
@SpringBootTest(properties = "app.credit.webhook-secret=segredo-de-teste-com-mais-de-32-caracteres")
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class CreditoWebhookIntegrationTest extends PostgresSupport {
  static final byte[] SEGREDO = "segredo-de-teste-com-mais-de-32-caracteres".getBytes(java.nio.charset.StandardCharsets.UTF_8);
  @Autowired MockMvc mvc;
  final ObjectMapper json = new ObjectMapper();
  final String ip = "10.98.0." + (int) (Math.random() * 200 + 1);

  MockHttpServletRequestBuilder com(MockHttpServletRequestBuilder r, String token) {
    return r.with(x -> { x.setRemoteAddr(ip); return x; }).header("Authorization", "Bearer " + token).contentType("application/json");
  }

  JsonNode ler(ResultActions r) throws Exception {
    return json.readTree(r.andReturn().getResponse().getContentAsString());
  }

  static String assinar(String corpo) throws Exception {
    var mac = javax.crypto.Mac.getInstance("HmacSHA256");
    mac.init(new javax.crypto.spec.SecretKeySpec(SEGREDO, "HmacSHA256"));
    return "sha256=" + java.util.HexFormat.of().formatHex(mac.doFinal(corpo.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
  }

  ResultActions webhook(String parceiro, String corpo, String assinatura) throws Exception {
    var r = post("/api/v1/credit/webhook/" + parceiro).with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json").content(corpo);
    if (assinatura != null) r = r.header("X-Planner-Signature", assinatura);
    return mvc.perform(r);
  }

  @Test
  void webhookAssinadoMarcaParcelaPagaUmaVezSo() throws Exception {
    String email = "webhook-" + UUID.randomUUID() + "@example.invalid";
    mvc.perform(post("/api/v1/auth/register").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"name\":\"P\",\"merchantName\":\"Loja\",\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}")).andExpect(status().isCreated());
    String t = ler(mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr(ip); return x; }).contentType("application/json")
        .content("{\"email\":\"" + email + "\",\"password\":\"Senha-teste-12345\"}"))).get("accessToken").asText();
    for (int i = 0; i < 2; i++)
      mvc.perform(com(post("/api/v1/sales"), t).header("Idempotency-Key", UUID.randomUUID().toString())
          .content("{\"amountCents\":300000,\"currency\":\"BRL\",\"paymentMethod\":\"PIX\",\"taxCategory\":\"GENERAL\"}")).andExpect(status().isCreated());
    mvc.perform(com(post("/api/v1/credit/consent"), t)).andExpect(status().isCreated());
    var oferta = ler(mvc.perform(com(post("/api/v1/credit/offers"), t).content("{\"amountCents\":60000,\"installments\":2}"))).at("/offers/0");
    String parceiro = oferta.get("partnerId").asText();
    String contrato = ler(mvc.perform(com(post("/api/v1/credit/offers/" + oferta.get("id").asText() + "/accept"), t))).get("id").asText();
    String corpo = "{\"eventId\":\"evt-" + UUID.randomUUID() + "\",\"type\":\"INSTALLMENT_PAID\",\"contractId\":\"" + contrato + "\",\"installmentNumber\":1}";

    webhook(parceiro, corpo, null).andExpect(status().isUnauthorized());
    webhook(parceiro, corpo, "sha256=" + "0".repeat(64)).andExpect(status().isUnauthorized());
    webhook(parceiro, corpo.replace("\"installmentNumber\":1", "\"installmentNumber\":2"), assinar(corpo)).andExpect(status().isUnauthorized());
    // Outro parceiro não mexe no contrato.
    String outro = parceiro.equals("banco-demo") ? "fintech-demo" : "banco-demo";
    String corpoOutro = corpo.replace("evt-", "evt-outro-");
    webhook(outro, corpoOutro, assinar(corpoOutro)).andExpect(status().isNotFound());
    webhook("parceiro-inexistente", corpo, assinar(corpo)).andExpect(status().isNotFound());

    webhook(parceiro, corpo, assinar(corpo)).andExpect(status().isOk()).andExpect(jsonPath("status").value("PROCESSADO"));
    webhook(parceiro, corpo, assinar(corpo)).andExpect(status().isOk()).andExpect(jsonPath("status").value("DUPLICADO"));
    var depois = ler(mvc.perform(com(get("/api/v1/credit"), t))).at("/contracts/0");
    assertThat(depois.at("/schedule/0/status").asText()).isEqualTo("PAGA");
    assertThat(depois.at("/schedule/1/status").asText()).isEqualTo("A_VENCER");
    var eventos = ler(mvc.perform(com(get("/api/v1/credit/events"), t)));
    assertThat(eventos.toString()).contains("WEBHOOK_INSTALLMENT_PAID");
  }
}
