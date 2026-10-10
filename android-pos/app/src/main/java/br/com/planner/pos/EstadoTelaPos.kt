package br.com.planner.pos

/** Estado de apresentação separado da Activity e dos registros do serviço. */
class EstadoTelaPos {
    var tela = "entrada"
    var selecionada = ""
    var valor = "150,00"
    var meio = "PIX"
    var cenario = CenarioVenda.SUCESSO
    var tentativa: TentativaVenda? = null
    var desconhecida = false
    var ocupado = false
    var perfil = "operador"
    var expiraEm = 0L
    var busca = ""
    var filtroEstado = "Todos"
    var pagina = 0
    var mensagem = ""
    var historico: PaginaPos? = null
    var detalhe: OperacaoVenda? = null
}
