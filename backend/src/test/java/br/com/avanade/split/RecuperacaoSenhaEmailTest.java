package br.com.avanade.split;

import static org.assertj.core.api.Assertions.*;

import br.com.avanade.split.auth.EnvioRecuperacaoSenha;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/** Envio do link de redefinição de senha, sem SMTP real. */
class RecuperacaoSenhaEmailTest {
  static class RemetenteFalso extends JavaMailSenderImpl {
    final List<SimpleMailMessage> enviados = new ArrayList<>();
    @Override public synchronized void send(SimpleMailMessage m) { enviados.add(m); notifyAll(); }
  }

  static ObjectProvider<JavaMailSender> provedor(JavaMailSender s) {
    var f = new StaticListableBeanFactory();
    if (s != null) f.addBean("mail", s);
    return f.getBeanProvider(JavaMailSender.class);
  }

  @Test
  void enviaLinkComTokenNoFragmento() throws Exception {
    var falso = new RemetenteFalso();
    var envio = new EnvioRecuperacaoSenha(provedor(falso), "https://avanade-frontend-xi.vercel.app/", "nao-responda@example.invalid");
    assertThat(envio.configurado()).isTrue();
    envio.enviar("pessoa@example.invalid", "TOKEN-abc_123", 30);
    synchronized (falso) { long fim = System.currentTimeMillis() + 5000; while (falso.enviados.isEmpty() && System.currentTimeMillis() < fim) falso.wait(200); }
    assertThat(falso.enviados).hasSize(1);
    var m = falso.enviados.getFirst();
    assertThat(m.getTo()).containsExactly("pessoa@example.invalid");
    assertThat(m.getText()).contains("https://avanade-frontend-xi.vercel.app/#/redefinir-senha?token=TOKEN-abc_123");
    assertThat(m.getText()).contains("30 minutos");
  }

  @Test
  void semConfiguracaoNaoEnvia() {
    var falso = new RemetenteFalso();
    var envio = new EnvioRecuperacaoSenha(provedor(falso), "", "");
    assertThat(envio.configurado()).isFalse();
    envio.enviar("pessoa@example.invalid", "TOKEN", 30);
    assertThat(falso.enviados).isEmpty();
    assertThat(new EnvioRecuperacaoSenha(provedor(null), "https://exemplo.invalid", "a@example.invalid").configurado()).isFalse();
  }

  @Test
  void recusaLinkInseguro() {
    assertThatThrownBy(() -> new EnvioRecuperacaoSenha(provedor(null), "http://site.example.invalid", "a@example.invalid"))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new EnvioRecuperacaoSenha(provedor(null), "https://site.example.invalid/?x=1", "a@example.invalid"))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new EnvioRecuperacaoSenha(provedor(null), "javascript:alert(1)", "a@example.invalid"))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
