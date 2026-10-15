package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.avanade.split.core.*;
import br.com.avanade.split.finance.AIProvider;
import com.fasterxml.jackson.databind.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;

@SpringBootTest(properties = {"debug=false", "trace=false"})
@AutoConfigureMockMvc(
    printOnlyOnFailure = false,
    print = org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE)
class BackendIntegrationTest extends PostgresSupport {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired JdbcTemplate db;
  @MockitoBean MockAdapters mocks;
  @MockitoBean AIProvider ai;
  String manager, other, operator, financial;
  final String input =
      "{\"amountCents\":15000,\"currency\":\"BRL\",\"paymentMethod\":\"PIX\",\"taxCategory\":\"GENERAL\"}";

  @BeforeEach
  void setup() throws Exception {
    when(mocks.confirmPayment()).thenReturn("CONFIRMED");
    when(mocks.route(anyString(), anyBoolean())).thenReturn(true);
    when(ai.name()).thenReturn("MOCK");
    when(ai.explain(any())).thenReturn("Explicação demonstrativa.");
    manager = login("gerente1");
    other = login("gerente2");
    operator = login("operador1");
    financial = login("financeiro1");
  }

  String login(String name) throws Exception {
    return body(mvc.perform(
                post("/api/v1/auth/login")
                    .with(
                        r -> {
                          r.setRemoteAddr(UUID.randomUUID().toString());
                          return r;
                        })
                    .contentType("application/json")
                    .content(
                        "{\"email\":\""
                            + name
                            + "@demo.local\",\"password\":\"Only-tests-12345\"}"))
            .andExpect(status().isOk())
            .andReturn())
        .get("accessToken")
        .asText();
  }

  JsonNode body(MvcResult r) throws Exception {
    return json.readTree(r.getResponse().getContentAsString());
  }

  String key() {
    return UUID.randomUUID().toString();
  }

  ResultActions sale(String token, String key, String data) throws Exception {
    return mvc.perform(
        post("/api/v1/sales")
            .header("Authorization", "Bearer " + token)
            .header("Idempotency-Key", key)
            .contentType("application/json")
            .content(data));
  }

  ResultActions getAs(String token, String url) throws Exception {
    return mvc.perform(get(url).header("Authorization", "Bearer " + token));
  }

  long count(String table) {
    return db.queryForObject("SELECT count(*) FROM " + table, Long.class);
  }

  @Test
  void saleReplayConflictRecoveryAndTenant() throws Exception {
    String k = key();
    long before = count("cash_entry");
    var sale = body(sale(manager, k, input).andExpect(status().isCreated()).andReturn());
    var op = sale.get("operation");
    assertThat(op.get("netCents").asLong()).isEqualTo(13200);
    assertThat(op.get("status").asText()).isEqualTo("CONCLUIDA");
    assertThat(op.get("parcels")).hasSize(3);
    var replay =
        body(
            sale(manager, k, input)
                .andExpect(status().isOk())
                .andExpect(header().string("Idempotency-Replayed", "true"))
                .andReturn());
    assertThat(replay).isEqualTo(sale);
    sale(manager, k, input.replace("15000", "16000")).andExpect(status().isConflict());
    assertThat(count("cash_entry")).isEqualTo(before + 1);
    assertThat(
            body(
                getAs(manager, "/api/v1/requests/SALE/" + k)
                    .andExpect(status().isOk())
                    .andReturn()))
        .isEqualTo(sale);
    getAs(other, "/api/v1/requests/SALE/" + k).andExpect(status().isNotFound());
    getAs(other, "/api/v1/split-operations/" + op.get("id").asText())
        .andExpect(status().isNotFound());
    getAs(other, "/api/v1/sales/" + sale.get("id").asText()).andExpect(status().isNotFound());
    getAs(other, "/api/v1/ledger?saleId=" + sale.get("id").asText())
        .andExpect(status().isNotFound());
    verifyHashes(UUID.fromString(op.get("id").asText()));
  }

