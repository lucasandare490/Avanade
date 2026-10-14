package br.com.avanade.split;

import java.lang.reflect.*;
import java.sql.*;
import java.util.*;
import java.util.function.Predicate;
import javax.sql.DataSource;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.datasource.DelegatingDataSource;

/** Counts SQL executed on the current test thread, below JDBC templates and repositories. */
final class QueryProbe implements AutoCloseable {
  private static final ThreadLocal<QueryProbe> CURRENT = new ThreadLocal<>();
  final List<String> queries = new ArrayList<>();
  private Predicate<String> predicate;
  private Runnable hook;

  static QueryProbe start() {
    if (CURRENT.get() != null) throw new IllegalStateException("Nested probe");
    var probe = new QueryProbe();
    CURRENT.set(probe);
    return probe;
  }

  void afterFirstMatching(Predicate<String> predicate, Runnable hook) {
    this.predicate = predicate;
    this.hook = hook;
  }

  private void completed(String sql) {
    String normalized = sql.replaceAll("\\s+", " ").strip().toLowerCase(Locale.ROOT);
    if (!normalized.startsWith("select")) return;
    queries.add(normalized);
    if (hook != null && predicate.test(normalized)) {
      var run = hook;
      hook = null;
      run.run();
    }
  }

  @Override
  public void close() {
    CURRENT.remove();
  }

  private static Object invoke(Object target, Method method, Object[] args) throws Throwable {
    try {
      return method.invoke(target, args);
    } catch (InvocationTargetException e) {
      throw e.getCause();
    }
  }

  private static Connection connection(Connection target) {
    return (Connection)
        Proxy.newProxyInstance(
            QueryProbe.class.getClassLoader(),
            new Class<?>[] {Connection.class},
            (proxy, method, args) -> {
              Object result = invoke(target, method, args);
              if (method.getName().equals("prepareStatement")
                  && result instanceof PreparedStatement statement) {
                String sql = (String) args[0];
                return Proxy.newProxyInstance(
                    QueryProbe.class.getClassLoader(),
                    new Class<?>[] {PreparedStatement.class},
                    (p, m, a) -> {
                      Object output = invoke(statement, m, a);
                      if (m.getName().equals("executeQuery") || m.getName().equals("execute")) {
                        var probe = CURRENT.get();
                        if (probe != null) probe.completed(sql);
                      }
                      return output;
                    });
              }
              return result;
            });
  }

  @org.springframework.context.annotation.Profile("query-test")
  @TestConfiguration(proxyBeanMethods = false)
  static class Configuration {
    @Bean
    static BeanPostProcessor recordingDataSource() {
      return new BeanPostProcessor() {
        @Override
        public Object postProcessAfterInitialization(Object bean, String name) {
          if (!name.equals("dataSource") || !(bean instanceof DataSource dataSource)) return bean;
          return new DelegatingDataSource(dataSource) {
            @Override
            public Connection getConnection() throws SQLException {
              return connection(super.getConnection());
            }

            @Override
            public Connection getConnection(String user, String password) throws SQLException {
              return connection(super.getConnection(user, password));
            }
          };
        }
      };
    }
  }
}
