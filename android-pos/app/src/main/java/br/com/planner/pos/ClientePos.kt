package br.com.planner.pos

import android.os.Handler
import android.os.Looper

fun interface CancelamentoPos { fun cancelar() }
interface ClientePos {
    fun registrar(tentativa: TentativaVenda, concluir: (Result<OperacaoVenda>) -> Unit): CancelamentoPos
    fun retomar(id: String, chave: String, concluir: (Result<OperacaoVenda>) -> Unit): CancelamentoPos
    fun consultar(id: String, concluir: (Result<OperacaoVenda>) -> Unit): CancelamentoPos
    fun listar(busca: String, pagina: Int, estado: EstadoSplit?, concluir: (Result<PaginaPos>) -> Unit): CancelamentoPos
    fun encerrar()
}
/** Serviço de demonstração assíncrono, substituível sem mudar os formulários. */
class ClientePosDemonstrativo(private val repositorio: RepositorioDemonstrativo) : ClientePos {
    private val principal = Handler(Looper.getMainLooper())
    private var encerrado = false
    var indisponivel = false
    private fun <T> executar(acao: () -> T, concluir: (Result<T>) -> Unit): CancelamentoPos {
        val tarefa = Runnable {
            if (!encerrado) concluir(runCatching {
                if (indisponivel) throw FalhaApiPos(0, "Serviço demonstrativo indisponível. Restaure a conexão e consulte a mesma tentativa.")
                acao()
            })
        }
        principal.postDelayed(tarefa, 450)
        return CancelamentoPos { principal.removeCallbacks(tarefa) }
    }
    override fun registrar(tentativa: TentativaVenda, concluir: (Result<OperacaoVenda>) -> Unit) = executar({ repositorio.registrar(tentativa) }, concluir)
    override fun retomar(id: String, chave: String, concluir: (Result<OperacaoVenda>) -> Unit) = executar({ repositorio.retomar(id); repositorio.operacoes.first { it.id == id } }, concluir)
    override fun consultar(id: String, concluir: (Result<OperacaoVenda>) -> Unit) = executar({ repositorio.operacoes.firstOrNull { it.id == id } ?: throw FalhaApiPos(404,"Operação não encontrada.") }, concluir)
    override fun listar(busca: String, pagina: Int, estado: EstadoSplit?, concluir: (Result<PaginaPos>) -> Unit) = executar({
        val lista = repositorio.operacoes.filter { it.id.contains(busca,true) && (estado == null || it.estado == estado) }
        PaginaPos(lista.drop((pagina-1)*8).take(8),pagina,lista.size)
    }, concluir)
    override fun encerrar() { encerrado = true; principal.removeCallbacksAndMessages(null) }
}
class ClientePosApi(private val servico: ServicoPosIntegrado) : ClientePos {
    override fun registrar(tentativa: TentativaVenda, concluir: (Result<OperacaoVenda>) -> Unit): CancelamentoPos {
        val futura = servico.registrar(tentativa, concluir); return CancelamentoPos { futura.cancel(true) }
    }
    override fun retomar(id: String, chave: String, concluir: (Result<OperacaoVenda>) -> Unit): CancelamentoPos {
        val futura = servico.retomar(id, chave, concluir); return CancelamentoPos { futura.cancel(true) }
    }
    override fun consultar(id: String, concluir: (Result<OperacaoVenda>) -> Unit): CancelamentoPos {
        val futura = servico.consultar(id, concluir); return CancelamentoPos { futura.cancel(true) }
    }
    override fun listar(busca: String, pagina: Int, estado: EstadoSplit?, concluir: (Result<PaginaPos>) -> Unit): CancelamentoPos {
        val futura = servico.listar(busca, pagina, estado, concluir); return CancelamentoPos { futura.cancel(true) }
    }
    override fun encerrar() = servico.encerrar()
}
