package br.com.avanade.split.finance;

import jakarta.annotation.PreDestroy;
import java.util.concurrent.*;
import org.springframework.stereotype.Component;

/** Limits concurrent provider calls and their waiting time without holding a database transaction. */
@Component
public class ConsultaExplicacaoLimitada {
  private final ExecutorService executor = new ThreadPoolExecutor(
      2, 2, 0L, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(8),
      runnable -> { var thread = new Thread(runnable, "explanation-provider"); thread.setDaemon(true); return thread; },
      new ThreadPoolExecutor.AbortPolicy());

  public String consultar(Callable<String> consulta, long timeoutMillis) {
    Future<String> future = executor.submit(consulta);
    try {
      return future.get(timeoutMillis, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Explanation interrupted", e);
    } catch (ExecutionException | TimeoutException e) {
      throw new IllegalStateException("Explanation unavailable", e);
    } finally {
      if (!future.isDone()) future.cancel(true);
    }
  }

  @PreDestroy public void encerrar() { executor.shutdownNow(); }
}
