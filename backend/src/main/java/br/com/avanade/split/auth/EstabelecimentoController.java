package br.com.avanade.split.auth;
import br.com.avanade.split.shared.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/merchant")
public class EstabelecimentoController {
 private final JdbcTemplate db;
 public EstabelecimentoController(JdbcTemplate db){this.db=db;}
 public record Entrada(@NotBlank @Size(max=120) String name){}
 @GetMapping public Object consultar(@RequestAttribute Actor actor){
  var result=db.queryForMap("SELECT name,time_zone FROM merchant WHERE id=?",actor.merchantId());
  return Map.of("name",result.get("name"),"timeZone",result.get("time_zone"),"canEdit",actor.role().equals("GERENTE"));
 }
 @PostMapping public Object salvar(@RequestAttribute Actor actor,@Valid @RequestBody Entrada input){
  if(!actor.role().equals("GERENTE"))throw new ApiException(403,"FORBIDDEN","Somente o responsável pela loja pode alterar seu nome.");
  db.update("UPDATE merchant SET name=? WHERE id=?",input.name().strip(),actor.merchantId());
  return consultar(actor);
 }
}
