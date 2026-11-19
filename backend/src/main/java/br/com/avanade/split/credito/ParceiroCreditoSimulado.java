package br.com.avanade.split.credito;

import br.com.avanade.split.shared.ApiException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * Parceiro de demonstração. Regras fictícias, iguais às da demonstração web:
 * limite de um percentual das entradas líquidas dos últimos 90 dias (múltiplos de
 * R$ 100,00, até R$ 50.000,00), mínimo de R$ 500,00, taxa mensal fixa e 1 a 12
 * parcelas mensais pela tabela Price. Não movimenta dinheiro.
 */
public class ParceiroCreditoSimulado implements ParceiroCredito {
  static final long MINIMO_CENTS = 50_000;
  static final long MAXIMO_CENTS = 5_000_000;
  private final String id;
  private final String nome;
  private final int taxaMensalBp;
  private final int percentualLimite;

  public ParceiroCreditoSimulado(String id, String nome, int taxaMensalBp, int percentualLimite) {
    if (taxaMensalBp < 0 || taxaMensalBp > 1000) throw new IllegalArgumentException("Taxa mensal simulada inválida.");
    if (percentualLimite < 1 || percentualLimite > 100) throw new IllegalArgumentException("Percentual de limite inválido.");
    this.id = id;
    this.nome = nome;
    this.taxaMensalBp = taxaMensalBp;
    this.percentualLimite = percentualLimite;
  }

  @Override public String id() { return id; }

  @Override public String nome() { return nome; }

  @Override public String modo() { return "SIMULADO"; }

  @Override
  public Limite limite(FatosLoja f) {
    long base = Math.max(0, f.entradasLiquidas90dCents()) * percentualLimite / 100;
    long limite = Math.min(MAXIMO_CENTS, base / 10_000 * 10_000);
    if (limite < MINIMO_CENTS)
      return new Limite(0, "Ainda não há vendas suficientes para este parceiro oferecer crédito.");
    return new Limite(limite, null);
  }

  @Override
  public Proposta cotar(FatosLoja f, long valorCents, int parcelas, LocalDate hoje) {
    long limite = limite(f).valorCents();
    if (parcelas < 1 || parcelas > 12) throw new ApiException(422, "INVALID_INSTALLMENTS", "Escolha de 1 a 12 parcelas.");
    if (valorCents < MINIMO_CENTS || valorCents > limite)
      throw new ApiException(422, "AMOUNT_OUT_OF_LIMIT", limite == 0 ? limite(f).motivo() : "Escolha um valor entre R$ 500,00 e o limite disponível.");
    long parcela = parcelaPrice(valorCents, taxaMensalBp, parcelas);
    return new Proposta(valorCents, parcelas, taxaMensalBp, cetAnualBp(taxaMensalBp), parcela, parcela * parcelas, hoje.plusMonths(1));
  }

  @Override public void contratar(Proposta proposta) { /* Simulado: nada é enviado a instituição financeira. */ }

  /** Parcela fixa da tabela Price, arredondada para cima ao centavo. */
  static long parcelaPrice(long valorCents, int taxaMensalBp, int parcelas) {
    if (taxaMensalBp == 0) return (valorCents + parcelas - 1) / parcelas;
    MathContext mc = MathContext.DECIMAL128;
    BigDecimal i = BigDecimal.valueOf(taxaMensalBp).divide(BigDecimal.valueOf(10_000), mc);
    BigDecimal fator = BigDecimal.ONE.add(i).pow(parcelas, mc);
    BigDecimal pmt = BigDecimal.valueOf(valorCents).multiply(i, mc).multiply(fator, mc).divide(fator.subtract(BigDecimal.ONE), mc);
    return pmt.setScale(0, RoundingMode.CEILING).longValueExact();
  }

  /** CET anual estimado (só juros, sem tarifas), em pontos-base. */
  static int cetAnualBp(int taxaMensalBp) {
    BigDecimal i = BigDecimal.valueOf(taxaMensalBp).divide(BigDecimal.valueOf(10_000), MathContext.DECIMAL128);
    return BigDecimal.ONE.add(i).pow(12, MathContext.DECIMAL128).subtract(BigDecimal.ONE)
        .multiply(BigDecimal.valueOf(10_000)).setScale(0, RoundingMode.HALF_UP).intValueExact();
  }
}
