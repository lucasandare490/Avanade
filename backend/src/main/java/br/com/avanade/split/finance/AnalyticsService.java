package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.Period;
import br.com.avanade.split.shared.ApiException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

/** Aggregates persisted simulated operations; never extrapolates missing periods. */
@Service
public class AnalyticsService {
  private final JdbcTemplate db;
  public AnalyticsService(JdbcTemplate db) { this.db=db; }
  public record Totals(long count,long grossCents,long taxCents,long feeCents,long netCents) {}
  public record Day(LocalDate date,long grossCents,long taxCents,long feeCents,long netCents) {}
  public record Metric(String titulo,Long atual,Long anterior) {}
  public record Dates(LocalDate inicio,LocalDate fim) {}
  public record Comparison(Dates anterior,List<Metric> indicadores) {}
  public record Dashboard(Period period,String timeZone,Totals totals,List<Day> series,String recognition) {}
  private long safe(Object v) {
    long n=new java.math.BigDecimal(v.toString()).longValueExact();
    if(n<0 || n>9007199254740991L) throw new ApiException(422,"AGGREGATE_LIMIT","Agregado excede limite numérico.");
    return n;
  }
  public Totals totals(Actor actor,Period p) {
    var r=db.queryForMap("SELECT count(*) n,COALESCE(sum(gross_cents),0) g,COALESCE(sum(tax_cents),0) t,COALESCE(sum(fee_cents),0) f,COALESCE(sum(net_cents),0) l FROM split_operation WHERE merchant_id=? AND status='CONCLUIDA' AND completed_at>=? AND completed_at<?",actor.merchantId(),p.start(actor.zone()),p.end(actor.zone()));
    return new Totals(safe(r.get("n")),safe(r.get("g")),safe(r.get("t")),safe(r.get("f")),safe(r.get("l")));
  }
  @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
  public Dashboard dashboard(Actor actor,Period p) {
    var rows=db.queryForList("SELECT (completed_at AT TIME ZONE ?)::date AS business_day, sum(gross_cents) g,sum(tax_cents) t,sum(fee_cents) f,sum(net_cents) l FROM split_operation WHERE merchant_id=? AND status='CONCLUIDA' AND completed_at>=? AND completed_at<? GROUP BY business_day ORDER BY business_day",actor.timeZone(),actor.merchantId(),p.start(actor.zone()),p.end(actor.zone()));
    Map<LocalDate,Day> days=new HashMap<>();
    for(var r:rows) { LocalDate day=((java.sql.Date)r.get("business_day")).toLocalDate(); days.put(day,new Day(day,safe(r.get("g")),safe(r.get("t")),safe(r.get("f")),safe(r.get("l")))); }
    var series=p.from().datesUntil(p.to().plusDays(1)).map(d->days.getOrDefault(d,new Day(d,0,0,0,0))).toList();
    return new Dashboard(p,actor.timeZone(),totals(actor,p),series,"COMPLETED_AT_IN_MERCHANT_TIME_ZONE");
  }
  private Long expenses(Actor actor,Period p) {
    var r=db.queryForMap("SELECT count(*) n,COALESCE(sum(amount_cents),0) value FROM expense WHERE merchant_id=? AND paid_on BETWEEN ? AND ?",actor.merchantId(),java.sql.Date.valueOf(p.from()),java.sql.Date.valueOf(p.to()));
    return safe(r.get("n"))==0?null:safe(r.get("value"));
  }
  @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
  public Comparison compare(Actor actor,Period p) {
    long days=ChronoUnit.DAYS.between(p.from(),p.to())+1;
    LocalDate start=p.from().minusDays(days),end=p.from().minusDays(1);
    var now=totals(actor,p);
    // Before the supported history boundary there is no comparable source data.
    boolean available=!start.isBefore(LocalDate.of(2000,1,1));
    var prior=available?new Period(start,end):null;
    var old=available?totals(actor,prior):new Totals(0,0,0,0,0);
    return new Comparison(new Dates(start,end),List.of(
      new Metric("Vendas brutas concluídas",now.count()==0?null:now.grossCents(),old.count()==0?null:old.grossCents()),
      new Metric("Entradas líquidas",now.count()==0?null:now.netCents(),old.count()==0?null:old.netCents()),
      new Metric("Despesas pagas",expenses(actor,p),available?expenses(actor,prior):null)));
  }
}
