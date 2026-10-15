package br.com.planner.pos

import java.net.HttpURLConnection
import java.net.URL
import java.net.SocketTimeoutException
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.Executors
import java.util.concurrent.Future
import android.os.Handler
import android.os.Looper

/** Transporte HTTPS para integração futura; o cenário local não o instancia. */
class TransporteApiPos(private val endereco: String, private val token: () -> String? = { null }) {
    private val encerrado = AtomicBoolean(false)
    private val executor = Executors.newSingleThreadExecutor()
    private val interfacePrincipal = Handler(Looper.getMainLooper())
    private val base = URL(endereco)
    init { require(base.protocol == "https" && base.userInfo == null && base.query == null && base.ref == null) { "Use uma API HTTPS sem credenciais no endereço." } }
    fun solicitar(caminho: String, metodo: String = "GET", corpo: String? = null, chave: String? = null, concluir: (Result<String>) -> Unit): Future<*> {
        require(caminho.startsWith("/") && !caminho.startsWith("//") && !caminho.contains("\\"))
        require(metodo in listOf("GET","POST"))
        check(!encerrado.get()) { "Transporte encerrado." }
        return executor.submit {
            val resultado = runCatching {
                val conexao = URL(endereco.trimEnd('/') + caminho).openConnection() as HttpURLConnection
                try {
                    conexao.requestMethod = metodo; conexao.connectTimeout = 15000; conexao.readTimeout = 15000
                    conexao.instanceFollowRedirects = false
                    conexao.setRequestProperty("Accept","application/json")
                    token()?.let { require(Regex("[A-Za-z0-9_-]{43}").matches(it)); conexao.setRequestProperty("Authorization", "Bearer $it") }
                    if(chave != null) conexao.setRequestProperty("Idempotency-Key",chave)
                    if(corpo != null) {conexao.doOutput = true;conexao.setRequestProperty("Content-Type","application/json");conexao.outputStream.use {it.write(corpo.toByteArray(Charsets.UTF_8))}}
                    when(conexao.responseCode) {
                        204 -> ""
                        in 200..299 -> conexao.inputStream.bufferedReader(Charsets.UTF_8).use {
                            val buffer = CharArray(8192); val out = StringBuilder()
                            while (true) { val n = it.read(buffer); if (n < 0) break; require(out.length + n <= 2000000); out.append(buffer,0,n) }
                            out.toString()
                        }
                        401 -> throw FalhaApiPos(401,"Sessão expirada. Entre novamente.")
                        403 -> throw FalhaApiPos(403,"Seu perfil não tem acesso a esta operação.")
                        404 -> throw FalhaApiPos(404,"Operação não encontrada.")
                        409 -> throw FalhaApiPos(409,"Consulte a tentativa existente antes de repetir.")
                        422 -> throw FalhaApiPos(422,"Revise os campos informados.")
                        429 -> throw FalhaApiPos(429,"Aguarde antes de tentar novamente.")
                        else -> throw FalhaApiPos(conexao.responseCode,"Não foi possível confirmar a resposta. Não repita uma venda com outra chave.")
                    }
                } finally {conexao.disconnect()}
            }
            val seguro = resultado.fold(
                onSuccess = { Result.success(it) },
                onFailure = { erro -> Result.failure<String>(when (erro) {
                    is FalhaApiPos -> erro
                    is SocketTimeoutException -> FalhaApiPos(0, "Tempo esgotado. Consulte a mesma tentativa antes de reenviar.")
                    else -> FalhaApiPos(0, "Não foi possível alcançar o serviço. Uma venda pode ter sido registrada; mantenha a mesma chave.")
                }) }
            )
            if(!Thread.currentThread().isInterrupted && !encerrado.get()) interfacePrincipal.post { if(!encerrado.get()) concluir(seguro) }
        }
    }
    fun encerrar() {encerrado.set(true); interfacePrincipal.removeCallbacksAndMessages(null); executor.shutdownNow()}
}

class FalhaApiPos(val codigo: Int, mensagem: String) : Exception(mensagem)
