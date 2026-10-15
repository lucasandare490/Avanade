package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.Views;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.web.bind.annotation.*;

/** Explanations derived from authorized historical facts; no financial writes. */
@RestController
@RequestMapping("/api/v1/ai")
public class ExplicacaoSplitController {
 private final Views views;
 public ExplicacaoSplitController(Views views){this.views=views;}
 private String money(Object value){return "R$ "+BigDecimal.valueOf(((Number)value).longValue(),2).toPlainString().replace('.',',');}
 @GetMapping("/split-explanation/{id}")
 public Object explicar(@RequestAttribute Actor actor,@PathVariable UUID id){
  actor.require("consultar");
  var operation=views.operation(actor,id);
  String status=operation.get("status").toString();
  String summary="Nesta venda de "+money(operation.get("grossCents"))+", a composição demonstrativa separa "+money(operation.get("taxCents"))+" para tributo, "+money(operation.get("feeCents"))+" para taxa e "+money(operation.get("netCents"))+" para o estabelecimento. ";
  summary+=status.equals("CONCLUIDA")?"Todas as parcelas foram confirmadas no simulador; o líquido foi reconhecido no caixa.":"O split ainda não foi concluído. O líquido desta operação ainda não foi reconhecido no caixa.";
  return Map.of("operationId",id,"text",summary,"origin","MOCK","templateVersion","split-explanation-v1",
    "rule",operation.get("rule"),"parcels",operation.get("parcels"),"limitations",List.of("Separação simulada; não comprova transferência nem recolhimento fiscal.","A regra histórica desta operação é preservada mesmo quando a configuração muda."));
 }
}
