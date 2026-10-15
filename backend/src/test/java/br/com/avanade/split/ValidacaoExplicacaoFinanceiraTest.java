package br.com.avanade.split;
import br.com.avanade.split.finance.ValidacaoExplicacaoFinanceira;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
class ValidacaoExplicacaoFinanceiraTest {
 @Test void acceptsKnownAmountsIncludingNegativeBalance() {
  assertThat(ValidacaoExplicacaoFinanceira.validar("Entradas de R$ 100,00 e saldo de R$ -50,00.",10000,-5000)).contains("-50,00");
 }
 @Test void rejectsInventedAmountsAndUnsafeContent() {
  for(String texto:new String[]{"Saldo R$ 999,00", "<script>ação</script>","Visite https://example.invalid", "Lucro garantido de 90%", ""})
   assertThatThrownBy(()->ValidacaoExplicacaoFinanceira.validar(texto,10000)).isInstanceOf(IllegalArgumentException.class);
 }
}
