package br.com.avanade.split.credito;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Parceiros simulados para demonstração e testes: uma fintech com limite maior e
 * taxa maior, e um banco com limite menor e taxa menor, para o comerciante comparar.
 * Um parceiro real entra como outro @Bean que implementa ParceiroCredito, com
 * app.credit.partner apontando para ele (veja INTEGRACAO-PARCEIRO-CREDITO.md).
 */
@Configuration
@ConditionalOnProperty(name = "app.credit.partner", havingValue = "simulado", matchIfMissing = true)
public class ParceirosCreditoConfig {
  @Bean
  ParceiroCredito fintechDemonstrativa(@Value("${app.credit.simulated-monthly-rate-bp:249}") int taxa) {
    return new ParceiroCreditoSimulado("fintech-demo", "Fintech demonstrativa", taxa, 50);
  }

  @Bean
  ParceiroCredito bancoDemonstrativo(@Value("${app.credit.simulated-bank-monthly-rate-bp:189}") int taxa) {
    return new ParceiroCreditoSimulado("banco-demo", "Banco demonstrativo", taxa, 30);
  }
}
