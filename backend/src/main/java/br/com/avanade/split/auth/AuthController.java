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
  private final int resetMinutes;
  private final boolean exposeResetToken;
  private final String dummy;
  private final SecureRandom random = new SecureRandom();

  public AuthController(
      JdbcTemplate db,
      PasswordEncoder passwords,
      Clock clock,
      @Value("${app.session-minutes}") int minutes,
      @Value("${app.password-reset-minutes:30}") int resetMinutes,
      @Value("${app.password-reset-dev-token:false}") boolean exposeResetToken) {
    this.db = db;
    this.passwords = passwords;
    this.clock = clock;
    this.minutes = minutes;
    if (resetMinutes < 12 || resetMinutes > 72) throw new IllegalArgumentException("Password reset expiry must be between 12 and 72 minutes.");
    this.resetMinutes = resetMinutes;
    this.exposeResetToken = exposeResetToken;
    this.dummy = passwords.encode(UUID.randomUUID().toString());
  }

  public record Login(
      @NotBlank @Email @Size(max = 254) String email, @NotBlank @Size(max = 72) String password) {
    @Override
    public String toString() {
      return "Login[REDACTED]";
    }
  }

  public record Cadastro(
      @NotBlank @Size(max=120) String name,
      @NotBlank @Size(max=120) String merchantName,
      @NotBlank @Email @Size(max=254) String email,
      @NotBlank @Size(min=12,max=72) String password) {
    @Override public String toString() { return "Cadastro[REDACTED]"; }
  }

  public record SolicitarRedefinicao(@NotBlank @Email @Size(max = 254) String email) {}

  public record RedefinirSenha(
      @NotBlank @Size(max = 200) String token,
      @NotBlank @Size(min = 12, max = 72) String password) {}

  @PostMapping("/register")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<?> cadastrar(@Valid @RequestBody Cadastro input) {
    if (input.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new ApiException(422,"VALIDATION_ERROR","A senha deve ter no máximo 72 bytes UTF-8.");
    UUID merchant = UUID.randomUUID();
    try {
      db.update("INSERT INTO merchant(id,name,time_zone) VALUES (?,?,?)",
          merchant,input.merchantName().strip(),"America/Fortaleza");
      db.update("INSERT INTO app_user(id,merchant_id,email,display_name,password_hash,role) VALUES (?,?,?,?,?,?)",
          UUID.randomUUID(),merchant,input.email().strip().toLowerCase(Locale.ROOT),
          input.name().strip(),passwords.encode(input.password()),"GERENTE");
    } catch (org.springframework.dao.DuplicateKeyException e) {
      throw new ApiException(409,"REGISTRATION_CONFLICT","Não foi possível criar a conta com os dados informados. Entre com sua conta existente ou revise o cadastro.");
    }
    return ResponseEntity.status(201).body(Map.of("created",true));
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

  @PostMapping("/password-reset/request")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<?> solicitarRedefinicao(@Valid @RequestBody SolicitarRedefinicao input) {
    String email = input.email().trim().toLowerCase(Locale.ROOT);
    var users = db.queryForList("SELECT id FROM app_user WHERE email=?", email);
    Map<String, Object> resposta = new LinkedHashMap<>();
    resposta.put("accepted", true);
    if (!users.isEmpty()) {
      byte[] bytes = new byte[32];
      random.nextBytes(bytes);
      String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
      Instant created = clock.instant();
      db.update("UPDATE password_reset_token SET used_at=? WHERE user_id=? AND used_at IS NULL",
          java.sql.Timestamp.from(created), users.getFirst().get("id"));
      db.update("INSERT INTO password_reset_token(id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?,?)",
          UUID.randomUUID(), users.getFirst().get("id"), Hashes.sha256(raw),
          java.sql.Timestamp.from(created.plusSeconds(resetMinutes * 60L)), java.sql.Timestamp.from(created));
      // SMTP/e-mail delivery can consume this event later. Never log the raw token.
      if (exposeResetToken) resposta.put("developmentToken", raw);
    }
    return ResponseEntity.accepted().body(resposta);
  }

  @PostMapping("/password-reset/complete")
  @org.springframework.transaction.annotation.Transactional
  public ResponseEntity<?> redefinirSenha(@Valid @RequestBody RedefinirSenha input) {
    if (input.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new ApiException(422, "VALIDATION_ERROR", "A senha deve ter no máximo 72 bytes UTF-8.");
    Instant now = clock.instant();
    var rows = db.queryForList("SELECT id,user_id FROM password_reset_token WHERE token_hash=? AND used_at IS NULL AND expires_at>? FOR UPDATE",
        Hashes.sha256(input.token()), java.sql.Timestamp.from(now));
    if (rows.isEmpty()) throw new ApiException(400, "INVALID_RESET_TOKEN", "O link de recuperação é inválido ou expirou.");
    Object id = rows.getFirst().get("id");
    Object userId = rows.getFirst().get("user_id");
    db.update("UPDATE app_user SET password_hash=? WHERE id=?", passwords.encode(input.password()), userId);
    db.update("UPDATE password_reset_token SET used_at=? WHERE id=?", java.sql.Timestamp.from(now), id);
    db.update("UPDATE auth_session SET revoked=true WHERE user_id=? AND revoked=false", userId);
    return ResponseEntity.noContent().build();
  }
}
