package br.com.planner.pos
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import java.time.Duration
@RunWith(RobolectricTestRunner::class)
@Config(sdk=[28])
class FluxoPosTest {
    private fun todos(v: View): List<View> = listOf(v) + if(v is ViewGroup) (0 until v.childCount).flatMap { todos(v.getChildAt(it)) } else emptyList()
    private fun clicar(a: TelaPrincipalActivity, rotulo: String) { val b=todos(a.window.decorView).filterIsInstance<Button>().first {it.text.toString()==rotulo};assertTrue(b.isEnabled);b.performClick() }
    private fun contem(a: TelaPrincipalActivity, texto: String) = todos(a.window.decorView).filterIsInstance<TextView>().any {it.text.toString().contains(texto)}
    @Test fun vendaAssincronaChegaAoDetalhe() {
        val c=Robolectric.buildActivity(TelaPrincipalActivity::class.java).setup();val a=c.get()
        clicar(a,"Explorar demonstração");clicar(a,"Nova venda");clicar(a,"Revisar venda");clicar(a,"Confirmar venda simulada")
        assertTrue(contem(a,"Consultando serviço"));shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(1));assertTrue(contem(a,"Split concluído"));assertTrue(contem(a,"Rastreabilidade"));c.pause().stop().destroy()
    }
    @Test fun indisponibilidadePreservaTentativa() {
        val c=Robolectric.buildActivity(TelaPrincipalActivity::class.java).setup();val a=c.get()
        clicar(a,"Explorar demonstração");clicar(a,"Alternar indisponibilidade do serviço demo");clicar(a,"Nova venda");clicar(a,"Revisar venda");clicar(a,"Confirmar venda simulada")
        shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(1));assertTrue(contem(a,"Confirmação desconhecida"));assertTrue(contem(a,"Consultar a mesma tentativa"));c.pause().stop().destroy()
    }
    @Test fun expiracaoRetornaParaEntrada() {
        val c=Robolectric.buildActivity(TelaPrincipalActivity::class.java).setup();val a=c.get();clicar(a,"Explorar demonstração");clicar(a,"Demonstrar sessão expirada");assertTrue(contem(a,"Sessão expirada"));clicar(a,"Voltar à entrada");assertTrue(contem(a,"Explorar demonstração"));c.pause().stop().destroy()
    }

    @Test fun recriacaoPreservaTentativaSemReenvioAutomatico() {
        val c=Robolectric.buildActivity(TelaPrincipalActivity::class.java).setup();val a=c.get()
        clicar(a,"Explorar demonstração");clicar(a,"Nova venda");clicar(a,"Revisar venda");clicar(a,"Confirmar venda simulada")
        val estado=android.os.Bundle();c.pause().saveInstanceState(estado).stop().destroy()
        val novo=Robolectric.buildActivity(TelaPrincipalActivity::class.java).create(estado).start().resume().visible();val b=novo.get()
        shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(1));assertTrue(contem(b,"Consultar a mesma tentativa"));assertFalse(contem(b,"Rastreabilidade"))
        clicar(b,"Consultar a mesma tentativa");shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(1));assertTrue(contem(b,"Rastreabilidade"));novo.pause().stop().destroy()
    }

    @Test fun historicoEDetalheConsultamServico() {
        val c=Robolectric.buildActivity(TelaPrincipalActivity::class.java).setup();val a=c.get()
        clicar(a,"Explorar demonstração");clicar(a,"Histórico de operações");assertTrue(contem(a,"Consultando serviço"));shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(1))
        val linha=todos(a.window.decorView).filterIsInstance<Button>().first {it.text.toString().startsWith("OP-DEMO0184")};linha.performClick();shadowOf(Looper.getMainLooper()).idleFor(Duration.ofSeconds(1));assertTrue(contem(a,"Rastreabilidade"));assertTrue(contem(a,"487,50"));c.pause().stop().destroy()
    }
}
