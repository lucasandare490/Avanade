package br.com.avanade.split.finance;

import java.math.*;

/** Deterministic narrative: no causal claims, forecasts or division by zero. */
public final class InterpretacaoTendencias {
 private InterpretacaoTendencias() {}
 public static String explicar(ServicoIndicadoresETendencias.Comparison comparison){
  StringBuilder text=new StringBuilder(" Comparação com o período de "+comparison.anterior().inicio()+" a "+comparison.anterior().fim()+": ");
  for(var metric:comparison.indicadores()){
   text.append(metric.titulo()).append(": ");
   if(metric.atual()==null || metric.anterior()==null) text.append("dados insuficientes em um dos períodos; não foi calculada variação. ");
   else if(metric.anterior()==0) text.append(metric.atual()==0?"ambos os períodos têm valor zero. ":"a base anterior é zero; a variação percentual não se aplica. ");
   else {
    var difference=BigDecimal.valueOf(metric.atual()).subtract(BigDecimal.valueOf(metric.anterior()));
    var percent=difference.multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(metric.anterior()),2,RoundingMode.HALF_UP);
    text.append(percent.signum()==0?"sem variação":percent.signum()>0?"aumento de "+percent.abs().toPlainString().replace('.',',')+"%":"redução de "+percent.abs().toPlainString().replace('.',',')+"%").append(". ");
   }
  }
  return text.append("A comparação descreve registros passados; não estabelece causas nem garante resultados futuros.").toString();
 }
}
