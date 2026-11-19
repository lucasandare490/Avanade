package br.com.avanade.split.credito;

import br.com.avanade.split.shared.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Avisos do parceiro real (pagamento de parcela, quitação). Desligado enquanto
 * CREDIT_WEBHOOK_SECRET não estiver configurado. Cada chamada precisa da
 * assinatura HMAC-SHA256 do corpo (header X-Planner-Signature: sha256=<hex>),
 * comparada em tempo constante, e de um eventId único (reenvios são ignorados).
 */
@RestController
@RequestMapping("/api/v1/credit/webhook")
public class CreditoWebhookController {
  private final JdbcTemplate db;
  private final CreditoService credito;
  private final Clock clock;
  private final byte[] segredo;
  private final ObjectMapper json = new ObjectMapper();

  public CreditoWebhookController(JdbcTemplate db, CreditoService credito, Clock clock,
      @Value("${app.credit.webhook-secret:}") String segredo) {
    this.db = db;
    this.credito = credito;
    this.clock = clock;
    if (!segredo.isBlank() && segredo.length() < 32)
      throw new IllegalArgumentException("CREDIT_WEBHOOK_SECRET precisa de pelo menos 32 caracteres.");
    this.segredo = segredo.getBytes(StandardCharsets.UTF_8);
  }

  static String assinar(byte[] segredo, String corpo) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(segredo, "HmacSHA256"));
      return "sha256=" + HexFormat.of().formatHex(mac.doFinal(corpo.getBytes(StandardCharsets.UTF_8)));
    } catch (java.security.GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  @PostMapping("/{parceiroId}")
  @Transactional
  public ResponseEntity<?> receber(@PathVariable String parceiroId,
      @RequestHeader(value = "X-Planner-Signature", required = false) String assinatura,
      @RequestBody String corpo) throws Exception {
    if (segredo.length == 0) throw new ApiException(404, "NOT_FOUND", "Rota não encontrada.");
    byte[] esperado = assinar(segredo, corpo).getBytes(StandardCharsets.UTF_8);
    if (assinatura == null || !MessageDigest.isEqual(esperado, assinatura.getBytes(StandardCharsets.UTF_8)))
      throw new ApiException(401, "INVALID_SIGNATURE", "Assinatura inválida.");
    credito.parceiro(parceiroId);
    JsonNode e = json.readTree(corpo);
    String eventId = e.path("eventId").asText("");
    String tipo = e.path("type").asText("");
    if (!eventId.matches("[A-Za-z0-9_.:-]{8,100}")) throw new ApiException(422, "VALIDATION_ERROR", "eventId inválido.");
    int novos = db.update("INSERT INTO credit_webhook_event(event_id,partner,received_at) VALUES (?,?,?) ON CONFLICT DO NOTHING",
        eventId, parceiroId, java.sql.Timestamp.from(clock.instant()));
    if (novos == 0) return ResponseEntity.ok(Map.of("status", "DUPLICADO"));
    UUID contratoId;
    try {
      contratoId = UUID.fromString(e.path("contractId").asText(""));
    } catch (IllegalArgumentException ex) {
      throw new ApiException(422, "VALIDATION_ERROR", "contractId inválido.");
    }
    var rows = db.queryForList(
        "SELECT c.* FROM credit_contract c JOIN credit_offer o ON o.id=c.offer_id WHERE c.id=? AND o.partner=? FOR UPDATE",
        contratoId, parceiroId);
    if (rows.isEmpty()) throw ApiException.missing();
    var c = rows.getFirst();
    switch (tipo) {
      case "INSTALLMENT_PAID" -> credito.marcarPaga(c, e.path("installmentNumber").asInt(0), null);
      default -> throw new ApiException(422, "VALIDATION_ERROR", "Tipo de evento não suportado.");
    }
    credito.evento((UUID) c.get("merchant_id"), contratoId, null, "WEBHOOK_" + tipo, Map.of("eventId", eventId, "partner", parceiroId));
    return ResponseEntity.ok(Map.of("status", "PROCESSADO"));
  }
}
