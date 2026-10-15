package br.com.planner.pos

import android.app.Activity
import android.app.AlertDialog
import android.os.Bundle
import android.graphics.Color
import android.text.InputType
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.*
import java.util.UUID

/** Interface nativa demonstrativa; validação em dispositivo ainda pendente. */
class TelaPrincipalActivity : Activity() {
    private val repositorio = RepositorioDemonstrativo()
    private lateinit var coluna: LinearLayout
    private val estadoTela = EstadoTelaPos()
    private val cliente: ClientePos by lazy { ClientePosDemonstrativo(repositorio) }
    private var requisicao: CancelamentoPos? = null
    private var geracao = 0
    private val chavesRetomada = mutableMapOf<String, String>()
    private var tela by estadoTela::tela
    private var selecionada by estadoTela::selecionada
    private var valor by estadoTela::valor
    private var meio by estadoTela::meio
    private var cenario by estadoTela::cenario
    private var tentativa by estadoTela::tentativa
    private var desconhecida by estadoTela::desconhecida
    private var ocupado by estadoTela::ocupado
    private var perfil by estadoTela::perfil
    private var expiraEm by estadoTela::expiraEm
    private var busca by estadoTela::busca
    private var filtroEstado by estadoTela::filtroEstado
    private var pagina by estadoTela::pagina
    private var mensagem by estadoTela::mensagem

