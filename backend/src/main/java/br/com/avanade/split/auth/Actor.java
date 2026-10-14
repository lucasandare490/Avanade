package br.com.avanade.split.auth;

import br.com.avanade.split.shared.ApiException;
import java.time.ZoneId;
import java.util.*;

public record Actor(
    UUID sessionId,
    UUID userId,
    UUID merchantId,
    String name,
    String merchantName,
    String timeZone,
    String role) {
  public List<String> permissions() {
    return switch (role) {
      case "GERENTE" -> List.of("consultar", "vender", "financeiro", "despesa", "retomar");
      case "FINANCEIRO" -> List.of("consultar", "financeiro", "despesa");
      default -> List.of("consultar", "vender");
    };
  }

  public void require(String permission) {
    if (!permissions().contains(permission))
      throw new ApiException(403, "FORBIDDEN", "Permissão insuficiente.");
  }

  public ZoneId zone() {
    return ZoneId.of(timeZone);
  }
}
