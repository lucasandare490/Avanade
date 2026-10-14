package br.com.avanade.split;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public abstract class PostgresSupport {
  static final EmbeddedPostgres PG;

  static {
    try {
      PG = EmbeddedPostgres.builder().start();
      try (var c = PG.getPostgresDatabase().getConnection();
          var s = c.createStatement()) {
        s.execute("CREATE ROLE split_app LOGIN PASSWORD 'test-only-runtime'");
        s.execute("GRANT USAGE ON SCHEMA public TO split_app");
        s.execute(
            "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE ON TABLES TO"
                + " split_app");
      }
    } catch (Exception e) {
      throw new ExceptionInInitializerError(e);
    }
  }

  @DynamicPropertySource
  static void database(DynamicPropertyRegistry r) {
    r.add(
        "spring.datasource.url", () -> "jdbc:postgresql://127.0.0.1:" + PG.getPort() + "/postgres");
    r.add("spring.datasource.username", () -> "split_app");
    r.add("spring.datasource.password", () -> "test-only-runtime");
    r.add("spring.flyway.url", () -> "jdbc:postgresql://127.0.0.1:" + PG.getPort() + "/postgres");
    r.add("spring.flyway.user", () -> "postgres");
    r.add("spring.flyway.password", () -> "");
    r.add("app.demo-seed", () -> true);
    r.add("app.demo-password", () -> "Only-tests-12345");
    r.add("springdoc.api-docs.enabled", () -> true);
  }
}
