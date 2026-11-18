package br.com.avanade.split.auth;

import java.net.URI;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Envia o link de redefinição de senha por e-mail quando o SMTP está configurado
 * (variáveis SPRING_MAIL_HOST etc. e PASSWORD_RESET_LINK_BASE). Sem configuração,
 * o pedido continua aceito e nada é enviado. O token e o e-mail nunca vão para log.
 */
@Component
public class EnvioRecuperacaoSenha {
  private static final Logger LOG = LoggerFactory.getLogger(EnvioRecuperacaoSenha.class);
  private final ObjectProvider<JavaMailSender> remetente;
  private final String linkBase;
  private final String de;
  private final ExecutorService fila = Executors.newSingleThreadExecutor(r -> {
    Thread t = new Thread(r, "envio-recuperacao-senha");
    t.setDaemon(true);
    return t;
  });

  public EnvioRecuperacaoSenha(
      ObjectProvider<JavaMailSender> remetente,
      @Value("${app.password-reset-link-base:}") String linkBase,
      @Value("${app.password-reset-from:}") String de) {
    this.remetente = remetente;
    this.linkBase = validarLink(linkBase);
    this.de = de == null ? "" : de.strip();
  }

  static String validarLink(String valor) {
    if (valor == null || valor.isBlank()) return "";
    URI uri = URI.create(valor.strip());
    boolean local = "localhost".equals(uri.getHost()) || "127.0.0.1".equals(uri.getHost());
    if (uri.getHost() == null || uri.getRawQuery() != null || uri.getRawFragment() != null
        || uri.getUserInfo() != null
        || !("https".equals(uri.getScheme()) || ("http".equals(uri.getScheme()) && local)))
      throw new IllegalArgumentException("PASSWORD_RESET_LINK_BASE deve ser uma URL https sem query nem fragmento.");
    return valor.strip().replaceAll("/+$", "");
  }

  public boolean configurado() {
    return !linkBase.isEmpty() && !de.isEmpty() && remetente.getIfAvailable() != null;
  }

  /** Monta o link com o token no fragmento (#), que o navegador não envia ao servidor. */
  String link(String token) {
    return linkBase + "/#/redefinir-senha?token=" + token;
  }

  SimpleMailMessage mensagem(String email, String token, int minutos) {
    var m = new SimpleMailMessage();
    m.setFrom(de);
    m.setTo(email);
    m.setSubject("Planner Comercial: redefinição de senha");
    m.setText(String.join("\n",
        "Recebemos um pedido para redefinir a senha da sua conta no Planner Comercial.",
        "Abra o link abaixo em até " + minutos + " minutos para criar uma nova senha:",
        "",
        link(token),
        "",
        "Se você não fez esse pedido, ignore este e-mail. Sua senha atual continua valendo.",
        "",
        "We received a request to reset your Planner Comercial password. The link above expires in " + minutos + " minutes.",
        "Recibimos una solicitud para restablecer su contraseña de Planner Comercial. El enlace vence en " + minutos + " minutos."));
    return m;
  }

  public void enviar(String email, String token, int minutos) {
    JavaMailSender sender = remetente.getIfAvailable();
    if (linkBase.isEmpty() || de.isEmpty() || sender == null) {
      LOG.info("Recuperação de senha solicitada; envio de e-mail não configurado.");
      return;
    }
    SimpleMailMessage m = mensagem(email, token, minutos);
    fila.submit(() -> {
      try {
        sender.send(m);
      } catch (RuntimeException e) {
        LOG.warn("Falha ao enviar e-mail de recuperação de senha ({}).", e.getClass().getSimpleName());
      }
    });
  }
}
