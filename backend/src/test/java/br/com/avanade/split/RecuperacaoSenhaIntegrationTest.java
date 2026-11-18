package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/** Recuperação de conta sem estar logado: pedir link, criar nova senha, desbloquear o login. */
@SpringBootTest(properties = "app.password-reset-dev-token=true")
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class RecuperacaoSenhaIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  final ObjectMapper json = new ObjectMapper();
  final RequestPostProcessor ip = r -> { r.setRemoteAddr("10.88.0.1"); return r; };

  org.springframework.test.web.servlet.ResultActions post(String rota, String corpo) throws Exception {
    return mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(rota).with(ip).contentType("application/json").content(corpo));
  }

  @Test
  void recuperaContaBloqueadaSemSessao() throws Exception {
    String email = "recupera-" + UUID.randomUUID() + "@example.invalid";
    post("/api/v1/auth/register", "{\"name\":\"P\",\"merchantName\":\"L\",\"email\":\"" + email + "\",\"password\":\"Senha-antiga-12345\"}").andExpect(status().isCreated());
    String sessao = json.readTree(post("/api/v1/auth/login", "{\"email\":\"" + email + "\",\"password\":\"Senha-antiga-12345\"}")
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("accessToken").asText();
    for (int i = 0; i < 5; i++) post("/api/v1/auth/login", "{\"email\":\"" + email + "\",\"password\":\"Errada-000000\"}");
    post("/api/v1/auth/login", "{\"email\":\"" + email + "\",\"password\":\"Senha-antiga-12345\"}").andExpect(status().isTooManyRequests());

    // Sem cabeçalho Authorization: quem esqueceu a senha não tem sessão.
    String token = json.readTree(post("/api/v1/auth/password-reset/request", "{\"email\":\"" + email + "\"}")
        .andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString()).get("developmentToken").asText();
    // E-mail inexistente recebe a mesma resposta, sem token.
    post("/api/v1/auth/password-reset/request", "{\"email\":\"ninguem-" + UUID.randomUUID() + "@example.invalid\"}")
        .andExpect(status().isAccepted()).andExpect(jsonPath("accepted").value(true)).andExpect(jsonPath("developmentToken").doesNotExist());

    post("/api/v1/auth/password-reset/complete", "{\"token\":\"" + token + "\",\"password\":\"Senha-nova-123456\"}").andExpect(status().isNoContent());
    // Link de uso único.
    post("/api/v1/auth/password-reset/complete", "{\"token\":\"" + token + "\",\"password\":\"Outra-senha-12345\"}").andExpect(status().isBadRequest());
    // A sessão antiga foi revogada.
    mvc.perform(get("/api/v1/sales").with(ip).header("Authorization", "Bearer " + sessao)).andExpect(status().isUnauthorized());
    // O bloqueio acabou e só a senha nova entra.
    post("/api/v1/auth/login", "{\"email\":\"" + email + "\",\"password\":\"Senha-antiga-12345\"}").andExpect(status().isUnauthorized());
    post("/api/v1/auth/login", "{\"email\":\"" + email + "\",\"password\":\"Senha-nova-123456\"}").andExpect(status().isOk());
  }

  @Test
  void tokenInventadoNaoRedefine() throws Exception {
    post("/api/v1/auth/password-reset/complete", "{\"token\":\"inventado-" + UUID.randomUUID() + "\",\"password\":\"Senha-nova-123456\"}")
        .andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_RESET_TOKEN"));
  }
}
