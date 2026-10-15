package br.com.avanade.split;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
@AutoConfigureMockMvc(print=org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class EstabelecimentoIntegrationTest extends PostgresSupport {
 @Autowired MockMvc mvc;
 @Autowired JdbcTemplate db;
 String token(String user) throws Exception {
  var result=mvc.perform(post("/api/v1/auth/login").contentType("application/json")
   .content("{\"email\":\""+user+"@demo.local\",\"password\":\"Only-tests-12345\"}"))
   .andExpect(status().isOk()).andReturn();
  return new com.fasterxml.jackson.databind.ObjectMapper().readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
 }
 @Test void managerEditsOnlyOwnNameAndPreservesFinancialHistory() throws Exception {
  String manager=token("gerente1");
  var before=db.queryForList("SELECT id,name,time_zone FROM merchant ORDER BY id");
  var sales=db.queryForList("SELECT * FROM sale ORDER BY id");
  var store=db.queryForObject("SELECT merchant_id FROM app_user WHERE email='gerente1@demo.local'",java.util.UUID.class);
  String oldName=db.queryForObject("SELECT name FROM merchant WHERE id=?",String.class,store);
  try {
   mvc.perform(post("/api/v1/merchant").header("Authorization","Bearer "+manager).contentType("application/json")
    .content("{\"name\":\"Loja atualizada\"}"))
    .andExpect(status().isOk()).andExpect(jsonPath("name").value("Loja atualizada")).andExpect(jsonPath("canEdit").value(true));
   mvc.perform(get("/api/v1/merchant").header("Authorization","Bearer "+token("operador1")))
    .andExpect(status().isOk()).andExpect(jsonPath("name").value("Loja atualizada")).andExpect(jsonPath("canEdit").value(false));
   assertThat(db.queryForList("SELECT * FROM sale ORDER BY id")).isEqualTo(sales);
   for(var row:before) if(!row.get("id").equals(store))
    assertThat(db.queryForMap("SELECT id,name,time_zone FROM merchant WHERE id=?",row.get("id"))).isEqualTo(row);
  } finally { db.update("UPDATE merchant SET name=? WHERE id=?",oldName,store); }
 }
 @Test void rejectsOperatorAndInvalidOrInjectedFields() throws Exception {
  mvc.perform(get("/api/v1/merchant")).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/v1/merchant").header("Authorization","Bearer "+token("operador1")).contentType("application/json").content("{\"name\":\"Outro nome\"}"))
   .andExpect(status().isForbidden());
  String manager=token("gerente1");
  mvc.perform(post("/api/v1/merchant").header("Authorization","Bearer "+manager).contentType("application/json").content("{\"name\":\"   \"}"))
   .andExpect(status().is4xxClientError());
  mvc.perform(post("/api/v1/merchant").header("Authorization","Bearer "+manager).contentType("application/json").content("{\"name\":\"Outro\",\"merchantId\":\"outra-loja\"}"))
   .andExpect(status().is4xxClientError());
 }
}
