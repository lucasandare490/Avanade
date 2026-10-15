package br.com.avanade.split.finance;

import java.math.BigDecimal;
import java.util.Set;
import java.util.HashSet;
import java.util.regex.Pattern;

/** Conservative guard for the demonstrative cash explanation; never authorizes financial actions. */
public final class ValidacaoExplicacaoFinanceira {
 private ValidacaoExplicacaoFinanceira() {}
 public static String validar(String texto, long... valoresPermitidos) {
  if(texto==null || texto.isBlank() || texto.length()>4000)
   throw new IllegalArgumentException("Invalid explanation length");
  if(Pattern.compile("(?i)<[^>]*>|https?://|javascript:|```|\\\\u0000").matcher(texto).find() || texto.contains("%"))
   throw new IllegalArgumentException("Unsupported explanation content");
  Set<Long> valores=new HashSet<>();for(long valor:valoresPermitidos)valores.add(valor);
  var montantes=Pattern.compile("R\\$\\s*(-?[0-9]+(?:\\.[0-9]{3})*,[0-9]{2})").matcher(texto);
  while(montantes.find()) {
   long centavos=new BigDecimal(montantes.group(1).replace(".","").replace(',', '.')).movePointRight(2).longValueExact();
   if(!valores.contains(centavos))throw new IllegalArgumentException("Explanation contradicts facts");
  }
  return texto;
 }
}
