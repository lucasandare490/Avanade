package br.com.avanade.split.core;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MockAdapters implements PaymentAdapter, SplitPaymentAdapter {
  private final String payment;
  private final String failParcel;

  public MockAdapters(
      @Value("${app.mock-payment:CONFIRMED}") String payment,
      @Value("${app.mock-fail-parcel:NONE}") String failParcel) {
    if (!java.util.Set.of("CONFIRMED", "PENDING", "DECLINED").contains(payment)
        || !java.util.Set.of("NONE", "TAX", "FEE", "NET").contains(failParcel))
      throw new IllegalArgumentException("Invalid mock configuration");
    this.payment = payment;
    this.failParcel = failParcel;
  }

  public String confirmPayment() {
    return payment;
  }

  public boolean route(String kind, boolean retry) {
    return retry || !kind.equals(failParcel);
  }
}
