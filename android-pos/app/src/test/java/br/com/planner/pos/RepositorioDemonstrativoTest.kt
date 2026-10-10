package br.com.planner.pos
import org.junit.Assert.*
import org.junit.Test
class RepositorioDemonstrativoTest {
    private fun venda(chave: String = "teste", cenario: CenarioVenda = CenarioVenda.SUCESSO) = TentativaVenda(chave,15000,"PIX",cenario)
    @Test fun composicaoConservaValor() { val o=RepositorioDemonstrativo().registrar(venda());assertEquals(1500L,o.tributo);assertEquals(300L,o.taxa);assertEquals(13200L,o.liquido) }
    @Test fun repeticaoNaoDuplica() { val r=RepositorioDemonstrativo();val t=venda();assertSame(r.registrar(t),r.registrar(t));assertEquals(1,r.operacoes.size) }
    @Test fun chaveDivergenteFalha() { val r=RepositorioDemonstrativo();r.registrar(venda());assertThrows(IllegalArgumentException::class.java) {r.registrar(venda().copy(bruto=20000))} }
    @Test fun respostaPerdidaRecuperaMesmaVenda() {val r=RepositorioDemonstrativo();val t=venda(cenario=CenarioVenda.RESPOSTA_PERDIDA);assertThrows(IllegalStateException::class.java){r.registrar(t)};val o=r.registrar(t);assertEquals(1,r.operacoes.size);assertEquals(EstadoSplit.CONCLUIDO,o.estado)}
    @Test fun recusaNaoRegistra() {val r=RepositorioDemonstrativo();assertThrows(IllegalArgumentException::class.java){r.registrar(venda(cenario=CenarioVenda.RECUSA))};assertTrue(r.operacoes.isEmpty())}
    @Test fun retomadaPreservaParcelas() {val r=RepositorioDemonstrativo();val o=r.registrar(venda(cenario=CenarioVenda.FALHA));val tributo=o.tributo;r.retomar(o.id);r.retomar(o.id);assertEquals(tributo,o.tributo);assertEquals(3,o.eventos.size);assertEquals(EstadoSplit.CONCLUIDO,o.estado)}
    @Test fun pendenteNaoPodeSerConcluidoLocalmente() {val r=RepositorioDemonstrativo();val o=r.registrar(venda(cenario=CenarioVenda.AGUARDANDO));assertThrows(IllegalArgumentException::class.java){r.retomar(o.id)}}
    @Test fun restauracaoPreservaIdempotencia() {val r=RepositorioDemonstrativo();val t=venda();r.registrar(t);val novo=RepositorioDemonstrativo();novo.restaurar(r.serializar());novo.registrar(t);assertEquals(1,novo.operacoes.size)}
    @Test fun entradaMonetaria() {assertEquals(15001L,lerCentavos("150,01"));for (s in listOf("", "0", "-1", "1.500,00", "1,999", "1000001,00"))assertNull(lerCentavos(s))}
}
