package br.com.planner.pos

import java.util.concurrent.Future

/** Tipos internos. O contrato recebido da equipe deve mapear seus DTOs para estes tipos. */
data class SessaoPos(val identificador: String, val nome: String, val loja: String, val permissoes: Set<String>, val expiraEm: Long)
data class PedidoPos(val caminho: String, val metodo: String = "GET", val corpo: String? = null, val chave: String? = null)
data class PaginaPos(val operacoes: List<OperacaoVenda>, val pagina: Int, val total: Int)

interface ContratoApiPos {
    val versao: String
    fun venda(tentativa: TentativaVenda): PedidoPos
    fun detalhe(id: String): PedidoPos
    fun historico(busca: String, pagina: Int, estado: EstadoSplit?): PedidoPos
    fun retomada(id: String, chave: String): PedidoPos
    fun mapearOperacao(json: String): OperacaoVenda
    fun mapearPagina(json: String): PaginaPos
}

/** Adaptador por injeção, sem endpoints ou alíquotas presumidos. Não usado pelo cenário demo. */
class ServicoPosIntegrado(private val transporte: TransporteApiPos, private val contrato: ContratoApiPos) {
    init { require(contrato.versao.isNotBlank()) }

    private fun validar(o: OperacaoVenda): OperacaoVenda {
        require(o.id.isNotBlank() && o.tentativa.chave.isNotBlank())
        require(o.tentativa.bruto > 0 && o.tributo >= 0 && o.taxa >= 0 && o.liquido >= 0)
        val soma = Math.addExact(Math.addExact(o.tributo, o.taxa), o.liquido)
        require(soma == o.tentativa.bruto)
        return o
    }
    private fun <T> executar(pedido: PedidoPos, mapear: (String) -> T, concluir: (Result<T>) -> Unit): Future<*> =
        transporte.solicitar(pedido.caminho, pedido.metodo, pedido.corpo, pedido.chave) { resposta ->
            val resultado = resposta.fold(
                onSuccess = { json -> try { Result.success(mapear(json)) } catch (_: Exception) {
                    Result.failure<T>(FalhaApiPos(502, "A resposta não corresponde ao contrato esperado. Consulte a operação antes de repetir uma venda."))
                } },
                onFailure = { Result.failure<T>(it) }
            )
            concluir(resultado)
        }
    fun registrar(tentativa: TentativaVenda, concluir: (Result<OperacaoVenda>) -> Unit): Future<*> {
        val pedido = contrato.venda(tentativa).copy(chave = tentativa.chave)
        return executar(pedido, { json -> validar(contrato.mapearOperacao(json)).also {
            require(it.tentativa.chave == tentativa.chave && it.tentativa.bruto == tentativa.bruto && it.tentativa.meio == tentativa.meio)
        } }, concluir)
    }
    fun consultar(id: String, concluir: (Result<OperacaoVenda>) -> Unit): Future<*> =
        executar(contrato.detalhe(id), { json -> validar(contrato.mapearOperacao(json)).also { require(it.id == id) } }, concluir)
    fun listar(busca: String, pagina: Int, estado: EstadoSplit?, concluir: (Result<PaginaPos>) -> Unit): Future<*> {
        require(pagina >= 1)
        return executar(contrato.historico(busca, pagina, estado), { json -> contrato.mapearPagina(json).also {
            require(it.pagina == pagina && it.total >= it.operacoes.size)
            require(it.operacoes.map { o -> o.id }.distinct().size == it.operacoes.size)
            it.operacoes.forEach { o -> validar(o) }
        } }, concluir)
    }
    fun retomar(id: String, chave: String, concluir: (Result<OperacaoVenda>) -> Unit): Future<*> =
        executar(contrato.retomada(id, chave).copy(chave = chave), { json -> validar(contrato.mapearOperacao(json)).also { require(it.id == id) } }, concluir)
    fun encerrar() = transporte.encerrar()
}
