package br.com.avanade.split;
import static org.assertj.core.api.Assertions.*;
import br.com.avanade.split.finance.*;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
class InterpretacaoTendenciasTest {
 String explain(Long now, Long old) {
  return InterpretacaoTendencias.explicar(new ServicoIndicadoresETendencias.Comparison(
    new ServicoIndicadoresETendencias.Dates(LocalDate.of(2026,1,1),LocalDate.of(2026,1,2)),
    List.of(new ServicoIndicadoresETendencias.Metric("Entradas",now,old))));
 }
 @Test void absentDataNeverBecomesZeroOrPercentage(){assertThat(explain(null,100L)).contains("dados insuficientes").doesNotContain("%");}
 @Test void zeroBaseIsExplicit(){assertThat(explain(100L,0L)).contains("base anterior é zero").doesNotContain("%"); assertThat(explain(0L,0L)).contains("ambos os períodos têm valor zero");}
 @Test void differencesAreRoundedWithoutForecasts(){assertThat(explain(4L,3L)).contains("aumento de 33,33%");assertThat(explain(50L,100L)).contains("redução de 50,00%").contains("não estabelece causas");}
}
