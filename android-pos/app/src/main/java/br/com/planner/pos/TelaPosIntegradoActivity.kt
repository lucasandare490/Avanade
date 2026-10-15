package br.com.planner.pos

import android.app.Activity
import android.app.AlertDialog
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.*
import org.json.JSONObject
import java.util.UUID
import java.net.URLEncoder
import java.security.MessageDigest

/** Fluxos do servidor separados da demonstração em memória, com intenção durável por conta. */
class TelaPosIntegradoActivity : Activity() {
    private lateinit var coluna: LinearLayout
    private lateinit var aviso: TextView
    private var transporte: TransporteApiPos? = null
    private var sessao: SessaoServidor? = null
    private var endereco = ""
    private var ocupado = false
    private var escopo = ""
    private val preferencias by lazy { getSharedPreferences("intencoes-servidor", MODE_PRIVATE) }
    override fun onCreate(state: Bundle?) { super.onCreate(state); login() }
    override fun onDestroy() { transporte?.encerrar(); sessao=null; super.onDestroy() }
    private fun dp(valor: Int) = (valor * resources.displayMetrics.density + 0.5f).toInt()
    private fun texto(s: String, titulo: Boolean=false): TextView = TextView(this).also {
        it.text=s; it.textSize=if(titulo) 23f else 17f; it.setPadding(0,dp(16),0,dp(16))
        if(android.os.Build.VERSION.SDK_INT>=28) it.isAccessibilityHeading=titulo
        coluna.addView(it)
    }
    private fun tela(titulo: String) {
        coluna=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; setPadding(dp(24),dp(32),dp(24),dp(32)) }
        setContentView(ScrollView(this).apply { fitsSystemWindows=true; isFillViewport=true; addView(coluna) })
        texto(titulo,true); texto("SIMULADO · registros no servidor · sem recolhimento fiscal real")
        aviso=texto("").apply { accessibilityLiveRegion=View.ACCESSIBILITY_LIVE_REGION_POLITE }
    }
    private fun campo(rotulo: String, tipo: Int=InputType.TYPE_CLASS_TEXT): EditText {
        val label=texto(rotulo)
        return EditText(this).also { it.id=View.generateViewId(); label.labelFor=it.id; it.inputType=tipo; it.setSingleLine(); it.minHeight=dp(56); it.textSize=18f; coluna.addView(it,LinearLayout.LayoutParams(-1,-2)) }
    }
    private fun botao(s: String, acao: () -> Unit) = Button(this).also {
        it.text=s; it.isAllCaps=false; it.minHeight=dp(56); coluna.addView(it,LinearLayout.LayoutParams(-1,-2))
        it.setOnClickListener { if(!ocupado) acao() }
    }
    private fun habilitar(v: View, valor: Boolean) {
        if(v is Button || v is EditText || v is Spinner) v.isEnabled=valor
        if(v is android.view.ViewGroup) for(i in 0 until v.childCount) habilitar(v.getChildAt(i),valor)
    }
    private fun pedir(caminho: String, metodo: String="GET", corpo: String?=null, chave: String?=null, sucesso: (String)->Unit, falha: ((Throwable)->Unit)?=null) {
        if(ocupado) return
        if(sessao!=null && System.currentTimeMillis()>=sessao!!.expiraEm) { sessao=null; login(); aviso.text="Sessão expirada. Entre novamente para recuperar sua tentativa."; return }
        ocupado=true; habilitar(coluna,false); aviso.text="Consultando servidor…"
        transporte!!.solicitar(caminho,metodo,corpo,chave) { resultado ->
            if(isDestroyed || isFinishing) return@solicitar
            ocupado=false; habilitar(coluna,true); aviso.text=""
            resultado.fold(onSuccess={ json ->
                try { sucesso(json) } catch (_: Exception) { aviso.text="Resposta inconsistente. A tentativa foi preservada; consulte antes de reenviar." }
            },onFailure={ erro ->
                if(erro is FalhaApiPos && erro.codigo==401) { sessao=null; login(); aviso.text="Sessão encerrada. Entre novamente. Sua tentativa está preservada." }
                else if(falha!=null) falha(erro)
                else aviso.text=erro.message ?: "Não foi possível consultar o servidor."
            })
        }
    }
    private fun login() {
        tela("Conectar ao servidor")
        val url=campo("Endereço HTTPS da API",InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI)
        url.setText(endereco)
        val email=campo("E-mail",InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        val senha=campo("Senha",InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD)
        senha.isSaveEnabled=false
        botao("Entrar no servidor") {
            endereco=url.text.toString().trim().trimEnd('/')
            try { transporte?.encerrar(); transporte=TransporteApiPos(endereco) { sessao?.token } }
            catch (_: Exception) { aviso.text="Informe endereço HTTPS válido, sem credenciais ou parâmetros."; return@botao }
            val corpo=JSONObject().put("email",email.text.toString().trim()).put("password",senha.text.toString()).toString()
            senha.text.clear()
            pedir("/api/v1/auth/login","POST",corpo,sucesso={
                sessao=ContratoBackendPos.sessao(it)
                escopo=MessageDigest.getInstance("SHA-256").digest((endereco+"|"+sessao!!.identidade).toByteArray()).joinToString("") { b -> "%02x".format(b) }
                inicio()
            })
        }
        botao("Voltar à demonstração local") { finish() }
    }
    private fun chaveAtual() = preferencias.getString("$escopo:SALE:key",null)
    private fun inicio() {
        tela("Planner POS · servidor")
        texto("${sessao!!.nome} · ${sessao!!.loja}")
        if(chaveAtual()!=null) {
            texto("Existe uma venda sem confirmação local. Recupere antes de iniciar outra venda.")
            botao("Recuperar venda") { recuperar() }
        } else if("vender" in sessao!!.permissoes) botao("Nova venda") { formulario() }
        if("consultar" in sessao!!.permissoes) botao("Histórico de vendas") { historico(1,"") }
        botao("Sair da conta") { pedir("/api/v1/auth/logout","POST",sucesso={ sessao=null; login() }) }
    }
    private fun formulario() {
        if(chaveAtual()!=null) { inicio(); return }
        tela("Nova venda")
        val valor=campo("Valor em reais",InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL)
        texto("Meio de pagamento")
        val meio=Spinner(this).also { it.contentDescription="Meio de pagamento"; it.adapter=ArrayAdapter(this,android.R.layout.simple_spinner_dropdown_item,listOf("PIX","Débito","Crédito")); coluna.addView(it) }
        botao("Revisar venda") {
            val bruto=lerCentavos(valor.text.toString())
            if(bruto==null) { valor.error="Informe de 0,01 até 1.000.000,00, com vírgula decimal."; return@botao }
            val codigo=listOf("PIX","DEBIT","CREDIT")[meio.selectedItemPosition]
            AlertDialog.Builder(this).setTitle("Confirmar venda demonstrativa").setMessage("${moeda(bruto)} · ${meio.selectedItem}\nOs valores tributários serão calculados pelo servidor.")
                .setNegativeButton("Revisar",null).setPositiveButton("Confirmar") { _,_ ->
                    val chave=UUID.randomUUID().toString(); val corpo=ContratoBackendPos.entrada(bruto,codigo)
                    if(!preferencias.edit().putString("$escopo:SALE:key",chave).putString("$escopo:SALE:body",corpo).commit()) { aviso.text="Não foi possível preservar a tentativa. Venda não enviada." }
                    else enviarVenda(chave,corpo)
                }.show()
        }
        botao("Voltar") { inicio() }
    }
    private fun confirmar(json: String) {
        val venda=ContratoBackendPos.venda(json)
        val corpo=JSONObject(preferencias.getString("$escopo:SALE:body",null) ?: error("Tentativa ausente"))
        require(venda.bruto==corpo.getLong("amountCents") && venda.meio==corpo.getString("paymentMethod"))
        check(preferencias.edit().remove("$escopo:SALE:key").remove("$escopo:SALE:body").commit())
        detalhe(venda)
    }
    private fun enviarVenda(chave: String, corpo: String) {
        pedir("/api/v1/sales","POST",corpo,chave,sucesso={ confirmar(it) },falha={
            if(it is FalhaApiPos && it.codigo in setOf(400,403,413,422)) {
                val removida=preferencias.edit().remove("$escopo:SALE:key").remove("$escopo:SALE:body").commit()
                inicio(); aviso.text=if(removida) "Venda rejeitada pelo servidor. Revise os dados e as permissões antes de tentar novamente." else "Não foi possível atualizar a tentativa local. Consulte o resultado."
            } else { inicio(); aviso.text=(it.message ?: "Resultado desconhecido.")+" A chave foi mantida para recuperação." }
        })
    }
    private fun recuperar() {
        val chave=chaveAtual() ?: return inicio()
        pedir("/api/v1/requests/SALE/"+URLEncoder.encode(chave,"UTF-8"),sucesso={ confirmar(it) },falha={
            tela("Recuperação da venda")
            if(it is FalhaApiPos && it.codigo==404) {
                texto("O servidor não encontrou resultado para a chave. Você pode reenviar a mesma intenção; não será criada uma chave nova.")
                botao("Reenviar mesma intenção") { enviarVenda(chave,preferencias.getString("$escopo:SALE:body",null) ?: error("Tentativa ausente")) }
            } else texto(it.message ?: "Consulta indisponível. Tente novamente.")
            botao("Voltar") { inicio() }
        })
    }
    private fun historico(pagina: Int, busca: String) {
        pedir("/api/v1/sales?page=$pagina&size=20&search="+URLEncoder.encode(busca,"UTF-8"),sucesso={
            val lista=ContratoBackendPos.pagina(it,pagina)
            tela("Histórico de vendas")
            val campo=campo("Buscar referência"); campo.setText(busca)
            botao("Buscar") { historico(1,campo.text.toString().trim()) }
            texto("Página $pagina · ${lista.total} vendas")
            if(lista.itens.isEmpty()) texto("Nenhuma venda neste filtro.")
            lista.itens.forEach { v -> botao("${moeda(v.bruto)} · ${pagamento(v.pagamento)} · ${v.id}") { consultar(v.id) } }
            if(pagina>1) botao("Página anterior") { historico(pagina-1,busca) }
            if(pagina.toLong()*20<lista.total) botao("Próxima página") { historico(pagina+1,busca) }
            botao("Início") { inicio() }
        })
    }
    private fun consultar(id: String) = pedir("/api/v1/sales/$id",sucesso={ val v=ContratoBackendPos.venda(it); require(v.id==id); detalhe(v) })
    private fun pagamento(s: String) = when(s) { "CONFIRMED"->"Pagamento confirmado"; "DECLINED"->"Pagamento recusado"; else->"Pagamento pendente" }
    private fun detalhe(v: VendaServidor) {
        tela("Detalhe da venda")
        texto("Referência: ${v.id}\n${v.data}\nBruto: ${moeda(v.bruto)}\n${pagamento(v.pagamento)}")
        val split=v.split
        if(split==null) {
            texto("Esta venda não possui operação de split. Não há confirmação de parcelas nem de entrada no caixa.")
            v.motivo?.let { texto("Referência da falha: $it") }
            if(v.pagamento=="CONFIRMED" && v.motivo=="TAX_RULE_UNAVAILABLE" && "retomar" in sessao!!.permissoes) {
                texto("A recuperação usa o pagamento original e exige regra válida na data da venda.")
                botao("Recuperar split da mesma venda") {
                    val nome="$escopo:RECOVER_SPLIT:${v.id}"
                    val chave=preferencias.getString(nome,null) ?: UUID.randomUUID().toString()
                    if(!preferencias.edit().putString(nome,chave).commit()) { aviso.text="Não foi possível preservar a tentativa."; return@botao }
                    pedir("/api/v1/sales/${v.id}/recover-split","POST",chave=chave,sucesso={
                        val resposta=ContratoBackendPos.venda(it); require(resposta.id==v.id)
                        preferencias.edit().remove(nome).commit(); detalhe(resposta)
                    })
                }
            }
        }
        else {
            texto("Split: ${split.estado}\nRegra: ${split.regra}\nTributos: ${moeda(split.tributo)}\nTaxas: ${moeda(split.taxa)}\nLíquido: ${moeda(split.liquido)}")
            split.parcelas.forEach { texto("${it.tipo} · ${moeda(it.valor)} · ${it.estado}\nDestino: ${it.destino}") }
            texto("Rastreabilidade",true); split.eventos.forEach { texto(it) }
            if(split.estado=="FALHA" && "retomar" in sessao!!.permissoes) botao("Retomar parcelas pendentes") {
                val nome="$escopo:REPROCESS:${split.id}"; val chave=preferencias.getString(nome,null) ?: UUID.randomUUID().toString()
                if(!preferencias.edit().putString(nome,chave).commit()) { aviso.text="Não foi possível preservar a tentativa."; return@botao }
                pedir("/api/v1/split-operations/${split.id}/reprocess","POST",chave=chave,sucesso={
                    val resposta=ContratoBackendPos.split(JSONObject(it)); require(resposta.id==split.id && resposta.vendaId==v.id)
                    preferencias.edit().remove(nome).commit(); detalhe(v.copy(split=resposta))
                })
            }
        }
        botao("Atualizar estado") { consultar(v.id) }
        botao("Início") { inicio() }
    }
}

