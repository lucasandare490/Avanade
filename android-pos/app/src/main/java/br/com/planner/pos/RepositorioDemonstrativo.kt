package br.com.planner.pos

import org.json.JSONArray
import org.json.JSONObject

/** Somente fixtures. Não realiza pagamentos, chamadas de rede ou cálculo fiscal oficial. */
class RepositorioDemonstrativo {
    val operacoes = mutableListOf<OperacaoVenda>()
    fun registrar(t: TentativaVenda): OperacaoVenda {
        operacoes.find { it.tentativa.chave == t.chave }?.let {
            require(it.tentativa == t) { "Tentativa já usada com dados diferentes." }
            return it
        }
        require(t.bruto in 1..100000000) { "Valor inválido." }
        require(t.cenario != CenarioVenda.RECUSA) { "Pagamento recusado. Nenhuma operação criada." }
        val tributo = (t.bruto * 1000 + 5000) / 10000
        val taxa = minOf(t.bruto - tributo, (t.bruto * 200 + 5000) / 10000)
        val estado = when(t.cenario) { CenarioVenda.FALHA -> EstadoSplit.FALHA_PARCIAL; CenarioVenda.AGUARDANDO -> EstadoSplit.PENDENTE; else -> EstadoSplit.CONCLUIDO }
        val o = OperacaoVenda("OP-${t.chave.take(8).uppercase()}", t, tributo, taxa, t.bruto - tributo - taxa, estado, mutableListOf(if (estado == EstadoSplit.PENDENTE) "Pagamento aguardando confirmação no cenário simulado." else "Pagamento confirmado no cenário simulado.", when(estado) { EstadoSplit.CONCLUIDO -> "Split simulado concluído."; EstadoSplit.FALHA_PARCIAL -> "Tributo confirmado. Outras parcelas aguardam retomada."; EstadoSplit.PENDENTE -> "Nenhuma parcela confirmada. Aguardando consulta posterior." }))
        operacoes.add(0, o)
        if (t.cenario == CenarioVenda.RESPOSTA_PERDIDA) error("Resposta perdida. Consulte a mesma tentativa; não crie outra venda.")
        return o
    }
    fun retomar(id: String) {
        val o = operacoes.find { it.id == id } ?: error("Operação não encontrada.")
        if (o.estado == EstadoSplit.CONCLUIDO) return
        require(o.estado == EstadoSplit.FALHA_PARCIAL) { "Aguarde a confirmação." }
        o.estado = EstadoSplit.CONCLUIDO
        o.eventos.add("Retomada: somente parcelas restantes confirmadas no cenário.")
    }
    fun serializar(): String = JSONArray().also { array -> operacoes.forEach { o ->
        array.put(JSONObject().put("id",o.id).put("chave",o.tentativa.chave).put("bruto",o.tentativa.bruto).put("meio",o.tentativa.meio).put("cenario",o.tentativa.cenario.name).put("tributo",o.tributo).put("taxa",o.taxa).put("liquido",o.liquido).put("estado",o.estado.name).put("eventos",JSONArray(o.eventos)))
    } }.toString()
    fun restaurar(texto: String) {
        operacoes.clear()
        val array = JSONArray(texto)
        for (i in 0 until array.length()) {
            val o = array.getJSONObject(i); val eventos = o.getJSONArray("eventos")
            val t = TentativaVenda(o.getString("chave"),o.getLong("bruto"),o.getString("meio"),CenarioVenda.valueOf(o.getString("cenario")))
            operacoes.add(OperacaoVenda(o.getString("id"),t,o.getLong("tributo"),o.getLong("taxa"),o.getLong("liquido"),EstadoSplit.valueOf(o.getString("estado")),MutableList(eventos.length()) { eventos.getString(it) }))
        }
    }
}