  void verifyHashes(UUID id) {
    var events =
        db.queryForList("SELECT * FROM ledger_event WHERE operation_id=? ORDER BY sequence", id);
    String previous = "0".repeat(64);
    long sequence = 0;
    for (var e : events) {
      assertThat(e.get("previous_hash")).isEqualTo(previous);
      assertThat(((Number) e.get("sequence")).longValue()).isEqualTo(++sequence);
      String hash =
          Ledger.hash(
              (UUID) e.get("id"),
              id,
              (UUID) e.get("merchant_id"),
              sequence,
              ((java.sql.Timestamp) e.get("occurred_at")).toInstant(),
              (String) e.get("description"),
              previous);
      assertThat(e.get("event_hash")).isEqualTo(hash);
      previous = hash;
    }
  }

  @Test
  void concurrentSaleSameKeyHasOneEffect() throws Exception {
    String k = key();
    long before = count("sale");
    var start = new CountDownLatch(1);
    try (var pool = Executors.newFixedThreadPool(2)) {
      Callable<JsonNode> call =
          () -> {
            start.await();
            return body(sale(manager, k, input).andReturn());
          };
      var a = pool.submit(call);
      var b = pool.submit(call);
      start.countDown();
      assertThat(a.get(20, TimeUnit.SECONDS)).isEqualTo(b.get(20, TimeUnit.SECONDS));
    }
    assertThat(count("sale")).isEqualTo(before + 1);
  }

  @Test
  void partialFailureReprocessPreservesConfirmedParcelAndRule() throws Exception {
    when(mocks.route("FEE", false)).thenReturn(false);
    long before = count("cash_entry");
    var sale = body(sale(manager, key(), input).andExpect(status().isCreated()).andReturn());
    var op = sale.get("operation");
    String id = op.get("id").asText();
    assertThat(op.get("status").asText()).isEqualTo("FALHA");
    assertThat(count("cash_entry")).isEqualTo(before);
    var tax = op.get("parcels").get(0);
    String k = key();
    ResultActions retry =
        mvc.perform(
            post("/api/v1/split-operations/" + id + "/reprocess")
                .header("Authorization", "Bearer " + manager)
                .header("Idempotency-Key", k));
    var done = body(retry.andExpect(status().isOk()).andReturn());
    assertThat(done.get("status").asText()).isEqualTo("CONCLUIDA");
    assertThat(done.get("parcels").get(0)).isEqualTo(tax);
    assertThat(done.get("rule")).isEqualTo(op.get("rule"));
    mvc.perform(
            post("/api/v1/split-operations/" + id + "/reprocess")
                .header("Authorization", "Bearer " + manager)
                .header("Idempotency-Key", key()))
        .andExpect(status().isOk());
    assertThat(count("cash_entry")).isEqualTo(before + 1);
    verify(mocks, never()).route("TAX", true);
    verifyHashes(UUID.fromString(id));
  }

  @Test
  void declinedAndPendingNeverProduceSplit() throws Exception {
    for (String state : List.of("DECLINED", "PENDING")) {
      when(mocks.confirmPayment()).thenReturn(state);
      long before = count("split_operation");
      var s = body(sale(manager, key(), input).andExpect(status().isCreated()).andReturn());
      assertThat(s.get("operation").isNull()).isTrue();
      assertThat(s.get("payment").get("status").asText()).isEqualTo(state);
      assertThat(count("split_operation")).isEqualTo(before);
    }
  }

  @Test
  void missingRulePersistsRecoverableSaleWithoutFakeComposition() throws Exception {
    String k = key();
    var s =
        body(
            sale(manager, k, input.replace("GENERAL", "MISSING"))
                .andExpect(status().isCreated())
                .andReturn());
    assertThat(s.get("operation").isNull()).isTrue();
    assertThat(s.get("failureCode").asText()).isEqualTo("TAX_RULE_UNAVAILABLE");
    getAs(manager, "/api/v1/requests/SALE/" + k).andExpect(status().isOk());
  }

