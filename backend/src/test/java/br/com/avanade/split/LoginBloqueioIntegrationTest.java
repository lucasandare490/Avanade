package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

/** Bloqueio temporário após 5 tentativas erradas, com contagem regressiva. */
@SpringBootTest
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class LoginBloqueioIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  static final String SENHA = "Senha-teste-12345";
  // Endereço próprio por conta: o limite de 20 logins/min por IP (SessionFilter)
  // não interfere neste teste nem nos outros que dividem o mesmo contexto.
  static final java.util.concurrent.atomic.AtomicInteger IP = new java.util.concurrent.atomic.AtomicInteger(10);
  String ip = "10.77.0." + IP.incrementAndGet();
  org.springframework.test.web.servlet.request.RequestPostProcessor origem() {
    return r -> { r.setRemoteAddr(ip); return r; };
  }

  String criarConta() throws Exception {
    String email = "bloqueio-" + UUID.randomUUID() + "@example.invalid";
    mvc.perform(post("/api/v1/auth/register").with(origem()).contentType("application/json")
            .content("{\"name\":\"Pessoa\",\"merchantName\":\"Loja\",\"email\":\"" + email + "\",\"password\":\"" + SENHA + "\"}"))
        .andExpect(status().isCreated());
    return email;
  }

  org.springframework.test.web.servlet.ResultActions entrar(String email, String senha) throws Exception {
    return mvc.perform(post("/api/v1/auth/login").with(origem()).contentType("application/json")
        .content("{\"email\":\"" + email + "\",\"password\":\"" + senha + "\"}"));
  }

  @Test
  void contaRegressivaBloqueiaNaQuintaTentativaEDesbloqueiaDepois() throws Exception {
    String email = criarConta();
    for (int restantes = 4; restantes >= 1; restantes--) {
      entrar(email, "Senha-errada-0000")
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("code").value("INVALID_CREDENTIALS"))
          .andExpect(jsonPath("remainingAttempts").value(restantes))
          .andExpect(jsonPath("message").value(org.hamcrest.Matchers.containsString(String.valueOf(restantes))));
    }
    entrar(email, "Senha-errada-0000")
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("code").value("LOGIN_TEMPORARILY_LOCKED"))
        .andExpect(jsonPath("remainingAttempts").value(0))
        .andExpect(jsonPath("retryAfterSeconds").value(org.hamcrest.Matchers.greaterThan(800)));
    // Durante o bloqueio, nem a senha certa entra.
    entrar(email, SENHA).andExpect(status().isTooManyRequests());
    // O e-mail não fica salvo, só o hash.
    assertThat(db.queryForObject("SELECT count(*) FROM login_attempt WHERE email_hash=?", Long.class,
        br.com.avanade.split.shared.Hashes.sha256(email))).isEqualTo(1);
    assertThat(db.queryForObject("SELECT count(*) FROM login_attempt WHERE email_hash LIKE '%@%'", Long.class)).isZero();
    // Passado o bloqueio, a senha certa entra e a contagem zera.
    db.update("UPDATE login_attempt SET locked_until=now()-interval '1 second' WHERE email_hash=?",
        br.com.avanade.split.shared.Hashes.sha256(email));
    entrar(email, SENHA).andExpect(status().isOk()).andExpect(jsonPath("accessToken").isString());
    entrar(email, "Senha-errada-0000").andExpect(jsonPath("remainingAttempts").value(4));
  }

  @Test
  void loginCertoZeraContagem() throws Exception {
    String email = criarConta();
    entrar(email, "Senha-errada-0000").andExpect(jsonPath("remainingAttempts").value(4));
    entrar(email, "Senha-errada-0000").andExpect(jsonPath("remainingAttempts").value(3));
    entrar(email, SENHA).andExpect(status().isOk());
    entrar(email, "Senha-errada-0000").andExpect(jsonPath("remainingAttempts").value(4));
  }

  @Test
  void emailInexistenteTemMesmaRespostaQueSenhaErrada() throws Exception {
    String inexistente = "ninguem-" + UUID.randomUUID() + "@example.invalid";
    entrar(inexistente, "Senha-errada-0000")
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("code").value("INVALID_CREDENTIALS"))
        .andExpect(jsonPath("remainingAttempts").value(4));
    for (int i = 0; i < 4; i++) entrar(inexistente, "Senha-errada-0000");
    entrar(inexistente, "Senha-errada-0000").andExpect(status().isTooManyRequests());
  }

  @Test
  void emailComMaiusculasContaComoOMesmo() throws Exception {
    String email = criarConta();
    entrar(email.toUpperCase(), "Senha-errada-0000").andExpect(jsonPath("remainingAttempts").value(4));
    entrar(email, "Senha-errada-0000").andExpect(jsonPath("remainingAttempts").value(3));
  }
}
