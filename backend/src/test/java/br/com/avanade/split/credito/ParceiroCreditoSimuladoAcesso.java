package br.com.avanade.split.credito;

/** Acesso de teste aos cálculos internos do parceiro simulado. */
public final class ParceiroCreditoSimuladoAcesso {
  private ParceiroCreditoSimuladoAcesso() {}
  public static long parcela(long valorCents, int taxaBp, int parcelas) {
    return ParceiroCreditoSimulado.parcelaPrice(valorCents, taxaBp, parcelas);
  }
}
