package br.com.planner.pos

import org.json.JSONObject
import org.json.JSONArray
import java.util.UUID
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

data class SessaoServidor(val token: String, val nome: String, val loja: String, val identidade: String, val permissoes: Set<String>, val expiraEm: Long)
data class ParcelaServidor(val id: String, val tipo: String, val valor: Long, val destino: String, val estado: String)
data class SplitServidor(val id: String, val vendaId: String, val bruto: Long, val tributo: Long, val taxa: Long, val liquido: Long, val estado: String, val regra: String, val parcelas: List<ParcelaServidor>, val eventos: List<String>)
data class VendaServidor(val id: String, val bruto: Long, val meio: String, val pagamento: String, val data: String, val split: SplitServidor?, val motivo: String? = null)
data class PaginaVendasServidor(val itens: List<VendaServidor>, val pagina: Int, val total: Int)

/** Contrato Spring v1. Nenhum cálculo tributário ou confirmação é fabricado no POS. */
object ContratoBackendPos {
    private fun texto(o: JSONObject, k: String): String = (o.get(k) as? String)?.takeIf { it.isNotBlank() } ?: error("Texto inválido")
    private fun id(o: JSONObject, k: String): String = texto(o,k).also { UUID.fromString(it) }
    private fun numero(o: JSONObject, k: String): Long = o.get(k).let { require(it is Number); it.toString().toLong() }.also { require(it in 0..9007199254740991L) }
    private fun estado(o: JSONObject, k: String, permitidos: Set<String>): String = texto(o,k).also { require(it in permitidos) }
    private fun lista(a: JSONArray): List<JSONObject> = (0 until a.length()).map { a.getJSONObject(it) }
    private fun modo(o: JSONObject) { require(texto(o,"mode") == "SIMULADO" && texto(o,"currency") == "BRL") }
    fun sessao(json: String): SessaoServidor {
        val o=JSONObject(json); require(o.getString("tokenType")=="Bearer")
        val token=texto(o,"accessToken"); require(Regex("[A-Za-z0-9_-]{43}").matches(token))
        val data=texto(o,"expiresAt"); require(Regex("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,9})?Z").matches(data))
        val formato=SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.ROOT).apply { timeZone=TimeZone.getTimeZone("UTC"); isLenient=false }
        val expira=formato.parse(data.replace(Regex("\\.[0-9]+Z$"),"Z"))!!.time
        require(expira > System.currentTimeMillis())
        val user=o.getJSONObject("user"); val loja=o.getJSONObject("merchant"); val permissoes=o.getJSONArray("permissions")
        return SessaoServidor(token,texto(user,"name"),texto(loja,"name"),id(loja,"id")+":"+id(user,"id"),(0 until permissoes.length()).map { permissoes.getString(it) }.toSet(),expira)
    }
    fun split(o: JSONObject): SplitServidor {
        modo(o); require(texto(o,"paymentStatus")=="CONFIRMED")
        val bruto=numero(o,"grossCents"); val tributo=numero(o,"taxCents"); val taxa=numero(o,"feeCents"); val liquido=numero(o,"netCents")
        require(bruto>0 && bruto==Math.addExact(Math.addExact(tributo,taxa),liquido))
        val parcelas=lista(o.getJSONArray("parcels")).map { p -> ParcelaServidor(id(p,"id"),estado(p,"kind",setOf("TAX","FEE","NET")),numero(p,"amountCents"),texto(p,"destination"),estado(p,"status",setOf("PENDENTE","ENVIADA","CONFIRMADA","FALHA"))) }
        require(parcelas.size==3 && parcelas.map { it.id }.distinct().size==3 && parcelas.map { it.tipo }.toSet()==setOf("TAX","FEE","NET"))
        require(parcelas.first { it.tipo=="TAX" }.valor==tributo && parcelas.first { it.tipo=="FEE" }.valor==taxa && parcelas.first { it.tipo=="NET" }.valor==liquido)
        val estado=estado(o,"status",setOf("CRIADA","SEPARADA","ROTEADA","CONCLUIDA","FALHA"))
        if(estado=="CONCLUIDA") require(parcelas.all { it.estado=="CONFIRMADA" })
        val eventos=lista(o.getJSONArray("events")).map { texto(it,"occurredAt")+" · "+texto(it,"description") }
        return SplitServidor(id(o,"id"),id(o,"saleId"),bruto,tributo,taxa,liquido,estado,texto(o.getJSONObject("rule"),"version"),parcelas,eventos)
    }
    fun venda(json: String): VendaServidor = venda(JSONObject(json))
    private fun venda(o: JSONObject): VendaServidor {
        modo(o); val id=id(o,"id"); val bruto=numero(o,"amountCents"); require(bruto in 1..100000000)
        val pagamento=estado(o.getJSONObject("payment"),"status",setOf("CONFIRMED","PENDING","DECLINED"))
        require(o.has("operation")); val split=if(o.isNull("operation")) null else split(o.getJSONObject("operation"))
        if(split!=null) require(pagamento=="CONFIRMED" && split.vendaId==id && split.bruto==bruto && o.getJSONObject("operation").getString("paymentMethod")==o.getString("paymentMethod"))
        return VendaServidor(id,bruto,estado(o,"paymentMethod",setOf("PIX","DEBIT","CREDIT")),pagamento,texto(o,"createdAt"),split,if(o.isNull("failureCode")) null else texto(o,"failureCode"))
    }
    fun pagina(json: String, esperada: Int): PaginaVendasServidor {
        val o=JSONObject(json); val pagina=numero(o,"page"); val total=numero(o,"total"); val tamanho=numero(o,"size")
        val itens=lista(o.getJSONArray("items")).map { venda(it) }
        require(pagina==esperada.toLong() && tamanho==20L && total<=Int.MAX_VALUE && itens.size<=20 && itens.size<=total && itens.map { it.id }.distinct().size==itens.size)
        return PaginaVendasServidor(itens,esperada,total.toInt())
    }
    fun entrada(bruto: Long, meio: String): String {
        require(bruto in 1..100000000 && meio in setOf("PIX","DEBIT","CREDIT"))
        return JSONObject().put("amountCents",bruto).put("currency","BRL").put("paymentMethod",meio).put("taxCategory","GENERAL").toString()
    }
}
