package br.com.avanade.split.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  SecurityFilterChain security(
      HttpSecurity http,
      SessionFilter filter,
      @org.springframework.beans.factory.annotation.Qualifier("cors")
          CorsConfigurationSource corsSource)
      throws Exception {
    return http.csrf(c -> c.disable())
        .cors(c -> c.configurationSource(corsSource))
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.anyRequest().permitAll())
        .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  FilterRegistrationBean<SessionFilter> disableDoubleRegistration(SessionFilter filter) {
    var bean = new FilterRegistrationBean<>(filter);
    bean.setEnabled(false);
    return bean;
  }

  @Bean
  CorsConfigurationSource cors(@Value("${app.cors-origins}") List<String> origins) {
    var c = new CorsConfiguration();
    c.setAllowedOrigins(origins);
    c.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type", "Idempotency-Key"));
    c.setExposedHeaders(List.of("X-Correlation-Id", "Idempotency-Replayed", "Retry-After"));
    c.setAllowCredentials(false);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", c);
    return source;
  }
}
