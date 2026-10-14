package br.com.avanade.split.core;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "split_operation")
public class Operation {
  @Id public UUID id;

  @Column(nullable = false)
  public UUID saleId;

  @Column(nullable = false)
  public UUID merchantId;

  @Column(nullable = false)
  public UUID ruleId;

  @Column(nullable = false, length = 60)
  public String ruleVersion;

  public int taxBps;
  public int feeBps;
  public long grossCents;
  public long taxCents;
  public long feeCents;
  public long netCents;

  @Column(nullable = false, length = 20)
  public String status;

  @Column(nullable = false)
  public Instant createdAt;

  public Instant completedAt;

  protected Operation() {}

  public static Operation create(
      UUID sale, UUID merchant, TaxEngine.Rule rule, TaxEngine.Amounts amounts, Instant now) {
    Operation o = new Operation();
    o.id = UUID.randomUUID();
    o.saleId = sale;
    o.merchantId = merchant;
    o.ruleId = rule.id();
    o.ruleVersion = rule.version();
    o.taxBps = rule.taxBps();
    o.feeBps = rule.feeBps();
    o.grossCents = amounts.grossCents();
    o.taxCents = amounts.taxCents();
    o.feeCents = amounts.feeCents();
    o.netCents = amounts.netCents();
    o.status = "CRIADA";
    o.createdAt = now;
    return o;
  }
}
