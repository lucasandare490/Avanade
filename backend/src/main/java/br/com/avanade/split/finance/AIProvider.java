package br.com.avanade.split.finance;

public interface AIProvider {
  String explain(FinanceService.CashFlow facts);

  String name();
}
