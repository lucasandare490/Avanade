package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(print=org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class CadastroIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  @Test void createsStoreLoginAndDuplicateRollsBack() throws Exception {
    String email="novo-"+UUID.randomUUID()+"@example.invalid";
    String body="{\"name\":\"Nova pessoa\",\"merchantName\":\"Loja nova\",\"email\":\""+email+"\",\"password\":\"Senha-teste-12345\"}";
    mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated());
    var user=db.queryForMap("SELECT * FROM app_user WHERE email=?",email);
    assertThat(user.get("role")).isEqualTo("GERENTE");
    assertThat(user.get("password_hash")).isNotEqualTo("Senha-teste-12345");
    assertThat(db.queryForObject("SELECT count(*) FROM sale WHERE merchant_id=?",Long.class,user.get("merchant_id"))).isZero();
    long stores=db.queryForObject("SELECT count(*) FROM merchant",Long.class);
    mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body)).andExpect(status().isConflict());
    assertThat(db.queryForObject("SELECT count(*) FROM merchant",Long.class)).isEqualTo(stores);
    mvc.perform(post("/api/v1/auth/login").contentType("application/json").content("{\"email\":\""+email+"\",\"password\":\"Senha-teste-12345\"}")).andExpect(status().isOk()).andExpect(jsonPath("accessToken").isString());
  }
  @Test void rejectsShortPasswordAndInjectedRole() throws Exception {
    mvc.perform(post("/api/v1/auth/register").contentType("application/json").content("{\"name\":\"Nome\",\"merchantName\":\"Loja\",\"email\":\"a@example.invalid\",\"password\":\"curta\"}")).andExpect(status().is4xxClientError());
    mvc.perform(post("/api/v1/auth/register").contentType("application/json").content("{\"name\":\"Nome\",\"merchantName\":\"Loja\",\"email\":\"a@example.invalid\",\"password\":\"Senha-teste-12345\",\"role\":\"OPERADOR\"}")).andExpect(status().is4xxClientError());
  }

  @Test void hypotheticalPercentageDoesNotCreateSale() throws Exception {
    var response=mvc.perform(post("/api/v1/auth/login").contentType("application/json")
      .content("{\"email\":\"gerente1@demo.local\",\"password\":\"Only-tests-12345\"}"))
      .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String token=new com.fasterxml.jackson.databind.ObjectMapper().readTree(response).get("accessToken").asText();
    long before=db.queryForObject("SELECT count(*) FROM sale",Long.class);
    mvc.perform(post("/api/v1/split-payment/simulate").header("Authorization","Bearer "+token).contentType("application/json")
      .content("{\"amountCents\":15000,\"includeFee\":false,\"taxCategory\":\"GENERAL\",\"simulatedTaxBps\":2000}"))
      .andExpect(status().isOk()).andExpect(jsonPath("amounts.taxCents").value(3000)).andExpect(jsonPath("amounts.netCents").value(12000));
    mvc.perform(post("/api/v1/split-payment/simulate").header("Authorization","Bearer "+token).contentType("application/json")
      .content("{\"amountCents\":15000,\"includeFee\":true,\"taxCategory\":\"GENERAL\",\"simulatedTaxBps\":10000}"))
      .andExpect(status().isUnprocessableEntity());
    assertThat(db.queryForObject("SELECT count(*) FROM sale",Long.class)).isEqualTo(before);
  }
}
