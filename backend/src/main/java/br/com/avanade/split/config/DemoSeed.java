package br.com.avanade.split.config;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@org.springframework.core.annotation.Order(0)
@ConditionalOnProperty(name = "app.demo-seed", havingValue = "true")
public class DemoSeed implements ApplicationRunner {
  private final JdbcTemplate db;
  private final PasswordEncoder passwords;
  private final String password;

  public DemoSeed(
      JdbcTemplate db, PasswordEncoder passwords, @Value("${app.demo-password:}") String password) {
    this.db = db;
    this.passwords = passwords;
    this.password = password;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (password.length() < 12 || password.length() > 72)
      throw new IllegalStateException("DEMO_PASSWORD must have 12..72 characters");
    for (int shop = 1; shop <= 2; shop++) {
      UUID merchant = UUID.fromString("00000000-0000-0000-0000-00000000000" + shop);
      db.update(
          "INSERT INTO merchant(id,name,time_zone) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING",
          merchant,
          "Loja " + shop + " · demonstração",
          "America/Recife");
      for (String role : java.util.List.of("GERENTE", "FINANCEIRO", "OPERADOR")) {
        String email = role.toLowerCase(java.util.Locale.ROOT) + shop + "@demo.local";
        if (db.queryForObject("SELECT count(*) FROM app_user WHERE email=?", Long.class, email)
            == 0)
          db.update(
              "INSERT INTO app_user VALUES (?,?,?,?,?,?)",
              UUID.randomUUID(),
              merchant,
              email,
              role + " de demonstração",
              passwords.encode(password),
              role);
      }
    }
    db.update(
        "INSERT INTO tax_rule(id,version,category,tax_bps,fee_bps,valid_from) VALUES (?,?,?,?,?,?) ON CONFLICT(version) DO NOTHING",
        UUID.fromString("10000000-0000-0000-0000-000000000001"),
        "DEMO-v1",
        "GENERAL",
        1000,
        200,
        java.sql.Timestamp.from(java.time.Instant.parse("2000-01-01T00:00:00Z")));
  }
}
