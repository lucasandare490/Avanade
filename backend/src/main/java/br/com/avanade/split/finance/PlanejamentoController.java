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
 public PlanejamentoController(FinanceService finance,Clock clock){this.finance=finance;this.clock=clock;}
 public record Entrada(@NotNull LocalDate until,@NotNull @Min(0) @Max(100000000) Long incomeCents,@NotNull @Min(0) @Max(100000000) Long expenseCents){}
 @PostMapping("/projection")
 public Object projetar(@RequestAttribute Actor actor,@Valid @RequestBody Entrada input){
  actor.require("financeiro");
  var today=LocalDate.now(clock.withZone(actor.zone()));
  if(!input.until().isAfter(today)||input.until().isAfter(today.plusDays(366)))
   throw new ApiException(422,"INVALID_HORIZON","Escolha uma data futura, até 366 dias a partir de hoje.");
  var cash=finance.cash(actor,new br.com.avanade.split.shared.Period(today,today));
  long balance=Math.subtractExact(Math.addExact(cash.closingCents(),input.incomeCents()),input.expenseCents());
  if(Math.abs(balance)>9007199254740991L) throw new ApiException(422,"AGGREGATE_LIMIT","Resultado excede o limite numérico.");
  String attention=balance<0?"DEFICIT":balance==0?"SEM_MARGEM":"POSITIVO";
  String text=balance<0?"As despesas previstas superam o saldo realizado e as entradas informadas. Revise o planejamento.":balance==0?"O cenário termina sem reserva. Acompanhe mudanças nas entradas e despesas.":"O cenário informado termina positivo. Isso não garante que as entradas previstas serão recebidas.";
  return Map.of("asOf",today,"until",input.until(),"openingCents",cash.closingCents(),"incomeCents",input.incomeCents(),"expenseCents",input.expenseCents(),"projectedCents",balance,"attention",attention,"explanation",text,"assumption","Cenário informado pelo usuário, sem extrapolação automática. Não altera o caixa realizado.","origin","MOCK");
 }
}
