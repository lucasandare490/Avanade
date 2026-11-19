package br.com.avanade.split.credito;

import java.time.LocalDate;

/**
 * Ponto de integração com a fintech ou o banco parceiro. Para ativar um parceiro
 * real, basta criar outra implementação (ex.: chamada HTTP à API do parceiro) e
 * selecioná-la com app.credit.partner. O resto do sistema não muda.
 * Veja documentacao/INTEGRACAO-PARCEIRO-CREDITO.md.
 */
public interface ParceiroCredito {
  /** Dados agregados que o comerciante autorizou compartilhar (nada de clientes). */
  record FatosLoja(long entradasLiquidas90dCents, long despesas90dCents, long vendas90d) {}

  /** Limite disponível; motivo explica quando é zero. */
  record Limite(long valorCents, String motivo) {}

  record Proposta(
      long valorCents,
      int parcelas,
      int taxaMensalBp,
      int cetAnualBp,
      long parcelaCents,
      long totalCents,
      LocalDate primeiroVencimento) {}

  /** Identificador estável do parceiro (usado no webhook e nos registros). */
  String id();

  /** Nome exibido ao comerciante. */
  String nome();

  /** SIMULADO (sem dinheiro) ou REAL (parceiro autorizado). */
  String modo();

  Limite limite(FatosLoja fatos);

  Proposta cotar(FatosLoja fatos, long valorCents, int parcelas, LocalDate hoje);

  /** Confirma a contratação com o parceiro. No simulado, só registra. */
  void contratar(Proposta proposta);
}