  @Test
  void authRolesValidationAndRevocation() throws Exception {
    mvc.perform(
            post("/api/v1/auth/login")
                .contentType("application/json")
                .content("{\"email\":\"missing@demo.local\",\"password\":\"incorrect\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    getAs(manager, "/api/v1/not-a-route").andExpect(status().isNotFound());
    getAs("invalid", "/api/v1/sales").andExpect(status().isUnauthorized());
    sale(financial, key(), input).andExpect(status().isForbidden());
    getAs(operator, "/api/v1/cash-flow?from=2026-01-01&to=2026-01-31")
        .andExpect(status().isForbidden());
    sale(manager, key(), input.replace("15000", "0")).andExpect(status().isUnprocessableEntity());
    sale(manager, key(), input.replace("15000", "1.5")).andExpect(status().isBadRequest());
    sale(manager, key(), input.replace("15000", "100000001"))
        .andExpect(status().isUnprocessableEntity());
    sale(manager, key(), input.replace("\"currency\"", "\"merchantId\":\"injected\",\"currency\""))
        .andExpect(status().isBadRequest());
    mvc.perform(post("/api/v1/auth/logout").header("Authorization", "Bearer " + manager))
        .andExpect(status().isNoContent());
    getAs(manager, "/api/v1/sales").andExpect(status().isUnauthorized());
  }

  @Test
  void expenseReplayCashAndCrossTenantIsolation() throws Exception {
    LocalDate today = LocalDate.now(ZoneId.of("America/Recife"));
    String period = "?from=" + today + "&to=" + today;
    var before = body(getAs(manager, "/api/v1/cash-flow" + period).andReturn());
    String k = key();
    String expense =
        "{\"description\":\"Reposição\",\"amountCents\":10000,\"categoryId\":\"STOCK\",\"paidOn\":\""
            + today
            + "\"}";
    var created =
        body(
            mvc.perform(
                    post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + manager)
                        .header("Idempotency-Key", k)
                        .contentType("application/json")
                        .content(expense))
                .andExpect(status().isCreated())
                .andReturn());
    mvc.perform(
            post("/api/v1/expenses")
                .header("Authorization", "Bearer " + manager)
                .header("Idempotency-Key", k)
                .contentType("application/json")
                .content(expense))
        .andExpect(status().isOk());
    var after = body(getAs(manager, "/api/v1/cash-flow" + period).andReturn());
    assertThat(after.get("closingCents").asLong())
        .isEqualTo(before.get("closingCents").asLong() - 10000);
    getAs(other, "/api/v1/expenses/" + created.get("id").asText()).andExpect(status().isNotFound());
    getAs(manager, "/api/v1/requests/EXPENSE/" + k).andExpect(status().isOk());
  }

  @Test
  void simulationAndAiFallbackDoNotWriteFinancialData() throws Exception {
    long sales = count("sale"), cash = count("cash_entry"), ledger = count("ledger_event");
    mvc.perform(
            post("/api/v1/split-payment/simulate")
                .header("Authorization", "Bearer " + manager)
                .contentType("application/json")
                .content(
                    "{\"amountCents\":15000,\"includeFee\":false,\"taxCategory\":\"GENERAL\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.amounts.netCents").value(13500));
    when(ai.explain(any())).thenThrow(new IllegalStateException("offline"));
    mvc.perform(
            post("/api/v1/ai/cash-analysis")
                .header("Authorization", "Bearer " + manager)
                .contentType("application/json")
                .content("{\"from\":\"2026-01-01\",\"to\":\"2026-01-31\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("FALLBACK"))
        .andExpect(jsonPath("$.facts").exists());
    assertThat(count("sale")).isEqualTo(sales);
    assertThat(count("cash_entry")).isEqualTo(cash);
    assertThat(count("ledger_event")).isEqualTo(ledger);
  }

  @Test
  void paginationAndDatesAreValidatedAndStable() throws Exception {
    getAs(manager, "/api/v1/split-operations?page=0").andExpect(status().isBadRequest());
    getAs(manager, "/api/v1/sales?size=101").andExpect(status().isBadRequest());
    getAs(manager, "/api/v1/cash-flow?from=2026-02-01&to=2026-01-01")
        .andExpect(status().isBadRequest());
    getAs(manager, "/api/v1/sales?from=2026-01-01").andExpect(status().isBadRequest());
    String id = body(sale(manager, key(), input).andReturn()).get("operation").get("id").asText();
    getAs(manager, "/api/v1/split-operations?search=" + id + "&status=CONCLUIDA&paymentMethod=PIX")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1));
    getAs(other, "/api/v1/split-operations?search=" + id)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(0));
  }

