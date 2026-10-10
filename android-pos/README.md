# Planner Comercial — POS Android demonstrativo

Revisão de 10/10/2026. Cliente Kotlin nativo, compilado em APK debug. Testes unitários e de Activity com Robolectric executados; consulte ../frontend/documentacao/RELATORIO-VALIDACAO-ATUAL.md. Ainda não instalado/homologado em aparelho físico ou maquineta.

## Compilar e validar

AGP 8.7.3, Kotlin 2.2.21 e Gradle wrapper 8.9. compileSdk/targetSdk 35, minSdk 24. Use Android SDK 35 e JDK compatível (nesta execução, Temurin 21.0.4). Configure JAVA_HOME e sdk.dir no seu local.properties; não copie o caminho privado de outra máquina. Android Studio também pode configurar o SDK.

```powershell
.\gradlew.bat assembleDebug testDebugUnitTest lintDebug
```

APK: app/build/outputs/apk/debug/app-debug.apk. É uma compilação de demonstração assinada para debug, não um lançamento de loja. O wrapper está incluído. Na máquina de desenvolvimento, o SDK e o cache ficam em ../ferramentas; essas ferramentas não são necessárias no pacote de fontes, mas cada desenvolvedor precisa instalar seu ambiente.

## Fluxo e comportamento

Login demonstrativo: gestor@exemplo.invalid, financeiro@exemplo.invalid ou operador@exemplo.invalid, senha demo. A sessão expira após 30 minutos. A política demonstrativa bloqueia venda para financeiro e restringe retomada ao gestor; não substitui autorização do servidor.

Nova venda → valor em centavos → pagamento fictício → revisão → envio assíncrono → confirmação/detalhe. Inclui pagamento pendente, recusa, falha parcial, indisponibilidade e resposta perdida. Histórico oferece busca, estado, páginas de oito registros e detalhe pelo ID. A chave da tentativa é mantida na recuperação, sem criar nova intenção de venda.

O estado salvo da Activity preserva dados fictícios, tentativa e chaves de retomada durante recriação. Uma tentativa incerta não é enviada automaticamente ao reabrir. Não há persistência financeira definitiva; matar o processo sem restauração de estado exige recuperação pelo futuro servidor.

## Arquivos e responsabilidades

Todos os arquivos Kotlin ficam em app/src/main/java/br/com/planner/pos.

| Arquivo | Finalidade |
|---|---|
| TelaPrincipalActivity.kt | Construção das telas, navegação, foco e ciclo de vida |
| EstadoTelaPos.kt | Estado visual separado da comunicação |
| ClientePos.kt | Interface assíncrona usada pelas telas |
| ClientePosDemonstrativo.kt | Execução local com latência/indisponibilidade simuladas |
| ClientePosApi.kt | Adaptação do serviço integrado para a interface das telas |
| RepositorioDemonstrativo.kt | Massa local, idempotência fictícia, parcelas e eventos |
| ModelosVenda.kt | Valores, tentativa e estados de venda/split |
| ServicoPosIntegrado.kt | Requisições e validação de respostas por contrato injetado |
| TransporteApiPos.kt | HTTPS em executor, cancelamento e prazo; sem rede na thread da interface |
| app/src/test | Casos de repositório e testes Robolectric de Activity |

A Activity instancia ClientePosDemonstrativo. Para ativar API, fornecer autenticação, URL, builders e parsers aprovados e compor ClientePosApi. Não há endpoints inventados ou autenticação real escondida. HTTPS obrigatório; localhost no Android é o próprio Android, portanto configure endereço alcançável e certificado adequado. Não foi criada exceção de tráfego HTTP.

## Acessibilidade e distribuição

Controles nativos, rótulos, mensagens anunciadas, títulos, área de toque mínima e bloqueio de ações ocupadas estão implementados. A Activity usa ajuste de tamanho ao abrir teclado e respeita insets. TalkBack, teclado real, rotação física e maquineta precisam ser conferidos no alvo escolhido. Impressão física, SDK do fabricante, publicação na loja e pagamentos reais não fazem parte desta demonstração.

Design/protótipo e pesquisa: Thayná Batista da Silva. Requisitos: Thayná e Kleysson, conforme fontes fornecidas. Guia completo para o servidor: ../entrega-para-backend/.
