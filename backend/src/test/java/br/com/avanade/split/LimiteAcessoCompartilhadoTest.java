package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.avanade.split.shared.Hashes;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * Limite de acesso por IP guardado no banco (Thayná Batista da Silva): vale para todas as cópias
 * da API, usa o IP real que a Vercel informa em x-vercel-forwarded-for e guarda só o hash do IP.
 */
@SpringBootTest(properties = {"app.login-rate-limit-per-minute=3", "app.client-ip-header=x-vercel-forwarded-for"})
@AutoConfigureMockMvc(print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class LimiteAcessoCompartilhadoTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  final JdbcTemplate dono = new JdbcTemplate(PG.getPostgresDatabase());

  ResultActions login(String ip) throws Exception {
    return mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr("10.0.0.1"); return x; })
        .header("x-vercel-forwarded-for", ip).contentType("application/json")
        .content("{\"email\":\"ninguem-" + UUID.randomUUID() + "@example.invalid\",\"password\":\"errada-123456\"}"));
  }

  String ip() {
    return "203.0." + (int) (Math.random() * 250 + 1) + "." + (int) (Math.random() * 250 + 1);
  }

  @Test
  void quartoPedidoDoMesmoIpNoMinutoERecusadoEOutroIpSegue() throws Exception {
    // A janela é por minuto: se a virada do minuto cair no meio, repete com outro IP.
    for (int tentativa = 0; tentativa < 3; tentativa++) {
      String a = ip(), b = ip();
      long antes = System.currentTimeMillis() / 60000;
      int[] status = new int[4];
      for (int i = 0; i < 4; i++) status[i] = login(a).andReturn().getResponse().getStatus();
      long depois = System.currentTimeMillis() / 60000;
      if (antes != depois) continue;
      assertThat(status).containsExactly(401, 401, 401, 429);
      login(a).andExpect(header().string("Retry-After", "60"));
      login(b).andExpect(status().isUnauthorized());
      return;
    }
    fail("A virada do minuto caiu no meio das três tentativas.");
  }

  @Test
  void contagemDeOutraCopiaDaApiNoBancoTambemConta() throws Exception {
    String c = ip();
    long minuto = System.currentTimeMillis() / 60000;
    // Outra cópia da API já registrou 3 pedidos deste IP neste minuto.
    for (long m : new long[] {minuto, minuto + 1})
      dono.update("INSERT INTO access_rate_window(bucket_hash,minute,hits) VALUES (?,?,3)", Hashes.sha256("login:" + c), m);
    login(c).andExpect(status().isTooManyRequests());
  }

  @Test
  void guardaSoOHashDoIpENuncaOIpEmTexto() throws Exception {
    String d = ip();
    login(d).andExpect(status().isUnauthorized());
    assertThat(dono.queryForObject("SELECT count(*) FROM access_rate_window WHERE bucket_hash=?", Long.class, Hashes.sha256("login:" + d))).isEqualTo(1);
    assertThat(dono.queryForObject("SELECT count(*) FROM access_rate_window WHERE bucket_hash LIKE ?", Long.class, "%" + d + "%")).isZero();
  }

  @Test
  void cabecalhoInvalidoCaiNoIpDaConexaoESemCabecalhoTambem() throws Exception {
    // Valor que não é IP (tentativa de injeção) não vira chave: usa o IP da conexão.
    for (int i = 0; i < 3; i++)
      mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr("10.77.0.9"); return x; })
          .header("x-vercel-forwarded-for", "' OR 1=1 --").contentType("application/json")
          .content("{\"email\":\"x@example.invalid\",\"password\":\"errada-123456\"}")).andExpect(status().isUnauthorized());
    mvc.perform(post("/api/v1/auth/login").with(x -> { x.setRemoteAddr("10.77.0.9"); return x; })
        .contentType("application/json").content("{\"email\":\"x@example.invalid\",\"password\":\"errada-123456\"}"))
        .andExpect(status().isTooManyRequests());
  }
}
