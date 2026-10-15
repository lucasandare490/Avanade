package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.Period;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

/** Reads all explanation inputs in one snapshot, before contacting a provider. */
@Service
public class ConsultaFatosParaExplicacao {
  private final FinanceService finance;
  private final ServicoIndicadoresETendencias trends;
  public ConsultaFatosParaExplicacao(FinanceService finance, ServicoIndicadoresETendencias trends) {
    this.finance = finance;
    this.trends = trends;
  }
  public record Facts(FinanceService.CashFlow cash, ServicoIndicadoresETendencias.Comparison comparison) {}
  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Facts consultar(Actor actor, Period period) {
    return new Facts(finance.cash(actor, period), trends.compare(actor, period));
  }
}
