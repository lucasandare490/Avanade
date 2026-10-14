package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;

class CrashRecoveryTest extends PostgresSupport {
  private final ObjectMapper json = new ObjectMapper();
  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
  private final List<Process> children = new ArrayList<>();
  private final JdbcTemplate db = new JdbcTemplate(PG.getPostgresDatabase());

  @AfterEach
  void stopChildren() throws Exception {
    for (var process : children) {
      if (process.isAlive()) {
        process.destroy();
        if (!process.waitFor(10, TimeUnit.SECONDS)) {
          process.destroyForcibly();
          process.waitFor(10, TimeUnit.SECONDS);
        }
      }
    }
  }

  @Test
  @Timeout(100)
  void committedSaleSurvivesProcessDeathBeforeHttpBody() throws Exception {
    var directory = Files.createTempDirectory(Path.of("target"), "crash-recovery-");
    var first = start(directory, "before", true);
    int port = port(first, directory.resolve("before.port"));
    var session =
        body(
            request(
                port,
                "POST",
                "/api/v1/auth/login",
                null,
                null,
                "{\"email\":\"gerente1@demo.local\",\"password\":\"Only-tests-12345\"}"));
    String token = session.get("accessToken").asText(), key = UUID.randomUUID().toString();
    String input =
        "{\"amountCents\":15000,\"currency\":\"BRL\",\"paymentMethod\":\"PIX\",\"taxCategory\":\"GENERAL\"}";
    assertThatThrownBy(() -> request(port, "POST", "/api/v1/sales", token, key, input))
        .isInstanceOf(IOException.class);
    assertThat(first.waitFor(10, TimeUnit.SECONDS)).isTrue();
    assertThat(first.exitValue()).isEqualTo(86);
    var original =
        json.readTree(
            db.queryForObject(
                "SELECT response_json FROM request_intent WHERE action='SALE' AND request_key=?",
                String.class,
                key));
    UUID sale = UUID.fromString(original.get("id").asText());
    UUID operation = UUID.fromString(original.get("operation").get("id").asText());
    var before = counts(sale, operation);
    assertThat(before)
        .containsEntry("sales", 1L)
        .containsEntry("operations", 1L)
        .containsEntry("parcels", 3L)
        .containsEntry("cashEntries", 1L)
        .containsEntry("events", 6L);
    var second = start(directory, "after", false);
    int afterPort = port(second, directory.resolve("after.port"));
    var recovered = request(afterPort, "GET", "/api/v1/requests/SALE/" + key, token, null, null);
    assertThat(recovered.statusCode()).isEqualTo(200);
    assertThat(body(recovered)).isEqualTo(original);
    var replay = request(afterPort, "POST", "/api/v1/sales", token, key, input);
    assertThat(replay.statusCode()).isEqualTo(200);
    assertThat(body(replay)).isEqualTo(original);
    assertThat(replay.headers().firstValue("Idempotency-Replayed")).contains("true");
    assertThat(counts(sale, operation)).isEqualTo(before);
    Files.writeString(
        Path.of("target/crash-recovery.json"),
        json.writerWithDefaultPrettyPrinter()
            .writeValueAsString(
                Map.of(
                    "fault",
                    "halt(86) after service transaction committed, before buffered HTTP body"
                        + " copied",
                    "clientObserved",
                    "IOException: no successful response received",
                    "restart",
                    "new JVM, same PostgreSQL; original bearer session and idempotency key"
                        + " recovered",
                    "replayStatus",
                    200,
                    "responseIdentical",
                    true,
                    "countsBeforeAndAfter",
                    before)));
  }

  private Map<String, Long> counts(UUID sale, UUID operation) {
    return Map.of(
        "sales",
        db.queryForObject("SELECT count(*) FROM sale WHERE id=?", Long.class, sale),
        "operations",
        db.queryForObject("SELECT count(*) FROM split_operation WHERE sale_id=?", Long.class, sale),
        "parcels",
        db.queryForObject(
            "SELECT count(*) FROM parcel WHERE operation_id=?", Long.class, operation),
        "events",
        db.queryForObject(
            "SELECT count(*) FROM ledger_event WHERE operation_id=?", Long.class, operation),
        "cashEntries",
        db.queryForObject(
            "SELECT count(*) FROM cash_entry WHERE operation_id=?", Long.class, operation));
  }

  private Process start(Path directory, String name, boolean crash) throws IOException {
    String url = "jdbc:postgresql://127.0.0.1:" + PG.getPort() + "/postgres";
    var command =
        List.of(
            Path.of(System.getProperty("java.home"), "bin", "java").toString(),
            "-cp",
            System.getProperty("surefire.test.class.path", System.getProperty("java.class.path")),
            CrashTestServer.class.getName(),
            "--spring.datasource.url=" + url,
            "--spring.datasource.username=split_app",
            "--spring.datasource.password=test-only-runtime",
            "--spring.flyway.url=" + url,
            "--spring.flyway.user=postgres",
            "--spring.flyway.password=",
            "--server.address=127.0.0.1",
            "--server.port=0",
            "--app.demo-seed=true",
            "--app.demo-password=Only-tests-12345",
            "--test.crash=" + crash,
            "--test.port-file=" + directory.resolve(name + ".port").toAbsolutePath(),
            "--logging.level.root=WARN",
            "--debug=false",
            "--trace=false");
    var process =
        new ProcessBuilder(command)
            .redirectErrorStream(true)
            .redirectOutput(directory.resolve(name + ".log").toFile())
            .start();
    children.add(process);
    return process;
  }

  private int port(Process process, Path file) throws Exception {
    long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(35);
    while (System.nanoTime() < deadline) {
      if (!process.isAlive())
        throw new AssertionError("Child exited before ready; inspect " + file.getParent());
      if (Files.exists(file) && !Files.readString(file).isBlank())
        return Integer.parseInt(Files.readString(file));
      Thread.sleep(50);
    }
    throw new AssertionError("Child readiness timeout: " + file);
  }

  private HttpResponse<String> request(
      int port, String method, String path, String token, String key, String data)
      throws Exception {
    var request =
        HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
            .timeout(Duration.ofSeconds(15))
            .header("Content-Type", "application/json");
    if (token != null) request.header("Authorization", "Bearer " + token);
    if (key != null) request.header("Idempotency-Key", key);
    return http.send(
        request
            .method(
                method,
                data == null
                    ? HttpRequest.BodyPublishers.noBody()
                    : HttpRequest.BodyPublishers.ofString(data))
            .build(),
        HttpResponse.BodyHandlers.ofString());
  }

  private JsonNode body(HttpResponse<String> response) throws Exception {
    return json.readTree(response.body());
  }
}
