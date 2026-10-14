package br.com.avanade.split.shared;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiErrors {
  public record Error(
      String code, String message, Map<String, String> fieldErrors, String correlationId) {}

  @ExceptionHandler(ApiException.class)
  ResponseEntity<Error> domain(ApiException e, HttpServletRequest r) {
    return body(e.status, e.code, e.getMessage(), Map.of(), r);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Error> validation(MethodArgumentNotValidException e, HttpServletRequest r) {
    Map<String, String> fields = new TreeMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
    return body(422, "VALIDATION_ERROR", "Revise os campos informados.", fields, r);
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    MethodArgumentTypeMismatchException.class,
    MissingRequestHeaderException.class,
    MissingServletRequestParameterException.class
  })
  ResponseEntity<Error> malformed(Exception e, HttpServletRequest r) {
    return body(400, "INVALID_REQUEST", "Requisição inválida.", Map.of(), r);
  }

  @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
  ResponseEntity<Error> notFound(Exception e, HttpServletRequest r) {
    return body(404, "NOT_FOUND", "Rota não encontrada.", Map.of(), r);
  }

  @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
  ResponseEntity<Error> method(Exception e, HttpServletRequest r) {
    return body(405, "METHOD_NOT_ALLOWED", "Método não permitido.", Map.of(), r);
  }

  @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
  ResponseEntity<Error> media(Exception e, HttpServletRequest r) {
    return body(415, "UNSUPPORTED_MEDIA_TYPE", "Use application/json.", Map.of(), r);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Error> unexpected(Exception e, HttpServletRequest r) {
    LoggerFactory.getLogger(getClass())
        .error(
            "request_failed correlationId={} type={}",
            r.getAttribute("correlationId"),
            e.getClass().getSimpleName());
    return body(
        500,
        "INTERNAL_ERROR",
        "Não foi possível concluir. Consulte a intenção antes de reenviar.",
        Map.of(),
        r);
  }

  private ResponseEntity<Error> body(
      int status, String code, String msg, Map<String, String> fields, HttpServletRequest r) {
    return ResponseEntity.status(status)
        .body(new Error(code, msg, fields, String.valueOf(r.getAttribute("correlationId"))));
  }
}
