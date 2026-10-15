package br.com.avanade.split.finance;
import br.com.avanade.split.auth.Actor;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/exports")
public class OperationExportController {
  private final OperationExport exports;
  public OperationExportController(OperationExport exports) {this.exports=exports;}
  @GetMapping("/operations")
  public OperationExport.ExportFile operations(@RequestAttribute Actor actor,@RequestParam LocalDate from,@RequestParam LocalDate to,
      @RequestParam(required=false) String status,@RequestParam(required=false) String paymentMethod,@RequestParam(required=false) String search) {
    return exports.export(actor,from,to,status,paymentMethod,search);
  }
}
