package br.com.avanade.split.shared;

import java.time.*;
import java.time.temporal.ChronoUnit;

public record Period(LocalDate from, LocalDate to) {
  public Period {
    if (from == null
        || to == null
        || from.isAfter(to)
        || ChronoUnit.DAYS.between(from, to) > 365
        || from.isBefore(LocalDate.of(2000, 1, 1))
        || to.isAfter(LocalDate.of(2100, 12, 31)))
      throw new ApiException(
          400, "INVALID_PERIOD", "Informe um período válido de até 366 dias, entre 2000 e 2100.");
  }

  public java.sql.Timestamp start(ZoneId zone) {
    return java.sql.Timestamp.from(from.atStartOfDay(zone).toInstant());
  }

  public java.sql.Timestamp end(ZoneId zone) {
    return java.sql.Timestamp.from(to.plusDays(1).atStartOfDay(zone).toInstant());
  }
}
