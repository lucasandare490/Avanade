package br.com.avanade.split.finance;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class RelatoriosFinanceirosController {
 private final JdbcTemplate db;
 public RelatoriosFinanceirosController(JdbcTemplate db){this.db=db;}
 @GetMapping("/{kind}")
 @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
 public OperationExport.ExportFile report(@RequestAttribute Actor actor,@PathVariable String kind,@RequestParam LocalDate from,@RequestParam LocalDate to){
  actor.require("financeiro");var period=new br.com.avanade.split.shared.Period(from,to);
  List<Map<String,Object>> records;List<String> columns;List<String> fields;
  switch(kind){
   case "expenses":
    records=db.queryForList("SELECT e.id,e.paid_on,e.description,c.name category,e.amount_cents FROM expense e JOIN expense_category c ON c.id=e.category_id WHERE e.merchant_id=? AND e.paid_on BETWEEN ? AND ? ORDER BY e.paid_on,e.id LIMIT 2001",actor.merchantId(),java.sql.Date.valueOf(from),java.sql.Date.valueOf(to));
    columns=List.of("Despesa","Pagamento","Descrição","Categoria","Valor (centavos BRL)");fields=List.of("id","paid_on","description","category","amount_cents");break;
   case "sales":
    records=db.queryForList("SELECT s.id,s.created_at,s.payment_method,p.status,s.amount_cents FROM sale s JOIN payment p ON p.sale_id=s.id AND p.merchant_id=s.merchant_id WHERE s.merchant_id=? AND s.created_at>=? AND s.created_at<? ORDER BY s.created_at,s.id LIMIT 2001",actor.merchantId(),period.start(actor.zone()),period.end(actor.zone()));
    columns=List.of("Venda","Criação","Meio","Pagamento","Bruto (centavos BRL)");fields=List.of("id","created_at","payment_method","status","amount_cents");break;
   case "taxes":
    records=db.queryForList("SELECT id,completed_at,rule_version,gross_cents,tax_cents,fee_cents,net_cents FROM split_operation WHERE merchant_id=? AND status='CONCLUIDA' AND completed_at>=? AND completed_at<? ORDER BY completed_at,id LIMIT 2001",actor.merchantId(),period.start(actor.zone()),period.end(actor.zone()));
    columns=List.of("Split","Conclusão","Regra histórica","Bruto (centavos BRL)","Tributo (centavos BRL)","Taxa (centavos BRL)","Líquido (centavos BRL)");fields=List.of("id","completed_at","rule_version","gross_cents","tax_cents","fee_cents","net_cents");break;
   default:throw ApiException.missing();
  }
  if(records.size()>2000)throw new ApiException(422,"EXPORT_LIMIT","Reduza o período para até 2000 registros. Nenhum relatório parcial foi gerado.");
  var rows=records.stream().map(row->fields.stream().map(field->{var value=row.get(field);return value instanceof java.sql.Timestamp t?t.toInstant().toString():Objects.toString(value,"");}).toList()).toList();
  return new OperationExport.ExportFile(columns,rows,rows.size(),"SIMULADO");
 }
}