  @Test
  void databaseRejectsHistoryMutationAndCrossTenantReference() throws Exception {
    var s = body(sale(manager, key(), input).andReturn());
    UUID id = UUID.fromString(s.get("operation").get("id").asText());
    assertThatThrownBy(
            () ->
                db.update("UPDATE ledger_event SET description='tamper' WHERE operation_id=?", id))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);
    assertThatThrownBy(() -> db.update("UPDATE split_operation SET net_cents=1 WHERE id=?", id))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    assertThatThrownBy(
            () ->
                db.update(
                    "INSERT INTO cash_entry(id,merchant_id,operation_id,amount_cents,booked_on)"
                        + " VALUES (?,?,?,?,current_date)",
                    UUID.randomUUID(),
                    UUID.fromString("00000000-0000-0000-0000-000000000002"),
                    id,
                    13200))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
  }

  @Test
  void runtimeIsNotMigrationOwnerAndCannotChangeSchema() {
    assertThat(db.queryForObject("SELECT current_user", String.class)).isEqualTo("split_app");
    assertThatThrownBy(() -> db.execute("CREATE TABLE forbidden(id int)"))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);
    assertThatThrownBy(() -> db.update("UPDATE flyway_schema_history SET description='tamper'"))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);
  }

  @Test
  void unexpectedFailureRollsBackWholeLocalAttempt() throws Exception {
    String k = key();
    long sales = count("sale"), cash = count("cash_entry"), events = count("ledger_event");
    when(mocks.route("NET", false))
        .thenThrow(new IllegalStateException("mock interruption before commit"));
    sale(manager, k, input).andExpect(status().isInternalServerError());
    assertThat(count("sale")).isEqualTo(sales);
    assertThat(count("cash_entry")).isEqualTo(cash);
    assertThat(count("ledger_event")).isEqualTo(events);
    getAs(manager, "/api/v1/requests/SALE/" + k).andExpect(status().isNotFound());
    doReturn(true).when(mocks).route("NET", false);
    sale(manager, k, input).andExpect(status().isCreated());
  }

  @Test
  void concurrentReprocessDifferentKeysRecognizesCashOnce() throws Exception {
    when(mocks.route("NET", false)).thenReturn(false);
    var s = body(sale(manager, key(), input).andExpect(status().isCreated()).andReturn());
    String id = s.get("operation").get("id").asText();
    long before = count("cash_entry");
    var start = new CountDownLatch(1);
    try (var pool = Executors.newFixedThreadPool(2)) {
      Callable<JsonNode> call =
          () -> {
            start.await();
            return body(
                mvc.perform(
                        post("/api/v1/split-operations/" + id + "/reprocess")
                            .header("Authorization", "Bearer " + manager)
                            .header("Idempotency-Key", key()))
                    .andExpect(status().isOk())
                    .andReturn());
          };
      var a = pool.submit(call);
      var b = pool.submit(call);
      start.countDown();
      assertThat(a.get(20, TimeUnit.SECONDS)).isEqualTo(b.get(20, TimeUnit.SECONDS));
    }
    assertThat(count("cash_entry")).isEqualTo(before + 1);
  }

  @Test
  void sessionExpiryBodyLimitCorsAndLoginRateLimit() throws Exception {
    db.update(
        "UPDATE auth_session SET expires_at=now()-interval '1 second' WHERE token_hash=?",
        br.com.avanade.split.shared.Hashes.sha256(operator));
    getAs(operator, "/api/v1/sales").andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/v1/sales")
                .header("Authorization", "Bearer " + manager)
                .contentType("application/json")
                .content("x".repeat(16385)))
        .andExpect(status().isPayloadTooLarge());
    mvc.perform(
            options("/api/v1/sales")
                .header("Origin", "http://127.0.0.1:5173")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5173"));
    mvc.perform(
            options("/api/v1/sales")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isForbidden());
    for (int i = 0; i < 20; i++)
      mvc.perform(
              post("/api/v1/auth/login")
                  .with(
                      r -> {
                        r.setRemoteAddr("test-limit");
                        return r;
                      })
                  .contentType("application/json")
                  .content("{}"))
          .andExpect(status().isUnprocessableEntity());
    mvc.perform(
            post("/api/v1/auth/login")
                .with(
                    r -> {
                      r.setRemoteAddr("test-limit");
                      return r;
                    })
                .contentType("application/json")
                .content("{}"))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"));
  }

  @Test
  void laterRuleDoesNotChangeFailedOperationSnapshot() throws Exception {
    String category = "HISTORICAL";
    UUID oldRule = UUID.randomUUID();
    db.update(
        "INSERT INTO tax_rule(id,version,category,tax_bps,fee_bps,valid_from) VALUES (?,?,?,?,?,?)",
        oldRule,
        "test-old-" + key(),
        category,
        1000,
        200,
        java.sql.Timestamp.from(Instant.parse("2000-01-01T00:00:00Z")));
    when(mocks.route("FEE", false)).thenReturn(false);
    var old =
        body(sale(manager, key(), input.replace("GENERAL", category))
                .andExpect(status().isCreated())
                .andReturn())
            .get("operation");
    db.update(
        "INSERT INTO tax_rule(id,version,category,tax_bps,fee_bps,valid_from) VALUES (?,?,?,?,?,?)",
        UUID.randomUUID(),
        "test-new-" + key(),
        category,
        2000,
        300,
        java.sql.Timestamp.from(Instant.parse("2001-01-01T00:00:00Z")));
    var result =
        body(
            mvc.perform(
                    post("/api/v1/split-operations/" + old.get("id").asText() + "/reprocess")
                        .header("Authorization", "Bearer " + manager)
                        .header("Idempotency-Key", key()))
                .andExpect(status().isOk())
                .andReturn());
    assertThat(result.get("rule")).isEqualTo(old.get("rule"));
    assertThat(result.get("netCents").asLong()).isEqualTo(13200);
    var fresh =
        body(
            sale(manager, key(), input.replace("GENERAL", category))
                .andExpect(status().isCreated())
                .andReturn());
    assertThat(fresh.get("operation").get("netCents").asLong()).isEqualTo(11550);
  }

  @Test
  void openApiAvailableInTestOnly() throws Exception {
    var spec =
        body(
            mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/sales']").exists())
                .andReturn());
    assertThat(spec.at("/components/schemas/SaleResponse/properties/operation").isMissingNode())
        .isFalse();
    assertThat(
            spec.at("/components/schemas/SaleResponse/properties/operation/oneOf/1/nullable")
                .asBoolean())
        .isTrue();
    assertReferences(spec, spec);
  }

  void assertReferences(JsonNode root, JsonNode node) {
    if (node.isObject() && node.has("$ref")) {
      String ref = node.get("$ref").asText();
      assertThat(ref).startsWith("#/");
      assertThat(root.at(ref.substring(1)).isMissingNode()).as(ref).isFalse();
    }
    if (node.isContainerNode()) node.forEach(child -> assertReferences(root, child));
  }

  @Test void missingRuleRecoveryKeepsPaymentAndCreatesOnlyOneSplit() throws Exception {
    String category="RECOVERY_"+UUID.randomUUID().toString().replace("-", "").replaceAll("[0-9]", "A").substring(0,20).toUpperCase();
    var created=body(sale(manager,key(),input.replace("GENERAL",category)).andExpect(status().isCreated()).andReturn());
    String id=created.get("id").asText();
    assertThat(created.get("failureCode").asText()).isEqualTo("TAX_RULE_UNAVAILABLE");
    assertThat(created.get("operation").isNull()).isTrue();
    String path="/api/v1/sales/"+id+"/recover-split";
    mvc.perform(post(path).header("Authorization","Bearer "+operator).header("Idempotency-Key",key())).andExpect(status().isForbidden());
    mvc.perform(post(path).header("Authorization","Bearer "+other).header("Idempotency-Key",key())).andExpect(status().isNotFound());
    mvc.perform(post(path).header("Authorization","Bearer "+manager).header("Idempotency-Key",key())).andExpect(status().isConflict());
    db.update("INSERT INTO tax_rule(id,category,version,tax_bps,fee_bps,valid_from) VALUES (?,?,?,?,?,?)", UUID.randomUUID(),category,"RECOVERY-v1",1000,200,java.sql.Timestamp.from(Instant.parse("2020-01-01T00:00:00Z")));
    var executor=Executors.newFixedThreadPool(2);
    try {
      Callable<JsonNode> retry=()->body(mvc.perform(post(path).header("Authorization","Bearer "+manager).header("Idempotency-Key",key())).andExpect(status().isOk()).andReturn());
      var one=executor.submit(retry);var two=executor.submit(retry);
      assertThat(one.get().get("operation").get("id")).isEqualTo(two.get().get("operation").get("id"));
    } finally {executor.shutdownNow();}
    UUID saleId=UUID.fromString(id);
    assertThat(db.queryForObject("SELECT count(*) FROM payment WHERE sale_id=?",Long.class,saleId)).isEqualTo(1);
    assertThat(db.queryForObject("SELECT count(*) FROM split_operation WHERE sale_id=?",Long.class,saleId)).isEqualTo(1);
    assertThat(db.queryForObject("SELECT count(*) FROM cash_entry c JOIN split_operation o ON o.id=c.operation_id WHERE o.sale_id=?",Long.class,saleId)).isEqualTo(1);
    verify(mocks,times(1)).confirmPayment();
  }

  @Test void invalidExplanationFallsBackWithStructuredFacts() throws Exception {
    when(ai.explain(any())).thenReturn("Saldo R$ 999999999999,00");
    mvc.perform(post("/api/v1/ai/cash-analysis").header("Authorization","Bearer "+manager)
      .contentType("application/json").content("{\"from\":\"2026-01-01\",\"to\":\"2026-01-31\"}"))
      .andExpect(status().isOk()).andExpect(jsonPath("status").value("FALLBACK"))
      .andExpect(jsonPath("structured.templateVersion").value("cash-explanation-v2"))
      .andExpect(jsonPath("facts").exists()).andExpect(jsonPath("tendencias").exists());
  }

  @Test void reportsAndSplitExplanationRespectStoreAndDoNotWrite() throws Exception {
    var created=body(sale(manager,key(),input).andExpect(status().isCreated()).andReturn());
    String id=created.get("operation").get("id").asText();
    long before=count("cash_entry");
    getAs(manager,"/api/v1/ai/split-explanation/"+id).andExpect(status().isOk())
      .andExpect(jsonPath("operationId").value(id)).andExpect(jsonPath("origin").value("MOCK"))
      .andExpect(jsonPath("parcels.length()").value(3));
    getAs(other,"/api/v1/ai/split-explanation/"+id).andExpect(status().isNotFound());
    String day=created.get("createdAt").asText().substring(0,10);
    String query="?from="+LocalDate.parse(day).minusDays(1)+"&to="+LocalDate.parse(day).plusDays(1);
    for(String kind:List.of("sales","expenses","taxes")) {
      getAs(manager,"/api/v1/reports/"+kind+query).andExpect(status().isOk()).andExpect(jsonPath("mode").value("SIMULADO"));
      getAs(operator,"/api/v1/reports/"+kind+query).andExpect(status().isForbidden());
    }
    var own=body(getAs(manager,"/api/v1/reports/taxes"+query).andReturn());
    var others=body(getAs(other,"/api/v1/reports/taxes"+query).andReturn());
    assertThat(own.toString()).contains(id);
    assertThat(others.toString()).doesNotContain(id);
    getAs(manager,"/api/v1/reports/sales?from=2026-02-02&to=2026-01-01").andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_PERIOD"));
    assertThat(count("cash_entry")).isEqualTo(before);
  }
}
