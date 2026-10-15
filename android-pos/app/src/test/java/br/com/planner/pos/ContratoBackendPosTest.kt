package br.com.planner.pos
import org.junit.Assert.*
import org.junit.Test
import org.json.JSONObject
import org.json.JSONArray
import java.util.UUID

class ContratoBackendPosTest {
    private fun venda() = JSONObject(javaClass.getResource("/venda-servidor.json")!!.readText())
    @Test fun preservaValoresParcelasERegraDoServidor() {
        val v=ContratoBackendPos.venda(venda().toString())
        assertEquals(15000L,v.bruto); assertEquals(13200L,v.split!!.liquido)
        assertEquals(3,v.split.parcelas.size); assertEquals("DEMO-v1",v.split.regra)
    }
    @Test fun naoInventaSplitParaPagamentoPendenteOuRecusado() {
        for(estado in listOf("PENDING","DECLINED","CONFIRMED")) {
            val v=venda().put("operation",JSONObject.NULL).put("payment",JSONObject().put("status",estado))
            assertNull(ContratoBackendPos.venda(v.toString()).split)
        }
    }
    @Test fun rejeitaEstadoDesconhecidoEValorFracionario() {
        val v=venda();v.getJSONObject("payment").put("status","OTHER")
        assertThrows(Exception::class.java) { ContratoBackendPos.venda(v.toString()) }
        assertThrows(Exception::class.java) { ContratoBackendPos.venda(venda().put("amountCents",15000.2).toString()) }
    }
    @Test fun rejeitaSomaEParcelaDuplicada() {
        val v=venda();v.getJSONObject("operation").put("netCents",1)
        assertThrows(Exception::class.java) { ContratoBackendPos.venda(v.toString()) }
        val w=venda();val p=w.getJSONObject("operation").getJSONArray("parcels");p.getJSONObject(1).put("id",p.getJSONObject(0).getString("id"))
        assertThrows(Exception::class.java) { ContratoBackendPos.venda(w.toString()) }
    }
    @Test fun rejeitaSplitDeOutraVendaOuMeioDivergente() {
        val v=venda();v.getJSONObject("operation").put("saleId",UUID.randomUUID().toString())
        assertThrows(Exception::class.java) { ContratoBackendPos.venda(v.toString()) }
        val w=venda();w.getJSONObject("operation").put("paymentMethod","CREDIT")
        assertThrows(Exception::class.java) { ContratoBackendPos.venda(w.toString()) }
    }
    @Test fun paginaValidaERejeitaRepeticao() {
        val p=JSONObject().put("page",1).put("size",20).put("total",1).put("items",JSONArray().put(venda()))
        assertEquals(1,ContratoBackendPos.pagina(p.toString(),1).itens.size)
        assertThrows(Exception::class.java) { ContratoBackendPos.pagina(p.toString(),2) }
        p.put("total",2).getJSONArray("items").put(venda())
        assertThrows(Exception::class.java) { ContratoBackendPos.pagina(p.toString(),1) }
    }
    @Test fun entradaNaoEnviaAliquotaDestinoOuCenario() {
        val entrada=JSONObject(ContratoBackendPos.entrada(15000,"PIX"))
        assertEquals(4,entrada.length());assertFalse(entrada.has("cenario"));assertFalse(entrada.has("netCents"))
        assertThrows(Exception::class.java) { ContratoBackendPos.entrada(0,"PIX") }
    }
    @Test fun sessaoValidaExpiracaoEIdentidade() {
        val p=JSONObject().put("tokenType","Bearer").put("accessToken","a".repeat(43)).put("expiresAt","2099-01-01T00:00:00.123456Z")
            .put("user",JSONObject().put("id",UUID.randomUUID().toString()).put("name","Teste"))
            .put("merchant",JSONObject().put("id",UUID.randomUUID().toString()).put("name","Loja"))
            .put("permissions",JSONArray().put("consultar"))
        assertEquals(setOf("consultar"),ContratoBackendPos.sessao(p.toString()).permissoes)
        p.put("expiresAt","2000-01-01T00:00:00Z")
        assertThrows(Exception::class.java) { ContratoBackendPos.sessao(p.toString()) }
    }
}
