package br.com.avanade.split.shared;
import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
class ApiErrorsTest {
 @Test void transientConflictReturnsRecoverableErrorWithoutSql() {
  var request=new MockHttpServletRequest();request.setAttribute("correlationId","synthetic-id");
  var result=new ApiErrors().transientDatabase(new org.springframework.dao.CannotAcquireLockException("secret SQL"),request);
  assertThat(result.getStatusCode().value()).isEqualTo(503);
  assertThat(result.getBody().code()).isEqualTo("DATABASE_BUSY");
  assertThat(result.getBody().message()).doesNotContain("secret SQL").contains("mesma chave");
  assertThat(result.getBody().correlationId()).isEqualTo("synthetic-id");
 }
}
