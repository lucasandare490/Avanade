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
import java.time.*;
@SpringBootTest
@AutoConfigureMockMvc(print=org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class PlanejamentoIntegrationTest extends PostgresSupport {
 @Autowired MockMvc mvc; @Autowired JdbcTemplate db; @Autowired Clock clock;
 String token(String user) throws Exception {
  var r=mvc.perform(post("/api/v1/auth/login").contentType("application/json").content("{\"email\":\""+user+"@demo.local\",\"password\":\"Only-tests-12345\"}")).andExpect(status().isOk()).andReturn();
  return new com.fasterxml.jackson.databind.ObjectMapper().readTree(r.getResponse().getContentAsString()).get("accessToken").asText();
 }
 @Test void scenarioIsReadOnlyAndOperatorCannotAccess() throws Exception {
  var manager=token("gerente1");var operator=token("operador1");
  var until=LocalDate.now(clock.withZone(ZoneId.of("America/Recife"))).plusDays(7);
  String body="{\"until\":\""+until+"\",\"incomeCents\":10000,\"expenseCents\":15000}";
  long before=db.queryForObject("SELECT count(*) FROM cash_entry",Long.class);
  mvc.perform(post("/api/v1/planning/projection").header("Authorization","Bearer "+manager).contentType("application/json").content(body)).andExpect(status().isOk()).andExpect(jsonPath("origin").value("MOCK")).andExpect(jsonPath("incomeCents").value(10000));
  mvc.perform(post("/api/v1/planning/projection").header("Authorization","Bearer "+operator).contentType("application/json").content(body)).andExpect(status().isForbidden());
  assertThat(db.queryForObject("SELECT count(*) FROM cash_entry",Long.class)).isEqualTo(before);
 }

 @Test void categorySuggestionIsReviewableAndDoesNotWrite() throws Exception {
  String manager=token("gerente1");
  long before=db.queryForObject("SELECT count(*) FROM expense",Long.class);
  mvc.perform(post("/api/v1/ai/expense-category").header("Authorization","Bearer "+manager).contentType("application/json").content("{\"description\":\"Reposição de estoque\"}"))
    .andExpect(status().isOk()).andExpect(jsonPath("suggestions[0].id").value("STOCK")).andExpect(jsonPath("requiresConfirmation").value(true));
  mvc.perform(post("/api/v1/ai/expense-category").header("Authorization","Bearer "+manager).contentType("application/json").content("{\"description\":\"estoque e aluguel\"}"))
    .andExpect(status().isOk()).andExpect(jsonPath("suggestions").isEmpty());
  assertThat(db.queryForObject("SELECT count(*) FROM expense",Long.class)).isEqualTo(before);
 }
}
