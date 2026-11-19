package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/planning")
public class PlanejamentoController {
 private final FinanceService finance;
 private final Clock clock;
 private final br.com.avanade.split.credito.CreditoController credito;
 public PlanejamentoController(FinanceService finance,Clock clock,br.com.avanade.split.credito.CreditoController credito){this.finance=finance;this.clock=clock;this.credito=credito;}
 public record Entrada(@NotNull LocalDate until,@NotNull @Min(0) @Max(100000000) Long incomeCents,@NotNull @Min(0) @Max(100000000) Long expenseCents){}
 @PostMapping("/projection")
 public Object projetar(@RequestAttribute Actor actor,@Valid @RequestBody Entrada input){
  actor.require("financeiro");
  var today=LocalDate.now(clock.withZone(actor.zone()));
  if(!input.until().isAfter(today)||input.until().isAfter(today.plusDays(366)))
   throw new ApiException(422,"INVALID_HORIZON","Escolha uma data futura, até 366 dias a partir de hoje.");
  var cash=finance.cash(actor,new br.com.avanade.split.shared.Period(today,today));
  // Capital de giro contratado entra como dinheiro recebido; parcelas que vencem até a data saem.
  var impacto=credito.impacto(actor,input.until());
  long balance=Math.subtractExact(Math.addExact(Math.subtractExact(Math.addExact(cash.closingCents(),impacto.creditoCents()),impacto.parcelasCents()),input.incomeCents()),input.expenseCents());
  if(Math.abs(balance)>9007199254740991L) throw new ApiException(422,"AGGREGATE_LIMIT","Resultado excede o limite numérico.");
  String attention=balance<0?"DEFICIT":balance==0?"SEM_MARGEM":"POSITIVO";
  String text=balance<0?"As despesas previstas superam o saldo realizado e as entradas informadas. Revise o planejamento.":balance==0?"O cenário termina sem reserva. Acompanhe mudanças nas entradas e despesas.":"O cenário informado termina positivo. Isso não garante que as entradas previstas serão recebidas.";
  var r=new java.util.LinkedHashMap<String,Object>();
  r.put("asOf",today);r.put("until",input.until());r.put("openingCents",cash.closingCents());
  r.put("incomeCents",input.incomeCents());r.put("expenseCents",input.expenseCents());
  r.put("creditCents",impacto.creditoCents());r.put("installmentsDueCents",impacto.parcelasCents());
  r.put("projectedCents",balance);r.put("attention",attention);
  r.put("explanation",impacto.creditoCents()>0?text+" Inclui o capital de giro contratado (simulado) e as parcelas que vencem até a data.":text);
  r.put("assumption","Cenário informado pelo usuário, sem extrapolação automática. Não altera o caixa realizado.");
  r.put("origin","MOCK");
  return r;
 }
}
