package br.com.avanade.split.finance;
import br.com.avanade.split.auth.Actor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.text.Normalizer;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/ai")
public class SugestaoCategoriaController {
 private final JdbcTemplate db;
 public SugestaoCategoriaController(JdbcTemplate db){this.db=db;}
 public record Entrada(@NotBlank @Size(max=240) String description){}
 @PostMapping("/expense-category")
 public Object sugerir(@RequestAttribute Actor actor,@Valid @RequestBody Entrada input){
  actor.require("despesa");
  String text=Normalizer.normalize(input.description(),Normalizer.Form.NFD).replaceAll("\\p{M}","").toLowerCase(Locale.ROOT);
  Set<String> matches=new HashSet<>();
  if(text.matches(".*\\b(estoque|mercadoria|reposicao|produto|produtos)\\b.*"))matches.add("STOCK");
  if(text.matches(".*\\b(servico|servicos|manutencao|consultoria|reparo)\\b.*"))matches.add("SERVICES");
  if(text.matches(".*\\b(aluguel|energia|internet|agua|telefone)\\b.*"))matches.add("OPERATING");
  List<Map<String,Object>> categories=matches.size()==1?db.queryForList("SELECT id,name FROM expense_category WHERE id=?",matches.iterator().next()):List.of();
  return Map.of("origin","MOCK","version","expense-category-v1","suggestions",categories,"requiresConfirmation",true,"explanation",categories.isEmpty()?"Descrição ambígua ou sem correspondência. Escolha a categoria manualmente.":"Sugestão demonstrativa por palavras-chave. Revise e confirme a categoria; nada foi salvo.");
 }
}
