package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.*;
import br.com.avanade.split.finance.FinanceService;
import br.com.avanade.split.shared.Period;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.*;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@org.springframework.test.context.ActiveProfiles("query-test")
@SpringBootTest(properties = {"debug=false", "trace=false"})
@Import({QueryProbe.Configuration.class, QueryAndCashIntegrationTest.Configuration.class})
class QueryAndCashIntegrationTest extends PostgresSupport {
  @Autowired JdbcTemplate db;
  @Autowired Views views;
  @Autowired SaleService sales;
  @Autowired FinanceService finance;
  @Autowired br.com.avanade.split.finance.OperationExport exports;
  @Autowired br.com.avanade.split.finance.AnalyticsService analytics;
  @Autowired MutableClock clock;
  @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
  @Autowired com.fasterxml.jackson.databind.ObjectMapper json;
  @MockitoBean MockAdapters adapters;
  Actor actor, other;

  static class MutableClock extends Clock {
    final AtomicReference<Instant> now =
        new AtomicReference<>(Instant.parse("2026-09-15T15:00:00Z"));

    @Override
    public ZoneId getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(ZoneId zone) {
      return Clock.fixed(instant(), zone);
    }

    @Override
    public Instant instant() {
      return now.get();
    }

    void at(String instant) {
      now.set(Instant.parse(instant));
    }
  }

  @Profile("query-test")
  @TestConfiguration(proxyBeanMethods = false)
  static class Configuration {
    @Bean
    @Primary
    MutableClock mutableClock() {
      return new MutableClock();
    }
  }

  @BeforeEach
  void setup() {
    when(adapters.confirmPayment()).thenReturn("CONFIRMED");
    when(adapters.route(anyString(), anyBoolean())).thenReturn(true);
    clock.at("2026-09-15T15:00:00Z");
    actor = actor();
    other = actor();
  }

  @Test
  void trendsComparePersistedPeriodsAndIsolateMerchants() {
    clock.at("2026-09-14T15:00:00Z"); sale(actor);
    clock.at("2026-09-15T15:00:00Z"); sale(actor); sale(actor); sale(other);
    var p = new Period(LocalDate.parse("2026-09-15"),LocalDate.parse("2026-09-15"));
    var result = analytics.compare(actor,p);
    assertThat(result.anterior().inicio()).isEqualTo(LocalDate.parse("2026-09-14"));
    assertThat(result.indicadores().get(0).atual()).isEqualTo(30000L);
    assertThat(result.indicadores().get(0).anterior()).isEqualTo(15000L);
    assertThat(result.indicadores().get(1).atual()).isEqualTo(26400L);
    assertThat(result.indicadores().get(2).atual()).isNull();
  }

  @Test
  void dashboardFillsEmptyDaysAndExcludesPendingPayments() {
    sale(actor);
    when(adapters.confirmPayment()).thenReturn("PENDING"); sale(actor);
    var p = new Period(LocalDate.parse("2026-09-14"),LocalDate.parse("2026-09-16"));
    var result = analytics.dashboard(actor,p);
    assertThat(result.totals().count()).isEqualTo(1);
    assertThat(result.series()).hasSize(3);
    assertThat(result.series().get(0).grossCents()).isZero();
    assertThat(result.series().get(1).grossCents()).isEqualTo(15000);
    assertThat(result.series().stream().mapToLong(d -> d.netCents()).sum()).isEqualTo(result.totals().netCents());
  }

  @Test
  void emptyTrendsRemainUnknownAndSupportEarliestDate() {
    var result = analytics.compare(actor,new Period(LocalDate.parse("2000-01-01"),LocalDate.parse("2000-01-01")));
    assertThat(result.indicadores()).allSatisfy(m -> {
      assertThat(m.atual()).isNull(); assertThat(m.anterior()).isNull();
    });
  }

  @Test
  void exportIncludesAllPagesAndOnlyAuthorizedMerchant() {
    for(int i=0;i<101;i++) sale(actor);
    sale(other);
    var date=LocalDate.parse("2026-09-15");
    var result=exports.export(actor,date,date,"CONCLUIDA","PIX",null);
    assertThat(result.total()).isEqualTo(101);
    assertThat(result.rows()).hasSize(101);
    assertThat(result.rows().stream().map(row->row.getFirst()).distinct().count()).isEqualTo(101);
    assertThat(result.rows()).allSatisfy(row->{assertThat(row).hasSize(8);assertThat(row.get(7)).isEqualTo("13200");});
    assertThat(exports.export(other,date,date,null,null,null).total()).isEqualTo(1);
    assertThat(exports.export(actor,date,date,"FALHA",null,null).total()).isZero();
    assertThat(exports.export(actor,date.minusDays(1),date.minusDays(1),null,null,null).rows()).isEmpty();
  }
  @Test
  void exportRejectsOperatorAndInvalidPeriod() {
    var operator=new Actor(actor.sessionId(),actor.userId(),actor.merchantId(),actor.name(),actor.merchantName(),actor.timeZone(),"OPERADOR");
    var date=LocalDate.parse("2026-09-15");
    assertThatThrownBy(()->exports.export(operator,date,date,null,null,null)).isInstanceOf(br.com.avanade.split.shared.ApiException.class);
    assertThatThrownBy(()->exports.export(actor,date,date.minusDays(1),null,null,null)).isInstanceOf(br.com.avanade.split.shared.ApiException.class);
  }

