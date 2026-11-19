package br.com.avanade.split.credito;

import br.com.avanade.split.auth.Actor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Capital de giro dentro do app (veja CreditoService). Rotas sob /api/v1/credit;
 * todas exigem sessão, e as que autorizam ou mexem em dinheiro exigem gerente.
 */
@RestController
@RequestMapping("/api/v1/credit")
public class CreditoController {
  private final CreditoService credito;

  public CreditoController(CreditoService credito) {
    this.credito = credito;
  }

  public record PedidoOferta(
      @NotNull @Min(1) @Max(100_000_000) Long amountCents,
      @NotNull @Min(1) @Max(12) Integer installments) {}

  @GetMapping
  public Map<String, Object> consultar(@RequestAttribute Actor actor) {
    return credito.consultar(actor);
  }

  @PostMapping("/consent")
  public ResponseEntity<?> consentir(@RequestAttribute Actor actor) {
    return ResponseEntity.status(201).body(credito.consentir(actor));
  }

  @DeleteMapping("/consent")
  public ResponseEntity<Void> revogar(@RequestAttribute Actor actor) {
    credito.revogar(actor);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/offers")
  public ResponseEntity<?> simular(@RequestAttribute Actor actor, @Valid @RequestBody PedidoOferta pedido) {
    return ResponseEntity.status(201).body(credito.simular(actor, pedido.amountCents(), pedido.installments()));
  }

  @PostMapping("/offers/{id}/accept")
  public Map<String, Object> contratar(@RequestAttribute Actor actor, @PathVariable UUID id) {
    return credito.contratar(actor, id);
  }

  @PostMapping("/contracts/{id}/installments/{numero}/pay")
  public Map<String, Object> pagar(@RequestAttribute Actor actor, @PathVariable UUID id, @PathVariable @Min(1) @Max(12) int numero) {
    return credito.pagarParcela(actor, id, numero);
  }

  @GetMapping("/contracts/{id}/payoff")
  public Map<String, Object> cotarQuitacao(@RequestAttribute Actor actor, @PathVariable UUID id) {
    return credito.cotarQuitacao(actor, id);
  }

  @PostMapping("/contracts/{id}/payoff")
  public Map<String, Object> quitar(@RequestAttribute Actor actor, @PathVariable UUID id) {
    return credito.quitar(actor, id);
  }

  @PostMapping("/contracts/{id}/cancel")
  public Map<String, Object> desistir(@RequestAttribute Actor actor, @PathVariable UUID id) {
    return credito.desistir(actor, id);
  }

  @GetMapping("/events")
  public List<Map<String, Object>> eventos(@RequestAttribute Actor actor) {
    return credito.eventos(actor);
  }
}
