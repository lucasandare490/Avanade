package br.com.avanade.split;
import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.ApplicationContext;
@SpringBootTest(classes={SplitApplication.class,br.com.avanade.split.demo.ConfiguracaoCenarioCompleto.class})
class CenarioCompletoTest extends PostgresSupport {
 @Autowired JdbcTemplate db;
 @Autowired ApplicationContext context;
 @Test void mixedSeedIsIdempotentAndNormalClockAndPaymentAreRestored() throws Exception {
  for(int shop=1;shop<=2;shop++) {
   var id=java.util.UUID.fromString("00000000-0000-0000-0000-00000000000"+shop);
   assertThat(db.queryForObject("SELECT count(*) FROM request_intent WHERE merchant_id=? AND request_key LIKE 'demo-dataset-v1-%'",Long.class,id)).isEqualTo(6);
  }
  long sales=db.queryForObject("SELECT count(*) FROM sale",Long.class);
  long cash=db.queryForObject("SELECT count(*) FROM cash_entry",Long.class);
  context.getBean("popularCenario",org.springframework.boot.ApplicationRunner.class).run(new org.springframework.boot.DefaultApplicationArguments());
  assertThat(db.queryForObject("SELECT count(*) FROM sale",Long.class)).isEqualTo(sales);
  assertThat(db.queryForObject("SELECT count(*) FROM cash_entry",Long.class)).isEqualTo(cash);
  assertThat(db.queryForObject("SELECT count(*) FROM payment p JOIN sale s ON s.id=p.sale_id WHERE p.status='PENDING' AND s.pos_device_id='CENARIO-SINTETICO-v1'",Long.class)).isGreaterThanOrEqualTo(2);
  for(String state: java.util.List.of("CONFIRMED","DECLINED","PENDING")) {
   long expected=state.equals("CONFIRMED")?4:2;
   assertThat(db.queryForObject("SELECT count(*) FROM payment p JOIN sale s ON s.id=p.sale_id WHERE p.status=? AND s.pos_device_id='CENARIO-SINTETICO-v1'",Long.class,state)).isEqualTo(expected);
  }
  for(String state: java.util.List.of("CONCLUIDA","FALHA"))
   assertThat(db.queryForObject("SELECT count(*) FROM split_operation o JOIN sale s ON s.id=o.sale_id WHERE o.status=? AND s.pos_device_id='CENARIO-SINTETICO-v1'",Long.class,state)).isEqualTo(2);
  assertThat(db.queryForObject("SELECT count(DISTINCT paid_on) FROM expense WHERE description LIKE 'Despesa sintética de apresentação %'",Long.class)).isEqualTo(2);
  assertThat(context.getBean(br.com.avanade.split.core.PaymentAdapter.class).confirmPayment()).isEqualTo("CONFIRMED");
  assertThat(java.time.Duration.between(context.getBean(java.time.Clock.class).instant(),java.time.Instant.now()).abs().getSeconds()).isLessThan(5);
 }
}