  Actor actor() {
    UUID merchant = UUID.randomUUID(), user = UUID.randomUUID();
    db.update(
        "INSERT INTO merchant(id,name,time_zone) VALUES (?,?,?)",
        merchant,
        "Fixture de consulta",
        "America/Recife");
    db.update(
        "INSERT INTO app_user VALUES (?,?,?,?,?,?)",
        user,
        merchant,
        user + "@fixture.local",
        "Fixture sem login",
        "no-login-fixture",
        "GERENTE");
    return new Actor(
        UUID.randomUUID(), user, merchant, "Fixture", "Loja fixture", "America/Recife", "GERENTE");
  }

  @SuppressWarnings("unchecked")
  Map<String, Object> sale(Actor actor) {
    return (Map<String, Object>)
        sales.create(
            actor,
            new SaleService.SaleInput(
                15000L, "BRL", SaleService.PaymentMethod.PIX, "GENERAL", null));
  }

  @SuppressWarnings("unchecked")
  List<Map<String, Object>> items(Map<String, Object> page) {
    return (List<Map<String, Object>>) page.get("items");
  }

  @SuppressWarnings("unchecked")
  Map<String, Object> map(Object value) {
    return (Map<String, Object>) value;
  }

  Map<String, Object> list(boolean sale, int size) {
    return views.list(actor, sale, null, null, null, null, null, 1, size);
  }

  void expense(Actor actor, long cents, LocalDate day, String description) {
    finance.create(actor, new FinanceService.ExpenseInput(description, cents, "STOCK", day));
  }

  @Test
  void pendingWebFilterGroupsAllIntermediateStatesAndKeepsPagination() {
    when(adapters.route(anyString(), anyBoolean())).thenReturn(false);
    for (String state : List.of("CRIADA", "SEPARADA", "ROTEADA")) {
      var v = sale(actor);
      db.update("UPDATE split_operation SET status=? WHERE id=?", state, map(v.get("operation")).get("id"));
    }
    sale(actor); // FALHA must not enter the pending group.
    sale(other); // Another merchant must remain isolated.
    var first = views.list(actor, false, null, null, "PENDENTE", null, null, 1, 2);
    var second = views.list(actor, false, null, null, "PENDENTE", null, null, 2, 2);
    assertThat(first.get("total")).isEqualTo(3L);
    assertThat(items(first)).hasSize(2);
    assertThat(items(second)).hasSize(1);
    var states = new ArrayList<String>();
    items(first).forEach(v -> states.add(v.get("status").toString()));
    items(second).forEach(v -> states.add(v.get("status").toString()));
    assertThat(states).containsExactlyInAnyOrder("CRIADA", "SEPARADA", "ROTEADA");
  }

  @Test
  void operationAndSalePagesUseBoundedQueriesAndKeepCompleteOrderedData() {
    List<Map<String, Object>> expected = new ArrayList<>();
    for (int i = 0; i < 25; i++) expected.add(sale(actor));
    sale(other);
    when(adapters.confirmPayment()).thenReturn("PENDING");
    var pending = sale(actor);
    Map<String, Object> operations, allSales;
    try (var probe = QueryProbe.start()) {
      operations = list(false, 100);
      assertThat(probe.queries).hasSizeLessThanOrEqualTo(5);
    }
    try (var probe = QueryProbe.start()) {
      allSales = list(true, 100);
      assertThat(probe.queries).hasSizeLessThanOrEqualTo(6);
    }
    assertThat(operations.get("total")).isEqualTo(25L);
    assertThat(items(operations)).hasSize(25);
    assertThat(allSales.get("total")).isEqualTo(26L);
    assertThat(items(allSales)).hasSize(26);
    assertThat(items(allSales)).contains(pending);
    assertThat(pending.get("operation")).isNull();
    for (var sale : expected) {
      assertThat(items(allSales)).contains(sale);
      assertThat(items(operations)).contains(map(sale.get("operation")));
    }
    var ids = items(operations).stream().map(r -> r.get("id").toString()).toList();
    assertThat(ids).isSortedAccordingTo(Comparator.reverseOrder());
    var firstPage = views.list(actor, false, null, null, null, null, null, 1, 8);
    var secondPage = views.list(actor, false, null, null, null, null, null, 2, 8);
    assertThat(items(firstPage)).containsExactlyElementsOf(items(operations).subList(0, 8));
    assertThat(items(secondPage)).containsExactlyElementsOf(items(operations).subList(8, 16));
    try (var probe = QueryProbe.start()) {
      list(false, 1);
      assertThat(probe.queries).hasSizeLessThanOrEqualTo(5);
    }
  }

