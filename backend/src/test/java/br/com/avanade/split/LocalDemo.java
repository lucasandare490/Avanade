package br.com.avanade.split;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.nio.file.*;
import java.util.*;
import org.springframework.boot.SpringApplication;

/** Local developer launcher only; never packaged in the production jar. */
public final class LocalDemo {
  public static void main(String[] args) throws Exception {
    String password = System.getenv("DEMO_PASSWORD");
    if (password == null || password.length() < 12 || password.length() > 72)
      throw new IllegalArgumentException("Set DEMO_PASSWORD (12..72 characters).");
    Path data = Path.of(".local/postgres").toAbsolutePath();
    Files.createDirectories(data.getParent());
    // A previous interrupted launcher may leave its own local PostgreSQL alive.
    // Reuse only the process whose pid file identifies this exact directory and port.
    boolean running = false;
    Path pidFile = data.resolve("postmaster.pid");
    if (Files.exists(pidFile)) {
      var lines = Files.readAllLines(pidFile);
      running = lines.size() >= 4
          && Path.of(lines.get(1)).toAbsolutePath().normalize().equals(data.normalize())
          && lines.get(3).equals("54329")
          && ProcessHandle.of(Long.parseLong(lines.getFirst())).map(ProcessHandle::isAlive).orElse(false);
    }
    if (!running) {
      EmbeddedPostgres.builder()
          .setDataDirectory(data)
          .setCleanDataDirectory(false)
          .setPort(54329)
          .setServerConfig("listen_addresses", "127.0.0.1")
          .start();
    }
    try (var c = java.sql.DriverManager.getConnection(
            "jdbc:postgresql://127.0.0.1:54329/postgres", "postgres", "");
        var s = c.createStatement()) {
      s.execute(
          "DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='split_app') THEN CREATE"
              + " ROLE split_app LOGIN; END IF; END $$");
      s.execute("GRANT USAGE ON SCHEMA public TO split_app");
      s.execute(
          "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE ON TABLES TO"
              + " split_app");
    }
    var app = new SpringApplication(SplitApplication.class);
    app.setAdditionalProfiles("demo");
    app.setDefaultProperties(
        Map.of("spring.datasource.url", "jdbc:postgresql://127.0.0.1:54329/postgres"));
    // Explicit local configuration takes precedence over application.yml defaults.
    app.run(
        "--spring.datasource.url=jdbc:postgresql://127.0.0.1:54329/postgres",
        "--spring.datasource.username=split_app",
        "--spring.datasource.password=",
        "--spring.flyway.user=postgres",
        "--spring.flyway.password=",
        "--server.address=127.0.0.1");
  }
}
