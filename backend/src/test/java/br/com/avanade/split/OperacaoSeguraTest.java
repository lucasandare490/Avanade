package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import br.com.avanade.split.config.SessionFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OperacaoSeguraTest {
 @Test void metricsNeverUseRawPathOrSecretsAndMdcIsCleared() throws Exception {
  var metrics=new SimpleMeterRegistry();
  var filter=new SessionFilter(mock(JdbcTemplate.class),new ObjectMapper(),java.time.Clock.systemUTC(),metrics);
  var request=new MockHttpServletRequest("GET","/api/v1/sales/private-id");
  request.setQueryString("password=private-secret");
  var response=new MockHttpServletResponse();
  filter.doFilter(request,response,(q,s)->{throw new AssertionError("Unauthenticated request continued");});
  assertThat(response.getStatus()).isEqualTo(401);
  var timer=metrics.get("planner.http.requests").tag("route","unmatched").tag("status","401").timer();
  assertThat(timer.count()).isEqualTo(1);
  assertThat(timer.getId().toString()).doesNotContain("private-id","private-secret");
  assertThat(org.slf4j.MDC.get("correlationId")).isNull();
 }
 @Test void authenticationDatabaseOutageIsNotInvalidCredentials() throws Exception {
  var db=mock(JdbcTemplate.class);
  doThrow(new org.springframework.dao.DataAccessResourceFailureException("private SQL password")).when(db).query(anyString(),any(org.springframework.jdbc.core.RowMapper.class),any(Object[].class));
  var metrics=new SimpleMeterRegistry();
  var filter=new SessionFilter(db,new ObjectMapper(),java.time.Clock.systemUTC(),metrics);
  var request=new MockHttpServletRequest("GET","/api/v1/sales");
  request.addHeader("Authorization","Bearer "+"a".repeat(43));
  var response=new MockHttpServletResponse();
  filter.doFilter(request,response,(q,s)->{throw new AssertionError("Failed database request continued");});
  assertThat(response.getStatus()).isEqualTo(503);
  assertThat(response.getContentAsString()).contains("DATABASE_UNAVAILABLE").doesNotContain("private SQL","password");
  assertThat(metrics.get("planner.http.requests").tag("status","503").timer().count()).isEqualTo(1);
 }
}