  @Test
  void expensePageHasTwoQueriesAndLiteralSearchAndStableOrder() {
    for (int i = 0; i < 25; i++)
      expense(actor, 100, LocalDate.of(2026, 9, 10), "Reposição %_ " + i);
    expense(other, 999, LocalDate.of(2026, 9, 10), "Reposição %_ outra loja");
    Map<String, Object> page;
    try (var probe = QueryProbe.start()) {
      page = map(finance.list(actor, null, null, "%_", 1, 100));
      assertThat(probe.queries).hasSize(2);
    }
    assertThat(page.get("total")).isEqualTo(25L);
    assertThat(items(page)).hasSize(25);
    assertThat(items(page).stream().map(r -> r.get("id").toString()).toList())
        .isSortedAccordingTo(Comparator.reverseOrder());
    assertThat(map(finance.list(actor, null, null, "no match", 1, 20)).get("total")).isEqualTo(0L);
    assertThat(items(map(finance.list(actor, null, null, null, 100, 20)))).isEmpty();
    for (var item : items(page))
      assertThat(finance.expense(actor, (UUID) item.get("id"))).isEqualTo(item);
  }

  @Test
  void listCountAndRowsStayInSameSnapshotWhenAnotherSaleCommits() {
    sale(actor);
    try (var pool = Executors.newSingleThreadExecutor();
        var probe = QueryProbe.start()) {
      probe.afterFirstMatching(
          sql -> sql.startsWith("select count(*) from split_operation"),
          () -> await(pool.submit(() -> sale(actor))));
      var page = list(false, 100);
      assertThat(page.get("total")).isEqualTo(1L);
      assertThat(items(page)).hasSize(1);
    }
    assertThat(list(false, 100).get("total")).isEqualTo(2L);
  }

  @Test
  void ledgerCountAndRowsStayInSameSnapshotDuringReprocess() {
    when(adapters.route("FEE", false)).thenReturn(false);
    var sale = sale(actor);
    UUID saleId = (UUID) sale.get("id"), opId = (UUID) map(sale.get("operation")).get("id");
    var before = views.ledger(actor, saleId, 1, 100);
    try (var pool = Executors.newSingleThreadExecutor();
        var probe = QueryProbe.start()) {
      probe.afterFirstMatching(
          sql -> sql.startsWith("select count(*) from ledger_event"),
          () -> await(pool.submit(() -> sales.reprocess(actor, opId))));
      assertThat(views.ledger(actor, saleId, 1, 100)).isEqualTo(before);
      assertThat(probe.queries).hasSize(3);
    }
    var after = views.ledger(actor, saleId, 1, 100);
    assertThat((Long) after.get("total")).isGreaterThan((Long) before.get("total"));
    assertThat(items(after)).startsWith(items(before).toArray(Map[]::new));
  }

