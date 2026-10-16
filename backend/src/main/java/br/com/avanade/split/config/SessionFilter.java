package br.com.avanade.split.config;

import br.com.avanade.split.auth.*;
import br.com.avanade.split.shared.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.Clock;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SessionFilter extends OncePerRequestFilter {
  private final JdbcTemplate db;
  private final ObjectMapper json;
  private final Clock clock;
  private final io.micrometer.core.instrument.MeterRegistry metrics;
  private final Map<String, Window> windows = new HashMap<>();

  private record Window(long minute, int count) {}

  public SessionFilter(JdbcTemplate db, ObjectMapper json, Clock clock, io.micrometer.core.instrument.MeterRegistry metrics) {
    this.db = db;
    this.json = json;
    this.clock = clock;
    this.metrics = metrics;
  }

  private synchronized boolean allow(String key, int max) {
    long minute = clock.millis() / 60000;
    windows.entrySet().removeIf(e -> e.getValue().minute() != minute);
    Window old = windows.getOrDefault(key, new Window(minute, 0));
    if (old.count() >= max || (windows.size() >= 10000 && !windows.containsKey(key))) return false;
    windows.put(key, new Window(minute, old.count() + 1));
    return true;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String correlation = UUID.randomUUID().toString();
    req.setAttribute("correlationId", correlation);
    res.setHeader("X-Correlation-Id", correlation);
    res.setHeader("Cache-Control", "no-store");
    long started = System.nanoTime();
    boolean escaped = false;
    org.slf4j.MDC.put("correlationId", correlation);
    try {
      String path = req.getRequestURI();
      if (path.startsWith("/api/") && !req.getMethod().equals("OPTIONS")) {
        boolean login = (path.equals("/api/v1/auth/login") || path.equals("/api/v1/auth/register")) && req.getMethod().equals("POST");
        if (!allow((login ? "login:" : "api:") + req.getRemoteAddr(), login ? 20 : 600)) {
          res.setHeader("Retry-After", "60");
          throw new ApiException(429, "RATE_LIMITED", "Aguarde antes de tentar novamente.");
        }
        if (req.getContentLengthLong() > 16384)
          throw new ApiException(413, "PAYLOAD_TOO_LARGE", "Corpo excede 16 KiB.");
        if (!login) {
          String h = req.getHeader("Authorization");
          if (h == null || !h.matches("Bearer [A-Za-z0-9_-]{43}")) throw unauthorized();
          var actors =
              db.query(
                  """
                  SELECT s.id session_id,u.id user_id,u.merchant_id,u.display_name,u.role,m.name,m.time_zone
                  FROM auth_session s JOIN app_user u ON u.id=s.user_id JOIN merchant m ON m.id=u.merchant_id
                  WHERE s.token_hash=? AND NOT s.revoked AND s.expires_at>?
                  """,
                  (r, n) ->
                      new Actor(
                          r.getObject("session_id", UUID.class),
                          r.getObject("user_id", UUID.class),
                          r.getObject("merchant_id", UUID.class),
                          r.getString("display_name"),
                          r.getString("name"),
                          r.getString("time_zone"),
                          r.getString("role")),
                  Hashes.sha256(h.substring(7)),
                  java.sql.Timestamp.from(clock.instant()));
          if (actors.isEmpty()) throw unauthorized();
          req.setAttribute("actor", actors.getFirst());
        }
      }
      if (path.startsWith("/api/") && req.getMethod().equals("POST")) {
        byte[] body = req.getInputStream().readNBytes(16385);
        if (body.length > 16384)
          throw new ApiException(413, "PAYLOAD_TOO_LARGE", "Corpo excede 16 KiB.");
        chain.doFilter(new LimitedBody(req, body), res);
      } else chain.doFilter(req, res);
    } catch (ApiException e) {
      res.setStatus(e.status);
      res.setContentType("application/json");
      json.writeValue(
          res.getOutputStream(),
          new ApiErrors.Error(e.code, e.getMessage(), Map.of(), correlation));
    } catch (org.springframework.dao.DataAccessException e) {
      res.setStatus(503);
      res.setContentType("application/json");
      json.writeValue(res.getOutputStream(), new ApiErrors.Error("DATABASE_UNAVAILABLE",
          "Serviço temporariamente indisponível. Tente novamente mais tarde.", Map.of(), correlation));
    } catch (ServletException | IOException | RuntimeException e) {
      escaped = true;
      throw e;
    } finally {
      try {
        if (req.getRequestURI().startsWith("/api/")) {
          Object pattern = req.getAttribute(org.springframework.web.servlet.HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
          String route = pattern instanceof String ? (String) pattern : "unmatched";
          String method = Set.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD").contains(req.getMethod()) ? req.getMethod() : "OTHER";
          int status = escaped ? 500 : res.getStatus();
          long elapsed = System.nanoTime() - started;
          io.micrometer.core.instrument.Timer.builder("planner.http.requests").tags("route", route, "method", method, "status", Integer.toString(status)).register(metrics).record(elapsed, java.util.concurrent.TimeUnit.NANOSECONDS);
          org.slf4j.LoggerFactory.getLogger(getClass()).atInfo().addKeyValue("route", route)
              .addKeyValue("method", method).addKeyValue("status", status)
              .addKeyValue("durationMs", elapsed / 1_000_000).log("api_request_completed");
        }
      } finally { org.slf4j.MDC.remove("correlationId"); }
    }
  }

  private ApiException unauthorized() {
    return new ApiException(401, "UNAUTHORIZED", "Sessão inválida ou expirada.");
  }
}
