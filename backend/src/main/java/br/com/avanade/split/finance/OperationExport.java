package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.Views;
import br.com.avanade.split.shared.ApiException;
import br.com.avanade.split.shared.Period;
import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
public class OperationExport {
  private final Views views;
  public OperationExport(Views views) { this.views=views; }
  public record ExportFile(List<String> columns,List<List<String>> rows,int total,String mode) {}
  @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
  public ExportFile export(Actor actor,LocalDate from,LocalDate to,String status,String method,String search) {
    actor.require("financeiro");
    new Period(from,to);
    List<List<String>> rows=new ArrayList<>();
    int total=0;
    for(int page=1;page<=20;page++) {
      var result=views.list(actor,false,from,to,status,method,search,page,100);
      long count=((Number)result.get("total")).longValue();
      if(count>2000) throw new ApiException(422,"EXPORT_LIMIT","Reduza o período ou os filtros para até 2000 operações.");
      total=Math.toIntExact(count);
      @SuppressWarnings("unchecked") var items=(List<Map<String,Object>>)result.get("items");
      for(var item:items) rows.add(List.of(
        item.get("id").toString(),item.get("createdAt").toString(),item.get("status").toString(),item.get("paymentMethod").toString(),
        item.get("grossCents").toString(),item.get("taxCents").toString(),item.get("feeCents").toString(),item.get("netCents").toString()));
      if(rows.size()>=total) break;
    }
    if(rows.size()!=total) throw new IllegalStateException("Incomplete export");
    return new ExportFile(List.of("Operação","Criação UTC","Status","Meio","Bruto (centavos BRL)","Tributo (centavos BRL)","Taxa (centavos BRL)","Líquido (centavos BRL)"),rows,total,"SIMULADO");
  }
}
