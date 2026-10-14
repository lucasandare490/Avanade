package br.com.avanade.split;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.file.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

/** Forked exclusively by CrashRecoveryTest. Fault injection never enters the application jar. */
public final class CrashTestServer {
  public static void main(String[] args) {
    SpringApplication.run(new Class<?>[] {SplitApplication.class, FaultConfiguration.class}, args);
  }

  // Explicit source for this child process, deliberately not component-scanned configuration.
  static class FaultConfiguration {
    @Bean
    ApplicationListener<ApplicationReadyEvent> ready(@Value("${test.port-file}") String file) {
      return event -> {
        var context = (ServletWebServerApplicationContext) event.getApplicationContext();
        try {
          Files.writeString(Path.of(file), Integer.toString(context.getWebServer().getPort()));
        } catch (IOException e) {
          throw new IllegalStateException(e);
        }
      };
    }

    @Bean
    FilterRegistrationBean<OncePerRequestFilter> responseFault(
        @Value("${test.crash:false}") boolean crash) {
      var registration = new FilterRegistrationBean<OncePerRequestFilter>();
      registration.setOrder(Integer.MIN_VALUE);
      registration.setFilter(
          new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
              var buffered = new ContentCachingResponseWrapper(response);
              chain.doFilter(request, buffered);
              if (crash
                  && request.getRequestURI().equals("/api/v1/sales")
                  && request.getMethod().equals("POST")
                  && buffered.getStatus() == 201) {
                // The transactional service has returned and committed. No body was copied to the
                // socket.
                Runtime.getRuntime().halt(86);
              }
              buffered.copyBodyToResponse();
            }
          });
      return registration;
    }
  }
}
