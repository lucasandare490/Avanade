package br.com.avanade.split.demo;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.*;
import br.com.avanade.split.finance.FinanceService;
import br.com.avanade.split.shared.Idempotency;
import java.time.*;
import java.util.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

/** Somente no source set de desenvolvimento/teste; nunca incluído no JAR distribuído. */
@TestConfiguration
public class ConfiguracaoCenarioCompleto {
 public static class RelogioCenario extends Clock {
  private final ThreadLocal<Instant> fixed = new ThreadLocal<>();
  public void fixed(Instant value){if(value==null) fixed.remove(); else fixed.set(value);}
  public ZoneId getZone(){return ZoneOffset.UTC;}
  public Clock withZone(ZoneId zone){return fixed.get()==null?Clock.system(zone):Clock.fixed(fixed.get(),zone);}
  public Instant instant(){return fixed.get()==null?Instant.now():fixed.get();}
 }
 public static class ProcessamentoCenario implements PaymentAdapter, SplitPaymentAdapter {
  final ThreadLocal<String> payment=ThreadLocal.withInitial(()->"CONFIRMED"),fail=ThreadLocal.withInitial(()->"NONE");
  public String confirmPayment(){return payment.get();}
  public boolean route(String kind,boolean retry){return retry||!kind.equals(fail.get());}
 }
 @Bean @Primary RelogioCenario relogioCenario(){return new RelogioCenario();}
 @Bean @Primary ProcessamentoCenario processamentoCenario(){return new ProcessamentoCenario();}
 @Bean @org.springframework.core.annotation.Order(100)
 ApplicationRunner popularCenario(JdbcTemplate db, ServicoRegistroVenda sales, FinanceService finance,
     Idempotency idempotency, RelogioCenario clock, ProcessamentoCenario processor){
  return args->{
   try {
    for(int shop=1;shop<=2;shop++){
     final int store=shop;
     Actor actor=db.queryForObject("SELECT u.id,u.merchant_id,m.name,m.time_zone FROM app_user u JOIN merchant m ON m.id=u.merchant_id WHERE u.email=? AND u.role='GERENTE'",(rs,n)->new Actor(UUID.randomUUID(),rs.getObject("id",UUID.class),rs.getObject("merchant_id",UUID.class),"Gerente sintético",rs.getString("name"),rs.getString("time_zone"),"GERENTE"),"gerente"+shop+"@demo.local");
     String[] states={"CONFIRMED","DECLINED","PENDING","CONFIRMED"};
     for(int i=0;i<states.length;i++){
      processor.payment.set(states[i]);processor.fail.set(i==3?"FEE":"NONE");
      clock.fixed(Instant.parse(i<2?"2026-10-01T15:00:00Z":"2026-10-08T15:00:00Z"));
      var input=new ServicoRegistroVenda.SaleInput(15000L+store*1000+i*100,"BRL",ServicoRegistroVenda.PaymentMethod.PIX,"GENERAL","CENARIO-SINTETICO-v1");
      idempotency.execute(actor,"SALE","demo-dataset-v1-sale-"+store+"-"+i,input,()->sales.create(actor,input));
     }
     clock.fixed(Instant.parse("2026-10-15T15:00:00Z"));
     for(int i=0;i<2;i++){
      var input=new FinanceService.ExpenseInput("Despesa sintética de apresentação "+(i+1),2000L+store*100,"OPERATING",LocalDate.parse(i==0?"2026-10-01":"2026-10-08"));
      idempotency.execute(actor,"EXPENSE","demo-dataset-v1-expense-"+store+"-"+i,input,()->finance.create(actor,input));
     }
    }
   } finally {clock.fixed(null);processor.payment.remove();processor.fail.remove();}
  };
 }
}
