package br.com.avanade.split.auth;

import br.com.avanade.split.shared.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final JdbcTemplate db;
  private final PasswordEncoder passwords;
  private final Clock clock;
  private final int minutes;
  private final String dummy;
  private final SecureRandom random = new SecureRandom();

  public AuthController(
      JdbcTemplate db,
      PasswordEncoder passwords,
      Clock clock,
      @Value("${app.session-minutes}") int minutes) {
    this.db = db;
    this.passwords = passwords;
    this.clock = clock;
    this.minutes = minutes;
    this.dummy = passwords.encode(UUID.randomUUID().toString());
  }

  public record Login(
      @NotBlank @Email @Size(max = 254) String email, @NotBlank @Size(max = 72) String password) {
    @Override
    public String toString() {
      return "Login[REDACTED]";
    }
  }

  @PostMapping("/login")
  public Map<String, Object> login(@Valid @RequestBody Login input) {
    if (input.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new ApiException(422, "VALIDATION_ERROR", "Senha excede 72 bytes UTF-8.");
    var users =
        db.queryForList(
            "SELECT u.*,m.name merchant_name,m.time_zone FROM app_user u JOIN merchant m ON"
                + " m.id=u.merchant_id WHERE u.email=?",
            input.email().trim().toLowerCase(Locale.ROOT));
    boolean valid =
        passwords.matches(
            input.password(),
            users.isEmpty() ? dummy : (String) users.getFirst().get("password_hash"));
    if (!valid || users.isEmpty())
      throw new ApiException(401, "INVALID_CREDENTIALS", "Credenciais inválidas.");
    var u = users.getFirst();
    byte[] bytes = new byte[32];
    random.nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    UUID session = UUID.randomUUID();
    Instant expiry = clock.instant().plusSeconds(minutes * 60L);
    db.update(
        "INSERT INTO auth_session(id,user_id,token_hash,expires_at) VALUES (?,?,?,?)",
        session,
        u.get("id"),
        Hashes.sha256(token),
        java.sql.Timestamp.from(expiry));
    Actor actor =
        new Actor(
            session,
            (UUID) u.get("id"),
            (UUID) u.get("merchant_id"),
            (String) u.get("display_name"),
            (String) u.get("merchant_name"),
            (String) u.get("time_zone"),
            (String) u.get("role"));
    return Map.of(
        "sessionId",
        session,
        "user",
        Map.of("id", actor.userId(), "name", actor.name()),
        "merchant",
        Map.of(
            "id", actor.merchantId(), "name", actor.merchantName(), "timeZone", actor.timeZone()),
        "permissions",
        actor.permissions(),
        "expiresAt",
        expiry,
        "accessToken",
        token,
        "tokenType",
        "Bearer");
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestAttribute Actor actor) {
    db.update("UPDATE auth_session SET revoked=true WHERE id=?", actor.sessionId());
    return ResponseEntity.noContent().build();
  }
}
