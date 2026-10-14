package br.com.avanade.split.config;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.*;
import java.util.*;

/** Public response schemas; field names mirror Views/FinanceService contract and smoke fixtures. */
public final class ApiSchemas {
  private ApiSchemas() {}

  public record PublicUser(UUID id, String name) {}

  public record PublicMerchant(UUID id, String name, String timeZone) {}

  public record Session(
      UUID sessionId,
      PublicUser user,
      PublicMerchant merchant,
      List<String> permissions,
      Instant expiresAt,
      String accessToken,
      String tokenType) {}

  public record Payment(UUID id, String status) {}

  public record RuleSnapshot(UUID id, String version, int taxBps, int feeBps, String rounding) {}

  public record Parcel(
      UUID id,
      String kind,
      long amountCents,
      String destination,
      String status,
      @Schema(nullable = true) Instant confirmedAt) {}

  public record Event(
      UUID id,
      long sequence,
      Instant occurredAt,
      String description,
      String previousHash,
      String hash) {}

  public record OperationResponse(
      UUID id,
      UUID saleId,
      Instant createdAt,
      @Schema(nullable = true) Instant completedAt,
      long grossCents,
      long taxCents,
      long feeCents,
      long netCents,
      String status,
      String paymentStatus,
      String paymentMethod,
      String mode,
      String currency,
      RuleSnapshot rule,
      List<Parcel> parcels,
      List<Event> events) {}

  public record SaleResponse(
      UUID id,
      long amountCents,
      String currency,
      String paymentMethod,
      Instant createdAt,
      String mode,
      Payment payment,
      @Schema(nullable = true) String failureCode,
      @Schema(nullable = true) OperationResponse operation) {}

  public record ExpenseResponse(
      UUID id,
      String description,
      long amountCents,
      String categoryId,
      String categoryName,
      LocalDate paidOn,
      Instant createdAt) {}

  public record Category(String id, String name) {}

  public record SalePage(List<SaleResponse> items, long total, int page, int size) {}

  public record OperationPage(List<OperationResponse> items, long total, int page, int size) {}

  public record ExpensePage(List<ExpenseResponse> items, long total, int page, int size) {}

  public record EventPage(List<Event> items, long total, int page, int size) {}

  public record Simulation(
      boolean simulation,
      String mode,
      String currency,
      br.com.avanade.split.core.TaxEngine.Rule rule,
      boolean includeFee,
      br.com.avanade.split.core.TaxEngine.Amounts amounts) {}

  public record Analysis(
      br.com.avanade.split.shared.Period period,
      String text,
      String origin,
      String provider,
      String status,
      br.com.avanade.split.finance.FinanceService.CashFlow facts) {}
}