    override fun onCreate(estado: Bundle?) {
        super.onCreate(estado)
        if (estado != null) runCatching {
            repositorio.restaurar(estado.getString("operacoes") ?: "[]")
            tela = estado.getString("tela") ?: "entrada"
            selecionada = estado.getString("selecionada") ?: ""
            valor = estado.getString("valor") ?: "150,00"
            meio = estado.getString("meio") ?: "PIX"
            cenario = CenarioVenda.valueOf(estado.getString("cenario") ?: "SUCESSO")
            desconhecida = estado.getBoolean("desconhecida")
            perfil = estado.getString("perfil") ?: "operador"
            expiraEm = estado.getLong("expiraEm")
            busca = estado.getString("busca") ?: ""
            filtroEstado = estado.getString("filtroEstado") ?: "Todos"
            pagina = estado.getInt("pagina")
            estado.getBundle("retomadas")?.let { b -> b.keySet().forEach { id -> b.getString(id)?.let { chave -> chavesRetomada[id]=chave } } }
            estado.getString("chave")?.let { tentativa = TentativaVenda(it, estado.getLong("bruto"), meio, cenario) }
        }.onFailure { tela = "entrada"; tentativa = null; repositorio.operacoes.clear() }
        if (estado == null) {
            repositorio.registrar(TentativaVenda("DEMO0184",48750,"PIX",CenarioVenda.SUCESSO))
            repositorio.registrar(TentativaVenda("DEMO0183",15000,"Débito",CenarioVenda.SUCESSO))
        }
        if(tela=="historico") carregarHistorico() else if(tela=="detalhe") carregarDetalhe() else desenhar()
    }
    override fun onSaveInstanceState(estado: Bundle) {
        estado.putBundle("retomadas",Bundle().apply { chavesRetomada.forEach { (id,chave) -> putString(id,chave) } })
        estado.putString("operacoes",repositorio.serializar()); estado.putString("tela",tela)
        estado.putString("selecionada",selecionada); estado.putString("valor",valor)
        estado.putString("meio",meio); estado.putString("cenario",cenario.name)
        estado.putBoolean("desconhecida",desconhecida || (ocupado && tentativa != null))
        estado.putString("perfil",perfil);estado.putLong("expiraEm",expiraEm)
        estado.putString("busca",busca);estado.putString("filtroEstado",filtroEstado);estado.putInt("pagina",pagina)
        tentativa?.let { estado.putString("chave",it.chave); estado.putLong("bruto",it.bruto) }
        super.onSaveInstanceState(estado)
    }
    private fun <T> executar(iniciar: ((Result<T>) -> Unit) -> CancelamentoPos, concluir: (Result<T>) -> Unit) {
        if (ocupado) return
        ocupado = true; mensagem = ""; val versao = ++geracao; desenhar()
        requisicao = iniciar { resultado ->
            if (versao != geracao || isFinishing || isDestroyed) return@iniciar
            ocupado = false
            if (expiraEm > 0 && System.currentTimeMillis() >= expiraEm) { expirar(); return@iniciar }
            concluir(resultado)
        }
    }
    override fun onDestroy() { geracao++; requisicao?.cancelar(); cliente.encerrar(); super.onDestroy() }
    private fun dp(valor: Int) = (valor * resources.displayMetrics.density).toInt()
    private fun texto(conteudo: String, tamanho: Float = 17f): TextView = TextView(this).also {
        it.text = conteudo; it.textSize = tamanho; it.setTextColor(Color.rgb(24,48,73)); it.setPadding(0,dp(12),0,dp(12)); if (android.os.Build.VERSION.SDK_INT >= 28) it.isAccessibilityHeading = tamanho >= 20f
        coluna.addView(it)
    }
    private fun botao(rotulo: String, acao: () -> Unit) = Button(this).also {
        it.text = rotulo; it.isEnabled = !ocupado; it.isAllCaps = false; it.minHeight = dp(56)
        coluna.addView(it,LinearLayout.LayoutParams(-1,-2))
        it.setOnClickListener {
            if (expiraEm > 0 && System.currentTimeMillis() >= expiraEm) { expirar(); return@setOnClickListener }
            if (!ocupado) acao()
        }
    }
    private fun navegar(destino: String) {
        if (destino !in listOf("entrada","login","expirada") && expiraEm > 0 && System.currentTimeMillis() >= expiraEm) { expirar(); return }
        tela = destino
        if(destino == "historico") carregarHistorico()
        else if(destino == "detalhe" && estadoTela.detalhe?.id != selecionada) carregarDetalhe()
        else desenhar()
    }
    private fun expirar() { geracao++; requisicao?.cancelar(); ocupado = false; mensagem = ""; tela = "expirada"; repositorio.operacoes.clear(); estadoTela.historico=null; estadoTela.detalhe=null; tentativa = null; desconhecida = false; expiraEm = 0; desenhar() }
    override fun onResume() { super.onResume(); if(expiraEm>0 && System.currentTimeMillis()>=expiraEm) expirar() }
    private fun desenhar() {
        coluna = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(24),dp(24),dp(24),dp(32)); setBackgroundColor(Color.rgb(242,245,250)) }
        setContentView(ScrollView(this).apply { fitsSystemWindows = true; isFillViewport = true; addView(coluna) })
        texto("Planner Comercial",26f)
        texto("SIMULADO · sem transferência real · referência 09/10/2026",14f)
        if (ocupado) { coluna.addView(ProgressBar(this)); texto("Consultando serviço…").accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE }
        if (mensagem.isNotBlank()) texto(mensagem).accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
        when (tela) {
            "entrada" -> {
                texto("Cada valor, mais claro.",24f)
                texto("Explore o POS com dados fictícios. Este aplicativo não autentica contas nem acessa uma maquineta.")
                botao("Explorar demonstração") { perfil="gestor"; expiraEm=System.currentTimeMillis()+1800000; navegar("inicio") }
                botao("Entrar com perfil demonstrativo") { navegar("login") }
                botao("Conectar ao servidor HTTPS") { startActivity(android.content.Intent(this, TelaPosIntegradoActivity::class.java)) }
            }
            "login" -> login()
            "expirada" -> {texto("Sessão expirada",24f);texto("A sessão local foi limpa. Entre novamente para continuar a demonstração.");botao("Voltar à entrada") {navegar("entrada")} }
            "negado" -> {texto("Acesso não permitido",24f);texto("O perfil escolhido não pode executar esta ação. A autorização real pertence ao servidor.");botao("Voltar ao início") {navegar("inicio")} }
            "inicio" -> {
                texto("Mercadinho São João",22f)
                texto("Perfil demonstrativo: $perfil",16f)
                botao(if (tentativa != null) "Retomar tentativa de venda" else "Nova venda") { if(perfil=="financeiro") navegar("negado") else navegar(if(tentativa == null) "venda" else "revisao") }
                botao("Histórico de operações") { navegar("historico") }
                botao("Alternar indisponibilidade do serviço demo") { (cliente as? ClientePosDemonstrativo)?.let { it.indisponivel = !it.indisponivel; mensagem = if(it.indisponivel) "Serviço demo indisponível." else "Serviço demo disponível." }; desenhar() }
                botao("Demonstrar sessão expirada") { expirar() }
                botao("Sair e limpar demonstração") { AlertDialog.Builder(this).setTitle("Encerrar demonstração?").setMessage("O histórico fictício e a tentativa atual serão removidos deste cenário local.").setNegativeButton("Continuar",null).setPositiveButton("Sair") { _,_ -> repositorio.operacoes.clear(); estadoTela.historico=null; estadoTela.detalhe=null; tentativa = null; desconhecida = false; expiraEm = 0; perfil = "operador"; busca = ""; filtroEstado = "Todos"; pagina = 0; navegar("entrada") }.show() }
            }
            "venda" -> venda()
            "revisao" -> revisar()
            "historico" -> historico()
            "detalhe" -> detalhe()
            else -> navegar("inicio")
        }
    }
    private fun venda() {
        texto("Nova venda",24f)
        val rotulo = texto("Valor da venda em reais")
        val campo = EditText(this).apply { id = View.generateViewId(); inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL; setText(valor); textSize = 22f; minHeight = dp(56); setSingleLine(true) }
        rotulo.labelFor = campo.id; coluna.addView(campo)
        campo.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) { valor = s.toString() }
            override fun afterTextChanged(s: Editable?) {}
        })
        botao("Pagamento: $meio") { AlertDialog.Builder(this).setTitle("Pagamento simulado").setItems(arrayOf("PIX","Débito","Crédito")) { _,i -> meio = arrayOf("PIX","Débito","Crédito")[i]; desenhar() }.show() }
        botao("Cenário: ${cenario.name}") { AlertDialog.Builder(this).setTitle("Cenário de demonstração").setItems(arrayOf("Sucesso","Falha parcial","Recusa","Resposta perdida","Pagamento aguardando")) { _,i -> cenario = CenarioVenda.values()[i]; desenhar() }.show() }
        texto("Regra fictícia: tributo 10%, taxa 2%. Use vírgula decimal, sem separador de milhar.",14f)
        botao("Revisar venda") {
            val bruto = lerCentavos(valor)
            if (bruto == null) { campo.error = "Informe de 0,01 até 1000000,00"; campo.requestFocus() }
            else { tentativa = TentativaVenda(UUID.randomUUID().toString(),bruto,meio,cenario); desconhecida = false; navegar("revisao") }
        }
        botao("Voltar") { navegar("inicio") }
    }
    private fun revisar() {
        val t = tentativa ?: return navegar("venda")
        texto("Confira a venda",24f); texto("${moeda(t.bruto)} · ${t.meio}",24f)
        texto(if(desconhecida) "Confirmação desconhecida. Consulte esta mesma tentativa. Não crie uma segunda venda." else "Confirme para executar somente o cenário demonstrativo.")
        botao(if(desconhecida) "Consultar a mesma tentativa" else "Confirmar venda simulada") {
            executar({ concluir -> cliente.registrar(t, concluir) }) { resultado ->
                resultado.onSuccess { o -> selecionada = o.id; estadoTela.detalhe = o; tentativa = null; desconhecida = false; navegar("detalhe") }
                    .onFailure { e ->
                        desconhecida = e !is IllegalArgumentException
                        mensagem = if (e is IllegalArgumentException) "Pagamento recusado ou entrada inválida. Revise a tentativa." else "Confirmação desconhecida. Consulte a mesma tentativa antes de criar outra venda."
                        desenhar()
                    }
            }
        }
        if (!desconhecida) botao("Voltar e editar") { tentativa = null; navegar("venda") }
        botao("Voltar ao início mantendo a tentativa") { navegar("inicio") }
    }
    private fun detalhe() {
        val o = estadoTela.detalhe?.takeIf { it.id == selecionada }
        if (o == null) { texto(if(ocupado) "Aguardando detalhe" else "Detalhe indisponível"); botao("Tentar consultar novamente") { carregarDetalhe() }; botao("Voltar ao histórico") { navegar("historico") }; return }
        texto(o.id,24f); texto(rotulo(o.estado),20f)
        texto("Bruto: ${moeda(o.tentativa.bruto)}\nTributo: ${moeda(o.tributo)}\nTaxa: ${moeda(o.taxa)}\nLíquido: ${moeda(o.liquido)}")
        texto(if(o.estado == EstadoSplit.PENDENTE) "Pagamento aguardando confirmação. Não é possível concluir o resultado localmente." else "Pagamento simulado confirmado. Comprovante sem valor fiscal; o status acima representa o split.",14f)
        texto("Tributo: ${if(o.estado!=EstadoSplit.PENDENTE) "confirmado no cenário" else "pendente"}\nTaxa e líquido: ${if(o.estado==EstadoSplit.CONCLUIDO) "confirmados no cenário" else "pendentes"}",14f)
        texto("Rastreabilidade",20f); o.eventos.forEach { texto(it) }
        if (o.estado == EstadoSplit.FALHA_PARCIAL && perfil == "gestor") botao("Retomar somente parcelas pendentes") {
            val chave = chavesRetomada.getOrPut(o.id) { UUID.randomUUID().toString() }
            executar({ concluir -> cliente.retomar(o.id, chave, concluir) }) { r ->
                r.onSuccess { atualizada -> estadoTela.detalhe = atualizada; chavesRetomada.remove(o.id); mensagem = "Retomada confirmada no cenário." }.onFailure { mensagem = "Retomada não confirmada. Atualize antes de tentar novamente." }; desenhar()
            }
        }
        botao("Atualizar operação") { carregarDetalhe() }
        botao("Histórico") { navegar("historico") }; botao("Início") { navegar("inicio") }
    }
    private fun login() {
        texto("Entrar no cenário",24f)
        texto("Contas fictícias: gestor, financeiro ou operador @exemplo.invalid. Senha demo. Não use credenciais reais.",14f)
        val email = EditText(this).apply {id=View.generateViewId();inputType=InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS;setSingleLine(true)}
        texto("E-mail fictício").labelFor=email.id;coluna.addView(email)
        val senha = EditText(this).apply {id=View.generateViewId();inputType=InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD;setSingleLine(true)}
        texto("Senha fictícia").labelFor=senha.id;coluna.addView(senha)
        botao("Entrar") {
            val nome=email.text.toString().trim().substringBefore('@')
            if(nome !in listOf("gestor","financeiro","operador") || email.text.toString().trim()!="$nome@exemplo.invalid" || senha.text.toString()!="demo") {senha.error="E-mail ou senha inválidos para a demonstração.";senha.setText("")}
            else {perfil=nome;expiraEm=System.currentTimeMillis()+1800000;senha.setText("");navegar("inicio")}
        }
        botao("Voltar") {navegar("entrada")}
    }
    private fun carregarDetalhe() {
        if(ocupado)return
        estadoTela.detalhe=null
        executar<OperacaoVenda>({ concluir -> cliente.consultar(selecionada, concluir) }) { r ->
            r.onSuccess { estadoTela.detalhe=it }.onFailure { mensagem="Não foi possível consultar a operação." };desenhar()
        }
    }
    private fun carregarHistorico() {
        if(ocupado)return
        estadoTela.historico=null
        val filtro=when(filtroEstado) {"Split concluído"->EstadoSplit.CONCLUIDO;"Falha parcial"->EstadoSplit.FALHA_PARCIAL;"Pendente"->EstadoSplit.PENDENTE;else->null}
        executar<PaginaPos>({ concluir -> cliente.listar(busca,pagina+1,filtro,concluir) }) { r ->
            r.onSuccess {estadoTela.historico=it}.onFailure {mensagem="Não foi possível consultar o histórico."};desenhar()
        }
    }
    private fun historico() {
        texto("Histórico",24f)
        val campo=EditText(this).apply {id=View.generateViewId();setSingleLine(true);setText(busca)}
        texto("Buscar operação por identificação").labelFor=campo.id;coluna.addView(campo)
        botao("Buscar") {busca=campo.text.toString().trim();pagina=0;carregarHistorico()}
        botao("Status: $filtroEstado") {AlertDialog.Builder(this).setTitle("Filtrar status").setItems(arrayOf("Todos","Split concluído","Falha parcial","Pendente")) {_,i -> filtroEstado=arrayOf("Todos","Split concluído","Falha parcial","Pendente")[i];pagina=0;carregarHistorico()}.show()}
        val resposta=estadoTela.historico
        if(resposta != null) {
            val total=maxOf(1,(resposta.total+7)/8)
            texto("${resposta.total} operações · página ${resposta.pagina} de $total",14f)
            if(resposta.operacoes.isEmpty())texto("Nenhuma operação encontrada. Limpe a busca ou registre uma venda demonstrativa.")
            resposta.operacoes.forEach {o -> botao("${o.id} · ${moeda(o.tentativa.bruto)} · ${rotulo(o.estado)}") {selecionada=o.id;estadoTela.detalhe=null;navegar("detalhe")} }
            if(pagina>0)botao("Página anterior") {pagina--;carregarHistorico()}
            if(pagina+1<total)botao("Próxima página") {pagina++;carregarHistorico()}
        } else if(!ocupado) texto("Histórico indisponível. Tente atualizar a consulta.")
        botao("Atualizar histórico") {carregarHistorico()}
        botao("Limpar filtros") {busca="";filtroEstado="Todos";pagina=0;carregarHistorico()}
        botao("Voltar ao início") {navegar("inicio")}
    }
    private fun rotulo(e: EstadoSplit) = when(e) { EstadoSplit.CONCLUIDO -> "Split concluído"; EstadoSplit.FALHA_PARCIAL -> "Falha parcial"; EstadoSplit.PENDENTE -> "Pendente" }
    @Deprecated("Compatibilidade com Activity nativa")
    override fun onBackPressed() {
        if (ocupado) return
        when (tela) {
            "entrada" -> super.onBackPressed()
            "login", "expirada" -> navegar("entrada")
            "detalhe" -> navegar("historico")
            "inicio" -> navegar("entrada")
            else -> navegar("inicio")
        }
    }
}
