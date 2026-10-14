package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;

import br.com.avanade.split.core.TaxEngine;
import org.junit.jupiter.api.Test;

class TaxEngineTest {
  @Test
  void documentedComposition() {
    assertThat(TaxEngine.calculate(15000, 1000, 200))
        .isEqualTo(new TaxEngine.Amounts(15000, 1500, 300, 13200));
  }

  @Test
  void withoutFee() {
    assertThat(TaxEngine.calculate(15000, 1000, 0).netCents()).isEqualTo(13500);
  }

  @Test
  void limitsAndRounding() {
    assertThat(TaxEngine.calculate(1, 1000, 200)).isEqualTo(new TaxEngine.Amounts(1, 0, 0, 1));
    assertThat(TaxEngine.calculate(1, 5000, 5000)).isEqualTo(new TaxEngine.Amounts(1, 1, 0, 0));
    assertThat(TaxEngine.calculate(100000000, 1000, 200).netCents()).isEqualTo(88000000);
    assertThatThrownBy(() -> TaxEngine.calculate(-1, 1000, 200))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> TaxEngine.calculate(10, 9000, 2000))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void compositionAlwaysConservesCents() {
    for (long gross = 1; gross <= 10000; gross++) {
      var a = TaxEngine.calculate(gross, 1733, 277);
      assertThat(a.taxCents() + a.feeCents() + a.netCents()).isEqualTo(gross);
      assertThat(a.netCents()).isNotNegative();
    }
  }
}