  @Test
  void cashAndFiltersRespectLocalMidnightOpeningAndNegativeBalance() {
    clock.at("2026-09-01T02:59:59.999999Z");
    sale(actor); // August 31 in Recife.
    expense(actor, 1000, LocalDate.of(2026, 8, 31), "Antes do período");
    clock.at("2026-09-01T03:00:00Z");
    sale(actor);
    clock.at("2026-10-01T02:59:59.999999Z");
    sale(actor); // Still September 30.
    expense(actor, 50000, LocalDate.of(2026, 9, 1), "Despesa paga");
    when(adapters.route("FEE", false)).thenReturn(false);
    sale(actor); // No cash until completed.
    when(adapters.route("FEE", false)).thenReturn(true);
    clock.at("2026-10-01T03:00:00Z");
    sale(actor);
    sale(other);
    var september = new Period(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30));
    var cash = finance.cash(actor, september);
    assertThat(cash.openingCents()).isEqualTo(12200);
    assertThat(cash.inflowCents()).isEqualTo(26400);
    assertThat(cash.expenseCents()).isEqualTo(50000);
    assertThat(cash.closingCents()).isEqualTo(-11400);
    var completed =
        views.list(actor, false, september.from(), september.to(), "CONCLUIDA", "PIX", null, 1, 1);
    assertThat(completed.get("total")).isEqualTo(2L);
    assertThat(items(completed)).hasSize(1);
    finance.list(actor, september.from(), september.to(), null, 1, 1);
    assertThat(finance.cash(actor, september)).isEqualTo(cash);
    var empty =
        finance.cash(actor, new Period(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30)));
    assertThat(empty.openingCents()).isZero();
    assertThat(empty.inflowCents()).isZero();
    assertThat(empty.expenseCents()).isZero();
    assertThat(empty.closingCents()).isZero();
    var otherCash = finance.cash(other, september);
    assertThat(otherCash.closingCents()).isZero();
  }

  @Test
  void ledgerWithoutSplitAndCrossTenantRemainSafe() {
    when(adapters.confirmPayment()).thenReturn("DECLINED");
    UUID id = (UUID) sale(actor).get("id");
    assertThat(items(views.ledger(actor, id, 1, 20))).isEmpty();
    assertThatThrownBy(() -> views.ledger(other, id, 1, 20))
        .isInstanceOf(br.com.avanade.split.shared.ApiException.class)
        .satisfies(
            e -> assertThat(((br.com.avanade.split.shared.ApiException) e).status).isEqualTo(404));
  }

  @Test
  void queryPlansAndBoundedReadsOnSyntheticVolume() throws Exception {
    QueryPerformanceFixture.load(db, transactions, actor, other);
    try (var c = PG.getPostgresDatabase().getConnection();
        var statement = c.createStatement()) {
      for (String table :
          List.of(
              "sale",
              "payment",
              "split_operation",
              "parcel",
              "ledger_event",
              "expense",
              "cash_entry")) statement.execute("ANALYZE " + table);
    }
    Map<String, Object> report = new LinkedHashMap<>();
    report.put(
        "fixture",
        Map.of(
            "merchants",
            2,
            "sales",
            4000,
            "operations",
            4000,
            "parcels",
            12000,
            "ledgerEvents",
            4000,
            "expenses",
            4000,
            "cashEntries",
            8000));
    Map<String, Object> runs = new LinkedHashMap<>();
    try (var probe = QueryProbe.start()) {
      long start = System.nanoTime();
      var page = list(false, 100);
      long millis = (System.nanoTime() - start) / 1000000;
      assertThat(page.get("total")).isEqualTo(2000L);
      assertThat(items(page)).hasSize(100);
      assertThat(probe.queries).hasSizeLessThanOrEqualTo(5);
      runs.put("operations100", Map.of("sqlStatements", probe.queries.size(), "elapsedMs", millis));
    }
    try (var probe = QueryProbe.start()) {
      long start = System.nanoTime();
      var page = list(true, 100);
      long millis = (System.nanoTime() - start) / 1000000;
      assertThat(page.get("total")).isEqualTo(2000L);
      assertThat(items(page)).hasSize(100);
      assertThat(probe.queries).hasSizeLessThanOrEqualTo(6);
      runs.put("sales100", Map.of("sqlStatements", probe.queries.size(), "elapsedMs", millis));
    }
    try (var probe = QueryProbe.start()) {
      long start = System.nanoTime();
      var page = map(finance.list(actor, null, null, null, 1, 100));
      long millis = (System.nanoTime() - start) / 1000000;
      assertThat(page.get("total")).isEqualTo(2000L);
      assertThat(items(page)).hasSize(100);
      assertThat(probe.queries).hasSize(2);
      runs.put("expenses100", Map.of("sqlStatements", probe.queries.size(), "elapsedMs", millis));
    }
    var cash = finance.cash(actor, new Period(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30)));
    assertThat(cash.closingCents()).isEqualTo(2000L * (13200 - 100));
    report.put("pageReads", runs);
    Map<String, Object> plans = new LinkedHashMap<>();
    plans.put(
        "operationsPage",
        json.readTree(
            db.queryForObject(
                "EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT id FROM split_operation WHERE"
                    + " merchant_id=? ORDER BY created_at DESC,id DESC LIMIT 100",
                String.class,
                actor.merchantId())));
    plans.put(
        "expensePage",
        json.readTree(
            db.queryForObject(
                "EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT e.*,c.name FROM expense e JOIN"
                    + " expense_category c ON c.id=e.category_id WHERE e.merchant_id=? ORDER BY"
                    + " e.paid_on DESC,e.id DESC LIMIT 100",
                String.class,
                actor.merchantId())));
    plans.put(
        "cashPeriod",
        json.readTree(
            db.queryForObject(
                "EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT sum(amount_cents) FROM cash_entry"
                    + " WHERE merchant_id=? AND booked_on BETWEEN date '2026-09-01' AND date"
                    + " '2026-09-30'",
                String.class,
                actor.merchantId())));
    report.put("plans", plans);
    java.nio.file.Files.writeString(
        java.nio.file.Path.of("target/query-plans.json"),
        json.writerWithDefaultPrettyPrinter().writeValueAsString(report));
  }

  static void await(Future<?> future) {
    try {
      future.get(15, TimeUnit.SECONDS);
    } catch (Exception e) {
      throw new AssertionError(e);
    }
  }
}
