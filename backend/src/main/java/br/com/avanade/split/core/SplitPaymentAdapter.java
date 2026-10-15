package br.com.avanade.split.core;
/** Roteamento por parcela; implementação atual não transfere dinheiro. */
public interface SplitPaymentAdapter {
 boolean route(String kind, boolean retry);
}
