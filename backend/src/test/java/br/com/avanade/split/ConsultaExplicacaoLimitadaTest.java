package br.com.avanade.split;

import br.com.avanade.split.finance.ConsultaExplicacaoLimitada;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import java.util.concurrent.*;

class ConsultaExplicacaoLimitadaTest {
 @Test void returnsResultAndPropagatesFailure() {
  var consulta=new ConsultaExplicacaoLimitada();
  try {
   assertThat(consulta.consultar(()->"Explicação",500)).isEqualTo("Explicação");
   assertThatThrownBy(()->consulta.consultar(()->{throw new IllegalArgumentException("invalid");},500)).isInstanceOf(IllegalStateException.class);
  } finally {consulta.encerrar();}
 }
 @Test void timeoutInterruptsProviderAndFreesCapacity() throws Exception {
  var consulta=new ConsultaExplicacaoLimitada();
  var interrupted=new CountDownLatch(1);
  try {
   assertThatThrownBy(()->consulta.consultar(()->{
    try {new CountDownLatch(1).await();return "late";}
    catch(InterruptedException e){interrupted.countDown();throw e;}
   },100)).isInstanceOf(IllegalStateException.class);
   assertThat(interrupted.await(2,TimeUnit.SECONDS)).isTrue();
   assertThat(consulta.consultar(()->"Disponível",500)).isEqualTo("Disponível");
  } finally {consulta.encerrar();}
 }
}
