package br.com.avanade.split.finance;

import org.springframework.stereotype.Component;

@Component
public class MockAIProvider implements AIProvider {
  public String name() {
    return "MOCK";
  }

  public String explain(FinanceService.CashFlow f) {
    return "Explicação demonstrativa: no período de "
        + f.period().from()
        + " a "
        + f.period().to()
        + ", as entradas líquidas foram "
        + money(f.inflowCents())
        + ", as despesas pagas foram "
        + money(f.expenseCents())
        + " e o saldo final foi "
        + money(f.closingCents())
        + ". Apenas splits concluídos compõem as entradas. Esta análise não é uma projeção.";
  }

  private String money(long cents) {
    return "R$ " + java.math.BigDecimal.valueOf(cents, 2).toPlainString().replace('.', ',');
  }
}
