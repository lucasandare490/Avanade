package br.com.avanade.split.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

final class LimitedBody extends HttpServletRequestWrapper {
  private final byte[] body;

  LimitedBody(HttpServletRequest request, byte[] body) {
    super(request);
    this.body = body;
  }

  @Override
  public ServletInputStream getInputStream() {
    var input = new ByteArrayInputStream(body);
    return new ServletInputStream() {
      public int read() {
        return input.read();
      }

      public boolean isFinished() {
        return input.available() == 0;
      }

      public boolean isReady() {
        return true;
      }

      public void setReadListener(ReadListener listener) {
        throw new UnsupportedOperationException("Synchronous requests only");
      }
    };
  }

  @Override
  public BufferedReader getReader() {
    return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
  }
}
