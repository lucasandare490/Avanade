package br.com.avanade.split.shared;

public class ApiException extends RuntimeException {
  public final int status;
  public final String code;
  /** Tentativas de login restantes antes do bloqueio temporário; nulo quando não se aplica. */
  public final Integer remainingAttempts;
  /** Segundos até o fim do bloqueio temporário; nulo quando não há bloqueio. */
  public final Integer retryAfterSeconds;

  public ApiException(int status, String code, String message) {
    this(status, code, message, null, null);
  }

  public ApiException(
      int status, String code, String message, Integer remainingAttempts, Integer retryAfterSeconds) {
    super(message);
    this.status = status;
    this.code = code;
    this.remainingAttempts = remainingAttempts;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  public static ApiException missing() {
    return new ApiException(404, "NOT_FOUND", "Registro não encontrado.");
  }
}
