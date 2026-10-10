package br.com.planner.pos

import java.text.NumberFormat
import java.util.Locale

enum class EstadoSplit { CONCLUIDO, FALHA_PARCIAL, PENDENTE }
enum class CenarioVenda { SUCESSO, FALHA, RECUSA, RESPOSTA_PERDIDA, AGUARDANDO }
data class TentativaVenda(val chave: String, val bruto: Long, val meio: String, val cenario: CenarioVenda)
data class OperacaoVenda(val id: String, val tentativa: TentativaVenda, val tributo: Long, val taxa: Long, val liquido: Long, var estado: EstadoSplit, val eventos: MutableList<String>)
fun moeda(valor: Long): String = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR")).format(valor / 100.0)
fun lerCentavos(texto: String): Long? {
    val limpo = texto.trim()
    if (!Regex("[0-9]{1,7}(,[0-9]{1,2})?").matches(limpo)) return null
    val partes = limpo.split(',')
    val valor = partes[0].toLong() * 100 + (partes.getOrNull(1) ?: "").padEnd(2, '0').toLong()
    return valor.takeIf { it in 1..100000000 }
}
