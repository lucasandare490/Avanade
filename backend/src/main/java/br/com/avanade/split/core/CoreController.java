package br.com.avanade.split.core;

import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.shared.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class CoreController {
  private final SaleService sales;
  private final Views views;
  private final Idempotency intents;

  public CoreController(SaleService sales, Views views, Idempotency intents) {
    this.sales = sales;
    this.views = views;
    this.intents = intents;
  }

  @PostMapping("/sales")
  public ResponseEntity<?> create(
      @RequestAttribute Actor actor,
      @RequestHeader("Idempotency-Key") String key,
      @Valid @RequestBody SaleService.SaleInput input) {
    actor.require("vender");
    var r = intents.execute(actor, "SALE", key, input, () -> sales.create(actor, input));
    return response(r, 201);
  }

  @GetMapping("/sales/{id}")
  public Object sale(@RequestAttribute Actor actor, @PathVariable UUID id) {
    actor.require("consultar");
    return views.sale(actor, id);
  }

  @GetMapping("/split-operations/{id}")
  public Object detail(@RequestAttribute Actor actor, @PathVariable UUID id) {
    actor.require("consultar");
    return views.operation(actor, id);
  }

  @GetMapping({"/sales", "/split-operations"})
  public Object list(
      @RequestAttribute Actor actor,
      jakarta.servlet.http.HttpServletRequest request,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String paymentMethod,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size) {
    actor.require("consultar");
    return views.list(
        actor,
        request.getRequestURI().endsWith("/sales"),
        from,
        to,
        status,
        paymentMethod,
        search,
        page,
        size);
  }

  @PostMapping("/split-operations/{id}/reprocess")
  public ResponseEntity<?> reprocess(
      @RequestAttribute Actor actor,
      @PathVariable UUID id,
      @RequestHeader("Idempotency-Key") String key) {
    actor.require("retomar");
    return response(
        intents.execute(
            actor,
            "REPROCESS:" + id,
            key,
            Map.of("operationId", id),
            () -> sales.reprocess(actor, id)),
        200);
  }

  @GetMapping("/requests/{action}/{key}")
  public Object recover(
      @RequestAttribute Actor actor, @PathVariable String action, @PathVariable String key) {
    return intents.recover(actor, action, key);
  }

  @GetMapping("/ledger")
  public Object ledger(
      @RequestAttribute Actor actor,
      @RequestParam UUID saleId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size) {
    actor.require("consultar");
    return views.ledger(actor, saleId, page, size);
  }

  public static ResponseEntity<?> response(Idempotency.Result r, int created) {
    return ResponseEntity.status(r.replayed() ? 200 : created)
        .header("Idempotency-Replayed", Boolean.toString(r.replayed()))
        .body(r.body());
  }
}
